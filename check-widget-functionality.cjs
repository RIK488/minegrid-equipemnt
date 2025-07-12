const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fonctionnalités des widgets...\n');

// Fonction pour vérifier un fichier spécifique
function checkWidgetFile(filePath, description) {
  console.log(`📁 Vérification de ${description}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let issues = [];
    
    // Vérifications spécifiques pour les widgets
    const checks = [
      {
        name: 'Import React',
        pattern: /import\s+React/,
        required: true
      },
      {
        name: 'Export par défaut',
        pattern: /export\s+default/,
        required: true
      },
      {
        name: 'Fonctionnalités de déplacement',
        pattern: /handleDragStart|onMouseDown.*drag|draggable/,
        required: true
      },
      {
        name: 'Fonctionnalités de redimensionnement',
        pattern: /handleResize|resize|onMouseDown.*resize/,
        required: true
      },
      {
        name: 'Fonctionnalités de minimisation',
        pattern: /handleMinimize|minimize|isMinimized/,
        required: true
      },
      {
        name: 'Fonctionnalités de plein écran',
        pattern: /handleFullscreen|fullscreen|isFullscreen/,
        required: true
      },
      {
        name: 'Barre d\'outils',
        pattern: /toolbar|Toolbar|BarreOutils/,
        required: true
      },
      {
        name: 'Export CSV',
        pattern: /handleExport|export.*csv|Export.*CSV/,
        required: true
      },
      {
        name: 'Modals',
        pattern: /Modal|modal|showModal/,
        required: true
      },
      {
        name: 'Onglets IA',
        pattern: /AI|ai.*tab|onglet.*ia/,
        required: true
      },
      {
        name: 'Barre de conversion',
        pattern: /conversion.*bar|barre.*conversion/,
        required: true
      }
    ];
    
    checks.forEach(check => {
      const hasFeature = check.pattern.test(content);
      if (check.required && !hasFeature) {
        issues.push(`   ❌ ${check.name} manquant`);
      } else if (hasFeature) {
        console.log(`   ✅ ${check.name} présent`);
      }
    });
    
    // Vérifier les erreurs de syntaxe JSX
    const jsxIssues = [];
    
    // Vérifier les balises non fermées
    const openTags = content.match(/<[^/][^>]*>/g) || [];
    const closeTags = content.match(/<\/[^>]*>/g) || [];
    const selfClosingTags = content.match(/<[^>]*\/>/g) || [];
    
    const actualOpenTags = openTags.filter(tag => !tag.includes('/>'));
    const actualCloseTags = closeTags;
    
    if (actualOpenTags.length !== actualCloseTags.length) {
      jsxIssues.push(`   ❌ Balises JSX non équilibrées: ${actualOpenTags.length} ouvertes, ${actualCloseTags.length} fermées`);
    }
    
    // Vérifier les accolades non fermées
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      jsxIssues.push(`   ❌ Accolades non équilibrées: ${openBraces} ouvertes, ${closeBraces} fermées`);
    }
    
    // Vérifier les parenthèses non fermées
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      jsxIssues.push(`   ❌ Parenthèses non équilibrées: ${openParens} ouvertes, ${closeParens} fermées`);
    }
    
    if (jsxIssues.length > 0) {
      console.log('   ⚠️  Erreurs de syntaxe JSX détectées:');
      jsxIssues.forEach(issue => console.log(issue));
    }
    
    if (issues.length > 0) {
      console.log('   ⚠️  Fonctionnalités manquantes:');
      issues.forEach(issue => console.log(issue));
      return false;
    } else {
      console.log('   ✅ Toutes les fonctionnalités sont présentes');
      return true;
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur de lecture: ${error.message}`);
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
  const result = checkWidgetFile(file.path, file.description);
  if (!result) {
    allGood = false;
  }
  console.log('');
});

// Vérifier les dépendances dans package.json
console.log('📦 Vérification des dépendances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react', 'react-dom', 'lucide-react', '@types/react', '@types/react-dom'
  ];
  
  const missingDeps = [];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length > 0) {
    console.log(`   ❌ Dépendances manquantes: ${missingDeps.join(', ')}`);
    allGood = false;
  } else {
    console.log('   ✅ Toutes les dépendances sont présentes');
  }
} catch (error) {
  console.log(`   ❌ Erreur lors de la vérification des dépendances: ${error.message}`);
  allGood = false;
}

console.log('');

// Vérifier la configuration Vite
console.log('⚙️  Vérification de la configuration Vite...');
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  const hasReactPlugin = viteConfig.includes('@vitejs/plugin-react');
  const hasTypeScript = viteConfig.includes('typescript');
  
  if (!hasReactPlugin) {
    console.log('   ❌ Plugin React manquant dans Vite');
    allGood = false;
  } else {
    console.log('   ✅ Plugin React configuré');
  }
  
  if (!hasTypeScript) {
    console.log('   ⚠️  Support TypeScript non détecté');
  } else {
    console.log('   ✅ Support TypeScript configuré');
  }
} catch (error) {
  console.log(`   ❌ Erreur lors de la vérification de Vite: ${error.message}`);
  allGood = false;
}

console.log('');

if (allGood) {
  console.log('🎉 Toutes les vérifications sont passées avec succès !');
  console.log('✅ Les widgets devraient fonctionner correctement.');
} else {
  console.log('⚠️  Des problèmes ont été détectés.');
  console.log('🔧 Veuillez corriger les problèmes identifiés ci-dessus.');
}

console.log('\n💡 Conseils pour résoudre les problèmes:');
console.log('   1. Vérifiez que tous les imports sont corrects');
console.log('   2. Assurez-vous que les balises JSX sont bien fermées');
console.log('   3. Vérifiez que les fonctionnalités de déplacement/redimensionnement sont implémentées');
console.log('   4. Relancez le serveur de développement après les corrections'); 