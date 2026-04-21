// Test pour vérifier le fonctionnement du formulaire d'équipement Pro
console.log("🧪 TEST FORMULAIRE ÉQUIPEMENT PRO");

function testFormulaireEquipementPro() {
  try {
    // 1. Vérifier que nous sommes sur le portail pro
    if (!window.location.hash.includes('#pro')) {
      console.error("❌ Vous devez être sur le portail pro pour ce test");
      console.log("💡 Allez sur: localhost:5173/#pro");
      return;
    }

    console.log("✅ Page portail pro détectée");

    // 2. Aller sur l'onglet équipement
    console.log("🔄 Navigation vers l'onglet équipement...");
    
    const equipmentTab = Array.from(document.querySelectorAll('button')).find(button => 
      button.textContent && button.textContent.includes('Équipements')
    );
    
    if (equipmentTab) {
      equipmentTab.click();
      console.log("✅ Onglet équipement cliqué");
      
      // Attendre que l'onglet se charge
      setTimeout(() => {
        testBoutonAjouterEquipement();
      }, 500);
    } else {
      console.error("❌ Onglet équipement non trouvé");
    }

  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

function testBoutonAjouterEquipement() {
  try {
    // 3. Chercher le bouton "Ajouter un équipement"
    const addButton = Array.from(document.querySelectorAll('button')).find(button => 
      button.textContent && button.textContent.includes('Ajouter un équipement')
    );

    if (!addButton) {
      console.error("❌ Bouton 'Ajouter un équipement' non trouvé");
      return;
    }

    console.log("✅ Bouton 'Ajouter un équipement' trouvé");

    // 4. Cliquer sur le bouton
    console.log("🔄 Clic sur le bouton 'Ajouter un équipement'...");
    addButton.click();

    // 5. Attendre que le modal s'ouvre
    setTimeout(() => {
      testModalChoix();
    }, 500);

  } catch (error) {
    console.error("❌ Erreur lors du test du bouton:", error);
  }
}

function testModalChoix() {
  try {
    // 6. Vérifier que le modal de choix s'est ouvert
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) {
      console.error("❌ Modal de choix non trouvé");
      return;
    }

    console.log("✅ Modal de choix ouvert");

    // 7. Chercher le bouton "Équipement Pro"
    const proButton = Array.from(modal.querySelectorAll('button')).find(button => 
      button.textContent && button.textContent.includes('Équipement Pro')
    );

    if (!proButton) {
      console.error("❌ Bouton 'Équipement Pro' non trouvé");
      return;
    }

    console.log("✅ Bouton 'Équipement Pro' trouvé");

    // 8. Cliquer sur "Équipement Pro"
    console.log("🔄 Clic sur 'Équipement Pro'...");
    proButton.click();

    // 9. Attendre que le formulaire s'ouvre
    setTimeout(() => {
      testFormulaire();
    }, 500);

  } catch (error) {
    console.error("❌ Erreur lors du test du modal de choix:", error);
  }
}

function testFormulaire() {
  try {
    // 10. Vérifier que le formulaire s'est ouvert
    const formModal = document.querySelector('.fixed.inset-0');
    if (!formModal) {
      console.error("❌ Formulaire non trouvé");
      return;
    }

    console.log("✅ Formulaire d'équipement Pro ouvert");

    // 11. Vérifier les champs du formulaire
    const requiredFields = [
      'Numéro de série',
      'Type d\'équipement'
    ];

    const formFields = formModal.querySelectorAll('label');
    console.log(`📋 Nombre de champs trouvés: ${formFields.length}`);

    requiredFields.forEach(fieldName => {
      const field = Array.from(formFields).find(label => 
        label.textContent && label.textContent.includes(fieldName)
      );
      
      if (field) {
        console.log(`✅ Champ requis trouvé: ${fieldName}`);
      } else {
        console.log(`⚠️ Champ requis manquant: ${fieldName}`);
      }
    });

    // 12. Tester le remplissage du formulaire
    console.log("🔄 Test de remplissage du formulaire...");
    
    // Numéro de série
    const serialInput = formModal.querySelector('input[type="text"]');
    if (serialInput) {
      serialInput.value = 'TEST-001';
      serialInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Numéro de série rempli: TEST-001");
    }

    // Type d'équipement
    const typeSelect = formModal.querySelector('select');
    if (typeSelect) {
      typeSelect.value = 'Pelle hydraulique';
      typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log("✅ Type d'équipement sélectionné: Pelle hydraulique");
    }

    // Marque
    const brandInputs = formModal.querySelectorAll('input[type="text"]');
    if (brandInputs.length > 1) {
      brandInputs[1].value = 'CAT';
      brandInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Marque remplie: CAT");
    }

    // Modèle
    if (brandInputs.length > 2) {
      brandInputs[2].value = '320D';
      brandInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Modèle rempli: 320D");
    }

    // 13. Vérifier le bouton de soumission
    const submitButton = formModal.querySelector('button[type="submit"]');
    if (submitButton) {
      console.log("✅ Bouton de soumission trouvé");
      console.log(`📝 Texte du bouton: "${submitButton.textContent}"`);
      
      // Vérifier si le bouton est désactivé
      if (submitButton.disabled) {
        console.log("⚠️ Bouton de soumission désactivé (normal si validation requise)");
      } else {
        console.log("✅ Bouton de soumission actif");
      }
    } else {
      console.error("❌ Bouton de soumission non trouvé");
    }

    // 14. Tester la fermeture du formulaire
    const closeButton = formModal.querySelector('button[class*="text-gray-400"]');
    if (closeButton) {
      console.log("✅ Bouton de fermeture trouvé");
      
      // Fermer le formulaire
      console.log("🔄 Fermeture du formulaire...");
      closeButton.click();
      console.log("✅ Formulaire fermé");
    }

    console.log("✅ Test du formulaire d'équipement Pro terminé avec succès");

  } catch (error) {
    console.error("❌ Erreur lors du test du formulaire:", error);
  }
}

// Fonction pour tester manuellement
function testManuel() {
  console.log("🔧 TEST MANUEL - Instructions:");
  console.log("1. Allez sur l'onglet 'Équipements'");
  console.log("2. Cliquez sur 'Ajouter un équipement'");
  console.log("3. Cliquez sur 'Équipement Pro'");
  console.log("4. Vérifiez que le formulaire s'ouvre avec tous les champs");
  console.log("5. Remplissez les champs obligatoires:");
  console.log("   - Numéro de série: TEST-001");
  console.log("   - Type d'équipement: Pelle hydraulique");
  console.log("6. Cliquez sur 'Ajouter l'équipement'");
  console.log("7. Vérifiez que l'équipement apparaît dans la liste");
}

// Exécuter le test automatique
testFormulaireEquipementPro();

// Exposer les fonctions pour les tests manuels
window.testFormulaireEquipementPro = testFormulaireEquipementPro;
window.testManuel = testManuel; 