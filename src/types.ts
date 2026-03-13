export interface FunctionInfo {
  name: string;
  lines: number;
  start?: number;
  end?: number;
}

export interface FileMetrics {
  fileName: string;
  lines: number;
  blankLines: number;
  comments: number;
  functions: FunctionInfo[];
  functionCount: number;
  classes: string[];
  classCount: number;
  imports: string[];
  importCount: number;
  variables: string[];
  suspiciousNames: string[];
  avgFunctionSize: number;
  allIdentifiers: string[];
}

export interface DirectorySummary {
  dirPath: string;
  totalFiles: number;
  largest: { name: string; lines: number } | null;
  avgLines: number;
  commonFunctions: { name: string; count: number }[];
  issues: string[];
  suspiciousNames: string[];
  totalFunctions: number;
  totalClasses: number;
  files: FileMetrics[];
  summary?: string;
}

export interface DiffResult {
  raw: string;
  added: number;
  removed: number;
  totalChanged: number;
  filesChanged: string[];
  fileCount: number;
}

export interface RiskAssessment {
  level: string;
  comment: string;
}

export interface CliOptions {
  explain?: boolean;
  roast?: boolean;
  json?: boolean;
  maxFiles?: string;
  top?: string;
}
