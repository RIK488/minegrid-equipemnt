const fs = require('fs');
const path = require('path');

// Lire le fichier modulaire
const modularFile = path.join(__dirname, 'src/pages/EnterpriseDashboardModular.tsx');
const originalFile = path.join(__dirname, 'src/pages/EnterpriseDashboard.tsx');

console.log('🔍 Vérification de l\'intégration complète des widgets...\n');

// Vérifier que le fichier modulaire existe
if (!fs.existsSync(modularFile)) {
  console.error('❌ Fichier modulaire non trouvé');
  process.exit(1);
}

const modularContent = fs.readFileSync(modularFile, 'utf8');
const originalContent = fs.readFileSync(originalFile, 'utf8');

// Liste des widgets à vérifier
const widgetsToCheck = [
  'SalesPerformanceScoreWidget',
  'MetricWidget',
  'MapWidget',
  'EquipmentAvailabilityWidget',
  'SalesPipelineWidget',
  'DailyPriorityActionsWidget',
  'InventoryStatusWidget',
  'PlanningWidget',
  'AdvancedKPIsWidget',
  'NotificationsWidget',
  'PreventiveMaintenanceWidget',
  'CalendarWidget',
  'ListWidget',
  'ChartWidget'
];

console.log('📋 Widgets à vérifier:');
widgetsToCheck.forEach(widget => console.log(`  - ${widget}`));
console.log('');

// Vérifier chaque widget
let foundWidgets = 0;
let missingWidgets = [];

widgetsToCheck.forEach(widget => {
  if (modularContent.includes(widget)) {
    console.log(`✅ ${widget} - Trouvé`);
    foundWidgets++;
  } else {
    console.log(`❌ ${widget} - MANQUANT`);
    missingWidgets.push(widget);
  }
});

console.log('\n📊 Résultats:');
console.log(`  - Widgets trouvés: ${foundWidgets}/${widgetsToCheck.length}`);
console.log(`  - Taux de réussite: ${((foundWidgets / widgetsToCheck.length) * 100).toFixed(1)}%`);

if (missingWidgets.length > 0) {
  console.log('\n❌ Widgets manquants:');
  missingWidgets.forEach(widget => console.log(`  - ${widget}`));
} else {
  console.log('\n🎉 Tous les widgets sont intégrés !');
}

// Vérifier les types de widgets dans la fonction renderWidget
const renderWidgetCases = [
  'daily-actions',
  'performance',
  'metric',
  'equipment',
  'pipeline',
  'map',
  'chart',
  'list',
  'calendar',
  'maintenance',
  'analytics',
  'priority'
];

console.log('\n🔧 Vérification des cas dans renderWidget:');
let foundCases = 0;
let missingCases = [];

renderWidgetCases.forEach(caseType => {
  if (modularContent.includes(`case '${caseType}':`)) {
    console.log(`✅ case '${caseType}' - Trouvé`);
    foundCases++;
  } else {
    console.log(`❌ case '${caseType}' - MANQUANT`);
    missingCases.push(caseType);
  }
});

console.log('\n📊 Résultats renderWidget:');
console.log(`  - Cas trouvés: ${foundCases}/${renderWidgetCases.length}`);
console.log(`  - Taux de réussite: ${((foundCases / renderWidgetCases.length) * 100).toFixed(1)}%`);

if (missingCases.length > 0) {
  console.log('\n❌ Cas manquants dans renderWidget:');
  missingCases.forEach(caseType => console.log(`  - case '${caseType}'`));
} else {
  console.log('\n🎉 Tous les cas renderWidget sont présents !');
}

// Vérifier la taille du fichier
const modularSize = fs.statSync(modularFile).size;
const originalSize = fs.statSync(originalFile).size;

console.log('\n📏 Comparaison des tailles:');
console.log(`  - Fichier original: ${(originalSize / 1024).toFixed(1)} KB`);
console.log(`  - Fichier modulaire: ${(modularSize / 1024).toFixed(1)} KB`);
console.log(`  - Différence: ${((modularSize - originalSize) / 1024).toFixed(1)} KB`);

// Vérifier les imports nécessaires
const requiredImports = [
  'useState',
  'useEffect',
  'React',
  'Target',
  'BarChart3',
  'Calendar',
  'Wrench',
  'Globe',
  'Truck',
  'Package',
  'ArrowRight',
  'FileText',
  'X',
  'TrendingUp',
  'Clock',
  'Mail',
  'Star',
  'TrendingDown',
  'Eye',
  'Edit'
];

console.log('\n📦 Vérification des imports:');
let foundImports = 0;
let missingImports = [];

requiredImports.forEach(importName => {
  if (modularContent.includes(importName)) {
    console.log(`✅ ${importName} - Importé`);
    foundImports++;
  } else {
    console.log(`❌ ${importName} - MANQUANT`);
    missingImports.push(importName);
  }
});

console.log('\n📊 Résultats imports:');
console.log(`  - Imports trouvés: ${foundImports}/${requiredImports.length}`);
console.log(`  - Taux de réussite: ${((foundImports / requiredImports.length) * 100).toFixed(1)}%`);

if (missingImports.length > 0) {
  console.log('\n❌ Imports manquants:');
  missingImports.forEach(importName => console.log(`  - ${importName}`));
} else {
  console.log('\n🎉 Tous les imports sont présents !');
}

// Résumé final
const totalChecks = widgetsToCheck.length + renderWidgetCases.length + requiredImports.length;
const totalFound = foundWidgets + foundCases + foundImports;
const overallSuccess = (totalFound / totalChecks) * 100;

console.log('\n🎯 RÉSUMÉ FINAL:');
console.log(`  - Total des vérifications: ${totalChecks}`);
console.log(`  - Éléments trouvés: ${totalFound}`);
console.log(`  - Taux de réussite global: ${overallSuccess.toFixed(1)}%`);

if (overallSuccess >= 90) {
  console.log('\n🎉 EXCELLENT ! Le fichier modulaire est presque complet !');
} else if (overallSuccess >= 70) {
  console.log('\n⚠️  BON ! Quelques éléments manquent mais le fichier est fonctionnel.');
} else {
  console.log('\n❌ ATTENTION ! Beaucoup d\'éléments manquent.');
}

console.log('\n✅ Test terminé !'); 