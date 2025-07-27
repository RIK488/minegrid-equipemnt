// Script de test pour comparer les configurations Vendeur et Loueur
console.log('🧪 Comparaison des configurations Vendeur et Loueur...');

// 1. Vérifier les IDs dans DashboardConfigurator
console.log('📋 IDs Vendeur dans DashboardConfigurator (CORRIGÉS):');
console.log([
  'sales-performance-score',  // ✅ Corrigé
  'stock-status',            // ✅ Corrigé
  'sales-evolution',         // ✅ Déjà correct
  'sales-pipeline',          // ✅ Corrigé
  'daily-actions'            // ✅ Déjà correct
]);

console.log('📋 IDs Loueur dans DashboardConfigurator:');
console.log([
  'rental-revenue',
  'equipment-availability',
  'upcoming-rentals',
  'rental-pipeline',
  'daily-actions'
]);

// 2. Vérifier les configurations actuelles
const configVendeur = localStorage.getItem('enterpriseDashboardConfig_vendeur');
const configLoueur = localStorage.getItem('enterpriseDashboardConfig_loueur');

console.log('\n🔍 Configuration Vendeur:');
if (configVendeur) {
  const parsed = JSON.parse(configVendeur);
  console.log('✅ Configuration chargée');
  console.log('📊 Widgets présents:', parsed.widgets?.map(w => w.id));
  console.log('📍 Layout:', parsed.layout?.lg?.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
} else {
  console.log('❌ Aucune configuration trouvée');
}

console.log('\n🔍 Configuration Loueur:');
if (configLoueur) {
  const parsed = JSON.parse(configLoueur);
  console.log('✅ Configuration chargée');
  console.log('📊 Widgets présents:', parsed.widgets?.map(w => w.id));
  console.log('📍 Layout:', parsed.layout?.lg?.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
} else {
  console.log('❌ Aucune configuration trouvée');
}

// 3. Vérifier les backups
const backupVendeur = localStorage.getItem('enterpriseDashboardConfig_vendeur_backup');
const backupLoueur = localStorage.getItem('enterpriseDashboardConfig_loueur_backup');

console.log('\n💾 Backup Vendeur:', backupVendeur ? '✅ Présent' : '❌ Absent');
console.log('💾 Backup Loueur:', backupLoueur ? '✅ Présent' : '❌ Absent');

// 4. Instructions de test
console.log(`
🎯 INSTRUCTIONS DE TEST DE L'ÉTAPE 2:

1. TEST VENDEUR (maintenant corrigé):
   - Allez sur la page de configuration
   - Sélectionnez "Vendeur d'engins"
   - Passez à l'étape 2 (Organisation des widgets)
   - Les widgets devraient maintenant s'afficher correctement
   - Testez l'ajout/suppression de widgets

2. TEST LOUEUR (déjà fonctionnel):
   - Sélectionnez "Loueur d'engins"
   - Passez à l'étape 2
   - Vérifiez que l'organisation fonctionne bien

3. COMPARAISON:
   - Les deux métiers devraient maintenant avoir le même comportement
   - L'étape 2 devrait être bien organisée pour les deux
   - Les widgets devraient s'afficher correctement

4. TEST DE RESTAURATION:
   - Supprimez un widget dans chaque métier
   - Ajoutez-le à nouveau
   - Vérifiez qu'il reprend sa position d'origine
`);

// 5. Fonction utilitaire pour nettoyer les configurations
function nettoyerConfigurations() {
  console.log('🧹 Nettoyage des configurations...');
  localStorage.removeItem('enterpriseDashboardConfig_vendeur');
  localStorage.removeItem('enterpriseDashboardConfig_loueur');
  localStorage.removeItem('enterpriseDashboardConfig_vendeur_backup');
  localStorage.removeItem('enterpriseDashboardConfig_loueur_backup');
  console.log('✅ Configurations nettoyées');
}

console.log('✅ Script de comparaison terminé.');
console.log('💡 Utilisez nettoyerConfigurations() pour repartir de zéro'); 