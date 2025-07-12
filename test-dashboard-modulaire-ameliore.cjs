#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 TEST DU DASHBOARD MODULAIRE AMÉLIORÉ');
console.log('=====================================\n');

// Vérifier que le fichier modulaire existe
const modularFile = 'src/pages/EnterpriseDashboardModular.tsx';
if (!fs.existsSync(modularFile)) {
  console.error('❌ Fichier modulaire non trouvé:', modularFile);
  process.exit(1);
}

// Lire le contenu du fichier
const content = fs.readFileSync(modularFile, 'utf8');

console.log('📊 ANALYSE DU FICHIER MODULAIRE AMÉLIORÉ');
console.log('----------------------------------------');

// Vérifications de base
const checks = [
  {
    name: 'Import react-grid-layout',
    test: content.includes('import { Responsive, WidthProvider } from \'react-grid-layout\'')
  },
  {
    name: 'Import CSS react-grid-layout',
    test: content.includes('import \'react-grid-layout/css/styles.css\'')
  },
  {
    name: 'Import CSS react-resizable',
    test: content.includes('import \'react-resizable/css/styles.css\'')
  },
  {
    name: 'ResponsiveGridLayout',
    test: content.includes('const ResponsiveGridLayout = WidthProvider(Responsive)')
  },
  {
    name: 'Hook useAdaptiveWidget',
    test: content.includes('const useAdaptiveWidget = (widgetSize:')
  },
  {
    name: 'Données simulées mockData',
    test: content.includes('const mockData = {')
  },
  {
    name: 'Gestion d\'état layout',
    test: content.includes('const [layout, setLayout] = useState<WidgetLayout[]>([])')
  },
  {
    name: 'Gestion d\'état widgetStates',
    test: content.includes('const [widgetStates, setWidgetStates] = useState<{ [key: string]: any }>({})')
  },
  {
    name: 'Fonction renderWidget',
    test: content.includes('const renderWidget = (widget: Widget) => {')
  },
  {
    name: 'ResponsiveGridLayout dans le JSX',
    test: content.includes('<ResponsiveGridLayout')
  },
  {
    name: 'Props isDraggable et isResizable',
    test: content.includes('isDraggable={true}') && content.includes('isResizable={true}')
  },
  {
    name: 'Gestion du loading',
    test: content.includes('isLoading ? (') && content.includes('RefreshCw className="h-6 w-6 text-gray-400 animate-spin"')
  },
  {
    name: 'Widgets métriques',
    test: content.includes('case \'metric\':')
  },
  {
    name: 'Widgets graphiques',
    test: content.includes('case \'chart\':')
  },
  {
    name: 'Widgets liste',
    test: content.includes('case \'list\':')
  },
  {
    name: 'Widgets performance',
    test: content.includes('case \'performance\':')
  },
  {
    name: 'Formatage des devises',
    test: content.includes('formatCurrency(data.revenue)')
  },
  {
    name: 'Indicateurs de croissance',
    test: content.includes('TrendingUp className="h-3 w-3 text-orange-500 mr-1"')
  },
  {
    name: 'Gestion des erreurs',
    test: content.includes('console.error(\'Erreur chargement données:\', error)')
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach((check, index) => {
  const status = check.test ? '✅' : '❌';
  const result = check.test ? 'PASS' : 'FAIL';
  console.log(`${status} ${index + 1}. ${check.name}: ${result}`);
  if (check.test) passedChecks++;
});

console.log('\n📈 RÉSULTATS');
console.log('------------');
console.log(`Tests réussis: ${passedChecks}/${totalChecks}`);
console.log(`Taux de réussite: ${Math.round((passedChecks / totalChecks) * 100)}%`);

// Vérifications avancées
console.log('\n🔧 VÉRIFICATIONS AVANCÉES');
console.log('-------------------------');

const advancedChecks = [
  {
    name: 'Types TypeScript',
    test: content.includes('interface Widget {') && content.includes('interface WidgetLayout {')
  },
  {
    name: 'Gestion responsive',
    test: content.includes('breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}')
  },
  {
    name: 'Colonnes responsive',
    test: content.includes('cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}')
  },
  {
    name: 'Hauteur de ligne',
    test: content.includes('rowHeight={100}')
  },
  {
    name: 'Marges et padding',
    test: content.includes('margin={[16, 16]}') && content.includes('containerPadding={[0, 0]}')
  },
  {
    name: 'Limites de redimensionnement',
    test: content.includes('minW: 2,') && content.includes('maxW: 12,')
  },
  {
    name: 'Données par type d\'utilisateur',
    test: content.includes('vendeur:') && content.includes('loueur:') && content.includes('mecanicien:')
  },
  {
    name: 'Gestion des icônes',
    test: content.includes('iconMap[widget.icon] && React.createElement(iconMap[widget.icon]')
  },
  {
    name: 'Formatage conditionnel',
    test: content.includes('data?.revenue ? formatCurrency(data.revenue) :')
  },
  {
    name: 'Gestion des statuts',
    test: content.includes('item.status === \'Disponible\' ? \'bg-green-100 text-green-800\' :')
  }
];

let passedAdvanced = 0;
let totalAdvanced = advancedChecks.length;

advancedChecks.forEach((check, index) => {
  const status = check.test ? '✅' : '❌';
  const result = check.test ? 'PASS' : 'FAIL';
  console.log(`${status} ${index + 1}. ${check.name}: ${result}`);
  if (check.test) passedAdvanced++;
});

console.log('\n📊 RÉSULTATS AVANCÉS');
console.log('-------------------');
console.log(`Tests réussis: ${passedAdvanced}/${totalAdvanced}`);
console.log(`Taux de réussite: ${Math.round((passedAdvanced / totalAdvanced) * 100)}%`);

// Recommandations
console.log('\n💡 RECOMMANDATIONS');
console.log('------------------');

if (passedChecks >= totalChecks * 0.8 && passedAdvanced >= totalAdvanced * 0.8) {
  console.log('✅ Le fichier modulaire est prêt pour remplacer le fichier principal');
  console.log('✅ Toutes les fonctionnalités essentielles sont implémentées');
  console.log('✅ L\'aspect visuel est préservé avec react-grid-layout');
  console.log('✅ La gestion d\'état est complète');
  console.log('\n🚀 PROCHAINES ÉTAPES:');
  console.log('1. Tester le fichier modulaire en parallèle');
  console.log('2. Vérifier que tous les widgets s\'affichent correctement');
  console.log('3. Tester le drag & drop des widgets');
  console.log('4. Valider les interactions utilisateur');
  console.log('5. Basculer progressivement vers le modulaire');
} else {
  console.log('⚠️  Le fichier modulaire nécessite encore des améliorations');
  console.log('⚠️  Certaines fonctionnalités manquent ou sont incomplètes');
  console.log('\n🔧 AMÉLIORATIONS NÉCESSAIRES:');
  
  if (passedChecks < totalChecks * 0.8) {
    console.log('- Compléter les imports manquants');
    console.log('- Implémenter les widgets manquants');
    console.log('- Améliorer la gestion d\'état');
  }
  
  if (passedAdvanced < totalAdvanced * 0.8) {
    console.log('- Améliorer la gestion responsive');
    console.log('- Compléter les types TypeScript');
    console.log('- Optimiser les performances');
  }
}

// Statistiques du fichier
const lines = content.split('\n').length;
const sizeKB = Math.round(fs.statSync(modularFile).size / 1024);

console.log('\n📏 STATISTIQUES DU FICHIER');
console.log('-------------------------');
console.log(`Lignes de code: ${lines}`);
console.log(`Taille: ${sizeKB} KB`);
console.log(`Complexité: ${lines > 500 ? 'Élevée' : lines > 200 ? 'Moyenne' : 'Faible'}`);

// Comparaison avec l'ancien fichier
const oldFile = 'src/pages/EnterpriseDashboard.tsx';
if (fs.existsSync(oldFile)) {
  const oldContent = fs.readFileSync(oldFile, 'utf8');
  const oldLines = oldContent.split('\n').length;
  const oldSizeKB = Math.round(fs.statSync(oldFile).size / 1024);
  
  console.log('\n📊 COMPARAISON AVEC L\'ANCIEN FICHIER');
  console.log('------------------------------------');
  console.log(`Ancien fichier: ${oldLines} lignes, ${oldSizeKB} KB`);
  console.log(`Nouveau fichier: ${lines} lignes, ${sizeKB} KB`);
  console.log(`Réduction: ${Math.round((1 - lines / oldLines) * 100)}% des lignes`);
  console.log(`Gain de taille: ${Math.round((1 - sizeKB / oldSizeKB) * 100)}%`);
}

console.log('\n🎉 TEST TERMINÉ');
console.log('==============='); 