#!/usr/bin/env node

/**
 * Script de démarrage rapide pour tester l'application
 * 
 * Utilisation:
 * node start-app.js
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Démarrage rapide de l\'application...\n');

// Vérifier les prérequis
function checkPrerequisites() {
  console.log('1️⃣ Vérification des prérequis...');
  
  // Vérifier package.json
  if (!existsSync('package.json')) {
    console.error('❌ package.json non trouvé');
    process.exit(1);
  }
  
  // Vérifier les variables d'environnement
  const envFile = join(process.cwd(), '.env');
  if (!existsSync(envFile)) {
    console.warn('⚠️ Fichier .env non trouvé');
    console.log('💡 Créez un fichier .env avec vos variables Supabase');
  } else {
    console.log('✅ Fichier .env trouvé');
  }
  
  console.log('✅ Prérequis vérifiés\n');
}

// Tester le service local
async function testLocalService() {
  console.log('2️⃣ Test du service local de taux de change...');
  
  try {
    const { getExchangeRates } = await import('./src/utils/exchangeRates.js');
    const rates = await getExchangeRates();
    console.log('✅ Service local fonctionne:', Object.keys(rates).length, 'devises');
  } catch (error) {
    console.error('❌ Erreur service local:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Service local testé\n');
}

// Installer les dépendances si nécessaire
function installDependencies() {
  console.log('3️⃣ Vérification des dépendances...');
  
  if (!existsSync('node_modules')) {
    console.log('📦 Installation des dépendances...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dépendances installées');
    } catch (error) {
      console.error('❌ Erreur installation:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Dépendances déjà installées');
  }
  
  console.log('✅ Dépendances vérifiées\n');
}

// Démarrer l'application
function startApplication() {
  console.log('4️⃣ Démarrage de l\'application...');
  console.log('🌐 L\'application sera disponible sur http://localhost:5173');
  console.log('💡 Le service local de taux de change sera utilisé en cas d\'échec de l\'API Supabase\n');
  
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Erreur démarrage:', error.message);
    process.exit(1);
  }
}

// Fonction principale
async function main() {
  try {
    checkPrerequisites();
    await testLocalService();
    installDependencies();
    startApplication();
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Afficher les informations d'aide
function showHelp() {
  console.log(`
🔧 Script de démarrage rapide

Utilisation:
  node start-app.js          # Démarrage normal
  node start-app.js --help   # Afficher cette aide

Ce script va:
1. Vérifier les prérequis
2. Tester le service local de taux de change
3. Installer les dépendances si nécessaire
4. Démarrer l'application en mode développement

Notes:
- Le service local de taux de change sera utilisé si l'API Supabase échoue
- L'application sera disponible sur http://localhost:5173
- Les erreurs 500 de l'API exchange-rates seront gérées automatiquement
`);
}

// Gérer les arguments de ligne de commande
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Exécuter le script principal
main(); 