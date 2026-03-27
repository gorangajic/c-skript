import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { spawn } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { transpile } from './transpiler.js';
import { translateStderr } from './errors.js';

const HELP_TEXT = `
ћ-скрипт — комични српски програмски језик 🇷🇸

Употреба:
  ћс покрени <фајл.ћс>              Покрени ћ-скрипт фајл
  ћс преведи <фајл.ћс>              Преведи у JavaScript и испиши
  ћс преведи <фајл.ћс> --излаз <фајл.js>  Преведи и сачувај у фајл
  ћс помоћ                           Прикажи ову поруку

Примери:
  ћс покрени здраво-свете.ћс
  ћс преведи мој-програм.ћс --излаз програм.js
`.trim();

function showHelp() {
  console.log(HELP_TEXT);
}

function readSource(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    console.error(`🔥 ГРЕШКА: Не могу да отворим фајл "${filePath}". Јел постоји уопште?`);
    process.exit(1);
  }
}

function runTranspiled(jsCode: string): Promise<number> {
  return new Promise((resolve) => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'cs-'));
    const tmpFile = join(tmpDir, 'program.js');
    writeFileSync(tmpFile, jsCode, 'utf-8');

    const child = spawn('node', [tmpFile], {
      stdio: ['inherit', 'inherit', 'pipe'],
    });

    let stderr = '';
    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      // Cleanup
      try {
        unlinkSync(tmpFile);
      } catch {
        // ignore cleanup errors
      }

      if (stderr) {
        console.error(translateStderr(stderr));
      }

      resolve(code ?? 1);
    });
  });
}

export async function main(args: string[]) {
  const command = args[0];

  if (!command || command === 'помоћ' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === 'покрени') {
    const filePath = args[1];
    if (!filePath) {
      console.error('🔥 ГРЕШКА: Дај ми фајл да покренем! Нпр: ћс покрени мој-програм.ћс');
      process.exit(1);
    }

    const source = readSource(filePath);
    const js = transpile(source);
    const exitCode = await runTranspiled(js);
    process.exit(exitCode);
  }

  if (command === 'преведи') {
    const filePath = args[1];
    if (!filePath) {
      console.error('🔥 ГРЕШКА: Дај ми фајл да преведем! Нпр: ћс преведи мој-програм.ћс');
      process.exit(1);
    }

    const source = readSource(filePath);
    const js = transpile(source);

    const outputIndex = args.indexOf('--излаз');
    if (outputIndex !== -1 && args[outputIndex + 1]) {
      writeFileSync(args[outputIndex + 1], js, 'utf-8');
      console.log(`✅ Преведено у: ${args[outputIndex + 1]}`);
    } else {
      console.log(js);
    }
    return;
  }

  console.error(`🔥 ГРЕШКА: Непозната команда "${command}". Пробај "ћс помоћ".`);
  process.exit(1);
}
