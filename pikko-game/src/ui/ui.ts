// DOM overlay: HUD, plate labels, toasts and all screens. Text comes from i18n; no innerHTML with user data.
import { DEVFRIDGE, PASS_ACCESS } from '../access/bags.config';
import { type AccessState, checkBag, checkPass, isAccessLive, passRule, ruleFor } from '../access/gate';
import * as wallets from '../access/wallet';
import { audio } from '../audio/audio';
import { clip } from '../capture/bleahcam';
import { ALL_BAGS, type Bag, FOOD_BY_ID, type Food, isHealthy, isJunk, type Lang, LANG_META, LANGS } from '../data/foods';
import type { Game, Mode, RunConfig } from '../game';
import { bagAccessory, bagFact, bagName, date, foodName, getLang, num, setLang, t, tp } from '../i18n';
import type { Quality } from '../render/scene';
import { CAPACITY, type RunState } from '../sim/rules';
import { store } from '../storage';
import { $, button, el } from './dom';
import { drawReceipt, emojiLine } from './receipt';
import { Tutorial, TUTORIAL_KEY } from './tutorial';

export interface Settings { sound: boolean; quality: Quality; kidMode: boolean }

export interface UiHost {
  game: Game;
  settings: Settings;
  start(cfg: RunConfig): void;
  applySettings(): void;
  toTitle(): void;
  setPaused(p: boolean): void;
  setView(v: 'title' | 'game'): void;
  /** Stop the running game and bring the idle scene back (tutorial: leaving the practice rounds). */
  stopGame(): void;
}

export class Ui {
  private screen = $('#screen');
  private hud = $('#hud');
  private labels = $('#labels');
  private toasts = $('#toasts');
  private factEl: HTMLDivElement | null = null;
  private factTimer = 0;
  private songStop: (() => void) | null = null;
  private lastFocus: HTMLElement | null = null;
  current = 'none';

  private readonly tutorial: Tutorial;

  constructor(private readonly host: UiHost) {
    this.tutorial = new Tutorial({
      game: host.game,
      kidMode: () => host.settings.kidMode,
      open: (panel) => this.open(panel, 'tutorial'),
      closeScreen: () => this.close(),
      startPractice: (script) => this.host.start({ mode: 'zen', bagId: 'base', trial: false, script }),
      stopPractice: () => { this.hud.hidden = true; this.labels.replaceChildren(); this.host.stopGame(); },
    });
  }

  /** Open the tutorial (practice rounds + cards); `practice: false` = cards only. onDone runs when it ends or is skipped. */
  showTutorial(onDone: () => void, practice = true): void {
    this.tutorial.start({ practice, onDone });
  }

  tutorialBite(res: unknown, food: Food, round: number): void { this.tutorial.onBite(res, food, round); }
  tutorialReady(): void { this.tutorial.onReady(); }

  /** Start a run; the very first time the player is walked through the tutorial before it begins. */
  private begin(cfg: RunConfig): void {
    if (store.get<boolean>(TUTORIAL_KEY, false)) this.host.start(cfg);
    else this.showTutorial(() => this.host.start(cfg));
  }

  private open(panel: HTMLElement, name: string, dim = true): void {
    this.lastFocus = document.activeElement as HTMLElement | null;
    this.screen.replaceChildren(panel);
    panel.classList.add('panel');
    if (dim) panel.classList.add('dim');
    this.current = name;
    const first = panel.querySelector<HTMLElement>('button, select, input');
    first?.focus({ preventScroll: true });
  }

  close(): void {
    this.screen.replaceChildren();
    this.current = 'none';
    this.lastFocus?.focus?.({ preventScroll: true });
  }

  // ---------------- title ----------------
  title(): void {
    this.hud.hidden = true;
    this.labels.replaceChildren();
    const p = el('div', { class: 'title-panel' });
    const langs = el('div', { class: 'top-right langs' },
      button(`🌐 ${LANG_META[getLang()].native}`, '', () => this.languages(), { 'aria-label': t('language'), 'aria-haspopup': 'dialog' }));
    const tl = el('div', { class: 'top-left' },
      button('⚙️', 'icon-btn', () => this.settings(), { 'aria-label': t('settings') }),
      button('❓', 'icon-btn', () => this.showTutorial(() => this.title()), { 'aria-label': t('tut_how'), title: t('tut_how') }),
      button(this.songStop ? '⏹' : '🎵', 'icon-btn', () => void this.toggleSong(), { 'aria-label': this.songStop ? t('song_stop') : t('song') }));
    const best = store.get<number>('best.classic', 0) ?? 0;
    const menu = el('div', { class: 'menu stack' },
      button([el('span', {}, `▶ ${t('play')}`), el('small', {}, t('classic_desc'))], 'btn', () => this.begin({ mode: 'classic', bagId: 'base', trial: false })),
      button([el('span', {}, `📅 ${t('daily')}`), el('small', {}, t('daily_desc'))], 'btn green', () => this.begin({ mode: 'daily', bagId: 'base', trial: false })),
      el('div', { class: 'row three' },
        button(`🌿 ${t('zen')}`, 'btn ghost small', () => this.begin({ mode: 'zen', bagId: 'base', trial: false }), { title: t('zen_desc') }),
        button(`🛒 ${t('mart')}`, 'btn ghost small', () => this.mart()),
        button(`📖 ${t('recipes')}`, 'btn ghost small', () => this.recipes())),
      el('div', { class: 'fine' }, best ? `${t('local_best')}: ${num(best)} · ` : '', t('disclaimer')),
    );
    p.append(tl, langs, el('h1', { class: 'logo' }, el('img', { src: 'pikko-logo.svg', alt: 'PIKKO' })), el('div', { class: 'sub' }, t('subtitle')), menu);
    this.open(p, 'title', false);
    this.host.setView('title');
    void audio.playMusic('M10_menu_loop');
  }

  /** Language picker: the 3 base languages + the languages of the 20 country bags. */
  languages(): void {
    const grid = el('div', { class: 'lang-grid' });
    for (const l of LANGS) {
      const home = ALL_BAGS.find((b) => b.id === LANG_META[l].bag);
      grid.append(button([...(home ? [el('img', { class: 'lang-bag', src: home.logo, alt: '' })] : []), el('b', {}, LANG_META[l].native), el('small', {}, l.toUpperCase())], `lang-btn${l === getLang() ? ' on' : ''}`,
        () => { void setLang(l).then(() => this.title()); }, { lang: l, dir: LANG_META[l].dir, 'aria-pressed': String(l === getLang()) }));
    }
    const card = el('div', { class: 'card stack' },
      el('div', { class: 'row', style: 'justify-content:space-between' }, el('h2', {}, `🌐 ${t('language')}`), button(t('close'), 'btn ghost small', () => this.title())),
      grid);
    this.open(el('div', {}, card), 'languages');
  }

  private async toggleSong(): Promise<void> {
    if (this.songStop) { this.songStop(); this.songStop = null; void audio.playMusic('M10_menu_loop'); this.title(); return; }
    audio.stopMusic(0.4);
    this.songStop = await audio.playTrack('M01_theme_it_demoA', 1, () => { this.songStop = null; if (this.current === 'title') { void audio.playMusic('M10_menu_loop'); this.title(); } });
    this.title();
  }

  // ---------------- HUD ----------------
  showHud(): void { this.hud.hidden = false; this.host.setView('game'); }

  renderHud(g: Game): void {
    const run = g.run;
    this.hud.replaceChildren();
    const bar = el('div', { class: 'belly-bar', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(CAPACITY), 'aria-valuenow': String(run.kcal), 'aria-label': t('belly') });
    for (const b of run.log) {
      const cls = isHealthy(b.grade) ? 'h' : isJunk(b.grade) ? 'j' : 'c';
      const seg = el('div', { class: `seg ${cls}` });
      seg.style.width = `${Math.min(100, (b.kcal / CAPACITY) * 100)}%`;
      bar.append(seg);
    }
    bar.append(el('div', { class: 'half' }));
    const top = el('div', { class: 'hud-top' },
      button('⏸', 'icon-btn', () => this.pause(), { 'aria-label': t('pause') }),
      el('div', { class: 'belly' }, el('div', { class: 'belly-head' }, el('span', {}, `🫙 ${t('belly')}`), el('span', {}, `${num(run.kcal)} / ${num(CAPACITY)} kcal`)), bar),
      el('div', { class: 'score-box' }, el('div', { class: 'v' }, num(run.score)), el('div', { class: 'l' }, t('score'))),
    );
    const habit = run.habit === 'junk' ? el('span', { class: 'chip habit-junk' }, `🍟 ${t('habit_junk')}`) : run.habit === 'healthy' ? el('span', { class: 'chip habit-healthy' }, `🌱 ${t('habit_healthy')}`) : null;
    const sub = el('div', { class: 'hud-sub' },
      el('span', { class: 'chip' }, `${t('phase_' + g.phase)} · ${t('round', { n: g.round })}${g.cfg.mode === 'daily' ? ` / ${g.maxRounds}` : ''}`),
      g.cfg.trial ? el('span', { class: 'chip trial' }, t('trial_banner')) : null,
      habit);
    this.hud.append(top, sub);
    if (g.timerMax > 0) {
      const tm = el('div', { class: `timer${g.timerLeft < 3 ? ' warn' : ''}`, id: 'timer' }, el('i'));
      this.hud.append(tm);
    }
    const hint = el('div', { class: 'hint' }, matchMedia('(pointer: fine)').matches ? `${t('drag_hint')} · ${t('key_hint')}` : t('drag_hint'));
    if (g.round <= 2 && !g.cfg.script) this.hud.append(hint);
    this.factEl = el('div', { class: 'fact' });
    this.hud.append(this.factEl);
  }

  updateTimer(g: Game): void {
    const tm = document.getElementById('timer');
    if (!tm) return;
    const i = tm.firstElementChild as HTMLElement;
    i.style.width = `${g.timerMax ? Math.max(0, (g.timerLeft / g.timerMax) * 100) : 0}%`;
    tm.classList.toggle('warn', g.timerLeft < 3);
  }

  updateLabels(g: Game): void {
    const data = g.active ? g.labelData() : [];
    while (this.labels.children.length > data.length) this.labels.lastElementChild!.remove();
    while (this.labels.children.length < data.length) this.labels.append(el('div', { class: 'plate-label' }));
    data.forEach((d, i) => {
      const e = this.labels.children[i] as HTMLElement;
      const key = `${d.food.id}|${getLang()}`;
      if (e.dataset.key !== key) {
        e.dataset.key = key;
        e.replaceChildren(el('span', {}, foodName(d.food)), el('small', {}, `${num(d.food.kcal)} kcal · ${d.food.qty} ${d.food.unit}`));
      }
      const vh = this.labels.clientHeight || window.innerHeight;
      e.style.left = `${d.x}px`;
      e.style.top = `${Math.min(d.y, vh - 96)}px`;
      e.classList.toggle('sel', d.sel);
    });
  }

  toast(text: string, kind: 'good' | 'bad' | 'big' | '' = ''): void {
    const tEl = el('div', { class: `toast ${kind}` }, text);
    this.toasts.append(tEl);
    setTimeout(() => tEl.remove(), 1700);
    while (this.toasts.children.length > 4) this.toasts.firstElementChild!.remove();
  }

  fact(text: string, good: boolean | null): void {
    if (!this.factEl) return;
    this.factEl.textContent = text;
    this.factEl.className = `fact show ${good === true ? 'good' : good === false ? 'bad' : ''}`;
    clearTimeout(this.factTimer);
    this.factTimer = window.setTimeout(() => this.factEl?.classList.remove('show'), 3200);
  }

  // ---------------- pause ----------------
  pause(): void {
    this.host.setPaused(true);
    if (this.host.game.cfg.script) { // tutorial practice: only resume or leave it
      const tc = el('div', { class: 'card stack' },
        el('h2', {}, t('pause')),
        button(t('resume'), 'btn', () => { this.close(); this.host.setPaused(false); }),
        button(t('tut_coach_skip'), 'btn ghost', () => { this.close(); this.host.setPaused(false); this.tutorial.finish(); }));
      this.open(el('div', {}, tc), 'pause');
      return;
    }
    const card = el('div', { class: 'card stack' },
      el('h2', {}, t('pause')),
      button(t('resume'), 'btn', () => { this.close(); this.host.setPaused(false); }),
      button(t('restart'), 'btn ghost', () => { this.close(); this.host.start({ ...this.host.game.cfg, seed: this.host.game.cfg.mode === 'daily' ? undefined : undefined }); }),
      button(`❓ ${t('tut_how')}`, 'btn ghost', () => this.showTutorial(() => this.pause(), false)),
      button(t('settings'), 'btn ghost', () => this.settings(() => this.pause())),
      button(t('quit'), 'btn ghost', () => { this.close(); this.host.toTitle(); }),
    );
    this.open(el('div', {}, card), 'pause');
  }

  // ---------------- results ----------------
  results(run: RunState, cfg: RunConfig, extra: { best: number; newBest: boolean; daily: number }): void {
    this.hud.hidden = true;
    this.labels.replaceChildren();
    const share = run.kcal ? Math.round((run.kcalHealthy / run.kcal) * 100) : 100;
    const modeLabel = cfg.mode === 'daily' ? t('daily') : cfg.mode === 'zen' ? t('zen') : t('play');
    const tag = cfg.mode === 'daily' ? `#${extra.daily}` : cfg.bagId !== 'base' ? (() => { const b = ALL_BAGS.find((x) => x.id === cfg.bagId); return b ? bagName(b) : ''; })() : '';
    const receipt = drawReceipt(run, { modeLabel, dailyTag: tag });
    const img = el('img', { class: 'receipt-img', alt: t('share_receipt') });
    receipt.toBlob((b) => { if (b) img.src = URL.createObjectURL(b); });
    const actions = el('div', { class: 'stack' },
      button(`▶ ${t('play_again')}`, 'btn', () => this.host.start({ ...cfg, seed: undefined })),
      el('div', { class: 'row' },
        button(`🧾 ${t('share_receipt')}`, 'btn green small', () => void this.shareReceipt(receipt)),
        button(`📋 ${t('share_text')}`, 'btn ghost small', () => void this.copyText(emojiLine(run, tag || modeLabel))),
        cfg.mode !== 'daily' ? button(`🎯 ${t('challenge')}`, 'btn ghost small', () => void this.copyText(`${t('share_title')}\n${location.origin}${location.pathname}?seed=${cfg.seed}`)) : null,
        clip() ? button(`🎬 ${t('bleah_cam_save')}`, 'btn ghost small', () => this.saveClip()) : null,
      ),
      button(t('quit'), 'btn ghost', () => { this.close(); this.host.toTitle(); }),
    );
    const card = el('div', { class: 'card results' },
      el('h2', {}, t('results')),
      el('div', { class: `outcome ${run.outcome}` }, run.outcome === 'victory' ? `🌱 ${t('victory')}` : `🤢 ${t('defeat')}`),
      el('p', {}, t('outcome_rule')),
      el('div', { class: 'big' }, num(run.score)),
      cfg.trial ? el('div', { class: 'note' }, t('trial_end')) : el('div', { class: 'fine' }, extra.newBest ? `🏆 ${t('new_best')}` : `${t('local_best')}: ${num(extra.best)}`),
      el('div', { class: 'stats' },
        el('div', { class: 'stat' }, el('b', {}, num(run.kcal)), el('span', {}, t('kcal_eaten'))),
        el('div', { class: 'stat' }, el('b', {}, `${share}%`), el('span', {}, t('healthy_share'))),
        el('div', { class: 'stat' }, el('b', {}, `×${run.bestCombo}`), el('span', {}, t('best_combo')))),
      el('div', { class: 'fine' }, tp('bites', run.bites)),
      img,
      actions,
    );
    this.open(el('div', {}, card), 'results');
  }

  private async shareReceipt(c: HTMLCanvasElement): Promise<void> {
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
    if (!blob) return;
    const file = new File([blob], 'pikko-receipt.png', { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: t('share_title') }); return; }
    } catch { /* user cancelled: fall back to download only if share is unsupported */ return; }
    this.download(blob, 'pikko-receipt.png');
  }

  private async copyText(text: string): Promise<void> {
    try { await navigator.clipboard.writeText(text); this.toast(t('copied'), 'good'); } catch { window.prompt('', text); }
  }

  private saveClip(): void {
    const b = clip();
    if (!b) return;
    void audio.play('shutter', 0.8);
    this.download(b, `pikko-bleah.${b.type.includes('mp4') ? 'mp4' : 'webm'}`);
  }

  private download(blob: Blob, name: string): void {
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a);
    a.click();
    a.remove();
  }

  // ---------------- Pikko Mart ----------------
  mart(selected = 'base'): void {
    void audio.playMusic('M17_mart_loop');
    void audio.play('mart_cart', 0.5);
    const grid = el('div', { class: 'mart-grid' });
    // the bag of the player's language comes right after the free one
    const homeId = LANG_META[getLang()].bag;
    const rank = (b: Bag) => (b.id === 'base' ? 0 : b.id === homeId ? 1 : 2);
    for (const b of [...ALL_BAGS].sort((x, y) => rank(x) - rank(y))) {
      const live = isAccessLive(b.id);
      const cached = store.get<{ until: number | null }>(`unlocked.${b.id}`);
      const open = !!cached && (cached.until === null || cached.until * 1000 > Date.now());
      const tag = `${b.id === homeId ? '📍 ' : ''}${b.id === 'base' ? t('mart_free') : open ? '🔓' : live ? '🔒' : '⏳'}`;
      grid.append(button([el('span', { class: 'tag' }, tag), el('img', { class: 'bag-logo', src: b.logo, alt: '', loading: 'lazy' }), el('b', {}, bagName(b)), el('small', {}, t('mart_foods', { h: b.foods.filter((f) => isHealthy(f.grade)).length, j: b.foods.filter((f) => isJunk(f.grade)).length }))],
        `bag${b.id === 'base' ? ' free' : ''}${b.id === homeId ? ' home' : ''}`, () => { void audio.play('mart_bag', 0.7); this.mart(b.id); }, { 'aria-pressed': String(b.id === selected), 'aria-label': bagName(b) }));
    }
    const bag = ALL_BAGS.find((b) => b.id === selected)!;
    // country themes generated so far (the rest falls back to the Mart loop until generated)
    const theme = ({ italy: 'B01_mediterranean', poland: 'B02_polish_pantry' } as Record<string, string>)[selected];
    if (theme) void audio.playMusic(theme); else void audio.playMusic('M17_mart_loop');
    const card = el('div', { class: 'card' },
      el('div', { class: 'row', style: 'justify-content:space-between' }, el('h2', {}, `🛒 ${t('mart_title')}`), button(t('close'), 'btn ghost small', () => this.host.toTitle())),
      el('p', {}, t('mart_sub')),
      passRule() ? el('div', { class: 'note' }, `🍝 ${t('pass_note', { amount: num(Number(PASS_ACCESS.minimumTokens)) })}`) : null,
      grid,
      this.bagDetail(bag),
    );
    this.open(el('div', {}, card), 'mart');
    if (selected !== 'base') card.querySelector('.bag-detail')?.scrollIntoView({ block: 'start' });
    void this.syncPass(selected);
  }

  private lastPassSync = 0;
  /** With a connected wallet, one PASTA pass check opens (or closes) every bag in the Mart. UX cache only: playing re-checks. */
  private async syncPass(selected: string): Promise<void> {
    const wallet = wallets.wallet();
    if (!wallet || !passRule() || Date.now() - this.lastPassSync < 60_000) return;
    this.lastPassSync = Date.now();
    const st = await checkPass(wallet);
    if (st.kind !== 'unlocked' && st.kind !== 'locked') return; // unavailable: leave what the player already sees
    const before = JSON.stringify(ALL_BAGS.map((b) => store.get(`unlocked.${b.id}`)));
    this.cachePass(st);
    if (before !== JSON.stringify(ALL_BAGS.map((b) => store.get(`unlocked.${b.id}`))) && this.current === 'mart') this.mart(selected);
  }

  /** Remember the pass result for every country bag (bags with their own live token rule are left alone). */
  private cachePass(st: AccessState): void {
    for (const b of ALL_BAGS) {
      if (b.id === 'base' || ruleFor(b.id)?.verified) continue;
      store.set(`unlocked.${b.id}`, st.kind === 'unlocked' ? { until: st.until } : null);
    }
  }

  private bagDetail(bag: Bag): HTMLElement {
    const preview = el('div', { class: 'foods-preview' });
    for (const f of bag.foods) preview.append(el('span', { class: isHealthy(f.grade) ? 'h' : isJunk(f.grade) ? 'j' : '' }, foodName(f)));
    const head = el('div', { class: 'bag-head' }, el('img', { class: 'bag-logo-big', src: bag.logo, alt: bagName(bag) }),
      el('div', {}, el('h2', {}, bagName(bag)), el('div', { class: 'fine', style: 'text-align:start' }, t('mart_accessory', { acc: bagAccessory(bag) }))));
    const box = el('div', { class: 'bag-detail stack' }, head, el('div', { class: 'note' }, `🌍 ${bagFact(bag)}`), preview);
    if (bag.id === 'base') {
      box.append(button(`▶ ${t('mart_play')}`, 'btn', () => this.host.start({ mode: 'classic', bagId: 'base', trial: false })));
      return box;
    }
    const live = isAccessLive(bag.id);
    const unlocked = store.get<{ until: number | null }>(`unlocked.${bag.id}`);
    box.append(button(`🧪 ${t('mart_trial')}`, 'btn green', () => this.host.start({ mode: 'classic', bagId: bag.id, trial: true })));
    if (live && unlocked) box.append(button(`▶ ${t('mart_play')}`, 'btn', () => void this.playLive(bag)));
    if (!this.host.settings.kidMode || live) box.append(button(`🔓 ${t('mart_unlock')}`, 'btn ghost', () => this.adultGate(() => this.unlock(bag))));
    if (!live) box.append(el('div', { class: 'note' }, `⏳ ${t('mart_soon')}`));
    return box;
  }

  /** Re-check access right before playing a live bag (never trust a cached unlock). */
  private async playLive(bag: Bag): Promise<void> {
    const st = await checkBag(bag.id, wallets.wallet());
    if (st.kind === 'unlocked') this.host.start({ mode: 'classic', bagId: bag.id, trial: false });
    else this.unlock(bag);
  }

  // ---------------- grown-ups ----------------
  adultGate(then: () => void): void {
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    const input = el('input', { type: 'number', inputmode: 'numeric', 'aria-label': t('adult_q', { a, b }) });
    const msg = el('p', {});
    const card = el('div', { class: 'card stack' },
      el('h2', {}, `🔐 ${t('adult_title')}`),
      el('p', {}, t('adult_q', { a, b })), input, msg,
      el('div', { class: 'row' },
        button(t('adult_ok'), 'btn', () => { if (Number(input.value) === a * b) then(); else msg.textContent = t('adult_wrong'); }),
        button(t('back'), 'btn ghost', () => this.mart())),
    );
    this.open(el('div', {}, card), 'adult');
  }

  unlock(bag: Bag): void {
    const rule = passRule() ?? ruleFor(bag.id); // the PASTA pass is what players can lock today
    const live = isAccessLive(bag.id);
    const status = el('p', { 'aria-live': 'polite' });
    const walletRow = el('div', { class: 'row' });
    const render = (state: AccessState | null) => {
      walletRow.replaceChildren();
      const cur = wallets.wallet();
      if (cur) {
        walletRow.append(el('span', { class: 'chip' }, t('connected', { w: `${cur.slice(0, 4)}…${cur.slice(-4)}` })), button(t('disconnect'), 'btn ghost small', () => { void wallets.disconnect().then(() => render(null)); }));
        if (live) walletRow.append(button(t('recheck'), 'btn small', () => void doCheck()));
      } else {
        const opts = wallets.options();
        if (opts.length > 1) { // several wallets (e.g. desktop extensions): let the player choose
          for (const o of opts) walletRow.append(button([...(o.icon ? [el('img', { class: 'wallet-icon', src: o.icon, alt: '' })] : []), el('span', {}, o.name)], 'btn small', () => void doConnect(o.id)));
        } else walletRow.append(button(t('connect'), 'btn small', () => void doConnect()));
        // no wallet at all on a phone (e.g. iOS, or an Android browser without Mobile Wallet Adapter): offer the Phantom app
        if (!opts.length && wallets.isMobile()) walletRow.append(el('a', { class: 'btn ghost small', href: wallets.openInPhantomUrl() }, t('open_in_phantom')));
      }
      if (!state) return;
      if (state.kind === 'checking') status.textContent = t('checking');
      else if (state.kind === 'unlocked') {
        status.textContent = t('mart_unlocked_until', { date: state.until ? date(state.until) : '—' });
        if (state.via === 'pass') this.cachePass(state); else store.set(`unlocked.${bag.id}`, { until: state.until });
      }
      else if (state.kind === 'locked') { status.textContent = t('mart_locked'); store.set(`unlocked.${bag.id}`, null); if (passRule()) this.cachePass(state); }
      else if (state.kind === 'unavailable') status.textContent = t('check_failed');
      else if (state.kind === 'not_configured') status.textContent = t('mart_soon');
    };
    const doConnect = async (id?: string) => {
      status.textContent = t('wallet_connecting');
      try { await wallets.connect(id); status.textContent = ''; render(null); if (live) await doCheck(); }
      catch (e) { status.textContent = e instanceof Error && e.message === 'wallet_missing' ? t('phantom_missing') : t('wallet_rejected'); }
    };
    const doCheck = async () => { render({ kind: 'checking' }); render(await checkBag(bag.id, wallets.wallet())); };
    const tokenLabel = live && rule ? `${num(Number(rule.minimumTokens))}${rule === PASS_ACCESS ? ' PASTA' : ''} (${rule.mint})` : '—';
    const card = el('div', { class: 'card stack' },
      el('h2', {}, `🔓 ${bagName(bag)}`),
      el('p', { class: 'onboard' }, t('onboarding', { token: tokenLabel, bag: bagName(bag) })),
      !live ? el('div', { class: 'note' }, t('not_configured_note')) : null,
      rule === PASS_ACCESS ? el('div', { class: 'note' }, `🍝 ${t('pass_note', { amount: num(Number(PASS_ACCESS.minimumTokens)) })}`) : null,
      walletRow, status,
      el('div', { class: 'row' },
        el('a', { class: 'btn ghost small', href: DEVFRIDGE.app, target: '_blank', rel: 'noopener' }, t('lock_on_devfridge')),
        el('a', { class: 'btn ghost small', href: live && rule?.mint ? `${DEVFRIDGE.scan}/?mint=${rule.mint}` : DEVFRIDGE.scan, target: '_blank', rel: 'noopener' }, t('scan_link'))),
      el('div', { class: 'fine' }, t('ux_only_note')),
      button(t('back'), 'btn ghost', () => this.mart(bag.id)),
    );
    this.open(el('div', {}, card), 'unlock');
    render(null);
    // a wallet can register late (Mobile Wallet Adapter loads lazily): refresh the buttons, and stop listening once this dialog is gone
    const off = wallets.onOptionsChange(() => { if (this.current !== 'unlock') off(); else if (!wallets.wallet()) render(null); });
  }

  // ---------------- recipes ----------------
  recipes(): void {
    const seen = store.get<Record<string, number>>('recipes', {}) ?? {};
    const all = ALL_BAGS.flatMap((b) => b.foods);
    const grid = el('div', { class: 'recipes-grid' });
    const ids = Object.keys(seen).filter((id) => FOOD_BY_ID.has(id));
    // grouped by country ("taste passport"): logo + discovered foods of that bag
    for (const b of ALL_BAGS) {
      const mine = ids.filter((id) => FOOD_BY_ID.get(id)!.bag === b.id);
      if (!mine.length) continue;
      grid.append(el('div', { class: 'recipe-country' }, el('img', { src: b.logo, alt: '' }), el('b', {}, `${bagName(b)} · ${mine.length}/${b.foods.length}`)));
      for (const id of mine) {
        const f = FOOD_BY_ID.get(id)!;
        grid.append(el('div', { class: `recipe ${isHealthy(f.grade) ? 'h' : isJunk(f.grade) ? 'j' : ''}` }, `${foodName(f)} ×${seen[id]}`));
      }
    }
    const card = el('div', { class: 'card' },
      el('div', { class: 'row', style: 'justify-content:space-between' }, el('h2', {}, `📖 ${t('recipes_title')}`), button(t('close'), 'btn ghost small', () => this.host.toTitle())),
      el('p', {}, t('recipes_count', { n: ids.length, t: all.length })),
      ids.length ? grid : el('p', {}, t('recipes_empty')),
    );
    this.open(el('div', {}, card), 'recipes');
  }

  // ---------------- settings ----------------
  settings(back?: () => void): void {
    const s = this.host.settings;
    const langSel = el('select', { 'aria-label': t('language') });
    for (const l of LANGS) langSel.append(el('option', { value: l, ...(l === getLang() ? { selected: '' } : {}) }, LANG_META[l].native));
    langSel.addEventListener('change', () => { void setLang(langSel.value as Lang).then(() => this.settings(back)); });
    const qSel = el('select', { 'aria-label': t('quality') });
    for (const q of ['high', 'medium', 'low'] as Quality[]) qSel.append(el('option', { value: q, ...(q === s.quality ? { selected: '' } : {}) }, t('q_' + q)));
    qSel.addEventListener('change', () => { s.quality = qSel.value as Quality; this.host.applySettings(); });
    const sound = button(s.sound ? `🔊 ${t('on')}` : `🔇 ${t('off')}`, 'btn ghost small', () => { s.sound = !s.sound; this.host.applySettings(); this.settings(back); });
    const kid = button(s.kidMode ? `✅` : `⬜`, 'btn ghost small', () => { s.kidMode = !s.kidMode; this.host.applySettings(); this.settings(back); }, { 'aria-pressed': String(s.kidMode) });
    const card = el('div', { class: 'card stack' },
      el('h2', {}, `⚙️ ${t('settings')}`),
      el('label', { class: 'field' }, t('language'), langSel),
      el('div', { class: 'switch' }, el('span', {}, t('sound')), sound),
      el('label', { class: 'field' }, t('quality'), qSel),
      el('div', { class: 'switch' }, el('span', {}, t('kid_mode')), kid),
      button(`❓ ${t('tut_again')}`, 'btn ghost small', () => this.showTutorial(() => this.settings(back))),
      el('p', { class: 'fine' }, t('blockout_note')),
      el('p', { class: 'fine' }, t('disclaimer')),
      button(t('back'), 'btn', () => (back ? back() : this.host.toTitle())),
    );
    this.open(el('div', {}, card), 'settings');
  }
}

export function recordRecipe(f: Food): boolean {
  const seen = store.get<Record<string, number>>('recipes', {}) ?? {};
  const isNew = !seen[f.id];
  seen[f.id] = (seen[f.id] ?? 0) + 1;
  store.set('recipes', seen);
  return isNew;
}

export type { Mode };
