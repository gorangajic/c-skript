# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ћ-скрипт (Ć-Script) is a humorous Serbian programming language that transpiles to JavaScript. Serbian Cyrillic keywords are mapped to their JavaScript equivalents while preserving strings, comments, and template literal text unchanged. The file extension is `.ћс`.

## Commands

```bash
# Install dependencies
pnpm install

# Build (TypeScript → dist/)
pnpm build          # or: turbo build

# Run all tests
pnpm test           # or: turbo test

# Run tests in watch mode (from packages/core)
cd packages/core && pnpm test:watch

# Run a single test file
cd packages/core && npx vitest run test/transpiler.test.ts

# Run a .ћс file (after build)
node packages/core/bin/ћс.js покрени примери/здраво-свете.ћс

# Transpile a .ћс file to JS
node packages/core/bin/ћс.js преведи примери/здраво-свете.ћс
```

## Architecture

Monorepo using pnpm workspaces + Turborepo. Currently one package: `packages/core`.

### Core transpiler pipeline (`packages/core/src/`)

1. **`transpiler.ts`** — Main entry point. `tokenizeZones()` splits source into code vs non-code segments (strings, comments are non-code; template literal `${}` expressions are code). `transpile()` applies keyword replacement only to code segments.

2. **`keywords.ts`** — All Serbian→JS mappings in three categories: `keywords` (control flow, functions, modules, async, literals), `types` (number, string, etc.), `builtins` (кажи→console.log, дериСе→console.warn, кукај→console.error). Special case: `заСваког...у` maps to `for...of`.

3. **`errors.ts`** — Translates JS runtime errors into humorous Serbian messages. Used by the CLI to process stderr from executed programs.

4. **`cli.ts`** — CLI with two commands: `покрени` (run) and `преведи` (transpile). Transpiles to a temp file and spawns Node to run it.

### Key design decisions

- Keyword replacement is token-based with Cyrillic-aware word boundary detection (`\u0400-\u052F` range), preventing partial replacements inside longer identifiers.
- `Object.hasOwn` is used for mapping lookups to avoid prototype pollution (e.g., "constructor").
- The `у` → `of` mapping is context-dependent: only active inside `заСваког` (forEach) loops.

### Tests (`packages/core/test/`)

- **`transpiler.test.ts`** — Unit tests for keyword replacement + fixture-based tests comparing `.ћс` → `.js` file pairs in `test/fixtures/`.
- **`keywords.test.ts`** / **`errors.test.ts`** — Unit tests for mappings and error translation.
- Fixture pattern: each fixture has a `.ћс` input and expected `.js` output. Add new fixtures as paired files.
