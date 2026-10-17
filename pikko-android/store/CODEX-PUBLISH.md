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

## 0. State of the portal and why this APK fits it

The Publisher Portal already has a **PIKKO** app with package **`art.pikko.game`** (https://publish.solanamobile.com/dapp/art.pikko.game). From the project notes of an earlier tool (`Documents\ChatGPT\pikko game\solana-mobile\publication-status.json`):
- the store listing (texts, icon, banner, screenshots, Editor's Choice graphic, terms and privacy URLs) is **completed and saved, not live**;
- the **app NFT has not been minted** ("Mint App" is a publisher wallet action), so "New Version" is disabled and **no release was ever uploaded**; the earlier APK (`pikko-0.1.0.apk`, a WebView shell) was never submitted.

This new APK was **rebuilt with the same package `art.pikko.game` and signed with the same, original PIKKO release key** (certificate SHA-256 below, equal to the one recorded in `release-signing.json` of that project). So it is compatible with that listing and with any future update. The earlier, never-uploaded APK is superseded: do not upload it.

Check these in the portal and **stop and report if any differs**: the app's package is `art.pikko.game`; which wallet is the publisher wallet; whether "Mint App" was already done by the publisher or is still pending.

--- | --- | --- |
| No PIKKO app in the portal | Nothing to update | Do the **new app** flow (§4). |
| A PIKKO app exists with package **`art.pikko.game`** and the same signing certificate (§2) | This build is a real update | Do the **update** flow (§6, steps 3–4): *New Version*, upload the APK, same publisher wallet. |
| A PIKKO app exists with **another package name** or **another signing key** (e.g. the older WebView APK) | The store ties an app to its package name and signing key: **this APK cannot update that listing** | **Stop and report to the publisher.** Options for the publisher to choose: (a) submit this as a **new app** and ask Solana Mobile to retire/unlist the old one (support channel: `#dev-answers` on the Solana Mobile Discord, or publishersupport@dappstore.solanamobile.com); (b) recover the old app's signing key and package name and rebuild this project with them (only if the publisher has that key; do not guess). Do not pick one yourself. |

Also record: which publisher wallet owns the existing listing (the update must come from that same wallet).

---

## 2. What is being published

| Item | Value |
| --- | --- |
| App name | **PIKKO** |
| Android package | `art.pikko.game` |
| Version | `versionName 1.0.2`, `versionCode 2` (higher than the never-uploaded 0.1.0 / code 1) |
| APK | `pikko-android\release\Pikko-1.0.2.apk` (also `Pikko-latest.apk`; not in git). Do not use `Pikko-1.0.0.apk` or `Pikko-1.0.1.apk`: they are `art.pikko.app` test builds signed with a throwaway key |
| APK SHA-256 | `d7bef1b79f81921df180485fa4b1ae711a242b67e044588e37a67aecee27ff8c` |
| Signing certificate SHA-256 | `C6:C7:FF:F1:32:69:D0:16:D5:9D:17:87:10:66:5F:69:BC:FD:47:C9:39:D6:C2:86:CA:D8:65:35:BC:1F:88:9C` |
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
- the same Trusted Web Activity code, built as the test package `art.pikko.app` with a throwaway key, ran on a real Seeker (Android 15): Android verified pikko.art, the game opened full screen, and the publisher confirmed the wallet connection works;
- the final `art.pikko.game` build is the same code with only the package name and the signing key changed. It was built, signed and signature-verified, and its asset links are deployed. **Its install on the Seeker was not tested yet** (the phone was disconnected): ask the publisher to install it once (`adb install -r release\Pikko-1.0.2.apk`, or copy the file) and to check that the game opens with no address bar before submitting.

---

## 3. Pre-flight checks (run them, report the results to the publisher)

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

# 4. the live site vouches for the app (should print "linked": true; Google caches the answer for up to an hour, so if it does not say true yet,
#    read the file itself (last check below) and compare package and fingerprint)
curl.exe -s "https://digitalassetlinks.googleapis.com/v1/assetlinks:check?source.web.site=https://pikko.art&relation=delegate_permission/common.handle_all_urls&target.android_app.package_name=art.pikko.game&target.android_app.certificate.sha256_fingerprint=C6:C7:FF:F1:32:69:D0:16:D5:9D:17:87:10:66:5F:69:BC:FD:47:C9:39:D6:C2:86:CA:D8:65:35:BC:1F:88:9C"

# 5. the pages the listing points to answer
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/play/
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/privacy.html
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/terms.html
curl.exe -s -o NUL -w "%{http_code} %{content_type}`n" https://pikko.art/.well-known/assetlinks.json
```

All must pass (200 and the expected values). If the assetlinks file is missing or shows another package or fingerprint, **stop and tell the publisher**: the site was probably redeployed without the file `/.well-known/assetlinks.json`. Its source of truth is `pikko-android/assetlinks.json`. Do not "fix" the Vercel project yourself.

Optional, if the Seeker is connected by USB: `adb shell pm get-app-links art.pikko.game` should say `pikko.art: verified`.

---

## 4. Step by step (Publisher Portal)

The app and its listing already exist (§0), so the work is: check the saved listing, mint the app (publisher), create the first release, submit.

Follow the portal's own wording. Before each "publisher" step, stop and wait.

1. **Account (publisher).** https://publish.solanamobile.com: sign up or log in, fill the publisher profile, complete **KYC/KYB**. Support/contact email: welcome@devfridge.cool if asked. Wait until verification is accepted.
2. **Publisher wallet (publisher).** The publisher connects a browser-extension wallet. It becomes the publisher wallet for this app **forever**: every future update must come from it. Recommend one the publisher controls long-term and has backed up. About **0.2 SOL** is usually enough for fees and storage.
3. **Storage provider.** Choose **ArDrive** (the portal's recommendation). Use the portal's cost tool: the APK is about 4 MB and the images a few MB. If the balance is short, the **publisher** clicks *Top Up Balance* and approves.
4. **Check the existing listing** (do not create a second app): open `art.pikko.game` and compare it with `store/LISTING.md`. The saved icon, banner and the four landscape screenshots are the earlier ones; the new Pikko icon, banner and five 1080×1920 screenshots in `store/` are optional replacements: show both to the publisher and **replace only if the publisher agrees**. If something is wrong or missing, fill it from `store/LISTING.md`: name PIKKO; short and long description copied exactly (if a field is shorter, shorten without changing the facts, especially: the wallet is optional and read-only, and the game never asks for a signature or transaction); website, privacy, Terms of Use and contacts from §2; category Games; icon, banner and screenshots from `store/`; copyright "© PIKKO / DevFridge" (ask the publisher if the portal asks anything legal you don't know). For the content/age questionnaire, answer honestly from LISTING.md (kid mode default, crypto behind an adults-only question, no real-money gambling, no user-generated content). Show changes to the publisher before saving.
5. **Mint App (publisher).** If not done yet, the publisher clicks *Mint App* and approves the wallet requests. "New Version" stays disabled until then.
6. **First release.** App *Home* → **New Version** → upload `release\Pikko-1.0.2.apk`. *What's new*: "First release on the dApp Store: PIKKO, the healthy-eating game with 24 country bags, full screen, with Seed Vault wallet support."
7. **Submit (publisher).** The publisher clicks **Submit** and approves **every** message-signing and transaction prompt, one by one (they upload assets to Arweave and mint the Release NFT). The portal warns that skipping a prompt can leave assets missing: if one was rejected by mistake, check the submission status and follow the portal's retry instructions.
8. **Notes for reviewers**, if there is a field: paste the "Notes for reviewers" section of `LISTING.md`.

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
2. Run `node build.mjs` in `pikko-android/`. It signs with the existing key in `Documents\ChatGPT\pikko game\solana-mobile\.signing\` (`pikko-release.jks`, password DPAPI-protected for the publisher's Windows user) and **refuses to create or use another key**. If that folder is missing, stop and ask the publisher for their backup.
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
| Signing key | `%USERPROFILE%\Documents\ChatGPT\pikko game\solana-mobile\.signing\pikko-release.jks` + `password.dpapi` (readable only by the publisher's Windows user; **no offline backup is recorded: ask the publisher to make one**) |
| Key backup script | `pikko-android/backup-key.ps1 -Destination <offline>\pikko-release.p12` (the publisher types the backup password) |
| Earlier project (superseded) | `%USERPROFILE%\Documents\ChatGPT\pikko game\solana-mobile\` (listing assets, `publication-status.json`) |
| Asset links (must be served by the site) | `pikko-android/assetlinks.json` → https://pikko.art/.well-known/assetlinks.json |
| Game and wallet code | `pikko-game/` (`src/access/wallet.ts`) |
| Evidence and limits | `README.md`, `SUBMISSION.md`, `VERIFICATION.md` at the repo root |
