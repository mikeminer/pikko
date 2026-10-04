// Gameplay controller: rounds, dragging, Pikko's dodge brain, reactions, timer, end of day.
import * as THREE from 'three';
import { audio } from './audio/audio';
import { recordReaction, resetClip } from './capture/bleahcam';
import { bagById, type Food, FOOD_BY_ID, isHealthy, isJunk, WATER } from './data/foods';
import { visualFor } from './data/visuals';
import { bagFact, bagName, fact, foodName, t, voiceLang } from './i18n';
import { buildFood, disposeFood } from './render/foods';
import { Pikko } from './render/pikko';
import type { Stage } from './render/scene';
import { applyBite, applyWater, type BiteResult, finishRun, newRun, type Reaction, type RunState, shouldDodge } from './sim/rules';
import { buildPool, dailySeed, mulberry32, nextPair, type Phase, PHASE_DODGES, PHASE_TIMER, phaseOf, type Pool, type Rng } from './sim/rounds';

export type Mode = 'classic' | 'daily' | 'zen';
/** `script`: tutorial practice. Fixed food ids per round (no timer, no end-of-day, no records); the UI drives the rounds. */
export interface RunConfig { mode: Mode; bagId: string; trial: boolean; seed?: number; script?: string[][] }

export interface GameEvents {
  hud(): void;
  toast(text: string, kind?: 'good' | 'bad' | 'big' | ''): void;
  fact(text: string, good: boolean | null): void;
  ended(run: RunState, cfg: RunConfig): void;
  discovered(food: Food): void;
  /** Tutorial practice only: a scripted bite has finished (the coach explains it, then calls game.advance()). */
  scriptBite?(res: BiteResult, food: Food, round: number): void;
  /** Tutorial practice only: Pikko's reaction is over, so the next scripted round may start. */
  scriptReady?(): void;
}

interface Slot {
  food: Food;
  obj: THREE.Group;
  home: THREE.Vector3;
  pos: THREE.Vector3;
  state: 'in' | 'idle' | 'drag' | 'return' | 'fly' | 'eaten' | 'out' | 'key';
  t: number;
  from: THREE.Vector3;
  water?: boolean;
}

const PHASE_MUSIC: Record<Phase, string> = { breakfast: 'M11_breakfast_loop', lunch: 'M12_lunch_loop', snack: 'M13_snack_loop', dinner: 'M14_dinner_loop' };
const PIKKO_X_MAX = 1.15;

export class Game {
  run: RunState = newRun();
  cfg: RunConfig = { mode: 'classic', bagId: 'base', trial: false };
  round = 0;
  phase: Phase = 'breakfast';
  slots: Slot[] = [];
  water: Slot | null = null;
  timerLeft = 0;
  timerMax = 0;
  active = false;
  paused = false;
  selected = -1;
  dailyNumber = 0;
  maxRounds = 40;
  private rng: Rng = Math.random;
  private pool: Pool = buildPool(null);
  private recent = new Set<string>();
  private busy = false; // feeding / reacting
  private queue: { at: number; fn: () => void }[] = [];
  private clock = 0;
  private drag: { slot: Slot; pointerId: number } | null = null;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private dragPlane = new THREE.Plane();
  private brain = { mode: 'idle' as 'idle' | 'suspicious' | 'resigned', dodges: 0, max: 1, targetX: 0, cooldown: 0, sighed: false };
  private crumbs: { mesh: THREE.Mesh; v: THREE.Vector3; life: number }[] = [];
  private lastTick = 0;
  private touch = false;
  private readonly pikkoBlob: THREE.Mesh;

  constructor(readonly stage: Stage, readonly pikko: Pikko, private readonly ev: GameEvents) {
    stage.scene.add(pikko.root);
    this.pikkoBlob = stage.addBlob(new THREE.Vector3(0, 0.005, 0.05), 1.9);
    const el = stage.renderer.domElement;
    el.addEventListener('pointerdown', (e) => this.onDown(e));
    el.addEventListener('pointermove', (e) => this.onMove(e));
    el.addEventListener('pointerup', (e) => this.onUp(e));
    el.addEventListener('pointercancel', (e) => this.onUp(e));
  }

  // ---------- lifecycle ----------
  start(cfg: RunConfig): void {
    this.cleanup();
    this.cfg = cfg;
    this.run = newRun();
    this.round = 0;
    this.recent.clear();
    this.queue = [];
    this.busy = false;
    this.paused = false;
    this.active = true;
    const daily = dailySeed();
    this.dailyNumber = daily.number;
    const seed = cfg.mode === 'daily' ? daily.seed : cfg.seed ?? (Math.random() * 2 ** 32) >>> 0;
    this.cfg.seed = seed;
    this.rng = mulberry32(seed);
    this.pool = buildPool(cfg.bagId);
    this.maxRounds = cfg.script ? cfg.script.length : cfg.trial ? 5 : cfg.mode === 'daily' ? 20 : 40;
    this.pikko.reset();
    this.pikko.setAccessory(cfg.bagId);
    this.pikko.doHop(1.2);
    audio.setHabit('neutral');
    resetClip();
    void audio.play('fridge_open', 0.8);
    this.later(0.5, () => void audio.play('fridge_click', 0.9));
    this.later(0.6, () => void audio.play('vox_hop', 0.9));
    this.later(0.9, () => void audio.play('land', 0.7));
    this.later(1.1, () => this.nextRound());
    void audio.preload(['M11_breakfast_loop', 'M12_lunch_loop', 'crunch_1', 'crunch_2', 'chew', 'gulp', 'plate_slide', 'plate_lift', 'plate_drop', 'dodge_s', 'dodge_m', 'squeak', `yum_${voiceLang()}_1`, `bleah_${voiceLang()}_1`]);
    void audio.playMusic(PHASE_MUSIC.breakfast);
    this.ev.hud();
    if (cfg.bagId !== 'base') {
      const bag = bagById(cfg.bagId);
      this.ev.toast(t('country_start', { country: bagName(bag) }), 'big');
      this.later(0.3, () => this.ev.fact(`🌍 ${bagFact(bag)}`, null));
    }
  }

  /** Tutorial practice: go on to the next scripted round. */
  advance(): void { this.nextRound(); }

  quit(): void {
    this.active = false;
    if (this.cfg.script) this.cfg = { ...this.cfg, script: undefined };
    this.cleanup();
  }

  private cleanup(): void {
    for (const s of [...this.slots, ...(this.water ? [this.water] : [])]) { this.stage.scene.remove(s.obj); disposeFood(s.obj); }
    this.slots = [];
    this.water = null;
    this.drag = null;
    for (const c of this.crumbs) this.stage.scene.remove(c.mesh);
    this.crumbs = [];
  }

  private later(sec: number, fn: () => void): void { this.queue.push({ at: this.clock + sec, fn }); }

  // ---------- rounds ----------
  private nextRound(): void {
    if (!this.active) return;
    if (this.round >= this.maxRounds && !this.run.ended) {
      if (this.cfg.script) return; // practice never ends by itself: the tutorial decides
      finishRun(this.run); this.endDay(); return;
    }
    this.round += 1;
    const ph = phaseOf(this.round);
    if (ph !== this.phase || this.round === 1) {
      this.phase = ph;
      void audio.playMusic(PHASE_MUSIC[ph]);
      if (this.round > 1) this.ev.toast(t('phase_' + ph), 'big');
      void audio.preload([PHASE_MUSIC[phaseOf(Math.min(40, this.round + 6))]]);
    }
    const pair = this.cfg.script ? this.cfg.script[this.round - 1].map((id) => FOOD_BY_ID.get(id)!) : nextPair(this.rng, this.round, this.run.habit, this.pool, this.recent);
    this.recent = new Set(pair.map((f) => f.id));
    for (const old of this.slots) { this.stage.scene.remove(old.obj); disposeFood(old.obj); }
    this.slots = pair.map((food, i) => this.spawn(food, this.stage.plateAnchors[i], i === 0 ? -1 : 1));
    if (this.round % 8 === 0 && !this.water) this.water = this.spawn(WATER, this.stage.waterAnchor, 0, true);
    void audio.play('plate_slide', 0.6);
    const zen = this.cfg.mode === 'zen';
    this.timerMax = zen ? 0 : PHASE_TIMER[ph];
    this.timerLeft = this.timerMax;
    this.brain = { mode: 'idle', dodges: 0, max: zen ? 1 : PHASE_DODGES[ph], targetX: 0, cooldown: 0, sighed: false };
    this.selected = -1;
    this.busy = false;
    this.ev.hud();
  }

  private spawn(food: Food, home: THREE.Vector3, side: number, water = false): Slot {
    const obj = buildFood(food);
    const from = new THREE.Vector3(home.x + side * 4, home.y + 0.1, home.z - 1.5);
    obj.position.copy(from);
    this.stage.scene.add(obj);
    return { food, obj, home: new THREE.Vector3(home.x, 0.06, home.z), pos: from.clone(), state: 'in', t: 0, from, water };
  }

  // ---------- input ----------
  private pointerRay(e: PointerEvent): void {
    const r = this.stage.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.stage.camera);
  }

  private pickable(): Slot[] {
    return [...this.slots, ...(this.water ? [this.water] : [])].filter((s) => s.state === 'idle' || s.state === 'return');
  }

  private onDown(e: PointerEvent): void {
    this.touch = e.pointerType === 'touch';
    if (!this.active || this.paused || this.busy || this.drag) return;
    void audio.unlock();
    this.pointerRay(e);
    let best: Slot | null = null;
    let bestD = Infinity;
    for (const s of this.pickable()) {
      const hits = this.raycaster.intersectObject(s.obj, true);
      if (hits.length && hits[0].distance < bestD) { best = s; bestD = hits[0].distance; }
    }
    // generous touch targets: also accept taps near the plate
    if (!best) {
      for (const s of this.pickable()) {
        const p = s.home.clone().project(this.stage.camera);
        const d = Math.hypot(p.x - this.ndc.x, (p.y - this.ndc.y) * (this.stage.camera.aspect > 1 ? 1 : 1.4));
        if (d < 0.22 && d < bestD) { best = s; bestD = d; }
      }
    }
    if (!best) return;
    this.drag = { slot: best, pointerId: e.pointerId };
    best.state = 'drag';
    try { this.stage.renderer.domElement.setPointerCapture(e.pointerId); } catch { /* synthetic or already released pointer */ }
    const mouth = this.pikko.mouthWorld();
    this.dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0.35, 1).normalize(), new THREE.Vector3(0, mouth.y - 0.25, 0.9));
    void audio.play('plate_lift', 0.6);
    this.onMove(e);
  }

  private onMove(e: PointerEvent): void {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    this.pointerRay(e);
    const hit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, hit)) {
      hit.y = Math.max(0.15, hit.y - 0.15);
      this.drag.slot.from.copy(hit);
    }
  }

  private onUp(e: PointerEvent): void {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    const s = this.drag.slot;
    this.drag = null;
    if (this.inMouth(s.pos)) this.feed(s, false);
    else { s.state = 'return'; s.t = 0; s.from.copy(s.pos); void audio.play('plate_drop', 0.5); }
  }

  /** Keyboard: 1/2 (or ←/→) selects, Enter feeds. Dodges still apply (press again). */
  key(k: string): void {
    if (!this.active || this.paused || this.busy) return;
    if (k === '1' || k === 'ArrowLeft') this.selected = 0;
    else if (k === '2' || k === 'ArrowRight') this.selected = 1;
    else if (k === 'Enter' || k === ' ') {
      const s = this.slots[this.selected >= 0 ? this.selected : 0];
      if (!s || s.state !== 'idle') return;
      s.state = 'key';
      s.t = 0;
      s.from.copy(s.pos);
    }
    this.ev.hud();
  }

  private inMouth(p: THREE.Vector3): boolean {
    const m = this.pikko.mouthWorld();
    const r = this.touch ? 0.62 : 0.45;
    return p.distanceTo(m) < r;
  }

  // ---------- feeding ----------
  private feed(s: Slot, timeout: boolean): void {
    if (this.busy && !timeout) return;
    this.busy = true;
    this.timerMax = 0;
    s.state = 'fly';
    s.t = 0;
    s.from.copy(s.pos);
    this.pikko.setTarget({ mouthOpen: 1, lean: 0.6 });
    if (s.water) { this.later(0.22, () => this.drinkWater(s)); return; }
    const other = this.slots.find((x) => x !== s) ?? null;
    this.later(0.22, () => this.bite(s, other?.food ?? null, timeout));
    if (other && other.state !== 'fly') { other.state = 'out'; other.t = 0; other.from.copy(other.pos); }
  }

  private drinkWater(s: Slot): void {
    s.state = 'eaten';
    applyWater(this.run);
    void audio.play('gulp', 0.9);
    void audio.play('vox_content', 0.8);
    this.ev.toast(t('water'), 'good');
    this.ev.fact(fact(WATER), true);
    this.pikko.setTarget({ mouthOpen: 0, smile: 1, squint: 0.6 });
    this.pikko.splash(0.5);
    this.stage.scene.remove(s.obj);
    disposeFood(s.obj);
    this.water = null;
    this.busy = false;
    this.later(0.6, () => this.baseline());
    this.ev.hud();
  }

  private bite(s: Slot, other: Food | null, timeout: boolean): void {
    s.state = 'eaten';
    const f = s.food;
    const firstTime = !(this.run.eaten[f.id]);
    const res = applyBite(this.run, f, other, { timeout, colorGroup: visualFor(f).group, round: this.round });
    if (firstTime) this.ev.discovered(f);
    this.crumbsAt(this.pikko.mouthWorld(), s.obj.userData.crumbColor as string);
    this.stage.scene.remove(s.obj);
    disposeFood(s.obj);
    // belly
    this.pikko.levelTarget = Math.min(1, this.run.kcal / 2000);
    const healthyShare = this.run.kcal ? this.run.kcalHealthy / this.run.kcal : 1;
    this.pikko.liquidTarget.set('#6e4322').lerp(new THREE.Color('#b9d86a'), healthyShare);
    this.pikko.splash(1);
    if (isJunk(f.grade)) this.pikko.stain(s.obj.userData.crumbColor as string);
    this.react(res.reaction, f, res);
    this.feedback(res, f);
    if (!this.cfg.script) this.ev.fact(fact(f), isHealthy(f.grade) ? true : isJunk(f.grade) ? false : null);
    this.ev.hud();
    const dur = res.reaction === 'bleah_mega' ? 2.3 : res.reaction === 'bleah' ? 1.9 : 1.5;
    if (this.cfg.script) {
      this.later(Math.min(dur, 0.8), () => this.ev.scriptBite?.(res, f, this.round)); // the coach talks while the face is still on
      this.later(dur, () => this.ev.scriptReady?.());
    }
    else if (res.ended) this.later(dur, () => this.endDay());
    else this.later(dur, () => this.nextRound());
  }

  private feedback(res: BiteResult, f: Food): void {
    if (res.choiceBonus) this.ev.toast(t('choice', { n: res.choiceBonus }), 'good');
    if (this.run.combo >= 2 && isHealthy(f.grade)) { this.ev.toast(t('combo', { n: Math.min(2, 1 + this.run.combo * 0.1).toFixed(1) }), 'good'); audio.combo(Math.min(5, this.run.combo - 1)); }
    if (res.colorBonus) this.ev.toast(t('color_new'), 'good');
    if (res.rainbowBonus) { this.ev.toast(t('rainbow'), 'big'); audio.rainbow(); this.pikko.setTarget({ bloom: 1 }); }
    if (res.bored) this.ev.toast(t('bored', { food: foodName(f) }), 'bad');
    if (res.habitAfter !== res.habitBefore) {
      audio.setHabit(res.habitAfter);
      if (res.habitAfter === 'junk') { this.ev.toast(t('habit_junk'), 'bad'); audio.habitJunk(); this.later(0.9, () => void audio.play('vox_yawn', 0.8)); this.ev.fact(t('habit_fact'), null); }
      if (res.habitAfter === 'healthy') {
        if (res.resetBonus) { this.ev.toast(t('palate_reset'), 'big'); audio.palateReset(); this.later(0.5, () => void audio.play('vox_proud', 0.9)); this.ev.fact(t('habit_fact'), true); }
        else this.ev.toast(t('habit_healthy'), 'good');
      }
    }
    if (res.perfectDayBonus) { this.ev.toast(t('perfect_day'), 'big'); audio.fanfare(); }
  }

  // ---------- reactions (GDD §7) ----------
  private react(r: Reaction, f: Food, res: BiteResult): void {
    const p = this.pikko;
    const lang = voiceLang();
    const chew = (n: number, every = 0.15, amp = 0.35) => { for (let i = 0; i < n; i++) this.later(i * every, () => p.setTarget({ mouthOpen: i % 2 ? amp : 0.02 })); };
    p.setTarget({ lean: 0 });
    switch (r) {
      case 'yum': {
        const snd = f.cat === 'fruit' ? ['juice_1', 'juice_2'] : ['crunch_1', 'crunch_2'];
        void audio.playOneOf(f.cat === 'veg' || f.cat === 'fruit' || f.cat === 'nuts' ? snd : ['chew']);
        chew(6);
        p.setTarget({ smile: 1, squint: 0.7, puff: 0.3, droop: -0.25, brow: 0.4 });
        this.later(0.15, () => void audio.voice('yum', lang));
        this.later(0.95, () => { p.setTarget({ mouthOpen: 0, puff: 0 }); void audio.play('gulp', 0.6); p.splash(0.6); });
        if (f.cat === 'protein' || this.run.combo >= 3) { this.later(1.0, () => p.setTarget({ armR: -2.4 })); this.later(1.45, () => p.setTarget({ armR: -0.35 })); }
        if (this.run.combo >= 5) p.setTarget({ bloom: 1 });
        this.later(1.05, () => p.doHop(0.7));
        break;
      }
      case 'yum_reluctant': {
        p.setTarget({ smile: -0.6, lids: 0.45, turn: 0.35, droop: 0.6, brow: 0.9 });
        void audio.play('vox_lazy_sigh', 0.8);
        chew(5, 0.24, 0.25);
        this.later(1.2, () => { p.setTarget({ smile: 0.4, turn: 0, lids: 0.1, brow: 0.3 }); void audio.play('vox_content', 0.8); });
        break;
      }
      case 'bleah':
      case 'bleah_mega': {
        const mega = r === 'bleah_mega';
        recordReaction(this.stage.renderer.domElement, mega);
        p.setTarget({ puff: 0.9, mouthOpen: 0, smile: -0.4, lids: 0.3, brow: -0.6 });
        void audio.play('chew', 0.6);
        if (f.cat === 'fizzy') void audio.play('fizz_can', 0.7);
        this.later(0.35, () => {
          p.setTarget({ puff: 0, tongue: 1, cross: 0.9, tint: 1, smile: -1, shake: mega ? 1.4 : 1, droop: 1, mouthOpen: 0.45, armL: mega ? 2.6 : 1.2, armR: mega ? -2.6 : -1.2, brow: -1, squint: 0.5 });
          void audio.voice('bleah', lang, mega);
          void audio.play('squeak', 0.4);
          if (mega) this.stage.shake(1.2);
        });
        if (f.cat === 'sugar') this.later(0.5, () => audio.sugarRush());
        if (f.cat === 'fizzy') { for (let i = 0; i < 3; i++) this.later(1.0 + i * 0.3, () => { p.doHop(0.35); void audio.play('vox_hiccup', 0.5); }); }
        this.later(mega ? 1.6 : 1.3, () => p.setTarget({ tongue: 0, cross: 0, shake: 0, tint: 0.25, mouthOpen: 0, armL: 0.35, armR: -0.35, brow: -0.3, squint: 0 }));
        break;
      }
      case 'greedy': {
        p.setTarget({ mouthOpen: 1, smile: 0.7, lids: 0.2, droop: 0.9, brow: 0.1 });
        chew(8, 0.11, 0.5);
        void audio.play('chew', 0.8);
        this.later(1.0, () => { void audio.play('gulp', 0.7); p.setTarget({ mouthOpen: 0, lids: 0.5, smile: 0 }); });
        this.later(1.2, () => void audio.play('vox_lazy_sigh', 0.7));
        if (f.cat === 'sugar') this.later(0.3, () => audio.sugarRush());
        break;
      }
      default: {
        chew(4);
        void audio.play('vox_curious', 0.7);
        p.setTarget({ smile: 0.2 });
      }
    }
    void res;
    this.later(r === 'bleah_mega' ? 2.2 : 1.7, () => this.baseline());
  }

  /** Resting expression depends on the palate habit (GDD §7.3). */
  private baseline(): void {
    const h = this.run.habit;
    this.pikko.setTarget({
      mouthOpen: 0, tongue: 0, puff: 0, cross: 0, shake: 0, turn: 0, lean: 0, squint: h === 'healthy' ? 0.25 : 0,
      tint: 0, lids: h === 'junk' ? 0.35 : 0, smile: h === 'junk' ? 0 : 0.7, droop: h === 'junk' ? 0.85 : h === 'healthy' ? -0.2 : 0,
      armL: 0.35, armR: -0.35, bloom: h === 'healthy' || this.run.rainbow ? 0.8 : 0, brow: h === 'junk' ? 0.6 : 0.2,
    });
  }

  private crumbsAt(at: THREE.Vector3, color: string): void {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.025 + Math.random() * 0.02, 6, 4), mat);
      mesh.position.copy(at);
      this.stage.scene.add(mesh);
      this.crumbs.push({ mesh, v: new THREE.Vector3((Math.random() - 0.5) * 2.5, 1 + Math.random() * 1.5, 0.6 + Math.random()), life: 1.2 });
    }
  }

  // ---------- end of day ----------
  private endDay(): void {
    if (!this.active) return;
    this.active = false;
    this.busy = true;
    for (const s of this.slots) { s.state = 'out'; s.t = 0; s.from.copy(s.pos); }
    if (this.water) { this.water.state = 'out'; this.water.t = 0; this.water.from.copy(this.water.pos); }
    audio.stopMusic(0.8);
    const p = this.pikko;
    const win = this.run.outcome === 'victory';
    if (win) {
      p.setTarget({ armL: 1.4, armR: -1.4, smile: 1, squint: 0.8, bloom: 1, droop: -0.3, puff: 0.6, brow: 0.5 });
      this.later(0.5, () => { void audio.play('end_victory', 1); p.setTarget({ mouthOpen: 0.8, puff: 0 }); this.stage.shake(0.5); });
      this.later(1.6, () => { p.setTarget({ mouthOpen: 0, armR: -2.4 }); p.doHop(1); audio.fanfare(); });
    } else {
      p.setTarget({ armL: 1.5, armR: -1.5, lean: 0.5, tint: 0.7, lids: 0.55, smile: -1, droop: 1, brow: 1 });
      this.later(0.4, () => void audio.play(`end_defeat_${voiceLang()}`, 1));
      this.later(0.6, () => p.setTarget({ shake: 0.5 }));
      this.later(2.2, () => p.setTarget({ shake: 0 }));
    }
    this.later(3.2, () => { this.busy = false; this.ev.ended(this.run, this.cfg); });
  }

  // ---------- per-frame ----------
  update(dt: number): void {
    if (this.paused) return;
    this.clock += dt;
    const due = this.queue.filter((q) => q.at <= this.clock);
    this.queue = this.queue.filter((q) => q.at > this.clock);
    for (const q of due) q.fn();

    // timer (ticks follow the music beat in the last 3 seconds)
    if (this.active && !this.busy && this.timerMax > 0 && this.slots.every((s) => s.state !== 'in')) {
      this.timerLeft -= dt;
      const beat = audio.beatPeriod();
      if (this.timerLeft < 3 && this.clock - this.lastTick >= beat) { this.lastTick = this.clock; audio.tick(this.timerLeft < 1); }
      if (this.timerLeft <= 0) {
        this.timerLeft = 0;
        const choices = this.slots.filter((s) => s.state === 'idle' || s.state === 'return' || s.state === 'drag');
        if (this.drag) { this.drag = null; }
        if (choices.length) {
          this.ev.toast(t('time_up'), 'bad');
          const pick = choices[Math.floor(this.rng() * choices.length)];
          this.feed(pick, true);
        }
      }
    }

    this.updateSlots(dt);
    this.updateBrain(dt);

    // crumbs
    for (const c of this.crumbs) {
      c.life -= dt;
      c.v.y -= 6 * dt;
      c.mesh.position.addScaledVector(c.v, dt);
      if (c.mesh.position.y < 0.02) { c.mesh.position.y = 0.02; c.v.multiplyScalar(0.3); }
    }
    this.crumbs = this.crumbs.filter((c) => { if (c.life > 0) return true; this.stage.scene.remove(c.mesh); c.mesh.geometry.dispose(); return false; });
  }

  private updateSlots(dt: number): void {
    const mouth = this.pikko.mouthWorld();
    for (const s of [...this.slots, ...(this.water ? [this.water] : [])]) {
      s.t += dt;
      switch (s.state) {
        case 'in': {
          const k = Math.min(1, s.t / 0.55);
          const e = 1 - Math.pow(1 - k, 3);
          s.pos.lerpVectors(s.from, s.home, e);
          s.pos.y += Math.sin(k * Math.PI) * 0.3;
          if (k >= 1) s.state = 'idle';
          break;
        }
        case 'idle':
          s.pos.lerp(s.home, 1 - Math.exp(-10 * dt));
          s.obj.rotation.y += dt * 0.25;
          break;
        case 'drag':
          s.pos.lerp(s.from, 1 - Math.exp(-18 * dt));
          break;
        case 'return': {
          const k = Math.min(1, s.t / 0.35);
          s.pos.lerpVectors(s.from, s.home, 1 - Math.pow(1 - k, 2));
          s.pos.y += Math.sin(k * Math.PI) * 0.25;
          if (k >= 1) s.state = 'idle';
          break;
        }
        case 'key': {
          // keyboard approach towards the mouth
          const k = Math.min(1, s.t / 0.6);
          s.pos.lerpVectors(s.from, mouth, k * 0.92);
          if (shouldDodge(s.food.grade, this.run.habit) && this.brain.mode !== 'resigned' && this.brain.dodges < this.brain.max && k > 0.5) {
            this.dodge(s.pos);
            s.state = 'return';
            s.t = 0;
            s.from.copy(s.pos);
          } else if (k >= 1) this.feed(s, false);
          break;
        }
        case 'fly': {
          const k = Math.min(1, s.t / 0.22);
          s.pos.lerpVectors(s.from, mouth, k);
          s.obj.scale.setScalar(Math.max(0.15, 1 - k * 0.7) * (s.obj.userData.baseScale ??= s.obj.scale.x));
          break;
        }
        case 'out': {
          const k = Math.min(1, s.t / 0.5);
          s.pos.set(s.from.x + Math.sign(s.from.x || 1) * k * 4, s.from.y, s.from.z - k * 1.5);
          if (k >= 1) s.obj.visible = false;
          break;
        }
        default:
          break;
      }
      s.obj.position.copy(s.pos);
    }
  }

  private dodge(foodPos: THREE.Vector3): void {
    const b = this.brain;
    b.dodges += 1;
    b.cooldown = this.cfg.mode === 'zen' ? 1.0 : 0.6;
    const x = this.pikko.root.position.x;
    let dir = x - foodPos.x >= 0 ? 1 : -1;
    if (Math.abs(x + dir * 0.9) > PIKKO_X_MAX) dir = -dir;
    b.targetX = THREE.MathUtils.clamp(x + dir * 0.9, -PIKKO_X_MAX, PIKKO_X_MAX);
    this.pikko.setTarget({ lean: -0.6, mouthOpen: 0, smile: -0.5, armL: 2.2, armR: -2.2, squint: 0.5, turn: -dir * 0.4, brow: -0.8 });
    void audio.playOneOf(['dodge_s', 'dodge_m']);
    void audio.play('squeak', 0.4);
    if (b.dodges >= b.max) this.later(0.6, () => { b.mode = 'resigned'; });
  }

  private updateBrain(dt: number): void {
    const b = this.brain;
    b.cooldown = Math.max(0, b.cooldown - dt);
    const root = this.pikko.root;
    root.position.x += (b.targetX - root.position.x) * (1 - Math.exp(-7 * dt));
    this.pikkoBlob.position.x = root.position.x;
    if (!this.active || this.busy) return;
    const s = this.drag?.slot;
    if (!s) {
      if (b.mode !== 'idle') { b.mode = 'idle'; this.baseline(); }
      if (!this.busy) b.targetX *= 1 - Math.min(1, dt * 0.6); // drift back to centre
      return;
    }
    const mouth = this.pikko.mouthWorld();
    const d = s.pos.distanceTo(mouth);
    const avoid = !s.water && shouldDodge(s.food.grade, this.run.habit);
    if (avoid && b.mode !== 'resigned' && b.dodges < b.max) {
      if (d < 1.7) {
        if (b.mode !== 'suspicious') { b.mode = 'suspicious'; void audio.play('vox_nervous', 0.5); }
        this.pikko.setTarget({ lean: -0.5, squint: 0.6, smile: -0.6, mouthOpen: 0, turn: (s.pos.x - root.position.x) * -0.3, brow: -0.7 });
      }
      if (d < 0.95 && b.cooldown <= 0) this.dodge(s.pos);
    } else if (avoid) {
      // resigned: opens the mouth reluctantly
      if (!b.sighed) { b.sighed = true; void audio.play('vox_lazy_sigh', 0.7); }
      this.pikko.setTarget({ lean: 0.1, mouthOpen: d < 1.2 ? 0.55 : 0.2, smile: -0.4, lids: 0.4, armL: 0.35, armR: -0.35, turn: 0, brow: 0.9 });
    } else {
      const want = THREE.MathUtils.clamp(1.6 - d, 0, 1);
      this.pikko.setTarget({ lean: want * 0.7, mouthOpen: want, smile: 0.9, lids: 0, squint: 0, turn: (s.pos.x - root.position.x) * 0.25, armL: 0.35 + want * 0.6, armR: -0.35 - want * 0.6, brow: 0.5 });
      b.targetX += (s.pos.x - root.position.x) * dt * 0.8; // leans/steps towards good food
      b.targetX = THREE.MathUtils.clamp(b.targetX, -PIKKO_X_MAX, PIKKO_X_MAX);
    }
  }

  setPaused(p: boolean): void {
    this.paused = p;
    if (p && this.drag) { this.drag.slot.state = 'return'; this.drag.slot.t = 0; this.drag.slot.from.copy(this.drag.slot.pos); this.drag = null; }
  }

  /** Screen positions of the plates for DOM labels. */
  labelData(): { x: number; y: number; food: Food; sel: boolean }[] {
    const r = this.stage.renderer.domElement.getBoundingClientRect();
    return this.slots.filter((s) => s.state === 'idle' || s.state === 'return' || s.state === 'drag').map((s, i) => {
      const p = s.home.clone().add(new THREE.Vector3(0, -0.05, 0.62)).project(this.stage.camera);
      return { x: ((p.x + 1) / 2) * r.width, y: ((1 - p.y) / 2) * r.height, food: s.food, sel: this.selected === i };
    });
  }
}
