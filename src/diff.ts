import { execSync } from 'node:child_process';
import type { DiffResult } from './types.js';

export function readGitDiff(): DiffResult | null {
  try {
    const diff = execSync('git diff', { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 5 });
    if (!diff.trim()) {
      const staged = execSync('git diff --staged', { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 5 });
      if (!staged.trim()) {
        return null;
      }
      return parseDiff(staged);
    }
    return parseDiff(diff);
  } catch {
    return null;
  }
}

function parseDiff(raw: string): DiffResult {
  const lines = raw.split('\n');
  let added = 0;
  let removed = 0;
  const filesChanged = new Set<string>();

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/b\/(.+)$/);
      if (match) {
        filesChanged.add(match[1]);
      }
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      added++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removed++;
    }
  }

  return {
    raw,
    added,
    removed,
    totalChanged: added + removed,
    filesChanged: [...filesChanged],
    fileCount: filesChanged.size,
  };
}

export function guessDiffPurpose(diff: DiffResult): string {
  const files = diff.filesChanged.map(f => f.toLowerCase());
  const raw = diff.raw.toLowerCase();

  if (files.some(f => f.includes('test') || f.includes('spec'))) {
    return 'Tests were added or modified.';
  }
  if (files.some(f => f.includes('readme') || f.includes('doc'))) {
    return 'Documentation update.';
  }
  if (files.some(f => f.includes('package.json') || f.includes('lock'))) {
    return 'Dependency changes.';
  }
  if (raw.includes('fix') || raw.includes('bug')) {
    return 'Bug fix attempt.';
  }
  if (diff.added > diff.removed * 3) {
    return 'New feature or major addition.';
  }
  if (diff.removed > diff.added * 2) {
    return 'Cleanup or removal of code.';
  }
  if (files.some(f => f.includes('auth') || f.includes('login'))) {
    return 'Authentication changes.';
  }
  return 'General code changes.';
}
