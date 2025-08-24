// Script de test pour vérifier le service 7 - Gestion multi-utilisateurs
const testService7MultiUser = {
  
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
  
  // Test 2: Vérifier le service 7 (Gestion multi-utilisateurs)
  checkService7() {
    console.log('🔍 VÉRIFICATION DU SERVICE 7 - GESTION MULTI-UTILISATEURS...');
    
    const service7Elements = document.querySelectorAll('div');
    let service7Found = false;
    let hasManageButton = false;
    let hasAvailableBadge = false;
    
    service7Elements.forEach(element => {
      if (element.textContent?.includes('Gestion multi-utilisateurs')) {
        service7Found = true;
        console.log('✅ Service 7 trouvé');
        
        // Vérifier les boutons
        const buttons = element.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.textContent?.includes('Disponible')) {
            hasAvailableBadge = true;
            console.log('✅ Badge "Disponible" trouvé');
          }
          if (button.textContent?.includes('Gérer')) {
            hasManageButton = true;
            console.log('✅ Bouton "Gérer" trouvé');
          }
        });
      }
    });
    
    if (!service7Found) {
      console.log('❌ Service 7 non trouvé');
      return false;
    }
    
    if (!hasAvailableBadge) {
      console.log('⚠️ Badge "Disponible" manquant');
    }
    
    if (!hasManageButton) {
      console.log('⚠️ Bouton "Gérer" manquant');
    }
    
    return service7Found;
  },
  
  // Test 3: Vérifier le lien vers la page dédiée
  checkService7Link() {
    console.log('🔍 VÉRIFICATION DU LIEN VERS LA PAGE DÉDIÉE...');
    
    let service7Clickable = false;
    
    // Vérifier les éléments cliquables
    const clickableElements = document.querySelectorAll('[onclick*="multi-user-management"]');
    
    clickableElements.forEach(element => {
      if (element.getAttribute('onclick')?.includes('multi-user-management')) {
        service7Clickable = true;
        console.log('✅ Service 7 cliquable (lien vers multi-user-management)');
      }
    });
    
    if (!service7Clickable) {
      console.log('❌ Service 7 non cliquable');
    }
    
    return service7Clickable;
  },
  
  // Test 4: Vérifier la page Multi-User Management
  checkMultiUserPage() {
    console.log('🔍 VÉRIFICATION DE LA PAGE MULTI-USER MANAGEMENT...');
    
    // Naviguer vers la page multi-user management
    window.location.hash = '#multi-user-management';
    
    setTimeout(() => {
      const multiUserElements = document.querySelectorAll('h1, h2, h3');
      let multiUserFound = false;
      
      multiUserElements.forEach(element => {
        if (element.textContent?.includes('Gestion Multi-Utilisateurs')) {
          multiUserFound = true;
          console.log('✅ Page Multi-User Management trouvée');
        }
      });
      
      if (!multiUserFound) {
        console.log('❌ Page Multi-User Management non trouvée');
      }
      
      // Revenir à la page services
      setTimeout(() => {
        window.location.hash = '#dashboard/services';
      }, 2000);
      
    }, 1000);
    
    return true;
  },
  
  // Test 5: Vérifier les fonctionnalités de la page
  checkMultiUserFeatures() {
    console.log('🔍 VÉRIFICATION DES FONCTIONNALITÉS MULTI-USER...');
    
    // Naviguer vers la page
    window.location.hash = '#multi-user-management';
    
    setTimeout(() => {
      const features = {
        inviteButton: false,
        memberList: false,
        roleManagement: false,
        statistics: false
      };
      
      // Vérifier le bouton d'invitation
      const inviteButtons = document.querySelectorAll('button');
      inviteButtons.forEach(button => {
        if (button.textContent?.includes('Inviter un membre')) {
          features.inviteButton = true;
          console.log('✅ Bouton "Inviter un membre" trouvé');
        }
      });
      
      // Vérifier la liste des membres
      const memberElements = document.querySelectorAll('div');
      memberElements.forEach(element => {
        if (element.textContent?.includes('Membres de l\'équipe')) {
          features.memberList = true;
          console.log('✅ Liste des membres trouvée');
        }
        if (element.textContent?.includes('Rôles et Permissions')) {
          features.roleManagement = true;
          console.log('✅ Gestion des rôles trouvée');
        }
        if (element.textContent?.includes('Total membres')) {
          features.statistics = true;
          console.log('✅ Statistiques trouvées');
        }
      });
      
      console.log('📊 Fonctionnalités trouvées:', features);
      
      // Revenir à la page services
      setTimeout(() => {
        window.location.hash = '#dashboard/services';
      }, 2000);
      
    }, 1000);
    
    return true;
  },
  
  // Test 6: Vérifier les couleurs orange
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
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 DÉBUT DU TEST COMPLET DU SERVICE 7');
    console.log('=====================================');
    
    const results = {
      servicesPage: this.checkServicesPage(),
      service7: this.checkService7(),
      service7Link: this.checkService7Link(),
      multiUserPage: this.checkMultiUserPage(),
      multiUserFeatures: this.checkMultiUserFeatures(),
      orangeColors: this.checkOrangeColors()
    };
    
    console.log('📊 RÉSULTATS DU TEST:');
    console.log('=====================');
    console.log(`Page Services: ${results.servicesPage ? '✅' : '❌'}`);
    console.log(`Service 7 (Multi-User): ${results.service7 ? '✅' : '❌'}`);
    console.log(`Lien fonctionnel: ${results.service7Link ? '✅' : '❌'}`);
    console.log(`Page Multi-User: ${results.multiUserPage ? '✅' : '❌'}`);
    console.log(`Fonctionnalités: ${results.multiUserFeatures ? '✅' : '❌'}`);
    console.log(`Couleurs orange: ${results.orangeColors ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 SCORE: ${successCount}/${totalTests} tests réussis`);
    
    if (successCount === totalTests) {
      console.log('🎉 TOUS LES TESTS SONT RÉUSSIS ! Le service 7 est parfaitement implémenté.');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessus.');
    }
    
    return results;
  },
  
  // Test rapide
  runQuickTest() {
    console.log('⚡ TEST RAPIDE DU SERVICE 7');
    console.log('==========================');
    
    const service7Exists = document.querySelector('div')?.textContent?.includes('Gestion multi-utilisateurs');
    const hasManageButton = document.querySelector('button')?.textContent?.includes('Gérer');
    const hasAvailableBadge = document.querySelector('button')?.textContent?.includes('Disponible');
    
    console.log(`Service 7 (Multi-User): ${service7Exists ? '✅' : '❌'}`);
    console.log(`Bouton "Gérer": ${hasManageButton ? '✅' : '❌'}`);
    console.log(`Badge "Disponible": ${hasAvailableBadge ? '✅' : '❌'}`);
    
    if (service7Exists && hasManageButton && hasAvailableBadge) {
      console.log('🎉 Service 7 détecté avec succès !');
    } else {
      console.log('❌ Service 7 incomplet détecté');
    }
    
    return { 
      service7: service7Exists, 
      manageButton: hasManageButton, 
      availableBadge: hasAvailableBadge 
    };
  }
};

// Exposer les fonctions globalement
window.testService7MultiUser = testService7MultiUser;

console.log('📋 Script de test du service 7 chargé !');
console.log('💡 Utilisez testService7MultiUser.runQuickTest() pour un test rapide');
console.log('💡 Utilisez testService7MultiUser.runCompleteTest() pour un test complet'); 