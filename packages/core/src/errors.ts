// Serbian error message translator
// Catches common JS runtime errors and replaces with comical Serbian equivalents

interface ErrorPattern {
  pattern: RegExp;
  message: string | ((match: RegExpMatchArray) => string);
}

const errorPatterns: ErrorPattern[] = [
  {
    pattern: /(\w+) is not defined/,
    message: (m) => `Брате, "${m[1]}" не постоји. Јел си заборавио да га направиш?`,
  },
  {
    pattern: /(\w+) is not a function/,
    message: (m) => `"${m[1]}" није функција, него нека глупост. Провери шта радиш.`,
  },
  {
    pattern: /Cannot read propert(?:y|ies) of (undefined|null)/,
    message: (m) => `Покушаваш да читаш из ${m[1] === 'undefined' ? 'нечег што не постоји' : 'ништавила'}. Класична грешка.`,
  },
  {
    pattern: /Assignment to constant variable/,
    message: () => `Брате, заклео си се. Не можеш сад назад. (заклето = const)`,
  },
  {
    pattern: /Unexpected token/,
    message: () => `Компајлер: Јел ти ово озбиљно? Нешто си крупно зезнуо у синтакси.`,
  },
  {
    pattern: /SyntaxError/,
    message: () => `Синтаксна грешка — као да си писао код после треће ракије.`,
  },
  {
    pattern: /TypeError/,
    message: () => `Брате, типови ти се не слажу. Ово није тако тешко.`,
  },
  {
    pattern: /RangeError/,
    message: () => `Изашао си из опсега. Као кад наручиш 47. пиво — нема толико.`,
  },
  {
    pattern: /ReferenceError/,
    message: () => `Референцираш нешто што не постоји. Као фантомски голман.`,
  },
  {
    pattern: /Maximum call stack size exceeded/,
    message: () => `Бесконачна рекурзија! Ушао си у зачарани круг као кад причаш са таштом.`,
  },
  {
    pattern: /Cannot access '(\w+)' before initialization/,
    message: (m) => `"${m[1]}" још није спреман. Стрпи се, као за ред у пошти.`,
  },
  {
    pattern: /is not iterable/,
    message: () => `Ово не може да се итерира. Не можеш да пребројиш нешто што нема ред.`,
  },
];

/**
 * Translate a JavaScript error message to a comical Serbian equivalent.
 * If no pattern matches, returns the original message with a Serbian prefix.
 */
export function translateError(errorMessage: string): string {
  for (const { pattern, message } of errorPatterns) {
    const match = errorMessage.match(pattern);
    if (match) {
      const translated = typeof message === 'function' ? message(match) : message;
      return `🔥 ГРЕШКА: ${translated}`;
    }
  }

  return `🔥 ГРЕШКА: ${errorMessage}`;
}

/**
 * Process stderr output, translating error messages line by line.
 */
export function translateStderr(stderr: string): string {
  return stderr
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      // Only translate lines that look like error messages
      if (/Error|error|TypeError|RangeError|ReferenceError|SyntaxError/.test(trimmed)) {
        return translateError(trimmed);
      }
      // Skip stack trace lines
      if (trimmed.startsWith('at ')) return null;
      if (trimmed.startsWith('Node.js')) return null;
      return line;
    })
    .filter(line => line !== null)
    .join('\n');
}
