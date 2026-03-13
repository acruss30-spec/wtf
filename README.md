# wtf-code

**understand code the honest way.**

A humorous but genuinely useful CLI that reads your source code and explains it in developer meme / greentext / brutally honest style — while still providing a helpful technical summary.

Fully offline. No API keys. No network calls. Just vibes and AST parsing.

## Install

```
npm install -g wtf-code
```

## Usage

### Analyze a file (default mode — explanation + humor)

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

  Steps:
    1. Load dependencies
    2. Handle authentication
    3. Start service

  Metrics:
    Lines:     180
    Functions: 12
    Classes:   1
    Imports:   3

  Notes:
    File size is medium.
    No comments detected.
    Vague variable names: data, data2, result, final, final_final

  Developer commentary:

    > be dev
    > open auth.js
    > see 180 lines
    > no comments
    > pain

    this file probably grew organically over time.

──────────────────────────────────────────────────
```

### Explain mode (structured, no jokes)

```
wtf file.js --explain
```

### Roast mode (full meme)

```
wtf file.js --roast
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
    classic legacy energy.
    variable naming confidence level: zero.

    variable names detected:
      data
      data2
      result
      final
      final_final

    naming confidence level: low.

──────────────────────────────────────────────────
```

### Analyze a directory

```
wtf src/
```

### Analyze git diff

```
wtf diff
```

### JSON output

```
wtf file.js --json
```

## Flags

| Flag | Description |
|------|-------------|
| `--explain` | Structured explanation, minimal humor |
| `--roast` | Full meme/roast mode |
| `--json` | Output raw JSON metrics |
| `--max-files <n>` | Max files to analyze in directory mode (default: 50) |
| `--top <n>` | Show top N results |

## How it works

1. Parses JavaScript/TypeScript files using [Acorn](https://github.com/acornjs/acorn)
2. Walks the AST to extract functions, classes, imports, and variables
3. Collects code metrics (line count, function count, naming patterns)
4. Generates a technical summary + humorous commentary from internal phrase pools
5. Formats everything with color using Chalk

No AI. No network. No API keys. Just deterministic heuristics and random joke selection.

## Supported languages

Currently: JavaScript (`.js`, `.mjs`, `.cjs`, `.jsx`)

TypeScript files are discovered but parsed with best-effort (Acorn JS mode). Full TS support is planned.

## License

MIT
