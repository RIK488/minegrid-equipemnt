// Script de test pour vérifier que les abonnements payants mènent directement au paiement
const testAbonnementDirectPayment = {
  
  // Test 1: Vérifier les cartes d'abonnement
  checkSubscriptionCards() {
    console.log('🔍 VÉRIFICATION DES CARTES D\'ABONNEMENT...');
    
    const subscriptionCards = document.querySelectorAll('[class*="border-2 rounded-lg"]');
    console.log(`📊 Cartes d'abonnement trouvées: ${subscriptionCards.length}`);
    
    const expectedPlans = ['Gratuit', 'Premium', 'Pro', 'Entreprise'];
    const foundPlans = [];
    
    subscriptionCards.forEach((card, index) => {
      const title = card.querySelector('h4');
      const price = card.querySelector('p');
      const paymentBadge = card.querySelector('.bg-orange-100');
      
      if (title && price) {
        const planName = title.textContent;
        const planPrice = price.textContent;
        foundPlans.push(planName);
        
        console.log(`📋 Plan ${index + 1}: ${planName} - ${planPrice}`);
        
        if (paymentBadge) {
          console.log(`   ✅ Badge "Paiement" présent pour ${planName}`);
        } else if (planName === 'Gratuit') {
          console.log(`   ✅ Pas de badge pour ${planName} (gratuit)`);
        } else {
          console.log(`   ❌ Badge "Paiement" manquant pour ${planName}`);
        }
      }
    });
    
    console.log(`📊 Plans trouvés: ${foundPlans.join(', ')}`);
    console.log(`📊 Plans attendus: ${expectedPlans.join(', ')}`);
  },
  
  // Test 2: Simuler le clic sur un abonnement payant
  testPaidSubscriptionClick() {
    console.log('\n🔍 TEST DE CLIC SUR ABONNEMENT PAYANT...');
    
    const paidPlans = ['Premium', 'Pro', 'Entreprise'];
    
    paidPlans.forEach(planName => {
      const planCard = Array.from(document.querySelectorAll('h4')).find(h4 => 
        h4.textContent === planName
      )?.closest('[class*="border-2 rounded-lg"]');
      
      if (planCard) {
        console.log(`🎯 Clic sur ${planName}`);
        planCard.click();
        
        // Vérifier si la page de paiement apparaît
        setTimeout(() => {
          this.checkPaymentPage();
        }, 500);
        
        return;
      }
    });
    
    console.log('❌ Aucun abonnement payant trouvé');
  },
  
  // Test 3: Vérifier si la page de paiement apparaît
  checkPaymentPage() {
    console.log('\n🔍 VÉRIFICATION DE LA PAGE DE PAIEMENT...');
    
    // Chercher des éléments spécifiques à la page de paiement
    const paymentElements = [
      'Finaliser votre abonnement',
      'Choisissez votre méthode de paiement',
      'Carte bancaire',
      'Code promo'
    ];
    
    let foundElements = 0;
    
    paymentElements.forEach(text => {
      const element = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes(text)
      );
      
      if (element) {
        console.log(`✅ Élément trouvé: "${text}"`);
        foundElements++;
      } else {
        console.log(`❌ Élément manquant: "${text}"`);
      }
    });
    
    if (foundElements >= 2) {
      console.log('✅ Page de paiement détectée !');
      this.testPromoCode();
    } else {
      console.log('❌ Page de paiement non trouvée');
    }
  },
  
  // Test 4: Tester le code promo
  testPromoCode() {
    console.log('\n🔍 TEST DU CODE PROMO...');
    
    // Chercher le champ code promo
    const promoInput = document.querySelector('input[placeholder*="code promo"]') ||
                      document.querySelector('input[placeholder*="promo"]');
    
    if (promoInput) {
      console.log('✅ Champ code promo trouvé');
      
      // Sélectionner l'option code promo
      const promoRadio = Array.from(document.querySelectorAll('input[type="radio"]'))
        .find(radio => radio.value === 'promo');
      
      if (promoRadio) {
        promoRadio.checked = true;
        promoRadio.dispatchEvent(new Event('change'));
        console.log('✅ Option code promo sélectionnée');
        
        // Entrer le code promo
        promoInput.value = '082025';
        promoInput.dispatchEvent(new Event('input'));
        console.log('✅ Code promo 082025 saisi');
        
        // Chercher le bouton de validation
        const validateButton = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent?.includes('Valider'));
        
        if (validateButton) {
          console.log('✅ Bouton de validation trouvé');
          validateButton.click();
          console.log('✅ Validation du code promo déclenchée');
        } else {
          console.log('❌ Bouton de validation non trouvé');
        }
      } else {
        console.log('❌ Option code promo non trouvée');
      }
    } else {
      console.log('❌ Champ code promo non trouvé');
    }
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - ABONNEMENTS DIRECTS VERS PAIEMENT');
    console.log('=' .repeat(60));
    
    this.checkSubscriptionCards();
    this.testPaidSubscriptionClick();
    
    console.log('\n💡 INSTRUCTIONS MANUELLES:');
    console.log('   1. Allez sur la page d\'inscription');
    console.log('   2. Cliquez sur un abonnement payant (Premium/Pro/Entreprise)');
    console.log('   3. La page de paiement devrait s\'afficher automatiquement');
    console.log('   4. Choisissez "Code promo"');
    console.log('   5. Entrez "082025"');
    console.log('   6. Validez et vérifiez l\'activation');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testAbonnementDirectPayment = testAbonnementDirectPayment;

console.log('📋 Script de test des abonnements directs vers paiement chargé !');
console.log('💡 Utilisez: testAbonnementDirectPayment.runCompleteTest()'); 