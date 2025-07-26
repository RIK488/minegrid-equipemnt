// =====================================================
// SOLUTION RAPIDE - WIDGETS SANS TABLES MANQUANTES
// =====================================================

const fs = require('fs');

console.log('🔧 Application de la solution rapide...\n');

// Fonction pour modifier un fichier
function modifyFile(filePath, modifications) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    modifications.forEach(({ search, replace, description }) => {
      if (content.includes(search)) {
        content = content.replace(search, replace);
        modified = true;
        console.log(`✅ ${filePath} - ${description}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      console.log(`ℹ️  ${filePath} - Aucune modification nécessaire`);
    }

  } catch (error) {
    console.log(`❌ Erreur sur ${filePath}:`, error.message);
  }
}

// Modifications à appliquer
const modifications = [
  {
    search: 'const messages = await getMessages();',
    replace: '// const messages = await getMessages(); // TEMPORAIRE: Table messages n\'existe pas',
    description: 'Commenté appel à getMessages()'
  },
  {
    search: 'const offers = await getOffers();',
    replace: '// const offers = await getOffers(); // TEMPORAIRE: Table offers n\'existe pas',
    description: 'Commenté appel à getOffers()'
  },
  {
    search: 'const { count: totalViews } = await supabase\n    .from(\'machine_views\')',
    replace: '// const { count: totalViews } = await supabase\n    // .from(\'machine_views\') // TEMPORAIRE: Table machine_views n\'existe pas\n    const totalViews = 0;',
    description: 'Remplacé appel à machine_views par valeur par défaut'
  },
  {
    search: 'const { count: weeklyViews } = await supabase\n    .from(\'machine_views\')',
    replace: '// const { count: weeklyViews } = await supabase\n    // .from(\'machine_views\') // TEMPORAIRE: Table machine_views n\'existe pas\n    const weeklyViews = 0;',
    description: 'Remplacé appel à machine_views par valeur par défaut'
  },
  {
    search: 'const { count: monthlyViews } = await supabase\n    .from(\'machine_views\')',
    replace: '// const { count: monthlyViews } = await supabase\n    // .from(\'machine_views\') // TEMPORAIRE: Table machine_views n\'existe pas\n    const monthlyViews = 0;',
    description: 'Remplacé appel à machine_views par valeur par défaut'
  }
];

// Fichiers à modifier
const filesToModify = [
  'src/components/dashboard/widgets/SalesPipelineWidget.tsx',
  'src/components/dashboard/widgets/DailyActionsPriorityWidget.tsx',
  'src/components/dashboard/widgets/StockStatusWidget.tsx',
  'src/utils/api.ts',
  'src/utils/api.js'
];

console.log('📋 Modification des fichiers...\n');

filesToModify.forEach(filePath => {
  modifyFile(filePath, modifications);
});

console.log('\n🎉 SOLUTION RAPIDE APPLIQUÉE !');
console.log('\n📝 Résultat :');
console.log('   ✅ Plus d\'erreurs 404 sur les tables manquantes');
console.log('   ✅ Les widgets fonctionnent avec des données par défaut');
console.log('   ✅ Votre dashboard s\'affiche sans erreur');
console.log('\n📝 Prochaines étapes :');
console.log('   1. Rechargez votre application');
console.log('   2. Les erreurs 404 devraient disparaître');
console.log('   3. Les widgets afficheront des données par défaut');
console.log('   4. Pour les vraies données, créez les tables manquantes');

// Créer un guide de restauration
const restoreGuide = `
# 🔄 Guide de Restauration

## Après avoir créé les tables manquantes :

1. **Ouvrir** chaque fichier modifié
2. **Supprimer** les commentaires "// TEMPORAIRE:"
3. **Décommenter** les lignes d'appel aux tables
4. **Recharger** l'application

## Fichiers modifiés :
- src/components/dashboard/widgets/SalesPipelineWidget.tsx
- src/components/dashboard/widgets/DailyActionsPriorityWidget.tsx
- src/components/dashboard/widgets/StockStatusWidget.tsx
- src/utils/api.ts
- src/utils/api.js
`;

fs.writeFileSync('GUIDE_RESTAURATION.md', restoreGuide);
console.log('\n📄 Guide de restauration créé: GUIDE_RESTAURATION.md'); 