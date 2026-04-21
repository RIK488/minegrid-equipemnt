# Ajoute `import { toast } from '<relpath>/utils/toast';` aux fichiers qui
# utilisent `toast(`, `toast.success(`, etc., sans l'avoir importe.
#
# Usage :
#   ./scripts/refactor/add-toast-import.ps1 -File src/pages/X.tsx

param (
    [Parameter(Mandatory=$true)][string]$File
)

if (-not (Test-Path $File)) {
    Write-Error "Fichier introuvable : $File"
    exit 1
}

$content = Get-Content -Path $File -Raw -Encoding UTF8

# Pas de toast utilise ? skip.
if ($content -notmatch '\btoast(\s*\(|\.(success|error|warning|info)\s*\()') {
    Write-Host "$File : pas d'usage toast, skip."
    exit 0
}

# Calcul du chemin relatif robuste vers src/utils/toast.ts.
$fileFullPath = (Resolve-Path $File).Path
$fileDir = Split-Path -Parent $fileFullPath
$toastFullPath = (Resolve-Path (Join-Path $PSScriptRoot '..\..\src\utils\toast.ts')).Path

Push-Location $fileDir
try {
    $relFile = Resolve-Path -Relative $toastFullPath
} finally {
    Pop-Location
}
# Retirer l'extension .ts et normaliser
$rel = ($relFile -replace '\\', '/') -replace '\.ts$', ''
if ($rel -notmatch '^\.') { $rel = "./$rel" }

# Import deja present ? skip.
$importPattern = "from\s+['`"]$([regex]::Escape($rel))['`"]"
if ($content -match $importPattern) {
    Write-Host "$File : import deja present."
    exit 0
}

# Ajout apres le dernier import (y compris multi-lignes)
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

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($fileFullPath, $content, $utf8NoBom)
Write-Host "$File : import toast ajoute ($rel)"
