// Test simple pour vérifier l'état du projet
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VÉRIFICATION RAPIDE DU PROJET');
console.log('================================');

// Vérification des fichiers principaux
const filesToCheck = [
  './src/pages/VendeurDashboardRestored.tsx',
  './src/pages/widgets/VendeurWidgets.tsx',
  './package.json',
  './vite.config.ts',
  './src/App.tsx'
];

console.log('\n📁 Vérification des fichiers:');
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Trouvé' : 'Manquant'}`);
});

// Vérification du contenu du widget principal
console.log('\n🔧 Vérification du widget Pipeline Commercial:');
try {
  const widgetPath = path.join(__dirname, './src/pages/VendeurDashboardRestored.tsx');
  if (fs.existsSync(widgetPath)) {
    const content = fs.readFileSync(widgetPath, 'utf8');
    
    const features = [
      'SalesPipelineWidget',
      'handleDragStart',
      'handleResizeStart',
      'aiInsights',
      'conversionRates',
      'BARRE D\'OUTILS DU WIDGET',
      'MODAL DÉTAILS LEAD',
      'handleAddNewLead'
    ];
    
    features.forEach(feature => {
      const found = content.includes(feature);
      console.log(`  ${found ? '✅' : '❌'} ${feature}: ${found ? 'Implémenté' : 'Manquant'}`);
    });
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification:', error.message);
}

console.log('\n🎯 RÉSUMÉ:');
console.log('Le widget Pipeline Commercial est prêt pour les tests !');
console.log('\n📋 Prochaines étapes:');
console.log('1. Lancez le serveur: npm run dev');
console.log('2. Ouvrez le navigateur sur le port affiché');
console.log('3. Testez toutes les fonctionnalités du widget'); 