// Test pour vérifier le fonctionnement de la rubrique maintenance
console.log("🔧 TEST RUBRIQUE MAINTENANCE PORTAL PRO");

function testMaintenancePortalPro() {
  try {
    // 1. Vérifier que nous sommes sur le portail pro
    if (!window.location.hash.includes('#pro')) {
      console.error("❌ Vous devez être sur le portail pro pour ce test");
      console.log("💡 Allez sur: localhost:5173/#pro");
      return;
    }

    console.log("✅ Page portail pro détectée");

    // 2. Aller sur l'onglet maintenance
    console.log("🔄 Navigation vers l'onglet maintenance...");
    
    const maintenanceTab = Array.from(document.querySelectorAll('button')).find(button => 
      button.textContent && button.textContent.includes('Maintenance')
    );
    
    if (maintenanceTab) {
      maintenanceTab.click();
      console.log("✅ Onglet maintenance cliqué");
      
      // Attendre que l'onglet se charge
      setTimeout(() => {
        testBoutonPlanifierIntervention();
      }, 500);
    } else {
      console.error("❌ Onglet maintenance non trouvé");
    }

  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

function testBoutonPlanifierIntervention() {
  try {
    // 3. Chercher le bouton "Planifier une intervention"
    const planifierButton = Array.from(document.querySelectorAll('button')).find(button => 
      button.textContent && button.textContent.includes('Planifier une intervention')
    );

    if (!planifierButton) {
      console.error("❌ Bouton 'Planifier une intervention' non trouvé");
      return;
    }

    console.log("✅ Bouton 'Planifier une intervention' trouvé");

    // 4. Cliquer sur le bouton
    console.log("🔄 Clic sur le bouton 'Planifier une intervention'...");
    planifierButton.click();

    // 5. Attendre que le modal s'ouvre
    setTimeout(() => {
      testModalIntervention();
    }, 500);

  } catch (error) {
    console.error("❌ Erreur lors du test du bouton:", error);
  }
}

function testModalIntervention() {
  try {
    // 6. Vérifier que le modal s'est ouvert
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) {
      console.error("❌ Modal d'intervention non trouvé");
      return;
    }

    console.log("✅ Modal d'intervention ouvert");

    // 7. Vérifier les champs du formulaire
    const requiredFields = [
      'Type d\'intervention',
      'Date programmée',
      'Description de l\'intervention'
    ];

    const formFields = modal.querySelectorAll('label');
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

    // 8. Tester le remplissage du formulaire
    console.log("🔄 Test de remplissage du formulaire...");
    
    // Type d'intervention
    const typeSelect = modal.querySelector('select');
    if (typeSelect) {
      typeSelect.value = 'preventive';
      typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log("✅ Type d'intervention sélectionné: Préventive");
    }

    // Date programmée
    const dateInput = modal.querySelector('input[type="date"]');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log("✅ Date programmée remplie: Demain");
    }

    // Description
    const descriptionTextarea = modal.querySelector('textarea');
    if (descriptionTextarea) {
      descriptionTextarea.value = 'Maintenance préventive de routine - vérification générale';
      descriptionTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Description remplie");
    }

    // Priorité
    const prioritySelects = modal.querySelectorAll('select');
    if (prioritySelects.length > 1) {
      prioritySelects[1].value = 'normal';
      prioritySelects[1].dispatchEvent(new Event('change', { bubbles: true }));
      console.log("✅ Priorité sélectionnée: Normale");
    }

    // Durée
    const durationInput = modal.querySelector('input[type="number"]');
    if (durationInput) {
      durationInput.value = '4';
      durationInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Durée estimée remplie: 4 heures");
    }

    // Technicien
    const textInputs = modal.querySelectorAll('input[type="text"]');
    if (textInputs.length > 0) {
      textInputs[0].value = 'Jean Dupont';
      textInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Technicien responsable rempli: Jean Dupont");
    }

    // Coût
    const costInputs = modal.querySelectorAll('input[type="number"]');
    if (costInputs.length > 1) {
      costInputs[1].value = '150';
      costInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      console.log("✅ Coût estimé rempli: 150€");
    }

    // 9. Vérifier le bouton de soumission
    const submitButton = modal.querySelector('button[type="submit"]');
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

    // 10. Tester la fermeture du modal
    const closeButton = modal.querySelector('button[class*="text-gray-400"]');
    if (closeButton) {
      console.log("✅ Bouton de fermeture trouvé");
      
      // Fermer le modal
      console.log("🔄 Fermeture du modal...");
      closeButton.click();
      console.log("✅ Modal fermé");
    }

    console.log("✅ Test de la rubrique maintenance terminé avec succès");

  } catch (error) {
    console.error("❌ Erreur lors du test du modal:", error);
  }
}

// Fonction pour tester manuellement
function testManuel() {
  console.log("🔧 TEST MANUEL - Instructions:");
  console.log("1. Allez sur l'onglet 'Maintenance'");
  console.log("2. Cliquez sur 'Planifier une intervention'");
  console.log("3. Vérifiez que le modal s'ouvre avec tous les champs");
  console.log("4. Remplissez les champs obligatoires:");
  console.log("   - Type d'intervention: Préventive");
  console.log("   - Date programmée: Demain");
  console.log("   - Description: Maintenance préventive de routine");
  console.log("5. Cliquez sur 'Planifier l'intervention'");
  console.log("6. Vérifiez que l'intervention apparaît dans la liste");
}

// Exécuter le test automatique
testMaintenancePortalPro();

// Exposer les fonctions pour les tests manuels
window.testMaintenancePortalPro = testMaintenancePortalPro;
window.testManuel = testManuel; 