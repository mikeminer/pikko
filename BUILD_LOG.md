# BUILD LOG — how PIKKO was built with AI

Tools: **Claude Code** (Anthropic; Opus 5.5 and Sonnet 5.5 sessions) wrote code, tests, docs, data, logos and translations, using the
`devfridge-game-builder` skill. The owner drove every decision in chat and supplied the audio (generated in Gemini and ElevenLabs). Headless Chrome (puppeteer-core) was used for screenshots and scripted playthroughs. This is a condensed, honest log of the
real session (2026-10-03 → 2026-10-04); user prompts are paraphrased or shortened, originally in Italian.

## 1. Concept and design
- **Prompt:** design a realistic Three.js game that teaches healthy eating: drag food to a character; healthy food = happy, junk = disgust and dodge;
  2 choices per round; kcal scoring; a supermarket of expansion "shopping bags", each tied to a time-locked token; EN/IT/PL; find a catchy name.
- **Result:** `PIKKO-GAME-DESIGN.md` (GDD) with mechanics, scoring, Pikko's look and reactions, Mart, access rules; name **PIKKO** chosen by the owner.
- **Decisions by the owner:** one Pump.fun token per bag; any active lock unlocks its bag; the **palate habit** rule (3 junk in a row → grimace at healthy food and vice versa, junk always penalised).

## 2. Audio production (before this build) and integration (this build)
- The audio sources (package `PIKKO_audio_v0.2`) were generated on 2026-10-03, **before** this build, in Gemini (music) and ElevenLabs (sound effects, voices) by the owner
  together with another AI assistant (ChatGPT), and handed over with a status report. Claude had written the music/SFX prompt guide `PIKKO-AUDIO-LYRIA-PROMPTS.md` in this build (22 country themes are still ungenerated).
- Claude analysed and cut sample-accurate **loops** (Python + numpy/scipy/ffmpeg), normalised levels, and wrote `tools/build_audio.py`
  which produces `public/audio/manifest.json` (provenance + SHA-256 + approval status). The owner picked the win and defeat sounds; the Italian and Polish defeat variants were generated in ElevenLabs
  through the owner's Chrome at the owner's request, with the same voice settings as the chosen English one.

## 3. The game
- Vite + TypeScript + Three.js. Procedural Pikko (vinyl look, sprout, transparent belly with liquid, bib, expressive face) and 41 food archetypes; PBR materials, environment lighting, soft shadows.
- Pure-TypeScript simulation (`src/sim`): bites, kcal scoring, habit, combos, rainbow, reset bonus, 40 rounds, outcome rule; seeded daily menu.
- WebAudio engine: lazy sounds, sample-accurate loops, habit-dependent music filter, tick synced to BPM.
- **Prompt:** "make the complete game" → HUD, results, receipt sharing, Bleah Cam clip, Recipe Book, Mart, settings, pause, touch + keyboard, WebGL-loss recovery.
- **Prompt:** 20 bags themed by **country**, each with a token logo, healthy and unhealthy foods → catalogue generator (`tools/catalog_v2.py`), 20 SVG/PNG logos, per-country accessory on Pikko.
- Iterations driven by screenshots: fixed mouth/belly geometry, eyebrow direction, hats hiding the sprout, landscape layout, title contrast.

## 4. Access with DevFridge
- TypeScript port of the skill's tested timelock evaluator; strict fail-closed handling; Phantom connection (public key only); onboarding text with the 2% PASTA burn, no early withdrawal and route limits; adult gate; kid mode default.
- **Prompt (2026-10-04):** until country tokens exist, one active lock of 5,000,000 PASTA must unlock the whole game.
  Claude found the PASTA mint in the DevFridge docs, **verified owner/decimals/extensions on-chain with a read-only RPC call**, implemented the master pass (`aggregation: single`, any duration) and tested exact boundaries.

## 5. Languages and extra countries
- **Prompt:** add the missing languages for the country bags; later indonesian, russian, ukrainian and filipino with their own bags. → 20 languages (lazy-loaded files, RTL Arabic, plural rules), 24 bags × 20 foods, one home bag per language, new logos and accessories. All translations are machine translations by Claude (flagged `review` in each file).

## 6. Branding and tutorial
- **Prompt:** the "I" of PIKKO is the character → SVG wordmark with Pikko as the I (`PIKKO_LOGO/`), used on the loading and title screens.
- **Prompt:** a complete in-game tutorial → illustrated cards + two scripted practice rounds with a coach, in all 20 languages; first-run auto start, replay from title/settings/pause.

## 7. Verification
See `VERIFICATION.md` (124 automated tests, type check, build, on-chain read, scripted browser playthroughs in 8 languages, mock-wallet access flows).

## 8. Kids / Grown-ups modes, promotions and pay-per-round
- **Prompt (2026-10-22, after reading the new skill v1.5.3):** introduce a Kids mode and a Grown-ups mode with a mode choice and a switch; in Grown-ups mode show the two Free Play promotions and keep the Mart open; in Kids mode an adult unlocks bags with the timelock or pays 0.001 SOL per round to a given address.
- **Result:** first-launch mode picker and a title/Settings switch (to Grown-ups through the adult question); OnlyFridge Club dialog before each round and a sponsor card (same-origin `/api/sponsors` adapter, validation, 60 s cache) in Grown-ups mode only; Kids mode: Mart locked as before plus a *Pay per round* flow (System Program transfer through Wallet Standard `solana:signAndSendTransaction`, confirmed on-chain before the round starts). 124 tests. The transfer bytes were checked with a read-only simulation; no real payment was made.
- **Open points for the owner:** update the public privacy text (sponsor feed, RPC provider, payment); decide whether the payment address is the owner's; test a real payment on a Seeker.

## Human review notes
- Not reviewed by a native speaker: 17 languages. Not reviewed by a nutritionist: kcal and health copy.
- Browser checks in this log were done by the AI agent in headless Chrome. No real phone or real Phantom testing was done.
