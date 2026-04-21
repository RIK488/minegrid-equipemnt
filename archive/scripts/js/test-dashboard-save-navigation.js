// Script de test pour vérifier la sauvegarde des tableaux de bord et la navigation
const testDashboardSaveNavigation = {
  
  // Test 1: Vérifier les boutons de sauvegarde
  checkSaveButtons() {
    console.log('🔍 VÉRIFICATION DES BOUTONS DE SAUVEGARDE...');
    
    const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Sauvegarder') ||
      btn.textContent?.includes('Save')
    );
    
    console.log(`📊 Boutons de sauvegarde trouvés: ${saveButtons.length}`);
    
    saveButtons.forEach((btn, index) => {
      console.log(`✅ Bouton ${index + 1}: "${btn.textContent?.trim()}"`);
      console.log(`   Fonction onClick: ${btn.onclick ? 'Présente' : 'Manquante'}`);
    });
    
    return saveButtons.length > 0;
  },
  
  // Test 2: Vérifier les boutons de retour
  checkReturnButtons() {
    console.log('\n🔍 VÉRIFICATION DES BOUTONS DE RETOUR...');
    
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
  
  // Test 3: Vérifier les configurations sauvegardées
  checkSavedConfigurations() {
    console.log('\n🔍 VÉRIFICATION DES CONFIGURATIONS SAUVEGARDÉES...');
    
    const configurations = [
      'enterpriseDashboardConfigured',
      'enterpriseDashboardConfig_courtier_configured',
      'enterpriseDashboardConfig_vendeur_configured',
      'dashboardConfigured',
      'dashboardConfig'
    ];
    
    configurations.forEach(config => {
      const value = localStorage.getItem(config);
      console.log(`📋 ${config}: ${value || 'null'}`);
    });
    
    // Vérifier les configurations spécifiques
    const enterpriseConfig = localStorage.getItem('enterpriseDashboardConfig_courtier');
    const vendeurConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    const dashboardConfig = localStorage.getItem('dashboardConfig');
    
    if (enterpriseConfig) {
      try {
        const parsed = JSON.parse(enterpriseConfig);
        console.log('✅ Configuration Enterprise Courtier:', parsed.widgets?.length || 0, 'widgets');
      } catch (e) {
        console.log('❌ Erreur parsing Enterprise Courtier');
      }
    }
    
    if (vendeurConfig) {
      try {
        const parsed = JSON.parse(vendeurConfig);
        console.log('✅ Configuration Enterprise Vendeur:', parsed.widgets?.length || 0, 'widgets');
      } catch (e) {
        console.log('❌ Erreur parsing Enterprise Vendeur');
      }
    }
    
    if (dashboardConfig) {
      try {
        const parsed = JSON.parse(dashboardConfig);
        console.log('✅ Configuration Dashboard Standard:', parsed);
      } catch (e) {
        console.log('❌ Erreur parsing Dashboard Standard');
      }
    }
  },
  
  // Test 4: Simuler la sauvegarde d'un tableau de bord
  testDashboardSave() {
    console.log('\n🔍 TEST DE SAUVEGARDE DU TABLEAU DE BORD...');
    
    const saveButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Sauvegarder')
    );
    
    if (saveButton) {
      console.log('🎯 Clic sur le bouton de sauvegarde');
      saveButton.click();
      
      // Vérifier la sauvegarde après un délai
      setTimeout(() => {
        this.checkSavedConfigurations();
      }, 1000);
    } else {
      console.log('❌ Bouton de sauvegarde non trouvé');
    }
  },
  
  // Test 5: Simuler le retour au tableau de bord
  testReturnToDashboard() {
    console.log('\n🔍 TEST DE RETOUR AU TABLEAU DE BORD...');
    
    const returnButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Retourner au tableau de bord')
    );
    
    if (returnButton) {
      console.log('🎯 Clic sur le bouton de retour');
      
      // Sauvegarder l'URL actuelle
      const currentUrl = window.location.href;
      console.log(`📍 URL actuelle: ${currentUrl}`);
      
      returnButton.click();
      
      // Vérifier la redirection après un délai
      setTimeout(() => {
        const newUrl = window.location.href;
        console.log(`📍 URL après clic: ${newUrl}`);
        
        if (newUrl !== currentUrl) {
          console.log('✅ Redirection effectuée !');
        } else {
          console.log('❌ Aucune redirection détectée');
        }
      }, 1000);
    } else {
      console.log('❌ Bouton de retour non trouvé');
    }
  },
  
  // Test 6: Vérifier l'abonnement actuel
  checkCurrentSubscription() {
    console.log('\n🔍 VÉRIFICATION DE L\'ABONNEMENT ACTUEL...');
    
    const userSubscription = localStorage.getItem('userSubscription');
    const tempSubscription = localStorage.getItem('tempSubscription');
    const hasActiveSubscription = localStorage.getItem('tempHasActiveSubscription') === 'true';
    
    console.log('📊 État de l\'abonnement:');
    console.log(`   userSubscription: ${userSubscription || 'null'}`);
    console.log(`   tempSubscription: ${tempSubscription || 'null'}`);
    console.log(`   hasActiveSubscription: ${hasActiveSubscription}`);
    
    // Déterminer le tableau de bord attendu
    let expectedDashboard = '#dashboard';
    if (userSubscription === 'entreprise' || tempSubscription === 'entreprise') {
      expectedDashboard = '#dashboard-entreprise-display';
    }
    
    console.log(`🎯 Tableau de bord attendu: ${expectedDashboard}`);
    return expectedDashboard;
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - SAUVEGARDE ET NAVIGATION');
    console.log('=' .repeat(60));
    
    this.checkSaveButtons();
    this.checkReturnButtons();
    this.checkSavedConfigurations();
    this.checkCurrentSubscription();
    
    console.log('\n💡 INSTRUCTIONS MANUELLES:');
    console.log('   1. Configurez votre tableau de bord');
    console.log('   2. Cliquez sur "Sauvegarder"');
    console.log('   3. Vérifiez que la configuration est sauvegardée');
    console.log('   4. Testez la navigation depuis la page publication');
    console.log('   5. Vérifiez que vous arrivez au bon tableau de bord');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testDashboardSaveNavigation = testDashboardSaveNavigation;

console.log('📋 Script de test sauvegarde et navigation chargé !');
console.log('💡 Utilisez: testDashboardSaveNavigation.runCompleteTest()'); 