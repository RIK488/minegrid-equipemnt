#!/usr/bin/env node

/**
 * Script de vérification de l'intégration des widgets vendeurs
 * Vérifie que toutes les composantes additionnelles sont bien intégrées
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des widgets attendus avec leurs composantes
const expectedWidgets = {
  'sales-metrics': {
    title: 'Score de Performance Commerciale',
    features: ['aiRecommendations', 'benchmarking', 'periodSelector', 'export', 'analytics', 'alerts'],
    description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA'
  },
  'sales-evolution': {
    title: 'Évolution des ventes enrichie',
    features: ['sectorComparison', 'autoNotifications', 'quickActions', 'periodSelector', 'export', 'analytics', 'alerts'],
    description: 'Courbe avec benchmarking secteur, notifications automatiques, actions rapides'
  },
  'stock-status': {
    title: 'Plan d\'action stock & revente',
    features: ['stockAnalytics', 'recommendations', 'quickActions', 'export', 'analytics', 'alerts'],
    description: 'Statut stock dormant, recommandations automatiques, actions rapides'
  },
  'sales-pipeline': {
    title: 'Assistant Prospection Active',
    features: ['autoReminders', 'probabilityScoring', 'smartActions', 'periodSelector', 'export', 'analytics', 'alerts'],
    description: 'Alertes de relance, score de probabilité, actions intelligentes'
  },
  'daily-actions': {
    title: 'Actions prioritaires du jour',
    features: ['aiGenerated', 'dynamicContent', 'stickyDisplay', 'alerts'],
    description: 'Liste dynamique de 3-5 actions générées par IA pour vendre plus'
  }
};

// Composants React attendus
const expectedComponents = [
  'PerformanceScoreWidget',
  'SalesEvolutionWidget', 
  'StockActionWidget',
  'ProspectionAssistantWidget',
  'DailyActionsWidget'
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function checkWidgetsInFile(filePath, fileType) {
  console.log(`\n🔍 Vérification du fichier ${filePath}...`);
  
  const content = readFileContent(filePath);
  if (!content) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return false;
  }

  let allWidgetsFound = true;
  let allFeaturesFound = true;

  // Vérifier chaque widget attendu
  for (const [widgetId, expected] of Object.entries(expectedWidgets)) {
    console.log(`\n  📊 Vérification du widget: ${expected.title}`);
    
    // Vérifier que le widget existe
    const widgetFound = content.includes(`id: '${widgetId}'`) || content.includes(`"id": "${widgetId}"`);
    if (!widgetFound) {
      console.log(`    ❌ Widget ${widgetId} non trouvé`);
      allWidgetsFound = false;
    } else {
      console.log(`    ✅ Widget ${widgetId} trouvé`);
    }

    // Vérifier le titre
    const titleFound = content.includes(expected.title);
    if (!titleFound) {
      console.log(`    ❌ Titre "${expected.title}" non trouvé`);
      allWidgetsFound = false;
    } else {
      console.log(`    ✅ Titre "${expected.title}" trouvé`);
    }

    // Vérifier la description
    const descriptionFound = content.includes(expected.description);
    if (!descriptionFound) {
      console.log(`    ❌ Description non trouvée`);
      allWidgetsFound = false;
    } else {
      console.log(`    ✅ Description trouvée`);
    }

    // Vérifier les features
    for (const feature of expected.features) {
      const featureFound = content.includes(feature);
      if (!featureFound) {
        console.log(`    ❌ Feature "${feature}" non trouvée`);
        allFeaturesFound = false;
      } else {
        console.log(`    ✅ Feature "${feature}" trouvée`);
      }
    }
  }

  return allWidgetsFound && allFeaturesFound;
}

function checkComponentsInFile(filePath) {
  console.log(`\n🔍 Vérification des composants React dans ${filePath}...`);
  
  const content = readFileContent(filePath);
  if (!content) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return false;
  }

  let allComponentsFound = true;

  for (const component of expectedComponents) {
    const componentFound = content.includes(`export const ${component}`) || content.includes(`const ${component}`);
    if (!componentFound) {
      console.log(`    ❌ Composant ${component} non trouvé`);
      allComponentsFound = false;
    } else {
      console.log(`    ✅ Composant ${component} trouvé`);
    }
  }

  return allComponentsFound;
}

function checkExportsInIndex() {
  console.log(`\n🔍 Vérification des exports dans index.js...`);
  
  const indexPath = path.join(__dirname, 'src', 'pages', 'widgets', 'index.js');
  const content = readFileContent(indexPath);
  
  if (!content) {
    console.log(`❌ Fichier index.js non trouvé`);
    return false;
  }

  // Vérifier l'export des widgets
  const widgetsExportFound = content.includes('export { VendeurWidgets }');
  const tsExportFound = content.includes('export { VendeurWidgets as VendeurWidgetsTS');
  const componentsExportFound = content.includes('PerformanceScoreWidget');

  console.log(`    ${widgetsExportFound ? '✅' : '❌'} Export VendeurWidgets`);
  console.log(`    ${tsExportFound ? '✅' : '❌'} Export VendeurWidgetsTS`);
  console.log(`    ${componentsExportFound ? '✅' : '❌'} Export des composants React`);

  return widgetsExportFound && tsExportFound && componentsExportFound;
}

function checkEnterpriseDashboardIntegration() {
  console.log(`\n🔍 Vérification de l'intégration dans EnterpriseDashboard...`);
  
  const dashboardPath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
  const content = readFileContent(dashboardPath);
  
  if (!content) {
    console.log(`❌ Fichier EnterpriseDashboard.tsx non trouvé`);
    return false;
  }

  // Vérifier l'import des widgets
  const importFound = content.includes('import { VendeurWidgets } from');
  console.log(`    ${importFound ? '✅' : '❌'} Import VendeurWidgets`);

  // Vérifier l'utilisation des widgets
  const usageFound = content.includes('VendeurWidgets.widgets.map');
  console.log(`    ${usageFound ? '✅' : '❌'} Utilisation VendeurWidgets.widgets.map`);

  // Vérifier les types de widgets supportés
  const performanceTypeFound = content.includes("case 'performance'");
  const priorityTypeFound = content.includes("case 'priority'");
  
  console.log(`    ${performanceTypeFound ? '✅' : '❌'} Support du type 'performance'`);
  console.log(`    ${priorityTypeFound ? '✅' : '❌'} Support du type 'priority'`);

  return importFound && usageFound && performanceTypeFound && priorityTypeFound;
}

function main() {
  console.log('🚀 Vérification de l\'intégration des widgets vendeurs\n');
  console.log('=' .repeat(60));

  const srcDir = path.join(__dirname, 'src', 'pages', 'widgets');
  
  // Vérifier le fichier JavaScript
  const jsFile = path.join(srcDir, 'VendeurWidgets.js');
  const jsOk = checkWidgetsInFile(jsFile, 'JavaScript');

  // Vérifier le fichier TypeScript
  const tsFile = path.join(srcDir, 'VendeurWidgets.tsx');
  const tsOk = checkWidgetsInFile(tsFile, 'TypeScript');
  const componentsOk = checkComponentsInFile(tsFile);

  // Vérifier les exports
  const exportsOk = checkExportsInIndex();

  // Vérifier l'intégration dans EnterpriseDashboard
  const dashboardOk = checkEnterpriseDashboardIntegration();

  // Résumé
  console.log('\n' + '=' .repeat(60));
  console.log('📋 RÉSUMÉ DE LA VÉRIFICATION');
  console.log('=' .repeat(60));

  console.log(`\n📁 Fichier JavaScript (VendeurWidgets.js): ${jsOk ? '✅ OK' : '❌ PROBLÈMES'}`);
  console.log(`📁 Fichier TypeScript (VendeurWidgets.tsx): ${tsOk ? '✅ OK' : '❌ PROBLÈMES'}`);
  console.log(`🧩 Composants React: ${componentsOk ? '✅ OK' : '❌ PROBLÈMES'}`);
  console.log(`📤 Exports (index.js): ${exportsOk ? '✅ OK' : '❌ PROBLÈMES'}`);
  console.log(`🏢 Intégration EnterpriseDashboard: ${dashboardOk ? '✅ OK' : '❌ PROBLÈMES'}`);

  const allOk = jsOk && tsOk && componentsOk && exportsOk && dashboardOk;

  console.log(`\n🎯 RÉSULTAT GLOBAL: ${allOk ? '✅ TOUTES LES COMPOSANTES SONT INTÉGRÉES' : '❌ PROBLÈMES DÉTECTÉS'}`);

  if (allOk) {
    console.log('\n🎉 Félicitations ! Tous les widgets vendeurs sont correctement intégrés avec leurs composantes additionnelles :');
    console.log('\n✅ 1. Score de Performance Commerciale - avec jauge, comparaison, rang et recommandations IA');
    console.log('✅ 2. Évolution des ventes enrichie - avec benchmarking secteur et notifications automatiques');
    console.log('✅ 3. Plan d\'action stock & revente - avec statut dormant et recommandations automatiques');
    console.log('✅ 4. Assistant Prospection Active - avec alertes de relance et actions intelligentes');
    console.log('✅ 5. Actions prioritaires du jour - avec contenu dynamique généré par IA');
  } else {
    console.log('\n⚠️  Des problèmes ont été détectés. Veuillez corriger les éléments manquants.');
  }

  return allOk ? 0 : 1;
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}

export { main, expectedWidgets, expectedComponents }; 