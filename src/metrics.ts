import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import type { FileMetrics, FunctionInfo } from './types.js';

const SUSPICIOUS_NAMES = new Set([
  'data', 'data2', 'data3', 'result', 'res', 'ret',
  'temp', 'tmp', 'foo', 'bar', 'baz', 'x', 'y', 'z',
  'final', 'final_final', 'val', 'value', 'obj', 'item',
  'stuff', 'thing', 'a', 'b', 'c', 'aa', 'bb', 'cc',
]);

export function collectMetrics(source: string, fileName: string): FileMetrics {
  const lines = source.split('\n');
  const lineCount = lines.length;
  const blankLines = lines.filter(l => l.trim() === '').length;
  const commentLines = lines.filter(l => {
    const t = l.trim();
    return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
  }).length;

  let ast: acorn.Node;
  try {
    ast = acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true,
    });
  } catch {
    try {
      ast = acorn.parse(source, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        allowReturnOutsideFunction: true,
        allowHashBang: true,
      });
    } catch {
      return fallbackMetrics(source, fileName);
    }
  }

  const functions: FunctionInfo[] = [];
  const classes: string[] = [];
  const imports: string[] = [];
  const variables: string[] = [];
  const allIdentifiers = new Set<string>();

  walk.simple(ast as any, {
    FunctionDeclaration(node: any) {
      const name: string = node.id ? node.id.name : '<anonymous>';
      const start = source.substring(0, node.start).split('\n').length;
      const end = source.substring(0, node.end).split('\n').length;
      functions.push({ name, lines: end - start + 1, start, end });
    },
    FunctionExpression(node: any) {
      if (node.id) {
        const start = source.substring(0, node.start).split('\n').length;
        const end = source.substring(0, node.end).split('\n').length;
        functions.push({ name: node.id.name, lines: end - start + 1, start, end });
      }
    },
    VariableDeclarator(node: any) {
      if (node.id && node.id.name) {
        variables.push(node.id.name);
        allIdentifiers.add(node.id.name);

        if (node.init && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')) {
          const start = source.substring(0, node.start).split('\n').length;
          const end = source.substring(0, node.end).split('\n').length;
          functions.push({ name: node.id.name, lines: end - start + 1, start, end });
        }
      }
    },
    ClassDeclaration(node: any) {
      const name: string = node.id ? node.id.name : '<anonymous>';
      classes.push(name);
    },
    ImportDeclaration(node: any) {
      imports.push(node.source.value);
    },
    CallExpression(node: any) {
      if (
        node.callee.type === 'Identifier' && node.callee.name === 'require' &&
        node.arguments.length > 0 && node.arguments[0].type === 'Literal'
      ) {
        imports.push(node.arguments[0].value);
      }
    },
  });

  const suspiciousNames = variables.filter(v => SUSPICIOUS_NAMES.has(v.toLowerCase()));
  const avgFunctionSize = functions.length > 0
    ? Math.round(functions.reduce((sum, f) => sum + f.lines, 0) / functions.length)
    : 0;

  return {
    fileName,
    lines: lineCount,
    blankLines,
    comments: commentLines,
    functions,
    functionCount: functions.length,
    classes,
    classCount: classes.length,
    imports,
    importCount: imports.length,
    variables,
    suspiciousNames,
    avgFunctionSize,
    allIdentifiers: [...allIdentifiers],
  };
}

function fallbackMetrics(source: string, fileName: string): FileMetrics {
  const lines = source.split('\n');
  const lineCount = lines.length;

  const functionMatches = source.match(/function\s+(\w+)/g) || [];
  const funcNames = functionMatches.map(m => m.replace('function ', ''));

  const classMatches = source.match(/class\s+(\w+)/g) || [];
  const classNames = classMatches.map(m => m.replace('class ', ''));

  const importMatches = source.match(/(?:import .+ from ['"].+['"]|require\(['"].+['"]\))/g) || [];

  const varMatches = source.match(/(?:const|let|var)\s+(\w+)/g) || [];
  const varNames = varMatches.map(m => m.replace(/(?:const|let|var)\s+/, ''));
  const suspiciousNames = varNames.filter(v => SUSPICIOUS_NAMES.has(v.toLowerCase()));

  const commentLines = lines.filter(l => {
    const t = l.trim();
    return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
  }).length;

  return {
    fileName,
    lines: lineCount,
    blankLines: lines.filter(l => l.trim() === '').length,
    comments: commentLines,
    functions: funcNames.map(n => ({ name: n, lines: 0 })),
    functionCount: funcNames.length,
    classes: classNames,
    classCount: classNames.length,
    imports: importMatches,
    importCount: importMatches.length,
    variables: varNames,
    suspiciousNames,
    avgFunctionSize: 0,
    allIdentifiers: varNames,
  };
}
