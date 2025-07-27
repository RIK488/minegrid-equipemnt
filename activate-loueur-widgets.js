// 🚀 SCRIPT D'ACTIVATION - Widgets Loueur d'Engins
// À exécuter dans la console du navigateur sur la page dashboard entreprise

console.log('🚀 Activation des widgets Loueur d\'engins...');

// Configuration des widgets pour le métier loueur (version réduite - 5 widgets)
const loueurConfig = {
  metier: 'loueur',
  widgets: [
    {
      id: 'rental-revenue',
      type: 'metric',
      title: 'Revenus de location',
      description: 'Chiffre d\'affaires des locations',
      enabled: true,
      position: 0,
      dataSource: 'rental-revenue'
    },
    {
      id: 'equipment-availability',
      type: 'equipment',
      title: 'Disponibilité Équipements',
      description: 'État de disponibilité des équipements',
      enabled: true,
      position: 1,
      dataSource: 'equipment-availability'
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      description: 'Planning des locations et réservations',
      enabled: true,
      position: 2,
      dataSource: 'upcoming-rentals'
    },
    {
      id: 'rental-pipeline',
      type: 'pipeline',
      title: 'Pipeline de location',
      description: 'Suivi des demandes de location par étape',
      enabled: true,
      position: 3,
      dataSource: 'rental-pipeline'
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions prioritaires du jour',
      description: 'Tâches urgentes pour la gestion des locations',
      enabled: true,
      position: 4,
      dataSource: 'daily-actions'
    }
  ],
  layout: {
    lg: [
      { i: 'rental-revenue', x: 0, y: 0, w: 4, h: 2 },
      { i: 'equipment-availability', x: 4, y: 0, w: 4, h: 2 },
      { i: 'upcoming-rentals', x: 8, y: 0, w: 4, h: 2 },
      { i: 'rental-pipeline', x: 0, y: 2, w: 6, h: 3 },
      { i: 'daily-actions', x: 6, y: 2, w: 6, h: 3 }
    ]
  }
};

// Sauvegarder la configuration dans localStorage
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(loueurConfig));

console.log('✅ Configuration des widgets loueur sauvegardée !');
console.log('📊 Widgets configurés:', loueurConfig.dashboardConfig.widgets.length);
console.log('🔄 Rechargez la page (F5) pour voir les widgets loueur');

// Afficher un message de confirmation
alert('🎯 Widgets Loueur d\'engins activés !\n\nRechargez la page (F5) pour voir les nouveaux widgets.');

// Optionnel : recharger automatiquement la page après 2 secondes
setTimeout(() => {
  if (confirm('Voulez-vous recharger la page maintenant pour voir les widgets ?')) {
    window.location.reload();
  }
}, 2000); 