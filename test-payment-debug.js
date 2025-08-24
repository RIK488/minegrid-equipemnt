// Script de debug simple pour le système de paiement
const debugPayment = {
  
  // Test 1: Vérifier l'état actuel
  checkCurrentState() {
    console.log('🔍 ÉTAT ACTUEL DE LA PAGE...');
    
    // Vérifier l'abonnement sélectionné
    const selectedPlan = document.querySelector('[class*="border-primary-500"]');
    if (selectedPlan) {
      const planName = selectedPlan.querySelector('h4')?.textContent;
      console.log(`📊 Plan sélectionné: ${planName}`);
    } else {
      console.log('❌ Aucun plan sélectionné');
    }
    
    // Vérifier le bouton
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      const buttonText = submitButton.textContent;
      console.log(`🔘 Texte du bouton: "${buttonText}"`);
      
      if (buttonText.includes('Continuer vers le paiement')) {
        console.log('✅ Bouton modifié correctement');
      } else {
        console.log('❌ Bouton non modifié');
      }
    }
    
    // Vérifier si PaymentPage est importé
    console.log('📦 PaymentPage disponible:', typeof PaymentPage !== 'undefined');
  },
  
  // Test 2: Simuler la sélection d'un abonnement payant
  selectPaidPlan() {
    console.log('\n🔍 SÉLECTION D\'UN ABONNEMENT PAYANT...');
    
    const paidPlans = ['Premium', 'Pro', 'Entreprise'];
    
    paidPlans.forEach(planName => {
      const planCard = Array.from(document.querySelectorAll('h4')).find(h4 => 
        h4.textContent === planName
      )?.closest('[class*="border-2 rounded-lg"]');
      
      if (planCard) {
        console.log(`🎯 Clic sur ${planName}`);
        planCard.click();
        
        // Vérifier le bouton après sélection
        setTimeout(() => {
          const button = document.querySelector('button[type="submit"]');
          if (button) {
            console.log(`🔘 Nouveau texte du bouton: "${button.textContent}"`);
          }
        }, 100);
        
        return;
      }
    });
  },
  
  // Test 3: Simuler le clic sur le bouton
  clickSubmitButton() {
    console.log('\n🔍 CLIC SUR LE BOUTON SUBMIT...');
    
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      console.log('🔘 Clic sur le bouton submit');
      submitButton.click();
      
      // Vérifier si la page de paiement apparaît
      setTimeout(() => {
        this.checkPaymentPage();
      }, 500);
    } else {
      console.log('❌ Bouton submit non trouvé');
    }
  },
  
  // Test 4: Vérifier si la page de paiement apparaît
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
    } else {
      console.log('❌ Page de paiement non trouvée');
      
      // Vérifier s'il y a des erreurs dans la console
      console.log('🔍 Vérifiez la console pour des erreurs...');
    }
  },
  
  // Test complet
  runDebug() {
    console.log('🚀 DEBUG COMPLET DU SYSTÈME DE PAIEMENT');
    console.log('=' .repeat(50));
    
    this.checkCurrentState();
    this.selectPaidPlan();
    
    setTimeout(() => {
      this.clickSubmitButton();
    }, 1000);
    
    console.log('\n💡 INSTRUCTIONS MANUELLES:');
    console.log('   1. Sélectionnez un abonnement payant (Premium/Pro/Entreprise)');
    console.log('   2. Remplissez le formulaire');
    console.log('   3. Cliquez sur le bouton "Continuer vers le paiement"');
    console.log('   4. Vérifiez que la page de paiement s\'affiche');
  }
};

// Exposer la fonction pour utilisation dans la console
window.debugPayment = debugPayment;

console.log('📋 Script de debug du système de paiement chargé !');
console.log('💡 Utilisez: debugPayment.runDebug()'); 