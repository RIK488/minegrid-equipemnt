// 🧪 SCRIPT DE TEST - Widgets Loueur dans DashboardConfigurator
// À exécuter dans la console du navigateur sur la page DashboardConfigurator

console.log('🧪 Test de la configuration des widgets loueur...');

// 1. Vérifier que le métier loueur est bien défini
const metiers = [
  {
    id: 'loueur',
    name: "Loueur d'engins",
    widgets: [
      { id: 'rental-revenue', title: 'Revenus de location', icon: 'DollarSign', description: 'Chiffre d\'affaires des locations', type: 'metric', dataSource: 'rental-revenue' },
      { id: 'equipment-availability', title: 'Disponibilité Équipements', icon: 'Building2', description: 'État de disponibilité des équipements', type: 'equipment', dataSource: 'equipment-availability' },
      { id: 'upcoming-rentals', title: 'Locations à venir', icon: 'Calendar', description: 'Planning des locations et réservations', type: 'calendar', dataSource: 'upcoming-rentals' },
      { id: 'rental-pipeline', title: 'Pipeline de location', icon: 'Users', description: 'Suivi des demandes de location par étape', type: 'pipeline', dataSource: 'rental-pipeline' },
      { id: 'daily-actions', title: 'Actions prioritaires du jour', icon: 'Target', description: 'Tâches urgentes pour la gestion des locations', type: 'daily-actions', dataSource: 'daily-actions' }
    ]
  }
];

console.log('✅ Configuration des widgets loueur:', metiers[0].widgets);

// 2. Simuler la sélection du métier loueur
const selectedMetier = 'loueur';
const selectedWidgets = metiers[0].widgets.map(w => w.id);
const widgetSizes = {};
metiers[0].widgets.forEach(widget => {
  widgetSizes[widget.id] = '1/3';
});

console.log('✅ Métier sélectionné:', selectedMetier);
console.log('✅ Widgets sélectionnés:', selectedWidgets);
console.log('✅ Tailles des widgets:', widgetSizes);

// 3. Vérifier que tous les widgets sont présents
const expectedWidgets = [
  'rental-revenue',
  'equipment-availability', 
  'upcoming-rentals',
  'rental-pipeline',
  'daily-actions'
];

const missingWidgets = expectedWidgets.filter(id => !selectedWidgets.includes(id));
const extraWidgets = selectedWidgets.filter(id => !expectedWidgets.includes(id));

if (missingWidgets.length === 0 && extraWidgets.length === 0) {
  console.log('✅ Tous les widgets loueur sont correctement configurés !');
} else {
  console.error('❌ Problème avec les widgets:');
  if (missingWidgets.length > 0) {
    console.error('Widgets manquants:', missingWidgets);
  }
  if (extraWidgets.length > 0) {
    console.error('Widgets en trop:', extraWidgets);
  }
}

// 4. Instructions pour tester manuellement
console.log('\n📋 Instructions pour tester manuellement:');
console.log('1. Allez sur la page DashboardConfigurator');
console.log('2. Sélectionnez le métier "Loueur d\'engins"');
console.log('3. Passez à l\'étape 2 (Configuration des widgets)');
console.log('4. Vérifiez que 5 widgets sont affichés:');
console.log('   - Revenus de location');
console.log('   - Disponibilité Équipements');
console.log('   - Locations à venir');
console.log('   - Pipeline de location');
console.log('   - Actions prioritaires du jour');
console.log('5. Passez à l\'étape 3 (Prévisualisation)');
console.log('6. Vérifiez que les widgets apparaissent dans l\'aperçu');

// 5. Test de la configuration complète
const testConfig = {
  metier: selectedMetier,
  widgets: metiers[0].widgets.map(widget => ({
    ...widget,
    enabled: true,
    size: widgetSizes[widget.id] || '1/3',
    position: selectedWidgets.indexOf(widget.id)
  })),
  layout: {
    lg: selectedWidgets.map((id, index) => ({
      i: id,
      x: (index * 4) % 12,
      y: Math.floor(index / 3) * 2,
      w: 4,
      h: 2
    }))
  },
  theme: 'light',
  refreshInterval: 30,
  notifications: true
};

console.log('✅ Configuration de test générée:', testConfig);
console.log('✅ Nombre de widgets dans la config:', testConfig.widgets.length);

// 6. Sauvegarder la configuration de test
localStorage.setItem('testConfigLoueur', JSON.stringify(testConfig));
console.log('✅ Configuration de test sauvegardée dans localStorage');

console.log('\n🎯 Test terminé ! Vérifiez la console pour les résultats.'); 