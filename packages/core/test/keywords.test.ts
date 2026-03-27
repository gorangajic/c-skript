import { describe, it, expect } from 'vitest';
import { keywords, types, builtins, getAllMappings } from '../src/keywords.js';
import { transpile } from '../src/transpiler.js';

describe('keyword mappings', () => {
  it('has all expected keywords', () => {
    expect(Object.keys(keywords).length).toBeGreaterThanOrEqual(30);
  });

  it('maps every keyword to valid JS', () => {
    const jsKeywords = new Set([
      'let', 'const', 'if', 'else', 'while', 'for', 'function', 'return',
      'class', 'extends', 'this', 'super', 'new', 'try', 'catch', 'finally',
      'throw', 'import', 'export', 'from', 'as', 'await', 'async', 'break',
      'continue', 'true', 'false', 'null', 'undefined', 'switch', 'case', 'default',
    ]);
    for (const [, jsValue] of Object.entries(keywords)) {
      expect(jsKeywords.has(jsValue)).toBe(true);
    }
  });

  it('produces correct JS output for each keyword', () => {
    for (const [serbian, js] of Object.entries(keywords)) {
      const result = transpile(serbian);
      expect(result).toBe(js);
    }
  });
});

describe('type mappings', () => {
  it('produces correct JS output for each type', () => {
    for (const [serbian, js] of Object.entries(types)) {
      const result = transpile(serbian);
      expect(result).toBe(js);
    }
  });
});

describe('builtin mappings', () => {
  it('produces correct JS output for each builtin', () => {
    for (const [serbian, js] of Object.entries(builtins)) {
      const result = transpile(`${serbian}("тест")`);
      expect(result).toBe(`${js}("тест")`);
    }
  });
});

describe('getAllMappings', () => {
  it('returns combined keywords, types, and builtins', () => {
    const all = getAllMappings();
    expect(all['нека']).toBe('let');
    expect(all['број']).toBe('number');
    expect(all['кажи']).toBe('console.log');
  });
});
