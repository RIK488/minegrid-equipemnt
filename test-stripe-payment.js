// Script de test pour la fonctionnalité de paiement Stripe
const testStripePayment = {
  
  // Test 1: Vérifier la configuration Stripe
  checkStripeConfig() {
    console.log('🔍 VÉRIFICATION DE LA CONFIGURATION STRIPE...');
    
    // Vérifier si Stripe est chargé
    if (typeof window.Stripe !== 'undefined') {
      console.log('✅ Stripe.js chargé');
    } else {
      console.log('❌ Stripe.js non chargé');
    }
    
    // Vérifier la clé publique
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey && publishableKey.startsWith('pk_')) {
      console.log('✅ Clé publique Stripe configurée');
    } else {
      console.log('❌ Clé publique Stripe manquante ou invalide');
    }
  },
  
  // Test 2: Vérifier les composants Stripe
  checkStripeComponents() {
    console.log('\n🔍 VÉRIFICATION DES COMPOSANTS STRIPE...');
    
    // Vérifier si le composant StripePaymentForm existe
    const stripeForm = document.querySelector('[data-stripe-payment-form]');
    if (stripeForm) {
      console.log('✅ Composant StripePaymentForm trouvé');
    } else {
      console.log('❌ Composant StripePaymentForm non trouvé');
    }
    
    // Vérifier les éléments Stripe
    const cardElement = document.querySelector('[data-stripe-card-element]');
    if (cardElement) {
      console.log('✅ Élément CardElement trouvé');
    } else {
      console.log('❌ Élément CardElement non trouvé');
    }
  },
  
  // Test 3: Simuler un paiement de test
  testPaymentFlow() {
    console.log('\n🔍 TEST DU FLUX DE PAIEMENT...');
    
    // Chercher le bouton d'abonnement
    const premiumButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Choisir Premium')
    );
    
    if (premiumButton) {
      console.log('🎯 Clic sur "Choisir Premium"');
      premiumButton.click();
      
      setTimeout(() => {
        this.checkPaymentPage();
      }, 1000);
    } else {
      console.log('❌ Bouton "Choisir Premium" non trouvé');
    }
  },
  
  // Test 4: Vérifier la page de paiement
  checkPaymentPage() {
    console.log('\n🔍 VÉRIFICATION DE LA PAGE DE PAIEMENT...');
    
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
    
    if (foundElements >= 3) {
      console.log('✅ Page de paiement détectée !');
      this.testStripeForm();
    } else {
      console.log('❌ Page de paiement non trouvée');
    }
  },
  
  // Test 5: Tester le formulaire Stripe
  testStripeForm() {
    console.log('\n🔍 TEST DU FORMULAIRE STRIPE...');
    
    // Sélectionner l'option carte bancaire
    const cardRadio = Array.from(document.querySelectorAll('input[type="radio"]'))
      .find(radio => radio.value === 'card');
    
    if (cardRadio) {
      cardRadio.checked = true;
      cardRadio.dispatchEvent(new Event('change'));
      console.log('✅ Option carte bancaire sélectionnée');
      
      // Vérifier si le formulaire Stripe apparaît
      setTimeout(() => {
        const stripeForm = document.querySelector('form');
        if (stripeForm) {
          console.log('✅ Formulaire Stripe trouvé');
          this.simulateCardInput();
        } else {
          console.log('❌ Formulaire Stripe non trouvé');
        }
      }, 500);
    } else {
      console.log('❌ Option carte bancaire non trouvée');
    }
  },
  
  // Test 6: Simuler la saisie de carte
  simulateCardInput() {
    console.log('\n🔍 SIMULATION DE SAISIE DE CARTE...');
    
    // Chercher les champs de carte (simulation)
    const cardInputs = document.querySelectorAll('input[type="text"]');
    
    if (cardInputs.length > 0) {
      console.log(`✅ ${cardInputs.length} champs de saisie trouvés`);
      console.log('💡 Note: Les vrais champs Stripe sont sécurisés et ne peuvent pas être simulés');
    } else {
      console.log('❌ Aucun champ de saisie trouvé');
    }
    
    console.log('\n💳 CARTES DE TEST STRIPE:');
    console.log('   Succès: 4242 4242 4242 4242');
    console.log('   Échec:  4000 0000 0000 0002');
    console.log('   CVC:    123');
    console.log('   Date:   12/25');
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - FONCTIONNALITÉ STRIPE');
    console.log('=' .repeat(60));
    
    this.checkStripeConfig();
    this.checkStripeComponents();
    this.testPaymentFlow();
    
    console.log('\n💡 INSTRUCTIONS MANUELLES:');
    console.log('   1. Configurer les clés Stripe dans .env');
    console.log('   2. Déployer la fonction Edge create-payment-intent');
    console.log('   3. Tester avec une carte de test Stripe');
    console.log('   4. Vérifier l\'activation de l\'abonnement');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testStripePayment = testStripePayment;

console.log('📋 Script de test Stripe chargé !');
console.log('💡 Utilisez: testStripePayment.runCompleteTest()'); 