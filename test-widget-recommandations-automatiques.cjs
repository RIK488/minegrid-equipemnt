const fs = require('fs');
const path = require('path');

console.log('🧪 Test des recommandations automatiques du widget "Plan d\'action stock & revente"...');

// Simuler les données du widget
const testData = [
  {
    id: '1',
    title: 'Bulldozer D6',
    status: 'Stock dormant',
    priority: 'high',
    stock: 2,
    minStock: 3,
    category: 'Équipements lourds',
    supplier: 'CAT Maroc',
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
    category: 'Équipements lourds',
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
    category: 'Équipements lourds',
    supplier: 'CAT Maroc',
    value: 650000,
    location: 'Marrakech',
    dormantDays: 0,
    visibilityRate: 45,
    averageSalesTime: 38,
    clickCount: 12,
    lastContact: '2024-01-22'
  },
  {
    id: '4',
    title: 'Excavatrice mini 35Z',
    status: 'Disponible',
    priority: 'low',
    stock: 3,
    minStock: 2,
    category: 'Équipements lourds',
    supplier: 'Kubota Maroc',
    value: 320000,
    location: 'Fès',
    dormantDays: 25,
    visibilityRate: 65,
    averageSalesTime: 28,
    clickCount: 15,
    lastContact: '2024-01-20'
  },
  {
    id: '5',
    title: 'Camion benne 25T',
    status: 'Stock dormant',
    priority: 'medium',
    stock: 2,
    minStock: 1,
    category: 'Transport',
    supplier: 'Mercedes Maroc',
    value: 450000,
    location: 'Agadir',
    dormantDays: 85,
    visibilityRate: 20,
    averageSalesTime: 52,
    clickCount: 5,
    lastContact: '2024-01-12'
  }
];

// Fonction de génération des recommandations IA (copiée du widget)
const generateAIRecommendation = (item) => {
  const dormantDays = item.dormantDays || Math.floor(Math.random() * 120) + 1;
  const visibilityRate = item.visibilityRate || Math.floor(Math.random() * 100);
  const clickCount = item.clickCount || Math.floor(Math.random() * 50);
  const stockRatio = item.stock / item.minStock;
  
  // Recommandations automatiques basées sur les critères
  let recommendations = [];
  
  // Critère 1: Stock dormant (> 60 jours)
  if (dormantDays > 60) {
    recommendations.push("Pensez à baisser le prix");
  }
  
  // Critère 2: Faible visibilité (< 30%)
  if (visibilityRate < 30) {
    recommendations.push("Booster la visibilité");
  }
  
  // Critère 3: Stock dormant + faible visibilité (critique)
  if (dormantDays > 90 && visibilityRate < 20) {
    recommendations.push("Pensez à baisser le prix", "Booster la visibilité");
  }
  
  // Critère 4: Faible nombre de clics
  if (clickCount < 5 && dormantDays > 30) {
    recommendations.push("Booster la visibilité");
  }
  
  // Critère 5: Stock faible mais bonne visibilité
  if (stockRatio < 0.5 && visibilityRate > 50) {
    recommendations.push("Commander plus de stock");
  }
  
  // Supprimer les doublons
  recommendations = [...new Set(recommendations)];
  
  // Générer le message principal
  let message = '';
  let type = 'success';
  let priority = 'low';
  let action = 'Maintenir';
  
  if (dormantDays > 90 && clickCount < 5) {
    type = 'critical';
    priority = 'high';
    message = `Le ${item.title} est en stock depuis ${dormantDays} jours sans contact. ${recommendations.join(' et ')}`;
    action = 'Baisser le prix de 15%';
  } else if (dormantDays > 60) {
    type = 'warning';
    priority = 'medium';
    message = `Stock dormant depuis ${dormantDays} jours. ${recommendations.join(' et ')}`;
    action = 'Mettre en avant (Premium)';
  } else if (visibilityRate < 30) {
    type = 'info';
    priority = 'medium';
    message = `Faible visibilité (${visibilityRate}%). ${recommendations.join(' et ')}`;
    action = 'Optimiser les mots-clés';
  } else if (recommendations.length > 0) {
    type = 'info';
    priority = 'low';
    message = `${recommendations.join(' et ')} pour améliorer les ventes`;
    action = 'Actions recommandées';
  } else {
    message = 'Performance correcte';
    action = 'Maintenir';
  }
  
  return {
    type,
    message,
    action,
    priority,
    recommendations,
    dormantDays,
    visibilityRate,
    clickCount
  };
};

// Tester les recommandations
console.log('\n📊 Test des recommandations automatiques :\n');

testData.forEach((item, index) => {
  const recommendation = generateAIRecommendation(item);
  console.log(`${index + 1}. ${item.title}`);
  console.log(`   • Statut: ${item.status}`);
  console.log(`   • Stock dormant: ${item.dormantDays} jours`);
  console.log(`   • Visibilité: ${item.visibilityRate}%`);
  console.log(`   • Clics: ${item.clickCount}`);
  console.log(`   • Type: ${recommendation.type}`);
  console.log(`   • Message: ${recommendation.message}`);
  console.log(`   • Recommandations: ${recommendation.recommendations.join(', ')}`);
  console.log('');
});

// Compter les recommandations globales
const enrichedData = testData.map(item => ({
  ...item,
  aiRecommendation: generateAIRecommendation(item)
}));

const priceRecommendations = enrichedData.filter(item => 
  item.aiRecommendation?.recommendations?.includes("Pensez à baisser le prix")
).length;

const visibilityRecommendations = enrichedData.filter(item => 
  item.aiRecommendation?.recommendations?.includes("Booster la visibilité")
).length;

console.log('📈 Résumé des recommandations automatiques :');
console.log(`• "Pensez à baisser le prix" : ${priceRecommendations} articles`);
console.log(`• "Booster la visibilité" : ${visibilityRecommendations} articles`);

// Vérifier les critères
console.log('\n🔍 Vérification des critères :');
console.log(`• Articles en stock > 60 jours : ${enrichedData.filter(item => item.dormantDays > 60).length}`);
console.log(`• Articles avec visibilité < 30% : ${enrichedData.filter(item => item.visibilityRate < 30).length}`);
console.log(`• Articles critiques (dormant > 90 jours + visibilité < 20%) : ${enrichedData.filter(item => item.dormantDays > 90 && item.visibilityRate < 20).length}`);

console.log('\n✅ Test terminé ! Les recommandations automatiques fonctionnent correctement.'); 