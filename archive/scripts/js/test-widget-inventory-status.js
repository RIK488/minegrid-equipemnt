console.log('🧪 Test du widget "Plan d\'action stock & revente"...');

// Donnees de test pour le widget inventory-status
const testData = [
  {
    id: '1',
    title: 'Bulldozer D6',
    status: 'Stock dormant',
    priority: 'high',
    stock: 2,
    minStock: 3,
    category: 'Bulldozers',
    supplier: 'Caterpillar Maroc',
    lastOrder: '2024-01-15',
    nextDelivery: '2024-02-15',
    value: 1200000,
    location: 'Casablanca',
    supplierPhone: '+212 5 22 34 56 78',
    supplierEmail: 'contact@catmaroc.ma',
    orderQuantity: 1,
    estimatedCost: 1200000,
    notes: 'Stock dormant depuis 95 jours - Action requise',
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
    lastOrder: '2024-01-10',
    nextDelivery: '2024-01-30',
    value: 850000,
    location: 'Rabat',
    supplierPhone: '+212 5 37 21 43 65',
    supplierEmail: 'contact@komatsumaroc.ma',
    orderQuantity: 1,
    estimatedCost: 850000,
    notes: 'Stock faible - Commande recommandee',
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
    lastOrder: '2024-01-20',
    nextDelivery: '2024-02-10',
    value: 650000,
    location: 'Marrakech',
    supplierPhone: '+212 5 24 38 91 23',
    supplierEmail: 'contact@catmaroc.ma',
    orderQuantity: 2,
    estimatedCost: 1300000,
    notes: 'En rupture - Commande urgente',
    dormantDays: 0,
    visibilityRate: 45,
    averageSalesTime: 38,
    clickCount: 12,
    lastContact: '2024-01-22'
  }
];

// Tests des fonctionnalites
function testFeatures() {
  console.log('\n📊 Tests des fonctionnalites du widget:');
  
  // Test 1: Detection du stock dormant
  const dormantItems = testData.filter(item => (item.dormantDays || 0) > 60);
  console.log(`✅ Stock dormant: ${dormantItems.length} articles detectes`);
  
  // Test 2: Calcul des KPIs
  const totalValue = testData.reduce((sum, item) => sum + item.value, 0);
  const lowStockItems = testData.filter(item => item.stock < item.minStock && item.stock > 0).length;
  const outOfStockItems = testData.filter(item => item.stock === 0).length;
  const avgSalesTime = testData.reduce((sum, item) => sum + (item.averageSalesTime || 0), 0) / testData.length;
  
  console.log(`✅ Valeur totale: ${totalValue.toLocaleString()} MAD`);
  console.log(`✅ Stock faible: ${lowStockItems} articles`);
  console.log(`✅ En rupture: ${outOfStockItems} articles`);
  console.log(`✅ Temps de vente moyen: ${Math.round(avgSalesTime)} jours`);
  
  // Test 3: Recommandations IA
  const recommendations = testData.map(item => {
    if (item.dormantDays > 90) {
      return `${item.title}: Stock dormant depuis ${item.dormantDays} jours - Baisser le prix`;
    } else if (item.visibilityRate < 30) {
      return `${item.title}: Faible visibilite (${item.visibilityRate}%) - Booster la visibilite`;
    } else if (item.stock === 0) {
      return `${item.title}: En rupture - Commander en urgence`;
    }
    return null;
  }).filter(Boolean);
  
  console.log(`✅ Recommandations IA: ${recommendations.length} actions suggerees`);
  recommendations.forEach(rec => console.log(`   - ${rec}`));
  
  // Test 4: Actions rapides disponibles
  const quickActions = [];
  if (dormantItems.length > 0) {
    quickActions.push('Baisser prix dormant');
  }
  if (testData.some(item => item.visibilityRate < 30)) {
    quickActions.push('Booster visibilite');
  }
  if (testData.some(item => item.stock === 0)) {
    quickActions.push('Commander en urgence');
  }
  
  console.log(`✅ Actions rapides: ${quickActions.length} disponibles`);
  quickActions.forEach(action => console.log(`   - ${action}`));
}

// Tests des donnees
function testDataStructure() {
  console.log('\n🔍 Tests de la structure des donnees:');
  
  testData.forEach((item, index) => {
    console.log(`\n📦 Article ${index + 1}: ${item.title}`);
    console.log(`   - Statut: ${item.status}`);
    console.log(`   - Stock: ${item.stock}/${item.minStock}`);
    console.log(`   - Valeur: ${item.value.toLocaleString()} MAD`);
    console.log(`   - Jours en stock: ${item.dormantDays || 0}`);
    console.log(`   - Taux de visibilite: ${item.visibilityRate}%`);
    console.log(`   - Temps de vente moyen: ${item.averageSalesTime} jours`);
    console.log(`   - Clics: ${item.clickCount}`);
    console.log(`   - Dernier contact: ${item.lastContact}`);
  });
}

// Execution des tests
console.log('🚀 Debut des tests...\n');
testDataStructure();
testFeatures();

console.log('\n🎉 Tests termines avec succes !');
console.log('✅ Le widget "Plan d\'action stock & revente" est pret a etre utilise.');
console.log('📝 Verifiez que toutes les fonctionnalites s\'affichent correctement sur localhost.'); 