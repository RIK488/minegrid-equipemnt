# Script de configuration Node.js pour PowerShell
# A executer une fois pour configurer les alias

Write-Host "Configuration des alias Node.js..." -ForegroundColor Green

# Ajouter Node.js au PATH pour cette session
$env:PATH += ";C:\Program Files\nodejs"

# Creer les alias
Set-Alias -Name node -Value "C:\Program Files\nodejs\node.exe" -Scope Global
Set-Alias -Name npm -Value "C:\Program Files\nodejs\npm.cmd" -Scope Global

Write-Host "Alias crees avec succes !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser : npm run dev" -ForegroundColor Cyan

# Tester
Write-Host "Test des commandes..." -ForegroundColor Yellow
node --version
npm --version
