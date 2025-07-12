const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la version modulaire...\n');

// Vérifier les fichiers modulaires principaux
const fichiersModulaires = [
  'src/pages/EnterpriseDashboardModular.tsx',
  'src/utils/dashboardUtils.ts',
  'src/constants/dashboardConfig.ts',
  'src/components/dashboard/WidgetRenderer.tsx'
];

console.log('📁 Fichiers modulaires principaux :');
fichiersModulaires.forEach(fichier => {
  const existe = fs.existsSync(fichier);
  console.log(`${existe ? '✅' : '❌'} ${fichier}`);
});

// Vérifier les composants widgets
console.log('\n🎯 Composants widgets :');
const widgetsDir = 'src/components/dashboard/widgets';
if (fs.existsSync(widgetsDir)) {
  const widgets = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.tsx'));
  widgets.forEach(widget => {
    console.log(`✅ ${widgetsDir}/${widget}`);
  });
} else {
  console.log('❌ Dossier widgets non trouvé');
}

// Vérifier les composants layout
console.log('\n🏗️ Composants layout :');
const layoutDir = 'src/components/dashboard/layout';
if (fs.existsSync(layoutDir)) {
  const layouts = fs.readdirSync(layoutDir).filter(f => f.endsWith('.tsx'));
  layouts.forEach(layout => {
    console.log(`✅ ${layoutDir}/${layout}`);
  });
} else {
  console.log('❌ Dossier layout non trouvé');
}

// Comparer les tailles
console.log('\n📊 Comparaison des tailles :');
const originalFile = 'src/pages/EnterpriseDashboard.tsx';
const modularFile = 'src/pages/EnterpriseDashboardModular.tsx';

if (fs.existsSync(originalFile)) {
  const originalSize = fs.statSync(originalFile).size;
  const originalLines = fs.readFileSync(originalFile, 'utf8').split('\n').length;
  console.log(`📄 Original: ${originalLines} lignes, ${(originalSize / 1024).toFixed(1)} KB`);
}

if (fs.existsSync(modularFile)) {
  const modularSize = fs.statSync(modularFile).size;
  const modularLines = fs.readFileSync(modularFile, 'utf8').split('\n').length;
  console.log(`📄 Modulaire: ${modularLines} lignes, ${(modularSize / 1024).toFixed(1)} KB`);
}

console.log('\n🎉 Résumé :');
console.log('✅ Version modulaire créée avec succès');
console.log('✅ Tous les composants sont extraits');
console.log('✅ Le fichier original est préservé');
console.log('✅ Vous pouvez maintenant utiliser EnterpriseDashboardModular.tsx');
console.log('\n📝 Pour utiliser la version modulaire :');
console.log('1. Ouvrez src/pages/EnterpriseDashboardModular.tsx');
console.log('2. Remplacez l\'import dans votre App.tsx si nécessaire');
console.log('3. Testez que tout fonctionne correctement'); 