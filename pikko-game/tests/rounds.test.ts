import { describe, expect, it } from 'vitest';
import { EXPANSION_BAGS, isHealthy, isJunk } from '../src/data/foods';
import { buildPool, dailySeed, mulberry32, nextPair, phaseOf } from '../src/sim/rounds';

describe('rounds', () => {
  it('phases follow GDD §5', () => {
    expect([1, 5, 6, 15, 16, 22, 23, 40].map(phaseOf)).toEqual(['breakfast', 'breakfast', 'lunch', 'lunch', 'snack', 'snack', 'dinner', 'dinner']);
  });
  it('same seed -> same sequence', () => {
    const run = (seed: number) => {
      const rng = mulberry32(seed);
      const pool = buildPool('poland');
      return Array.from({ length: 30 }, (_, i) => nextPair(rng, i + 1, 'neutral', pool, new Set()).map((x) => x.id).join('+'));
    };
    expect(run(42)).toEqual(run(42));
    expect(run(42)).not.toEqual(run(43));
  });
  it('pairs are distinct and avoid recent foods; breakfast is healthy vs junk', () => {
    const rng = mulberry32(7);
    const pool = buildPool(null);
    let recent = new Set<string>();
    for (let round = 1; round <= 40; round++) {
      const [a, b] = nextPair(rng, round, 'neutral', pool, recent);
      expect(a.id).not.toBe(b.id);
      if (round <= 5) {
        expect([a, b].some((x) => isHealthy(x.grade))).toBe(true);
        expect([a, b].some((x) => isJunk(x.grade))).toBe(true);
      }
      recent = new Set([a.id, b.id]);
    }
  });
  it('with the junk habit there is always a healthy way out, in every bag', () => {
    for (const bag of [null, ...EXPANSION_BAGS.map((b) => b.id)]) {
      const rng = mulberry32(99);
      const pool = buildPool(bag);
      for (let round = 1; round <= 40; round++) {
        const pair = nextPair(rng, round, 'junk', pool, new Set());
        expect(pair.some((x) => isHealthy(x.grade))).toBe(true);
      }
    }
  });
  it('bag runs mostly use bag foods', () => {
    const rng = mulberry32(5);
    const pool = buildPool('japan');
    let fromBag = 0;
    let total = 0;
    for (let round = 1; round <= 200; round++) {
      for (const f of nextPair(rng, (round % 40) + 1, 'neutral', pool, new Set())) { total++; if (f.bag === 'japan') fromBag++; }
    }
    expect(fromBag / total).toBeGreaterThan(0.55);
    expect(fromBag / total).toBeLessThan(0.85);
  });
  it('daily seed is stable for a date', () => {
    const d = new Date(2026, 9, 3);
    expect(dailySeed(d)).toEqual(dailySeed(new Date(2026, 9, 3, 23, 59)));
    expect(dailySeed(d).number).toBe(3);
  });
});
