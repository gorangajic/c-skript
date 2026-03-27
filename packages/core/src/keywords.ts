// Serbian → JavaScript keyword mappings

export const keywords: Record<string, string> = {
  // Variables & constants
  'нека': 'let',
  'заклето': 'const',

  // Control flow
  'ако': 'if',
  'иначе': 'else',
  'док': 'while',
  'за': 'for',
  'заСваког': 'for',
  'прекини': 'break',
  'настави': 'continue',
  'случај': 'switch',
  'кад': 'case',
  'подразумевано': 'default',

  // Functions & classes
  'функција': 'function',
  'врати': 'return',
  'класа': 'class',
  'наслеђује': 'extends',
  'ово': 'this',
  'супер': 'super',
  'прави': 'new',

  // Error handling
  'покушај': 'try',
  'ухвати': 'catch',
  'наКрају': 'finally',
  'баци': 'throw',

  // Modules
  'увези': 'import',
  'извези': 'export',
  'из': 'from',
  'као': 'as',

  // Async
  'чекај': 'await',
  'асинхроно': 'async',

  // Literals
  'тачно': 'true',
  'нетачно': 'false',
  'ништа': 'null',
  'нијеНишта': 'undefined',
};

export const types: Record<string, string> = {
  'број': 'number',
  'реч': 'string',
  'истина': 'boolean',
  'низ': 'Array',
  'објекат': 'object',
  'празно': 'void',
  'никад': 'never',
  'билоШта': 'any',
  'непознато': 'unknown',
};

export const builtins: Record<string, string> = {
  'кажи': 'console.log',
  'дериСе': 'console.warn',
  'кукај': 'console.error',
};

// Special syntax: заСваког (нека X у Y) → for (let X of Y)
// The keyword "у" inside заСваког loops maps to "of"
export const forEachIn = 'у';
export const forEachInReplacement = 'of';

// Combined map for the transpiler (all mappings merged)
export function getAllMappings(): Record<string, string> {
  return { ...keywords, ...types, ...builtins };
}
