import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'bin', 'ћс.js');
const EXAMPLES = join(__dirname, '..', '..', '..', 'примери');

function run(...args: string[]): string {
  return execFileSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 10000,
  });
}

function runWithError(...args: string[]): { stdout: string; stderr: string; status: number | null } {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return { stdout, stderr: '', status: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      status: err.status,
    };
  }
}

describe('CLI', () => {
  it('shows help with no args', () => {
    const output = run();
    expect(output).toContain('ћ-скрипт');
    expect(output).toContain('покрени');
    expect(output).toContain('преведи');
  });

  it('shows help with помоћ', () => {
    const output = run('помоћ');
    expect(output).toContain('ћ-скрипт');
  });

  it('transpiles a file with преведи', () => {
    const exampleFile = join(EXAMPLES, 'здраво-свете.ћс');
    const output = run('преведи', exampleFile);
    expect(output).toContain('const');
    expect(output).toContain('console.log');
    expect(output).toContain('function');
    expect(output).not.toContain('нека');
    expect(output).not.toContain('кажи');
    expect(output).not.toContain('функција');
  });

  it('runs a file with покрени', () => {
    const exampleFile = join(EXAMPLES, 'здраво-свете.ћс');
    const output = run('покрени', exampleFile);
    expect(output).toContain('Здраво свете!');
    expect(output).toContain('Можеш у кафану');
    expect(output).toContain('Марко');
  });

  it('runs async example', () => {
    const exampleFile = join(EXAMPLES, 'асинхроно.ћс');
    const output = run('покрени', exampleFile);
    expect(output).toContain('Правим кафу');
    expect(output).toContain('Кафа је готова');
    expect(output).toContain('турска кафа');
  });

  it('runs classes example', () => {
    const exampleFile = join(EXAMPLES, 'класе.ћс');
    const output = run('покрени', exampleFile);
    expect(output).toContain('Горан');
    expect(output).toContain('ћ-скрипт');
  });

  it('errors on unknown command', () => {
    const result = runWithError('непостојећа');
    expect(result.status).not.toBe(0);
  });

  it('errors on missing file arg for покрени', () => {
    const result = runWithError('покрени');
    expect(result.status).not.toBe(0);
  });

  it('produces Serbian error for runtime errors', () => {
    // Create a temp file with an error
    const { writeFileSync, unlinkSync, mkdtempSync } = require('fs');
    const { tmpdir } = require('os');
    const tmp = mkdtempSync(join(tmpdir(), 'cs-test-'));
    const file = join(tmp, 'error.ћс');
    writeFileSync(file, 'кажи(непостојећаПроменљива)', 'utf-8');

    const result = runWithError('покрени', file);
    expect(result.stderr).toContain('ГРЕШКА');

    unlinkSync(file);
  });
});
