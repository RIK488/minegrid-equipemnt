const fs = require('fs');
const path = require('path');

// Lire le fichier
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🧹 Nettoyage du fichier EnterpriseDashboard.tsx...');

// 1. Supprimer les doublons de composants
const lines = content.split('\n');
const cleanedLines = [];
const seenComponents = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Détecter les déclarations de composants
  if (line.includes('const ') && (line.includes('Widget') || line.includes('Modal'))) {
    const componentName = line.match(/const (\w+)/)?.[1];
    if (componentName && seenComponents.has(componentName)) {
      // Supprimer ce composant dupliqué
      console.log(`🗑️ Suppression du doublon: ${componentName}`);
      // Trouver la fin du composant (jusqu'à la prochaine déclaration ou fin de fichier)
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('const ') && !lines[j].startsWith('export ')) {
        j++;
      }
      i = j - 1; // Skip to next component
      continue;
    } else if (componentName) {
      seenComponents.add(componentName);
    }
  }
  
  cleanedLines.push(line);
}

content = cleanedLines.join('\n');

// 2. Corriger la fermeture du WidgetComponent
content = content.replace(
  /          }\)\}\)\(\n        <\/div>\n      <\/div>\n    <\/div>\n  \);/g,
  `          })()}
        </div>
      </div>
    </div>
  );
};`
);

// 3. Corriger la fermeture du useEffect
content = content.replace(
  /    setLoading\(false\);\n  }, \[\]\);/g,
  `    setLoading(false);
  }, []);`
);

// 4. S'assurer que le fichier se termine correctement
if (!content.trim().endsWith('export default EnterpriseDashboard;')) {
  content = content.replace(
    /export default EnterpriseDashboard;?\s*$/,
    'export default EnterpriseDashboard;'
  );
}

// Écrire le fichier nettoyé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Nettoyage terminé !');
console.log('📝 Vérifiez maintenant les erreurs de linter...'); 