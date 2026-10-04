// In-game tutorial: illustrated cards + two scripted practice rounds on the real 3D scene, with a coach bubble.
// Everything is text from i18n (t); the practice uses the normal game engine through RunConfig.script.
import { PASS_ACCESS } from '../access/bags.config';
import { type Food, isHealthy } from '../data/foods';
import type { Game } from '../game';
import { num, t } from '../i18n';
import { CAPACITY } from '../sim/rules';
import { store } from '../storage';
import { $, button, el } from './dom';

/** Two practice rounds on the starter bag: [junk, healthy] then [healthy, junk] (sides alternate on purpose). */
export const PRACTICE_SCRIPT: string[][] = [['donut', 'apple'], ['broccoli', 'chocobar']];
export const TUTORIAL_KEY = 'tutorial.done';
const LOGOS = ['italy', 'japan', 'mexico', 'india', 'peru', 'poland'];

type Step =
  | { kind: 'card'; id: string; icon: string; illus: () => HTMLElement; adultsOnly?: boolean }
  | { kind: 'practice'; round: number };

/** The order matters: cards explain the idea, practice lets the player try it. */
export const STEPS: Step[] = [
  { kind: 'card', id: 'tut1', icon: '🥕', illus: () => illusFeed() },
  { kind: 'card', id: 'tut2', icon: '🫙', illus: () => illusBelly() },
  { kind: 'practice', round: 1 },
  { kind: 'practice', round: 2 },
  { kind: 'card', id: 'tut3', icon: '👅', illus: () => illusHabit() },
  { kind: 'card', id: 'tut4', icon: '🌈', illus: () => illusBonus() },
  { kind: 'card', id: 'tut5', icon: '🎮', illus: () => illusModes() },
  { kind: 'card', id: 'tut6', icon: '🛒', illus: () => illusBags() },
  { kind: 'card', id: 'tut7', icon: '🍝', illus: () => illusLock(), adultsOnly: true },
  { kind: 'card', id: 'tut8', icon: '🧾', illus: () => illusShare() },
  { kind: 'card', id: 'tut9', icon: '🌱', illus: () => illusReady() },
];

// ---------- small illustrations (emoji + CSS, no images to load) ----------
const chip = (txt: string, cls = '') => el('span', { class: `tut-chip ${cls}`.trim() }, txt);
const arrow = () => el('span', { class: 'tut-arrow', 'aria-hidden': 'true' }, '➜');
const line = (...c: (Node | string)[]) => el('div', { class: 'tut-line' }, ...c);

function illusFeed(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('🍎'), arrow(), chip('😋'), chip('+'), chip('🌱')), line(chip('🍩'), arrow(), chip('🤢', 'bad'), chip('💨')));
}

function illusBelly(): HTMLElement {
  const bar = el('div', { class: 'tut-belly', 'aria-hidden': 'true' }, el('i', { class: 'h' }), el('i', { class: 'j' }), el('b', { class: 'half' }));
  return el('div', { class: 'tut-illus' }, el('div', { class: 'tut-belly-head' }, `🫙 ${num(CAPACITY)} kcal`), bar, line(chip('🌱 50%+', 'good'), arrow(), chip('🏆')));
}

function illusHabit(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('🍩🍩🍩'), arrow(), chip('🥦'), chip('🤢', 'bad')), line(chip('🥦🥦🥦'), arrow(), chip('✨ +300', 'good')));
}

function illusBonus(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('🔥 ×3'), chip('🌈'), chip('💧'), chip('🥦🍅🥕')), line(chip('😴', 'bad'), chip('=', ''), chip('🍎🍎🍎')));
}

function illusModes(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('▶ 40')), line(chip('📅 20'), chip('🌿 ∞')));
}

function illusBags(): HTMLElement {
  const row = el('div', { class: 'tut-logos' });
  for (const id of LOGOS) row.append(el('img', { src: `logos/${id}.svg`, alt: '', width: '56', height: '56' }));
  return el('div', { class: 'tut-illus' }, row, line(chip('🌍 24 × 20'), chip('🧪 5')));
}

function illusLock(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('🍝 PASTA'), arrow(), chip('🔒'), arrow(), chip('🔓 🛒')));
}

function illusShare(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('🧾'), chip('📋'), chip('🎯'), chip('🎬')));
}

function illusReady(): HTMLElement {
  return el('div', { class: 'tut-illus' }, line(chip('🥦'), chip('🍅'), chip('🥕'), chip('🍋')), line(chip('😋', 'good')));
}

// ---------- the player ----------
export interface TutorialHost {
  game: Game;
  kidMode(): boolean;
  /** Replace the screen with this panel (dimmed over the scene). */
  open(panel: HTMLElement): void;
  /** Close the screen and show the game HUD (practice) / hide it (cards). */
  closeScreen(): void;
  startPractice(script: string[][]): void;
  stopPractice(): void;
}

export interface TutorialOptions {
  /** false: only the explanation cards (e.g. opened from the pause menu). */
  practice: boolean;
  /** Called when the tutorial ends or is skipped. */
  onDone(): void;
}

export class Tutorial {
  private index = 0;
  private steps: Step[] = [];
  private opts: TutorialOptions | null = null;
  private coach = $('#coach');
  private coachText = '';

  constructor(private readonly host: TutorialHost) {}

  get running(): boolean { return this.opts !== null; }

  start(opts: TutorialOptions): void {
    this.opts = opts;
    this.steps = STEPS.filter((s) => (s.kind === 'practice' ? opts.practice : !(s.adultsOnly && this.host.kidMode())));
    this.index = 0;
    this.render();
  }

  /** Leave the tutorial now (button, Escape from the pause card or a finished run). */
  finish(): void {
    const opts = this.opts;
    if (!opts) return;
    this.opts = null;
    this.hideCoach();
    if (this.host.game.cfg.script) this.host.stopPractice();
    store.set(TUTORIAL_KEY, true);
    opts.onDone();
  }

  /** Practice rounds call this when Pikko has finished the bite. */
  onBite(_res: unknown, food: Food, round: number): void {
    if (!this.opts) return;
    const good = isHealthy(food.grade);
    const key = round === 1 ? (good ? 'tutP1_good' : 'tutP1_bad') : good ? 'tutP2_healthy' : 'tutP2_junk';
    this.showCoach(t(key), false); // "Next" appears once Pikko has finished reacting (onReady)
  }

  /** Pikko's reaction is over: the player can move on. */
  onReady(): void {
    if (this.opts && this.coachText) this.showCoach(this.coachText, true);
  }

  private go(delta: number): void {
    const prev = this.steps[this.index];
    this.index = Math.max(0, Math.min(this.steps.length, this.index + delta));
    // going back never re-enters the practice rounds: land on the card before them
    if (delta < 0) while (this.index > 0 && this.steps[this.index].kind === 'practice') this.index--;
    const next = this.steps[this.index];
    // leaving the practice (to a card) stops the scripted run and brings the scene back
    if (prev?.kind === 'practice' && next?.kind !== 'practice') { this.hideCoach(); this.host.stopPractice(); }
    if (this.index >= this.steps.length) { this.finish(); return; }
    this.render();
  }

  private render(): void {
    const step = this.steps[this.index];
    if (step.kind === 'card') { this.hideCoach(); this.renderCard(step); } else this.renderPractice(step);
  }

  private renderCard(step: Extract<Step, { kind: 'card' }>): void {
    const last = this.index === this.steps.length - 1;
    const total = this.steps.length;
    const dots = el('div', { class: 'tut-dots', 'aria-hidden': 'true' });
    for (let i = 0; i < total; i++) dots.append(el('i', { class: i === this.index ? 'on' : i < this.index ? 'seen' : '' }));
    const body = t(`${step.id}_b`, { amount: num(Number(PASS_ACCESS.minimumTokens)) });
    const card = el('div', { class: 'card tut stack', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('tut_how') },
      el('div', { class: 'row tut-top' },
        el('span', { class: 'chip' }, t('tut_count', { n: this.index + 1, t: total })),
        last ? null : button(t('tut_skip'), 'btn ghost small', () => this.finish())),
      el('div', { class: 'tut-icon', 'aria-hidden': 'true' }, step.icon),
      el('h2', {}, t(`${step.id}_t`)),
      step.illus(),
      el('p', { class: 'tut-body' }, body),
      dots,
      el('div', { class: 'row tut-nav' },
        this.index > 0 ? button(t('tut_back'), 'btn ghost', () => this.go(-1)) : null,
        button(last ? `🌱 ${t('tut_start')}` : t('tut_next'), 'btn', () => this.go(1))),
    );
    this.host.open(el('div', {}, card));
  }

  private renderPractice(step: Extract<Step, { kind: 'practice' }>): void {
    const g = this.host.game;
    if (!g.active || !g.cfg.script) {
      this.host.closeScreen();
      this.host.startPractice(PRACTICE_SCRIPT);
    } else {
      g.advance();
    }
    this.showCoach(t(step.round === 1 ? 'tutP1' : 'tutP2'), false);
  }

  private showCoach(text: string, withNext: boolean): void {
    this.coachText = text;
    const total = this.steps.length;
    const box = el('div', { class: 'tut-coach', role: 'status' },
      el('div', { class: 'tut-coach-top' }, el('span', { class: 'chip' }, t('tut_count', { n: this.index + 1, t: total })), button(t('tut_skip'), 'btn ghost small', () => this.finish())),
      el('p', {}, text),
      withNext ? button(t('tut_next'), 'btn', () => this.go(1)) : null);
    this.coach.replaceChildren(box);
    this.coach.hidden = false;
  }

  private hideCoach(): void {
    this.coachText = '';
    this.coach.replaceChildren();
    this.coach.hidden = true;
  }
}
