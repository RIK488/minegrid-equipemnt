# Configuration Node.js pour PowerShell
# Executez ce script une seule fois

Write-Host "Configuration de Node.js..." -ForegroundColor Green

# Ajouter Node.js au PATH utilisateur (permanent)
$currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
$nodePath = "C:\Program Files\nodejs"

if ($currentPath -notlike "*$nodePath*") {
    $newPath = $currentPath + ";" + $nodePath
    [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::User)
    Write-Host "Node.js ajoute au PATH utilisateur" -ForegroundColor Green
} else {
    Write-Host "Node.js deja dans le PATH" -ForegroundColor Yellow
}

# Ajouter au PATH de la session actuelle
$env:PATH += ";C:\Program Files\nodejs"

Write-Host "Configuration terminee !" -ForegroundColor Green
Write-Host "Redemarrez PowerShell pour que les changements prennent effet." -ForegroundColor Cyan
Write-Host "Ou utilisez la commande : npm run dev" -ForegroundColor Yellow

# Tester
Write-Host "Test des commandes..." -ForegroundColor Yellow
node --version
npm --version
