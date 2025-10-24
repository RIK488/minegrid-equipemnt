# Script de demarrage pour Minegrid Equipement
# Ajoute Node.js au PATH et lance l'application

Write-Host "Demarrage de Minegrid Equipement..." -ForegroundColor Green

# Ajouter Node.js au PATH
$env:PATH += ";C:\Program Files\nodejs"

# Verifier que Node.js est disponible
try {
    $nodeVersion = node --version
    Write-Host "Node.js detecte : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Erreur : Node.js non trouve" -ForegroundColor Red
    exit 1
}

# Verifier que npm est disponible
try {
    $npmVersion = npm --version
    Write-Host "npm detecte : $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Erreur : npm non trouve" -ForegroundColor Red
    exit 1
}

# Lancer l'application
Write-Host "Lancement du serveur de developpement..." -ForegroundColor Yellow
Write-Host "L'application sera accessible sur : http://localhost:5173" -ForegroundColor Cyan

npm run dev
