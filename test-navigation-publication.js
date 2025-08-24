// Script de test pour vérifier la navigation depuis la page publication
const testNavigationPublication = {
  
  // Test 1: Vérifier la présence du bouton de retour
  checkReturnButton() {
    console.log('🔍 VÉRIFICATION DU BOUTON DE RETOUR...');
    
    const returnButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Retourner au tableau de bord') ||
      btn.title?.includes('Retourner au tableau de bord')
    );
    
    console.log(`📊 Boutons de retour trouvés: ${returnButtons.length}`);
    
    returnButtons.forEach((btn, index) => {
      console.log(`✅ Bouton ${index + 1}: "${btn.textContent?.trim()}"`);
      console.log(`   Titre: "${btn.title}"`);
      console.log(`   Fonction onClick: ${btn.onclick ? 'Présente' : 'Manquante'}`);
    });
    
    return returnButtons.length > 0;
  },
  
  // Test 2: Vérifier l'abonnement actuel
  checkCurrentSubscription() {
    console.log('\n🔍 VÉRIFICATION DE L\'ABONNEMENT ACTUEL...');
    
    const userSubscription = localStorage.getItem('userSubscription');
    const tempSubscription = localStorage.getItem('tempSubscription');
    const hasActiveSubscription = localStorage.getItem('tempHasActiveSubscription') === 'true';
    const subscriptionCancelled = localStorage.getItem('subscriptionCancelled');
    
    console.log('📊 État de l\'abonnement:');
    console.log(`   userSubscription: ${userSubscription || 'null'}`);
    console.log(`   tempSubscription: ${tempSubscription || 'null'}`);
    console.log(`   hasActiveSubscription: ${hasActiveSubscription}`);
    console.log(`   subscriptionCancelled: ${subscriptionCancelled || 'null'}`);
    
    // Déterminer le tableau de bord cible
    let expectedDashboard = '#dashboard';
    
    if (userSubscription || tempSubscription) {
      const subscriptionType = userSubscription || tempSubscription;
      
      switch (subscriptionType) {
        case 'premium':
        case 'pro':
          expectedDashboard = '#dashboard';
          break;
        case 'entreprise':
        case 'enterprise':
          expectedDashboard = '#dashboard-entreprise-display';
          break;
        case 'gratuit':
        case 'free':
          expectedDashboard = '#dashboard';
          break;
        default:
          if (hasActiveSubscription) {
            expectedDashboard = '#dashboard';
          }
      }
    }
    
    console.log(`🎯 Tableau de bord attendu: ${expectedDashboard}`);
    return expectedDashboard;
  },
  
  // Test 3: Simuler le clic sur le bouton de retour
  testReturnButtonClick() {
    console.log('\n🔍 TEST DE CLIC SUR LE BOUTON DE RETOUR...');
    
    const returnButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Retourner au tableau de bord')
    );
    
    if (returnButton) {
      console.log('🎯 Clic sur le bouton de retour');
      
      // Sauvegarder l'URL actuelle
      const currentUrl = window.location.href;
      console.log(`📍 URL actuelle: ${currentUrl}`);
      
      // Simuler le clic
      returnButton.click();
      
      // Vérifier la redirection après un délai
      setTimeout(() => {
        const newUrl = window.location.href;
        console.log(`📍 URL après clic: ${newUrl}`);
        
        if (newUrl !== currentUrl) {
          console.log('✅ Redirection effectuée !');
          this.verifyCorrectDashboard();
        } else {
          console.log('❌ Aucune redirection détectée');
        }
      }, 1000);
      
    } else {
      console.log('❌ Bouton de retour non trouvé');
    }
  },
  
  // Test 4: Vérifier que la redirection va vers le bon tableau de bord
  verifyCorrectDashboard() {
    console.log('\n🔍 VÉRIFICATION DE LA REDIRECTION...');
    
    const currentHash = window.location.hash;
    const expectedDashboard = this.checkCurrentSubscription();
    
    console.log(`📍 Hash actuel: ${currentHash}`);
    console.log(`🎯 Hash attendu: ${expectedDashboard}`);
    
    if (currentHash === expectedDashboard) {
      console.log('✅ Redirection vers le bon tableau de bord !');
    } else if (currentHash.includes('dashboard')) {
      console.log('⚠️ Redirection vers un tableau de bord, mais pas forcément le bon');
      console.log('💡 Vérifiez manuellement si c\'est le bon tableau de bord');
    } else {
      console.log('❌ Redirection incorrecte');
    }
  },
  
  // Test 5: Tester avec différents types d'abonnements
  testDifferentSubscriptions() {
    console.log('\n🔍 TEST AVEC DIFFÉRENTS ABONNEMENTS...');
    
    const testCases = [
      { subscription: 'premium', expected: '#dashboard' },
      { subscription: 'pro', expected: '#dashboard' },
      { subscription: 'entreprise', expected: '#dashboard-entreprise-display' },
      { subscription: 'enterprise', expected: '#dashboard-entreprise-display' },
      { subscription: 'gratuit', expected: '#dashboard' },
      { subscription: null, expected: '#dashboard' }
    ];
    
    testCases.forEach((testCase, index) => {
      console.log(`\n🧪 Test ${index + 1}: Abonnement ${testCase.subscription || 'null'}`);
      
      // Simuler l'abonnement
      if (testCase.subscription) {
        localStorage.setItem('userSubscription', testCase.subscription);
        localStorage.setItem('tempHasActiveSubscription', 'true');
      } else {
        localStorage.removeItem('userSubscription');
        localStorage.removeItem('tempHasActiveSubscription');
      }
      
      // Vérifier la logique de navigation
      const userSubscription = localStorage.getItem('userSubscription');
      const hasActiveSubscription = localStorage.getItem('tempHasActiveSubscription') === 'true';
      
      let calculatedDashboard = '#dashboard';
      if (userSubscription) {
        if (userSubscription === 'entreprise' || userSubscription === 'enterprise') {
          calculatedDashboard = '#dashboard-entreprise-display';
        }
      }
      
      console.log(`   Calculé: ${calculatedDashboard}`);
      console.log(`   Attendu: ${testCase.expected}`);
      console.log(`   ✅ ${calculatedDashboard === testCase.expected ? 'CORRECT' : 'INCORRECT'}`);
    });
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - NAVIGATION PUBLICATION');
    console.log('=' .repeat(60));
    
    const hasButton = this.checkReturnButton();
    const expectedDashboard = this.checkCurrentSubscription();
    
    if (hasButton) {
      this.testReturnButtonClick();
    }
    
    this.testDifferentSubscriptions();
    
    console.log('\n💡 INSTRUCTIONS MANUELLES:');
    console.log('   1. Vérifiez que vous êtes sur la page publication');
    console.log('   2. Cliquez sur "Retourner au tableau de bord"');
    console.log('   3. Vérifiez que vous arrivez au bon tableau de bord');
    console.log('   4. Testez avec différents abonnements');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testNavigationPublication = testNavigationPublication;

console.log('📋 Script de test navigation publication chargé !');
console.log('💡 Utilisez: testNavigationPublication.runCompleteTest()'); 