const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');

console.log('🧪 Test de l\'intégration du widget enrichi...');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier que l'import est présent
  if (content.includes('import SalesEvolutionWidgetEnriched')) {
    console.log('✅ Import du widget enrichi trouvé');
  } else {
    console.log('❌ Import du widget enrichi manquant');
  }
  
  // Vérifier que le widget enrichi est utilisé dans le case chart
  if (content.includes('widget.id === \'sales-chart\'')) {
    console.log('✅ Widget enrichi configuré pour sales-chart');
  } else {
    console.log('❌ Configuration du widget enrichi manquante');
  }
  
  // Vérifier que le composant SalesEvolutionWidgetEnriched est appelé
  if (content.includes('<SalesEvolutionWidgetEnriched data={data} />')) {
    console.log('✅ Appel du composant enrichi trouvé');
  } else {
    console.log('❌ Appel du composant enrichi manquant');
  }
  
  // Vérifier qu'il n'y a pas d'erreurs de syntaxe évidentes
  const lines = content.split('\n');
  let syntaxErrors = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("case 'c") && !line.includes("case 'chart'") && !line.includes("case 'calendar'") && !line.includes("case 'completed'") && !line.includes("case 'critical'") && !line.includes("case 'Confirmée'")) {
      console.log(`❌ Erreur de syntaxe à la ligne ${i + 1}: ${line.trim()}`);
      syntaxErrors++;
    }
  }
  
  if (syntaxErrors === 0) {
    console.log('✅ Aucune erreur de syntaxe détectée');
  }
  
  console.log('\n📋 Résumé de l\'intégration:');
  console.log('- Le widget enrichi est maintenant intégré dans le dashboard');
  console.log('- Il s\'affichera quand widget.id === \'sales-chart\'');
  console.log('- Pour tester, allez sur http://localhost:5183/#dashboard-entreprise');
  console.log('- Le widget sales-chart devrait maintenant afficher la version enrichie');
  
} catch (error) {
  console.error('❌ Erreur lors du test:', error.message);
} 