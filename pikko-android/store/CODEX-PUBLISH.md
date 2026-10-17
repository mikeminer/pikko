# Publish PIKKO to the Solana dApp Store — instructions for the agent

You are helping the publisher (the owner of PIKKO, GitHub `mikeminer`) submit or update the Android app of PIKKO in the **Solana dApp Store** through the **Publisher Portal** (https://publish.solanamobile.com). The app is built, signed and tested on a real Seeker. Your job is to check, prepare and walk the publisher through the portal. **The publisher signs and approves every account, identity, wallet and payment step personally.**

Read this whole file before acting. Official docs (re-check them; the portal is the source of truth if it differs from this file):
- https://docs.solanamobile.com/dapp-store/submit-new-app
- https://docs.solanamobile.com/dapp-store/submit-an-update
- https://docs.solanamobile.com/dapp-store/publishing-cli
- the Publisher Policy (https://solanamobile.com/publisher-policy-web)

---

## 1. Hard rules (do not break these)

1. **Never handle secrets.** Do not ask for, read, type, copy or store seed phrases, wallet private keys, the publisher wallet's keypair file, the Android signing key or its password, portal API keys or KYC documents. Do not put any of them in files, chats, commits or logs.
2. **The publisher does these personally:** creating the portal account, KYC/KYB identity verification, connecting the publisher wallet (a browser-extension wallet such as Phantom, Solflare or Backpack), topping up ArDrive storage with SOL, approving **every** wallet signing prompt and transaction, accepting the Developer Agreement, Publisher Policy and terms. Stop and hand over at each of these. Never click "approve", "sign", "accept" or "submit" for the publisher.
3. **Do not rebuild or re-sign the APK** unless the publisher asks. **Never generate a new signing key**: every future update of this package must be signed with the existing key, or the store refuses it. The only supported build is `node build.mjs` in `pikko-android/` (see §6), and it must run with the existing key.
4. **Do not push, publish or change anything outside what the publisher asks.** In particular do not touch the DevFridge gallery repo, the Vercel project, domains or DNS.
5. **Do not hide a mismatch.** If the portal, the existing listing or the checks disagree with this file, stop and report it to the publisher with the exact message or value.

---

## 0. First, find out what already exists (the publisher says "update on Solana")

The publisher may already have a PIKKO app in the portal, made earlier with another tool (an older APK, probably a WebView, with a **different package name and a different signing key**). Ask the publisher, and check the portal's *Apps* list together:

| Situation | What it means | What to do |
| --- | --- | --- |
| No PIKKO app in the portal | Nothing to update | Do the **new app** flow (§4). |
| A PIKKO app exists with package **`art.pikko.app`** and the same signing certificate (§2) | This build is a real update | Do the **update** flow (§6, steps 3–4): *New Version*, upload the APK, same publisher wallet. |
| A PIKKO app exists with **another package name** or **another signing key** (e.g. the older WebView APK) | The store ties an app to its package name and signing key: **this APK cannot update that listing** | **Stop and report to the publisher.** Options for the publisher to choose: (a) submit this as a **new app** and ask Solana Mobile to retire/unlist the old one (support channel: `#dev-answers` on the Solana Mobile Discord, or publishersupport@dappstore.solanamobile.com); (b) recover the old app's signing key and package name and rebuild this project with them (only if the publisher has that key; do not guess). Do not pick one yourself. |

Also record: which publisher wallet owns the existing listing (the update must come from that same wallet).

---

## 2. What is being published

| Item | Value |
| --- | --- |
| App name | **PIKKO** |
| Android package | `art.pikko.app` |
| Version | `versionName 1.0.1`, `versionCode 2` (1.0.0 / code 1 was an internal test build; this is the first one to publish) |
| APK | `pikko-android\release\Pikko-1.0.1.apk` (also `Pikko-latest.apk`; not in git) |
| APK SHA-256 | `bf5678c857425928ff20e80975d12292f772fc3a3b0f6b60adf2e3824548a2ae` |
| Signing certificate SHA-256 | `02:AD:AA:F8:BF:8E:D4:A4:93:80:9C:38:CA:21:05:1A:66:E8:66:5B:DC:74:D1:B3:0C:BB:C5:FD:2E:D1:FB:66` |
| Min / target SDK | 24 / 36 |
| Kind of app | Trusted Web Activity of https://pikko.art/play/ (Chrome engine, full screen, verified by Digital Asset Links). Deliberately **not** a WebView: Mobile Wallet Adapter cannot start from a WebView. |
| Website | https://pikko.art |
| Privacy policy | https://pikko.art/privacy.html |
| Terms of Use | https://pikko.art/terms.html |
| Source | https://github.com/mikeminer/pikko (folder `pikko-android/`) |
| Contacts | welcome@devfridge.cool · Telegram https://t.me/pikkogame |
| Category | Games (Educational / Family if offered) |
| Texts and images | `pikko-android/store/LISTING.md` and the images in `pikko-android/store/` |

Images in `pikko-android/store/`: `icon-512.png` (512×512), `banner-1200x600.png`, five 1080×1920 screenshots `screenshot-1-title.png` … `screenshot-5-bag.png`. If the portal wants other sizes, tell the publisher what is missing instead of editing the brand art by hand (the generators are `pikko-android/make-icons.mjs` and `store-banner.mjs`).

What was verified, on 17 October 2026:
- a real Seeker (Android 15) installed the APK; `adb shell pm get-app-links art.pikko.app` → `pikko.art: verified`;
- the game opens full screen from the app (no address bar);
- the publisher confirmed the app works, including the wallet connection on the Seeker.

---

## 3. Pre-flight checks (run them, report the results to the publisher)

Run from `C:\Users\mikfo\Desktop\Nuova cartella (7)\pikko-android` in PowerShell. The Android SDK is at `%LOCALAPPDATA%\Android\Sdk` (if not found, ask the publisher where it is).

```powershell
# 1. the file is the one that was tested
Get-FileHash release\Pikko-1.0.1.apk -Algorithm SHA256
# expect BF5678C857425928FF20E80975D12292F772FC3A3B0F6B60ADF2E3824548A2AE

# 2. signature and certificate
java -jar "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\lib\apksigner.jar" verify --print-certs release\Pikko-1.0.1.apk
# expect: Signer #1 certificate SHA-256 digest: 02adaaf8bf8ed4a493809c38ca21051a66e8665bdc74d1b30cbbc5fd2ed1fb66

# 3. package and versions
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\aapt2.exe" dump badging release\Pikko-1.0.1.apk | Select-String "package:|targetSdk"
# expect: name='art.pikko.app' versionCode='2' versionName='1.0.1', targetSdkVersion:'36'

# 4. the live site vouches for the app (must print "linked": true)
curl.exe -s "https://digitalassetlinks.googleapis.com/v1/assetlinks:check?source.web.site=https://pikko.art&relation=delegate_permission/common.handle_all_urls&target.android_app.package_name=art.pikko.app&target.android_app.certificate.sha256_fingerprint=02:AD:AA:F8:BF:8E:D4:A4:93:80:9C:38:CA:21:05:1A:66:E8:66:5B:DC:74:D1:B3:0C:BB:C5:FD:2E:D1:FB:66"

# 5. the pages the listing points to answer
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/play/
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/privacy.html
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/terms.html
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/.well-known/assetlinks.json
```

All must pass (200 and the expected values). If check 4 or the assetlinks URL fails, **stop and tell the publisher**: the site was probably redeployed without the file `/.well-known/assetlinks.json`. Its source of truth is `pikko-android/assetlinks.json`. Do not "fix" the Vercel project yourself.

Optional, if the Seeker is connected by USB: `adb shell pm get-app-links art.pikko.app` should say `pikko.art: verified`.

---

## 4. New app, step by step (Publisher Portal)

Follow the portal's own wording. Before each "publisher" step, stop and wait.

1. **Account (publisher).** https://publish.solanamobile.com: sign up or log in, fill the publisher profile, complete **KYC/KYB**. Support/contact email: welcome@devfridge.cool if asked. Wait until verification is accepted.
2. **Publisher wallet (publisher).** The publisher connects a browser-extension wallet. It becomes the publisher wallet for this app **forever**: every future update must come from it. Recommend one the publisher controls long-term and has backed up. About **0.2 SOL** is usually enough for fees and storage.
3. **Storage provider.** Choose **ArDrive** (the portal's recommendation). Use the portal's cost tool: the APK is about 4 MB and the images a few MB. If the balance is short, the **publisher** clicks *Top Up Balance* and approves.
4. **Add the dApp.** Sidebar → *Add a dApp* → *New dApp*. Fill the form from `store/LISTING.md`: name PIKKO; short and long description copied exactly (if a field is shorter, shorten without changing the facts, especially: the wallet is optional and read-only, and the game never asks for a signature or transaction); website, privacy, Terms of Use and contacts from §2; category Games; icon, banner and screenshots from `store/`; copyright "© PIKKO / DevFridge" (ask the publisher if the portal asks anything legal you don't know). For the content/age questionnaire, answer honestly from LISTING.md (kid mode default, crypto behind an adults-only question, no real-money gambling, no user-generated content). Show the filled form to the publisher before saving if they want.
5. **First release.** App *Home* → **New Version** → upload `release\Pikko-1.0.1.apk`. *What's new*: "First release on the dApp Store: PIKKO, the healthy-eating game with 24 country bags, full screen, with Seed Vault wallet support."
6. **Submit (publisher).** The publisher clicks **Submit** and approves **every** message-signing and transaction prompt, one by one (they upload assets to Arweave and mint the Release NFT). The portal warns that skipping a prompt can leave assets missing: if one was rejected by mistake, check the submission status and follow the portal's retry instructions.
7. **Notes for reviewers**, if there is a field: paste the "Notes for reviewers" section of `LISTING.md`.

---

## 5. After submitting

- Review results arrive by email from `publishersupport@dappstore.solanamobile.com`, usually within **3–5 business days**.
- No answer after 5 business days: the publisher posts an *App Review Inquiry* in `#dev-answers` on the Solana Mobile Discord (https://discord.gg/solanamobile, Developer role).
- **If the review rejects the app:** read the reason, report it to the publisher with a proposed fix. Change nothing on your own.
- **The site must stay up during the review:** the app shows https://pikko.art/play/ live (Vercel project `pikko`).
- **Plan B, only if reviewers report that the wallet does not connect.** Solana Mobile's docs now recommend a WebView shell (`solana-mobile webshell`) over Trusted Web Activities because of Chrome's Local Network Access permission. PIKKO's wallet code (`pikko-game/src/access/wallet.ts`) already handles Mobile Wallet Adapter, in-app browsers and error codes, and it works on a real Seeker through the TWA. If reviewers still fail, propose the webshell route to the publisher as a **separate task**; it would need the same package name and the same signing key.

---

## 6. Future updates

1. In `pikko-android/app/build.gradle.kts` raise `versionCode` (+1) and `versionName`.
2. Run `node build.mjs` in `pikko-android/`. It signs with the existing key in `%USERPROFILE%\PikkoArt\android-signing\` and **refuses to use a different key**. Never let it create a new key for an app that is already published (if that folder were missing, stop and ask the publisher for the backup).
3. Run the pre-flight checks (§3) with the new file name and hash.
4. Portal: app *Home* → **New Version** → upload the APK, fill *What's new* → the publisher submits and approves the prompts from the **same publisher wallet**.

A change to the **game** (https://pikko.art/play/) needs **no** new APK: the app always shows the live site. Only Android-side changes need a new version (icon, name, manifest, package, target SDK).

The CLI (`npm install -g @solana-mobile/dapp-store-cli`) needs the publisher wallet's **keypair file** and a portal API key. Don't use it unless the publisher sets it up themselves; the portal is the default.

---

## 7. Useful paths

| What | Where |
| --- | --- |
| Android project | `pikko-android/` (see its `README.md`) |
| Build, sign, verify | `pikko-android/build.mjs` |
| Icons / banner generators | `pikko-android/make-icons.mjs`, `pikko-android/store-banner.mjs` |
| Listing texts and images | `pikko-android/store/` |
| Signing key | `%USERPROFILE%\PikkoArt\android-signing\release.p12` (password DPAPI-protected for the publisher's Windows user) |
| Key backup script | `pikko-android/backup-key.ps1` (the publisher types the backup password) |
| Asset links (must be served by the site) | `pikko-android/assetlinks.json` → https://pikko.art/.well-known/assetlinks.json |
| Game and wallet code | `pikko-game/` (`src/access/wallet.ts`) |
| Evidence and limits | `README.md`, `SUBMISSION.md`, `VERIFICATION.md` at the repo root |
