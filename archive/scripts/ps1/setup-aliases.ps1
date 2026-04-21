# Configuration des alias pour npm et node
Write-Host "Configuration des alias..." -ForegroundColor Green

# Ajouter au PATH
$env:PATH += ";C:\Program Files\nodejs"

# Créer les alias
Set-Alias -Name npm -Value "C:\Program Files\nodejs\npm.cmd"
Set-Alias -Name node -Value "C:\Program Files\nodejs\node.exe"

Write-Host "Alias configures !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser : npm run dev" -ForegroundColor Cyan

# Tester
npm --version
