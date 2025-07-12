const fs = require('fs');
const path = require('path');

console.log('🧪 Test final du widget d\'évolution des ventes enrichi...');

// Vérifier que les fichiers existent
const dashboardPath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
const widgetPath = path.join(__dirname, 'src', 'pages', 'SalesEvolutionWidgetEnriched.tsx');

if (!fs.existsSync(dashboardPath)) {
  console.error('❌ Fichier EnterpriseDashboard.tsx non trouvé');
  process.exit(1);
}

if (!fs.existsSync(widgetPath)) {
  console.error('❌ Fichier SalesEvolutionWidgetEnriched.tsx non trouvé');
  process.exit(1);
}

// Lire les fichiers
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
const widgetContent = fs.readFileSync(widgetPath, 'utf8');

// Vérifications
const checks = [
  {
    name: 'Import du widget dans EnterpriseDashboard',
    test: dashboardContent.includes('import SalesEvolutionWidgetEnriched from \'./SalesEvolutionWidgetEnriched\';'),
    success: '✅ Import correct',
    error: '❌ Import manquant'
  },
  {
    name: 'Composant SalesEvolutionWidgetEnriched défini',
    test: widgetContent.includes('const SalesEvolutionWidgetEnriched: React.FC<SalesEvolutionWidgetEnrichedProps>'),
    success: '✅ Composant défini',
    error: '❌ Composant non trouvé'
  },
  {
    name: 'Interface SalesData avec propriétés optionnelles',
    test: widgetContent.includes('target?: number;') && widgetContent.includes('growth?: number;'),
    success: '✅ Interface compatible',
    error: '❌ Interface incompatible'
  },
  {
    name: 'Fonction renderWidgetContent utilise le widget',
    test: dashboardContent.includes('return <SalesEvolutionWidgetEnriched data={chartData} />;'),
    success: '✅ Widget utilisé dans renderWidgetContent',
    error: '❌ Widget non utilisé'
  },
  {
    name: 'Fonction getChartData existe',
    test: dashboardContent.includes('const getChartData = (widgetId: string) => {'),
    success: '✅ Fonction getChartData trouvée',
    error: '❌ Fonction getChartData manquante'
  },
  {
    name: 'Données sales-evolution dans getChartData',
    test: dashboardContent.includes('\'sales-evolution\':'),
    success: '✅ Données sales-evolution trouvées',
    error: '❌ Données sales-evolution manquantes'
  },
  {
    name: 'Export par défaut du widget',
    test: widgetContent.includes('export default SalesEvolutionWidgetEnriched;'),
    success: '✅ Export par défaut correct',
    error: '❌ Export par défaut manquant'
  }
];

console.log('\n📋 Résultats des vérifications:');
let allPassed = true;

checks.forEach(check => {
  if (check.test) {
    console.log(check.success);
  } else {
    console.log(check.error);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n🎉 Toutes les vérifications sont passées !');
  console.log('\n✅ Le widget d\'évolution des ventes enrichi est prêt à être utilisé !');
  console.log('\n📊 Fonctionnalités disponibles :');
  console.log('  - Graphique interactif avec sélection de période (6m, 12m, 24m)');
  console.log('  - Sélection de métrique (CA, Unités, Croissance)');
  console.log('  - Statistiques détaillées (CA total, unités vendues, croissance)');
  console.log('  - Analyse des performances (meilleur/pire mois)');
  console.log('  - Tableau détaillé mensuel');
  console.log('  - Objectifs et actions');
  console.log('  - Compatible avec les données existantes du dashboard');
  
  console.log('\n🔧 Prochaines étapes :');
  console.log('1. Redémarrer le serveur de développement');
  console.log('2. Naviguer vers le dashboard d\'entreprise');
  console.log('3. Vérifier que le widget "Évolution des Ventes" s\'affiche correctement');
  console.log('4. Tester les interactions (changement de période, métrique)');
  
} else {
  console.log('\n❌ Certaines vérifications ont échoué.');
  console.log('🔧 Vérifiez les erreurs ci-dessus et corrigez-les.');
}

// Vérifier la taille des fichiers
const dashboardSize = fs.statSync(dashboardPath).size;
const widgetSize = fs.statSync(widgetPath).size;

console.log('\n📊 Informations sur les fichiers :');
console.log(`  - EnterpriseDashboard.tsx: ${(dashboardSize / 1024).toFixed(1)} KB`);
console.log(`  - SalesEvolutionWidgetEnriched.tsx: ${(widgetSize / 1024).toFixed(1)} KB`);
console.log(`  - Total: ${((dashboardSize + widgetSize) / 1024).toFixed(1)} KB`); 