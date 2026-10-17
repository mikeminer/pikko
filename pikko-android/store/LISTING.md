# PIKKO — Solana dApp Store listing

Everything the Publisher Portal asks for, ready to paste. The images are in this folder. The screenshots are of the real game at
Seeker-like size (360×640 CSS px at 3× = 1080×1920), taken from https://pikko.art/play/ in English.

## App

| Field | Value |
| --- | --- |
| App name | PIKKO |
| Package | `art.pikko.game` |
| Version | 1.0.2 (versionCode 2) |
| APK | `pikko-android/release/Pikko-1.0.2.apk` (not in git), certificate SHA-256 `C6:C7:FF:F1:32:69:D0:16:D5:9D:17:87:10:66:5F:69:BC:FD:47:C9:39:D6:C2:86:CA:D8:65:35:BC:1F:88:9C` |
| Website | https://pikko.art |
| Privacy policy | https://pikko.art/privacy.html |
| Terms of Use | https://pikko.art/terms.html |
| Source code | https://github.com/mikeminer/pikko |
| Contacts | welcome@devfridge.cool · Telegram https://t.me/pikkogame |
| Category | Games (Educational / Family if the portal offers it) |
| Languages | 20 in the app: English, Italian, Polish, Spanish, French, German, Portuguese, Greek, Turkish, Arabic, Hindi, Chinese, Japanese, Korean, Thai, Vietnamese, Indonesian, Russian, Ukrainian, Filipino |
| Age | Suitable for children: kid mode is the default and hides every crypto screen. The wallet and token screens sit behind an adults-only question. Answer the portal's content questionnaire honestly (no violence, no real-money gambling, no user-generated content, optional crypto features). |
| Icon | `icon-512.png` (Pikko, the "I" of the wordmark) |
| Banner / feature graphic | `banner-1200x600.png` |
| Screenshots | `screenshot-1-title.png`, `screenshot-2-play.png`, `screenshot-3-yum.png`, `screenshot-4-mart.png`, `screenshot-5-bag.png` (1080×1920) |

## Short description (≤ 80 characters)

Feed Pikko the healthy food, dodge the junk: a 3D healthy-eating game.

## Long description

PIKKO is a 3D game that teaches healthy eating in a minute a round. Two foods appear: drag the healthier one to Pikko, a vinyl-toy creature with a sprout on his head. Healthy food makes him happy; junk food makes him pull a disgusted face and dodge. Everything he eats fills his belly with kcal, and you win the day if at least half of it is healthy food.

- **Free to play, no account, no wallet.** The starter bag and a 5-round trial of every country bag are free.
- **24 country bags**, each with 20 foods (10 healthy, 10 "sometimes") and a fun fact: a tour of the world's food.
- **20 languages**, including right-to-left Arabic, and a built-in tutorial with two guided practice rounds.
- **Daily menu** (the same 20 rounds for everyone), **Zen mode** for little ones, a **Recipe Book** and a shareable receipt.
- **Kid mode** is on by default and hides all crypto screens.

Solana, optional. The country bags can be unlocked with a DevFridge timelock: connect a wallet (Seed Vault Wallet on the Seeker through Mobile Wallet Adapter, or any Solana wallet) and keep one active lock of at least 5,000,000 PASTA to unlock every bag. The game only reads your locks: it never asks for a signature or a transaction. Locking and redeeming happen on DevFridge, where redeeming has a 2% fee that buys and burns PASTA. Educational game, not medical or financial advice; calorie values are approximate.

## Notes for reviewers

- The app is a Trusted Web Activity of https://pikko.art/play/ (Chrome engine, full screen). The site confirms the app's signing certificate at `/.well-known/assetlinks.json`.
- No wallet or payment is needed to review: tap **Play**, then drag a food to Pikko. The first launch opens a short tutorial.
- Wallet (optional): Pikko Mart → a locked bag → adults-only question (answer the multiplication) → **Connect wallet**. Chrome may first ask for access to other apps and services on the device (Local Network Access): that is the link to the wallet app on the same phone. The wallet connection is read-only (public key only).
- Verified on a real Seeker (Android 15): the app installs, Android verifies pikko.art, the game opens full screen without an address bar, and wallet connection works.
- Known limits: 17 of 20 languages are unreviewed machine translations; country tokens are pre-launch (the 5,000,000 PASTA pass unlocks everything meanwhile); audio cues are owner-generated and their commercial terms are still to be confirmed by the owner.

## Before submitting (publisher's own steps)

1. **Back up the signing key** if not done yet: `powershell -File pikko-android/backup-key.ps1 -Destination <offline drive>\pikko-release.p12`.
2. **The portal already has the PIKKO app `art.pikko.game`** (listing saved, not live, app NFT not minted yet). This APK uses that package and that key, so it fits that listing: see `CODEX-PUBLISH.md` §0.
3. Publisher verification (KYC/KYB), the publisher wallet, and every on-chain approval are done by the publisher personally.
