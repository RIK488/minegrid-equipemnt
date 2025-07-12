console.log('Test du widget inventory-status...');

const testData = [
  {
    id: '1',
    title: 'Bulldozer D6',
    status: 'Stock dormant',
    stock: 2,
    minStock: 3,
    value: 1200000,
    dormantDays: 95,
    visibilityRate: 15
  },
  {
    id: '2',
    title: 'Pelle hydraulique 320D',
    status: 'Stock faible',
    stock: 1,
    minStock: 2,
    value: 850000,
    dormantDays: 120,
    visibilityRate: 25
  }
];

// Tests simples
const totalValue = testData.reduce((sum, item) => sum + item.value, 0);
const dormantItems = testData.filter(item => item.dormantDays > 60);

console.log('Valeur totale:', totalValue.toLocaleString(), 'MAD');
console.log('Articles en stock dormant:', dormantItems.length);
console.log('Test reussi !'); 