// =====================================================
// SOLUTION TEMPORAIRE - DÉSACTIVATION DES APPELS AUX TABLES MANQUANTES
// =====================================================

const fs = require('fs');
const path = require('path');

console.log('🔧 Application de la solution temporaire...\n');

// Fonction pour commenter les appels aux tables manquantes
function commentTableCalls(filePath, tableNames) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    tableNames.forEach(tableName => {
      // Commenter les appels à getMessages() et getOffers()
      const patterns = [
        new RegExp(`(\\s*)(const\\s+${tableName}\\s*=\\s*await\\s+get${tableName.charAt(0).toUpperCase() + tableName.slice(1)}\\(\\);)`, 'g'),
        new RegExp(`(\\s*)(await\\s+get${tableName.charAt(0).toUpperCase() + tableName.slice(1)}\\(\\);)`, 'g'),
        new RegExp(`(\\s*)(get${tableName.charAt(0).toUpperCase() + tableName.slice(1)}\\(\\);)`, 'g')
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, '$1// TEMPORAIRE: $2');
          modified = true;
        }
      });
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} - Appels aux tables commentés`);
    } else {
      console.log(`ℹ️  ${filePath} - Aucun appel à commenter`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur sur ${filePath}:`, error.message);
  }
}

// Liste des fichiers à modifier
const filesToModify = [
  'src/components/dashboard/widgets/SalesPipelineWidget.tsx',
  'src/components/dashboard/widgets/DailyActionsPriorityWidget.tsx',
  'src/components/dashboard/widgets/StockStatusWidget.tsx'
];

// Tables à désactiver temporairement
const tablesToDisable = ['messages', 'offers'];

console.log('📋 Modification des fichiers...\n');

filesToModify.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    commentTableCalls(filePath, tablesToDisable);
  } else {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
  }
});

console.log('\n🎉 SOLUTION TEMPORAIRE APPLIQUÉE !');
console.log('\n📝 Prochaines étapes :');
console.log('   1. Rechargez votre application');
console.log('   2. Les erreurs 404 devraient disparaître');
console.log('   3. Les widgets utiliseront des données mockées');
console.log('   4. Exécutez le script SQL pour créer les tables');
console.log('   5. Décommentez les appels pour utiliser les vraies données');

// Créer un fichier de restauration
const restoreScript = `
// =====================================================
// SCRIPT DE RESTAURATION - RÉACTIVATION DES APPELS
// =====================================================

// Après avoir exécuté le script SQL, utilisez ce script pour restaurer les appels :

const fs = require('fs');

function restoreTableCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\/\/ TEMPORAIRE: /g, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Restauré:', filePath);
}

// Restaurer tous les fichiers
[
  'src/components/dashboard/widgets/SalesPipelineWidget.tsx',
  'src/components/dashboard/widgets/DailyActionsPriorityWidget.tsx',
  'src/components/dashboard/widgets/StockStatusWidget.tsx'
].forEach(restoreTableCalls);
`;

fs.writeFileSync('RESTAURATION_APRES_SQL.js', restoreScript);
console.log('\n📄 Fichier de restauration créé: RESTAURATION_APRES_SQL.js'); 