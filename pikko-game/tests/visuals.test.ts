import { describe, expect, it } from 'vitest';
import { ALL_BAGS, isHealthy } from '../src/data/foods';
import { visualFor } from '../src/data/visuals';

describe('food visuals', () => {
  const foods = ALL_BAGS.flatMap((b) => b.foods);
  it('covers all 509 foods with few generic fallbacks', () => {
    expect(foods).toHaveLength(509); // 29 starter + 480 expansion (water is the separate power-up)
    const mound = foods.filter((f) => visualFor(f).shape === 'mound');
    if (mound.length) console.log('fallback mound:', mound.map((f) => f.id).join(', '));
    expect(mound.length).toBeLessThan(30);
  });
  it('junk never counts for the rainbow; most healthy foods have a colour group', () => {
    expect(foods.filter((f) => !isHealthy(f.grade)).every((f) => visualFor(f).group === null)).toBe(true);
    const healthy = foods.filter((f) => isHealthy(f.grade));
    const grouped = healthy.filter((f) => visualFor(f).group !== null);
    expect(grouped.length / healthy.length).toBeGreaterThan(0.6);
  });
});
