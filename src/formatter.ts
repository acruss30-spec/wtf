import chalk from 'chalk';
import type { FileMetrics, DirectorySummary, DiffResult, RiskAssessment } from './types.js';

const DIVIDER = chalk.gray('─'.repeat(50));

export function formatFileAnalysis(metrics: FileMetrics, purpose: string, steps: string[], humor: string): string {
  const out: string[] = [];

  out.push('');
  out.push(chalk.bold.cyan(`  Analyzing file: ${metrics.fileName}`));
  out.push(DIVIDER);

  out.push('');
  out.push(chalk.bold.white('  Purpose:'));
  out.push(chalk.white(`  ${purpose}`));

  if (metrics.functions.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Main components:'));
    for (const fn of metrics.functions.slice(0, 10)) {
      out.push(chalk.yellow(`    • function ${fn.name}()`));
    }
    for (const cls of metrics.classes) {
      out.push(chalk.magenta(`    • class ${cls}`));
    }
  }

  if (steps.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Steps:'));
    steps.forEach((step, i) => {
      out.push(chalk.white(`    ${i + 1}. ${step}`));
    });
  }

  out.push('');
  out.push(chalk.bold.white('  Metrics:'));
  out.push(chalk.gray(`    Lines:     ${metrics.lines}`));
  out.push(chalk.gray(`    Functions: ${metrics.functionCount}`));
  out.push(chalk.gray(`    Classes:   ${metrics.classCount}`));
  out.push(chalk.gray(`    Imports:   ${metrics.importCount}`));
  if (metrics.avgFunctionSize > 0) {
    out.push(chalk.gray(`    Avg fn size: ~${metrics.avgFunctionSize} lines`));
  }

  out.push('');
  out.push(chalk.bold.white('  Notes:'));
  if (metrics.lines > 300) out.push(chalk.white('    File size is large.'));
  else if (metrics.lines > 100) out.push(chalk.white('    File size is medium.'));
  else out.push(chalk.white('    File size is small.'));
  if (metrics.comments === 0) out.push(chalk.white('    No comments detected.'));
  if (metrics.suspiciousNames.length > 0) {
    out.push(chalk.white(`    Vague variable names: ${metrics.suspiciousNames.join(', ')}`));
  }

  if (humor) {
    out.push('');
    out.push(chalk.bold.white('  Developer commentary:'));
    out.push('');
    for (const line of humor.split('\n')) {
      if (line.startsWith('>')) {
        out.push(chalk.green(`    ${line}`));
      } else {
        out.push(chalk.italic.gray(`    ${line}`));
      }
    }
  }

  out.push('');
  out.push(DIVIDER);
  return out.join('\n');
}

export function formatExplain(metrics: FileMetrics, purpose: string, steps: string[]): string {
  const out: string[] = [];

  out.push('');
  out.push(chalk.bold.cyan(`  File: ${metrics.fileName}`));
  out.push(DIVIDER);

  out.push('');
  out.push(chalk.bold.white('  Purpose:'));
  out.push(chalk.white(`  ${purpose}`));

  if (metrics.functions.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Functions detected:'));
    for (const fn of metrics.functions) {
      out.push(chalk.yellow(`    • ${fn.name}`));
    }
  }

  if (metrics.classes.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Classes detected:'));
    for (const cls of metrics.classes) {
      out.push(chalk.magenta(`    • ${cls}`));
    }
  }

  if (steps.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Execution flow:'));
    steps.forEach((step, i) => {
      out.push(chalk.white(`    ${i + 1}. ${step}`));
    });
  }

  out.push('');
  out.push(chalk.bold.white('  Metrics:'));
  out.push(chalk.gray(`    Lines:     ${metrics.lines}`));
  out.push(chalk.gray(`    Functions: ${metrics.functionCount}`));
  out.push(chalk.gray(`    Classes:   ${metrics.classCount}`));
  out.push(chalk.gray(`    Imports:   ${metrics.importCount}`));

  out.push('');
  out.push(DIVIDER);
  return out.join('\n');
}

export function formatRoast(metrics: FileMetrics, greentext: string, roast: string): string {
  const out: string[] = [];

  out.push('');
  out.push(chalk.bold.red(`  🔥 Roasting: ${metrics.fileName}`));
  out.push(DIVIDER);

  out.push('');
  for (const line of greentext.split('\n')) {
    out.push(chalk.green(`    ${line}`));
  }

  out.push('');
  if (metrics.functions.length > 0) {
    const fn = metrics.functions[0];
    out.push(chalk.yellow(`  function ${fn.name}()`));
    out.push('');
  }

  for (const line of roast.split('\n')) {
    if (line.trim() === '') {
      out.push('');
    } else {
      out.push(chalk.italic.white(`    ${line}`));
    }
  }

  out.push('');
  out.push(DIVIDER);
  return out.join('\n');
}

export function formatDirectory(summary: DirectorySummary): string {
  const out: string[] = [];

  out.push('');
  out.push(chalk.bold.cyan('  Project summary:'));
  out.push(DIVIDER);

  out.push('');
  out.push(chalk.white(`  Files analyzed: ${summary.totalFiles}`));
  if (summary.largest) {
    out.push(chalk.white(`  Largest file: ${summary.largest.name} (${summary.largest.lines} lines)`));
  }
  out.push(chalk.white(`  Total functions: ${summary.totalFunctions}`));
  out.push(chalk.white(`  Total classes: ${summary.totalClasses}`));

  if (summary.commonFunctions.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Most common function names:'));
    for (const fn of summary.commonFunctions) {
      out.push(chalk.yellow(`    • ${fn.name}${fn.count > 1 ? ` (×${fn.count})` : ''}`));
    }
  }

  out.push('');
  out.push(chalk.white(`  Average file length: ${summary.avgLines} lines`));

  if (summary.issues.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Possible issues:'));
    for (const issue of summary.issues) {
      out.push(chalk.red(`    • ${issue}`));
    }
  }

  out.push('');
  out.push(DIVIDER);
  return out.join('\n');
}

export function formatDiff(diff: DiffResult, purpose: string, risk: RiskAssessment, commentary: string): string {
  const out: string[] = [];

  out.push('');
  out.push(chalk.bold.cyan('  What happened here:'));
  out.push(DIVIDER);

  out.push('');
  out.push(chalk.white(`  ${purpose}`));

  out.push('');
  out.push(chalk.bold.white('  Changes:'));
  out.push(chalk.green(`    +${diff.added} lines`));
  out.push(chalk.red(`    -${diff.removed} lines`));
  out.push(chalk.gray(`    ${diff.fileCount} file${diff.fileCount !== 1 ? 's' : ''} changed`));

  if (diff.filesChanged.length > 0) {
    out.push('');
    out.push(chalk.bold.white('  Files:'));
    for (const f of diff.filesChanged.slice(0, 10)) {
      out.push(chalk.gray(`    • ${f}`));
    }
    if (diff.filesChanged.length > 10) {
      out.push(chalk.gray(`    ... and ${diff.filesChanged.length - 10} more`));
    }
  }

  out.push('');
  const riskColor = risk.level === 'EXTREME' || risk.level === 'HIGH' ? chalk.red
    : risk.level === 'MODERATE' ? chalk.yellow
    : chalk.green;
  out.push(chalk.bold.white('  Risk level:'));
  out.push(riskColor(`    ${risk.level}`));
  out.push(chalk.italic.gray(`    ${risk.comment}`));

  out.push('');
  out.push(chalk.italic.gray(`  ${commentary}`));

  out.push('');
  out.push(DIVIDER);
  return out.join('\n');
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
