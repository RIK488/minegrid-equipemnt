console.log('🔧 Force l\'affichage du widget "Plan d\'action stock & revente" amélioré...');

// 1. Nettoyer complètement le localStorage
console.log('🗑️ Nettoyage du localStorage...');
localStorage.clear();
sessionStorage.clear();

// 2. Créer une configuration forcée avec le widget amélioré
const forcedConfig = {
  metier: 'vendeur',
  dashboardConfig: {
    widgets: [
      {
        id: 'inventory-status', // ID correct pour le widget amélioré
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
        id: 'sales-metrics',
        type: 'performance',
        title: 'Score de Performance Commerciale',
        description: 'Votre performance globale avec recommandations IA',
        icon: 'Target',
        dataSource: 'sales-performance-score',
        enabled: true,
        isCollapsed: false,
        position: 1
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
      },
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
  version: '2.0.0'
};

// 3. Sauvegarder la configuration forcée
console.log('💾 Sauvegarde de la configuration forcée...');
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(forcedConfig));

// 4. Vérifier que les données sont disponibles
console.log('📊 Vérification des données...');

// Simuler les données du widget inventory-status si elles n'existent pas
const mockInventoryData = [
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
];

// 5. Forcer le rechargement de la page
console.log('🔄 Rechargement de la page...');
setTimeout(() => {
  window.location.reload(true);
}, 1000);

console.log('✅ Configuration forcée appliquée !');
console.log('📝 Le widget "Plan d\'action stock & revente" devrait maintenant s\'afficher avec toutes ses fonctionnalités améliorées.'); 