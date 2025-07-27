// Script pour corriger l'étape 3 du DashboardConfigurator
console.log('🔧 CORRECTION ÉTAPE 3 - Chargement des widgets du métier sélectionné');

// 1. Vérifier l'état actuel
console.log('📊 ÉTAT ACTUEL:');
const currentMetier = localStorage.getItem('selectedMetier');
const currentWidgets = localStorage.getItem('selectedWidgets');

console.log('   Métier sélectionné:', currentMetier);
console.log('   Widgets sélectionnés:', currentWidgets);

// 2. Configuration des métiers (copiée du DashboardConfigurator)
const metiers = [
  {
    id: 'vendeur',
    name: "Vendeur d'engins",
    widgets: [
      { id: 'sales-metrics', title: 'Score de Performance Commerciale' },
      { id: 'inventory-status', title: "Plan d'action stock & revente" },
      { id: 'sales-evolution', title: 'Évolution des ventes' },
      { id: 'leads-pipeline', title: 'Pipeline commercial' },
      { id: 'daily-actions', title: 'Actions Commerciales Prioritaires' }
    ]
  },
  {
    id: 'loueur',
    name: "Loueur d'engins",
    widgets: [
      { id: 'rental-revenue', title: 'Revenus de location' },
      { id: 'equipment-availability', title: 'Disponibilité Équipements' },
      { id: 'upcoming-rentals', title: 'Locations à venir' },
      { id: 'rental-pipeline', title: 'Pipeline de location' },
      { id: 'daily-actions', title: 'Actions prioritaires du jour' }
    ]
  },
  {
    id: 'mecanicien',
    name: 'Mécanicien / Atelier',
    widgets: [
      { id: 'planning', title: 'Planning interventions' },
      { id: 'diagnostic', title: 'Diagnostic IA' }
    ]
  },
  {
    id: 'transporteur',
    name: 'Transporteur / Logistique',
    widgets: [
      { id: 'simulator', title: 'Simulateur coûts' },
      { id: 'gps', title: 'Suivi GPS' }
    ]
  },
  {
    id: 'transitaire',
    name: 'Transitaire / Freight Forwarder',
    widgets: [
      { id: 'customs', title: 'Gestion douane' },
      { id: 'containers', title: 'Suivi conteneurs' }
    ]
  },
  {
    id: 'logisticien',
    name: 'Logisticien / Supply Chain',
    widgets: [
      { id: 'stock-planning', title: 'Planification stock' },
      { id: 'analytics', title: 'Analytics logistiques' }
    ]
  },
  {
    id: 'multiservices',
    name: 'Prestataire multiservices',
    widgets: [
      { id: 'catalog', title: 'Catalogue services' },
      { id: 'orders', title: 'Système commandes' }
    ]
  },
  {
    id: 'financier',
    name: 'Financier / Investisseur',
    widgets: [
      { id: 'portfolio', title: 'Portfolio investissements' },
      { id: 'roi', title: 'Calcul ROI' }
    ]
  }
];

// 3. Fonction pour forcer le chargement des widgets du métier
function forceMetierWidgets(metierId) {
  const metier = metiers.find(m => m.id === metierId);
  if (!metier) {
    console.log('❌ Métier non trouvé:', metierId);
    return;
  }

  console.log('✅ Métier trouvé:', metier.name);
  console.log('📊 Widgets du métier:');
  metier.widgets.forEach((widget, index) => {
    console.log(`   ${index + 1}. ${widget.title} (${widget.id})`);
  });

  // Forcer la sélection de tous les widgets du métier
  const allWidgetIds = metier.widgets.map(w => w.id);
  
  // Sauvegarder dans localStorage
  localStorage.setItem('selectedMetier', metierId);
  localStorage.setItem('selectedWidgets', JSON.stringify(allWidgetIds));
  
  console.log('💾 Configuration sauvegardée:');
  console.log('   Métier:', metierId);
  console.log('   Widgets forcés:', allWidgetIds.length);
  
  return allWidgetIds;
}

// 4. Corriger l'état actuel
if (currentMetier) {
  console.log('🔧 Correction de l\'état actuel...');
  const forcedWidgets = forceMetierWidgets(currentMetier);
  
  if (forcedWidgets) {
    console.log('✅ Correction appliquée !');
    console.log('🔄 Rechargez la page et allez à l\'étape 3 pour voir tous les widgets du métier.');
  }
} else {
  console.log('⚠️ Aucun métier sélectionné. Sélectionnez d\'abord un métier à l\'étape 1.');
}

// 5. Fonction pour tester un métier spécifique
function testMetier(metierId) {
  console.log(`🧪 Test du métier: ${metierId}`);
  const forcedWidgets = forceMetierWidgets(metierId);
  
  if (forcedWidgets) {
    console.log('✅ Test réussi !');
    console.log('📋 Widgets forcés:', forcedWidgets);
  }
}

// 6. Exposer les fonctions pour test manuel
window.forceMetierWidgets = forceMetierWidgets;
window.testMetier = testMetier;

console.log('🎯 FONCTIONS DISPONIBLES:');
console.log('   forceMetierWidgets("loueur") - Forcer les widgets Loueur');
console.log('   forceMetierWidgets("vendeur") - Forcer les widgets Vendeur');
console.log('   testMetier("loueur") - Tester le métier Loueur'); 