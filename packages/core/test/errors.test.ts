import { describe, it, expect } from 'vitest';
import { translateError, translateStderr } from '../src/errors.js';

describe('translateError', () => {
  it('translates "is not defined"', () => {
    const result = translateError('foo is not defined');
    expect(result).toContain('ГРЕШКА');
    expect(result).toContain('foo');
    expect(result).toContain('не постоји');
  });

  it('translates "is not a function"', () => {
    const result = translateError('bar is not a function');
    expect(result).toContain('ГРЕШКА');
    expect(result).toContain('bar');
    expect(result).toContain('функција');
  });

  it('translates "Cannot read properties of undefined"', () => {
    const result = translateError('Cannot read properties of undefined');
    expect(result).toContain('ГРЕШКА');
    expect(result).toContain('не постоји');
  });

  it('translates "Cannot read properties of null"', () => {
    const result = translateError('Cannot read properties of null');
    expect(result).toContain('ГРЕШКА');
    expect(result).toContain('ништавила');
  });

  it('translates "Assignment to constant variable"', () => {
    const result = translateError('Assignment to constant variable');
    expect(result).toContain('заклео');
  });

  it('translates "Unexpected token"', () => {
    const result = translateError('Unexpected token )');
    expect(result).toContain('синтакси');
  });

  it('translates "Maximum call stack size exceeded"', () => {
    const result = translateError('Maximum call stack size exceeded');
    expect(result).toContain('рекурзија');
  });

  it('returns original message with prefix if no pattern matches', () => {
    const result = translateError('some unknown error');
    expect(result).toBe('🔥 ГРЕШКА: some unknown error');
  });
});

describe('translateStderr', () => {
  it('translates error lines and strips stack traces', () => {
    const stderr = `ReferenceError: foo is not defined
    at Object.<anonymous> (/tmp/program.js:1:1)
    at Module._compile (node:internal/modules/cjs/loader:1234:14)
Node.js v20.0.0`;

    const result = translateStderr(stderr);
    expect(result).toContain('ГРЕШКА');
    expect(result).not.toContain('at Object');
    expect(result).not.toContain('Node.js');
  });

  it('passes through non-error lines', () => {
    const result = translateStderr('just some output\n');
    expect(result).toContain('just some output');
  });
});
