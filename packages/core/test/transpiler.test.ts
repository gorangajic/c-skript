import { describe, it, expect } from 'vitest';
import { transpile, tokenizeZones } from '../src/transpiler.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function fixture(name: string, ext: string): string {
  return readFileSync(join(__dirname, 'fixtures', `${name}.${ext}`), 'utf-8');
}

describe('transpile', () => {
  // Basic keyword replacement
  it('replaces нека with let', () => {
    expect(transpile('нека х = 1')).toBe('let х = 1');
  });

  it('replaces заклето with const', () => {
    expect(transpile('заклето х = 1')).toBe('const х = 1');
  });

  it('replaces ако/иначе with if/else', () => {
    expect(transpile('ако (тачно) {} иначе {}')).toBe('if (true) {} else {}');
  });

  it('replaces док with while', () => {
    expect(transpile('док (тачно) {}')).toBe('while (true) {}');
  });

  it('replaces функција with function', () => {
    expect(transpile('функција фу() {}')).toBe('function фу() {}');
  });

  it('replaces врати with return', () => {
    expect(transpile('врати 42')).toBe('return 42');
  });

  it('replaces класа/наслеђује with class/extends', () => {
    expect(transpile('класа А наслеђује Б {}')).toBe('class А extends Б {}');
  });

  it('replaces ово/супер with this/super', () => {
    expect(transpile('ово.х = супер.у')).toBe('this.х = super.у');
  });

  it('replaces прави with new', () => {
    expect(transpile('прави Човек()')).toBe('new Човек()');
  });

  it('replaces покушај/ухвати/наКрају with try/catch/finally', () => {
    expect(transpile('покушај {} ухвати (е) {} наКрају {}')).toBe('try {} catch (е) {} finally {}');
  });

  it('replaces баци with throw', () => {
    expect(transpile('баци прави Error("бум")')).toBe('throw new Error("бум")');
  });

  it('replaces увези/извези/из/као with import/export/from/as', () => {
    expect(transpile('увези { х као у } из "модул"')).toBe('import { х as у } from "модул"');
  });

  it('replaces асинхроно/чекај with async/await', () => {
    expect(transpile('асинхроно функција ф() { чекај п() }')).toBe('async function ф() { await п() }');
  });

  it('replaces прекини/настави with break/continue', () => {
    expect(transpile('прекини\nнастави')).toBe('break\ncontinue');
  });

  it('replaces тачно/нетачно with true/false', () => {
    expect(transpile('нека а = тачно\nнека б = нетачно')).toBe('let а = true\nlet б = false');
  });

  it('replaces ништа/нијеНишта with null/undefined', () => {
    expect(transpile('нека а = ништа\nнека б = нијеНишта')).toBe('let а = null\nlet б = undefined');
  });

  it('replaces случај/кад/подразумевано with switch/case/default', () => {
    expect(transpile('случај (х) { кад 1: прекини; подразумевано: прекини; }'))
      .toBe('switch (х) { case 1: break; default: break; }');
  });

  // Builtin functions
  it('replaces кажи with console.log', () => {
    expect(transpile('кажи("здраво")')).toBe('console.log("здраво")');
  });

  it('replaces дериСе with console.warn', () => {
    expect(transpile('дериСе("пажња")')).toBe('console.warn("пажња")');
  });

  it('replaces кукај with console.error', () => {
    expect(transpile('кукај("грешка")')).toBe('console.error("грешка")');
  });

  // Type mappings
  it('replaces type keywords', () => {
    expect(transpile('нека х: број = 1')).toBe('let х: number = 1');
    expect(transpile('нека и: реч = "а"')).toBe('let и: string = "а"');
    expect(transpile('нека б: истина = тачно')).toBe('let б: boolean = true');
    expect(transpile('нека н: низ = []')).toBe('let н: Array = []');
    expect(transpile('нека о: објекат = {}')).toBe('let о: object = {}');
  });

  // Strings should NOT be replaced
  it('does not replace keywords inside double-quoted strings', () => {
    expect(transpile('нека х = "нека ово буде нека"')).toBe('let х = "нека ово буде нека"');
  });

  it('does not replace keywords inside single-quoted strings', () => {
    expect(transpile("нека х = 'ако иначе функција'")).toBe("let х = 'ако иначе функција'");
  });

  it('handles escaped quotes in strings', () => {
    expect(transpile('нека х = "каже \\"нека\\""')).toBe('let х = "каже \\"нека\\""');
  });

  // Comments should NOT be replaced
  it('does not replace keywords inside single-line comments', () => {
    expect(transpile('// нека заклето ако\nнека х = 1')).toBe('// нека заклето ако\nlet х = 1');
  });

  it('does not replace keywords inside block comments', () => {
    expect(transpile('/* функција врати */\nнека х = 1')).toBe('/* функција врати */\nlet х = 1');
  });

  // Template literals
  it('replaces keywords in template literal expressions but not text', () => {
    expect(transpile('нека с = `ако ${нека х = тачно}`'))
      .toBe('let с = `ако ${let х = true}`');
  });

  // Multiple keywords on same line
  it('handles multiple keywords on one line', () => {
    expect(transpile('ако (тачно) { нека х = 1 } иначе { заклето у = 2 }'))
      .toBe('if (true) { let х = 1 } else { const у = 2 }');
  });

  // Nested structures
  it('handles nested structures', () => {
    const input = 'класа А {\n  функција б() {\n    ако (тачно) {\n      врати 1\n    }\n  }\n}';
    const expected = 'class А {\n  function б() {\n    if (true) {\n      return 1\n    }\n  }\n}';
    expect(transpile(input)).toBe(expected);
  });

  // заСваког
  it('transforms заСваког pattern correctly', () => {
    expect(transpile('заСваког (нека х у ствари) {}')).toBe('for (let х of ствари) {}');
  });

  // Partial keyword matches should NOT be replaced
  it('does not partially replace keywords in longer identifiers', () => {
    expect(transpile('нека заклетоИме = 1')).toBe('let заклетоИме = 1');
  });

  it('does not replace keyword substrings in identifiers', () => {
    expect(transpile('нека некаПроменљива = 1')).toBe('let некаПроменљива = 1');
  });

  // Edge cases
  it('handles empty input', () => {
    expect(transpile('')).toBe('');
  });

  it('handles whitespace-only input', () => {
    expect(transpile('   \n\t  \n')).toBe('   \n\t  \n');
  });

  it('handles mixed Cyrillic/ASCII identifiers', () => {
    expect(transpile('нека myVar = 1')).toBe('let myVar = 1');
  });

  it('preserves non-keyword Cyrillic text', () => {
    expect(transpile('нека моjaПроменљива = "вредност"')).toBe('let моjaПроменљива = "вредност"');
  });
});

describe('fixture tests', () => {
  it('basic.ћс → basic.js', () => {
    expect(transpile(fixture('basic', 'ћс'))).toBe(fixture('basic', 'js'));
  });

  it('strings.ћс → strings.js', () => {
    expect(transpile(fixture('strings', 'ћс'))).toBe(fixture('strings', 'js'));
  });

  it('comments.ћс → comments.js', () => {
    expect(transpile(fixture('comments', 'ћс'))).toBe(fixture('comments', 'js'));
  });

  it('template.ћс → template.js', () => {
    expect(transpile(fixture('template', 'ћс'))).toBe(fixture('template', 'js'));
  });

  it('foreach.ћс → foreach.js', () => {
    expect(transpile(fixture('foreach', 'ћс'))).toBe(fixture('foreach', 'js'));
  });
});

describe('tokenizeZones', () => {
  it('treats plain code as code zone', () => {
    const zones = tokenizeZones('нека х = 1');
    expect(zones).toEqual([{ text: 'нека х = 1', isCode: true }]);
  });

  it('separates strings as non-code zones', () => {
    const zones = tokenizeZones('нека х = "abc" + 1');
    expect(zones.length).toBe(3);
    expect(zones[0]).toEqual({ text: 'нека х = ', isCode: true });
    expect(zones[1]).toEqual({ text: '"abc"', isCode: false });
    expect(zones[2]).toEqual({ text: ' + 1', isCode: true });
  });

  it('separates single-line comments as non-code zones', () => {
    const zones = tokenizeZones('нека х = 1 // коментар');
    expect(zones[0]).toEqual({ text: 'нека х = 1 ', isCode: true });
    expect(zones[1]).toEqual({ text: '// коментар', isCode: false });
  });

  it('separates block comments as non-code zones', () => {
    const zones = tokenizeZones('нека /* блок */ х = 1');
    expect(zones.length).toBe(3);
    expect(zones[1]).toEqual({ text: '/* блок */', isCode: false });
  });
});
