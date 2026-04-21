const fs = require('fs');
const path = require('path');

// Lire le fichier
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Correction des erreurs critiques...');

// 1. Corriger la fermeture du WidgetComponent (ligne 1532)
content = content.replace(
  /          }\)\}\)\(\n        <\/div>\n      <\/div>\n    <\/div>\n  \);/g,
  `          })()}
        </div>
      </div>
    </div>
  );
};`
);

// 2. Corriger la fermeture du useEffect (ligne 2013)
content = content.replace(
  /    setLoading\(false\);\n  }, \[\]\);/g,
  `    setLoading(false);
  }, []);`
);

// 3. Supprimer les doublons de composants
const lines = content.split('\n');
const cleanedLines = [];
const seenComponents = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Détecter les déclarations de composants
  if (line.includes('const ') && (line.includes('Widget') || line.includes('Modal'))) {
    const componentName = line.match(/const (\w+)/)?.[1];
    if (componentName && seenComponents.has(componentName)) {
      console.log(`🗑️ Suppression du doublon: ${componentName}`);
      // Trouver la fin du composant
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('const ') && !lines[j].startsWith('export ')) {
        j++;
      }
      i = j - 1;
      continue;
    } else if (componentName) {
      seenComponents.add(componentName);
    }
  }
  
  cleanedLines.push(line);
}

content = cleanedLines.join('\n');

// Écrire le fichier corrigé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Corrections critiques appliquées !'); 