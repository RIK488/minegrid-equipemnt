# Migre les `alert(...)` vers `toast(...)` avec ajout automatique de
# l'import `import { toast } from '<relpath>/utils/toast';` si manquant.
#
# Usage :
#   ./scripts/refactor/migrate-alert-to-toast.ps1 -File src/pages/X.tsx
#
# Bonnes pratiques :
#  - le script ne remplace que les `alert(` en debut de mot (regex `\balert\(`)
#    pour eviter de toucher `window.alert(`, `customAlert(`, etc.
#  - il detecte les imports multi-lignes pour poser le nouvel import juste
#    apres la derniere ligne qui ferme un import (`} from '...';` ou
#    `import X from '...';`).
#  - UTF-8 sans BOM pour compatibilite ES module.

param (
    [Parameter(Mandatory=$true)][string]$File
)

if (-not (Test-Path $File)) {
    Write-Error "Fichier introuvable : $File"
    exit 1
}

$content = Get-Content -Path $File -Raw -Encoding UTF8

# Nombre d'occurrences avant
$before = ([regex]::Matches($content, '\balert\(')).Count
if ($before -eq 0) {
    Write-Host "$File : aucun alert() trouve, skip."
    exit 0
}

# Calcul du chemin d'import relatif vers src/utils/toast
# depuis le fichier courant. On resout d'abord le path absolu du .ts
# (il existe physiquement), puis on retire l'extension pour l'import.
$fileDir = Split-Path -Parent (Resolve-Path $File).Path
$toastFullPath = (Resolve-Path (Join-Path $PSScriptRoot '..\..\src\utils\toast.ts')).Path

Push-Location $fileDir
try {
    $relFile = Resolve-Path -Relative $toastFullPath
} finally {
    Pop-Location
}
$rel = ($relFile -replace '\\', '/') -replace '\.ts$', ''
if ($rel -notmatch '^\.') { $rel = "./$rel" }

# Substitution alert(...) -> toast(...)
$content = [regex]::Replace($content, '\balert\(', 'toast(')

# Ajout de l'import s'il manque
$importPattern = "from\s+['`"]$([regex]::Escape($rel))['`"]"
if ($content -notmatch $importPattern) {
    $lines = $content -split "`r?`n"
    $lastImportIdx = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match "from\s+['`"][^'`"]+['`"]\s*;?\s*$" -or
            $line -match "^\s*import\s+['`"][^'`"]+['`"]\s*;?\s*$") {
            $lastImportIdx = $i
        }
    }
    if ($lastImportIdx -lt 0) { $lastImportIdx = 0 }
    $newImport = "import { toast } from '$rel';"
    $newLines = @()
    $newLines += $lines[0..$lastImportIdx]
    $newLines += $newImport
    if ($lastImportIdx + 1 -le $lines.Count - 1) {
        $newLines += $lines[($lastImportIdx + 1)..($lines.Count - 1)]
    }
    $content = ($newLines -join "`n")
}

# Ecriture UTF-8 sans BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $File).Path, $content, $utf8NoBom)

Write-Host "$File : $before alert() -> toast()"
