# VERIFICATION — what was actually checked (and what was not)

All checks were run by the AI agent on 2026-10-04 on Windows 11 with Node 24 and desktop Chrome (headless, software WebGL via SwiftShader).
Nothing below involved a real wallet, a real lock, a purchase or a mainnet transaction.

## Automated (reproduce from the pinned commit)

```sh
cd pikko-game && npm ci
npm test            # Test Files 7 passed (7) · Tests 92 passed (92)
npx tsc --noEmit    # clean
npm run build       # production build OK (dist/assets/index-*.js ≈ 790 kB, 221 kB gzip)
```

| Test file | Covers |
| --- | --- |
| `tests/rules.test.ts` | bites and kcal, palate habit (3 junk / 3 healthy), combo, repetition, rainbow, +300 reset, 40 rounds, 50% outcome threshold |
| `tests/rounds.test.ts` | seeded rounds, 70/30 bag/base pool, daily seed |
| `tests/access.test.ts` | exact decimal→raw conversion; evaluator (aggregation, expiry, stale / foreign / duplicate / malformed evidence → fail closed); **PASTA pass** (below) |
| `tests/visuals.test.ts` | all 509 foods map to a 3D archetype (fewer than 30 generic fallbacks); junk never counts for the rainbow |
| `tests/locales.test.ts` | each of the 17 extra languages has every UI key with identical `{placeholders}`, all 510 food names, all 25 bags; every language has its own home bag |
| `tests/tutorial.test.ts` | practice foods exist with one healthy + one junk each; step order; tutorial text present in all 20 languages |

**Gate boundaries tested (PASTA pass, with fixture responses):** exactly 5,000,000 PASTA (`5000000000000` raw) unlocks all 24 bags; one raw unit less (`4999999999999`)
does not; two locks of 3,000,000 do not (aggregation `single`); an expired lock does not; no lock does not; HTTP 500, evidence older than 90 s and a lock whose
depositor is another wallet are all "unavailable" (never "unlocked"); no wallet → no network call; the starter bag is free and never calls the network.

## On-chain and API reads (read-only)

- `getAccountInfo` on mainnet RPC for `39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump` (2026-10-04): owner `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` (Token-2022),
  type `mint`, **decimals 6**, supply `963341299993977` raw, mint authority `null`, freeze authority `null`, extensions `metadataPointer` + `tokenMetadata` (name "pappardelle", symbol "PASTA").
- `GET https://scan.devfridge.cool/api/sdk/check?wallet=11111111111111111111111111111111&mint=<PASTA mint>` → HTTP 200 with
  `{wallet, mint, locks: [], activeLocks: [], bestLock: null, daysRemaining: 0, ts}`: the response shape the gate expects.

## Browser checks (Chrome, scripted)

- **Full playthroughs, no page errors:** starter bag (EN), Poland, Japan (JA), Morocco (AR, right-to-left), Ukraine (UK), Russia (RU), Indonesia (ID), Philippines (FIL): habit flips, +300 reset, end of day, results/receipt.
- **Tutorial:** first run opens it instead of the game; cards, two practice rounds (coach text adapts to the food chosen), pause/skip inside practice, real game starts afterwards, second "Play" goes straight to the game;
  grown-ups card only with kid mode off; Arabic RTL, Japanese, Thai and Hindi cards render.
- **Access UI with MOCK wallets (public key only) and MOCK DevFridge responses:** a 5,000,000 PASTA lock → all bags show 🔓 and "Play this bag"; a smaller lock → all stay 🔒. Only the PASTA mint is requested.
- **Wallet connection (`tests/wallet.test.ts`, 18 tests with fake Wallet Standard wallets):** discovery (Solana wallets only, de-duplicated, icons restricted to `data:image`), single wallet connects directly, several wallets need a choice, late registration of Mobile Wallet Adapter, rejection leaves no state, account switched/removed inside the wallet, non-base58 account refused, disconnect, legacy `window.phantom.solana`, and the player-facing names (Mobile Wallet Adapter shown as "Seeker (Android)"; the connected wallet is named, and the name clears on disconnect). In the unlock dialog a chip says what was found ("Detected: Phantom", "Detected: Seeker (Android)", "No wallet detected") and after connecting "Connected: <wallet> · <key>".
- **Seeker emulation (Android 15 UA, ~436×800 CSS px at 2.75 DPR, real touch events):** the first-run tutorial opens, a **touch drag** of the healthy food to Pikko's mouth is eaten (`apple:yum`) and the coach answers; layout of plates, labels, coach and dialogs fits without overlaps; no page errors.
- **Mobile Wallet Adapter in emulated Android Chrome (real `registerMwa()`):** registers "Mobile Wallet Adapter" (chain `solana:mainnet`, connect/disconnect/events + signing features that we never call), is the only wallet so "Connect wallet" goes straight to it with no Phantom link, and tapping it launches `solana-wallet:/v1/associate/local?association=…`. Desktop Chrome cannot handle that URI, so the game shows the "connection cancelled" message. Other scenarios (two wallets → chooser → connected → unlocked; iPhone with no wallet → "Open in Phantom" + explanation; injected Phantom; rejected request) passed.
- **In-app browsers (reported on a real Seeker, fixed 2026-10-17):** Mobile Wallet Adapter cannot start from an Android WebView / in-app browser (the library's own message was "This browser appears to be incompatible with mobile wallet adapter"). The game now recognises such a browser from its user agent, shows a translated warning with **Open in Chrome** (an Android intent link) and **Copy link**, and turns the library's `ERROR_WALLET_NOT_FOUND` / `ERROR_BROWSER_NOT_SUPPORTED` / `ERROR_LOOPBACK_ACCESS_BLOCKED` into short translated hints instead of an English pop-up. Checked in emulated Android Chrome and an emulated WebView user agent; **still not confirmed on the reporter's device** (the exact browser/user agent was not available).
- **Bundle:** main JS ≈ 796 kB (221 kB gzip, +5 kB for the wallet code); the MWA package is a separate 143 kB (45 kB gzip) chunk fetched only on Android.
- **Viewports (emulated, not devices):** 420×860 portrait, 780×360 landscape phone and 1000×640 desktop. Screenshots were inspected for overlaps (e.g. the tutorial coach moves to the top-left on short landscape screens).

## Not verified (honest gaps)

- **A physical Solana Seeker** (Seed Vault Wallet, Solflare or Phantom approving through the Android intent), other real phones, touch on hardware, Safari, Firefox, and real Phantom (desktop or mobile). Touch and mobile were only emulated (viewport, user agent, synthetic touch events). GPU performance on the Seeker's Dimensity 7300 was not measured.
- A real lock on DevFridge, redemption, the 2% burn, or any mainnet transaction.
- Wallet **rejection** recovery (message path exists in `ui.ts`, no test), audio resume after screen lock, WebGL context-loss recovery (implemented, not exercised).
- Accessibility audit, performance on low-end phones, long-session memory, and security review (no external audit).
- Audio loudness and the correctness of translations (17 languages are unreviewed machine translations).
- No recorded gameplay video.
