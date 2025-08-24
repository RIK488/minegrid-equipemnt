// Script de test pour vérifier que la page de paiement s'affiche dans Dashboard.jsx
const testPaymentPageDashboard = {
  
  // Test 1: Vérifier les boutons d'abonnement
  checkSubscriptionButtons() {
    console.log('🔍 VÉRIFICATION DES BOUTONS D\'ABONNEMENT...');
    
    const buttons = [
      { text: 'Choisir Premium', plan: 'premium' },
      { text: 'Choisir Pro', plan: 'pro' },
      { text: 'Contacter un conseiller', plan: 'enterprise' }
    ];
    
    buttons.forEach(button => {
      const foundButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes(button.text)
      );
      
      if (foundButton) {
        console.log(`✅ Bouton trouvé: "${button.text}"`);
        console.log(`   Plan associé: ${button.plan}`);
        console.log(`   Fonction onClick: ${foundButton.onclick ? 'Présente' : 'Manquante'}`);
      } else {
        console.log(`❌ Bouton manquant: "${button.text}"`);
      }
    });
  },
  
  // Test 2: Simuler le clic sur un bouton d'abonnement
  testSubscriptionButtonClick() {
    console.log('\n🔍 TEST DE CLIC SUR BOUTON D\'ABONNEMENT...');
    
    const premiumButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Choisir Premium')
    );
    
    if (premiumButton) {
      console.log('🎯 Clic sur "Choisir Premium"');
      premiumButton.click();
      
      // Vérifier si la page de paiement apparaît
      setTimeout(() => {
        this.checkPaymentPage();
      }, 500);
    } else {
      console.log('❌ Bouton "Choisir Premium" non trouvé');
    }
  },
  
  // Test 3: Vérifier si la page de paiement apparaît
  checkPaymentPage() {
    console.log('\n🔍 VÉRIFICATION DE LA PAGE DE PAIEMENT...');
    
    // Chercher des éléments spécifiques à la page de paiement
    const paymentElements = [
      'Finaliser votre abonnement',
      'Choisissez votre méthode de paiement',
      'Carte bancaire',
      'Code promo',
      'Résumé de commande'
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
      this.testPaymentMethods();
    } else {
      console.log('❌ Page de paiement non trouvée');
    }
  },
  
  // Test 4: Tester les méthodes de paiement
  testPaymentMethods() {
    console.log('\n🔍 TEST DES MÉTHODES DE PAIEMENT...');
    
    // Vérifier les options de paiement
    const cardOption = Array.from(document.querySelectorAll('input[type="radio"]'))
      .find(radio => radio.value === 'card');
    
    const promoOption = Array.from(document.querySelectorAll('input[type="radio"]'))
      .find(radio => radio.value === 'promo');
    
    if (cardOption) {
      console.log('✅ Option carte bancaire trouvée');
    } else {
      console.log('❌ Option carte bancaire manquante');
    }
    
    if (promoOption) {
      console.log('✅ Option code promo trouvée');
    } else {
      console.log('❌ Option code promo manquante');
    }
    
    // Tester le code promo
    this.testPromoCode();
  },
  
  // Test 5: Tester le code promo
  testPromoCode() {
    console.log('\n🔍 TEST DU CODE PROMO...');
    
    // Sélectionner l'option code promo
    const promoRadio = Array.from(document.querySelectorAll('input[type="radio"]'))
      .find(radio => radio.value === 'promo');
    
    if (promoRadio) {
      promoRadio.checked = true;
      promoRadio.dispatchEvent(new Event('change'));
      console.log('✅ Option code promo sélectionnée');
      
      // Chercher le champ code promo
      const promoInput = document.querySelector('input[placeholder*="code promo"]') ||
                        document.querySelector('input[placeholder*="promo"]');
      
      if (promoInput) {
        console.log('✅ Champ code promo trouvé');
        
        // Entrer le code promo
        promoInput.value = '082025';
        promoInput.dispatchEvent(new Event('input'));
        console.log('✅ Code promo 082025 saisi');
        
        // Chercher le bouton de validation
        const validateButton = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent?.includes('Valider'));
        
        if (validateButton) {
          console.log('✅ Bouton de validation trouvé');
          console.log('💡 Cliquez sur "Valider" pour tester l\'activation');
        } else {
          console.log('❌ Bouton de validation non trouvé');
        }
      } else {
        console.log('❌ Champ code promo non trouvé');
      }
    } else {
      console.log('❌ Option code promo non trouvée');
    }
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 TEST COMPLET - PAGE DE PAIEMENT DASHBOARD');
    console.log('=' .repeat(60));
    
    this.checkSubscriptionButtons();
    this.testSubscriptionButtonClick();
    
    console.log('\n💡 INSTRUCTIONS MANUELLES:');
    console.log('   1. Allez sur la page dashboard');
    console.log('   2. Cliquez sur "Mon abonnement" dans le menu');
    console.log('   3. Cliquez sur "Choisir Premium" ou "Choisir Pro"');
    console.log('   4. La page de paiement devrait s\'afficher');
    console.log('   5. Choisissez "Code promo"');
    console.log('   6. Entrez "082025" et validez');
    console.log('   7. Vérifiez l\'activation de l\'abonnement');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testPaymentPageDashboard = testPaymentPageDashboard;

console.log('📋 Script de test de la page de paiement Dashboard chargé !');
console.log('💡 Utilisez: testPaymentPageDashboard.runCompleteTest()'); 