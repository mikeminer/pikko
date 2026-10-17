// Builds release/Pikko-<version>.apk: the Android app (this folder, a Trusted Web Activity of
// https://pikko.art/play/) for sideloading and the Solana dApp Store, signed with PIKKO's release key.
//
//  1. Android SDK: ANDROID_HOME, or %LOCALAPPDATA%\Android\Sdk (platform 36, build-tools 36.0.0)
//  2. release key: the EXISTING PIKKO key of the store listing art.pikko.game (never create or replace it):
//     %USERPROFILE%\Documents\ChatGPT\pikko game\solana-mobile\.signing\pikko-release.jks (JKS, alias pikko-release)
//     and its Windows-DPAPI-protected password (password.dpapi, readable only by this Windows user). Override the
//     folder with PIKKO_KEY_DIR. The password goes to keytool/apksigner through an environment variable, never on a
//     command line or in a file. The store ties updates to the package name and this key.
//  3. the certificate's SHA-256 goes into assetlinks.json (next to this script), which must be served at
//     https://pikko.art/.well-known/assetlinks.json so Android opens the site full screen, without a browser bar
//  4. gradle :app:assembleRelease :app:lintRelease, then zipalign + apksigner sign + verify
// Usage: node build.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const ANDROID = ROOT;
const SDK = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
const BUILD_TOOLS = join(SDK, 'build-tools', '36.0.0');
// in the user profile, not AppData: when a packaged (MSIX) app runs this script, its writes to AppData
// go to the app's private copy, which is deleted together with the app
const KEY_DIR = process.env.PIKKO_KEY_DIR || join(process.env.USERPROFILE ?? '', 'Documents', 'ChatGPT', 'pikko game', 'solana-mobile', '.signing');
const KEYSTORE = join(KEY_DIR, 'pikko-release.jks');
const PASSFILE = join(KEY_DIR, 'password.dpapi');
const ALIAS = 'pikko-release';
const STORETYPE = 'JKS';
const step = (s) => console.log(`\n▸ ${s}`);
const PACKAGE = /applicationId = "([^"]+)"/.exec(readFileSync(join(ANDROID, 'app', 'build.gradle.kts'), 'utf8'))[1];
const VERSION = /versionName = "([^"]+)"/.exec(readFileSync(join(ANDROID, 'app', 'build.gradle.kts'), 'utf8'))[1];

if (!existsSync(join(SDK, 'platforms', 'android-36')) || !existsSync(BUILD_TOOLS)) throw new Error(`Android SDK incompleto in ${SDK}: servono platforms;android-36 e build-tools;36.0.0`);
// a .properties value: backslashes and the drive's colon escaped (C\:\\Users\\…)
writeFileSync(join(ANDROID, 'local.properties'), `sdk.dir=${SDK.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}\n`);

// ---------------------------------------------------------------- the key and its password (DPAPI)
if (!existsSync(KEYSTORE) || !existsSync(PASSFILE)) throw new Error(`Chiave di firma non trovata in ${KEY_DIR}. Non creo una chiave nuova: ripristina quella esistente (o imposta PIKKO_KEY_DIR).`);
// the password file is a PowerShell secure string (DPAPI, current Windows user); the value is read into the child's environment only
const pass = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', "$s = Get-Content -LiteralPath $env:PIKKO_PASSFILE -Raw | ConvertTo-SecureString; [Management.Automation.PSCredential]::new('k', $s).GetNetworkCredential().Password"], { encoding: 'utf8', env: { ...process.env, PIKKO_PASSFILE: PASSFILE } }).trim();
if (!pass) throw new Error('password della chiave non leggibile (account Windows diverso?)');
const KS_ENV = { ...process.env, PIKKO_KS_PASS: pass };

// ---------------------------------------------------------------- the site vouches for the app
step('Impronta del certificato → /.well-known/assetlinks.json');
const list = execFileSync('keytool', ['-list', '-v', '-keystore', KEYSTORE, '-storetype', STORETYPE, '-alias', ALIAS, '-storepass:env', 'PIKKO_KS_PASS'], { encoding: 'utf8', env: KS_ENV });
const sha = /SHA256:\s*([0-9A-F:]{95})/i.exec(list)?.[1].toUpperCase();
if (!sha) throw new Error('impronta SHA-256 del certificato non trovata');
const links = [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: PACKAGE, sha256_cert_fingerprints: [sha] } }];
writeFileSync(join(ROOT, 'assetlinks.json'), `${JSON.stringify(links, null, 2)}
`);
console.log(`  ${sha}`);

// ---------------------------------------------------------------- build, align, sign, verify
step('Build Android (release) e lint');
// the wrapper and apksigner run straight on Java: their .bat launchers break on a path with spaces
execFileSync('java', ['-Djavax.net.ssl.trustStoreType=Windows-ROOT', '-classpath', join(ANDROID, 'gradle', 'wrapper', 'gradle-wrapper.jar'), 'org.gradle.wrapper.GradleWrapperMain', ':app:assembleRelease', ':app:lintRelease', '--no-daemon', '--console=plain'], { cwd: ANDROID, stdio: 'inherit' });
const APKSIGNER = ['-jar', join(BUILD_TOOLS, 'lib', 'apksigner.jar')];
const unsigned = join(ANDROID, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
const aligned = join(ANDROID, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-aligned.apk');
execFileSync(join(BUILD_TOOLS, 'zipalign.exe'), ['-p', '-f', '4', unsigned, aligned], { stdio: 'inherit' });
mkdirSync(join(ROOT, 'release'), { recursive: true });
const out = join(ROOT, 'release', `Pikko-${VERSION}.apk`);
step('Firma');
execFileSync('java', [...APKSIGNER, 'sign', '--ks', KEYSTORE, '--ks-type', STORETYPE, '--ks-key-alias', ALIAS, '--ks-pass', 'env:PIKKO_KS_PASS', '--key-pass', 'env:PIKKO_KS_PASS', '--out', out, aligned], { stdio: 'inherit', env: KS_ENV });
const verify = execFileSync('java', [...APKSIGNER, 'verify', '--verbose', '--print-certs', out], { encoding: 'utf8' });
if (!verify.includes(sha.replace(/:/g, '').toLowerCase())) throw new Error('la firma dell’APK non corrisponde alla chiave di Pikko');
const digest = createHash('sha256').update(readFileSync(out)).digest('hex');
console.log(`\n✔ ${out}  (${(statSync(out).size / 1048576).toFixed(1)} MB)\n  sha256 ${digest}\n  certificato ${sha}`);
copyFileSync(out, join(ROOT, 'release', 'Pikko-latest.apk'));
