export interface Rng {
  /** Returns a float in [0, 1). */
  next(): number;
  /** Internal state; passing it back to `createRng` resumes the same sequence. */
  state(): number;
}

/** Seedable PRNG using the mulberry32 algorithm. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return {
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    state() {
      return a;
    },
  };
}

export function randomInt(rng: Rng, maxExclusive: number): number {
  return Math.floor(rng.next() * maxExclusive);
}

/** Reads `?seed=<number>` from a query string. Returns null when absent or invalid. */
export function parseSeed(search: string): number | null {
  const raw = new URLSearchParams(search).get('seed');
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value)) return null;
  return value >>> 0;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}
