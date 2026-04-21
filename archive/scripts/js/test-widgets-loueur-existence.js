// Script pour tester l'existence des widgets Loueur
console.log('🔍 TEST D\'EXISTENCE DES WIDGETS LOUEUR');

// 1. Vérifier les fichiers de widgets
console.log('📁 Vérification des fichiers de widgets...');

// 2. Vérifier la configuration dans DashboardConfigurator
console.log('🎯 Vérification de la configuration DashboardConfigurator...');

// Configuration attendue pour le métier Loueur
const expectedLoueurWidgets = [
  { id: 'rental-revenue', title: 'Revenus de location' },
  { id: 'equipment-availability', title: 'Disponibilité Équipements' },
  { id: 'upcoming-rentals', title: 'Locations à venir' },
  { id: 'rental-pipeline', title: 'Pipeline de location' },
  { id: 'daily-actions', title: 'Actions prioritaires du jour' }
];

console.log('✅ Widgets attendus pour le métier Loueur:');
expectedLoueurWidgets.forEach((widget, index) => {
  console.log(`   ${index + 1}. ${widget.title} (${widget.id})`);
});

// 3. Vérifier le localStorage actuel
console.log('💾 Vérification du localStorage actuel...');
const allKeys = Object.keys(localStorage);
const dashboardKeys = allKeys.filter(key => 
  key.includes('dashboard') || 
  key.includes('widget') || 
  key.includes('config') || 
  key.includes('enterprise') ||
  key.includes('vendeur') ||
  key.includes('metier') ||
  key.includes('selected')
);

console.log('🔍 Clés localStorage trouvées:');
dashboardKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`   ${key}: ${value ? '✅ Présent' : '❌ Absent'}`);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (parsed.metier) {
        console.log(`      Métier: ${parsed.metier}`);
      }
      if (parsed.widgets) {
        console.log(`      Widgets: ${parsed.widgets.length}`);
      }
    } catch (e) {
      console.log(`      Erreur parsing: ${e.message}`);
    }
  }
});

// 4. Vérifier la configuration actuelle
console.log('🎯 Vérification de la configuration actuelle...');
const currentConfig = localStorage.getItem('enterpriseDashboardConfig');
if (currentConfig) {
  try {
    const parsed = JSON.parse(currentConfig);
    console.log('✅ Configuration trouvée:');
    console.log(`   Métier: ${parsed.metier}`);
    console.log(`   Widgets: ${parsed.widgets?.length || 0}`);
    if (parsed.widgets) {
      console.log('   Détail des widgets:');
      parsed.widgets.forEach((widget, index) => {
        console.log(`     ${index + 1}. ${widget.title} (${widget.id})`);
      });
    }
  } catch (e) {
    console.log('❌ Erreur parsing configuration:', e.message);
  }
} else {
  console.log('❌ Aucune configuration trouvée');
}

// 5. Vérifier la configuration spécifique au métier
console.log('🎯 Vérification de la configuration spécifique au métier...');
const loueurConfig = localStorage.getItem('enterpriseDashboardConfig_loueur');
if (loueurConfig) {
  try {
    const parsed = JSON.parse(loueurConfig);
    console.log('✅ Configuration Loueur trouvée:');
    console.log(`   Métier: ${parsed.metier}`);
    console.log(`   Widgets: ${parsed.widgets?.length || 0}`);
  } catch (e) {
    console.log('❌ Erreur parsing configuration Loueur:', e.message);
  }
} else {
  console.log('❌ Aucune configuration Loueur trouvée');
}

// 6. Vérifier le métier sélectionné
console.log('🎯 Vérification du métier sélectionné...');
const selectedMetier = localStorage.getItem('selectedMetier');
console.log(`   Métier sélectionné: ${selectedMetier || 'Aucun'}`);

// 7. Résumé
console.log('📊 RÉSUMÉ DU TEST:');
console.log(`   Configuration générale: ${currentConfig ? '✅' : '❌'}`);
console.log(`   Configuration Loueur: ${loueurConfig ? '✅' : '❌'}`);
console.log(`   Métier sélectionné: ${selectedMetier === 'loueur' ? '✅ Loueur' : '❌ ' + (selectedMetier || 'Aucun')}`);

if (currentConfig && selectedMetier === 'loueur') {
  console.log('🎉 Les widgets Loueur devraient s\'afficher !');
} else {
  console.log('⚠️ Les widgets Loueur ne s\'afficheront pas. Utilisez le script de forçage.');
} 