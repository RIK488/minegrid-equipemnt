#!/usr/bin/env node

console.log('🧹 Nettoyage complet du cache et des configurations...');

// Script pour nettoyer complètement le cache et les configurations
const clearAllCache = () => {
  console.log('🔧 Début du nettoyage...');
  
  // 1. Nettoyer localStorage
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
    'widgetPositions',
    'enterpriseServiceConfig',
    'widgetConfig',
    'dashboardState',
    'widgetState',
    'userPreferences',
    'dashboardPreferences',
    'widgetPreferences',
    'layoutConfig',
    'widgetConfig_vendeur',
    'widgetConfig_transporteur',
    'widgetConfig_mecanicien',
    'widgetConfig_transitaire',
    'widgetConfig_financier',
    'widgetConfig_loueur',
    'theme-storage',
    'currency-storage',
    'user'
  ];

  console.log('🗑️ Suppression des configurations localStorage...');
  keysToRemove.forEach(key => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      console.log(`   ✅ Supprimé: ${key}`);
    }
  });

  // 2. Nettoyer sessionStorage
  console.log('🗑️ Suppression des configurations sessionStorage...');
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
    console.log('   ✅ sessionStorage vidé');
  }

  // 3. Nettoyer le cache du navigateur
  console.log('🗑️ Suppression du cache navigateur...');
  if (typeof caches !== 'undefined') {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log(`   ✅ Cache supprimé: ${name}`);
      });
    });
  }

  // 4. Nettoyer le cache Vite
  console.log('🗑️ Suppression du cache Vite...');
  const fs = require('fs');
  const path = require('path');
  
  const viteCachePath = path.join(process.cwd(), 'node_modules', '.vite');
  const distPath = path.join(process.cwd(), 'dist');
  
  if (fs.existsSync(viteCachePath)) {
    fs.rmSync(viteCachePath, { recursive: true, force: true });
    console.log('   ✅ Cache Vite supprimé');
  }
  
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('   ✅ Dossier dist supprimé');
  }

  console.log('✅ Nettoyage terminé !');
  console.log('🔄 Redémarrage recommandé du serveur de développement...');
  console.log('   npm run dev');
};

// Exécuter le nettoyage
clearAllCache();

// Script pour le navigateur
const browserScript = `
// Script à copier dans la console du navigateur (F12)
console.log('🧹 Nettoyage complet du navigateur...');

// Vider tous les caches
localStorage.clear();
sessionStorage.clear();

// Vider le cache du navigateur
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// Recharger la page
setTimeout(() => {
  window.location.reload(true);
}, 1000);

console.log('✅ Nettoyage terminé, rechargement...');
`;

console.log('\n📋 Script pour le navigateur :');
console.log('Copiez ce script dans la console du navigateur (F12) :');
console.log(browserScript); 