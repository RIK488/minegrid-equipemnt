// Script de test pour vérifier la restauration des positions des widgets
console.log('🧪 Test de restauration des positions des widgets...');

// 1. Vérifier la configuration actuelle
const config = localStorage.getItem('enterpriseDashboardConfig_loueur');
if (config) {
  const parsed = JSON.parse(config);
  console.log('✅ Configuration actuelle:', parsed);
  console.log('📊 Widgets présents:', parsed.widgets?.map(w => w.id));
  console.log('📍 Positions actuelles:', parsed.layout?.lg?.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
} else {
  console.log('❌ Aucune configuration trouvée');
}

// 2. Vérifier le backup des positions
const backup = localStorage.getItem('enterpriseDashboardConfig_loueur_backup');
if (backup) {
  const backupParsed = JSON.parse(backup);
  console.log('💾 Backup des positions:', backupParsed);
  console.log('📍 Positions sauvegardées:', backupParsed.layout?.lg?.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
} else {
  console.log('📝 Aucun backup trouvé (normal si aucun widget n\'a été supprimé)');
}

// 3. Instructions pour tester la restauration
console.log(`
🎯 INSTRUCTIONS DE TEST DE RESTAURATION:

1. Notez la position actuelle d'un widget (x, y, w, h)
   - Ouvrez la console et regardez les "Positions actuelles"

2. Supprimez un widget en cliquant sur l'icône "X"
   - Vérifiez dans la console que la position est sauvegardée
   - Vous devriez voir "Position sauvegardée pour restauration"

3. Ajoutez le même widget via le modal "Ajouter des widgets"
   - Vérifiez dans la console que la position originale est restaurée
   - Vous devriez voir "Position originale restaurée pour [widget-id]"

4. Vérifiez que le widget reprend sa place d'origine
   - Le widget devrait apparaître exactement où il était avant

5. Testez avec plusieurs widgets
   - Supprimez plusieurs widgets dans différents ordres
   - Ajoutez-les dans un ordre différent
   - Chaque widget devrait reprendre sa position originale

6. Vérifiez le nettoyage du backup
   - Après ajout réussi, le backup pour ce widget devrait être nettoyé
   - Vous devriez voir "Backup nettoyé pour [widget-id]"
`);

// 4. Fonction utilitaire pour afficher les positions
function afficherPositions() {
  const config = localStorage.getItem('enterpriseDashboardConfig_loueur');
  if (config) {
    const parsed = JSON.parse(config);
    console.log('📍 Positions actuelles:');
    parsed.layout?.lg?.forEach(l => {
      console.log(`  ${l.i}: x=${l.x}, y=${l.y}, w=${l.w}, h=${l.h}`);
    });
  }
}

// 5. Fonction pour simuler une suppression (pour test)
function simulerSuppression(widgetId) {
  console.log(`🧪 Simulation de suppression pour ${widgetId}...`);
  const config = localStorage.getItem('enterpriseDashboardConfig_loueur');
  if (config) {
    const parsed = JSON.parse(config);
    const layoutItem = parsed.layout?.lg?.find(l => l.i === widgetId);
    if (layoutItem) {
      console.log('Position à sauvegarder:', layoutItem);
    } else {
      console.log('Widget non trouvé dans le layout');
    }
  }
}

console.log('✅ Script de test terminé.');
console.log('💡 Utilisez afficherPositions() pour voir les positions actuelles');
console.log('💡 Utilisez simulerSuppression("widget-id") pour tester une suppression'); 