// ========================================
// SCRIPT DE CORRECTION - À EXÉCUTER DANS LA CONSOLE DU NAVIGATEUR (F12)
// ========================================

console.log('🚨 CORRECTION AUTOMATIQUE DES WIDGETS - DÉMARRAGE...');

// ========================================
// ÉTAPE 1: NETTOYAGE COMPLET
// ========================================

console.log('\n🗑️ ÉTAPE 1: Nettoyage complet du cache...');

// Supprimer TOUT le localStorage
const allKeys = Object.keys(localStorage);
console.log(`   Suppression de ${allKeys.length} clés localStorage...`);
localStorage.clear();

// Supprimer TOUT le sessionStorage
const sessionKeys = Object.keys(sessionStorage);
console.log(`   Suppression de ${sessionKeys.length} clés sessionStorage...`);
sessionStorage.clear();

// Vider tous les caches
if ('caches' in window) {
  caches.keys().then(names => {
    console.log(`   Suppression de ${names.length} caches...`);
    names.forEach(name => caches.delete(name));
  });
}

// Vider IndexedDB
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    console.log(`   Suppression de ${databases.length} bases IndexedDB...`);
    databases.forEach(db => indexedDB.deleteDatabase(db.name));
  });
}

console.log('✅ Nettoyage complet terminé');

// ========================================
// ÉTAPE 2: CONFIGURATION FORCÉE
// ========================================

console.log('\n🔧 ÉTAPE 2: Configuration forcée des widgets...');

const forcedConfig = {
  metier: 'vendeur',
  dashboardConfig: {
    widgets: [
      {
        id: 'inventory-status',
        type: 'list',
        title: 'Plan d\'action stock & revente',
        description: 'Statut stock dormant, recommandations automatiques, actions rapides, et KPI',
        icon: 'Package',
        dataSource: 'inventory-status',
        enabled: true,
        isCollapsed: false,
        position: 1
      },
      {
        id: 'sales-pipeline',
        type: 'pipeline',
        title: 'Pipeline Commercial',
        description: 'Gestion des leads, insights IA, taux de conversion, et actions rapides',
        icon: 'TrendingUp',
        dataSource: 'sales-pipeline',
        enabled: true,
        isCollapsed: false,
        position: 2
      },
      {
        id: 'daily-actions',
        type: 'daily-actions',
        title: 'Actions Journalières',
        description: 'Tâches prioritaires, rappels, et planification quotidienne',
        icon: 'Calendar',
        dataSource: 'daily-actions',
        enabled: true,
        isCollapsed: false,
        position: 3
      },
      {
        id: 'sales-evolution',
        type: 'chart',
        title: 'Évolution des Ventes',
        description: 'Graphiques interactifs, filtres, et analyses avancées',
        icon: 'BarChart3',
        dataSource: 'sales-evolution',
        enabled: true,
        isCollapsed: false,
        position: 4
      },
      {
        id: 'performance-score',
        type: 'metric',
        title: 'Score de Performance',
        description: 'Indicateurs de performance et objectifs',
        icon: 'Target',
        dataSource: 'performance-score',
        enabled: true,
        isCollapsed: false,
        position: 5
      }
    ]
  }
};

// Sauvegarder la configuration forcée
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(forcedConfig));
console.log('✅ Configuration forcée sauvegardée');

// ========================================
// ÉTAPE 3: DONNÉES DE TEST
// ========================================

console.log('\n📊 ÉTAPE 3: Création des données de test...');

// Données pour le widget inventory-status
const inventoryData = [
  {
    id: '1',
    title: 'Excavatrice CAT 320',
    status: 'stock-dormant',
    value: 850000,
    daysInStock: 45,
    recommendation: 'Promotion -15% ou location courte durée',
    action: 'Mettre en avant sur la page d\'accueil'
  },
  {
    id: '2',
    title: 'Chargeuse JCB 3CX',
    status: 'stock-normal',
    value: 420000,
    daysInStock: 12,
    recommendation: 'Maintenir le prix actuel',
    action: 'Continuer la promotion standard'
  },
  {
    id: '3',
    title: 'Bouteur Komatsu D65',
    status: 'stock-dormant',
    value: 1200000,
    daysInStock: 78,
    recommendation: 'Offre spéciale -20% ou échange',
    action: 'Contacter les clients potentiels'
  }
];

// Données pour le widget sales-pipeline
const salesData = [
  {
    id: '1',
    title: 'Construction Atlas',
    stage: 'Prospection',
    priority: 'high',
    value: 850000,
    probability: 25,
    nextAction: 'Premier contact',
    assignedTo: 'Ahmed Benali',
    lastContact: '2024-01-20',
    notes: 'Prospect très intéressé'
  },
  {
    id: '2',
    title: 'BTP Maroc',
    stage: 'Devis',
    priority: 'medium',
    value: 1200000,
    probability: 60,
    nextAction: 'Envoi devis',
    assignedTo: 'Fatima Zahra',
    lastContact: '2024-01-22',
    notes: 'En attente de validation budgétaire'
  },
  {
    id: '3',
    title: 'Infrastructure Plus',
    stage: 'Négociation',
    priority: 'high',
    value: 650000,
    probability: 80,
    nextAction: 'Réunion de négociation',
    assignedTo: 'Karim El Fassi',
    lastContact: '2024-01-21',
    notes: 'Négociation en cours'
  }
];

// Données pour le widget daily-actions
const dailyActionsData = [
  {
    id: '1',
    title: 'Appel de relance - Construction Atlas',
    priority: 'high',
    type: 'call',
    dueDate: '2024-01-24',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Envoi devis - BTP Maroc',
    priority: 'medium',
    type: 'quote',
    dueDate: '2024-01-24',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Réunion de négociation - Infrastructure Plus',
    priority: 'high',
    type: 'meeting',
    dueDate: '2024-01-25',
    status: 'pending'
  }
];

// Sauvegarder les données de test
localStorage.setItem('testData_inventory', JSON.stringify(inventoryData));
localStorage.setItem('testData_sales', JSON.stringify(salesData));
localStorage.setItem('testData_daily', JSON.stringify(dailyActionsData));

console.log('✅ Données de test créées et sauvegardées');
console.log(`   - Inventory: ${inventoryData.length} éléments`);
console.log(`   - Sales: ${salesData.length} éléments`);
console.log(`   - Daily Actions: ${dailyActionsData.length} éléments`);

// ========================================
// ÉTAPE 4: VÉRIFICATION
// ========================================

console.log('\n🧪 ÉTAPE 4: Vérification de la configuration...');

const savedConfig = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
const widgets = savedConfig.dashboardConfig?.widgets || [];

console.log('📋 Configuration vérifiée:');
console.log(`   - Métier: ${savedConfig.metier}`);
console.log(`   - Widgets configurés: ${widgets.length}`);

widgets.forEach((widget, index) => {
  console.log(`   ${index + 1}. ${widget.title} (${widget.id}) - ${widget.enabled ? '✅ Activé' : '❌ Désactivé'}`);
});

// ========================================
// ÉTAPE 5: RECHARGEMENT
// ========================================

console.log('\n🔄 ÉTAPE 5: Rechargement de la page...');

console.log('📋 RÉSUMÉ FINAL:');
console.log('   ✅ Nettoyage complet du cache effectué');
console.log('   ✅ Configuration forcée des widgets créée');
console.log('   ✅ Données de test générées');
console.log('   ✅ Vérification de la configuration terminée');
console.log('   🔄 Rechargement de la page en cours...');

console.log('\n🎯 RÉSULTAT ATTENDU APRÈS RECHARGEMENT:');
console.log('   1. Widget "Plan d\'action stock & revente" visible avec données');
console.log('   2. Widget "Pipeline Commercial" fonctionnel');
console.log('   3. Widget "Actions Journalières" opérationnel');
console.log('   4. Widget "Évolution des Ventes" avec graphiques');
console.log('   5. Widget "Score de Performance" avec métriques');

// Attendre 3 secondes puis recharger
setTimeout(() => {
  console.log('🔄 Rechargement automatique...');
  window.location.reload(true);
}, 3000); 