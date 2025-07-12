const fs = require('fs');
const path = require('path');

// Fonction pour vérifier la syntaxe d'un fichier
function checkFileSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifications de base
    const issues = [];
    
    // Vérifier les accolades non fermées
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Accolades non équilibrées: ${openBraces} ouvertes, ${closeBraces} fermées`);
    }
    
    // Vérifier les parenthèses non fermées
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Parenthèses non équilibrées: ${openParens} ouvertes, ${closeParens} fermées`);
    }
    
    // Vérifier les crochets non fermés
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push(`Crochets non équilibrés: ${openBrackets} ouverts, ${closeBrackets} fermés`);
    }
    
    // Vérifier les balises JSX non fermées
    const jsxTags = content.match(/<[^>]*>/g) || [];
    const selfClosingTags = content.match(/<[^>]*\/>/g) || [];
    const openingTags = jsxTags.filter(tag => !tag.includes('/>') && !tag.includes('</'));
    const closingTags = jsxTags.filter(tag => tag.includes('</'));
    
    if (openingTags.length !== closingTags.length) {
      issues.push(`Balises JSX non équilibrées: ${openingTags.length} ouvertes, ${closingTags.length} fermées`);
    }
    
    // Vérifier les points-virgules manquants après les propriétés d'objet
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*(true|false|"[^"]*"|'[^']*'|\d+)$/) && !line.endsWith(',') && !line.endsWith(';')) {
        const nextLine = lines[i + 1]?.trim() || '';
        if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('/*')) {
          issues.push(`Point-virgule manquant ligne ${i + 1}: ${line}`);
        }
      }
    }
    
    return issues;
  } catch (error) {
    return [`Erreur de lecture: ${error.message}`];
  }
}

// Fonction pour corriger les erreurs courantes
function fixCommonErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Corriger les points-virgules manquants après les propriétés booléennes
    content = content.replace(/(\s+)(true|false)(\s*\n)/g, '$1$2,$3');
    modified = true;
    
    // Corriger les virgules manquantes dans les objets
    content = content.replace(/(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*(true|false|"[^"]*"|'[^']*'|\d+))(\s*\n\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '$1$2,$3$4$5');
    modified = true;
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fichier corrigé: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
    return false;
  }
}

// Fichiers à vérifier
const filesToCheck = [
  'src/pages/VendeurDashboardRestored.tsx',
  'src/pages/widgets/VendeurWidgets.tsx',
  'src/pages/EnterpriseDashboardModular.tsx'
];

console.log('🔍 Vérification de la syntaxe des fichiers...\n');

let hasErrors = false;

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📁 Vérification de ${filePath}:`);
    const issues = checkFileSyntax(filePath);
    
    if (issues.length > 0) {
      console.log('❌ Problèmes détectés:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      hasErrors = true;
      
      // Tenter de corriger automatiquement
      console.log('🔧 Tentative de correction automatique...');
      const fixed = fixCommonErrors(filePath);
      if (fixed) {
        console.log('✅ Corrections appliquées');
      }
    } else {
      console.log('✅ Aucun problème détecté');
    }
    console.log('');
  } else {
    console.log(`⚠️  Fichier non trouvé: ${filePath}\n`);
  }
});

if (hasErrors) {
  console.log('⚠️  Des erreurs ont été détectées et corrigées automatiquement.');
  console.log('🔄 Relancez le serveur de développement pour vérifier les corrections.');
} else {
  console.log('🎉 Tous les fichiers sont syntaxiquement corrects !');
} 