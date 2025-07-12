const fs = require('fs');
const path = require('path');

// Lire le fichier modulaire
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboardModular.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Widgets à supprimer (définitions locales)
const widgetsToRemove = [
  'SalesPerformanceScoreWidget',
  'MetricWidget', 
  'PerformanceScoreWidget'
];

console.log('Suppression des widgets dupliqués...');

// Supprimer chaque widget
widgetsToRemove.forEach(widgetName => {
  console.log(`Suppression de ${widgetName}...`);
  
  // Pattern pour trouver le début du widget
  const startPattern = new RegExp(`const ${widgetName} = \\([^)]*\\) => \\{[\\s\\S]*?`, 'g');
  const matches = content.match(startPattern);
  
  if (matches) {
    console.log(`Trouvé ${matches.length} occurrence(s) de ${widgetName}`);
    
    // Supprimer la première occurrence (définition locale)
    content = content.replace(startPattern, '');
    
    // Nettoyer les lignes vides multiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  }
});

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fichier modulaire mis à jour avec succès !'); 