# Migrateur console.* -> logger.* pour un fichier donne.
# Usage : .\migrate-console-to-logger.ps1 -File <path> -LoggerImport "../../../utils/logger"
#
# Regles de substitution :
#   console.log   -> logger.info
#   console.info  -> logger.info
#   console.warn  -> logger.warn
#   console.debug -> logger.debug
#   console.error -> logger.error
#
# Si le fichier n'importe pas deja `logger`, ajoute la ligne d'import juste
# apres le dernier `import` du haut du fichier.
#
# Ecrit en UTF-8 SANS BOM pour preserver les accents.

param(
  [Parameter(Mandatory=$true)][string]$File,
  [Parameter(Mandatory=$true)][string]$LoggerImport
)

if (-not (Test-Path $File)) {
  Write-Error "Fichier introuvable : $File"
  exit 1
}

$content = [System.IO.File]::ReadAllText($File)
$original = $content

# 1. Substitutions console.X( -> logger.Y(
$content = $content -replace 'console\.log\s*\(',   'logger.info('
$content = $content -replace 'console\.info\s*\(',  'logger.info('
$content = $content -replace 'console\.warn\s*\(',  'logger.warn('
$content = $content -replace 'console\.debug\s*\(', 'logger.debug('
$content = $content -replace 'console\.error\s*\(', 'logger.error('

$before = ($original | Select-String -Pattern "console\.(log|warn|info|debug|error)" -AllMatches).Matches.Count
$after  = ($content  | Select-String -Pattern "console\.(log|warn|info|debug|error)" -AllMatches).Matches.Count

# 2. Ajouter l'import s'il manque
# On cherche la derniere ligne qui FERME un import (contient `from '...'`
# ou bien une simple ligne `import 'foo';` cote-a-cote). Gere les imports
# multi-lignes comme `import {\n  A, B, C\n} from 'lucide-react';`.
if ($content -notmatch "from\s+['""]$([regex]::Escape($LoggerImport))['""]") {
  $lines = $content -split "`r?`n"
  $lastImportIdx = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    # Fin d'un import multi-ligne : `} from '...';` ou import une ligne `import X from '...';`
    if ($line -match "from\s+['""][^'""]+['""]\s*;?\s*$" -or $line -match "^\s*import\s+['""][^'""]+['""]\s*;?\s*$") {
      $lastImportIdx = $i
    }
  }
  if ($lastImportIdx -lt 0) { $lastImportIdx = 0 }
  $newImport = "import { logger } from '$LoggerImport';"
  $newLines = @()
  $newLines += $lines[0..$lastImportIdx]
  $newLines += $newImport
  if ($lastImportIdx + 1 -le $lines.Count - 1) {
    $newLines += $lines[($lastImportIdx + 1)..($lines.Count - 1)]
  }
  $content = ($newLines -join "`n")
}

# 3. Ecriture UTF-8 sans BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $File), $content, $utf8NoBom)

Write-Host ("[{0,-55}] console.*: {1} -> {2} (diff: -{3})" -f $File, $before, $after, ($before - $after))
