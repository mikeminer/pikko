// Builds release/Pikko-<version>.apk: the Android app (this folder, a Trusted Web Activity of
// https://pikko.art/play/) for sideloading and the Solana dApp Store, signed with PIKKO's release key.
//
//  1. Android SDK: ANDROID_HOME, or %LOCALAPPDATA%\Android\Sdk (platform 36, build-tools 36.0.0)
//  2. release key: %USERPROFILE%\PikkoArt\android-signing\release.p12 (RSA-3072), created on the
//     first run. Its random password is kept only DPAPI-protected (this Windows user) next to it; it is
//     passed to keytool/apksigner through an environment variable, never on a command line or in a file
//     in the project. Back the key up (backup-key.ps1): every future update of the app
//     in the dApp Store must be signed with this same key.
//  3. the certificate's SHA-256 goes into assetlinks.json (next to this script), which must be served at
//     https://pikko.art/.well-known/assetlinks.json so Android opens the site full screen, without a browser bar
//  4. gradle :app:assembleRelease :app:lintRelease, then zipalign + apksigner sign + verify
// Usage: node build.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const ANDROID = ROOT;
const SDK = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
const BUILD_TOOLS = join(SDK, 'build-tools', '36.0.0');
// in the user profile, not AppData: when a packaged (MSIX) app runs this script, its writes to AppData
// go to the app's private copy, which is deleted together with the app
const KEY_DIR = join(process.env.USERPROFILE ?? '', 'PikkoArt', 'android-signing');
const KEYSTORE = join(KEY_DIR, 'release.p12');
const PASSFILE = join(KEY_DIR, 'release.pass.dpapi');
const ALIAS = 'pikko';
const step = (s) => console.log(`\n▸ ${s}`);
const VERSION = /versionName = "([^"]+)"/.exec(readFileSync(join(ANDROID, 'app', 'build.gradle.kts'), 'utf8'))[1];

if (!existsSync(join(SDK, 'platforms', 'android-36')) || !existsSync(BUILD_TOOLS)) throw new Error(`Android SDK incompleto in ${SDK}: servono platforms;android-36 e build-tools;36.0.0`);
// a .properties value: backslashes and the drive's colon escaped (C\:\\Users\\…)
writeFileSync(join(ANDROID, 'local.properties'), `sdk.dir=${SDK.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}\n`);

// ---------------------------------------------------------------- the key and its password (DPAPI)
const ps = (script, env) => execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', env: { ...process.env, ...env } }).trim();
const protect = (secret) => ps("Add-Type -AssemblyName System.Security; [Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($env:PIKKO_SECRET), $null, 'CurrentUser'))", { PIKKO_SECRET: secret });
const unprotect = (b64) => ps("Add-Type -AssemblyName System.Security; [Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($env:PIKKO_BLOB), $null, 'CurrentUser'))", { PIKKO_BLOB: b64 });

mkdirSync(KEY_DIR, { recursive: true });
let pass;
if (!existsSync(KEYSTORE)) {
  step('Creo la chiave di firma (una volta sola)');
  pass = randomBytes(24).toString('base64url');
  writeFileSync(PASSFILE, protect(pass));
  execFileSync('keytool', ['-genkeypair', '-keystore', KEYSTORE, '-storetype', 'PKCS12', '-alias', ALIAS, '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-dname', 'CN=PIKKO, O=PIKKO, C=IT', '-storepass:env', 'PIKKO_KS_PASS', '-keypass:env', 'PIKKO_KS_PASS'], { stdio: 'inherit', env: { ...process.env, PIKKO_KS_PASS: pass } });
  console.log(`  chiave: ${KEYSTORE}\n  fai subito una copia di sicurezza: powershell -File backup-key.ps1`);
} else pass = unprotect(readFileSync(PASSFILE, 'utf8').trim());
const KS_ENV = { ...process.env, PIKKO_KS_PASS: pass };

// ---------------------------------------------------------------- the site vouches for the app
step('Impronta del certificato → /.well-known/assetlinks.json');
const list = execFileSync('keytool', ['-list', '-v', '-keystore', KEYSTORE, '-storetype', 'PKCS12', '-alias', ALIAS, '-storepass:env', 'PIKKO_KS_PASS'], { encoding: 'utf8', env: KS_ENV });
const sha = /SHA256:\s*([0-9A-F:]{95})/i.exec(list)?.[1].toUpperCase();
if (!sha) throw new Error('impronta SHA-256 del certificato non trovata');
const links = [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: 'art.pikko.app', sha256_cert_fingerprints: [sha] } }];
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
execFileSync('java', [...APKSIGNER, 'sign', '--ks', KEYSTORE, '--ks-type', 'PKCS12', '--ks-key-alias', ALIAS, '--ks-pass', 'env:PIKKO_KS_PASS', '--key-pass', 'env:PIKKO_KS_PASS', '--out', out, aligned], { stdio: 'inherit', env: KS_ENV });
const verify = execFileSync('java', [...APKSIGNER, 'verify', '--verbose', '--print-certs', out], { encoding: 'utf8' });
if (!verify.includes(sha.replace(/:/g, '').toLowerCase())) throw new Error('la firma dell’APK non corrisponde alla chiave di Pikko');
const digest = createHash('sha256').update(readFileSync(out)).digest('hex');
console.log(`\n✔ ${out}  (${(statSync(out).size / 1048576).toFixed(1)} MB)\n  sha256 ${digest}\n  certificato ${sha}`);
copyFileSync(out, join(ROOT, 'release', 'Pikko-latest.apk'));
