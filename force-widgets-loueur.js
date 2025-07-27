// Script pour forcer le chargement des widgets Loueur d'engins
console.log('🚀 FORÇAGE DES WIDGETS LOUEUR D\'ENGINS');

// 1. Nettoyer toutes les configurations existantes
console.log('🗑️ Nettoyage des configurations existantes...');
const allKeys = Object.keys(localStorage);
const dashboardKeys = allKeys.filter(key => 
  key.includes('dashboard') || 
  key.includes('widget') || 
  key.includes('config') || 
  key.includes('enterprise') ||
  key.includes('vendeur') ||
  key.includes('metier')
);

dashboardKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('   ✅ Supprimé:', key);
});

// 2. Configuration forcée pour le métier Loueur
const loueurConfig = {
  version: '2.0.0',
  metier: 'loueur',
  dashboardConfig: {
    widgets: [
      {
        id: 'rental-revenue',
        type: 'metric',
        title: 'Revenus de location',
        description: 'Chiffre d\'affaires des locations',
        icon: 'DollarSign',
        dataSource: 'rental-revenue',
        enabled: true,
        isCollapsed: false,
        position: 0
      },
      {
        id: 'equipment-availability',
        type: 'equipment',
        title: 'Disponibilité Équipements',
        description: 'État de disponibilité des équipements',
        icon: 'Building2',
        dataSource: 'equipment-availability',
        enabled: true,
        isCollapsed: false,
        position: 1
      },
      {
        id: 'upcoming-rentals',
        type: 'calendar',
        title: 'Locations à venir',
        description: 'Planning des locations et réservations',
        icon: 'Calendar',
        dataSource: 'upcoming-rentals',
        enabled: true,
        isCollapsed: false,
        position: 2
      },
      {
        id: 'rental-pipeline',
        type: 'pipeline',
        title: 'Pipeline de location',
        description: 'Suivi des demandes de location par étape',
        icon: 'Users',
        dataSource: 'rental-pipeline',
        enabled: true,
        isCollapsed: false,
        position: 3
      },
      {
        id: 'daily-actions',
        type: 'daily-actions',
        title: 'Actions prioritaires du jour',
        description: 'Tâches urgentes pour la gestion des locations',
        icon: 'Target',
        dataSource: 'daily-actions',
        enabled: true,
        isCollapsed: false,
        position: 4
      }
    ],
    theme: 'light',
    layout: 'grid',
    refreshInterval: 30,
    notifications: true
  },
  layout: {
    lg: [
      { i: 'rental-revenue', x: 0, y: 0, w: 3, h: 2 },
      { i: 'equipment-availability', x: 3, y: 0, w: 3, h: 2 },
      { i: 'upcoming-rentals', x: 6, y: 0, w: 6, h: 4 },
      { i: 'rental-pipeline', x: 0, y: 2, w: 6, h: 4 },
      { i: 'daily-actions', x: 6, y: 4, w: 6, h: 2 }
    ]
  },
  createdAt: new Date().toISOString(),
  forceInjection: true
};

// 3. Sauvegarder la configuration
console.log('💾 Sauvegarde de la configuration Loueur...');
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(loueurConfig));
localStorage.setItem('enterpriseDashboardConfig_loueur', JSON.stringify(loueurConfig));
localStorage.setItem('selectedMetier', 'loueur');
localStorage.setItem('enterpriseDashboardConfigured', 'true');

console.log('✅ Configuration Loueur sauvegardée avec succès !');
console.log('📊 Widgets configurés:', loueurConfig.dashboardConfig.widgets.length);

// 4. Afficher les détails
console.log('🎯 Détails de la configuration:');
loueurConfig.dashboardConfig.widgets.forEach((widget, index) => {
  console.log(`   ${index + 1}. ${widget.title} (${widget.id})`);
});

console.log('🔄 Rechargez la page pour voir les widgets Loueur !');
console.log('🌐 URL: http://localhost:5176/#entreprise'); 