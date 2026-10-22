import './style.css';
import { audio } from './audio/audio';
import { Game, type RunConfig } from './game';
import { initWallets } from './access/wallet';
import { initLang, t } from './i18n';
import { Pikko } from './render/pikko';
import { Stage } from './render/scene';
import { store } from './storage';
import { recordRecipe, type Settings, Ui, type UiHost } from './ui/ui';

const boot = document.getElementById('boot')!;
const bootMsg = document.getElementById('boot-msg')!;
await initLang();

function webglOk(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

if (!webglOk()) {
  bootMsg.textContent = t('webgl_missing');
} else {
  bootMsg.textContent = t('loading');
  start();
}

function start(): void {
  const settings: Settings = { sound: true, quality: defaultQuality(), kidMode: true, ...(store.get<Partial<Settings>>('settings', {}) ?? {}) };
  const stage = new Stage(document.getElementById('stage')!);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pikko = new Pikko(settings.quality === 'high');
  pikko.reducedMotion = reduced.matches;
  let ui: Ui;

  const game = new Game(stage, pikko, {
    hud: () => ui.renderHud(game),
    toast: (text, kind) => ui.toast(text, kind),
    fact: (text, good) => ui.fact(text, good),
    scriptBite: (res, f, round) => ui.tutorialBite(res, f, round),
    scriptReady: () => ui.tutorialReady(),
    discovered: (f) => { if (recordRecipe(f)) void audio.play('page_turn', 0.5); },
    ended: (run, cfg) => {
      let best = 0;
      let newBest = false;
      if (!cfg.trial) {
        const key = cfg.mode === 'daily' ? `best.daily.${game.dailyNumber}` : cfg.bagId !== 'base' ? `best.bag.${cfg.bagId}` : `best.${cfg.mode}`;
        best = store.get<number>(key, 0) ?? 0;
        if (run.score > best) { store.set(key, run.score); newBest = best > 0; best = run.score; }
      }
      void audio.playTrack('M18_results', 0.8);
      ui.results(run, cfg, { best, newBest, daily: game.dailyNumber });
    },
  });

  const host: UiHost = {
    game,
    settings,
    start(cfg: RunConfig) {
      void audio.unlock();
      audio.stopTrack();
      ui.close();
      ui.showHud();
      game.start(cfg);
    },
    applySettings() {
      store.set('settings', settings);
      audio.setMuted(!settings.sound);
      stage.setQuality(settings.quality);
    },
    toTitle() {
      game.quit();
      pikko.reset();
      pikko.setAccessory('base');
      audio.stopTrack();
      ui.title();
    },
    setPaused(p: boolean) {
      game.setPaused(p);
    },
    setView(v) {
      stage.setView(v);
    },
    stopGame() {
      game.quit();
      pikko.reset();
      pikko.setAccessory('base');
      audio.stopTrack();
      void audio.playMusic('M10_menu_loop');
      stage.setView('title');
    },
  };
  ui = new Ui(host);
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__pikko = { stage, pikko, game, ui };
  stage.setQuality(settings.quality);
  pikko.setAccessory('base');
  void initWallets(); // Android Chrome: registers Mobile Wallet Adapter (Seeker); a no-op everywhere else

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (ui.current === 'none' && game.active) ui.pause();
      else if (ui.current === 'pause') { ui.close(); host.setPaused(false); }
      return;
    }
    if (ui.current === 'none' && ['1', '2', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) { e.preventDefault(); game.key(e.key); }
  });

  // background / screen lock: pause and suspend audio; resume needs a tap
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
      if (game.active && ui.current === 'none') ui.pause();
    }
  });
  window.addEventListener('pointerdown', () => { if (!audio.running) void audio.unlock(); }, { passive: true });

  // WebGL context loss
  const canvas = stage.renderer.domElement;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); host.setPaused(true); boot.hidden = false; bootMsg.textContent = t('webgl_lost'); });
  canvas.addEventListener('webglcontextrestored', () => { boot.hidden = true; if (game.active) ui.pause(); });

  // render loop (fixed-step simulation, bounded catch-up; paused when hidden)
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    let dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 5) { game.update(STEP); acc -= STEP; steps++; }
    if (steps === 5) acc = 0;
    dt = Math.max(dt, 0.0001);
    pikko.update(dt, stage.camera);
    stage.render(dt, reduced.matches);
    ui.updateLabels(game);
    if (game.active) ui.updateTimer(game);
  };
  requestAnimationFrame(frame);

  // start screen: one tap unlocks audio (browsers require a gesture)
  bootMsg.replaceChildren();
  const go = document.createElement('button');
  go.className = 'btn';
  go.textContent = t('tap_start');
  bootMsg.append(go);
  go.focus();
  const params = new URLSearchParams(location.search);
  const seed = Number(params.get('seed'));
  go.addEventListener('click', async () => {
    await audio.unlock();
    audio.setMuted(!settings.sound);
    boot.hidden = true;
    if (Number.isFinite(seed) && seed > 0) ui.run({ mode: 'classic', bagId: 'base', trial: false, seed: seed >>> 0 });
    else ui.title();
  }, { once: true });
}

function defaultQuality(): 'high' | 'medium' | 'low' {
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  if (!mobile && cores >= 6) return 'high';
  return mobile && cores <= 4 ? 'low' : 'medium';
}
