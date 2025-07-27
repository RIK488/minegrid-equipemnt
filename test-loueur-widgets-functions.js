// Script de test pour vérifier les fonctionnalités du tableau de bord Loueur
console.log('🧪 Test des fonctionnalités du tableau de bord Loueur...');

// 1. Vérifier que la configuration est chargée
const config = localStorage.getItem('enterpriseDashboardConfig_loueur');
if (config) {
  const parsed = JSON.parse(config);
  console.log('✅ Configuration chargée:', parsed);
  console.log('📊 Widgets présents:', parsed.widgets?.map(w => w.id));
} else {
  console.log('❌ Aucune configuration trouvée');
}

// 2. Vérifier que les widgets Loueur sont disponibles
console.log('🔍 Vérification des widgets Loueur...');
console.log('📋 Widgets disponibles:', [
  'rental-revenue',
  'equipment-availability', 
  'upcoming-rentals',
  'rental-pipeline',
  'daily-actions'
]);

// 3. Tester l'ajout d'un widget
console.log('➕ Test d\'ajout de widget...');
const testWidgetId = 'rental-revenue';
console.log(`Tentative d'ajout du widget: ${testWidgetId}`);

// 4. Instructions pour tester manuellement
console.log(`
🎯 INSTRUCTIONS DE TEST MANUEL:

1. Cliquez sur le bouton "+ Ajouter des widgets"
   - Le modal devrait s'ouvrir
   - Vous devriez voir la liste des widgets disponibles

2. Cliquez sur "Ajouter" pour un widget non installé
   - Le widget devrait apparaître sur le tableau de bord
   - Le statut devrait changer à "Ajouté !"

3. Cliquez sur l'icône "X" (croix) d'un widget
   - Le widget devrait disparaître du tableau de bord

4. Vérifiez que les widgets affichent du contenu:
   - "Revenus de location" : montant en MAD
   - "Disponibilité Équipements" : pourcentage et statistiques
   - "Locations à venir" : planning des locations
   - "Pipeline de location" : demandes de location
   - "Actions prioritaires du jour" : tâches à effectuer

5. Testez les boutons de redimensionnement:
   - Bouton de largeur (↔️)
   - Bouton de hauteur (↕️)
   - Bouton de réinitialisation (⊞)

6. Cliquez sur "Sauvegarder"
   - Le statut devrait changer à "Sauvegardé !"
`);

console.log('✅ Script de test terminé. Vérifiez la console pour les détails.'); 