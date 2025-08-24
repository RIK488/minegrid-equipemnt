// Script de test pour diagnostiquer la visibilité des onglets d'actions
const testActionTabsVisibility = {
  
  // Test 1: Vérifier la présence des 4 onglets dans le DOM
  checkAllTabsPresent() {
    console.log('🔍 Vérification de la présence des 4 onglets d\'actions...');
    
    const actionButtons = document.querySelectorAll('button[title*="message"]');
    console.log(`📊 Nombre de boutons d'actions trouvés: ${actionButtons.length}`);
    
    const expectedTitles = [
      'Voir le message',
      'Répondre au message', 
      'Archiver le message',
      'Supprimer le message'
    ];
    
    expectedTitles.forEach(title => {
      const button = document.querySelector(`button[title="${title}"]`);
      if (button) {
        console.log(`✅ ${title}: PRÉSENT`);
        console.log(`   - Classes: ${button.className}`);
        console.log(`   - Visible: ${button.offsetWidth > 0 && button.offsetHeight > 0}`);
        console.log(`   - Parent: ${button.parentElement?.className}`);
      } else {
        console.log(`❌ ${title}: MANQUANT`);
      }
    });
  },
  
  // Test 2: Vérifier l'espacement et la largeur
  checkLayoutIssues() {
    console.log('\n🔍 Vérification des problèmes de mise en page...');
    
    const actionCells = document.querySelectorAll('td:last-child');
    console.log(`📊 Cellules d'actions trouvées: ${actionCells.length}`);
    
    actionCells.forEach((cell, index) => {
      console.log(`\n📋 Cellule ${index + 1}:`);
      console.log(`   - Largeur: ${cell.offsetWidth}px`);
      console.log(`   - Hauteur: ${cell.offsetHeight}px`);
      console.log(`   - Classes: ${cell.className}`);
      
      const buttons = cell.querySelectorAll('button');
      console.log(`   - Boutons dans la cellule: ${buttons.length}`);
      
      buttons.forEach((btn, btnIndex) => {
        console.log(`     Bouton ${btnIndex + 1}: ${btn.offsetWidth}x${btn.offsetHeight}px`);
        console.log(`     - Classes: ${btn.className}`);
        console.log(`     - Visible: ${btn.offsetWidth > 0 && btn.offsetHeight > 0}`);
      });
    });
  },
  
  // Test 3: Vérifier les styles CSS
  checkCSSStyles() {
    console.log('\n🔍 Vérification des styles CSS...');
    
    const actionButtons = document.querySelectorAll('button[title*="message"]');
    actionButtons.forEach((btn, index) => {
      const styles = window.getComputedStyle(btn);
      console.log(`\n🎨 Bouton ${index + 1} (${btn.title}):`);
      console.log(`   - Display: ${styles.display}`);
      console.log(`   - Visibility: ${styles.visibility}`);
      console.log(`   - Opacity: ${styles.opacity}`);
      console.log(`   - Width: ${styles.width}`);
      console.log(`   - Height: ${styles.height}`);
      console.log(`   - Margin: ${styles.margin}`);
      console.log(`   - Padding: ${styles.padding}`);
    });
  },
  
  // Test 4: Corriger les problèmes de visibilité
  fixVisibilityIssues() {
    console.log('\n🔧 Tentative de correction des problèmes de visibilité...');
    
    // Vérifier si le conteneur parent a assez d'espace
    const actionCells = document.querySelectorAll('td:last-child');
    actionCells.forEach((cell, index) => {
      const buttons = cell.querySelectorAll('button');
      const totalButtonWidth = buttons.length * 40; // Estimation de la largeur par bouton
      
      if (cell.offsetWidth < totalButtonWidth) {
        console.log(`⚠️ Cellule ${index + 1}: Largeur insuffisante (${cell.offsetWidth}px < ${totalButtonWidth}px)`);
        
        // Essayer de corriger en réduisant l'espacement
        const flexContainer = cell.querySelector('.flex');
        if (flexContainer) {
          flexContainer.style.gap = '2px';
          console.log(`   ✅ Espacement réduit pour la cellule ${index + 1}`);
        }
      }
    });
    
    // Vérifier que tous les boutons sont visibles
    const actionButtons = document.querySelectorAll('button[title*="message"]');
    actionButtons.forEach((btn, index) => {
      if (btn.offsetWidth === 0 || btn.offsetHeight === 0) {
        console.log(`⚠️ Bouton ${index + 1} (${btn.title}) invisible, tentative de correction...`);
        btn.style.display = 'inline-flex';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
      }
    });
  },
  
  // Test 5: Vérifier les permissions et conditions
  checkPermissions() {
    console.log('\n🔍 Vérification des permissions et conditions...');
    
    // Vérifier si l'utilisateur est connecté
    const user = window.supabase?.auth?.user();
    console.log(`👤 Utilisateur connecté: ${user ? 'OUI' : 'NON'}`);
    
    // Vérifier les permissions de messages
    const canSendMessages = window.canSendMessages || true; // Valeur par défaut
    console.log(`📨 Permission d'envoi de messages: ${canSendMessages}`);
    
    // Vérifier les permissions d'archivage
    const canArchiveMessages = true; // Valeur par défaut
    console.log(`📦 Permission d'archivage: ${canArchiveMessages}`);
    
    // Vérifier les permissions de suppression
    const canDeleteMessages = true; // Valeur par défaut
    console.log(`🗑️ Permission de suppression: ${canDeleteMessages}`);
  },
  
  // Test complet
  runCompleteTest() {
    console.log('🚀 DÉBUT DU TEST COMPLET DES ONGLETS D\'ACTIONS');
    console.log('=' .repeat(50));
    
    this.checkAllTabsPresent();
    this.checkLayoutIssues();
    this.checkCSSStyles();
    this.checkPermissions();
    this.fixVisibilityIssues();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ TEST TERMINÉ');
    console.log('\n💡 Si seulement 2 onglets sont visibles, cela peut être dû à:');
    console.log('   1. Largeur insuffisante de la cellule');
    console.log('   2. Espacement trop important entre les boutons');
    console.log('   3. Styles CSS qui masquent certains boutons');
    console.log('   4. Permissions insuffisantes');
    console.log('   5. Conditions JavaScript qui masquent les boutons');
  }
};

// Exposer la fonction pour utilisation dans la console
window.testActionTabsVisibility = testActionTabsVisibility;

console.log('📋 Script de test des onglets d\'actions chargé !');
console.log('💡 Utilisez: testActionTabsVisibility.runCompleteTest()'); 