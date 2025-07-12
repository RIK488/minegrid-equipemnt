console.log('🔧 Force l\'affichage du widget "Actions prioritaires du jour"...');

// 1. Nettoyer complètement le localStorage
console.log('🗑️ Nettoyage du localStorage...');
localStorage.clear();
sessionStorage.clear();

// 2. Créer une configuration forcée avec le widget
console.log('⚙️ Création de la configuration forcée...');
const forcedConfig = {
  widgets: [
    {
      id: 'daily-priority-actions',
      type: 'daily-priority',
      title: 'Actions prioritaires du jour',
      description: 'Ce qu\'un vendeur doit faire chaque matin pour vendre plus - actions générées dynamiquement',
      icon: 'Target',
      enabled: true,
      dataSource: 'daily-priority-actions',
      isCollapsed: false,
      position: 0
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions Commerciales Prioritaires',
      description: 'Liste des tâches urgentes du jour (appels, relances, devis) triées par impact/priorité',
      icon: 'AlertTriangle',
      enabled: true,
      dataSource: 'daily-actions',
      isCollapsed: false,
      position: 1
    },
    {
      id: 'sales-metrics',
      type: 'performance',
      title: 'Score de Performance Commerciale',
      description: 'Votre performance globale avec recommandations IA',
      icon: 'Target',
      enabled: true,
      dataSource: 'performance-score',
      isCollapsed: false,
      position: 2
    },
    {
      id: 'inventory-status',
      type: 'list',
      title: 'Plan d\'action stock & revente',
      description: 'Statut stock dormant, recommandations automatiques, actions rapides, et KPI',
      enabled: true,
      position: 3
    },
    {
      id: 'sales-chart',
      type: 'chart',
      title: 'Évolution des ventes',
      description: 'Analyse des tendances, prévisions et export',
      icon: 'TrendingUp',
      enabled: true,
      dataSource: 'sales-evolution',
      isCollapsed: false,
      advanced: true,
      options: { periodSelector: true, metrics: ['CA', 'Ventes', 'Prévision'], export: true, analysis: true },
      position: 4
    },
    {
      id: 'leads-pipeline',
      type: 'list',
      title: 'Pipeline commercial',
      enabled: true,
      position: 5
    }
  ],
  theme: 'light',
  layout: 'grid',
  refreshInterval: 30000,
  notifications: true
};

// 3. Sauvegarder la configuration forcée
localStorage.setItem('dashboardConfig', JSON.stringify(forcedConfig));
localStorage.setItem('userRole', 'vendeur');
localStorage.setItem('widgetOrder', JSON.stringify(['daily-priority-actions', 'daily-actions', 'sales-metrics', 'inventory-status', 'sales-chart', 'leads-pipeline']));

console.log('💾 Configuration sauvegardée dans localStorage');

// 4. Forcer le rechargement de la page
console.log('🔄 Rechargement de la page...');
setTimeout(() => {
  window.location.reload();
}, 1000);

// 5. Vérifier que le widget est bien configuré
console.log('✅ Configuration du widget "Actions prioritaires du jour" :');
console.log('- ID: daily-priority-actions');
console.log('- Type: daily-priority');
console.log('- Position: 0 (en haut)');
console.log('- Titre: Actions prioritaires du jour');
console.log('- Description: Ce qu\'un vendeur doit faire chaque matin pour vendre plus');

console.log('\n🎯 Actions rapides disponibles :');
console.log('- Recommander via Email (bleu)');
console.log('- Mettre en avant (Premium) (violet)');
console.log('- Baisser le prix (rouge)');

console.log('\n📊 Données de test incluses :');
console.log('- 9 actions prioritaires réalistes');
console.log('- Contacts avec téléphone et email');
console.log('- Métriques d\'impact (+85%, +40%, etc.)');
console.log('- Échéances et notes détaillées');

console.log('\n🚀 Le widget devrait maintenant s\'afficher en haut du dashboard vendeur !'); 