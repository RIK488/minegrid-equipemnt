import { describe, expect, it } from 'vitest';
import { sanitizeSearchTerm } from './machineSearchSuggest';

describe('sanitizeSearchTerm', () => {
  it('retire les caractères LIKE dangereux', () => {
    expect(sanitizeSearchTerm('ab%cd_ef\\')).toBe('ab cd ef');
  });

  it('tronque et normalise les espaces', () => {
    expect(sanitizeSearchTerm('  hello   world  ')).toBe('hello world');
  });
});
