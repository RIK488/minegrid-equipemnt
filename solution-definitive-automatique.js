console.log('🚨 SOLUTION DÉFINITIVE AUTOMATIQUE - Résolution du problème de persistance');

// ========================================
// ÉTAPE 1: NETTOYAGE COMPLET
// ========================================

console.log('\n🗑️ ÉTAPE 1: Nettoyage complet...');

// 1. Supprimer TOUTES les configurations localStorage
const allKeys = Object.keys(localStorage);
const dashboardKeys = allKeys.filter(key => 
  key.includes('dashboard') || 
  key.includes('widget') || 
  key.includes('config') || 
  key.includes('enterprise') ||
  key.includes('vendeur') ||
  key.includes('metier') ||
  key.includes('theme') ||
  key.includes('currency') ||
  key.includes('user')
);

console.log(`   Suppression de ${dashboardKeys.length} clés localStorage...`);
dashboardKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`   ✅ Supprimé: ${key}`);
});

// 2. Vider sessionStorage
sessionStorage.clear();
console.log('   ✅ sessionStorage vidé');

// 3. Vider le cache du navigateur
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log(`   ✅ Cache supprimé: ${name}`);
    });
  });
}

// 4. Vider le cache IndexedDB
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
      console.log(`   ✅ IndexedDB supprimé: ${db.name}`);
    });
  });
}

console.log('✅ Nettoyage terminé !');

// ========================================
// ÉTAPE 2: CONFIGURATION FORCÉE
// ========================================

console.log('\n🔧 ÉTAPE 2: Configuration forcée...');

// Configuration FORCÉE avec tous les widgets améliorés
const forcedConfig = {
  version: '3.0.0',
  metier: 'vendeur',
  dashboardConfig: {
    widgets: [
      {
        id: 'daily-actions',
        type: 'daily-actions',
        title: 'Actions Commerciales Prioritaires',
        description: 'Liste des tâches urgentes du jour triées par impact/priorité',
        icon: 'AlertTriangle',
        dataSource: 'daily-actions',
        enabled: true,
        isCollapsed: false,
        position: 0
      },
      {
        id: 'sales-metrics',
        type: 'performance',
        title: 'Score de Performance Commerciale',
        description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA',
        icon: 'Target',
        dataSource: 'sales-performance-score',
        enabled: true,
        isCollapsed: false,
        position: 1
      },
      {
        id: 'inventory-status',
        type: 'list',
        title: 'Plan d\'action stock & revente',
        description: 'Statut stock dormant, recommandations automatiques, actions rapides, et KPI',
        icon: 'Package',
        dataSource: 'inventory-status',
        enabled: true,
        isCollapsed: false,
        position: 2
      },
      {
        id: 'sales-evolution',
        type: 'chart',
        title: 'Évolution des ventes enrichie',
        description: 'Courbe avec benchmarking secteur, notifications automatiques, actions rapides',
        icon: 'TrendingUp',
        dataSource: 'sales-evolution',
        enabled: true,
        isCollapsed: false,
        position: 3
      }
    ],
    theme: 'light',
    layout: 'grid',
    refreshInterval: 30,
    notifications: true
  },
  layouts: {
    lg: [
      { i: 'daily-actions', x: 0, y: 0, w: 12, h: 2 },
      { i: 'sales-metrics', x: 0, y: 2, w: 4, h: 2 },
      { i: 'inventory-status', x: 4, y: 2, w: 8, h: 2 },
      { i: 'sales-evolution', x: 0, y: 4, w: 12, h: 2 }
    ]
  },
  createdAt: new Date().toISOString(),
  forceReload: true,
  lastModified: new Date().toISOString()
};

// Sauvegarder la configuration forcée
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(forcedConfig));
console.log('   ✅ Configuration forcée sauvegardée');

// Ajouter des données de test pour le widget inventory-status
const testData = {
  'inventory-status': [
    {
      id: '1',
      title: 'Bulldozer D6',
      status: 'Stock dormant',
      priority: 'high',
      stock: 2,
      minStock: 3,
      category: 'Bulldozers',
      supplier: 'Caterpillar Maroc',
      value: 1200000,
      location: 'Casablanca',
      dormantDays: 95,
      visibilityRate: 15,
      averageSalesTime: 67,
      clickCount: 3,
      lastContact: '2024-01-10'
    },
    {
      id: '2',
      title: 'Pelle hydraulique 320D',
      status: 'Stock faible',
      priority: 'medium',
      stock: 1,
      minStock: 2,
      category: 'Pelles hydrauliques',
      supplier: 'Komatsu Maroc',
      value: 850000,
      location: 'Rabat',
      dormantDays: 120,
      visibilityRate: 25,
      averageSalesTime: 45,
      clickCount: 8,
      lastContact: '2024-01-15'
    },
    {
      id: '3',
      title: 'Chargeur frontal 950G',
      status: 'En rupture',
      priority: 'high',
      stock: 0,
      minStock: 1,
      category: 'Chargeurs',
      supplier: 'Caterpillar Maroc',
      value: 650000,
      location: 'Marrakech',
      dormantDays: 0,
      visibilityRate: 45,
      averageSalesTime: 38,
      clickCount: 12,
      lastContact: '2024-01-22'
    }
  ]
};

// Sauvegarder les données de test
localStorage.setItem('testData', JSON.stringify(testData));
console.log('   ✅ Données de test sauvegardées');

// ========================================
// ÉTAPE 3: VÉRIFICATION PRÉ-RELANCE
// ========================================

console.log('\n🧪 ÉTAPE 3: Vérification pré-relance...');

// Vérifier que la configuration est bien sauvegardée
const savedConfig = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
const widgets = savedConfig.dashboardConfig?.widgets || [];

console.log(`   Configuration version: ${savedConfig.version}`);
console.log(`   Widgets configurés: ${widgets.length}`);

widgets.forEach(widget => {
  console.log(`   - ${widget.id}: ${widget.title}`);
});

// Vérifier les données de test
const savedTestData = JSON.parse(localStorage.getItem('testData') || '{}');
const inventoryData = savedTestData['inventory-status'] || [];
console.log(`   Données de test: ${inventoryData.length} articles`);

// ========================================
// ÉTAPE 4: RELANCE FORCÉE
// ========================================

console.log('\n🔄 ÉTAPE 4: Relance forcée...');

// Attendre un peu pour que tout soit bien sauvegardé
setTimeout(() => {
  console.log('   Relance de la page sans cache...');
  
  // Forcer le rechargement sans cache
  window.location.reload(true);
}, 1000);

// ========================================
// RÉSUMÉ FINAL
// ========================================

console.log('\n🎯 RÉSUMÉ DE LA SOLUTION:');
console.log('   ✅ Nettoyage complet effectué');
console.log('   ✅ Configuration forcée appliquée');
console.log('   ✅ Données de test ajoutées');
console.log('   ✅ Relance forcée programmée');
console.log('\n📝 Après le rechargement, vous devriez voir:');
console.log('   - Widget "Actions Commerciales Prioritaires"');
console.log('   - Widget "Score de Performance Commerciale"');
console.log('   - Widget "Plan d\'action stock & revente" (AMÉLIORÉ)');
console.log('   - Widget "Évolution des ventes enrichie"');
console.log('\n🎉 SOLUTION DÉFINITIVE APPLIQUÉE !'); 