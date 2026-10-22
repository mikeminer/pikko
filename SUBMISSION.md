# SUBMISSION — PIKKO: Yum or Bleah!

Gallery submission for the DevFridge project gallery. Dates: built 2026-10-03 → 2026-10-04. Prizes, dates and competition
eligibility are to be announced; this is a showcase entry, not a claim to any reward.

## Project

- **Name / pitch:** PIKKO — drag the healthier of two foods to a hungry vinyl-toy creature, learn what is in your food and discover foods from 24 countries.
- **Community:** PIKKO (country-bag tokens on Pump.fun are **not launched yet**; see "Access").
- **Team / public contact:** GitHub `mikeminer`. (No other public contact is published.)
- **Playable HTTPS URL (free practice):** https://mikeminer.github.io/pikko/
- **Source:** https://github.com/mikeminer/pikko — the reviewed commit SHA is pinned in the gallery entry; links to this file and to
  `BUILD_LOG.md` / `VERIFICATION.md` point at that same commit.
- **Demo:** the live game *is* the demo: open the URL → "Play" runs the in-game tutorial with two guided practice rounds, no wallet required.
  **No recorded gameplay video exists yet** (see Limitations).

## The game loop

Each round shows 2 foods. Drag one to Pikko's mouth (or press 1/2 + Enter). Healthy food = happy Pikko and points; junk food = a
disgusted face, a dodge attempt and a penalty. The belly fills with kcal; a day (40 rounds, breakfast → dinner) is won when at least
half of the kcal are healthy. Eating junk 3 times in a row makes Pikko "used to it" (he then grimaces at healthy food); 3 healthy
in a row reset his palate (+300). Junk is always penalised. Bonuses: healthy combos, rainbow colours, smart choice, water every 8 rounds.
Modes: Classic (40 rounds), Daily menu (20 identical rounds for everyone), Zen (no timer).

## Access (token gating)

- **Network:** Solana mainnet. The game never creates a lock or approves spending. A wallet is used to read the connected public key; the **only** transaction the game can ask a wallet to sign is the optional **0.001 SOL pay-per-round** transfer described under "Modes" below (a plain System Program transfer the player approves in the wallet; nothing is signed or sent during review or tests).
- **Wallets (Wallet Standard):** desktop extensions (Phantom, Solflare, Backpack…), the Phantom in-app browser (injected `window.phantom.solana`), and — on **Android Chrome over HTTPS, e.g. the Solana Seeker** — **Mobile Wallet Adapter** (Seed Vault Wallet, Solflare, Phantom) via `@solana-mobile/wallet-standard-mobile`, loaded lazily only on Android. With several wallets the player picks one; with none (e.g. iOS) a user-clicked "Open in Phantom" link is offered. Not available: iOS browsers, and Android browsers other than Chrome (a limit of MWA).
- **Interim pass:** one active DevFridge lock of **at least 5,000,000 PASTA** unlocks **every** country bag.
  - Mint: `39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump` (source: https://docs.devfridge.cool/tokenomics). Read-only on-chain check on 2026-10-04:
    owner program **Token-2022**, **6 decimals**, no mint authority, no freeze authority, extensions `metadataPointer` + `tokenMetadata` (name "pappardelle", symbol PASTA).
  - Minimum raw amount: `5000000000000`. **Aggregation: `single`** (one lock must reach the minimum; several small locks do not add up).
  - **Duration:** any. The lock only has to be **active now** (unlock time in the future). Expiry removes access at the next check.
  - Evidence: `https://scan.devfridge.cool/api/sdk/check?wallet=…&mint=…`, strictly validated (wallet/mint/depositor identity, duplicate lock ids,
    raw amounts, times); evidence older than 90 s, malformed or failed responses are "unavailable", never "unlocked" or "locked". Re-check at the next boundary / every 60 s and before each play.
- **Country tokens:** pre-launch. Each of the 24 bags has a `mint: null` placeholder and is "not configured" until a verified mint, decimals and minimum are set
  (Token-2022 owner, extensions and the redemption route must be checked first). When live, a bag opens with the pass **or** its own token.
- **Fees and limits shown before any lock:** no early withdrawal; on redemption DevFridge takes **2%** of the vault to buy and burn PASTA
  (PASTA vaults are burned directly); network fees are separate; non-PASTA tokens also need an executable Jupiter route, so an illiquid or ungraduated token may not be redeemable at expiry. Not financial advice; nothing here promises a price or income.
- **Browser check is UX only.** Downloaded code and assets are not protected; protecting content would need server-side wallet challenge + fresh lock verification.
- **No reviewer needs tokens:** every bag has a free 5-round trial and the starter bag is free; Kids mode (default) hides crypto UI behind an adult gate, and **Grown-ups mode opens every bag for free, with promotions**.

## Modes, promotions and pay-per-round

- **Kids mode** (default, chosen on first launch). No promotions. Starter bag and 5-round trials are free. To play a full country bag an adult (after the adult question) either uses a **DevFridge lock** (the PASTA pass above) **or pays 0.001 SOL for ONE round**: a System Program transfer from the connected wallet to `AXomB2bpJ7F3EFVPQwrwBV4yVE7bazshZaVa64KhGCfE`, a DevFridge vault used to buy and burn PASTA (stated by the owner; on-chain it is a System-owned account that receives 0.001 SOL transfers from several wallets and from which a transaction through the Fridge program `9RY54dNP…` spends SOL via Jupiter and pump AMM swaps and token instructions) (no refunds; network fee extra; the player is told in the dialog that the payment buys and burns PASTA, CA `39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump`; the publisher does not receive it). Before the round starts the game reads the transaction back from a public RPC and requires: succeeded, system transfer, sender = connected wallet, recipient = the address above, at least 1,000,000 lamports, block time within 5 minutes, signature never used before. A signature is remembered locally so it buys one round only. Like the lock check this runs in the browser: it is a convenience, not security.
- **Grown-ups mode** (switch needs the adult question). Every bag is open for free. Two promotions the owner chose (skill v1.5.3, references/free-play-sponsors.md): (1) an **OnlyFridge Club** dialog before every new round (first run and retries; never on pause/resume or in the tutorial; bundled text, works offline, a prominent *Continue playing* button, an optional *Discover* link to `https://club.devfridge.cool/download/onlyfridge-club` that opens in a new tab); (2) a **sponsored-token / YOUR AD HERE** card above the game on the title and around rounds. The card comes from `GET /api/sponsors`, a same-origin adapter (a Vercel function) over `https://scan.devfridge.cool/api/feed/boosted` with a fixed upstream, 4 s timeout, no redirects, byte caps, 60 s cache, expired records dropped, mints/logos/URLs validated and destinations built locally; no wallet, score or identifier is sent. When nothing valid is available the card says YOUR AD HERE and links to `https://scan.devfridge.cool/#feature`. On hosts without the adapter (GitHub Pages) it is always YOUR AD HERE. An ad click pauses a round and never grants access.
- Neither promotion appears in Kids mode, in the tutorial, or in a round an adult opened with a lock or a payment. Prices of placements are not shown or sold in the game.

## Score authority

Scores, bests and the Recipe Book are **local to the browser** (localStorage). There is no server, no ranking, no rewards and no anti-cheat.

## Asset rights

- **Code:** written for this project (see BUILD_LOG.md). Dependencies: `three` (MIT), `vite`, `typescript`, `vitest` and their dev dependencies (MIT/Apache-2.0); versions pinned in `pikko-game/package-lock.json`.
- **Pikko, foods, UI, logos:** procedural Three.js geometry/materials and original vector (SVG) art made for PIKKO. No third-party images, models or fonts. Logos use colour palettes inspired by countries, not flags or national emblems.
- **Audio (77 files in `pikko-game/public/audio`):** AI-generated by the project owner (with another AI assistant) on 2026-10-03, before this build — music with Google Gemini's music generation,
  sound effects and voices with ElevenLabs (the generator is recorded per take in the owner's credits file for part of the takes only).
  Provenance and SHA-256 per file are in `pikko-game/public/audio/manifest.json`. **Most cues are still marked `candidate_not_approved`**:
  the owner has approved only the four Italian "Gnam" character references, theme Demo A, the victory sound and the English defeat voice;
  the Italian and Polish defeat voices were generated but not yet chosen. The owner must confirm the commercial-use terms of both generators before any token launch.
- **Food/country facts and kcal values:** written for this project; kcal are approximations that still need a nutrition review. Grades are an internal "Pikko score", not Nutri-Score.
- **Licence:** none chosen yet; all rights reserved by default.

## AI contributions and human review

- **Claude Code (Anthropic)** wrote the game code, tests, documentation, catalogue, logos, wordmark and all translations; see `BUILD_LOG.md` for the prompts and steps.
- **The owner** set every product decision (name, mechanics, habit rule, bags per country, access rule and PASTA amount, languages) and supplied the audio.
- **Pre-existing work:** the audio sources (generated 2026-10-03 and not included in this repository except the 77 web-ready files). Dependency versions match an earlier, unrelated project in the same folder, which is **not** part of this repository.
  All game code, art, texts and docs in this repository were produced in this build.

## Setup

```sh
cd pikko-game && npm ci && npm run dev      # http://127.0.0.1:5180
npm test && npm run build
```
Environment variables: none for the game. `tools/build_audio.py` (optional) needs `PIKKO_AUDIO_SRC` (path to the generated audio sources, not in this repo).
Tested in desktop Chrome (headless, software WebGL) with emulated viewports; see `VERIFICATION.md`.

## Limitations (honest list)

1. **No recorded gameplay video yet.** `demoUrl` points to the live game's free tutorial/practice.
2. **No real-phone, real-Seeker or real-wallet test.** Mobile Wallet Adapter registration was verified in **emulated Android Chrome** with the real package (it registers and launches the `solana-wallet:/v1/associate/local?…` association), but the round trip to Seed Vault Wallet / Solflare / Phantom on a physical Seeker has **not** been tested. Wallet connection and lock states were exercised with **mock wallets** and **mock DevFridge responses**; nothing was signed on mainnet and no lock was created.
3. Only desktop Chrome was used; Safari, Firefox and real mobile browsers were not tested.
4. **17 of the 20 languages are machine translations** awaiting native review (EN/IT/PL are the author's base texts; the Polish still wants a native read). Recorded voices exist only in EN/IT/PL; other languages use the English voice.
5. Food models are procedural (blockout) until HD models exist; many audio cues are candidates and 22 country music themes have not been generated yet.
6. kcal values and health copy are unreviewed by a nutritionist.
7. Country tokens, their mints and the final access thresholds are not launched; the 5,000,000 PASTA pass is an interim rule chosen by the owner.
8. No server-side verification, no score authority, no licence file.
9. **Pay-per-round has never been tested with a real payment** (no mainnet transaction was sent for the tests). The transfer bytes were checked by the real Solana runtime through a read-only `simulateTransaction`, and the flow with fake wallets and fake RPC answers; the wallet prompt on a physical Seeker, and the on-chain read-back after a real payment, are untested. The recipient is described as a DevFridge buy-and-burn vault on the owner's word plus read-only on-chain evidence (above); its upgrade authority and the vault's burn mechanics were not audited by this project.
10. The sponsor feed had no active sponsors when checked (YOUR AD HERE was the only state seen live); the sponsor card with a real boost was exercised with a mock adapter answer only. The public privacy text must still be updated for the sponsor feed, the RPC provider and the optional payment.
