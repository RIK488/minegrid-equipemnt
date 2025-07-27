// Test du nouveau composant EnterpriseDashboardLoueurDisplay
console.log('🧪 Test du composant EnterpriseDashboardLoueurDisplay');

// 1. Vérifier que la configuration loueur existe
const loueurConfig = localStorage.getItem('enterpriseDashboardConfig_loueur');
console.log('📋 Configuration loueur existante:', loueurConfig ? 'OUI' : 'NON');

if (loueurConfig) {
  const parsed = JSON.parse(loueurConfig);
  console.log('📋 Widgets configurés:', parsed.widgets?.map(w => w.id));
  console.log('📋 Métier:', parsed.metier);
}

// 2. Créer une configuration de test pour loueur
const testConfig = {
  metier: 'loueur',
  widgets: [
    {
      id: 'rental-revenue',
      type: 'metric',
      title: 'Revenus de location',
      enabled: true,
      position: 0,
      size: '1/3'
    },
    {
      id: 'equipment-availability',
      type: 'equipment',
      title: 'Disponibilité Équipements',
      enabled: true,
      position: 1,
      size: '1/3'
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      enabled: true,
      position: 2,
      size: '1/3'
    },
    {
      id: 'rental-pipeline',
      type: 'pipeline',
      title: 'Pipeline de location',
      enabled: true,
      position: 3,
      size: '1/3'
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions prioritaires du jour',
      enabled: true,
      position: 4,
      size: '1/3'
    }
  ],
  layout: {
    lg: [
      { i: 'rental-revenue', x: 0, y: 0, w: 4, h: 4 },
      { i: 'equipment-availability', x: 4, y: 0, w: 4, h: 4 },
      { i: 'upcoming-rentals', x: 8, y: 0, w: 4, h: 4 },
      { i: 'rental-pipeline', x: 0, y: 4, w: 6, h: 4 },
      { i: 'daily-actions', x: 6, y: 4, w: 6, h: 4 }
    ]
  },
  widgetSizes: {
    'rental-revenue': '1/3',
    'equipment-availability': '1/3',
    'upcoming-rentals': '1/3',
    'rental-pipeline': '1/2',
    'daily-actions': '1/2'
  },
  theme: 'light',
  refreshInterval: 30,
  notifications: true,
  createdAt: new Date().toISOString()
};

// 3. Sauvegarder la configuration de test
localStorage.setItem('enterpriseDashboardConfig_loueur', JSON.stringify(testConfig));
console.log('💾 Configuration de test sauvegardée');

// 4. Rediriger vers le dashboard loueur
console.log('🔄 Redirection vers le dashboard loueur...');
window.location.hash = '#dashboard-loueur-display';

console.log('✅ Test terminé - Vérifiez que les widgets loueur s\'affichent correctement'); 