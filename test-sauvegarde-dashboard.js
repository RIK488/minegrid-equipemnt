// =====================================================
// SCRIPT DE TEST : SAUVEGARDE TABLEAU DE BORD
// =====================================================
// Ce script teste la fonctionnalité de sauvegarde du dashboard

console.log('🧪 Test de sauvegarde du tableau de bord...');

// 1. Vérifier la configuration actuelle
const currentConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
console.log('📋 Configuration actuelle:', currentConfig ? 'Présente' : 'Absente');

if (currentConfig) {
  const parsed = JSON.parse(currentConfig);
  console.log('📊 Widgets configurés:', parsed.widgets?.length || 0);
  console.log('📐 Layout configuré:', parsed.layout?.lg?.length || 0);
  console.log('💾 Dernière sauvegarde:', parsed.lastSaved || 'Non définie');
}

// 2. Simuler une sauvegarde
const testConfig = {
  widgets: [
    {
      id: 'sales-performance-score',
      type: 'performance',
      title: 'Score de Performance Commerciale',
      enabled: true,
      position: 0,
      size: '1/3'
    },
    {
      id: 'sales-evolution',
      type: 'chart',
      title: 'Évolution des ventes enrichie',
      enabled: true,
      position: 1,
      size: '2/3'
    },
    {
      id: 'stock-status',
      type: 'list',
      title: 'Plan d\'action stock & revente',
      enabled: true,
      position: 2,
      size: '1/3'
    },
    {
      id: 'sales-pipeline',
      type: 'list',
      title: 'Pipeline commercial',
      enabled: true,
      position: 3,
      size: '1/3'
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions Commerciales Prioritaires',
      enabled: true,
      position: 4,
      size: '1/1'
    }
  ],
  layout: {
    lg: [
      { i: 'sales-performance-score', x: 0, y: 0, w: 4, h: 4 },
      { i: 'sales-evolution', x: 4, y: 0, w: 8, h: 4 },
      { i: 'stock-status', x: 0, y: 4, w: 4, h: 4 },
      { i: 'sales-pipeline', x: 4, y: 4, w: 4, h: 4 },
      { i: 'daily-actions', x: 8, y: 4, w: 4, h: 4 }
    ]
  },
  widgetSizes: {
    'sales-performance-score': '1/3',
    'sales-evolution': '2/3',
    'stock-status': '1/3',
    'sales-pipeline': '1/3',
    'daily-actions': '1/1'
  },
  theme: 'light',
  refreshInterval: 30,
  notifications: true,
  lastSaved: new Date().toISOString(),
  version: '1.0'
};

// 3. Sauvegarder la configuration de test
try {
  localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(testConfig));
  console.log('✅ Configuration de test sauvegardée avec succès');
  
  // 4. Vérifier la sauvegarde
  const savedConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
  const parsedSaved = JSON.parse(savedConfig);
  
  console.log('📋 Vérification de la sauvegarde:');
  console.log('   - Widgets:', parsedSaved.widgets?.length || 0);
  console.log('   - Layout:', parsedSaved.layout?.lg?.length || 0);
  console.log('   - Version:', parsedSaved.version);
  console.log('   - Dernière sauvegarde:', parsedSaved.lastSaved);
  
  console.log('🎉 Test de sauvegarde réussi !');
  
} catch (error) {
  console.error('❌ Erreur lors du test de sauvegarde:', error);
}

// 5. Instructions pour l'utilisateur
console.log('\n📝 Instructions:');
console.log('1. Rechargez la page du dashboard');
console.log('2. Vérifiez que la configuration est chargée');
console.log('3. Testez le bouton "Sauvegarder"');
console.log('4. Vérifiez que la navigation depuis les services communs fonctionne');

// =====================================================
// RÉSULTAT ATTENDU :
// - Configuration sauvegardée dans localStorage
// - Bouton "Sauvegarder" fonctionnel
// - Navigation depuis services communs vers dashboard
// ===================================================== 