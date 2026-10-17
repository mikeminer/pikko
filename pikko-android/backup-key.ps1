# Copy the Android release key of PIKKO to a portable backup, protected by a password you
# type now (the original password is DPAPI-bound to this Windows user and doesn't travel).
# Every update of the app in the Solana dApp Store must be signed with this same key: keep the backup
# offline and the password in your password manager. Never send either through chat, email or git.
# Usage: powershell -File backup-key.ps1 -Destination 'E:\AndroidKeys\pikko-release.p12'
param([Parameter(Mandatory = $true)][string]$Destination)
$ErrorActionPreference = 'Stop'
$dir = Join-Path $env:USERPROFILE 'PikkoArt\android-signing'
$ks = Join-Path $dir 'release.p12'
if (-not (Test-Path $ks)) { throw "Nessuna chiave in ${ks}: esegui prima node build.mjs" }
if (Test-Path $Destination) { throw "Esiste già: $Destination" }
if (-not (Test-Path (Split-Path $Destination -Parent))) { throw "La cartella di destinazione non esiste" }
Add-Type -AssemblyName System.Security
$blob = Get-Content (Join-Path $dir 'release.pass.dpapi') -Raw
$env:PIKKO_KS_PASS = [Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($blob.Trim()), $null, 'CurrentUser'))
$new = Read-Host -AsSecureString 'Password per la copia di sicurezza (almeno 12 caratteri)'
$plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($new))
if ($plain.Length -lt 12) { throw 'Password troppo corta' }
$env:PIKKO_BACKUP_PASS = $plain
keytool -importkeystore -srckeystore $ks -srcstoretype PKCS12 -srcstorepass:env PIKKO_KS_PASS -destkeystore $Destination -deststoretype PKCS12 -deststorepass:env PIKKO_BACKUP_PASS -destkeypass:env PIKKO_BACKUP_PASS -noprompt
Remove-Item Env:PIKKO_KS_PASS, Env:PIKKO_BACKUP_PASS
Write-Host "Copia di sicurezza scritta in $Destination. Conserva la password a parte."
