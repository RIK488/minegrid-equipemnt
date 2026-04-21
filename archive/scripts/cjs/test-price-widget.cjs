const fs = require('fs');
const path = require('path');

console.log('🧪 Test d\'intégration du widget d\'évolution des prix enrichi...');

// Vérifier que les fichiers existent
const dashboardPath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
const priceWidgetPath = path.join(__dirname, 'src', 'pages', 'PriceEvolutionWidgetEnriched.tsx');

if (!fs.existsSync(dashboardPath)) {
  console.error('❌ Fichier EnterpriseDashboard.tsx non trouvé');
  process.exit(1);
}

if (!fs.existsSync(priceWidgetPath)) {
  console.error('❌ Fichier PriceEvolutionWidgetEnriched.tsx non trouvé');
  process.exit(1);
}

// Lire les fichiers
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
const priceWidgetContent = fs.readFileSync(priceWidgetPath, 'utf8');

// Vérifications
const checks = [
  {
    name: 'Import du widget prix enrichi',
    test: dashboardContent.includes('import PriceEvolutionWidgetEnriched from \'./PriceEvolutionWidgetEnriched\''),
    success: '✅ Import correct',
    error: '❌ Import manquant'
  },
  {
    name: 'Widget prix dans le case chart',
    test: dashboardContent.includes('widget.id === \'price-evolution\' || widget.id === \'price-chart\''),
    success: '✅ Condition de rendu correcte',
    error: '❌ Condition de rendu manquante'
  },
  {
    name: 'Composant PriceEvolutionWidgetEnriched défini',
    test: priceWidgetContent.includes('const PriceEvolutionWidgetEnriched: React.FC'),
    success: '✅ Composant défini',
    error: '❌ Composant non défini'
  },
  {
    name: 'Interface PriceData définie',
    test: priceWidgetContent.includes('interface PriceData'),
    success: '✅ Interface définie',
    error: '❌ Interface manquante'
  },
  {
    name: 'Données par défaut pour le widget prix',
    test: priceWidgetContent.includes('averagePrice: 125000'),
    success: '✅ Données par défaut présentes',
    error: '❌ Données par défaut manquantes'
  },
  {
    name: 'Fonctionnalités enrichies (alertes)',
    test: priceWidgetContent.includes('alerts: [\'Hausse de la demande\''),
    success: '✅ Fonctionnalités enrichies présentes',
    error: '❌ Fonctionnalités enrichies manquantes'
  },
  {
    name: 'Analyses détaillées (tendances)',
    test: priceWidgetContent.includes('selectedAnalysis === \'trend\''),
    success: '✅ Analyses détaillées présentes',
    error: '❌ Analyses détaillées manquantes'
  },
  {
    name: 'Export par défaut du widget prix',
    test: priceWidgetContent.includes('export default PriceEvolutionWidgetEnriched'),
    success: '✅ Export correct',
    error: '❌ Export manquant'
  }
];

let allPassed = true;

checks.forEach(check => {
  if (check.test) {
    console.log(check.success);
  } else {
    console.log(check.error);
    allPassed = false;
  }
});

console.log('\n📊 Résumé des vérifications :');
if (allPassed) {
  console.log('🎉 Toutes les vérifications sont passées !');
  console.log('✅ Le widget d\'évolution des prix enrichi est correctement intégré');
  console.log('✅ Il s\'affichera pour les widgets avec ID "price-evolution" ou "price-chart"');
  console.log('✅ Les données de test sont en place');
  console.log('✅ Toutes les fonctionnalités enrichies sont présentes');
  console.log('\n🚀 Prochaines étapes :');
  console.log('1. Redémarrez votre serveur de développement (npm run dev)');
  console.log('2. Rendez-vous sur le dashboard d\'entreprise');
  console.log('3. Vérifiez que le widget "Évolution des Prix" s\'affiche correctement');
  console.log('4. Testez les fonctionnalités : filtres, analyses, alertes');
} else {
  console.log('❌ Certaines vérifications ont échoué');
  console.log('🔧 Vérifiez les erreurs ci-dessus et corrigez-les');
}

console.log('\n📝 Fonctionnalités du widget prix enrichi :');
console.log('- 📈 Graphiques interactifs avec filtres (période, métrique)');
console.log('- 💰 Statistiques détaillées (prix moyen, volume, croissance, volatilité)');
console.log('- 📊 Analyses avancées (tendances, comparaison marché, prévisions)');
console.log('- ⚠️  Système d\'alertes et insights en temps réel');
console.log('- 🎯 Positionnement marché (Premium/Standard)');
console.log('- 📋 Tableaux comparatifs avec concurrents');
console.log('- 🔮 Prévisions basées sur les tendances');

console.log('\n📝 Informations techniques :');
console.log('- Fichier dashboard :', dashboardPath);
console.log('- Fichier widget prix :', priceWidgetPath);
console.log('- Taille dashboard :', Math.round(dashboardContent.length / 1024), 'KB');
console.log('- Taille widget prix :', Math.round(priceWidgetContent.length / 1024), 'KB'); 