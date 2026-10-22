// Grown-ups mode: every run is "free play with promotions" (the Mart is open) and carries the two placements the
// owner approved: OnlyFridge Club before each new round, and a sponsored-token / YOUR AD HERE card above the game.
// Kids mode never shows either: bags there are opened by an adult with a DevFridge lock or a paid round.
// Contract: https://world.devfridge.cool/skill (references/free-play-sponsors.md). Never in the tutorial.
import type { RunConfig } from '../game';

export const OFC_DOWNLOAD_URL = 'https://club.devfridge.cool/download/onlyfridge-club';
export const FEATURE_URL = 'https://scan.devfridge.cool/#feature';

/** The OnlyFridge Club promotion comes before every new round (first run and retries) in grown-ups mode; tutorial practice is exempt. */
export function promoDue(cfg: RunConfig, kidMode: boolean): boolean {
  return !kidMode && !cfg.script;
}

export type Screen = string;
/** The sponsor card is visible on the title and around promoted runs in grown-ups mode; never elsewhere. */
export function sponsorVisible(opts: { kidMode: boolean; screen: Screen; lastRunPromoted: boolean }): boolean {
  if (opts.kidMode) return false;
  if (opts.screen === 'title') return true;
  return opts.lastRunPromoted && (opts.screen === 'none' || opts.screen === 'pause' || opts.screen === 'results');
}
