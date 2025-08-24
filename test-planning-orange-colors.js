// Script de test pour vérifier les couleurs orangées dans le planning professionnel
const testPlanningOrangeColors = {
  
  // Test 1: Vérifier les boutons principaux
  checkMainButtons() {
    console.log('🔍 VÉRIFICATION DES BOUTONS PRINCIPAUX...');
    
    const buttons = Array.from(document.querySelectorAll('button'));
    const mainButtons = buttons.filter(btn => 
      btn.textContent?.includes('Nouvel événement') ||
      btn.textContent?.includes('Sauvegarder') ||
      btn.textContent?.includes('Ajouter')
    );
    
    console.log(`📊 Boutons principaux trouvés: ${mainButtons.length}`);
    
    mainButtons.forEach((btn, index) => {
      const hasOrange = btn.className.includes('orange');
      const hasYellow = btn.className.includes('yellow');
      const hasBlue = btn.className.includes('blue');
      const hasGreen = btn.className.includes('green');
      const hasPurple = btn.className.includes('purple');
      
      console.log(`✅ Bouton ${index + 1}: "${btn.textContent?.trim()}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Yellow: ${hasYellow ? '❌' : '✅'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
      console.log(`   Green: ${hasGreen ? '❌' : '✅'}`);
      console.log(`   Purple: ${hasPurple ? '❌' : '✅'}`);
    });
    
    return mainButtons.every(btn => btn.className.includes('orange'));
  },
  
  // Test 2: Vérifier les boutons de filtre
  checkFilterButtons() {
    console.log('\n🔍 VÉRIFICATION DES BOUTONS DE FILTRE...');
    
    const filterButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Tous') ||
      btn.textContent?.includes('Rendez-vous') ||
      btn.textContent?.includes('Livraisons') ||
      btn.textContent?.includes('Interventions') ||
      btn.textContent?.includes('Maintenance')
    );
    
    console.log(`📊 Boutons de filtre trouvés: ${filterButtons.length}`);
    
    filterButtons.forEach((btn, index) => {
      const hasOrange = btn.className.includes('orange');
      const hasYellow = btn.className.includes('yellow');
      const hasBlue = btn.className.includes('blue');
      const hasGreen = btn.className.includes('green');
      const hasPurple = btn.className.includes('purple');
      
      console.log(`✅ Filtre ${index + 1}: "${btn.textContent?.trim()}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Yellow: ${hasYellow ? '❌' : '✅'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
      console.log(`   Green: ${hasGreen ? '❌' : '✅'}`);
      console.log(`   Purple: ${hasPurple ? '❌' : '✅'}`);
    });
    
    return filterButtons.every(btn => btn.className.includes('orange'));
  },
  
  // Test 3: Vérifier les champs de saisie
  checkInputFields() {
    console.log('\n🔍 VÉRIFICATION DES CHAMPS DE SAISIE...');
    
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const focusInputs = inputs.filter(input => 
      input.className.includes('focus:ring')
    );
    
    console.log(`📊 Champs avec focus trouvés: ${focusInputs.length}`);
    
    focusInputs.forEach((input, index) => {
      const hasOrange = input.className.includes('orange');
      const hasYellow = input.className.includes('yellow');
      
      console.log(`✅ Champ ${index + 1}: ${input.type || 'select'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Yellow: ${hasYellow ? '❌' : '✅'}`);
    });
    
    return focusInputs.every(input => input.className.includes('orange'));
  },
  
  // Test 4: Vérifier les icônes d'action
  checkActionIcons() {
    console.log('\n🔍 VÉRIFICATION DES ICÔNES D\'ACTION...');
    
    const actionButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.className.includes('text-') && btn.className.includes('hover:text-')
    );
    
    console.log(`📊 Boutons d'action trouvés: ${actionButtons.length}`);
    
    actionButtons.forEach((btn, index) => {
      const hasOrange = btn.className.includes('orange');
      const hasBlue = btn.className.includes('blue');
      const hasRed = btn.className.includes('red');
      const hasGreen = btn.className.includes('green');
      
      console.log(`✅ Action ${index + 1}: ${btn.title || 'Sans titre'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
      console.log(`   Red: ${hasRed ? '✅' : '❌'}`);
      console.log(`   Green: ${hasGreen ? '✅' : '❌'}`);
    });
    
    return actionButtons.every(btn => 
      btn.className.includes('orange') || 
      btn.className.includes('red') || 
      btn.className.includes('green')
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
      const hasYellow = element.className.includes('yellow');
      
      console.log(`✅ Élément ${index + 1}: ${element.className.includes('animate-spin') ? 'Spinner' : 'Border'}`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Yellow: ${hasYellow ? '❌' : '✅'}`);
    });
    
    return loadingElements.every(element => element.className.includes('orange'));
  },
  
  // Test 6: Vérifier les couleurs globales
  checkGlobalColors() {
    console.log('\n🔍 VÉRIFICATION GLOBALE DES COULEURS...');
    
    const allElements = document.querySelectorAll('*');
    let orangeCount = 0;
    let yellowCount = 0;
    let blueCount = 0;
    let greenCount = 0;
    let purpleCount = 0;
    
    allElements.forEach(element => {
      const className = element.className || '';
      if (className.includes('orange')) orangeCount++;
      if (className.includes('yellow')) yellowCount++;
      if (className.includes('blue-600') || className.includes('blue-700')) blueCount++;
      if (className.includes('green-600') || className.includes('green-700')) greenCount++;
      if (className.includes('purple-600') || className.includes('purple-700')) purpleCount++;
    });
    
    console.log(`📊 Statistiques des couleurs:`);
    console.log(`   Orange: ${orangeCount} occurrences`);
    console.log(`   Yellow: ${yellowCount} occurrences`);
    console.log(`   Blue (600/700): ${blueCount} occurrences`);
    console.log(`   Green (600/700): ${greenCount} occurrences`);
    console.log(`   Purple (600/700): ${purpleCount} occurrences`);
    
    return yellowCount === 0 && blueCount === 0 && greenCount === 0 && purpleCount === 0;
  },
  
  // Test 7: Vérifier les badges de statut et priorité
  checkStatusBadges() {
    console.log('\n🔍 VÉRIFICATION DES BADGES DE STATUT...');
    
    const badges = Array.from(document.querySelectorAll('span')).filter(span => 
      span.className.includes('px-2') && span.className.includes('py-1') && span.className.includes('rounded-full')
    );
    
    console.log(`📊 Badges trouvés: ${badges.length}`);
    
    badges.forEach((badge, index) => {
      const hasOrange = badge.className.includes('orange');
      const hasBlue = badge.className.includes('blue');
      const hasGreen = badge.className.includes('green');
      const hasRed = badge.className.includes('red');
      const hasYellow = badge.className.includes('yellow');
      
      console.log(`✅ Badge ${index + 1}: "${badge.textContent?.trim()}"`);
      console.log(`   Orange: ${hasOrange ? '✅' : '❌'}`);
      console.log(`   Blue: ${hasBlue ? '❌' : '✅'}`);
      console.log(`   Green: ${hasGreen ? '✅' : '❌'}`);
      console.log(`   Red: ${hasRed ? '✅' : '❌'}`);
      console.log(`   Yellow: ${hasYellow ? '❌' : '✅'}`);
    });
    
    return badges.every(badge => 
      badge.className.includes('orange') || 
      badge.className.includes('green') || 
      badge.className.includes('red') ||
      badge.className.includes('gray')
    );
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - COULEURS ORANGÉES PLANNING PROFESSIONNEL');
    console.log('=' .repeat(60));
    
    const results = {
      mainButtons: this.checkMainButtons(),
      filterButtons: this.checkFilterButtons(),
      inputFields: this.checkInputFields(),
      actionIcons: this.checkActionIcons(),
      loadingElements: this.checkLoadingElements(),
      globalColors: this.checkGlobalColors(),
      statusBadges: this.checkStatusBadges()
    };
    
    console.log('\n📋 RÉSULTATS FINAUX:');
    console.log(`   Boutons principaux: ${results.mainButtons ? '✅' : '❌'}`);
    console.log(`   Boutons de filtre: ${results.filterButtons ? '✅' : '❌'}`);
    console.log(`   Champs de saisie: ${results.inputFields ? '✅' : '❌'}`);
    console.log(`   Icônes d'action: ${results.actionIcons ? '✅' : '❌'}`);
    console.log(`   Éléments de chargement: ${results.loadingElements ? '✅' : '❌'}`);
    console.log(`   Couleurs globales: ${results.globalColors ? '✅' : '❌'}`);
    console.log(`   Badges de statut: ${results.statusBadges ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 ${allPassed ? '✅ TOUS LES TESTS PASSÉS' : '❌ CERTAINS TESTS ÉCHOUÉS'}`);
    
    return allPassed;
  }
};

// Exposer la fonction pour utilisation dans la console
window.testPlanningOrangeColors = testPlanningOrangeColors;

console.log('📋 Script de test couleurs orangées planning professionnel chargé !');
console.log('💡 Utilisez: testPlanningOrangeColors.runCompleteTest()'); 