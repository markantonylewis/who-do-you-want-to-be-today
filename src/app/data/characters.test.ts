import { describe, it, expect } from 'vitest';
import { findCharacter } from './characters';

const id = (q: string) => findCharacter(q, {})?.id ?? null;

describe('findCharacter', () => {
  it('matches dog, not doctor, for "a dog"', () => expect(id('a dog')).toBe('dog'));
  it('does not match star for "are"', () => expect(id('are')).not.toBe('star'));
  it('still matches doctor', () => expect(id('doctor')).toBe('doctor'));
  it('matches firefighter', () => expect(id('I want to be a firefighter')).toBe('firefighter'));
  it('matches lion', () => expect(id('lion')).toBe('lion'));
});
