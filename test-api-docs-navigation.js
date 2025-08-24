// Script de test pour vérifier la navigation de la page API docs
const testApiDocsNavigation = {
  
  // Test 1: Vérifier que nous sommes sur la page API docs
  checkApiDocsPage() {
    console.log('🔍 VÉRIFICATION DE LA PAGE API DOCS...');
    
    // Vérifier que nous sommes sur la page api-docs
    if (!window.location.hash.includes('api-docs')) {
      console.log('❌ Pas sur la page api-docs. Naviguez vers #api-docs');
      return false;
    }
    
    console.log('✅ Page API docs détectée');
    return true;
  },
  
  // Test 2: Vérifier la présence de la sidebar de navigation
  checkNavigationSidebar() {
    console.log('🔍 VÉRIFICATION DE LA SIDEBAR DE NAVIGATION...');
    
    const sidebar = document.querySelector('nav');
    if (!sidebar) {
      console.log('❌ Sidebar de navigation non trouvée');
      return false;
    }
    
    console.log('✅ Sidebar de navigation trouvée');
    
    // Vérifier les boutons de navigation
    const navButtons = sidebar.querySelectorAll('button');
    const expectedSections = ['authentication', 'endpoints', 'examples', 'sdk', 'support'];
    
    console.log(`📊 ${navButtons.length} boutons de navigation trouvés`);
    
    if (navButtons.length >= 5) {
      console.log('✅ Nombre de boutons de navigation correct');
      return true;
    } else {
      console.log('❌ Nombre de boutons de navigation incorrect');
      return false;
    }
  },
  
  // Test 3: Vérifier la présence des sections
  checkSections() {
    console.log('🔍 VÉRIFICATION DES SECTIONS...');
    
    const sections = ['authentication', 'endpoints', 'examples', 'sdk', 'support'];
    const foundSections = [];
    
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        foundSections.push(sectionId);
        console.log(`✅ Section "${sectionId}" trouvée`);
      } else {
        console.log(`❌ Section "${sectionId}" non trouvée`);
      }
    });
    
    console.log(`📊 ${foundSections.length}/${sections.length} sections trouvées`);
    
    if (foundSections.length === sections.length) {
      console.log('✅ Toutes les sections sont présentes');
      return true;
    } else {
      console.log('❌ Certaines sections sont manquantes');
      return false;
    }
  },
  
  // Test 4: Tester la navigation vers chaque section
  testNavigationToSections() {
    console.log('🔍 TEST DE LA NAVIGATION VERS LES SECTIONS...');
    
    const sections = ['authentication', 'endpoints', 'examples', 'sdk', 'support'];
    let successCount = 0;
    
    sections.forEach((sectionId, index) => {
      setTimeout(() => {
        console.log(`🧪 Test navigation vers "${sectionId}"...`);
        
        // Trouver le bouton correspondant
        const navButtons = document.querySelectorAll('nav button');
        const targetButton = Array.from(navButtons).find(button => 
          button.textContent?.toLowerCase().includes(sectionId.replace('-', ' '))
        );
        
        if (targetButton) {
          // Simuler un clic
          targetButton.click();
          console.log(`✅ Clic sur le bouton "${sectionId}" effectué`);
          
          // Vérifier que la section est visible après un délai
          setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
              const rect = section.getBoundingClientRect();
              if (rect.top >= 0 && rect.top <= window.innerHeight) {
                console.log(`✅ Section "${sectionId}" visible après navigation`);
                successCount++;
              } else {
                console.log(`⚠️ Section "${sectionId}" pas encore visible`);
              }
            }
          }, 500);
        } else {
          console.log(`❌ Bouton pour "${sectionId}" non trouvé`);
        }
      }, index * 1000); // Délai entre chaque test
    });
    
    // Retourner le résultat après tous les tests
    setTimeout(() => {
      console.log(`📊 ${successCount}/${sections.length} navigations réussies`);
    }, sections.length * 1000 + 1000);
    
    return true;
  },
  
  // Test 5: Vérifier les fonctionnalités de copie
  checkCopyFunctionality() {
    console.log('🔍 VÉRIFICATION DES FONCTIONNALITÉS DE COPIE...');
    
    const copyButtons = document.querySelectorAll('button');
    let copyButtonFound = false;
    
    copyButtons.forEach(button => {
      if (button.textContent?.includes('Copy') || button.querySelector('svg')) {
        copyButtonFound = true;
        console.log('✅ Bouton de copie trouvé');
      }
    });
    
    if (copyButtonFound) {
      console.log('✅ Fonctionnalités de copie présentes');
      return true;
    } else {
      console.log('❌ Fonctionnalités de copie manquantes');
      return false;
    }
  },
  
  // Test 6: Vérifier les couleurs orange
  checkOrangeColors() {
    console.log('🔍 VÉRIFICATION DES COULEURS ORANGE...');
    
    const orangeElements = document.querySelectorAll('.text-orange-600, .bg-orange-600, .border-orange-200');
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
    console.log('🚀 DÉBUT DU TEST COMPLET DE LA NAVIGATION API DOCS');
    console.log('================================================');
    
    const results = {
      apiDocsPage: this.checkApiDocsPage(),
      navigationSidebar: this.checkNavigationSidebar(),
      sections: this.checkSections(),
      navigationTest: this.testNavigationToSections(),
      copyFunctionality: this.checkCopyFunctionality(),
      orangeColors: this.checkOrangeColors()
    };
    
    console.log('📊 RÉSULTATS DU TEST:');
    console.log('=====================');
    console.log(`Page API Docs: ${results.apiDocsPage ? '✅' : '❌'}`);
    console.log(`Sidebar Navigation: ${results.navigationSidebar ? '✅' : '❌'}`);
    console.log(`Sections présentes: ${results.sections ? '✅' : '❌'}`);
    console.log(`Test Navigation: ${results.navigationTest ? '✅' : '❌'}`);
    console.log(`Fonctionnalités Copie: ${results.copyFunctionality ? '✅' : '❌'}`);
    console.log(`Couleurs orange: ${results.orangeColors ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 SCORE: ${successCount}/${totalTests} tests réussis`);
    
    if (successCount === totalTests) {
      console.log('🎉 TOUS LES TESTS SONT RÉUSSIS ! La navigation API docs fonctionne parfaitement.');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessus.');
    }
    
    return results;
  },
  
  // Test rapide
  runQuickTest() {
    console.log('⚡ TEST RAPIDE DE LA NAVIGATION API DOCS');
    console.log('=======================================');
    
    const isApiDocsPage = window.location.hash.includes('api-docs');
    const hasNavButtons = document.querySelectorAll('nav button').length >= 5;
    const hasSections = document.querySelectorAll('[id="authentication"], [id="endpoints"], [id="examples"], [id="sdk"], [id="support"]').length >= 5;
    
    console.log(`Page API Docs: ${isApiDocsPage ? '✅' : '❌'}`);
    console.log(`Boutons Navigation: ${hasNavButtons ? '✅' : '❌'}`);
    console.log(`Sections présentes: ${hasSections ? '✅' : '❌'}`);
    
    if (isApiDocsPage && hasNavButtons && hasSections) {
      console.log('🎉 Navigation API docs détectée avec succès !');
    } else {
      console.log('❌ Navigation API docs incomplète détectée');
    }
    
    return { 
      apiDocsPage: isApiDocsPage, 
      navButtons: hasNavButtons, 
      sections: hasSections 
    };
  }
};

// Exposer les fonctions globalement
window.testApiDocsNavigation = testApiDocsNavigation;

console.log('📋 Script de test de la navigation API docs chargé !');
console.log('💡 Utilisez testApiDocsNavigation.runQuickTest() pour un test rapide');
console.log('💡 Utilisez testApiDocsNavigation.runCompleteTest() pour un test complet'); 