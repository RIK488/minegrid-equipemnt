// Script de test pour le widget Actions Commerciales Prioritaires
console.log('=== TEST WIDGET ACTIONS COMMERCIALES PRIORITAIRES ===');

// Simuler la fonction getDailyActionsData
const getDailyActionsData = (widgetId) => {
  const actions = [
    {
      id: 1,
      title: 'Relancer Ahmed Benali - Prospect chaud',
      description: 'A consulté votre CAT 320D 3 fois cette semaine. Prêt à acheter.',
      priority: 'high',
      category: 'prospection',
      impact: '+85%',
      impactDescription: 'Probabilité de conversion',
      estimatedTime: '15 min',
      status: 'pending',
      contact: {
        name: 'Ahmed Benali',
        phone: '+212 6 12 34 56 78',
        email: 'ahmed.benali@construction.ma',
        company: 'Construction Benali SARL',
        lastContact: '2024-01-20'
      },
      action: 'Appel de suivi + envoi devis personnalisé',
      notes: 'Intéressé par financement leasing. Budget 450k MAD.',
      deadline: '2024-01-25'
    },
    {
      id: 2,
      title: 'Finaliser devis CAT 950GC - Mines du Sud',
      description: 'Devis en cours depuis 5 jours. Client impatient.',
      priority: 'high',
      category: 'devis',
      impact: '+70%',
      impactDescription: 'Chance de vente',
      estimatedTime: '30 min',
      status: 'pending',
      contact: {
        name: 'Fatima Zahra',
        phone: '+212 6 98 76 54 32',
        email: 'f.zahra@minesdusud.ma',
        company: 'Mines du Sud SA',
        lastContact: '2024-01-18'
      },
      action: 'Finaliser devis + appel de présentation',
      notes: 'Demande spécifique: godet de 1.2m³, chenilles larges.',
      deadline: '2024-01-23'
    }
  ];

  console.log('[DEBUG] Actions commerciales générées:', actions);
  return actions;
};

// Test de la fonction
console.log('\n1. Test de la fonction getDailyActionsData:');
const testData = getDailyActionsData('daily-actions');
console.log('✅ Données générées:', testData.length, 'actions');
console.log('✅ Structure de la première action:', Object.keys(testData[0]));

// Vérifier la structure attendue
const expectedFields = [
  'id', 'title', 'description', 'priority', 'category', 
  'impact', 'impactDescription', 'estimatedTime', 'status',
  'contact', 'action', 'notes', 'deadline'
];

console.log('\n2. Vérification de la structure:');
const firstAction = testData[0];
const missingFields = expectedFields.filter(field => !(field in firstAction));

if (missingFields.length === 0) {
  console.log('✅ Structure correcte - tous les champs requis sont présents');
} else {
  console.log('❌ Champs manquants:', missingFields);
}

// Vérifier les contacts
console.log('\n3. Vérification des contacts:');
testData.forEach((action, index) => {
  if (action.contact && action.contact.name && action.contact.phone) {
    console.log(`✅ Action ${index + 1}: Contact valide - ${action.contact.name} (${action.contact.phone})`);
  } else {
    console.log(`❌ Action ${index + 1}: Contact invalide ou manquant`);
  }
});

// Vérifier les impacts
console.log('\n4. Vérification des impacts:');
testData.forEach((action, index) => {
  if (action.impact && action.impact.includes('%')) {
    console.log(`✅ Action ${index + 1}: Impact valide - ${action.impact}`);
  } else {
    console.log(`❌ Action ${index + 1}: Impact invalide - ${action.impact}`);
  }
});

console.log('\n=== FIN DU TEST ===');
console.log('\nInstructions pour tester dans le navigateur:');
console.log('1. Ouvrir le dashboard vendeur d\'engins');
console.log('2. Vérifier que le widget "Actions Commerciales Prioritaires" apparaît');
console.log('3. Vérifier que les actions s\'affichent avec contacts et impacts');
console.log('4. Tester les actions rapides (marquer comme fait, reporter)');
console.log('5. Tester les contacts rapides (téléphone, email, WhatsApp)'); 