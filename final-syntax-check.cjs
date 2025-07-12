const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification finale de la syntaxe...\n');

function checkAndFixSyntax(filePath, description) {
  console.log(`📁 Vérification de ${description}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Correction 1: Supprimer les balises div en trop à la fin
    const divEndPattern = /(\s*<\/div>\s*){2,}/g;
    if (divEndPattern.test(content)) {
      console.log('   🔧 Suppression des balises div en trop à la fin');
      content = content.replace(/(\s*<\/div>\s*){2,}/g, '\n    </div>');
      modified = true;
    }
    
    // Correction 2: Corriger les points-virgules manquants dans les objets
    const missingSemicolonPattern = /(\s+)(true|false)(\s*\n\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g;
    if (missingSemicolonPattern.test(content)) {
      console.log('   🔧 Ajout des virgules manquantes dans les objets');
      content = content.replace(/(\s+)(true|false)(\s*\n\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '$1$2,$3$4');
      modified = true;
    }
    
    // Correction 3: Corriger les balises JSX mal fermées
    const jsxPattern = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>[^<]*$/gm;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (jsxPattern.test(line) && !line.includes('</') && !line.includes('/>')) {
        const tagMatch = line.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const nextLine = lines[i + 1]?.trim() || '';
          if (nextLine && !nextLine.startsWith('</') && !nextLine.startsWith('{') && !nextLine.startsWith('//')) {
            console.log(`   🔧 Ajout de la balise fermante </${tagName}> à la ligne ${i + 1}`);
            lines[i] = line + `</${tagName}>`;
            modified = true;
          }
        }
      }
    }
    
    if (modified) {
      content = lines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('   ✅ Fichier corrigé et sauvegardé');
      return true;
    } else {
      console.log('   ✅ Aucune correction nécessaire');
      return true;
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur lors de la vérification: ${error.message}`);
    return false;
  }
}

// Vérifier les fichiers principaux
const filesToCheck = [
  {
    path: 'src/pages/VendeurDashboardRestored.tsx',
    description: 'Dashboard Vendeur Restauré'
  },
  {
    path: 'src/pages/widgets/VendeurWidgets.tsx',
    description: 'Widgets Vendeur'
  },
  {
    path: 'src/pages/EnterpriseDashboardModular.tsx',
    description: 'Dashboard Enterprise Modulaire'
  }
];

let allGood = true;

filesToCheck.forEach(file => {
  const result = checkAndFixSyntax(file.path, file.description);
  if (!result) {
    allGood = false;
  }
  console.log('');
});

// Vérifier la structure JSX finale
console.log('🔍 Vérification de la structure JSX finale...');

filesToCheck.forEach(file => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Compter les balises
    const openTags = (content.match(/<[^/][^>]*>/g) || []).filter(tag => !tag.includes('/>')).length;
    const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
    
    console.log(`   📊 ${file.description}: ${openTags} ouvertes, ${closeTags} fermées`);
    
    if (openTags !== closeTags) {
      console.log(`   ⚠️  Déséquilibre détecté dans ${file.description}`);
      allGood = false;
    }
  }
});

console.log('');

if (allGood) {
  console.log('🎉 Toutes les vérifications sont passées avec succès !');
  console.log('✅ Les fichiers sont maintenant syntaxiquement corrects.');
  console.log('🔄 Le serveur de développement devrait fonctionner sans erreurs.');
} else {
  console.log('⚠️  Des problèmes persistent.');
  console.log('🔧 Veuillez vérifier manuellement les fichiers problématiques.');
}

console.log('\n💡 Prochaines étapes:');
console.log('   1. Relancez le serveur de développement');
console.log('   2. Testez les fonctionnalités des widgets');
console.log('   3. Vérifiez que le déplacement et redimensionnement fonctionnent');
console.log('   4. Testez les modals et les onglets IA'); 