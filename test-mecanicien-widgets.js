// Script de test pour le métier Mécanicien
console.log('🔧 Test de la configuration Mécanicien...');

// 1. Vérifier les IDs dans DashboardConfigurator
console.log('📋 IDs Mécanicien dans DashboardConfigurator (CORRIGÉS):');
console.log([
  'interventions-today',    // ✅ Corrigé
  'repair-status',         // ✅ Corrigé
  'parts-inventory',       // ✅ Corrigé
  'technician-workload'    // ✅ Corrigé
]);

// 2. Vérifier les IDs dans MecanicienWidgets.js
console.log('📋 IDs Mécanicien dans MecanicienWidgets.js:');
console.log([
  'interventions-today',
  'repair-status',
  'parts-inventory',
  'technician-workload'
]);

// 3. Vérifier la configuration actuelle
const configMecanicien = localStorage.getItem('enterpriseDashboardConfig_mecanicien');

console.log('\n🔍 Configuration Mécanicien:');
if (configMecanicien) {
  const parsed = JSON.parse(configMecanicien);
  console.log('✅ Configuration chargée');
  console.log('📊 Widgets présents:', parsed.widgets?.map(w => w.id));
  console.log('📍 Layout:', parsed.layout?.lg?.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
} else {
  console.log('❌ Aucune configuration trouvée');
}

// 4. Vérifier le backup
const backupMecanicien = localStorage.getItem('enterpriseDashboardConfig_mecanicien_backup');
console.log('\n💾 Backup Mécanicien:', backupMecanicien ? '✅ Présent' : '❌ Absent');

// 5. Instructions de test
console.log(`
🎯 INSTRUCTIONS DE TEST POUR MÉCANICIEN:

1. TEST DE CONFIGURATION:
   - Allez sur la page de configuration
   - Sélectionnez "Mécanicien / Atelier"
   - Passez à l'étape 2 (Organisation des widgets)
   - Vérifiez que les 4 widgets s'affichent correctement

2. TEST D'AFFICHAGE:
   - Générez le tableau de bord
   - Vérifiez que vous arrivez sur #dashboard-mecanicien-display
   - Vérifiez que les widgets s'affichent avec du contenu

3. TEST DES FONCTIONNALITÉS:
   - Testez l'ajout/suppression de widgets
   - Testez la restauration de position
   - Testez le redimensionnement

4. WIDGETS ATTENDUS:
   - interventions-today (chart)
   - repair-status (list)
   - parts-inventory (chart)
   - technician-workload (chart)

5. COMPARAISON AVEC AUTRES MÉTIERS:
   - Vendeur: 5 widgets
   - Loueur: 5 widgets
   - Mécanicien: 4 widgets ✅
`);

// 6. Fonction utilitaire pour nettoyer la configuration
function nettoyerConfigMecanicien() {
  console.log('🧹 Nettoyage de la configuration Mécanicien...');
  localStorage.removeItem('enterpriseDashboardConfig_mecanicien');
  localStorage.removeItem('enterpriseDashboardConfig_mecanicien_backup');
  console.log('✅ Configuration Mécanicien nettoyée');
}

// 7. Fonction pour forcer la configuration
function forcerConfigMecanicien() {
  console.log('🔧 Forçage de la configuration Mécanicien...');
  const config = {
    metier: 'mecanicien',
    widgets: [
      { id: 'interventions-today', type: 'chart', title: 'Interventions du jour', enabled: true },
      { id: 'repair-status', type: 'list', title: 'État des réparations', enabled: true },
      { id: 'parts-inventory', type: 'chart', title: 'Stock pièces détachées', enabled: true },
      { id: 'technician-workload', type: 'chart', title: 'Charge de travail', enabled: true }
    ],
    layout: {
      lg: [
        { i: 'interventions-today', x: 0, y: 0, w: 6, h: 2 },
        { i: 'repair-status', x: 6, y: 0, w: 6, h: 2 },
        { i: 'parts-inventory', x: 0, y: 2, w: 6, h: 2 },
        { i: 'technician-workload', x: 6, y: 2, w: 6, h: 2 }
      ]
    },
    theme: 'light',
    refreshInterval: 30,
    notifications: true,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('enterpriseDashboardConfig_mecanicien', JSON.stringify(config));
  console.log('✅ Configuration Mécanicien forcée');
}

console.log('✅ Script de test Mécanicien terminé.');
console.log('💡 Utilisez nettoyerConfigMecanicien() pour repartir de zéro');
console.log('💡 Utilisez forcerConfigMecanicien() pour forcer la configuration'); 