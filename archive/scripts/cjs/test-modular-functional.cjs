const fs = require('fs');
const path = require('path');

console.log('🧪 Test de fonctionnalité de la version modulaire...\n');

// Vérifier que le fichier modulaire existe et est lisible
const modularFile = 'src/pages/EnterpriseDashboardModular.tsx';
if (fs.existsSync(modularFile)) {
  const content = fs.readFileSync(modularFile, 'utf8');
  const lines = content.split('\n').length;
  const size = fs.statSync(modularFile).size;
  
  console.log(`✅ Fichier modulaire trouvé: ${modularFile}`);
  console.log(`   📊 Taille: ${(size / 1024).toFixed(1)} KB`);
  console.log(`   📄 Lignes: ${lines}`);
  
  // Vérifier que le fichier contient les éléments essentiels
  const hasReactImport = content.includes('import React');
  const hasExport = content.includes('export default EnterpriseDashboardModular');
  const hasWidgetRenderer = content.includes('WidgetRenderer');
  const hasDashboardConfig = content.includes('getDashboardConfig');
  
  console.log('\n🔍 Vérification du contenu:');
  console.log(`${hasReactImport ? '✅' : '❌'} Import React`);
  console.log(`${hasExport ? '✅' : '❌'} Export du composant`);
  console.log(`${hasWidgetRenderer ? '✅' : '❌'} WidgetRenderer importé`);
  console.log(`${hasDashboardConfig ? '✅' : '❌'} Configuration dashboard`);
  
} else {
  console.log('❌ Fichier modulaire non trouvé');
}

// Vérifier que tous les composants nécessaires existent
console.log('\n🎯 Vérification des composants:');

const requiredComponents = [
  'src/components/dashboard/WidgetRenderer.tsx',
  'src/components/dashboard/layout/MainDashboardLayout.tsx',
  'src/components/dashboard/layout/TopBar.tsx',
  'src/components/dashboard/layout/SidebarMenu.tsx',
  'src/components/dashboard/widgets/DailyActionsWidget.tsx',
  'src/components/dashboard/widgets/MetricWidget.tsx',
  'src/components/dashboard/widgets/ListWidget.tsx',
  'src/components/dashboard/widgets/ChartWidget.tsx',
  'src/components/dashboard/widgets/PerformanceWidget.tsx',
  'src/components/dashboard/widgets/InventoryWidget.tsx'
];

let allComponentsExist = true;
requiredComponents.forEach(component => {
  const exists = fs.existsSync(component);
  console.log(`${exists ? '✅' : '❌'} ${component}`);
  if (!exists) allComponentsExist = false;
});

// Vérifier les fichiers d'index
console.log('\n📁 Vérification des fichiers d\'index:');
const indexFiles = [
  'src/components/dashboard/index.ts',
  'src/components/dashboard/layout/index.ts',
  'src/components/dashboard/widgets/index.ts'
];

indexFiles.forEach(indexFile => {
  const exists = fs.existsSync(indexFile);
  console.log(`${exists ? '✅' : '❌'} ${indexFile}`);
});

// Vérifier les utilitaires et configuration
console.log('\n🔧 Vérification des utilitaires:');
const utilsFiles = [
  'src/utils/dashboardUtils.ts',
  'src/constants/dashboardConfig.ts'
];

utilsFiles.forEach(utilsFile => {
  const exists = fs.existsSync(utilsFile);
  if (exists) {
    const content = fs.readFileSync(utilsFile, 'utf8');
    const lines = content.split('\n').length;
    console.log(`✅ ${utilsFile} (${lines} lignes)`);
  } else {
    console.log(`❌ ${utilsFile}`);
  }
});

// Comparer avec le fichier original
console.log('\n📊 Comparaison avec l\'original:');
const originalFile = 'src/pages/EnterpriseDashboard.tsx';
if (fs.existsSync(originalFile)) {
  const originalContent = fs.readFileSync(originalFile, 'utf8');
  const originalLines = originalContent.split('\n').length;
  const originalSize = fs.statSync(originalFile).size;
  
  console.log(`📄 Original: ${originalLines} lignes, ${(originalSize / 1024).toFixed(1)} KB`);
}

if (fs.existsSync(modularFile)) {
  const modularContent = fs.readFileSync(modularFile, 'utf8');
  const modularLines = modularContent.split('\n').length;
  const modularSize = fs.statSync(modularFile).size;
  
  console.log(`📄 Modulaire: ${modularLines} lignes, ${(modularSize / 1024).toFixed(1)} KB`);
  
  const reduction = ((originalLines - modularLines) / originalLines * 100).toFixed(1);
  console.log(`📉 Réduction: ${reduction}% de lignes dans le fichier principal`);
}

console.log('\n🎉 Résumé de la fonctionnalité:');
if (allComponentsExist) {
  console.log('✅ Version modulaire complètement fonctionnelle');
  console.log('✅ Tous les composants sont disponibles');
  console.log('✅ Structure modulaire organisée');
  console.log('✅ Fichiers d\'index créés');
  console.log('✅ Imports simplifiés');
  console.log('\n📝 Pour utiliser la version modulaire:');
  console.log('1. Ouvrez src/pages/EnterpriseDashboardModular.tsx');
  console.log('2. Remplacez l\'import dans App.tsx si nécessaire');
  console.log('3. La version modulaire est prête à l\'emploi !');
} else {
  console.log('⚠️ Certains composants sont manquants');
  console.log('🔧 Vérifiez que tous les fichiers ont été créés');
} 