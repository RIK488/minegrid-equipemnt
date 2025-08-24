// Script de test pour vérifier les services 5 et 6
const testServices5And6 = {
  
  // Test 1: Vérifier la page Services
  checkServicesPage() {
    console.log('🔍 VÉRIFICATION DE LA PAGE SERVICES...');
    
    // Vérifier que nous sommes sur la page services
    if (!window.location.hash.includes('dashboard/services')) {
      console.log('❌ Pas sur la page services. Naviguez vers #dashboard/services');
      return false;
    }
    
    console.log('✅ Page services détectée');
    return true;
  },
  
  // Test 2: Vérifier le service 5 (Support prioritaire)
  checkService5() {
    console.log('🔍 VÉRIFICATION DU SERVICE 5 - SUPPORT PRIORITAIRE...');
    
    const service5Elements = document.querySelectorAll('div');
    let service5Found = false;
    let hasContactButton = false;
    let hasAvailableBadge = false;
    
    service5Elements.forEach(element => {
      if (element.textContent?.includes('Support prioritaire 24/7')) {
        service5Found = true;
        console.log('✅ Service 5 trouvé');
        
        // Vérifier les boutons
        const buttons = element.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.textContent?.includes('Disponible')) {
            hasAvailableBadge = true;
            console.log('✅ Badge "Disponible" trouvé');
          }
          if (button.textContent?.includes('Contacter')) {
            hasContactButton = true;
            console.log('✅ Bouton "Contacter" trouvé');
          }
        });
      }
    });
    
    if (!service5Found) {
      console.log('❌ Service 5 non trouvé');
      return false;
    }
    
    if (!hasAvailableBadge) {
      console.log('⚠️ Badge "Disponible" manquant');
    }
    
    if (!hasContactButton) {
      console.log('⚠️ Bouton "Contacter" manquant');
    }
    
    return service5Found;
  },
  
  // Test 3: Vérifier le service 6 (API d'intégration)
  checkService6() {
    console.log('🔍 VÉRIFICATION DU SERVICE 6 - API D\'INTÉGRATION...');
    
    const service6Elements = document.querySelectorAll('div');
    let service6Found = false;
    let hasAccessButton = false;
    let hasAvailableBadge = false;
    
    service6Elements.forEach(element => {
      if (element.textContent?.includes('API d\'intégration')) {
        service6Found = true;
        console.log('✅ Service 6 trouvé');
        
        // Vérifier les boutons
        const buttons = element.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.textContent?.includes('Disponible')) {
            hasAvailableBadge = true;
            console.log('✅ Badge "Disponible" trouvé');
          }
          if (button.textContent?.includes('Accéder')) {
            hasAccessButton = true;
            console.log('✅ Bouton "Accéder" trouvé');
          }
        });
      }
    });
    
    if (!service6Found) {
      console.log('❌ Service 6 non trouvé');
      return false;
    }
    
    if (!hasAvailableBadge) {
      console.log('⚠️ Badge "Disponible" manquant');
    }
    
    if (!hasAccessButton) {
      console.log('⚠️ Bouton "Accéder" manquant');
    }
    
    return service6Found;
  },
  
  // Test 4: Vérifier les liens vers les pages dédiées
  checkServiceLinks() {
    console.log('🔍 VÉRIFICATION DES LIENS VERS LES PAGES DÉDIÉES...');
    
    let service5Clickable = false;
    let service6Clickable = false;
    
    // Vérifier les éléments cliquables
    const clickableElements = document.querySelectorAll('[onclick*="priority-support"], [onclick*="api-docs"]');
    
    clickableElements.forEach(element => {
      if (element.getAttribute('onclick')?.includes('priority-support')) {
        service5Clickable = true;
        console.log('✅ Service 5 cliquable (lien vers priority-support)');
      }
      if (element.getAttribute('onclick')?.includes('api-docs')) {
        service6Clickable = true;
        console.log('✅ Service 6 cliquable (lien vers api-docs)');
      }
    });
    
    if (!service5Clickable) {
      console.log('❌ Service 5 non cliquable');
    }
    
    if (!service6Clickable) {
      console.log('❌ Service 6 non cliquable');
    }
    
    return service5Clickable && service6Clickable;
  },
  
  // Test 5: Vérifier les couleurs orange
  checkOrangeColors() {
    console.log('🔍 VÉRIFICATION DES COULEURS ORANGE...');
    
    const orangeElements = document.querySelectorAll('.bg-orange-600, .text-orange-600, .border-orange-300');
    let orangeCount = 0;
    
    orangeElements.forEach(element => {
      if (element.className.includes('orange')) {
        orangeCount++;
      }
    });
    
    console.log(`✅ ${orangeCount} éléments avec couleurs orange trouvés`);
    
    if (orangeCount > 0) {
      console.log('✅ Couleurs orange respectées');
      return true;
    } else {
      console.log('❌ Aucune couleur orange trouvée');
      return false;
    }
  },
  
  // Test 6: Vérifier la page API Docs
  checkApiDocsPage() {
    console.log('🔍 VÉRIFICATION DE LA PAGE API DOCS...');
    
    // Naviguer vers la page API docs
    window.location.hash = '#api-docs';
    
    setTimeout(() => {
      const apiDocsElements = document.querySelectorAll('h1, h2, h3');
      let apiDocsFound = false;
      
      apiDocsElements.forEach(element => {
        if (element.textContent?.includes('Documentation API')) {
          apiDocsFound = true;
          console.log('✅ Page API Docs trouvée');
        }
      });
      
      if (!apiDocsFound) {
        console.log('❌ Page API Docs non trouvée');
      }
      
      // Revenir à la page services
      setTimeout(() => {
        window.location.hash = '#dashboard/services';
      }, 2000);
      
    }, 1000);
    
    return true;
  },
  
  // Test 7: Vérifier la page Support Prioritaire
  checkPrioritySupportPage() {
    console.log('🔍 VÉRIFICATION DE LA PAGE SUPPORT PRIORITAIRE...');
    
    // Naviguer vers la page support prioritaire
    window.location.hash = '#priority-support';
    
    setTimeout(() => {
      const supportElements = document.querySelectorAll('h1, h2, h3');
      let supportFound = false;
      
      supportElements.forEach(element => {
        if (element.textContent?.includes('Support Prioritaire 24/7')) {
          supportFound = true;
          console.log('✅ Page Support Prioritaire trouvée');
        }
      });
      
      if (!supportFound) {
        console.log('❌ Page Support Prioritaire non trouvée');
      }
      
      // Revenir à la page services
      setTimeout(() => {
        window.location.hash = '#dashboard/services';
      }, 2000);
      
    }, 1000);
    
    return true;
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 DÉBUT DU TEST COMPLET DES SERVICES 5 ET 6');
    console.log('==========================================');
    
    const results = {
      servicesPage: this.checkServicesPage(),
      service5: this.checkService5(),
      service6: this.checkService6(),
      serviceLinks: this.checkServiceLinks(),
      orangeColors: this.checkOrangeColors()
    };
    
    console.log('📊 RÉSULTATS DU TEST:');
    console.log('=====================');
    console.log(`Page Services: ${results.servicesPage ? '✅' : '❌'}`);
    console.log(`Service 5 (Support): ${results.service5 ? '✅' : '❌'}`);
    console.log(`Service 6 (API): ${results.service6 ? '✅' : '❌'}`);
    console.log(`Liens fonctionnels: ${results.serviceLinks ? '✅' : '❌'}`);
    console.log(`Couleurs orange: ${results.orangeColors ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 SCORE: ${successCount}/${totalTests} tests réussis`);
    
    if (successCount === totalTests) {
      console.log('🎉 TOUS LES TESTS SONT RÉUSSIS ! Les services 5 et 6 sont parfaitement implémentés.');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessus.');
    }
    
    return results;
  },
  
  // Test rapide
  runQuickTest() {
    console.log('⚡ TEST RAPIDE DES SERVICES 5 ET 6');
    console.log('==================================');
    
    const service5Exists = document.querySelector('div')?.textContent?.includes('Support prioritaire 24/7');
    const service6Exists = document.querySelector('div')?.textContent?.includes('API d\'intégration');
    
    console.log(`Service 5 (Support): ${service5Exists ? '✅' : '❌'}`);
    console.log(`Service 6 (API): ${service6Exists ? '✅' : '❌'}`);
    
    if (service5Exists && service6Exists) {
      console.log('🎉 Services 5 et 6 détectés avec succès !');
    } else {
      console.log('❌ Services manquants détectés');
    }
    
    return { service5: service5Exists, service6: service6Exists };
  }
};

// Exposer les fonctions globalement
window.testServices5And6 = testServices5And6;

console.log('📋 Script de test des services 5 et 6 chargé !');
console.log('💡 Utilisez testServices5And6.runQuickTest() pour un test rapide');
console.log('💡 Utilisez testServices5And6.runCompleteTest() pour un test complet'); 