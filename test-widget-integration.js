const fs = require('fs');
const path = require('path');

console.log('🧪 Test d\'intégration du widget d\'évolution des ventes enrichi...');

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
    name: 'Import du widget enrichi',
    test: dashboardContent.includes('import SalesEvolutionWidgetEnriched from \'./SalesEvolutionWidgetEnriched\''),
    success: '✅ Import correct',
    error: '❌ Import manquant'
  },
  {
    name: 'Widget enrichi dans le case chart',
    test: dashboardContent.includes('widget.id === \'sales-evolution\' || widget.id === \'sales-chart\''),
    success: '✅ Condition de rendu correcte',
    error: '❌ Condition de rendu manquante'
  },
  {
    name: 'Données de test pour le widget',
    test: dashboardContent.includes('Données de test pour le widget enrichi'),
    success: '✅ Données de test présentes',
    error: '❌ Données de test manquantes'
  },
  {
    name: 'Composant SalesEvolutionWidgetEnriched défini',
    test: widgetContent.includes('const SalesEvolutionWidgetEnriched: React.FC'),
    success: '✅ Composant défini',
    error: '❌ Composant non défini'
  },
  {
    name: 'Interface SalesData définie',
    test: widgetContent.includes('interface SalesData'),
    success: '✅ Interface définie',
    error: '❌ Interface manquante'
  },
  {
    name: 'Export par défaut du widget',
    test: widgetContent.includes('export default SalesEvolutionWidgetEnriched'),
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
  console.log('✅ Le widget d\'évolution des ventes enrichi est correctement intégré');
  console.log('✅ Il s\'affichera pour les widgets avec ID "sales-evolution" ou "sales-chart"');
  console.log('✅ Les données de test sont en place');
  console.log('\n🚀 Prochaines étapes :');
  console.log('1. Redémarrez votre serveur de développement (npm run dev)');
  console.log('2. Rendez-vous sur le dashboard d\'entreprise');
  console.log('3. Vérifiez que le widget "Évolution des Ventes" s\'affiche correctement');
} else {
  console.log('❌ Certaines vérifications ont échoué');
  console.log('🔧 Vérifiez les erreurs ci-dessus et corrigez-les');
}

console.log('\n📝 Informations techniques :');
console.log('- Fichier dashboard :', dashboardPath);
console.log('- Fichier widget :', widgetPath);
console.log('- Taille dashboard :', Math.round(dashboardContent.length / 1024), 'KB');
console.log('- Taille widget :', Math.round(widgetContent.length / 1024), 'KB'); 