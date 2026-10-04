// The tutorial's structure and texts must stay complete: practice foods exist (and are what the coach says they are),
// every card has a title/body in every language, and the grown-ups card is the only optional one.
import { describe, expect, it } from 'vitest';
import { FOOD_BY_ID, isHealthy, isJunk, LANGS } from '../src/data/foods';
import { STRINGS } from '../src/i18n/strings';
import { PRACTICE_SCRIPT, STEPS } from '../src/ui/tutorial';

type Loc = { ui: Record<string, string> };
const locales = import.meta.glob<Loc>('../src/i18n/locales/*.json', { eager: true, import: 'default' });
const uiFor = (l: string): Record<string, string> => (l in STRINGS ? (STRINGS as unknown as Record<string, Record<string, string>>)[l] : locales[`../src/i18n/locales/${l}.json`]?.ui) ?? {};

describe('tutorial', () => {
  it('practice rounds use real starter foods: round 1 donut/apple, round 2 broccoli/chocolate bar', () => {
    expect(PRACTICE_SCRIPT).toHaveLength(2);
    for (const pair of PRACTICE_SCRIPT) {
      expect(pair).toHaveLength(2);
      const [a, b] = pair.map((id) => FOOD_BY_ID.get(id)!);
      expect(a, pair.join()).toBeDefined();
      expect(b).toBeDefined();
      // each pair has exactly one healthy and one junk food, so "which is healthy?" has a clear answer
      expect([isHealthy(a.grade), isHealthy(b.grade)].filter(Boolean)).toHaveLength(1);
      expect([isJunk(a.grade), isJunk(b.grade)].filter(Boolean)).toHaveLength(1);
    }
  });

  it('steps: cards first, two practice rounds after the belly card, only the PASTA card is grown-ups-only', () => {
    expect(STEPS[0]).toMatchObject({ kind: 'card', id: 'tut1' });
    expect(STEPS.filter((s) => s.kind === 'practice').map((s) => (s as { round: number }).round)).toEqual([1, 2]);
    expect(STEPS[2].kind).toBe('practice');
    expect(STEPS[3].kind).toBe('practice');
    const adults = STEPS.filter((s) => s.kind === 'card' && s.adultsOnly);
    expect(adults).toHaveLength(1);
    expect(adults[0]).toMatchObject({ id: 'tut7' });
    expect(STEPS.at(-1)).toMatchObject({ kind: 'card', id: 'tut9' });
  });

  it('every card, coach line and button has text in all 20 languages; placeholders are kept', () => {
    const keys = [
      'tut_how', 'tut_next', 'tut_back', 'tut_skip', 'tut_start', 'tut_again', 'tut_count', 'tut_coach_skip',
      'tutP1', 'tutP1_good', 'tutP1_bad', 'tutP2', 'tutP2_junk', 'tutP2_healthy',
      ...STEPS.flatMap((s) => (s.kind === 'card' ? [`${s.id}_t`, `${s.id}_b`] : [])),
    ];
    expect(LANGS).toHaveLength(20);
    for (const l of LANGS) {
      const ui = uiFor(l);
      for (const k of keys) expect(typeof ui[k] === 'string' && ui[k].trim() !== '', `${l}.${k}`).toBe(true);
      expect(ui.tut7_b, l).toContain('{amount}');
      expect(ui.tut_count, l).toMatch(/\{n\}.*\{t\}/);
    }
  });
});
