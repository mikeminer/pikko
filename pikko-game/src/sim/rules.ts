// Pure game rules (GDD §3, §4, §4.5). No rendering, no randomness.
import { type Food, type Grade, isHealthy, isJunk } from '../data/foods';

export const CAPACITY = 2000;
export const MAX_ROUNDS = 40;
export const BASE_POINTS = 100;
export const GRADE_MULT: Record<Grade, number> = { A: 1.5, B: 1.2, C: 1.0, D: 0.5, E: 0.25 };
export const COMBO_STEP = 0.1;
export const COMBO_MAX = 2.0;
export const REPEAT_FROM = 3; // 3rd time the same food -> x0.5
export const HABIT_PENALTY = 0.5;
export const HABIT_SWITCH = 3;
export const RESET_BONUS = 300;
export const COLOR_BONUS = 50;
export const RAINBOW_BONUS = 500;
export const RAINBOW_GROUPS = ['red', 'orange', 'yellow', 'green', 'purple', 'white'] as const;
export const PERFECT_DAY_BONUS = 1000;
export const WATER_POINTS = 25;
export const CHOICE_STEP = 25;
export const VICTORY_SHARE = 0.5;

export type Habit = 'neutral' | 'healthy' | 'junk';
export type Reaction = 'yum' | 'yum_reluctant' | 'bleah' | 'bleah_mega' | 'greedy' | 'meh';
export type Outcome = 'victory' | 'defeat';

export interface BiteLog { id: string; grade: Grade; kcal: number; points: number; reaction: Reaction; timeout: boolean }

export interface RunState {
  kcal: number;
  kcalHealthy: number;
  kcalJunk: number;
  score: number;
  bites: number;
  combo: number; // consecutive A/B bites (GDD "serieSana")
  bestCombo: number;
  habit: Habit;
  consecHealthy: number;
  consecJunk: number;
  eaten: Record<string, number>;
  colors: string[];
  rainbow: boolean;
  resets: number;
  water: number;
  log: BiteLog[];
  ended: boolean;
  perfectDay: boolean;
  outcome: Outcome | null;
}

export function newRun(): RunState {
  return {
    kcal: 0, kcalHealthy: 0, kcalJunk: 0, score: 0, bites: 0, combo: 0, bestCombo: 0, habit: 'neutral',
    consecHealthy: 0, consecJunk: 0, eaten: {}, colors: [], rainbow: false, resets: 0, water: 0, log: [],
    ended: false, perfectDay: false, outcome: null,
  };
}

const RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

export interface BiteResult {
  points: number;
  gradeMult: number;
  comboMult: number;
  repeatMult: number;
  habitMult: number;
  choiceBonus: number;
  colorBonus: number;
  rainbowBonus: number;
  resetBonus: number;
  perfectDayBonus: number;
  reaction: Reaction;
  habitBefore: Habit;
  habitAfter: Habit;
  bored: boolean;
  ended: boolean;
}

export function reactionFor(grade: Grade, habit: Habit): Reaction {
  if (isHealthy(grade)) return habit === 'junk' ? 'yum_reluctant' : 'yum';
  if (isJunk(grade)) return habit === 'healthy' ? 'bleah_mega' : habit === 'junk' ? 'greedy' : 'bleah';
  return 'meh';
}

/** Does Pikko try to dodge this food? Normal: junk. Junk habit: healthy (reversed dodge, GDD §6.2). */
export function shouldDodge(grade: Grade, habit: Habit): boolean {
  if (habit === 'junk') return isHealthy(grade);
  return isJunk(grade);
}

/**
 * Apply one bite. `other` is the food that was not chosen (null if none / power-up).
 * `timeout` means Pikko picked by himself: no choice bonus.
 */
export function applyBite(s: RunState, food: Food, other: Food | null, opts: { timeout?: boolean; colorGroup?: string | null; round: number }): BiteResult {
  if (s.ended) throw new Error('Run already ended');
  const habitBefore = s.habit;
  const g = food.grade;
  const healthy = isHealthy(g);
  const junk = isJunk(g);

  const gradeMult = GRADE_MULT[g];
  const comboMult = healthy ? Math.min(COMBO_MAX, 1 + COMBO_STEP * s.combo) : 1;
  const prevCount = s.eaten[food.id] ?? 0;
  const bored = prevCount + 1 >= REPEAT_FROM;
  const repeatMult = bored ? 0.5 : 1;
  const habitMult = junk && habitBefore !== 'neutral' ? HABIT_PENALTY : 1;
  let choiceBonus = 0;
  if (other && !opts.timeout) {
    const diff = RANK[other.grade] - RANK[g];
    if (diff > 0) choiceBonus = CHOICE_STEP * diff;
  }
  let points = Math.round(BASE_POINTS * gradeMult * comboMult * repeatMult * habitMult) + choiceBonus;

  // combo
  if (healthy) s.combo += 1;
  else if (junk) s.combo = 0;
  s.bestCombo = Math.max(s.bestCombo, s.combo);

  // colors / rainbow (healthy foods only)
  let colorBonus = 0;
  let rainbowBonus = 0;
  if (healthy && opts.colorGroup && !s.colors.includes(opts.colorGroup)) {
    s.colors.push(opts.colorGroup);
    colorBonus = COLOR_BONUS;
    if (!s.rainbow && RAINBOW_GROUPS.every((c) => s.colors.includes(c))) {
      s.rainbow = true;
      rainbowBonus = RAINBOW_BONUS;
    }
  }

  // habit (GDD §4.5): 3 consecutive of a type switch the state; it persists until 3 of the opposite type
  let resetBonus = 0;
  if (healthy) {
    s.consecHealthy += 1;
    s.consecJunk = 0;
    if (s.consecHealthy >= HABIT_SWITCH && s.habit !== 'healthy') {
      if (s.habit === 'junk') { resetBonus = RESET_BONUS; s.resets += 1; }
      s.habit = 'healthy';
    }
  } else if (junk) {
    s.consecJunk += 1;
    s.consecHealthy = 0;
    if (s.consecJunk >= HABIT_SWITCH) s.habit = 'junk';
  }

  points += colorBonus + rainbowBonus + resetBonus;

  s.kcal += food.kcal;
  if (healthy) s.kcalHealthy += food.kcal;
  if (junk) s.kcalJunk += food.kcal;
  s.eaten[food.id] = prevCount + 1;
  s.bites += 1;

  const reaction = reactionFor(g, habitBefore);
  let perfectDayBonus = 0;
  if (s.kcal >= CAPACITY) {
    s.ended = true;
  } else if (opts.round >= MAX_ROUNDS) {
    s.ended = true;
    s.perfectDay = true;
    perfectDayBonus = PERFECT_DAY_BONUS;
    points += perfectDayBonus;
  }
  s.score += points;
  s.log.push({ id: food.id, grade: g, kcal: food.kcal, points, reaction, timeout: !!opts.timeout });
  if (s.ended) s.outcome = outcomeOf(s);

  return { points, gradeMult, comboMult, repeatMult, habitMult, choiceBonus, colorBonus, rainbowBonus, resetBonus,
    perfectDayBonus, reaction, habitBefore, habitAfter: s.habit, bored, ended: s.ended };
}

export function applyWater(s: RunState): number {
  s.water += 1;
  s.score += WATER_POINTS;
  return WATER_POINTS;
}

/** Victory if at least half of the eaten kcal came from A/B foods (the belly bar is "greener than brown"). */
export function outcomeOf(s: RunState): Outcome {
  if (s.kcal <= 0) return 'victory';
  return s.kcalHealthy / s.kcal >= VICTORY_SHARE ? 'victory' : 'defeat';
}

/** End a run early (e.g. daily menu or trial round limit reached). */
export function finishRun(s: RunState): void {
  if (s.ended) return;
  s.ended = true;
  s.outcome = outcomeOf(s);
}
