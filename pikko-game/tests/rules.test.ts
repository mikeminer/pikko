import { describe, expect, it } from 'vitest';
import { FOOD_BY_ID, type Food } from '../src/data/foods';
import { applyBite, applyWater, CAPACITY, finishRun, MAX_ROUNDS, newRun, outcomeOf, reactionFor, shouldDodge } from '../src/sim/rules';

const f = (id: string): Food => { const x = FOOD_BY_ID.get(id); if (!x) throw new Error(id); return x; };
const fake = (id: string, grade: Food['grade'], kcal: number): Food => ({ id, grade, kcal, name: { en: id, it: id, pl: id }, qty: 1, unit: 'g', cat: 'x', bag: 'test' });

describe('scoring', () => {
  it('grade multiplier and choice bonus', () => {
    const s = newRun();
    const r = applyBite(s, f('apple'), f('donut'), { round: 1 });
    expect(r.gradeMult).toBe(1.5);
    expect(r.choiceBonus).toBe(100); // A vs E = 4 grades x 25
    expect(r.points).toBe(150 + 100);
    expect(s.kcal).toBe(95);
  });
  it('no choice bonus on timeout or when the worse food is chosen', () => {
    const s = newRun();
    expect(applyBite(s, f('apple'), f('donut'), { round: 1, timeout: true }).choiceBonus).toBe(0);
    expect(applyBite(s, f('donut'), f('apple'), { round: 2 }).choiceBonus).toBe(0);
  });
  it('healthy streak raises the combo up to x2 and junk resets it', () => {
    const s = newRun();
    const mults: number[] = [];
    for (let i = 0; i < 12; i++) mults.push(applyBite(s, fake(`h${i}`, 'A', 10), null, { round: i + 1 }).comboMult);
    expect(mults.slice(0, 3)).toEqual([1, 1.1, 1.2]);
    expect(Math.max(...mults)).toBe(2);
    applyBite(s, fake('j', 'E', 10), null, { round: 13 });
    expect(s.combo).toBe(0);
  });
  it('third time the same food is worth half', () => {
    const s = newRun();
    const a = fake('same', 'A', 10);
    applyBite(s, a, null, { round: 1 });
    applyBite(s, a, null, { round: 2 });
    const r = applyBite(s, a, null, { round: 3 });
    expect(r.repeatMult).toBe(0.5);
    expect(r.bored).toBe(true);
  });
  it('colour groups and rainbow bonus', () => {
    const s = newRun();
    const groups = ['red', 'orange', 'yellow', 'green', 'purple', 'white'];
    let rainbow = 0;
    groups.forEach((g, i) => { rainbow += applyBite(s, fake(`c${i}`, 'A', 10), null, { round: i + 1, colorGroup: g }).rainbowBonus; });
    expect(rainbow).toBe(500);
    expect(applyBite(s, fake('c9', 'A', 10), null, { round: 7, colorGroup: 'red' }).colorBonus).toBe(0);
  });
  it('water gives points without kcal', () => {
    const s = newRun();
    expect(applyWater(s)).toBe(25);
    expect(s.kcal).toBe(0);
  });
});

describe('habit (GDD 4.5)', () => {
  it('3 junk in a row -> junk habit; junk always penalised; healthy keeps full points; reset bonus', () => {
    const s = newRun();
    const junk = [fake('j1', 'E', 50), fake('j2', 'E', 50), fake('j3', 'E', 50), fake('j4', 'E', 50)];
    expect(applyBite(s, junk[0], null, { round: 1 }).habitMult).toBe(1);
    applyBite(s, junk[1], null, { round: 2 });
    const third = applyBite(s, junk[2], null, { round: 3 });
    expect(third.habitAfter).toBe('junk');
    const fourth = applyBite(s, junk[3], null, { round: 4 });
    expect(fourth.reaction).toBe('greedy');
    expect(fourth.habitMult).toBe(0.5);
    expect(fourth.points).toBe(Math.round(100 * 0.25 * 0.5));

    const h1 = applyBite(s, fake('h1', 'A', 10), null, { round: 5 });
    expect(h1.reaction).toBe('yum_reluctant');
    expect(h1.habitMult).toBe(1);
    expect(h1.points).toBe(150); // full points even while grimacing
    applyBite(s, fake('h2', 'A', 10), null, { round: 6 });
    const h3 = applyBite(s, fake('h3', 'A', 10), null, { round: 7 });
    expect(h3.resetBonus).toBe(300);
    expect(h3.habitAfter).toBe('healthy');
  });
  it('one or two opposite bites do not change the habit', () => {
    const s = newRun();
    for (let i = 0; i < 3; i++) applyBite(s, fake(`h${i}`, 'A', 10), null, { round: i + 1 });
    expect(s.habit).toBe('healthy');
    applyBite(s, fake('j1', 'E', 10), null, { round: 4 });
    applyBite(s, fake('j2', 'E', 10), null, { round: 5 });
    expect(s.habit).toBe('healthy');
    const r = applyBite(s, fake('h9', 'A', 10), null, { round: 6 });
    expect(r.habitAfter).toBe('healthy');
  });
  it('junk while healthy-habituated is a mega bleah and half points', () => {
    const s = newRun();
    for (let i = 0; i < 3; i++) applyBite(s, fake(`h${i}`, 'A', 10), null, { round: i + 1 });
    const r = applyBite(s, fake('j', 'E', 10), null, { round: 4 });
    expect(r.reaction).toBe('bleah_mega');
    expect(r.habitMult).toBe(0.5);
  });
  it('grade C does not move the habit counters', () => {
    const s = newRun();
    applyBite(s, fake('j1', 'E', 10), null, { round: 1 });
    applyBite(s, fake('j2', 'E', 10), null, { round: 2 });
    applyBite(s, f('juice'), null, { round: 3 });
    expect(s.consecJunk).toBe(2);
    expect(reactionFor('C', 'neutral')).toBe('meh');
  });
  it('dodge target flips with the junk habit', () => {
    expect(shouldDodge('E', 'neutral')).toBe(true);
    expect(shouldDodge('A', 'neutral')).toBe(false);
    expect(shouldDodge('A', 'junk')).toBe(true);
    expect(shouldDodge('E', 'junk')).toBe(false);
    expect(shouldDodge('E', 'healthy')).toBe(true);
  });
});

describe('end of game', () => {
  it('belly full ends the run; victory needs >= 50% healthy kcal', () => {
    const s = newRun();
    applyBite(s, fake('h', 'A', 1000), null, { round: 1 });
    const r = applyBite(s, fake('j', 'E', 1000), null, { round: 2 });
    expect(r.ended).toBe(true);
    expect(s.kcal).toBe(CAPACITY);
    expect(s.outcome).toBe('victory'); // exactly 50%
  });
  it('mostly junk is a defeat', () => {
    const s = newRun();
    applyBite(s, fake('h', 'A', 900), null, { round: 1 });
    applyBite(s, fake('j', 'E', 1200), null, { round: 2 });
    expect(s.outcome).toBe('defeat');
  });
  it('round 40 without filling is a perfect day', () => {
    const s = newRun();
    const r = applyBite(s, fake('h', 'A', 10), null, { round: MAX_ROUNDS });
    expect(r.perfectDayBonus).toBe(1000);
    expect(s.perfectDay).toBe(true);
    expect(s.outcome).toBe('victory');
  });
  it('finishRun computes the outcome and blocks further bites', () => {
    const s = newRun();
    applyBite(s, fake('j', 'E', 300), null, { round: 1 });
    finishRun(s);
    expect(outcomeOf(s)).toBe('defeat');
    expect(() => applyBite(s, fake('h', 'A', 10), null, { round: 2 })).toThrow();
  });
  it('example runs: all-healthy scores far above all-junk (GDD 4.3)', () => {
    const healthy = newRun();
    let round = 1;
    const hf = ['apple', 'carrot', 'broccoli', 'strawberries', 'orange', 'tomato', 'kiwi', 'blueberries', 'yogurt', 'egg', 'banana', 'avocado', 'salmon', 'chickpeas', 'oats', 'wholebread', 'almonds'].map(f);
    while (!healthy.ended) applyBite(healthy, hf[(round - 1) % hf.length], f('donut'), { round: round++, colorGroup: null });
    const junk = newRun();
    round = 1;
    const jf = ['donut', 'fries', 'cheeseburger', 'cola', 'chips', 'chocobar', 'hotdog', 'pizza', 'milkshake'].map(f);
    while (!junk.ended) applyBite(junk, jf[(round - 1) % jf.length], null, { round: round++ });
    expect(healthy.score).toBeGreaterThan(junk.score * 20);
    expect(healthy.outcome).toBe('victory');
    expect(junk.outcome).toBe('defeat');
  });
});
