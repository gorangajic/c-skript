import { getAllMappings, forEachIn, forEachInReplacement } from './keywords.js';

interface Segment {
  text: string;
  isCode: boolean;
}

/**
 * Walk the source and split it into code vs non-code segments.
 * Non-code = strings (single/double/backtick) and comments (// and block).
 * Template literal expressions ${...} are treated as code zones.
 */
export function tokenizeZones(source: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  let current = '';
  let inCode = true;

  function push(text: string, isCode: boolean) {
    if (text.length > 0) {
      segments.push({ text, isCode });
    }
  }

  while (i < source.length) {
    if (inCode) {
      // Check for single-line comment
      if (source[i] === '/' && source[i + 1] === '/') {
        push(current, true);
        current = '';
        const start = i;
        while (i < source.length && source[i] !== '\n') {
          i++;
        }
        push(source.slice(start, i), false);
        continue;
      }

      // Check for multi-line comment
      if (source[i] === '/' && source[i + 1] === '*') {
        push(current, true);
        current = '';
        const start = i;
        i += 2;
        while (i < source.length && !(source[i - 1] === '*' && source[i] === '/')) {
          i++;
        }
        i++; // skip closing /
        push(source.slice(start, i), false);
        continue;
      }

      // Check for string literals (single or double quote)
      if (source[i] === '"' || source[i] === "'") {
        push(current, true);
        current = '';
        const quote = source[i];
        const start = i;
        i++; // skip opening quote
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') {
            i++; // skip escaped char
          }
          i++;
        }
        i++; // skip closing quote
        push(source.slice(start, i), false);
        continue;
      }

      // Check for template literal
      if (source[i] === '`') {
        push(current, true);
        current = '';
        i++; // skip opening backtick
        const templateParts = parseTemplateLiteral(source, i);
        segments.push(...templateParts.segments);
        i = templateParts.endIndex;
        continue;
      }

      current += source[i];
      i++;
    }
  }

  push(current, true);
  return segments;
}

/**
 * Parse a template literal starting after the opening backtick.
 * Returns segments and the index after the closing backtick.
 */
function parseTemplateLiteral(source: string, startIndex: number): { segments: Segment[]; endIndex: number } {
  const segments: Segment[] = [];
  let i = startIndex;
  let textPart = '`';

  while (i < source.length) {
    if (source[i] === '\\') {
      textPart += source[i] + (source[i + 1] || '');
      i += 2;
      continue;
    }

    if (source[i] === '$' && source[i + 1] === '{') {
      textPart += '${';
      segments.push({ text: textPart, isCode: false });
      textPart = '';
      i += 2;

      // Parse the expression inside ${} as code
      let braceDepth = 1;
      let exprCode = '';
      while (i < source.length && braceDepth > 0) {
        if (source[i] === '{') braceDepth++;
        if (source[i] === '}') braceDepth--;
        if (braceDepth > 0) {
          exprCode += source[i];
        }
        i++;
      }
      segments.push({ text: exprCode, isCode: true });
      textPart = '}';
      continue;
    }

    if (source[i] === '`') {
      textPart += '`';
      segments.push({ text: textPart, isCode: false });
      i++; // skip closing backtick
      return { segments, endIndex: i };
    }

    textPart += source[i];
    i++;
  }

  // Unterminated template literal — push what we have
  segments.push({ text: textPart, isCode: false });
  return { segments, endIndex: i };
}

// Cyrillic Unicode ranges for word boundary detection
const CYRILLIC_REGEX = /[\u0400-\u04FF\u0500-\u052F]/;
const WORD_CHAR_REGEX = /[\w\u0400-\u04FF\u0500-\u052F]/;

function isWordChar(ch: string): boolean {
  return WORD_CHAR_REGEX.test(ch);
}

/**
 * Split a code segment into tokens, preserving all whitespace and operators.
 * Tokens are either "word" tokens (alphanumeric + Cyrillic) or "separator" tokens.
 */
function splitIntoTokens(code: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < code.length) {
    if (isWordChar(code[i])) {
      let word = '';
      while (i < code.length && isWordChar(code[i])) {
        word += code[i];
        i++;
      }
      tokens.push(word);
    } else {
      let sep = '';
      while (i < code.length && !isWordChar(code[i])) {
        sep += code[i];
        i++;
      }
      tokens.push(sep);
    }
  }

  return tokens;
}

/**
 * Replace keywords in a code string.
 * Uses Object.hasOwn to avoid prototype pollution (e.g. "constructor").
 * Handles заСваког context: "у" → "of" only after заСваког keyword.
 */
function replaceKeywords(code: string, mappings: Record<string, string>): string {
  const tokens = splitIntoTokens(code);
  let inForEach = false;
  return tokens.map(token => {
    if (token === 'заСваког') {
      inForEach = true;
    }
    if (inForEach && token === forEachIn) {
      inForEach = false;
      return forEachInReplacement;
    }
    if (Object.hasOwn(mappings, token)) {
      return mappings[token];
    }
    return token;
  }).join('');
}

/**
 * Main transpile function: takes ћ-скрипт source, returns JavaScript.
 */
export function transpile(source: string): string {
  const mappings = getAllMappings();

  const segments = tokenizeZones(source);

  return segments.map(segment => {
    if (segment.isCode) {
      return replaceKeywords(segment.text, mappings);
    }
    return segment.text;
  }).join('');
}
