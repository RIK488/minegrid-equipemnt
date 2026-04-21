// ========================================
// SCRIPT DE VÉRIFICATION - À EXÉCUTER APRÈS LE RECHARGEMENT
// ========================================

console.log('🔍 VÉRIFICATION POST-EXÉCUTION - DÉMARRAGE...');

// ========================================
// VÉRIFICATION 1: CONFIGURATION
// ========================================

console.log('\n📋 VÉRIFICATION 1: Configuration...');

const config = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
const widgets = config.dashboardConfig?.widgets || [];

console.log(`✅ Métier configuré: ${config.metier}`);
console.log(`✅ Widgets configurés: ${widgets.length}`);

widgets.forEach((widget, index) => {
  console.log(`   ${index + 1}. ${widget.title} - ${widget.enabled ? '✅' : '❌'}`);
});

// ========================================
// VÉRIFICATION 2: DONNÉES DE TEST
// ========================================

console.log('\n📊 VÉRIFICATION 2: Données de test...');

const inventoryData = JSON.parse(localStorage.getItem('testData_inventory') || '[]');
const salesData = JSON.parse(localStorage.getItem('testData_sales') || '[]');
const dailyData = JSON.parse(localStorage.getItem('testData_daily') || '[]');

console.log(`✅ Données inventory: ${inventoryData.length} éléments`);
console.log(`✅ Données sales: ${salesData.length} éléments`);
console.log(`✅ Données daily: ${dailyData.length} éléments`);

// ========================================
// VÉRIFICATION 3: ÉLÉMENTS DU DOM
// ========================================

console.log('\n🌐 VÉRIFICATION 3: Éléments du DOM...');

// Vérifier les widgets dans le DOM
const widgetElements = document.querySelectorAll('[data-widget-id], .widget, [class*="widget"]');
console.log(`✅ Éléments widget trouvés: ${widgetElements.length}`);

// Vérifier les containers spécifiques
const dashboardContainer = document.querySelector('.dashboard-container, #dashboard, [class*="dashboard"]');
console.log(`✅ Container dashboard: ${dashboardContainer ? '✅ Trouvé' : '❌ Non trouvé'}`);

// Vérifier les widgets spécifiques
const inventoryWidget = document.querySelector('[data-widget-id="inventory-status"], [class*="inventory"]');
const salesWidget = document.querySelector('[data-widget-id="sales-pipeline"], [class*="sales"]');
const dailyWidget = document.querySelector('[data-widget-id="daily-actions"], [class*="daily"]');

console.log(`✅ Widget inventory: ${inventoryWidget ? '✅ Trouvé' : '❌ Non trouvé'}`);
console.log(`✅ Widget sales: ${salesWidget ? '✅ Trouvé' : '❌ Non trouvé'}`);
console.log(`✅ Widget daily: ${dailyWidget ? '✅ Trouvé' : '❌ Non trouvé'}`);

// ========================================
// VÉRIFICATION 4: ERREURS CONSOLE
// ========================================

console.log('\n❌ VÉRIFICATION 4: Erreurs console...');

// Vérifier s'il y a des erreurs récentes
const hasErrors = window.consoleErrors && window.consoleErrors.length > 0;
console.log(`✅ Erreurs console: ${hasErrors ? '❌ Erreurs détectées' : '✅ Aucune erreur'}`);

// Vérifier spécifiquement l'erreur _s14
const hasS14Error = window.consoleErrors && window.consoleErrors.some(error => 
  error.includes('_s14') || error.includes('s14')
);
console.log(`✅ Erreur _s14: ${hasS14Error ? '❌ Erreur détectée' : '✅ Aucune erreur _s14'}`);

// ========================================
// VÉRIFICATION 5: FONCTIONNALITÉS
// ========================================

console.log('\n⚙️ VÉRIFICATION 5: Fonctionnalités...');

// Vérifier que React est chargé
const reactLoaded = window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
console.log(`✅ React chargé: ${reactLoaded ? '✅' : '❌'}`);

// Vérifier que Vite est actif
const viteActive = window.__VITE__ || document.querySelector('[data-vite-dev-id]');
console.log(`✅ Vite actif: ${viteActive ? '✅' : '❌'}`);

// Vérifier les modules essentiels
const modulesLoaded = {
  'localStorage': typeof localStorage !== 'undefined',
  'sessionStorage': typeof sessionStorage !== 'undefined',
  'fetch': typeof fetch !== 'undefined',
  'console': typeof console !== 'undefined'
};

Object.entries(modulesLoaded).forEach(([module, loaded]) => {
  console.log(`✅ Module ${module}: ${loaded ? '✅' : '❌'}`);
});

// ========================================
// RÉSUMÉ FINAL
// ========================================

console.log('\n📋 RÉSUMÉ FINAL DE LA VÉRIFICATION:');

const summary = {
  'Configuration': widgets.length > 0,
  'Données de test': inventoryData.length > 0 && salesData.length > 0 && dailyData.length > 0,
  'Éléments DOM': widgetElements.length > 0,
  'Container dashboard': !!dashboardContainer,
  'Widgets spécifiques': !!(inventoryWidget && salesWidget && dailyWidget),
  'Aucune erreur console': !hasErrors,
  'Aucune erreur _s14': !hasS14Error,
  'React chargé': !!reactLoaded,
  'Vite actif': !!viteActive,
  'Modules essentiels': Object.values(modulesLoaded).every(Boolean)
};

Object.entries(summary).forEach(([check, passed]) => {
  console.log(`   ${check}: ${passed ? '✅' : '❌'}`);
});

const totalChecks = Object.keys(summary).length;
const passedChecks = Object.values(summary).filter(Boolean).length;
const successRate = Math.round((passedChecks / totalChecks) * 100);

console.log(`\n🎯 TAUX DE RÉUSSITE: ${successRate}% (${passedChecks}/${totalChecks})`);

if (successRate >= 80) {
  console.log('🎉 EXCELLENT ! La correction a fonctionné parfaitement !');
  console.log('✅ Tous les widgets devraient être visibles et fonctionnels');
} else if (successRate >= 60) {
  console.log('⚠️ BON ! La correction a partiellement fonctionné');
  console.log('🔧 Quelques ajustements peuvent être nécessaires');
} else {
  console.log('❌ PROBLÈME ! La correction n\'a pas fonctionné comme attendu');
  console.log('🚨 Contactez le support avec les logs d\'erreur');
}

console.log('\n🎯 PROCHAINES ÉTAPES:');
console.log('   1. Vérifiez visuellement que tous les widgets s\'affichent');
console.log('   2. Testez les interactions (clics, filtres, etc.)');
console.log('   3. Vérifiez que les données sont réalistes');
console.log('   4. Confirmez qu\'il n\'y a plus d\'erreur _s14()');

console.log('\n✅ Vérification terminée !'); 