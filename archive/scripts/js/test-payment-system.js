// Script de test pour vérifier le système de paiement et code promo
const testPaymentSystem = {
  
  // Test 1: Vérifier que la page Register.tsx a été modifiée
  checkRegisterModifications() {
    console.log('🔍 VÉRIFICATION DES MODIFICATIONS DE REGISTER.TSX...');
    
    // Vérifier si PaymentPage est importé
    const scripts = document.querySelectorAll('script');
    let paymentPageImported = false;
    
    scripts.forEach(script => {
      if (script.src && script.src.includes('PaymentPage')) {
        paymentPageImported = true;
      }
    });
    
    console.log(`📦 PaymentPage importé: ${paymentPageImported ? 'OUI' : 'NON'}`);
    
    // Vérifier si le bouton a été modifié
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      const buttonText = submitButton.textContent;
      console.log(`🔘 Texte du bouton: "${buttonText}"`);
      
      if (buttonText.includes('Continuer vers le paiement')) {
        console.log('✅ Bouton modifié correctement');
      } else {
        console.log('❌ Bouton non modifié');
      }
    } else {
      console.log('❌ Bouton submit non trouvé');
    }
  },
  
  // Test 2: Vérifier les plans d'abonnement
  checkSubscriptionPlans() {
    console.log('\n🔍 VÉRIFICATION DES PLANS D\'ABONNEMENT...');
    
    const subscriptionCards = document.querySelectorAll('[class*="border-2 rounded-lg"]');
    console.log(`📊 Cartes d'abonnement trouvées: ${subscriptionCards.length}`);
    
    const expectedPlans = ['Gratuit', 'Premium', 'Pro', 'Entreprise'];
    const foundPlans = [];
    
    subscriptionCards.forEach((card, index) => {
      const title = card.querySelector('h4');
      const price = card.querySelector('p');
      
      if (title && price) {
        const planName = title.textContent;
        const planPrice = price.textContent;
        foundPlans.push(planName);
        
        console.log(`📋 Plan ${index + 1}: ${planName} - ${planPrice}`);
        
        // Vérifier si priceValue est présent
        if (planPrice.includes('€')) {
          console.log(`   ✅ Prix détecté: ${planPrice}`);
        }
      }
    });
    
    console.log(`📊 Plans trouvés: ${foundPlans.join(', ')}`);
    console.log(`📊 Plans attendus: ${expectedPlans.join(', ')}`);
    
    const missingPlans = expectedPlans.filter(plan => !foundPlans.includes(plan));
    if (missingPlans.length > 0) {
      console.log(`❌ Plans manquants: ${missingPlans.join(', ')}`);
    } else {
      console.log('✅ Tous les plans sont présents');
    }
  },
  
  // Test 3: Simuler la sélection d'un abonnement payant
  simulatePaidSubscriptionSelection() {
    console.log('\n🔍 SIMULATION DE SÉLECTION D\'ABONNEMENT PAYANT...');
    
    // Chercher un abonnement payant (Premium, Pro, ou Entreprise)
    const paidPlans = ['Premium', 'Pro', 'Entreprise'];
    let selectedPlan = null;
    
    paidPlans.forEach(planName => {
      const planCard = Array.from(document.querySelectorAll('h4')).find(h4 => 
        h4.textContent === planName
      )?.closest('[class*="border-2 rounded-lg"]');
      
      if (planCard && !selectedPlan) {
        selectedPlan = planCard;
        console.log(`🎯 Sélection du plan: ${planName}`);
        
        // Simuler le clic
        planCard.click();
        console.log(`✅ Clic simulé sur ${planName}`);
      }
    });
    
    if (!selectedPlan) {
      console.log('❌ Aucun plan payant trouvé');
    }
  },
  
  // Test 4: Vérifier le comportement du bouton après sélection
  checkButtonBehavior() {
    console.log('\n🔍 VÉRIFICATION DU COMPORTEMENT DU BOUTON...');
    
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      const buttonText = submitButton.textContent;
      console.log(`🔘 Texte actuel du bouton: "${buttonText}"`);
      
      if (buttonText.includes('Continuer vers le paiement')) {
        console.log('✅ Bouton prêt pour la redirection vers le paiement');
        
        // Simuler le clic pour voir si la page de paiement apparaît
        console.log('🔄 Simulation du clic sur le bouton...');
        submitButton.click();
        
        // Attendre un peu puis vérifier
        setTimeout(() => {
          this.checkPaymentPage();
        }, 1000);
      } else {
        console.log('❌ Bouton non modifié pour le paiement');
      }
    }
  },
  
  // Test 5: Vérifier si la page de paiement apparaît
  checkPaymentPage() {
    console.log('\n🔍 VÉRIFICATION DE LA PAGE DE PAIEMENT...');
    
    // Chercher des éléments de la page de paiement
    const paymentElements = [
      'Finaliser votre abonnement',
      'Choisissez votre méthode de paiement',
      'Carte bancaire',
      'Code promo'
    ];
    
    let foundElements = 0;
    
    paymentElements.forEach(text => {
      const element = document.querySelector(`*:contains("${text}")`) || 
                     Array.from(document.querySelectorAll('*')).find(el => 
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
  
  // Test 6: Tester le code promo
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
    console.log('🚀 TEST COMPLET DU SYSTÈME DE PAIEMENT');
    console.log('=' .repeat(60));
    
    this.checkRegisterModifications();
    this.checkSubscriptionPlans();
    this.simulatePaidSubscriptionSelection();
    this.checkButtonBehavior();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ TEST TERMINÉ');
    console.log('\n💡 INSTRUCTIONS:');
    console.log('   1. Allez sur la page d\'inscription');
    console.log('   2. Sélectionnez un abonnement payant');
    console.log('   3. Remplissez le formulaire');
    console.log('   4. Cliquez "Continuer vers le paiement"');
    console.log('   5. Choisissez "Code promo"');
    console.log('   6. Entrez "082025"');
    console.log('   7. Validez et vérifiez l\'activation');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testPaymentSystem = testPaymentSystem;

console.log('📋 Script de test du système de paiement chargé !');
console.log('💡 Utilisez: testPaymentSystem.runCompleteTest()'); 