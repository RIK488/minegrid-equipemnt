const fs = require('fs');
const path = require('path');

console.log('🔧 Suppression de la définition locale du composant SalesEvolutionWidgetEnriched...');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Trouver le début et la fin du composant local
const startPattern = /\/\/ Composant spécialisé pour l'Évolution des Ventes\s*\nconst SalesEvolutionWidgetEnriched = \(\{ data = \[\] \}: \{ data\?\: any\[\] \}\) => \{/;
const endPattern = /^\};$/m;

const startMatch = content.match(startPattern);
if (!startMatch) {
  console.log('❌ Début du composant local non trouvé');
  process.exit(1);
}

const startIndex = startMatch.index;
console.log(`📍 Début trouvé à l'index: ${startIndex}`);

// Chercher la fin du composant (le }; qui ferme le composant)
let braceCount = 0;
let endIndex = -1;
let inComponent = false;

for (let i = startIndex; i < content.length; i++) {
  const char = content[i];
  
  if (char === '{') {
    if (!inComponent) {
      inComponent = true;
    }
    braceCount++;
  } else if (char === '}') {
    braceCount--;
    if (inComponent && braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

if (endIndex === -1) {
  console.log('❌ Fin du composant local non trouvée');
  process.exit(1);
}

console.log(`📍 Fin trouvée à l'index: ${endIndex}`);

// Supprimer le composant local
const newContent = content.substring(0, startIndex) + 
                  '// Composant SalesEvolutionWidgetEnriched importé depuis le fichier séparé\n' +
                  content.substring(endIndex);

// Écrire le fichier modifié
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Définition locale du composant supprimée avec succès');
console.log(`📊 Taille du fichier réduite de ${content.length - newContent.length} caractères`); 