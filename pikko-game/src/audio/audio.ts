// WebAudio manager: lazy-loaded sounds from public/audio/manifest.json, sample-accurate music loops,
// habit-aware music colouring, synthesized stingers for cues that have not been generated yet
// (S10 combo, S11 habit, S12 palate reset, S13 rainbow, S14 perfect day, S17 timer, S20 sugar rush).
type VoiceLang = 'en' | 'it' | 'pl';

interface Entry { url: string; kind: string; sampleRate: number; durationS: number; status: string; loop?: { lengthSamples: number; signature1024: string } }
interface Manifest { sounds: Record<string, Entry> }

// tempo of each loop (measured, PIKKO_loop_masters_v0.1 reports) for tempo-synced timer ticks
export const LOOP_BPM: Record<string, number> = {
  M10_menu_loop: 105.01, M11_breakfast_loop: 105.0, M12_lunch_loop: 110.04, M13_snack_loop: 126.01, M14_dinner_loop: 128.01,
  M17_mart_loop: 104.04, B01_mediterranean: 110, B02_polish_pantry: 120, B03_street_food: 100, B04_breakfast: 104,
  B06_christmas: 110, B07_halloween: 120, B08_spring_easter: 108, B09_summer_beach: 110,
};

// C major pentatonic: fits the C / F / G centred tracks (see RAPPORTO_LOOP_E_M04.md)
const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export type Habit = 'neutral' | 'healthy' | 'junk';

class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private lowpass!: BiquadFilterNode;
  private shelf!: BiquadFilterNode;
  streamDest: MediaStreamAudioDestinationNode | null = null;
  private manifest: Manifest | null = null;
  private manifestP: Promise<Manifest> | null = null;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private loopPoints = new Map<string, [number, number]>();
  private music: { id: string; src: AudioBufferSourceNode; gain: GainNode; startedAt: number } | null = null;
  private oneShotMusic: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private muted = false;
  private lastPick = new Map<string, string>();
  private habit: Habit = 'neutral';

  /** Must be called from a user gesture. */
  async unlock(): Promise<void> {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      try { this.streamDest = this.ctx.createMediaStreamDestination(); this.master.connect(this.streamDest); } catch { this.streamDest = null; }
      this.lowpass = this.ctx.createBiquadFilter();
      this.lowpass.type = 'lowpass';
      this.lowpass.frequency.value = 20000;
      this.shelf = this.ctx.createBiquadFilter();
      this.shelf.type = 'highshelf';
      this.shelf.frequency.value = 3500;
      this.shelf.gain.value = 0;
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.9;
      this.musicBus.connect(this.lowpass).connect(this.shelf).connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
    }
    if (this.ctx.state !== 'running') { try { await this.ctx.resume(); } catch { /* needs another gesture */ } }
    void this.loadManifest();
  }

  get running(): boolean { return !!this.ctx && this.ctx.state === 'running'; }

  suspend(): void { void this.ctx?.suspend(); }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05);
  }

  private loadManifest(): Promise<Manifest> {
    this.manifestP ??= fetch('audio/manifest.json').then((r) => r.json()).then((m: Manifest) => (this.manifest = m)).catch(() => (this.manifest = { sounds: {} }));
    return this.manifestP;
  }

  has(id: string): boolean { return !!this.manifest?.sounds[id]; }

  load(id: string): Promise<AudioBuffer | null> {
    let p = this.buffers.get(id);
    if (!p) {
      p = (async () => {
        const man = await this.loadManifest();
        const e = man.sounds[id];
        if (!e || !this.ctx) return null;
        try {
          const data = await (await fetch(e.url)).arrayBuffer();
          const buf = await this.ctx.decodeAudioData(data);
          if (e.loop) this.loopPoints.set(id, this.alignLoop(buf, e));
          return buf;
        } catch {
          return null;
        }
      })();
      this.buffers.set(id, p);
    }
    return p;
  }

  preload(ids: string[]): Promise<unknown> { return Promise.all(ids.map((i) => this.load(i))); }

  /** Finds the true loop start in the decoded buffer (MP3 decoders may add priming silence). */
  private alignLoop(buf: AudioBuffer, e: Entry): [number, number] {
    const lenS = e.loop!.lengthSamples / e.sampleRate;
    const ratio = buf.sampleRate / e.sampleRate;
    const expected = Math.round(e.loop!.lengthSamples * ratio);
    const extra = buf.length - expected;
    if (extra <= 2) return [0, Math.min(lenS, buf.duration)];
    const raw = atob(e.loop!.signature1024);
    const sig16 = new Int16Array(raw.length / 2);
    for (let i = 0; i < sig16.length; i++) sig16[i] = (raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8)) << 16 >> 16;
    const L = Math.floor(sig16.length * ratio);
    const sig = new Float32Array(L);
    for (let i = 0; i < L; i++) { const x = i / ratio; const a = Math.floor(x); const f = x - a; sig[i] = ((sig16[a] ?? 0) * (1 - f) + (sig16[a + 1] ?? 0) * f) / 32768; }
    const ch0 = buf.getChannelData(0);
    const ch1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : ch0;
    let best = 0, bestC = -Infinity;
    const maxOff = Math.min(extra, 8192);
    for (let off = 0; off <= maxOff; off++) {
      let dot = 0, nn = 0;
      for (let i = 0; i < L; i += 2) { const v = (ch0[off + i] + ch1[off + i]) * 0.5; dot += v * sig[i]; nn += v * v; }
      const c = dot / Math.sqrt(nn + 1e-9);
      if (c > bestC) { bestC = c; best = off; }
    }
    const start = best / buf.sampleRate;
    return [start, start + lenS];
  }

  async playMusic(id: string, fade = 0.8): Promise<void> {
    if (!this.ctx) return;
    if (this.music?.id === id) return;
    const buf = await this.load(id);
    if (!buf || !this.ctx) return;
    if (this.music?.id === id) return;
    this.stopMusic(fade);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const lp = this.loopPoints.get(id);
    if (lp) { src.loop = true; src.loopStart = lp[0]; src.loopEnd = lp[1]; }
    src.playbackRate.value = this.habit === 'junk' ? 0.965 : 1;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + fade);
    src.connect(gain).connect(this.musicBus);
    src.start(this.ctx.currentTime, lp ? lp[0] : 0);
    this.music = { id, src, gain, startedAt: this.ctx.currentTime - (lp ? 0 : 0) };
  }

  stopMusic(fade = 0.6): void {
    if (!this.ctx || !this.music) return;
    const { src, gain } = this.music;
    gain.gain.cancelScheduledValues(this.ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fade);
    src.stop(this.ctx.currentTime + fade + 0.05);
    this.music = null;
  }

  currentMusic(): string | null { return this.music?.id ?? null; }

  /** Plays a non-looping track (song, results). Returns a stop function. */
  async playTrack(id: string, volume = 1, onEnd?: () => void): Promise<() => void> {
    this.stopTrack();
    const buf = await this.load(id);
    if (!buf || !this.ctx) return () => {};
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(this.musicBus);
    src.onended = () => { if (this.oneShotMusic?.src === src) this.oneShotMusic = null; onEnd?.(); };
    src.start();
    this.oneShotMusic = { src, gain };
    return () => this.stopTrack();
  }

  stopTrack(): void {
    if (!this.ctx || !this.oneShotMusic) return;
    const { src, gain } = this.oneShotMusic;
    gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    try { src.stop(this.ctx.currentTime + 0.4); } catch { /* already stopped */ }
    this.oneShotMusic = null;
  }

  /** Junk habit: duller, slower; healthy habit: brighter (stand-in for the missing M15/M16 loops). */
  setHabit(h: Habit): void {
    this.habit = h;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.lowpass.frequency.setTargetAtTime(h === 'junk' ? 1300 : 20000, t, 0.4);
    this.shelf.gain.setTargetAtTime(h === 'healthy' ? 3.5 : 0, t, 0.4);
    if (this.music) this.music.src.playbackRate.setTargetAtTime(h === 'junk' ? 0.965 : 1, t, 0.5);
  }

  async play(id: string, vol = 1, rate = 1): Promise<void> {
    if (!this.ctx || this.muted) { if (!this.ctx) return; }
    const buf = await this.load(id);
    if (!buf || !this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g).connect(this.sfxBus);
    src.start();
  }

  /** Random variant without repeating the previous one. */
  playOneOf(ids: string[], vol = 1): Promise<void> {
    const avail = ids.filter((i) => this.has(i));
    if (!avail.length) return Promise.resolve();
    const key = ids.join('|');
    const prev = this.lastPick.get(key);
    const pool = avail.length > 1 ? avail.filter((i) => i !== prev) : avail;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    this.lastPick.set(key, pick);
    return this.play(pick, vol);
  }

  voice(kind: 'yum' | 'bleah', lang: VoiceLang, mega = false): Promise<void> {
    const n = kind === 'yum' && lang === 'it' ? 4 : 3;
    const ids = Array.from({ length: n }, (_, i) => `${kind}_${lang}_${i + 1}`);
    if (kind === 'bleah' && mega) return this.playOneOf([`bleah_${lang}_2`, `bleah_${lang}_3`]);
    return this.playOneOf(ids);
  }

  // ---------- synthesized stingers ----------
  private tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, glideTo?: number): void {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(this.sfxBus);
    o.start(at);
    o.stop(at + dur + 0.02);
  }

  private marimba(freq: number, at: number, vol = 0.22): void {
    this.tone(freq, at, 0.45, 'sine', vol);
    this.tone(freq * 4, at, 0.08, 'sine', vol * 0.25);
  }

  combo(level: number): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const n = Math.min(5, Math.max(1, level));
    for (let i = 0; i < n; i++) this.marimba(PENTA[2 + i], t + i * 0.07, 0.16);
    if (n >= 5) this.tone(PENTA[9], t + 0.4, 0.6, 'triangle', 0.08);
  }

  habitJunk(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(220, t, 0.9, 'sawtooth', 0.12, 70);
    this.tone(110, t + 0.05, 1.0, 'triangle', 0.18, 55);
    this.tone(880, t + 0.1, 0.8, 'sine', 0.05, 300); // slide whistle
  }

  palateReset(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(180, t, 0.25, 'sine', 0.25, 720); // boing
    [0, 2, 4, 5, 7].forEach((k, i) => this.marimba(PENTA[k + 2], t + 0.25 + i * 0.08, 0.18));
    this.tone(PENTA[9], t + 0.7, 0.8, 'triangle', 0.1);
  }

  rainbow(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    PENTA.forEach((f, i) => this.tone(f, t + i * 0.06, 0.5, 'triangle', 0.08));
  }

  fanfare(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.4]].forEach(([f, d]) => { this.tone(f, t + d, 0.5, 'square', 0.05); this.tone(f / 2, t + d, 0.5, 'triangle', 0.1); });
  }

  sugarRush(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 12; i++) this.tone(PENTA[i % PENTA.length] * 1.5, t + i * 0.035, 0.08, 'square', 0.04);
    this.tone(900, t + 0.5, 0.9, 'sine', 0.08, 120);
  }

  pop(freq = 700): void { if (this.ctx) this.tone(freq, this.ctx.currentTime, 0.12, 'sine', 0.12, freq * 1.6); }

  /** Woodblock tick on the beat of the current loop (keeps the timer in time with the music). */
  tick(strong = false): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(strong ? 1600 : 1250, t, 0.06, 'triangle', strong ? 0.18 : 0.12);
  }

  beatPeriod(): number {
    const id = this.music?.id;
    return 60 / (id && LOOP_BPM[id] ? LOOP_BPM[id] : 120);
  }
}

export const audio = new AudioEngine();
