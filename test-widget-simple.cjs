const fs = require('fs');
const path = require('path');

console.log('🧪 Test simple du widget d\'évolution des ventes...');

// Vérifier que le fichier existe
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
if (!fs.existsSync(filePath)) {
  console.error('❌ Fichier EnterpriseDashboard.tsx non trouvé');
  process.exit(1);
}

// Lire le fichier
const content = fs.readFileSync(filePath, 'utf8');

// Vérifications
const checks = [
  {
    name: 'Composant SalesEvolutionWidgetEnriched défini',
    test: content.includes('const SalesEvolutionWidgetEnriched = ({ data = [] }: { data?: any[] }) => {'),
    success: '✅ Composant défini',
    error: '❌ Composant non trouvé'
  },
  {
    name: 'Fonction renderWidgetContent existe',
    test: content.includes('const renderWidgetContent = (widget: any) => {'),
    success: '✅ Fonction renderWidgetContent trouvée',
    error: '❌ Fonction renderWidgetContent non trouvée'
  },
  {
    name: 'Case chart utilise SalesEvolutionWidgetEnriched',
    test: content.includes('case \'chart\':') && content.includes('SalesEvolutionWidgetEnriched'),
    success: '✅ Case chart utilise le widget enrichi',
    error: '❌ Case chart n\'utilise pas le widget enrichi'
  },
  {
    name: 'Fonction getChartData existe',
    test: content.includes('const getChartData = (widgetId: string) => {'),
    success: '✅ Fonction getChartData trouvée',
    error: '❌ Fonction getChartData non trouvée'
  },
  {
    name: 'Données sales-evolution dans getChartData',
    test: content.includes('\'sales-evolution\':'),
    success: '✅ Données sales-evolution trouvées',
    error: '❌ Données sales-evolution non trouvées'
  },
  {
    name: 'Return statement du composant',
    test: content.includes('return (') && content.includes('Évolution des Ventes'),
    success: '✅ Return statement trouvé',
    error: '❌ Return statement non trouvé'
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
  console.log('\n🎉 Toutes les vérifications sont passées ! Le widget devrait fonctionner.');
  
  // Vérifier les logs de debug
  const debugLogs = content.match(/console\.log\(\[DEBUG\].*?\)/g);
  if (debugLogs) {
    console.log('\n🔍 Logs de debug trouvés:');
    debugLogs.slice(0, 5).forEach(log => {
      console.log(`  - ${log}`);
    });
  }
  
  // Vérifier les erreurs potentielles
  const errorHandling = content.match(/catch.*?err.*?console\.error/g);
  if (errorHandling) {
    console.log('\n⚠️  Gestion d\'erreurs trouvée:');
    errorHandling.slice(0, 3).forEach(error => {
      console.log(`  - ${error.substring(0, 50)}...`);
    });
  }
  
} else {
  console.log('\n❌ Certaines vérifications ont échoué. Le widget pourrait ne pas fonctionner correctement.');
}

console.log('\n🔧 Prochaines étapes:');
console.log('1. Vérifier la console du navigateur pour les erreurs JavaScript');
console.log('2. S\'assurer que les données sont bien passées au widget');
console.log('3. Vérifier que le widget est bien appelé dans renderWidgetContent'); 