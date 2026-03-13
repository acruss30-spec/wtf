import type { FileMetrics, DiffResult, RiskAssessment } from './types.js';

const greentextOpeners: string[] = [
  '> be dev',
  '> be developer',
  '> be me, a developer',
  '> wake up',
  '> open laptop',
  '> open IDE',
  '> open code',
  '> git pull',
  '> check Slack',
  '> coffee ready',
];

const greentextReactions: string[] = [
  '> pain',
  '> suffering',
  '> why',
  '> close laptop',
  '> consider career change',
  '> stare into void',
  '> deep breath',
  '> this is fine',
  '> everything is fine',
  '> refuse to elaborate',
  '> leave',
];

const fileObservations: Record<string, string[]> = {
  long: [
    '> see {lines} lines',
    '> scroll down',
    '> keep scrolling',
    '> still scrolling',
    '> there is no end',
  ],
  medium: [
    '> see {lines} lines',
    '> not terrible',
    '> manageable',
  ],
  short: [
    '> see {lines} lines',
    '> suspiciously short',
    '> where is the rest',
  ],
  noComments: [
    '> no comments',
    '> zero documentation',
    '> not a single comment in sight',
  ],
  manyFunctions: [
    '> functions everywhere',
    '> so many functions',
    "> it's functions all the way down",
  ],
  deepNesting: [
    '> nested if statements',
    '> deeper',
    '> even deeper',
    '> inception.js',
  ],
};

const roastLines: string[] = [
  'this function works but nobody knows why.',
  'classic legacy energy.',
  'clearly written during a deadline panic.',
  'variable naming confidence level: zero.',
  'someone will refactor this in 2029.',
  'this code has strong "it works on my machine" vibes.',
  'written with passion. questionable passion, but passion.',
  'the kind of code that makes senior devs sigh.',
  'this passed code review because everyone was tired.',
  'technically correct — the best kind of correct.',
  'ship it and pray.',
  'the tests pass. there are no tests.',
  'documentation: the code is self-documenting (it is not).',
  'this file has main character energy.',
  'the TODO comments outnumber the actual logic.',
  'smells like a Stack Overflow answer.',
  'this code runs on hope and caffeine.',
  'future developers will write blog posts about this.',
  'commit message was probably "fix stuff".',
  'this function is doing three jobs and complaining about none of them.',
];

const devNotes: string[] = [
  'this file probably grew organically over time.',
  'logic is doing multiple jobs.',
  'refactoring opportunity detected.',
  'someone started a pattern and then gave up.',
  "there is a design here, it's just hiding.",
  'the architecture is emergent (unplanned).',
  'this code has survived at least two rewrites.',
  'strong deadline energy throughout.',
  'the original author has since left the company.',
  'built different. not better — just different.',
];

const namingRoasts: string[] = [
  'variable names suggest a naming convention of "whatever comes to mind first".',
  'the variables tell a story: data, data2, result, final, final_final.',
  'naming confidence level: low.',
  'someone really likes single-letter variables.',
  'variable names are technically English words.',
  'the naming convention is "vibes-based".',
];

const diffComments: string[] = [
  'developer attempted a fix. results inconclusive.',
  'lines were changed. confidence was not.',
  'this diff has "one more thing" energy.',
  'the PR description says "small fix".',
  'changes detected. understanding not included.',
  'this looks like a refactor that got interrupted.',
  'someone was on a roll and then stopped.',
];

interface RiskEntry {
  threshold: number;
  level: string;
  comment: string;
}

const riskAssessments: RiskEntry[] = [
  { threshold: 200, level: 'EXTREME', comment: 'deploy on Friday for maximum excitement.' },
  { threshold: 100, level: 'HIGH', comment: 'possible side effects: unknown.' },
  { threshold: 50, level: 'MODERATE', comment: 'probably fine. probably.' },
  { threshold: 20, level: 'LOW', comment: 'a reasonable change. suspicious.' },
  { threshold: 0, level: 'MINIMAL', comment: 'so small it might be a typo fix.' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

export function generateGreentext(metrics: FileMetrics): string {
  const lines: string[] = [];
  lines.push(pick(greentextOpeners));

  const fileName = metrics.fileName || 'file.js';
  lines.push(`> open ${fileName}`);

  if (metrics.lines > 300) {
    lines.push(...pickN(fileObservations.long, 3).map(l => l.replace('{lines}', String(metrics.lines))));
  } else if (metrics.lines > 100) {
    lines.push(...pickN(fileObservations.medium, 2).map(l => l.replace('{lines}', String(metrics.lines))));
  } else {
    lines.push(...pickN(fileObservations.short, 2).map(l => l.replace('{lines}', String(metrics.lines))));
  }

  if (metrics.comments === 0) {
    lines.push(pick(fileObservations.noComments));
  }

  if (metrics.functionCount > 5) {
    lines.push(pick(fileObservations.manyFunctions));
  }

  lines.push(pick(greentextReactions));

  return lines.join('\n');
}

export function generateRoast(metrics: FileMetrics): string {
  const parts: string[] = [];

  parts.push(...pickN(roastLines, 3));

  if (metrics.suspiciousNames && metrics.suspiciousNames.length > 0) {
    parts.push('');
    parts.push('variable names detected:');
    metrics.suspiciousNames.forEach(n => parts.push(`  ${n}`));
    parts.push('');
    parts.push(pick(namingRoasts));
  }

  return parts.join('\n');
}

export function generateDevNote(metrics: FileMetrics): string {
  const notes: string[] = [];
  notes.push(pick(devNotes));

  if (metrics.lines > 300) {
    notes.push('this file could use a diet.');
  }
  if (metrics.functionCount > 8) {
    notes.push("that's a lot of functions for one file.");
  }
  if (metrics.classCount > 2) {
    notes.push('multiple classes in one file — bold strategy.');
  }
  if (metrics.importCount > 5) {
    notes.push('the import section is doing heavy lifting.');
  }

  return notes.join('\n');
}

export function generateDiffCommentary(_diff: DiffResult): string {
  return pick(diffComments);
}

export function getDiffRisk(totalChanged: number): RiskAssessment {
  for (const r of riskAssessments) {
    if (totalChanged >= r.threshold) {
      return { level: r.level, comment: r.comment };
    }
  }
  const last = riskAssessments[riskAssessments.length - 1];
  return { level: last.level, comment: last.comment };
}
