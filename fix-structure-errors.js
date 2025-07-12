const fs = require('fs');
const path = require('path');

// Lire le fichier
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Corrections à appliquer
const corrections = [
  // Correction 1: Fermer correctement le composant WidgetComponent
  {
    search: /          \}\)\\(\\)\}/g,
    replace: '          })()}\n        </div>\n      </div>\n    </div>\n  );'
  },
  
  // Correction 2: Fermer correctement le useEffect
  {
    search: /    setLoading\\(false\\);\n  }, \\[\\]\\);/g,
    replace: '    setLoading(false);\n  }, []);'
  },
  
  // Correction 3: Fermer correctement le composant SalesPipelineWidget
  {
    search: /      \\}\n    \\}\n  \\};\n\nexport default EnterpriseDashboard;/g,
    replace: '      )}\n    </div>\n  );\n};\n\nexport default EnterpriseDashboard;'
  }
];

// Appliquer les corrections
corrections.forEach(correction => {
  content = content.replace(correction.search, correction.replace);
});

// Écrire le fichier corrigé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Corrections de structure appliquées avec succès !'); 