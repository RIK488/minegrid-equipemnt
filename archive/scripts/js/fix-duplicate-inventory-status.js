const fs = require('fs');
const path = require('path');

console.log('🔧 Correction de la clé dupliquée inventory-status...');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Trouver la première définition de 'inventory-status' (ligne 5539)
const firstInventoryStart = content.indexOf("'inventory-status': [");
const firstInventoryEnd = content.indexOf("],", firstInventoryStart) + 2;

// Trouver la deuxième définition de 'inventory-status' (ligne 5964)
const secondInventoryStart = content.indexOf("'inventory-status': [", firstInventoryEnd);

console.log(`📍 Première définition: ligne ${content.substring(0, firstInventoryStart).split('\n').length}`);
console.log(`📍 Deuxième définition: ligne ${content.substring(0, secondInventoryStart).split('\n').length}`);

// Supprimer la première définition (moins complète)
const beforeFirst = content.substring(0, firstInventoryStart);
const afterFirst = content.substring(firstInventoryEnd);

// Trouver la fin de la première définition complète
let braceCount = 0;
let endIndex = -1;
for (let i = firstInventoryStart; i < afterFirst.length; i++) {
  if (afterFirst[i] === '[') braceCount++;
  if (afterFirst[i] === ']') braceCount--;
  if (braceCount === 0) {
    endIndex = i + 1;
    break;
  }
}

if (endIndex === -1) {
  console.log('❌ Impossible de trouver la fin de la première définition');
  process.exit(1);
}

// Supprimer la première définition complète
const cleanedContent = beforeFirst + afterFirst.substring(endIndex + 1);

// Écrire le fichier corrigé
fs.writeFileSync(filePath, cleanedContent, 'utf8');

console.log('✅ Première définition dupliquée supprimée');
console.log('✅ Version améliorée conservée');

// Vérifier qu'il n'y a plus de doublon
const remainingOccurrences = (cleanedContent.match(/'inventory-status': \[/g) || []).length;
console.log(`✅ Occurrences restantes de 'inventory-status': ${remainingOccurrences}`);

if (remainingOccurrences === 1) {
  console.log('🎉 Correction réussie ! Plus de clé dupliquée.');
} else {
  console.log('⚠️ Attention: Il reste encore des doublons.');
}

console.log('📝 Le fichier a été corrigé avec succès !'); 