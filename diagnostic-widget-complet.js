console.log('🔍 DIAGNOSTIC COMPLET - Widget "Actions prioritaires du jour"');
console.log('=' .repeat(60));

// 1. Vérifier l'environnement
console.log('\n📋 1. ENVIRONNEMENT');
console.log('URL:', window.location.href);
console.log('Page:', document.title);
console.log('User Agent:', navigator.userAgent);

// 2. Vérifier le localStorage
console.log('\n💾 2. LOCALSTORAGE');
const userRole = localStorage.getItem('userRole');
const dashboardConfig = localStorage.getItem('dashboardConfig');
const widgetOrder = localStorage.getItem('widgetOrder');

console.log('userRole:', userRole);
console.log('dashboardConfig présent:', !!dashboardConfig);
console.log('widgetOrder présent:', !!widgetOrder);

if (dashboardConfig) {
  try {
    const config = JSON.parse(dashboardConfig);
    console.log('Widgets configurés:', config.widgets?.map(w => w.id) || []);
    
    const priorityWidget = config.widgets?.find(w => w.id === 'daily-priority-actions');
    console.log('Widget daily-priority-actions trouvé:', !!priorityWidget);
    if (priorityWidget) {
      console.log('Type:', priorityWidget.type);
      console.log('Enabled:', priorityWidget.enabled);
      console.log('Position:', priorityWidget.position);
    }
  } catch (error) {
    console.error('Erreur parsing config:', error);
  }
}

// 3. Vérifier les fonctions globales
console.log('\n🔧 3. FONCTIONS GLOBALES');
console.log('getDailyActionsData défini:', typeof getDailyActionsData === 'function');
console.log('DailyPriorityActionsWidget défini:', typeof DailyPriorityActionsWidget === 'function');

// 4. Tester la fonction getDailyActionsData
console.log('\n📊 4. TEST FONCTION DONNÉES');
if (typeof getDailyActionsData === 'function') {
  try {
    const data = getDailyActionsData('daily-priority-actions');
    console.log('Données récupérées:', data.length, 'actions');
    console.log('Première action:', data[0]?.title);
  } catch (error) {
    console.error('Erreur getDailyActionsData:', error);
  }
} else {
  console.log('❌ Fonction getDailyActionsData non trouvée');
}

// 5. Vérifier les éléments DOM
console.log('\n🌐 5. ÉLÉMENTS DOM');
const dashboardElement = document.querySelector('[data-testid="dashboard"]') || 
                        document.querySelector('.dashboard') ||
                        document.querySelector('[class*="dashboard"]');
console.log('Dashboard trouvé:', !!dashboardElement);

const priorityWidgetElement = document.querySelector('[data-widget-id="daily-priority-actions"]') ||
                             document.querySelector('[class*="daily-priority"]') ||
                             document.querySelector('[class*="priority-actions"]');
console.log('Widget dans DOM:', !!priorityWidgetElement);

// 6. Vérifier les erreurs console
console.log('\n🚨 6. ERREURS CONSOLE');
console.log('Vérifiez s\'il y a des erreurs JavaScript dans la console');

// 7. Test de rendu forcé
console.log('\n🎯 7. TEST DE RENDU FORCÉ');
console.log('Tentative de création du widget...');

// Créer un élément de test
const testContainer = document.createElement('div');
testContainer.id = 'test-widget-container';
testContainer.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  z-index: 9999;
  background: white;
  border: 2px solid red;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

testContainer.innerHTML = `
  <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
    <strong>🧪 TEST WIDGET - Actions prioritaires du jour</strong>
    <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: red; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
  </div>
  <div id="widget-test-content">
    <p>Test en cours...</p>
  </div>
`;

document.body.appendChild(testContainer);

// 8. Tentative de rendu du widget
if (typeof DailyPriorityActionsWidget === 'function' && typeof getDailyActionsData === 'function') {
  try {
    const testData = getDailyActionsData('daily-priority-actions');
    console.log('✅ Données de test récupérées:', testData.length, 'actions');
    
    // Créer un élément React de test
    const testWidget = React.createElement(DailyPriorityActionsWidget, {
      data: testData,
      widgetSize: 'normal'
    });
    
    // Essayer de rendre avec ReactDOM
    if (typeof ReactDOM !== 'undefined') {
      ReactDOM.render(testWidget, document.getElementById('widget-test-content'));
      console.log('✅ Widget rendu dans le conteneur de test');
    } else {
      console.log('❌ ReactDOM non disponible');
      document.getElementById('widget-test-content').innerHTML = `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 4px; border: 1px solid #4caf50;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32;">✅ Widget fonctionnel</h3>
          <p style="margin: 0; color: #388e3c;">Le composant DailyPriorityActionsWidget existe et peut recevoir des données.</p>
          <p style="margin: 5px 0 0 0; color: #388e3c;"><strong>Actions trouvées:</strong> ${testData.length}</p>
          <p style="margin: 5px 0 0 0; color: #388e3c;"><strong>Première action:</strong> ${testData[0]?.title}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de rendu:', error);
    document.getElementById('widget-test-content').innerHTML = `
      <div style="background: #ffebee; padding: 15px; border-radius: 4px; border: 1px solid #f44336;">
        <h3 style="margin: 0 0 10px 0; color: #c62828;">❌ Erreur de rendu</h3>
        <p style="margin: 0; color: #d32f2f;">Erreur: ${error.message}</p>
      </div>
    `;
  }
} else {
  console.log('❌ Composants requis non disponibles');
  document.getElementById('widget-test-content').innerHTML = `
    <div style="background: #fff3e0; padding: 15px; border-radius: 4px; border: 1px solid #ff9800;">
      <h3 style="margin: 0 0 10px 0; color: #e65100;">⚠️ Composants manquants</h3>
      <p style="margin: 0; color: #f57c00;">DailyPriorityActionsWidget: ${typeof DailyPriorityActionsWidget}</p>
      <p style="margin: 0; color: #f57c00;">getDailyActionsData: ${typeof getDailyActionsData}</p>
    </div>
  `;
}

// 9. Recommandations
console.log('\n💡 9. RECOMMANDATIONS');

if (!userRole || userRole !== 'vendeur') {
  console.log('🔧 Action 1: Définir le rôle vendeur');
  console.log('localStorage.setItem("userRole", "vendeur");');
}

if (!dashboardConfig) {
  console.log('🔧 Action 2: Créer la configuration dashboard');
  console.log('Exécuter le script force-widget-actions-prioritaires.js');
}

if (typeof getDailyActionsData !== 'function') {
  console.log('🔧 Action 3: Vérifier l\'import des fonctions');
  console.log('La fonction getDailyActionsData n\'est pas disponible');
}

if (typeof DailyPriorityActionsWidget !== 'function') {
  console.log('🔧 Action 4: Vérifier l\'import du composant');
  console.log('Le composant DailyPriorityActionsWidget n\'est pas disponible');
}

console.log('\n🎯 10. SOLUTION RAPIDE');
console.log('Copier-coller ce code pour forcer l\'affichage:');
console.log(`
localStorage.clear();
localStorage.setItem('userRole', 'vendeur');
const forcedConfig = {
  widgets: [
    {
      id: 'daily-priority-actions',
      type: 'daily-priority',
      title: 'Actions prioritaires du jour',
      enabled: true,
      position: 0
    }
  ]
};
localStorage.setItem('dashboardConfig', JSON.stringify(forcedConfig));
window.location.reload();
`);

console.log('\n✅ Diagnostic terminé. Vérifiez le widget de test en haut à droite de l\'écran.'); 