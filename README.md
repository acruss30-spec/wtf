# wtf

**understand code the honest way.**

[![npm version](https://img.shields.io/npm/v/wtf-code)](https://www.npmjs.com/package/wtf-code)
[![license](https://img.shields.io/npm/l/wtf-code)](./LICENSE)
[![downloads](https://img.shields.io/npm/dm/wtf-code)](https://www.npmjs.com/package/wtf-code)

A CLI that reads your source code and explains it in a **developer meme / greentext / brutally honest style** — while still providing a useful technical summary.

No AI.<br>
No API keys.<br>
No network calls.

Just AST parsing and developer sarcasm.

```
$ wtf project

  Project analysis
──────────────────────────────────────────────────

  Files analyzed: 42

  Largest file:
    server.js (910 lines)

  Code smells detected:
    • large files
    • vague variable names

  Developer commentary:

    this project has strong "we'll refactor later" energy.

──────────────────────────────────────────────────
```

```
$ wtf legacy.js --roast

  🔥 Roasting: legacy.js
──────────────────────────────────────────────────

    > be developer
    > open legacy.js
    > see 420 lines
    > no comments
    > pain

  function handleData()

    this function works but nobody knows why.
    classic legacy energy.
    variable naming confidence level: zero.

──────────────────────────────────────────────────
```

---

## Install

```
npm install -g wtf-code
```

---

## Usage

### Analyze a file

```
wtf file.js
```

```
  Analyzing file: auth.js
──────────────────────────────────────────────────

  Purpose:
  Handles user authentication.

  Main components:
    • function login()
    • function verifyToken()
    • class UserManager

  Metrics:
    Lines:     180
    Functions: 12
    Classes:   1
    Imports:   3

  Developer commentary:

    > be dev
    > open auth.js
    > see 180 lines
    > no comments
    > pain

    this file probably grew organically over time.

──────────────────────────────────────────────────
```

### Roast mode

```
wtf messy.js --roast
```

```
  🔥 Roasting: messy.js
──────────────────────────────────────────────────

    > be developer
    > open messy.js
    > see 180 lines
    > no comments
    > pain

  function login()

    this function works but nobody knows why.
    variable naming confidence level: zero.

    detected variable names:
      data
      data2
      result
      final
      final_final

──────────────────────────────────────────────────
```

### Blame mode

```
wtf blame auth.js
```

```
  Analyzing contributions: auth.js
──────────────────────────────────────────────────

  Lines written by:
    Andrew                 120  ████████████████████ 67%
    Luna                    40  ██████ 22%
    Unknown                 20  ███ 11%

  Developer commentary:

    > be Andrew
    > add feature quickly
    > promise to refactor later
    > never refactor

    classic.

──────────────────────────────────────────────────
```

### Complexity analysis

```
wtf server.js --complexity
```

```
  Complexity report: server.js
──────────────────────────────────────────────────

  Functions:              14
  Average function length: 32 lines
  Largest function:        processRequest() (97 lines)
  Max nesting depth:       6

  Warnings:
    • deeply nested conditionals
    • repeated vague variable naming

  Verdict:
    concerning

  this function is doing way too much.

──────────────────────────────────────────────────
```

### Project analysis

```
wtf project
```

```
  Project analysis
──────────────────────────────────────────────────

  Files analyzed: 42

  Largest file:
    server.js (910 lines)

  Total functions: 128
  Total classes:   5
  Average file length: 110 lines

  Most common function names:
    init (×4)
    handleRequest (×3)
    processData (×2)

  Code smells detected:
    • 3 large files (>300 lines)
    • repeated vague variable naming

  Developer commentary:

    this project has strong "we'll refactor later" energy.

──────────────────────────────────────────────────
```

### Therapy mode

```
wtf legacy.js --therapy
```

```
  Therapy session for legacy.js
──────────────────────────────────────────────────

  You are not responsible for this code.
  Take a deep breath.
  We will get through this together.
  It's okay to not understand legacy code.

  The lack of comments is a systemic issue, not a personal one.

  Session complete. You are valid.

──────────────────────────────────────────────────
```

### Quick summary

```
wtf file.js --summary
```

```
  auth.js
──────────────────────────────────────────────────

  180 lines · 12 functions · 1 class

  main job: handles user authentication

  verdict: reasonable but messy.

──────────────────────────────────────────────────
```

### Explain mode

```
wtf file.js --explain
```

Structured technical explanation with minimal humor.

### Directory analysis

```
wtf src/
```

Analyze a directory of files.

### Git diff explanation

```
wtf diff
```

Explains what a commit actually did.

### JSON output

```
wtf file.js --json
```

Useful for automation.

---

## Commands

| Command | Description |
|---------|-------------|
| `wtf <file>` | Analyze a file (default mode) |
| `wtf <dir>` | Analyze a directory |
| `wtf blame <file>` | See who wrote what |
| `wtf diff` | Explain the current git diff |
| `wtf project` | Full project analysis from cwd |

## Flags

| Flag | Description |
|------|-------------|
| `--explain` | Structured explanation |
| `--roast` | Full meme roast mode |
| `--complexity` | Complexity analysis report |
| `--therapy` | Emotional support for your code |
| `--summary` | Short one-glance summary |
| `--json` | Raw JSON output |
| `--max-files <n>` | Max files analyzed in directory mode |
| `--top <n>` | Show top N results |

---

## How it works

1. Parses JavaScript using [Acorn](https://github.com/acornjs/acorn)
2. Walks the AST
3. Extracts: functions, classes, imports, variable names
4. Calculates code metrics and complexity
5. Generates developer commentary using phrase pools

No AI involved. Just deterministic analysis and developer sarcasm.

---

## Supported languages

Currently: JavaScript (`.js` `.mjs` `.cjs` `.jsx`)

TypeScript support planned.

---

## License

[MIT](./LICENSE)
