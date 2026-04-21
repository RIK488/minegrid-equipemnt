// Script de test final pour le widget Actions Commerciales Prioritaires
console.log('🎯 TEST FINAL DU WIDGET ACTIONS COMMERCIALES PRIORITAIRES');
console.log('========================================================');

// Vérifier que le fichier existe
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/pages/EnterpriseDashboard.tsx',
  'src/pages/DailyActionsWidgetFixed.tsx',
  'src/pages/widgets/VendeurWidgets.tsx'
];

console.log('\n📁 Vérification des fichiers :');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? '(EXISTE)' : '(MANQUANT)'}`);
});

// Vérifier l'import dans EnterpriseDashboard.tsx
const dashboardContent = fs.readFileSync('src/pages/EnterpriseDashboard.tsx', 'utf8');
const hasImport = dashboardContent.includes("import { DailyActionsPriorityWidget } from './DailyActionsWidgetFixed'");
const hasWidgetConfig = dashboardContent.includes("id: 'daily-actions'");
const hasRenderCase = dashboardContent.includes("case 'daily-actions'");

console.log('\n🔍 Vérification de la configuration :');
console.log(`${hasImport ? '✅' : '❌'} Import du composant`);
console.log(`${hasWidgetConfig ? '✅' : '❌'} Configuration du widget`);
console.log(`${hasRenderCase ? '✅' : '❌'} Cas de rendu`);

// Vérifier le contenu du widget
const widgetContent = fs.readFileSync('src/pages/DailyActionsWidgetFixed.tsx', 'utf8');
const hasDefaultActions = widgetContent.includes('defaultActions');
const hasContactHandlers = widgetContent.includes('handleCall');
const hasActionHandlers = widgetContent.includes('handleMarkAsDone');

console.log('\n🎨 Vérification du composant :');
console.log(`${hasDefaultActions ? '✅' : '❌'} Données par défaut`);
console.log(`${hasContactHandlers ? '✅' : '❌'} Gestionnaires de contact`);
console.log(`${hasActionHandlers ? '✅' : '❌'} Gestionnaires d'actions`);

console.log('\n🎉 RÉSUMÉ :');
if (hasImport && hasWidgetConfig && hasRenderCase && hasDefaultActions && hasContactHandlers && hasActionHandlers) {
  console.log('✅ TOUT EST CONFIGURÉ CORRECTEMENT !');
  console.log('\n📋 Instructions pour tester :');
  console.log('1. Va sur http://localhost:5176/');
  console.log('2. Connecte-toi au dashboard vendeur d\'engins');
  console.log('3. Le widget "Actions Commerciales Prioritaires" devrait apparaître en haut');
  console.log('4. Tu devrais voir 3 actions avec contacts et boutons d\'action');
  console.log('5. Clique sur les boutons 📞, 📧, 💬 pour tester les contacts');
  console.log('6. Clique sur "✅ Fait" ou "⏰ Reporter" pour tester les actions');
} else {
  console.log('❌ IL Y A ENCORE DES PROBLÈMES À CORRIGER');
  console.log('\n🔧 Problèmes détectés :');
  if (!hasImport) console.log('- Import manquant');
  if (!hasWidgetConfig) console.log('- Configuration du widget manquante');
  if (!hasRenderCase) console.log('- Cas de rendu manquant');
  if (!hasDefaultActions) console.log('- Données par défaut manquantes');
  if (!hasContactHandlers) console.log('- Gestionnaires de contact manquants');
  if (!hasActionHandlers) console.log('- Gestionnaires d\'actions manquants');
} 