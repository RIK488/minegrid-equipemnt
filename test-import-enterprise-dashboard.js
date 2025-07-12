// Script pour vérifier que le bon fichier EnterpriseDashboard est utilisé
console.log('=== VÉRIFICATION IMPORT ENTERPRISE DASHBOARD ===');

const fs = require('fs');
const path = require('path');

// Vérifier les fichiers existants
const files = [
  'src/pages/EnterpriseDashboard.tsx',
  'src/pages/EnterpriseDashboard.js',
  'src/pages/EnterpriseDashboard_temp.tsx',
  'src/pages/EnterpriseDashboard.tsx.backup.1751888097245'
];

console.log('\n📁 Fichiers EnterpriseDashboard existants:');
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? '(EXISTE)' : '(N\'EXISTE PAS)'}`);
});

// Vérifier le contenu du fichier principal
const mainFile = 'src/pages/EnterpriseDashboard.tsx';
if (fs.existsSync(mainFile)) {
  console.log('\n🔍 Contenu du fichier principal:');
  const content = fs.readFileSync(mainFile, 'utf8');
  
  // Vérifier si le widget daily-actions est présent
  const hasDailyActions = content.includes('daily-actions');
  const hasGetDailyActionsData = content.includes('getDailyActionsData');
  const hasDailyActionsPriorityWidget = content.includes('DailyActionsPriorityWidget');
  
  console.log(`✅ Widget daily-actions: ${hasDailyActions ? 'PRÉSENT' : 'ABSENT'}`);
  console.log(`✅ Fonction getDailyActionsData: ${hasGetDailyActionsData ? 'PRÉSENTE' : 'ABSENTE'}`);
  console.log(`✅ Composant DailyActionsPriorityWidget: ${hasDailyActionsPriorityWidget ? 'PRÉSENT' : 'ABSENT'}`);
  
  // Vérifier la configuration des widgets
  const hasWidgetConfigs = content.includes('widgetConfigs');
  const hasVendeurConfig = content.includes('vendeur:');
  const hasDailyActionsInConfig = content.includes('daily-actions');
  
  console.log(`✅ Configuration widgets: ${hasWidgetConfigs ? 'PRÉSENTE' : 'ABSENTE'}`);
  console.log(`✅ Config métier vendeur: ${hasVendeurConfig ? 'PRÉSENTE' : 'ABSENTE'}`);
  console.log(`✅ daily-actions dans config: ${hasDailyActionsInConfig ? 'PRÉSENT' : 'ABSENT'}`);
  
} else {
  console.log('❌ Fichier principal EnterpriseDashboard.tsx introuvable!');
}

// Vérifier l'import dans App.tsx
const appFile = 'src/App.tsx';
if (fs.existsSync(appFile)) {
  console.log('\n📱 Import dans App.tsx:');
  const appContent = fs.readFileSync(appFile, 'utf8');
  const importLine = appContent.match(/import.*EnterpriseDashboard.*from.*['"]([^'"]+)['"]/);
  
  if (importLine) {
    console.log(`✅ Import trouvé: ${importLine[0]}`);
    console.log(`✅ Chemin: ${importLine[1]}`);
  } else {
    console.log('❌ Import EnterpriseDashboard non trouvé dans App.tsx');
  }
}

console.log('\n=== FIN DE LA VÉRIFICATION ===');
console.log('\n🎯 Si tous les ✅ sont présents, le widget devrait fonctionner.');
console.log('🔄 Redémarre le serveur et teste en navigation privée.'); 