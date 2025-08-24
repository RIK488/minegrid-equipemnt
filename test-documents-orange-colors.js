// Script de test pour vérifier les couleurs orangées dans l'espace documents
const testDocumentsOrangeColors = {
  
  // Test 1: Vérifier les boutons principaux
  checkMainButtons() {
    console.log('🔍 VÉRIFICATION DES BOUTONS PRINCIPAUX...');
    
    const buttons = Array.from(document.querySelectorAll('button'));
    const mainButtons = buttons.filter(btn => 
      btn.textContent?.includes('Ajouter') ||
      btn.textContent?.includes('Uploader') ||
      btn.textContent?.includes('Sauvegarder')
    );
    
    console.log(`📊 Boutons principaux trouvés: ${mainButtons.length}`);
    
    mainButtons.forEach((btn, index) => {
      const hasOrange = btn.className.includes('orange');
      const hasIndigo = btn.className.includes('indigo');
      const hasBlue = btn.className.includes('blue');
      
      console.log(`✅ Bouton ${index + 1}: "${btn.textContent?.trim()}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Indigo: ${hasIndigo ? '❌' : '✅'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
    });
    
    return mainButtons.every(btn => btn.className.includes('orange'));
  },
  
  // Test 2: Vérifier les champs de saisie
  checkInputFields() {
    console.log('\n🔍 VÉRIFICATION DES CHAMPS DE SAISIE...');
    
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const focusInputs = inputs.filter(input => 
      input.className.includes('focus:ring')
    );
    
    console.log(`📊 Champs avec focus trouvés: ${focusInputs.length}`);
    
    focusInputs.forEach((input, index) => {
      const hasOrange = input.className.includes('orange');
      const hasIndigo = input.className.includes('indigo');
      
      console.log(`✅ Champ ${index + 1}: ${input.type || 'select'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Indigo: ${hasIndigo ? '❌' : '✅'}`);
    });
    
    return focusInputs.every(input => input.className.includes('orange'));
  },
  
  // Test 3: Vérifier les icônes et liens
  checkIconsAndLinks() {
    console.log('\n🔍 VÉRIFICATION DES ICÔNES ET LIENS...');
    
    const links = Array.from(document.querySelectorAll('a'));
    const iconLinks = links.filter(link => 
      link.className.includes('hover:text')
    );
    
    console.log(`📊 Liens avec hover trouvés: ${iconLinks.length}`);
    
    iconLinks.forEach((link, index) => {
      const hasOrange = link.className.includes('orange');
      const hasGray = link.className.includes('gray');
      const hasRed = link.className.includes('red');
      
      console.log(`✅ Lien ${index + 1}: ${link.title || 'Sans titre'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Gray: ${hasGray ? '✅' : '❌'}`);
      console.log(`   Red: ${hasRed ? '✅' : '❌'}`);
    });
    
    return iconLinks.every(link => 
      link.className.includes('orange') || 
      link.className.includes('gray') || 
      link.className.includes('red')
    );
  },
  
  // Test 4: Vérifier les tags
  checkTags() {
    console.log('\n🔍 VÉRIFICATION DES TAGS...');
    
    const tags = Array.from(document.querySelectorAll('span')).filter(span => 
      span.className.includes('bg-') && span.className.includes('text-')
    );
    
    console.log(`📊 Tags trouvés: ${tags.length}`);
    
    tags.forEach((tag, index) => {
      const hasOrange = tag.className.includes('orange');
      const hasBlue = tag.className.includes('blue');
      const hasGray = tag.className.includes('gray');
      
      console.log(`✅ Tag ${index + 1}: "${tag.textContent?.trim()}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
      console.log(`   Gray: ${hasGray ? '✅' : '❌'}`);
    });
    
    return tags.every(tag => 
      tag.className.includes('orange') || 
      tag.className.includes('gray')
    );
  },
  
  // Test 5: Vérifier les éléments de chargement
  checkLoadingElements() {
    console.log('\n🔍 VÉRIFICATION DES ÉLÉMENTS DE CHARGEMENT...');
    
    const loadingElements = Array.from(document.querySelectorAll('div')).filter(div => 
      div.className.includes('animate-spin') || div.className.includes('border-b-2')
    );
    
    console.log(`📊 Éléments de chargement trouvés: ${loadingElements.length}`);
    
    loadingElements.forEach((element, index) => {
      const hasOrange = element.className.includes('orange');
      const hasIndigo = element.className.includes('indigo');
      
      console.log(`✅ Élément ${index + 1}: ${element.className.includes('animate-spin') ? 'Spinner' : 'Border'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Indigo: ${hasIndigo ? '❌' : '✅'}`);
    });
    
    return loadingElements.every(element => element.className.includes('orange'));
  },
  
  // Test 6: Vérifier les couleurs globales
  checkGlobalColors() {
    console.log('\n🔍 VÉRIFICATION GLOBALE DES COULEURS...');
    
    const allElements = document.querySelectorAll('*');
    let orangeCount = 0;
    let indigoCount = 0;
    let blueCount = 0;
    
    allElements.forEach(element => {
      const className = element.className || '';
      if (className.includes('orange')) orangeCount++;
      if (className.includes('indigo')) indigoCount++;
      if (className.includes('blue-600') || className.includes('blue-700')) blueCount++;
    });
    
    console.log(`📊 Statistiques des couleurs:`);
    console.log(`   Orange: ${orangeCount} occurrences`);
    console.log(`   Indigo: ${indigoCount} occurrences`);
    console.log(`   Blue (600/700): ${blueCount} occurrences`);
    
    return indigoCount === 0 && blueCount === 0;
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - COULEURS ORANGÉES ESPACE DOCUMENTS');
    console.log('=' .repeat(60));
    
    const results = {
      mainButtons: this.checkMainButtons(),
      inputFields: this.checkInputFields(),
      iconsAndLinks: this.checkIconsAndLinks(),
      tags: this.checkTags(),
      loadingElements: this.checkLoadingElements(),
      globalColors: this.checkGlobalColors()
    };
    
    console.log('\n📋 RÉSULTATS FINAUX:');
    console.log(`   Boutons principaux: ${results.mainButtons ? '✅' : '❌'}`);
    console.log(`   Champs de saisie: ${results.inputFields ? '✅' : '❌'}`);
    console.log(`   Icônes et liens: ${results.iconsAndLinks ? '✅' : '❌'}`);
    console.log(`   Tags: ${results.tags ? '✅' : '❌'}`);
    console.log(`   Éléments de chargement: ${results.loadingElements ? '✅' : '❌'}`);
    console.log(`   Couleurs globales: ${results.globalColors ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 ${allPassed ? '✅ TOUS LES TESTS PASSÉS' : '❌ CERTAINS TESTS ÉCHOUÉS'}`);
    
    return allPassed;
  }
};

// Exposer la fonction pour utilisation dans la console
window.testDocumentsOrangeColors = testDocumentsOrangeColors;

console.log('📋 Script de test couleurs orangées espace documents chargé !');
console.log('💡 Utilisez: testDocumentsOrangeColors.runCompleteTest()'); 