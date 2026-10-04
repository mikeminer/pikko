# PIKKO — Yum or Bleah!

A 3D browser game (Three.js) that teaches healthy eating, with a built-in tour of the world's food.
Drag one of two foods to **Pikko**: healthy food makes him happy, junk food makes him pull a disgusted face and dodge.
Everything he eats fills his belly with kcal; win the day if at least half of it is healthy food.

**Play (free, no wallet, no tokens needed): https://mikeminer.github.io/pikko/**

- 25 shopping bags: a free starter bag + **24 country bags**, each with 20 foods (10 healthy + 10 "sometimes") and a fun fact.
- 20 languages (EN IT PL ES FR DE PT EL TR AR HI ZH JA KO TH VI ID RU UK FIL), Arabic right-to-left.
- In-game tutorial (cards + two guided practice rounds), Daily menu, Zen mode, Recipe Book, shareable receipt, Bleah Cam clip.
- Access: DevFridge timelocks on Solana. **Interim pass: ONE active lock of 5,000,000 PASTA unlocks every bag.** Country tokens are pre-launch.

| Where | What |
| --- | --- |
| [`pikko-game/`](pikko-game/) | The game (Vite + TypeScript + Three.js) — see its [README](pikko-game/README.md) |
| [`SUBMISSION.md`](SUBMISSION.md) · [`BUILD_LOG.md`](BUILD_LOG.md) · [`VERIFICATION.md`](VERIFICATION.md) | Gallery evidence: access rules, AI build log, test results and limitations |
| [`PIKKO-GAME-DESIGN.md`](PIKKO-GAME-DESIGN.md) | Game design document (Italian) |
| [`PIKKO-BAGS.json`](PIKKO-BAGS.json) | Catalogue of the 24 country bags |
| [`PIKKO-AUDIO-LYRIA-PROMPTS.md`](PIKKO-AUDIO-LYRIA-PROMPTS.md) | Music / SFX generation prompts |
| [`PIKKO_LOGO/`](PIKKO_LOGO/) · [`PIKKO_TOKEN_LOGOS/`](PIKKO_TOKEN_LOGOS/) | Wordmark (Pikko is the "I") and one logo per country bag |

## Run it

```sh
cd pikko-game
npm ci
npm run dev      # http://127.0.0.1:5180
npm test         # 74 tests
npm run build    # type check + production build in dist/
```

No environment variables are needed to build or play the game.

## Status and honesty

Educational game, not medical or financial advice. Calorie values are approximate. Translations (except the author's
Italian) are machine translations awaiting native review. The wallet check in the browser is a convenience, not security.
No open-source licence has been chosen yet, so all rights are reserved by default. See [`SUBMISSION.md`](SUBMISSION.md) for the full list of limitations.
