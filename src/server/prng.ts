/**
 * Seedable Pseudo-Random Number Generator (PRNG)
 * Uses the Mulberry32 algorithm for deterministic, reproducible simulation scenarios.
 * Allows replaying identical traffic events, occupancy spikes, and sensor conditions.
 */

export interface PRNG {
  next(): number; // [0, 1)
  range(min: number, max: number): number;
  int(min: number, max: number): number;
  boolean(probability?: number): boolean;
  choice<T>(array: T[]): T;
  poisson(lambda: number): number;
  getSeed(): number;
  reseed(seed: number | string): void;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

export function createPRNG(initialSeed: number | string = 1337): PRNG {
  let currentSeed: number = typeof initialSeed === 'string' ? stringToSeed(initialSeed) : (initialSeed >>> 0);

  function mulberry32(): number {
    currentSeed |= 0;
    currentSeed = (currentSeed + 0x6d2b79f5) | 0;
    let t = Math.imul(currentSeed ^ (currentSeed >>> 15), 1 | currentSeed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next(): number {
      return mulberry32();
    },
    range(min: number, max: number): number {
      return min + mulberry32() * (max - min);
    },
    int(min: number, max: number): number {
      return Math.floor(min + mulberry32() * (max - min + 1));
    },
    boolean(probability = 0.5): boolean {
      return mulberry32() < probability;
    },
    choice<T>(array: T[]): T {
      if (array.length === 0) throw new Error('Cannot choose from an empty array');
      const idx = Math.floor(mulberry32() * array.length);
      return array[idx];
    },
    poisson(lambda: number): number {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= mulberry32();
      } while (p > L);
      return k - 1;
    },
    getSeed(): number {
      return currentSeed;
    },
    reseed(seed: number | string): void {
      currentSeed = typeof seed === 'string' ? stringToSeed(seed) : (seed >>> 0);
    },
  };
}

export const globalSimPRNG = createPRNG(42);
