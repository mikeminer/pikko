// Seeded round/pair generation (GDD §5).
import { BASE_BAG, type Food, bagById, isHealthy, isJunk } from '../data/foods';
import type { Habit } from './rules';

export type Phase = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export const PHASE_TIMER: Record<Phase, number> = { breakfast: 0, lunch: 8, snack: 7, dinner: 6 };
export const PHASE_DODGES: Record<Phase, number> = { breakfast: 1, lunch: 2, snack: 2, dinner: 3 };

export function phaseOf(round: number): Phase {
  if (round <= 5) return 'breakfast';
  if (round <= 15) return 'lunch';
  if (round <= 22) return 'snack';
  return 'dinner';
}

export type Rng = () => number;
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function dailySeed(date = new Date()): { seed: number; label: string; number: number } {
  const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const epoch = Date.UTC(2026, 9, 1);
  const number = Math.max(1, Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - epoch) / 86400000) + 1);
  return { seed: hashSeed(`pikko-daily-${label}`), label, number };
}

export interface Pool { bagHealthy: Food[]; bagJunk: Food[]; baseHealthy: Food[]; baseJunk: Food[]; baseNeutral: Food[]; bagShare: number }

/** A bag run uses ~70% bag foods and ~30% Starter Bag foods (GDD §13.2). */
export function buildPool(bagId: string | null): Pool {
  const base = BASE_BAG.foods;
  const bag = bagId && bagId !== 'base' ? bagById(bagId).foods : [];
  return {
    bagHealthy: bag.filter((f) => isHealthy(f.grade)),
    bagJunk: bag.filter((f) => isJunk(f.grade)),
    baseHealthy: base.filter((f) => isHealthy(f.grade)),
    baseJunk: base.filter((f) => isJunk(f.grade)),
    baseNeutral: base.filter((f) => f.grade === 'C'),
    bagShare: bag.length ? 0.7 : 0,
  };
}

const pick = <T>(rng: Rng, xs: T[]): T => xs[Math.floor(rng() * xs.length) % xs.length];

function draw(rng: Rng, pool: Pool, kind: 'healthy' | 'junk', avoid: Set<string>, filter?: (f: Food) => boolean): Food {
  const fromBag = rng() < pool.bagShare;
  const lists = kind === 'healthy'
    ? (fromBag ? [pool.bagHealthy, pool.baseHealthy] : [pool.baseHealthy, pool.bagHealthy])
    : (fromBag ? [pool.bagJunk, pool.baseJunk] : [pool.baseJunk, pool.bagJunk]);
  for (const strict of [true, false]) {
    for (const list of lists) {
      const ok = list.filter((f) => !avoid.has(f.id) && (!strict || !filter || filter(f)));
      if (ok.length) return pick(rng, ok);
    }
  }
  return pick(rng, lists[0].length ? lists[0] : lists[1]);
}

/**
 * Next pair of foods. Rules: two distinct foods; avoid foods of the previous rounds;
 * when Pikko is used to junk there is always a healthy way out (GDD §4.5 rule 3).
 */
export function nextPair(rng: Rng, round: number, habit: Habit, pool: Pool, recent: Set<string>): [Food, Food] {
  const phase = phaseOf(round);
  const avoid = new Set(recent);
  const r = rng();
  let a: Food;
  let b: Food;
  const H = (filter?: (f: Food) => boolean) => { const f = draw(rng, pool, 'healthy', avoid, filter); avoid.add(f.id); return f; };
  const J = (filter?: (f: Food) => boolean) => { const f = draw(rng, pool, 'junk', avoid, filter); avoid.add(f.id); return f; };
  switch (phase) {
    case 'breakfast':
      a = H((f) => f.grade === 'A'); b = J((f) => f.grade === 'E');
      break;
    case 'lunch':
      a = H(); b = J();
      break;
    case 'snack':
      if (r < 0.5) { a = H(); b = J((f) => f.kcal <= a.kcal * 1.6 + 60); } // "trap": similar calories
      else if (r < 0.7 && pool.baseNeutral.length && !avoid.has(pool.baseNeutral[0].id)) { a = H(); b = pool.baseNeutral[0]; avoid.add(b.id); }
      else { a = H(); b = J(); }
      break;
    default:
      if (r < 0.4) { a = H(); b = H((f) => Math.abs(f.kcal - a.kcal) > 40); }
      else if (r < 0.7 && habit !== 'junk') { a = J(); b = J(); }
      else { a = H(); b = J(); }
  }
  if (a.id === b.id) b = J();
  return rng() < 0.5 ? [a, b] : [b, a];
}
