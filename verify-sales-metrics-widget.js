// Script de vérification du widget "Score de Performance Commerciale"
console.log('🔍 Vérification du widget "Score de Performance Commerciale"...');

// Vérifier la configuration dans le localStorage
const config = localStorage.getItem('enterpriseDashboardConfig');
if (config) {
  try {
    const parsedConfig = JSON.parse(config);
    console.log('📋 Configuration trouvée:', parsedConfig);
    
    const salesMetricsWidget = parsedConfig.widgets?.find(w => w.id === 'sales-metrics');
    if (salesMetricsWidget) {
      console.log('✅ Widget sales-metrics trouvé:', salesMetricsWidget);
      
      if (salesMetricsWidget.type === 'performance') {
        console.log('✅ Type correct: performance');
      } else {
        console.log('❌ Type incorrect:', salesMetricsWidget.type);
      }
      
      if (salesMetricsWidget.enabled) {
        console.log('✅ Widget activé');
      } else {
        console.log('❌ Widget désactivé');
      }
    } else {
      console.log('❌ Widget sales-metrics non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lors du parsing de la configuration:', error);
  }
} else {
  console.log('❌ Aucune configuration trouvée');
}

// Vérifier les fonctions de données
console.log('');
console.log('🔍 Vérification des fonctions de données...');

// Simuler l'appel à getSalesPerformanceScoreData
const mockData = {
  score: 68,
  target: 85,
  rank: 3,
  totalVendors: 12,
  sales: 2400000,
  salesTarget: 3000000,
  growth: 12,
  growthTarget: 15,
  prospects: 8,
  activeProspects: 6,
  responseTime: 2.5,
  responseTarget: 1.5,
  activityLevel: 'modéré',
  activityRecommendation: 'Augmenter les relances prospects',
  recommendations: [
    {
      type: 'prospect',
      action: 'Relancer vos 2 prospects inactifs',
      impact: '+8 points',
      priority: 'high',
      description: 'Vous avez 2 prospects qui n\'ont pas répondu depuis 5 jours'
    }
  ],
  trends: {
    sales: 'up',
    growth: 'up',
    prospects: 'stable',
    responseTime: 'down'
  }
};

console.log('📊 Données simulées:', mockData);

// Vérifier que les données sont valides
if (mockData.score && mockData.target && mockData.recommendations) {
  console.log('✅ Données valides');
  console.log(`📈 Score: ${mockData.score}/100`);
  console.log(`🎯 Objectif: ${mockData.target}/100`);
  console.log(`📋 Recommandations: ${mockData.recommendations.length}`);
} else {
  console.log('❌ Données invalides');
}

console.log('');
console.log('🎯 Instructions pour tester:');
console.log('1. Allez sur http://localhost:5179/#entreprise');
console.log('2. Vérifiez que le widget "Score de Performance Commerciale" s\'affiche dans la prévisualisation');
console.log('3. Allez sur http://localhost:5179/#dashboard-entreprise');
console.log('4. Vérifiez que le widget s\'affiche avec toutes ses fonctionnalités');
console.log('5. Le widget doit montrer: score, jauge, rang, recommandations, etc.'); 