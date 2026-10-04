import bagsJson from './bags.json';

/** Languages with names stored in the catalogue itself. */
export type BaseLang = 'en' | 'it' | 'pl';
/** All game languages: base + the languages of the 20 country bags (GDD §15). */
export const LANGS = ['en', 'it', 'pl', 'es', 'fr', 'de', 'pt', 'el', 'tr', 'ar', 'hi', 'zh', 'ja', 'ko', 'th', 'vi', 'id', 'ru', 'uk', 'fil'] as const;
export type Lang = (typeof LANGS)[number];
// `bag`: every language has its home country bag (its token), shown first in the Mart and in the language picker.
export const LANG_META: Record<Lang, { native: string; dir: 'ltr' | 'rtl'; locale: string; bag: string }> = {
  en: { native: 'English', dir: 'ltr', locale: 'en-GB', bag: 'uk' },
  it: { native: 'Italiano', dir: 'ltr', locale: 'it-IT', bag: 'italy' },
  pl: { native: 'Polski', dir: 'ltr', locale: 'pl-PL', bag: 'poland' },
  es: { native: 'Español', dir: 'ltr', locale: 'es', bag: 'spain' },
  fr: { native: 'Français', dir: 'ltr', locale: 'fr-FR', bag: 'france' },
  de: { native: 'Deutsch', dir: 'ltr', locale: 'de-DE', bag: 'germany' },
  pt: { native: 'Português', dir: 'ltr', locale: 'pt-BR', bag: 'brazil' },
  el: { native: 'Ελληνικά', dir: 'ltr', locale: 'el-GR', bag: 'greece' },
  tr: { native: 'Türkçe', dir: 'ltr', locale: 'tr-TR', bag: 'turkey' },
  ar: { native: 'العربية', dir: 'rtl', locale: 'ar-MA', bag: 'morocco' },
  hi: { native: 'हिन्दी', dir: 'ltr', locale: 'hi-IN', bag: 'india' },
  zh: { native: '中文', dir: 'ltr', locale: 'zh-CN', bag: 'china' },
  ja: { native: '日本語', dir: 'ltr', locale: 'ja-JP', bag: 'japan' },
  ko: { native: '한국어', dir: 'ltr', locale: 'ko-KR', bag: 'korea' },
  th: { native: 'ไทย', dir: 'ltr', locale: 'th-TH', bag: 'thailand' },
  vi: { native: 'Tiếng Việt', dir: 'ltr', locale: 'vi-VN', bag: 'vietnam' },
  id: { native: 'Bahasa Indonesia', dir: 'ltr', locale: 'id-ID', bag: 'indonesia' },
  ru: { native: 'Русский', dir: 'ltr', locale: 'ru-RU', bag: 'russia' },
  uk: { native: 'Українська', dir: 'ltr', locale: 'uk-UA', bag: 'ukraine' },
  fil: { native: 'Filipino', dir: 'ltr', locale: 'fil-PH', bag: 'philippines' },
};
export const BASE_LANGS: BaseLang[] = ['en', 'it', 'pl'];
export const isBaseLang = (l: string): l is BaseLang => (BASE_LANGS as string[]).includes(l);
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';
export type Unit = 'g' | 'ml';

export interface Food {
  id: string;
  name: Record<BaseLang, string>;
  kcal: number;
  qty: number;
  unit: Unit;
  grade: Grade;
  cat: string;
  bag: string;
}

export interface Bag {
  id: string;
  order: number;
  country: string; // ISO-like code shown on the logo ("PIKKO" for the starter bag)
  mint: string | null;
  name: Record<BaseLang, string>; // country name
  accessory: Record<BaseLang, string>;
  accessoryKind: string;
  fact: Record<BaseLang, string>;
  palette: string[];
  logo: string;
  foods: Food[];
}

export const isHealthy = (g: Grade) => g === 'A' || g === 'B';
export const isJunk = (g: Grade) => g === 'D' || g === 'E';

type Row = [string, string, string, string, number, number, Unit, Grade, string];
const row = (bag: string) => (r: Row): Food => ({
  id: r[0], name: { en: r[1], it: r[2], pl: r[3] }, kcal: r[4], qty: r[5], unit: r[6], grade: r[7], cat: r[8], bag,
});

/** Free Starter Bag (GDD §8). Water is the 0-kcal power-up and is kept apart. */
const BASE_ROWS: Row[] = [
  ['apple', 'Apple', 'Mela', 'Jabłko', 95, 180, 'g', 'A', 'fruit'],
  ['banana', 'Banana', 'Banana', 'Banan', 105, 120, 'g', 'A', 'fruit'],
  ['carrot', 'Carrot', 'Carota', 'Marchewka', 25, 60, 'g', 'A', 'veg'],
  ['broccoli', 'Broccoli', 'Broccoli', 'Brokuł', 35, 100, 'g', 'A', 'veg'],
  ['strawberries', 'Strawberries', 'Fragole', 'Truskawki', 48, 150, 'g', 'A', 'fruit'],
  ['orange', 'Orange', 'Arancia', 'Pomarańcza', 62, 130, 'g', 'A', 'fruit'],
  ['tomato', 'Tomato', 'Pomodoro', 'Pomidor', 22, 120, 'g', 'A', 'veg'],
  ['kiwi', 'Kiwi', 'Kiwi', 'Kiwi', 42, 70, 'g', 'A', 'fruit'],
  ['blueberries', 'Blueberries', 'Mirtilli', 'Borówki', 57, 100, 'g', 'A', 'fruit'],
  ['yogurt', 'Plain yogurt', 'Yogurt bianco', 'Jogurt naturalny', 75, 125, 'g', 'A', 'dairy'],
  ['egg', 'Boiled egg', 'Uovo sodo', 'Jajko na twardo', 78, 50, 'g', 'A', 'protein'],
  ['almonds', 'Almonds', 'Mandorle', 'Migdały', 175, 30, 'g', 'A', 'nuts'],
  ['avocado', 'Avocado', 'Avocado', 'Awokado', 160, 100, 'g', 'A', 'veg'],
  ['salmon', 'Salmon', 'Salmone', 'Łosoś', 205, 100, 'g', 'A', 'protein'],
  ['chickpeas', 'Chickpeas', 'Ceci', 'Ciecierzyca', 165, 100, 'g', 'A', 'legume'],
  ['oats', 'Porridge', "Porridge d'avena", 'Owsianka', 150, 40, 'g', 'A', 'grain'],
  ['wholebread', 'Wholegrain bread', 'Pane integrale', 'Chleb pełnoziarnisty', 75, 30, 'g', 'B', 'grain'],
  ['donut', 'Glazed donut', 'Ciambella glassata', 'Donut z lukrem', 250, 65, 'g', 'E', 'sugar'],
  ['fries', 'French fries', 'Patatine fritte', 'Frytki', 365, 117, 'g', 'E', 'fried'],
  ['cheeseburger', 'Cheeseburger', 'Cheeseburger', 'Cheeseburger', 300, 120, 'g', 'D', 'fatty'],
  ['cola', 'Cola', 'Cola', 'Cola', 140, 330, 'ml', 'E', 'fizzy'],
  ['chips', 'Crisps', 'Patatine in busta', 'Chipsy', 160, 30, 'g', 'E', 'salty'],
  ['chocobar', 'Chocolate bar', 'Barretta al cioccolato', 'Baton czekoladowy', 240, 45, 'g', 'E', 'sugar'],
  ['hotdog', 'Hot dog', 'Hot dog', 'Hot dog', 290, 100, 'g', 'E', 'ultra'],
  ['nuggets', 'Chicken nuggets', 'Crocchette di pollo', 'Nuggetsy', 270, 100, 'g', 'D', 'fried'],
  ['pizza', 'Pepperoni pizza', 'Pizza al salame', 'Pizza z salami', 300, 110, 'g', 'D', 'ultra'],
  ['juice', 'Fruit juice', 'Succo di frutta', 'Sok owocowy', 90, 200, 'ml', 'C', 'sugar'],
  ['fitbar', '"Fitness" bar', 'Barretta "fitness"', 'Baton „fit”', 180, 40, 'g', 'D', 'ultra'],
  ['milkshake', 'Milkshake', 'Frappè', 'Koktajl mleczny', 420, 350, 'ml', 'E', 'sugar'],
];

export const WATER: Food = row('base')(['water', 'Water', 'Acqua', 'Woda', 0, 250, 'ml', 'A', 'water']);

export const BASE_BAG: Bag = {
  id: 'base', order: 0, country: 'PIKKO', mint: null,
  name: { en: 'Starter Bag', it: 'Busta Base', pl: 'Torba Startowa' },
  accessory: { en: 'Classic bib', it: 'Bavaglino classico', pl: 'Klasyczny śliniaczek' },
  accessoryKind: 'none',
  fact: { en: 'Eat the rainbow: every colour brings different vitamins.', it: 'Mangia i colori: ogni colore porta vitamine diverse.', pl: 'Jedz kolorowo: każdy kolor to inne witaminy.' },
  palette: ['#d7263d', '#f6f1e7'],
  logo: 'logos/base.svg',
  foods: BASE_ROWS.map(row('base')),
};

interface BagJson { id: string; order: number; country: string; mint: string | null; name: Record<BaseLang, string>; accessory: Record<BaseLang, string>; accessoryKind: string; fact: Record<BaseLang, string>; palette: string[]; logo: string; foods: Row[] }

/** 20 country bags (GDD §13.2): each with 10 healthy and 10 "sometimes" foods of that cuisine. */
export const EXPANSION_BAGS: Bag[] = (bagsJson as unknown as { bags: BagJson[] }).bags.map((b) => ({
  id: b.id, order: b.order, country: b.country, mint: b.mint, name: b.name, accessory: b.accessory, accessoryKind: b.accessoryKind,
  fact: b.fact, palette: b.palette, logo: b.logo, foods: b.foods.map(row(b.id)),
}));

export const ALL_BAGS: Bag[] = [BASE_BAG, ...EXPANSION_BAGS];
export const FOOD_BY_ID = new Map<string, Food>();
for (const b of ALL_BAGS) for (const f of b.foods) FOOD_BY_ID.set(f.id, f);
FOOD_BY_ID.set(WATER.id, WATER);

export function bagById(id: string): Bag {
  const b = ALL_BAGS.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown bag ${id}`);
  return b;
}
