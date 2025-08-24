// Script de test pour vérifier les couleurs orangées dans l'assistant IA
const testAssistantIAOrangeColors = {
  
  // Test 1: Vérifier les boutons principaux
  checkMainButtons() {
    console.log('🔍 VÉRIFICATION DES BOUTONS PRINCIPAUX...');
    
    const buttons = Array.from(document.querySelectorAll('button'));
    const mainButtons = buttons.filter(btn => 
      btn.textContent?.includes('Copier') ||
      btn.textContent?.includes('Télécharger') ||
      btn.textContent?.includes('Envoyer') ||
      btn.querySelector('svg') // Boutons avec icônes
    );
    
    console.log(`📊 Boutons principaux trouvés: ${mainButtons.length}`);
    
    mainButtons.forEach((btn, index) => {
      const hasOrange = btn.className.includes('orange');
      const hasPink = btn.className.includes('pink');
      const hasBlue = btn.className.includes('blue');
      const hasGreen = btn.className.includes('green');
      
      console.log(`✅ Bouton ${index + 1}: "${btn.textContent?.trim() || 'Avec icône'}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
      console.log(`   Green: ${hasGreen ? '❌' : '✅'}`);
    });
    
    return mainButtons.every(btn => btn.className.includes('orange'));
  },
  
  // Test 2: Vérifier les outils IA
  checkAITools() {
    console.log('\n🔍 VÉRIFICATION DES OUTILS IA...');
    
    const toolButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.className.includes('border-') && btn.className.includes('hover:')
    );
    
    console.log(`📊 Outils IA trouvés: ${toolButtons.length}`);
    
    toolButtons.forEach((btn, index) => {
      const hasOrange = btn.className.includes('orange');
      const hasPink = btn.className.includes('pink');
      
      console.log(`✅ Outil ${index + 1}: "${btn.textContent?.trim()}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
    });
    
    return toolButtons.every(btn => btn.className.includes('orange'));
  },
  
  // Test 3: Vérifier les champs de saisie
  checkInputFields() {
    console.log('\n🔍 VÉRIFICATION DES CHAMPS DE SAISIE...');
    
    const inputs = Array.from(document.querySelectorAll('input'));
    const focusInputs = inputs.filter(input => 
      input.className.includes('focus:ring')
    );
    
    console.log(`📊 Champs avec focus trouvés: ${focusInputs.length}`);
    
    focusInputs.forEach((input, index) => {
      const hasOrange = input.className.includes('orange');
      const hasPink = input.className.includes('pink');
      
      console.log(`✅ Champ ${index + 1}: ${input.placeholder || 'Sans placeholder'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
    });
    
    return focusInputs.every(input => input.className.includes('orange'));
  },
  
  // Test 4: Vérifier les icônes et éléments visuels
  checkIconsAndVisuals() {
    console.log('\n🔍 VÉRIFICATION DES ICÔNES ET ÉLÉMENTS VISUELS...');
    
    const icons = Array.from(document.querySelectorAll('svg')).filter(svg => 
      svg.parentElement?.className.includes('text-')
    );
    
    console.log(`📊 Icônes trouvées: ${icons.length}`);
    
    icons.forEach((icon, index) => {
      const parent = icon.parentElement;
      const hasOrange = parent?.className.includes('orange');
      const hasPink = parent?.className.includes('pink');
      
      console.log(`✅ Icône ${index + 1}: ${parent?.className.includes('Sparkles') ? 'Sparkles' : 'Autre'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
    });
    
    return icons.every(icon => 
      icon.parentElement?.className.includes('orange') || 
      icon.parentElement?.className.includes('gray')
    );
  },
  
  // Test 5: Vérifier les messages du chat
  checkChatMessages() {
    console.log('\n🔍 VÉRIFICATION DES MESSAGES DU CHAT...');
    
    const messageDivs = Array.from(document.querySelectorAll('div')).filter(div => 
      div.className.includes('bg-') && div.className.includes('text-')
    );
    
    console.log(`📊 Messages trouvés: ${messageDivs.length}`);
    
    messageDivs.forEach((div, index) => {
      const hasOrange = div.className.includes('orange');
      const hasPink = div.className.includes('pink');
      const hasGray = div.className.includes('gray');
      
      console.log(`✅ Message ${index + 1}: ${div.textContent?.substring(0, 30)}...`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
      console.log(`   Gray: ${hasGray ? '✅' : '❌'}`);
    });
    
    return messageDivs.every(div => 
      div.className.includes('orange') || 
      div.className.includes('gray')
    );
  },
  
  // Test 6: Vérifier les éléments de chargement
  checkLoadingElements() {
    console.log('\n🔍 VÉRIFICATION DES ÉLÉMENTS DE CHARGEMENT...');
    
    const loadingElements = Array.from(document.querySelectorAll('div')).filter(div => 
      div.className.includes('animate-spin') || div.className.includes('Loader2')
    );
    
    console.log(`📊 Éléments de chargement trouvés: ${loadingElements.length}`);
    
    loadingElements.forEach((element, index) => {
      const hasOrange = element.className.includes('orange');
      const hasPink = element.className.includes('pink');
      
      console.log(`✅ Élément ${index + 1}: ${element.className.includes('animate-spin') ? 'Spinner' : 'Loader'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
    });
    
    return loadingElements.every(element => element.className.includes('orange'));
  },
  
  // Test 7: Vérifier les couleurs globales
  checkGlobalColors() {
    console.log('\n🔍 VÉRIFICATION GLOBALE DES COULEURS...');
    
    const allElements = document.querySelectorAll('*');
    let orangeCount = 0;
    let pinkCount = 0;
    let blueCount = 0;
    let greenCount = 0;
    
    allElements.forEach(element => {
      const className = element.className || '';
      if (className.includes('orange')) orangeCount++;
      if (className.includes('pink')) pinkCount++;
      if (className.includes('blue-600') || className.includes('blue-700')) blueCount++;
      if (className.includes('green-600') || className.includes('green-700')) greenCount++;
    });
    
    console.log(`📊 Statistiques des couleurs:`);
    console.log(`   Orange: ${orangeCount} occurrences`);
    console.log(`   Pink: ${pinkCount} occurrences`);
    console.log(`   Blue (600/700): ${blueCount} occurrences`);
    console.log(`   Green (600/700): ${greenCount} occurrences`);
    
    return pinkCount === 0 && blueCount === 0 && greenCount === 0;
  },
  
  // Test 8: Vérifier les badges et étiquettes
  checkBadgesAndLabels() {
    console.log('\n🔍 VÉRIFICATION DES BADGES ET ÉTIQUETTES...');
    
    const badges = Array.from(document.querySelectorAll('span, div')).filter(element => 
      element.className.includes('bg-') && element.className.includes('text-')
    );
    
    console.log(`📊 Badges trouvés: ${badges.length}`);
    
    badges.forEach((badge, index) => {
      const hasOrange = badge.className.includes('orange');
      const hasPink = badge.className.includes('pink');
      const hasGray = badge.className.includes('gray');
      
      console.log(`✅ Badge ${index + 1}: "${badge.textContent?.trim() || 'Sans texte'}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Pink: ${hasPink ? '❌' : '✅'}`);
      console.log(`   Gray: ${hasGray ? '✅' : '❌'}`);
    });
    
    return badges.every(badge => 
      badge.className.includes('orange') || 
      badge.className.includes('gray')
    );
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - COULEURS ORANGÉES ASSISTANT IA');
    console.log('=' .repeat(60));
    
    const results = {
      mainButtons: this.checkMainButtons(),
      aiTools: this.checkAITools(),
      inputFields: this.checkInputFields(),
      iconsAndVisuals: this.checkIconsAndVisuals(),
      chatMessages: this.checkChatMessages(),
      loadingElements: this.checkLoadingElements(),
      globalColors: this.checkGlobalColors(),
      badgesAndLabels: this.checkBadgesAndLabels()
    };
    
    console.log('\n📋 RÉSULTATS FINAUX:');
    console.log(`   Boutons principaux: ${results.mainButtons ? '✅' : '❌'}`);
    console.log(`   Outils IA: ${results.aiTools ? '✅' : '❌'}`);
    console.log(`   Champs de saisie: ${results.inputFields ? '✅' : '❌'}`);
    console.log(`   Icônes et éléments visuels: ${results.iconsAndVisuals ? '✅' : '❌'}`);
    console.log(`   Messages du chat: ${results.chatMessages ? '✅' : '❌'}`);
    console.log(`   Éléments de chargement: ${results.loadingElements ? '✅' : '❌'}`);
    console.log(`   Couleurs globales: ${results.globalColors ? '✅' : '❌'}`);
    console.log(`   Badges et étiquettes: ${results.badgesAndLabels ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 ${allPassed ? '✅ TOUS LES TESTS PASSÉS' : '❌ CERTAINS TESTS ÉCHOUÉS'}`);
    
    return allPassed;
  }
};

// Exposer la fonction pour utilisation dans la console
window.testAssistantIAOrangeColors = testAssistantIAOrangeColors;

console.log('📋 Script de test couleurs orangées assistant IA chargé !');
console.log('💡 Utilisez: testAssistantIAOrangeColors.runCompleteTest()'); 