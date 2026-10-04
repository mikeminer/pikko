import { type Bag, bagById, type Food, isBaseLang, type Lang, LANG_META, LANGS } from '../data/foods';
import { store } from '../storage';
import { STRINGS } from './strings';

/** Extra languages live in ./locales/<lang>.json and are loaded on demand (machine translation, native review pending). */
export interface Locale {
  lang: string;
  review: string;
  ui: Record<string, string>;
  bags: Record<string, { name: string; accessory: string; fact: string }>;
  foods: Record<string, string>;
}
const loaders = import.meta.glob<Locale>('./locales/*.json', { import: 'default' });
const loaded = new Map<Lang, Locale>();

let lang: Lang = 'en';

export function detect(): Lang {
  const saved = store.get<string>('lang');
  if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang;
  for (const pref of navigator.languages ?? [navigator.language || 'en']) {
    const base = pref.split('-')[0].toLowerCase();
    const code = base === 'tl' ? 'fil' : base; // Tagalog browsers -> Filipino
    if ((LANGS as readonly string[]).includes(code)) return code as Lang;
  }
  return 'en';
}

export function getLang(): Lang { return lang; }

export async function setLang(l: Lang): Promise<void> {
  if (!isBaseLang(l) && !loaded.has(l)) {
    const load = loaders[`./locales/${l}.json`];
    if (!load) l = 'en';
    else loaded.set(l, await load());
  }
  lang = l;
  store.set('lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = LANG_META[l].dir;
}

export const initLang = (): Promise<void> => setLang(detect());

/** Language used for recorded voice lines (only EN/IT/PL exist so far). */
export function voiceLang(): 'en' | 'it' | 'pl' { return isBaseLang(lang) ? lang : 'en'; }

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const s = (isBaseLang(lang) ? STRINGS[lang][key] : loaded.get(lang)?.ui[key]) ?? STRINGS.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Plural-aware lookup: `${base}_${category}` with Intl.PluralRules (PL/AR have more categories). */
export function tp(base: string, n: number): string {
  const cat = new Intl.PluralRules(LANG_META[lang].locale).select(n);
  const dict = isBaseLang(lang) ? STRINGS[lang] : loaded.get(lang)?.ui ?? {};
  const key = dict[`${base}_${cat}`] !== undefined ? `${base}_${cat}` : `${base}_other`;
  return t(key, { n: num(n) });
}

const nf = new Map<Lang, Intl.NumberFormat>();
export function num(n: number): string {
  if (!nf.has(lang)) nf.set(lang, new Intl.NumberFormat(LANG_META[lang].locale));
  return nf.get(lang)!.format(Math.round(n));
}

export function foodName(f: Food): string {
  return isBaseLang(lang) ? f.name[lang] : loaded.get(lang)?.foods[f.id] ?? f.name.en;
}
export function bagName(b: Bag): string {
  return isBaseLang(lang) ? b.name[lang] : loaded.get(lang)?.bags[b.id]?.name ?? b.name.en;
}
export function bagAccessory(b: Bag): string {
  return isBaseLang(lang) ? b.accessory[lang] : loaded.get(lang)?.bags[b.id]?.accessory ?? b.accessory.en;
}
export function bagFact(b: Bag): string {
  return isBaseLang(lang) ? b.fact[lang] : loaded.get(lang)?.bags[b.id]?.fact ?? b.fact.en;
}

export function fact(f: Food): string {
  if (f.id === 'water') return t('fact_water');
  if (f.id === 'juice') return t('fact_juice');
  const where = f.bag !== 'base' ? `${bagName(bagById(f.bag))} · ` : '';
  return `${where}${foodName(f)} · ${num(f.kcal)} kcal / ${f.qty} ${f.unit}. ${t('cat_' + f.cat)}`;
}

export function date(ts: number): string {
  return new Intl.DateTimeFormat(LANG_META[lang].locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts * 1000));
}
