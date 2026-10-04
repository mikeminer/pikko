// Every extra language must be complete: all UI keys (same {placeholders}), every food and every bag.
import { describe, expect, it } from 'vitest';
import { ALL_BAGS, isBaseLang, LANG_META, LANGS, WATER } from '../src/data/foods';
import { STRINGS } from '../src/i18n/strings';

type Loc = { ui: Record<string, string>; foods: Record<string, string>; bags: Record<string, { name: string; accessory: string; fact: string }> };
const files = import.meta.glob<Loc>('../src/i18n/locales/*.json', { eager: true, import: 'default' });
const locFor = (l: string): Loc | undefined => files[`../src/i18n/locales/${l}.json`];
const extra = LANGS.filter((l) => !isBaseLang(l));
const foodIds = [...ALL_BAGS.flatMap((b) => b.foods.map((f) => f.id)), WATER.id];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const uiKeys = Object.keys(STRINGS.en).filter((k) => !/^bites_(one|few|many|two|zero)$/.test(k));

describe('locales', () => {
  it('every language has its own existing home bag', () => {
    const homes = LANGS.map((l) => LANG_META[l].bag);
    expect(homes.filter((b) => !ALL_BAGS.some((x) => x.id === b && b !== 'base'))).toEqual([]);
    expect(new Set(homes).size).toBe(LANGS.length);
  });
  it('there is a locale file for every extra language', () => {
    for (const l of extra) expect(locFor(l), l).toBeDefined();
  });
  for (const l of extra) {
    const loc = locFor(l);
    if (!loc) continue;
    it(`${l}: UI keys complete with the same placeholders`, () => {
      const missing = uiKeys.filter((k) => typeof loc.ui[k] !== 'string' || !loc.ui[k].trim());
      expect(missing, `${l} missing`).toEqual([]);
      const bad = uiKeys.filter((k) => k !== 'bites_other' && placeholders(loc.ui[k]) !== placeholders(STRINGS.en[k as keyof typeof STRINGS.en]));
      expect(bad, `${l} placeholder mismatch`).toEqual([]);
      expect(loc.ui.bites_other).toContain('{n}');
    });
    it(`${l}: all foods and bags translated`, () => {
      const missingFoods = foodIds.filter((id) => typeof loc.foods[id] !== 'string' || !loc.foods[id].trim());
      expect(missingFoods, `${l} foods`).toEqual([]);
      const extraFoods = Object.keys(loc.foods).filter((id) => !foodIds.includes(id));
      expect(extraFoods, `${l} unknown food ids`).toEqual([]);
      for (const b of ALL_BAGS) {
        const e = loc.bags[b.id];
        expect(e && e.name && e.accessory && e.fact, `${l} bag ${b.id}`).toBeTruthy();
      }
    });
  }
});
