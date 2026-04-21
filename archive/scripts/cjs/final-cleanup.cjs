const fs = require('fs');
const path = require('path');

// Lire le fichier
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🧹 Nettoyage final du fichier...');

// 1. Supprimer les doublons de composants
const lines = content.split('\n');
const cleanedLines = [];
const seenComponents = new Set();
let inComponent = false;
let componentStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Détecter le début d'un composant
  if (line.includes('const ') && (line.includes('Widget') || line.includes('Modal') || line.includes('Form'))) {
    const componentName = line.match(/const (\w+)/)?.[1];
    if (componentName && seenComponents.has(componentName)) {
      console.log(`🗑️ Suppression du doublon: ${componentName}`);
      inComponent = true;
      componentStart = i;
      continue;
    } else if (componentName) {
      seenComponents.add(componentName);
    }
  }
  
  // Si on est dans un composant à supprimer, continuer jusqu'à la fin
  if (inComponent) {
    if (line.trim() === '};' || line.trim() === ')' || line.trim() === '})') {
      inComponent = false;
      componentStart = -1;
    }
    continue;
  }
  
  cleanedLines.push(line);
}

content = cleanedLines.join('\n');

// 2. Corriger les erreurs de structure
content = content.replace(/return l\)}/g, 'return l;');
content = content.replace(/return l\)\}/g, 'return l;');

// 3. S'assurer que le composant principal se termine correctement
if (!content.includes('export default EnterpriseDashboard;')) {
  content = content.replace(/}$/, '}\n\nexport default EnterpriseDashboard;');
}

// Écrire le fichier nettoyé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Nettoyage final terminé !'); 