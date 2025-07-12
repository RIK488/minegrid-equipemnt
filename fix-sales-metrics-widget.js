// Script pour corriger la configuration du widget "Score de Performance Commerciale"
console.log('🔧 Correction de la configuration du widget "Score de Performance Commerciale"...');

// Nettoyer le localStorage
localStorage.removeItem('enterpriseDashboardConfig');
localStorage.removeItem('dashboardConfig');
localStorage.removeItem('widgetConfig');

// Configuration correcte du widget
const correctConfig = {
  widgets: [
    {
      id: 'sales-metrics',
      type: 'performance',
      title: 'Score de Performance Commerciale',
      description: 'Votre performance globale avec recommandations IA',
      icon: 'BarChart3',
      enabled: true,
      dataSource: 'sales-performance',
      position: 0
    }
  ],
  theme: 'light',
  layout: 'grid',
  refreshInterval: 30000,
  notifications: true
};

// Sauvegarder la configuration correcte
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(correctConfig));

console.log('✅ Configuration corrigée !');
console.log('📊 Widget "Score de Performance Commerciale" configuré avec:');
console.log('   - Type: performance');
console.log('   - ID: sales-metrics');
console.log('   - Données: getSalesPerformanceScoreData()');
console.log('');
console.log('🔄 Rechargez la page pour voir les changements');
console.log('📍 Allez sur #dashboard-entreprise pour voir le widget fonctionnel'); 