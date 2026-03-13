import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { collectMetrics } from './metrics.js';
import type { FileMetrics, DirectorySummary } from './types.js';

export function analyzeFile(filePath: string): FileMetrics {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const source = fs.readFileSync(resolved, 'utf-8');
  const fileName = path.basename(resolved);
  return collectMetrics(source, fileName);
}

export async function analyzeDirectory(dirPath: string, maxFiles = 50): Promise<DirectorySummary> {
  const resolved = path.resolve(dirPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }

  const patterns = ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.jsx', '**/*.ts', '**/*.tsx'];
  const ignore = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/coverage/**'];

  const files = await fg(patterns, {
    cwd: resolved,
    ignore,
    absolute: true,
    onlyFiles: true,
  });

  const selected = files.slice(0, maxFiles);
  const results: FileMetrics[] = [];

  for (const file of selected) {
    try {
      const source = fs.readFileSync(file, 'utf-8');
      const fileName = path.relative(resolved, file);
      results.push(collectMetrics(source, fileName));
    } catch {
      // skip unparseable files
    }
  }

  return summarizeDirectory(results, resolved);
}

function summarizeDirectory(fileResults: FileMetrics[], dirPath: string): DirectorySummary {
  const totalFiles = fileResults.length;
  if (totalFiles === 0) {
    return {
      totalFiles: 0,
      dirPath,
      largest: null,
      avgLines: 0,
      commonFunctions: [],
      issues: [],
      suspiciousNames: [],
      totalFunctions: 0,
      totalClasses: 0,
      files: [],
      summary: 'No analyzable files found.',
    };
  }

  const sorted = [...fileResults].sort((a, b) => b.lines - a.lines);
  const largest = sorted[0];
  const avgLines = Math.round(sorted.reduce((s, f) => s + f.lines, 0) / totalFiles);

  const funcNameCounts: Record<string, number> = {};
  for (const f of fileResults) {
    for (const fn of f.functions) {
      funcNameCounts[fn.name] = (funcNameCounts[fn.name] || 0) + 1;
    }
  }
  const commonFunctions = Object.entries(funcNameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const allSuspicious = new Set<string>();
  for (const f of fileResults) {
    for (const s of f.suspiciousNames) allSuspicious.add(s);
  }

  const issues: string[] = [];
  const largeFiles = sorted.filter(f => f.lines > 300);
  if (largeFiles.length > 0) {
    issues.push(`${largeFiles.length} large file${largeFiles.length > 1 ? 's' : ''} (>300 lines)`);
  }
  if (allSuspicious.size > 3) {
    issues.push('repeated vague variable naming');
  }

  const totalFunctions = fileResults.reduce((s, f) => s + f.functionCount, 0);
  const totalClasses = fileResults.reduce((s, f) => s + f.classCount, 0);

  return {
    dirPath,
    totalFiles,
    largest: { name: largest.fileName, lines: largest.lines },
    avgLines,
    commonFunctions,
    issues,
    suspiciousNames: [...allSuspicious],
    totalFunctions,
    totalClasses,
    files: fileResults,
  };
}

export function guessPurpose(metrics: FileMetrics): string {
  const funcNames = metrics.functions.map(f => f.name.toLowerCase());
  const importNames = metrics.imports.map(i => (typeof i === 'string' ? i.toLowerCase() : ''));

  if (importNames.some(i => i.includes('express') || i.includes('koa') || i.includes('fastify'))) {
    if (funcNames.some(n => n.includes('auth') || n.includes('login') || n.includes('token'))) {
      return 'Handles user authentication.';
    }
    return 'HTTP server / API routes.';
  }
  if (funcNames.some(n => n.includes('auth') || n.includes('login') || n.includes('verify'))) {
    return 'Authentication logic.';
  }
  if (funcNames.some(n => n.includes('test') || n.includes('describe') || n.includes('it'))) {
    return 'Test suite.';
  }
  if (importNames.some(i => i.includes('react'))) {
    return 'React component.';
  }
  if (funcNames.some(n => n.includes('handle') || n.includes('process') || n.includes('parse'))) {
    return 'Data processing / handler logic.';
  }
  if (funcNames.some(n => n.includes('init') || n.includes('setup') || n.includes('config'))) {
    return 'Initialization / configuration.';
  }
  if (metrics.classCount > 0) {
    return 'Class-based module.';
  }
  if (metrics.functionCount > 5) {
    return 'Utility / helper functions.';
  }
  return 'General-purpose module.';
}

export function guessSteps(metrics: FileMetrics): string[] {
  const steps: string[] = [];
  const funcNames = metrics.functions.map(f => f.name.toLowerCase());

  if (metrics.importCount > 0) steps.push('Load dependencies');
  if (funcNames.some(n => n.includes('init') || n.includes('setup'))) steps.push('Initialize configuration');
  if (funcNames.some(n => n.includes('parse') || n.includes('read') || n.includes('header'))) steps.push('Parse input data');
  if (funcNames.some(n => n.includes('valid') || n.includes('verify') || n.includes('check'))) steps.push('Validate input');
  if (funcNames.some(n => n.includes('auth') || n.includes('login') || n.includes('token'))) steps.push('Handle authentication');
  if (funcNames.some(n => n.includes('process') || n.includes('handle') || n.includes('transform'))) steps.push('Process data');
  if (funcNames.some(n => n.includes('save') || n.includes('write') || n.includes('store') || n.includes('add'))) steps.push('Store results');
  if (funcNames.some(n => n.includes('send') || n.includes('respond') || n.includes('return'))) steps.push('Send response');
  if (funcNames.some(n => n.includes('listen') || n.includes('start') || n.includes('run'))) steps.push('Start service');

  if (steps.length === 0) {
    steps.push('Define functions');
    steps.push('Export module');
  }

  return steps;
}
