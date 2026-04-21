const fs = require('fs');
const path = require('path');

console.log('🎯 Test d\'affichage du widget enrichi\n');

// Vérifier les fichiers clés
const files = [
  { path: 'src/components/SalesEvolutionWidgetEnriched.tsx', name: 'Composant widget enrichi' },
  { path: 'src/pages/EnterpriseDashboard.tsx', name: 'Dashboard entreprise' },
  { path: 'src/pages/widgets/VendeurWidgets.tsx', name: 'Configuration widgets' },
  { path: 'src/App.tsx', name: 'Configuration routes' }
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);
  console.log(`📁 ${file.name}: ${exists ? '✅ Existe' : '❌ Manquant'}`);
  
  if (exists) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (file.name.includes('widget enrichi')) {
      const hasSignature = content.includes('SalesEvolutionWidgetEnriched = ({ data = [] }');
      const hasChartJs = content.includes('Chart.js');
      console.log(`   ✅ Signature: ${hasSignature}`);
      console.log(`   ✅ Chart.js: ${hasChartJs}`);
    }
    
    if (file.name.includes('Dashboard')) {
      const hasImport = content.includes('SalesEvolutionWidgetEnriched');
      const hasRender = content.includes('widget.id === \'sales-evolution\'');
      console.log(`   ✅ Import: ${hasImport}`);
      console.log(`   ✅ Rendu: ${hasRender}`);
    }
    
    if (file.name.includes('Configuration widgets')) {
      const hasWidget = content.includes('id: \'sales-evolution\'');
      const hasTitle = content.includes('Évolution des ventes enrichie');
      console.log(`   ✅ Widget défini: ${hasWidget}`);
      console.log(`   ✅ Titre: ${hasTitle}`);
    }
    
    if (file.name.includes('Configuration routes')) {
      const hasRoute = content.includes('case \'dashboard-entreprise\':');
      const hasComponent = content.includes('<EnterpriseDashboard />');
      console.log(`   ✅ Route: ${hasRoute}`);
      console.log(`   ✅ Composant: ${hasComponent}`);
    }
  }
});

console.log('\n✅ Test terminé');
console.log('\n📝 URL de test: http://localhost:5176/#dashboard-entreprise'); 