#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Nettoyage du cache et de la configuration...');

// Supprimer toutes les configurations sauvegardées
const keysToRemove = [
  'enterpriseDashboardConfig',
  'dashboardConfig', 
  'savedDashboardConfigs',
  'widgetConfigurations',
  'vendeur-dashboard-config',
  'transporteur-dashboard-config',
  'mecanicien-dashboard-config',
  'transitaire-dashboard-config',
  'financier-dashboard-config',
  'loueur-dashboard-config',
  'selectedMetier',
  'dashboardLayout',
  'widgetPositions'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
});

console.log('✅ Cache nettoyé !');

// Vider le cache du navigateur
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

console.log('✅ Cache navigateur vidé !');

// Recharger la page
setTimeout(() => {
  window.location.href = window.location.origin + '/#entreprise';
}, 1000);

// Supprimer le dossier node_modules/.vite
const viteCachePath = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(viteCachePath)) {
    console.log('📁 Suppression du cache Vite...');
    fs.rmSync(viteCachePath, { recursive: true, force: true });
}

// Supprimer le dossier dist s'il existe
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('📁 Suppression du dossier dist...');
    fs.rmSync(distPath, { recursive: true, force: true });
}

console.log('🚀 Redémarrage de l\'application...');

try {
    // Redémarrer l'application
    execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
    console.log('❌ Erreur lors du redémarrage:', error.message);
    console.log('💡 Essayez manuellement: npm run dev');
} 