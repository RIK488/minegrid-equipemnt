const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des erreurs de syntaxe dans les widgets...\n');

function fixWidgetSyntax(filePath, description) {
  console.log(`📁 Correction de ${description}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Correction 1: Supprimer les balises div en trop
    const divEndPattern = /<\/div>\s*<\/div>/g;
    if (divEndPattern.test(content)) {
      console.log('   🔧 Suppression des balises div en trop');
      content = content.replace(/<\/div>\s*<\/div>/g, '</div>');
      modified = true;
    }
    
    // Correction 2: Corriger les balises h3 mal fermées
    const h3Pattern = /<\/h3>\s*<\/h3>/g;
    if (h3Pattern.test(content)) {
      console.log('   🔧 Correction des balises h3 mal fermées');
      content = content.replace(/<\/h3>\s*<\/h3>/g, '</h3>');
      modified = true;
    }
    
    // Correction 3: Corriger les balises div mal fermées
    const divPattern = /<div[^>]*>\s*<\/div>/g;
    if (divPattern.test(content)) {
      console.log('   🔧 Correction des balises div mal fermées');
      content = content.replace(/<div[^>]*>\s*<\/div>/g, (match) => {
        // Garder seulement la balise ouvrante si elle a du contenu
        return match;
      });
      modified = true;
    }
    
    // Correction 4: Supprimer les balises fermantes orphelines
    const orphanPattern = /<\/div>\s*<\/div>\s*<\/div>/g;
    if (orphanPattern.test(content)) {
      console.log('   🔧 Suppression des balises fermantes orphelines');
      content = content.replace(/<\/div>\s*<\/div>\s*<\/div>/g, '</div>');
      modified = true;
    }
    
    // Correction 5: Corriger les points-virgule manquants
    const semicolonPattern = /(\w+)\s*\n\s*(\w+)/g;
    if (semicolonPattern.test(content)) {
      console.log('   🔧 Correction des points-virgule manquants');
      content = content.replace(/(\w+)\s*\n\s*(\w+)/g, '$1;\n$2');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('   ✅ Fichier corrigé avec succès');
    } else {
      console.log('   ✅ Aucune correction nécessaire');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur lors de la correction: ${error.message}`);
    return false;
  }
}

// Correction des fichiers principaux
const files = [
  {
    path: 'src/pages/widgets/VendeurWidgets.tsx',
    description: 'VendeurWidgets.tsx'
  },
  {
    path: 'src/pages/EnterpriseDashboardModular.tsx',
    description: 'EnterpriseDashboardModular.tsx'
  }
];

files.forEach(file => {
  fixWidgetSyntax(file.path, file.description);
});

console.log('\n✅ Correction terminée !'); 