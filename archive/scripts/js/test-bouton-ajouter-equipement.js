// Test pour vérifier le fonctionnement du bouton "Ajouter un équipement"
console.log("🧪 TEST BOUTON AJOUTER ÉQUIPEMENT");

function testBoutonAjouterEquipement() {
  try {
    // 1. Vérifier que nous sommes sur le portail pro
    if (!window.location.hash.includes('#pro')) {
      console.error("❌ Vous devez être sur le portail pro pour ce test");
      console.log("💡 Allez sur: localhost:5173/#pro");
      return;
    }

    console.log("✅ Page portail pro détectée");

    // 2. Vérifier que l'onglet équipement est actif
    const equipmentTab = document.querySelector('[data-tab="equipment"]') || 
                        document.querySelector('button[class*="equipment"]') ||
                        document.querySelector('button:contains("Équipements")');
    
    if (!equipmentTab) {
      console.log("🔄 Onglet équipement non trouvé, recherche en cours...");
      
      // Chercher tous les boutons d'onglets
      const allTabs = document.querySelectorAll('button');
      const equipmentTabButton = Array.from(allTabs).find(button => 
        button.textContent && button.textContent.includes('Équipements')
      );
      
      if (equipmentTabButton) {
        console.log("✅ Bouton onglet équipement trouvé, clic...");
        equipmentTabButton.click();
        
        // Attendre que l'onglet se charge
        setTimeout(() => {
          testBoutonAjouterEquipement();
        }, 500);
        return;
      } else {
        console.error("❌ Onglet équipement non trouvé");
        return;
      }
    }

    // 3. Chercher le bouton "Ajouter un équipement"
    const addButton = document.querySelector('button:contains("Ajouter un équipement")') ||
                     Array.from(document.querySelectorAll('button')).find(button => 
                       button.textContent && button.textContent.includes('Ajouter un équipement')
                     );

    if (!addButton) {
      console.error("❌ Bouton 'Ajouter un équipement' non trouvé");
      console.log("🔍 Recherche de tous les boutons...");
      
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach((button, index) => {
        if (button.textContent) {
          console.log(`  ${index}: "${button.textContent.trim()}"`);
        }
      });
      return;
    }

    console.log("✅ Bouton 'Ajouter un équipement' trouvé");

    // 4. Vérifier que le bouton a un gestionnaire d'événement
    const hasClickHandler = addButton.onclick || 
                           addButton.getAttribute('onclick') ||
                           addButton.addEventListener;

    if (!hasClickHandler) {
      console.warn("⚠️ Le bouton n'a pas de gestionnaire d'événement visible");
    } else {
      console.log("✅ Le bouton a un gestionnaire d'événement");
    }

    // 5. Simuler un clic sur le bouton
    console.log("🔄 Simulation d'un clic sur le bouton...");
    addButton.click();

    // 6. Vérifier si un modal s'ouvre
    setTimeout(() => {
      const modal = document.querySelector('.fixed.inset-0') ||
                   document.querySelector('[class*="modal"]') ||
                   document.querySelector('[class*="Modal"]');

      if (modal) {
        console.log("✅ Modal détecté après clic");
        
        // Vérifier le contenu du modal
        const modalTitle = modal.querySelector('h3, h2, h1');
        if (modalTitle) {
          console.log(`📋 Titre du modal: "${modalTitle.textContent}"`);
        }

        const modalButtons = modal.querySelectorAll('button');
        console.log(`🔘 Nombre de boutons dans le modal: ${modalButtons.length}`);

        // Chercher les options du modal
        const options = modal.querySelectorAll('[class*="border-2"]');
        if (options.length > 0) {
          console.log("✅ Options de type d'équipement trouvées:");
          options.forEach((option, index) => {
            const title = option.querySelector('h5');
            const description = option.querySelector('p');
            if (title) {
              console.log(`  ${index + 1}. ${title.textContent}`);
              if (description) {
                console.log(`     ${description.textContent}`);
              }
            }
          });
        }

        // Fermer le modal
        const closeButton = modal.querySelector('button[class*="text-gray-400"]') ||
                           modal.querySelector('button:contains("Annuler")') ||
                           modal.querySelector('button:contains("✕")');
        
        if (closeButton) {
          console.log("🔄 Fermeture du modal...");
          closeButton.click();
          console.log("✅ Modal fermé");
        }

      } else {
        console.error("❌ Aucun modal détecté après clic");
        console.log("🔍 Vérification des éléments DOM...");
        
        // Lister tous les éléments avec position fixed
        const fixedElements = document.querySelectorAll('[style*="position: fixed"], [class*="fixed"]');
        console.log(`📌 Éléments avec position fixed: ${fixedElements.length}`);
        
        fixedElements.forEach((el, index) => {
          console.log(`  ${index}: ${el.tagName} - ${el.className}`);
        });
      }
    }, 1000);

    console.log("✅ Test du bouton 'Ajouter un équipement' terminé");

  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

// Fonction pour tester manuellement
function testManuel() {
  console.log("🔧 TEST MANUEL - Instructions:");
  console.log("1. Allez sur l'onglet 'Équipements'");
  console.log("2. Cliquez sur le bouton 'Ajouter un équipement'");
  console.log("3. Vérifiez qu'un modal s'ouvre avec 2 options:");
  console.log("   - Annonce d'équipement (redirige vers #publication)");
  console.log("   - Équipement Pro (ferme le modal)");
  console.log("4. Testez les deux options");
}

// Exécuter le test automatique
testBoutonAjouterEquipement();

// Exposer les fonctions pour les tests manuels
window.testBoutonAjouterEquipement = testBoutonAjouterEquipement;
window.testManuel = testManuel; 