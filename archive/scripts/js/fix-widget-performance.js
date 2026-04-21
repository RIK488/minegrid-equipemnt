// Script pour restaurer le widget "Score de Performance Commerciale" avec toutes ses fonctionnalités
console.log('🔧 Restauration du widget "Score de Performance Commerciale" avec toutes ses fonctionnalités...');

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
  'widgetConfig_loueur'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
});

console.log('✅ Configuration nettoyée !');

// Vider le cache du navigateur
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

console.log('✅ Cache nettoyé !');

// Forcer le rechargement de la page
console.log('🔄 Rechargement de la page...');
window.location.reload();

// Instructions pour l'utilisateur
console.log(`
📋 INSTRUCTIONS :

1. Ouvrez la console du navigateur (F12)
2. Copiez et collez ce script
3. Appuyez sur Entrée
4. La page se rechargera automatiquement
5. Allez sur http://localhost:5173/#dashboard-entreprise
6. Le widget "Score de Performance Commerciale" devrait s'afficher avec toutes ses fonctionnalités

🎯 FONCTIONNALITÉS ATTENDUES :
- Score global sur 100 avec jauge circulaire animée
- Comparaison avec objectif mensuel (68/85 points)
- Rang anonymisé parmi les vendeurs (3/12)
- Niveau d'activité recommandé avec badge coloré
- Métriques détaillées (ventes, croissance, prospects, réactivité)
- Recommandations IA concrètes avec priorités
`); 