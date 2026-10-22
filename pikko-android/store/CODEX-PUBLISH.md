# Publish PIKKO to the Solana dApp Store — instructions for the agent

State of this file: **22 October 2026**. You are helping the publisher (the owner of PIKKO, GitHub `mikeminer`) submit the Android app of PIKKO in the **Solana dApp Store** through the **Publisher Portal** (https://publish.solanamobile.com). The app is built, signed and has been played on a real Seeker. Your job is to check, prepare and walk the publisher through the portal. **The publisher signs and approves every account, identity, wallet and payment step personally.**

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
4. **Do not make payments or connect wallets to the game.** PIKKO has an optional 0.001 SOL pay-per-round feature. Never trigger it, never ask the publisher to pay "to test" on your behalf, and never connect a wallet to the game for them. A real payment test is the publisher's own decision.
5. **Do not push, publish or change anything outside what the publisher asks.** In particular do not touch the DevFridge gallery repo, the Vercel project `pikko`, domains, DNS, or the legal pages (`privacy.html`, `terms.html`).
6. **Do not hide a mismatch.** If the portal, the existing listing or the checks disagree with this file, stop and report it to the publisher with the exact message or value.

---

## 2. State of the portal and why this APK fits it

**Update, reported by the publisher's Codex session on 22 October 2026:** the listing of `art.pikko.game` is **already published** (a previous release is live). It does **not** match `LISTING.md`: the live subtitle is "Feed Pikko. Explore the world's flavours." (keep it; it is now in `LISTING.md`); the live description mentions the PASSta and free trials but not Kids/Grown-ups mode, the promotions or the optional 0.001 SOL payment; the portal has **21 locales** (including "Zhuang (China)" instead of Chinese, and both English (United States) and English (Poland)); and 4 landscape screenshots. Per the official docs, **changes to the details only reach the store after a new release version is approved** ("Submit an Update": edit the *Details* page, then *Home* → *New Version*; choose **"use existing APK"** for a details-only change, or upload a new APK with a higher `versionCode`/`versionName` signed with the same key). **First find out which APK the live release contains** (version name, version code, APK hash shown in the portal's release/Home page) and tell the publisher: if it is the earlier WebView APK (`pikko-0.1.0`, code 1), upload `Pikko-1.0.2.apk` (code 2) because a WebView cannot connect wallets; if it is already `Pikko-1.0.2` (code 2), use the existing APK for a details-only update and raise `versionCode` to 3 only if a new APK is built.

Background from the notes of an earlier tool (`Documents\ChatGPT\pikko game\solana-mobile\publication-status.json`, dated 5 October 2026 — superseded by the portal if they differ):

The Publisher Portal has a **PIKKO** app with package **`art.pikko.game`** (https://publish.solanamobile.com/dapp/art.pikko.game). From those notes:

- the store listing (texts, icon, banner, screenshots, Editor's Choice graphic, terms and privacy URLs) is **completed and saved, not live**;
- the **app NFT had not been minted** ("Mint App" is a publisher wallet action), so "New Version" is disabled and **no release was ever uploaded**; the earlier APK (`pikko-0.1.0.apk`, a WebView shell) was never submitted.

The APK of this repo is **rebuilt with the same package `art.pikko.game` and signed with the same, original PIKKO release key** (certificate SHA-256 below, equal to the one recorded in `release-signing.json` of that project). It fits that listing and any future update. The earlier, never-uploaded APK is superseded: do not upload it.

Check these in the portal and **stop and report if any differs**:

| Situation | What it means | What to do |
| --- | --- | --- |
| The app `art.pikko.game` exists, "Mint App" still pending | First release | Listing check → publisher mints → *New Version* (§4). |
| The app exists and is minted, no release yet | First release | Listing check → *New Version* (§4). |
| A release already exists for `art.pikko.game` | This is an update | Raise nothing yourself: report the existing version and its APK hash to the publisher; a new upload needs `versionCode` above the existing one (§6). |
| The app has **another package name** or **another signing key** | The store ties an app to its package name and signing key: **this APK cannot update that listing** | **Stop and report.** Options for the publisher: (a) submit as a **new app** and ask Solana Mobile to retire the old one (`#dev-answers` on the Solana Mobile Discord, or publishersupport@dappstore.solanamobile.com); (b) recover the old key/package (only if the publisher has them; do not guess). Do not choose for them. |

Also record which publisher wallet owns the listing (every update must come from that wallet).

---

## 3. What is being published

| Item | Value |
| --- | --- |
| App name | **PIKKO** |
| Android package | `art.pikko.game` |
| Version | `versionName 1.0.2`, `versionCode 2` (higher than the never-uploaded 0.1.0 / code 1) |
| APK | `pikko-android\release\Pikko-1.0.2.apk` (also `Pikko-latest.apk`; not in git). Do **not** use `Pikko-1.0.0.apk` or `Pikko-1.0.1.apk`: they are `art.pikko.app` test builds signed with a throwaway key |
| APK SHA-256 | `d7bef1b79f81921df180485fa4b1ae711a242b67e044588e37a67aecee27ff8c` |
| Signing certificate SHA-256 | `C6:C7:FF:F1:32:69:D0:16:D5:9D:17:87:10:66:5F:69:BC:FD:47:C9:39:D6:C2:86:CA:D8:65:35:BC:1F:88:9C` |
| Min / target SDK | 24 / 36 |
| Kind of app | Trusted Web Activity of https://pikko.art/play/ (Chrome engine, full screen, verified by Digital Asset Links). Deliberately **not** a WebView: Mobile Wallet Adapter cannot start from a WebView. The game itself is the live website, so game changes need no new APK. |
| Website | https://pikko.art |
| Privacy policy | https://pikko.art/privacy.html (version 22 October 2026) |
| Terms of Use | https://pikko.art/terms.html (version 22 October 2026) |
| Source | https://github.com/mikeminer/pikko (folder `pikko-android/`) |
| Contacts | welcome@devfridge.cool · Telegram https://t.me/pikkogame |
| Category | Games (Educational / Family if offered) |
| Texts and images | `pikko-android/store/LISTING.md` and the images in `pikko-android/store/` |

Images in `pikko-android/store/`: `icon-512.png` (512×512, Pikko), `banner-1200x600.png`, five 1080×1920 screenshots `screenshot-1-title.png` … `screenshot-5-bag.png`. If the portal wants other sizes, tell the publisher what is missing instead of editing the brand art by hand (the generators are `pikko-android/make-icons.mjs` and `store-banner.mjs`).

### What the game does (answer portal questionnaires from this, honestly)

- **Two modes**, chosen on first launch and switchable on the title screen or in Settings. **Kids mode** (the default): no promotions, no sponsor requests; the starter bag and 5-round trials are free; a full country bag needs an adult (adult question first) to use a DevFridge lock (PASTA pass) **or** pay 0.001 SOL for one round. **Grown-ups mode** (entered through the adult question): every bag is open for free, with **advertising**: an OnlyFridge Club promotion before every round and a sponsored-token / "YOUR AD HERE" card above the game. So: *contains ads* = yes (Grown-ups mode only); *in-app payments / crypto* = an **optional** 0.001 SOL payment (Kids mode, adult question, approved in the user's wallet) and optional wallet connection; *account required* = no; *user-generated content* = no; *real-money gambling* = no.
- **Where the 0.001 SOL goes:** to `AXomB2bpJ7F3EFVPQwrwBV4yVE7bazshZaVa64KhGCfE`, a DevFridge vault used to buy and burn PASTA (CA `39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump`); the publisher does not receive it. This is stated by the publisher and consistent with a read-only on-chain look; the vault was not audited. The pay dialog tells the player so and shows the CA.
- **Wallet:** the game reads the public key and DevFridge lock evidence; the **only** transaction it can ask a wallet to sign is that optional payment. Do not write "never signs" or "read-only" in any form field. `LISTING.md` has the correct wording.
- **Network services used by the game:** `scan.devfridge.cool` (lock check, sponsor feed and logos), a public Solana RPC (`solana-rpc.publicnode.com`) for the optional payment, `pikko.art/api/sponsors` (own function on Vercel). All are in the privacy policy.

### What was verified (and what was not)

- **Verified, 22 October 2026, on a real Seeker (Android 15):** the final APK `art.pikko.game` 1.0.2, signed with the original key, installs; Android reports `pikko.art: verified` (`pm get-app-links`); the game opens full screen without an address bar; the mode picker, the adult question, the Grown-ups title screen with the sponsor row, the OnlyFridge Club promotion and a round all work.
- **Verified earlier (17 October):** wallet connection through Mobile Wallet Adapter worked with an earlier test build of the same code (package `art.pikko.app`, throwaway key).
- **Not tested:** wallet connection with the final signed build, and any real 0.001 SOL payment. If the publisher wants these checked before submitting, they do it themselves on the Seeker (Kids mode → Pikko Mart → a country bag → Unlock…); you do not.

---

## 4. Pre-flight checks (run them, report the results to the publisher)

Run from `C:\Users\mikfo\Desktop\Nuova cartella (7)\pikko-android` in PowerShell. The Android SDK is at `%LOCALAPPDATA%\Android\Sdk` (if not found, ask the publisher where it is).

```powershell
# 1. the file is the one that was tested
Get-FileHash release\Pikko-1.0.2.apk -Algorithm SHA256
# expect D7BEF1B79F81921DF180485FA4B1AE711A242B67E044588E37A67AECEE27FF8C

# 2. signature and certificate
java -jar "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\lib\apksigner.jar" verify --print-certs release\Pikko-1.0.2.apk
# expect: Signer #1 certificate SHA-256 digest: c6c7fff13269d016d59d178710665f69bcfd47c939d6c286cad86535bc1f889c

# 3. package and versions
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\aapt2.exe" dump badging release\Pikko-1.0.2.apk | Select-String "package:|targetSdk"
# expect: name='art.pikko.game' versionCode='2' versionName='1.0.2', targetSdkVersion:'36'

# 4. the live site vouches for the app (should print "linked": true; Google caches the answer for up to an hour, so if it does not say true,
#    read the file itself (check 5, last line) and compare package and fingerprint)
curl.exe -s "https://digitalassetlinks.googleapis.com/v1/assetlinks:check?source.web.site=https://pikko.art&relation=delegate_permission/common.handle_all_urls&target.android_app.package_name=art.pikko.game&target.android_app.certificate.sha256_fingerprint=C6:C7:FF:F1:32:69:D0:16:D5:9D:17:87:10:66:5F:69:BC:FD:47:C9:39:D6:C2:86:CA:D8:65:35:BC:1F:88:9C"

# 5. the pages the listing points to answer, and the site pieces the app needs
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/play/
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/privacy.html
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/terms.html
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/api/sponsors
curl.exe -s https://pikko.art/.well-known/assetlinks.json

# 6. the legal pages carry the 22 October 2026 text (payment, vault, sponsors)
curl.exe -s https://pikko.art/privacy.html | Select-String "Version: 22 October 2026"
curl.exe -s https://pikko.art/terms.html | Select-String "Payment for one round"
```

All must pass (200 and the expected values; `/api/sponsors` returns `{"sponsors":[…],"fetchedAt":…}`, an empty list is normal). If the assetlinks file is missing or shows another package or fingerprint, **stop and tell the publisher**: the site was probably redeployed without `/.well-known/assetlinks.json` (its source of truth is `pikko-android/assetlinks.json`). If the legal pages show an older version, stop and report. Do not "fix" the Vercel project yourself.

Optional, if the Seeker is connected by USB: `adb shell pm get-app-links art.pikko.game` should say `pikko.art: verified`.

---

## 5. Step by step (Publisher Portal)

The app and its listing already exist (§2), so the work is: check the saved listing, mint the app (publisher), create the first release, submit. Follow the portal's own wording. Before each "publisher" step, stop and wait.

1. **Account (publisher).** https://publish.solanamobile.com: sign up or log in, fill the publisher profile, complete **KYC/KYB**. Support/contact email: welcome@devfridge.cool if asked. Wait until verification is accepted.
2. **Publisher wallet (publisher).** The publisher connects a browser-extension wallet. It becomes the publisher wallet for this app **forever**: every future update must come from it. Recommend one the publisher controls long-term and has backed up. About **0.2 SOL** is usually enough for fees and storage.
3. **Storage provider.** Choose **ArDrive** (the portal's recommendation). Use the portal's cost tool: the APK is about 4 MB and the images a few MB. If the balance is short, the **publisher** clicks *Top Up Balance* and approves.
4. **Check the existing listing** (do not create a second app): open `art.pikko.game` and compare it with `store/LISTING.md`.
   - **Texts:** the saved texts come from an earlier tool and may say that the game never signs or is read-only, or may not mention Grown-ups mode, advertising or the payment. Replace them with `LISTING.md` (name PIKKO; short and long description copied exactly; if a field is shorter, shorten without changing the facts, especially: the wallet is optional, locks are only read, the one optional transaction is the 0.001 SOL payment, and Grown-ups mode shows promotions). Website, privacy, Terms of Use and contacts from §3; category Games; copyright "© PIKKO / DevFridge" (ask the publisher if the portal asks anything legal you don't know).
   - **Languages:** select exactly the 20 locales listed in `LISTING.md` (one per language). Deselect "English (Poland)" and "Zhuang (China)"; select "Chinese (China)". Show the final list to the publisher.
   - **Subtitle:** keep "Feed Pikko. Explore the world's flavours."
   - **Images:** the saved icon, banner and four landscape screenshots are the earlier ones. The new Pikko icon, banner and the screenshots in `store/landscape/` (1920×1080, same orientation as the live ones; portrait 1080×1920 versions are in `store/`) are replacements: show both to the publisher and **replace only if the publisher agrees**.
   - **Questionnaires:** answer from "What the game does" in §3.
   - Show every change to the publisher before saving.
5. **Mint App (publisher).** If not done yet, the publisher clicks *Mint App* and approves the wallet requests. "New Version" stays disabled until then.
6. **First release.** App *Home* → **New Version** → upload `release\Pikko-1.0.2.apk`. *What's new*: "First release on the dApp Store: PIKKO, the healthy-eating game with 24 country bags, full screen, with Seed Vault wallet support."
7. **Submit (publisher).** The publisher clicks **Submit** and approves **every** message-signing and transaction prompt, one by one (they upload assets to Arweave and mint the Release NFT). The portal warns that skipping a prompt can leave assets missing: if one was rejected by mistake, check the submission status and follow the portal's retry instructions.
8. **Notes for reviewers**, if there is a field: paste the "Notes for reviewers" section of `LISTING.md` (modes, how to reach Grown-ups mode, the optional payment, what was and was not tested).

---

## 6. After submitting, and future updates

- Review results arrive by email from `publishersupport@dappstore.solanamobile.com`, usually within **3–5 business days**.
- No answer after 5 business days: the publisher posts an *App Review Inquiry* in `#dev-answers` on the Solana Mobile Discord (https://discord.gg/solanamobile, Developer role).
- **If the review rejects the app:** read the reason, report it to the publisher with a proposed fix. Change nothing on your own. Likely questions: advertising in Grown-ups mode, the crypto payment, children (Kids mode is the default and shows no ads; the adult question is a navigation safeguard, not age verification, as the legal pages say).
- **The site must stay up during the review:** the app shows https://pikko.art/play/ live (Vercel project `pikko`).
- **Plan B, only if reviewers report that the wallet does not connect.** Solana Mobile's docs now recommend a WebView shell (`solana-mobile webshell`) over Trusted Web Activities because of Chrome's Local Network Access permission. PIKKO's wallet code (`pikko-game/src/access/wallet.ts`) already handles Mobile Wallet Adapter, in-app browsers and error codes, and it worked on a real Seeker through a TWA test build. If reviewers still fail, propose the webshell route to the publisher as a **separate task**; it would need the same package name and the same signing key.

**Future APK updates** (only for Android-side changes: icon, name, manifest, package, target SDK; **game changes need no new APK**):

1. In `pikko-android/app/build.gradle.kts` raise `versionCode` (+1) and `versionName`.
2. Run `node build.mjs` in `pikko-android/`. It signs with the existing key in `Documents\ChatGPT\pikko game\solana-mobile\.signing\` (`pikko-release.jks`, password DPAPI-protected for the publisher's Windows user) and **refuses to create or use another key**. If that folder is missing, stop and ask the publisher for their backup.
3. Run the pre-flight checks (§4) with the new file name and hash.
4. Portal: app *Home* → **New Version** → upload the APK, fill *What's new* → the publisher submits and approves the prompts from the **same publisher wallet**.

The CLI (`npm install -g @solana-mobile/dapp-store-cli`) needs the publisher wallet's **keypair file** and a portal API key. Don't use it unless the publisher sets it up themselves; the portal is the default.

---

## 7. Before the publisher submits (remind them)

1. **Back up the signing key** (no offline backup is recorded): `powershell -File pikko-android/backup-key.ps1 -Destination <offline drive>\pikko-release.p12`. The publisher types the backup password; never ask for it.
2. Optionally test the wallet connection (and, if they wish, one 0.001 SOL payment) on the Seeker with the final APK themselves.
3. The terms mention consumer rights for the payment; a legal check of the withdrawal-right rules is advisable (noted in the repo's drafts, not blocking the store submission).

---

## 8. Useful paths

| What | Where |
| --- | --- |
| Android project | `pikko-android/` (see its `README.md`) |
| Build, sign, verify | `pikko-android/build.mjs` |
| Icons / banner generators | `pikko-android/make-icons.mjs`, `pikko-android/store-banner.mjs` |
| Listing texts and images | `pikko-android/store/` |
| Signing key | `%USERPROFILE%\Documents\ChatGPT\pikko game\solana-mobile\.signing\pikko-release.jks` + `password.dpapi` (readable only by the publisher's Windows user) |
| Key backup script | `pikko-android/backup-key.ps1 -Destination <offline>\pikko-release.p12` |
| Earlier project (superseded) | `%USERPROFILE%\Documents\ChatGPT\pikko game\solana-mobile\` (listing assets, `publication-status.json`) |
| Asset links (must be served by the site) | `pikko-android/assetlinks.json` → https://pikko.art/.well-known/assetlinks.json |
| Game, wallet, payment and sponsor code | `pikko-game/` (`src/access/wallet.ts`, `src/access/payment.ts`, `api/sponsors.mjs`) |
| Evidence and limits | `README.md`, `SUBMISSION.md`, `VERIFICATION.md` at the repo root |
