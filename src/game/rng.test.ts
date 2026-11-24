import { describe, expect, it } from 'vitest';
import { createRng, parseSeed } from './rng';

function take(seed: number, count: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng.next());
}

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    expect(take(42, 20)).toEqual(take(42, 20));
  });

  it('produces different sequences for different seeds', () => {
    expect(take(1, 5)).not.toEqual(take(2, 5));
  });

  it('returns values in [0, 1)', () => {
    for (const value of take(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('resumes the same sequence from a saved state', () => {
    const rng = createRng(99);
    rng.next();
    rng.next();
    const resumed = createRng(rng.state());
    expect(resumed.next()).toBe(rng.next());
  });
});

describe('parseSeed', () => {
  it('reads an integer seed', () => {
    expect(parseSeed('?seed=123')).toBe(123);
  });

  it('returns null when the seed is missing or invalid', () => {
    expect(parseSeed('')).toBeNull();
    expect(parseSeed('?seed=')).toBeNull();
    expect(parseSeed('?seed=abc')).toBeNull();
    expect(parseSeed('?seed=1.5')).toBeNull();
  });
});
