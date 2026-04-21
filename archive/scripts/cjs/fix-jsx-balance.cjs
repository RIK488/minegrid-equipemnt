const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des balises JSX non équilibrées...\n');

function fixJSXBalance(filePath, description) {
  console.log(`📁 Correction de ${description}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Compter les balises avant correction
    const openTagsBefore = (content.match(/<[^/][^>]*>/g) || []).filter(tag => !tag.includes('/>')).length;
    const closeTagsBefore = (content.match(/<\/[^>]*>/g) || []).length;
    
    console.log(`   📊 Avant: ${openTagsBefore} ouvertes, ${closeTagsBefore} fermées`);
    
    // Correction 1: Fermer les balises div manquantes
    const divPattern = /<div[^>]*>/g;
    const divMatches = content.match(divPattern) || [];
    const divClosePattern = /<\/div>/g;
    const divCloseMatches = content.match(divClosePattern) || [];
    
    if (divMatches.length > divCloseMatches.length) {
      const missingDivs = divMatches.length - divCloseMatches.length;
      console.log(`   🔧 Ajout de ${missingDivs} balises </div> manquantes`);
      
      // Ajouter les balises div fermantes manquantes à la fin du contenu JSX
      const lastJSXIndex = content.lastIndexOf('</div>');
      if (lastJSXIndex !== -1) {
        const insertPosition = lastJSXIndex + 6; // Après </div>
        const divsToAdd = '</div>'.repeat(missingDivs);
        content = content.slice(0, insertPosition) + divsToAdd + content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Correction 2: Fermer les balises span manquantes
    const spanPattern = /<span[^>]*>/g;
    const spanMatches = content.match(spanPattern) || [];
    const spanClosePattern = /<\/span>/g;
    const spanCloseMatches = content.match(spanClosePattern) || [];
    
    if (spanMatches.length > spanCloseMatches.length) {
      const missingSpans = spanMatches.length - spanCloseMatches.length;
      console.log(`   🔧 Ajout de ${missingSpans} balises </span> manquantes`);
      
      // Ajouter les balises span fermantes manquantes
      const lastSpanIndex = content.lastIndexOf('</span>');
      if (lastSpanIndex !== -1) {
        const insertPosition = lastSpanIndex + 7; // Après </span>
        const spansToAdd = '</span>'.repeat(missingSpans);
        content = content.slice(0, insertPosition) + spansToAdd + content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Correction 3: Fermer les balises button manquantes
    const buttonPattern = /<button[^>]*>/g;
    const buttonMatches = content.match(buttonPattern) || [];
    const buttonClosePattern = /<\/button>/g;
    const buttonCloseMatches = content.match(buttonClosePattern) || [];
    
    if (buttonMatches.length > buttonCloseMatches.length) {
      const missingButtons = buttonMatches.length - buttonCloseMatches.length;
      console.log(`   🔧 Ajout de ${missingButtons} balises </button> manquantes`);
      
      // Ajouter les balises button fermantes manquantes
      const lastButtonIndex = content.lastIndexOf('</button>');
      if (lastButtonIndex !== -1) {
        const insertPosition = lastButtonIndex + 9; // Après </button>
        const buttonsToAdd = '</button>'.repeat(missingButtons);
        content = content.slice(0, insertPosition) + buttonsToAdd + content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Correction 4: Fermer les balises p manquantes
    const pPattern = /<p[^>]*>/g;
    const pMatches = content.match(pPattern) || [];
    const pClosePattern = /<\/p>/g;
    const pCloseMatches = content.match(pClosePattern) || [];
    
    if (pMatches.length > pCloseMatches.length) {
      const missingPs = pMatches.length - pCloseMatches.length;
      console.log(`   🔧 Ajout de ${missingPs} balises </p> manquantes`);
      
      // Ajouter les balises p fermantes manquantes
      const lastPIndex = content.lastIndexOf('</p>');
      if (lastPIndex !== -1) {
        const insertPosition = lastPIndex + 4; // Après </p>
        const psToAdd = '</p>'.repeat(missingPs);
        content = content.slice(0, insertPosition) + psToAdd + content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Correction 5: Fermer les balises h3, h4, h5 manquantes
    const headingPattern = /<(h[3-5])[^>]*>/g;
    const headingMatches = content.match(headingPattern) || [];
    const headingClosePattern = /<\/(h[3-5])>/g;
    const headingCloseMatches = content.match(headingClosePattern) || [];
    
    if (headingMatches.length > headingCloseMatches.length) {
      const missingHeadings = headingMatches.length - headingCloseMatches.length;
      console.log(`   🔧 Ajout de ${missingHeadings} balises de titre fermantes manquantes`);
      
      // Ajouter les balises de titre fermantes manquantes
      const lastHeadingIndex = content.lastIndexOf('</h');
      if (lastHeadingIndex !== -1) {
        const insertPosition = lastHeadingIndex + 4; // Après </hX>
        const headingsToAdd = '</h3>'.repeat(missingHeadings);
        content = content.slice(0, insertPosition) + headingsToAdd + content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Correction 6: Fermer les balises section manquantes
    const sectionPattern = /<section[^>]*>/g;
    const sectionMatches = content.match(sectionPattern) || [];
    const sectionClosePattern = /<\/section>/g;
    const sectionCloseMatches = content.match(sectionClosePattern) || [];
    
    if (sectionMatches.length > sectionCloseMatches.length) {
      const missingSections = sectionMatches.length - sectionCloseMatches.length;
      console.log(`   🔧 Ajout de ${missingSections} balises </section> manquantes`);
      
      // Ajouter les balises section fermantes manquantes
      const lastSectionIndex = content.lastIndexOf('</section>');
      if (lastSectionIndex !== -1) {
        const insertPosition = lastSectionIndex + 10; // Après </section>
        const sectionsToAdd = '</section>'.repeat(missingSections);
        content = content.slice(0, insertPosition) + sectionsToAdd + content.slice(insertPosition);
        modified = true;
      }
    }
    
    // Compter les balises après correction
    const openTagsAfter = (content.match(/<[^/][^>]*>/g) || []).filter(tag => !tag.includes('/>')).length;
    const closeTagsAfter = (content.match(/<\/[^>]*>/g) || []).length;
    
    console.log(`   📊 Après: ${openTagsAfter} ouvertes, ${closeTagsAfter} fermées`);
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('   ✅ Fichier corrigé et sauvegardé');
      return true;
    } else {
      console.log('   ℹ️  Aucune correction nécessaire');
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur lors de la correction: ${error.message}`);
    return false;
  }
}

// Fichiers à corriger
const filesToFix = [
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

let allFixed = true;

filesToFix.forEach(file => {
  const result = fixJSXBalance(file.path, file.description);
  if (!result) {
    allFixed = false;
  }
  console.log('');
});

if (allFixed) {
  console.log('🎉 Toutes les corrections ont été appliquées avec succès !');
  console.log('🔄 Relancez le serveur de développement pour vérifier les corrections.');
} else {
  console.log('⚠️  Certaines corrections ont échoué.');
  console.log('🔧 Veuillez vérifier manuellement les fichiers problématiques.');
} 