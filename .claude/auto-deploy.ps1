# Otomatik dağıtım: çalışma kopyasında değişiklik varsa commit + push yapar.
# Push sonrası GitHub Pages canlı siteyi otomatik günceller.
# Bu script bir Stop hook tarafından çağrılır (.claude/settings.local.json).
$ErrorActionPreference = 'SilentlyContinue'

# Proje köküne geç (script .claude içinde)
Set-Location -Path (Join-Path $PSScriptRoot '..')

# Değişiklik yoksa hiçbir şey yapma
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) { exit 0 }

git add -A | Out-Null
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm'
git commit -q -m "Otomatik güncelleme: $ts" | Out-Null
git push -q origin HEAD 2>&1 | Out-Null
exit 0
