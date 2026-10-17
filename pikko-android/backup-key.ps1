# Copy the Android release key of PIKKO (store listing art.pikko.game) to a portable backup protected by a
# password you type now (the original password is DPAPI-bound to this Windows user and does not travel).
# Every update of the app in the Solana dApp Store must be signed with this same key: keep the backup
# offline and the password in your password manager. Never send either through chat, email or git.
# Usage: powershell -File backup-key.ps1 -Destination 'E:\AndroidKeys\pikko-release.p12'
param([Parameter(Mandatory = $true)][string]$Destination)
$ErrorActionPreference = 'Stop'
$dir = if ($env:PIKKO_KEY_DIR) { $env:PIKKO_KEY_DIR } else { Join-Path $env:USERPROFILE 'Documents\ChatGPT\pikko game\solana-mobile\.signing' }
$ks = Join-Path $dir 'pikko-release.jks'
$passFile = Join-Path $dir 'password.dpapi'
if (-not (Test-Path $ks) -or -not (Test-Path $passFile)) { throw "Nessuna chiave in ${dir}" }
if (Test-Path $Destination) { throw "Esiste gia: $Destination" }
if (-not (Test-Path (Split-Path $Destination -Parent))) { throw "La cartella di destinazione non esiste" }
$secure = Get-Content -LiteralPath $passFile -Raw | ConvertTo-SecureString
$env:PIKKO_KS_PASS = [Management.Automation.PSCredential]::new('k', $secure).GetNetworkCredential().Password
$new = Read-Host -AsSecureString 'Password per la copia di sicurezza (almeno 12 caratteri)'
$plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($new))
if ($plain.Length -lt 12) { throw 'Password troppo corta' }
$env:PIKKO_BACKUP_PASS = $plain
try {
  keytool -importkeystore -srckeystore $ks -srcstoretype JKS -srcstorepass:env PIKKO_KS_PASS -srcalias pikko-release -destkeystore $Destination -deststoretype PKCS12 -deststorepass:env PIKKO_BACKUP_PASS -destkeypass:env PIKKO_BACKUP_PASS -noprompt
  if ($LASTEXITCODE -ne 0) { throw 'keytool ha fallito' }
} finally {
  Remove-Item Env:PIKKO_KS_PASS, Env:PIKKO_BACKUP_PASS -ErrorAction SilentlyContinue
}
Write-Host "Copia di sicurezza scritta in $Destination. Conserva la password a parte."
