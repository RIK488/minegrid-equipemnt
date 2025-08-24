// Script de test spécifique pour diagnostiquer le problème des 3 onglets
const test3TabsIssue = {
  
  // Test 1: Compter exactement les boutons présents
  countVisibleButtons() {
    console.log('🔍 COMPTAGE EXACT DES BOUTONS VISIBLES...');
    
    const actionCells = document.querySelectorAll('td:last-child');
    console.log(`📊 Cellules d'actions trouvées: ${actionCells.length}`);
    
    actionCells.forEach((cell, cellIndex) => {
      const buttons = cell.querySelectorAll('button');
      console.log(`\n📋 Cellule ${cellIndex + 1}:`);
      console.log(`   - Boutons trouvés: ${buttons.length}`);
      
      buttons.forEach((btn, btnIndex) => {
        const title = btn.getAttribute('title') || 'Sans titre';
        const isVisible = btn.offsetWidth > 0 && btn.offsetHeight > 0;
        const styles = window.getComputedStyle(btn);
        
        console.log(`     Bouton ${btnIndex + 1}: "${title}"`);
        console.log(`       - Visible: ${isVisible}`);
        console.log(`       - Dimensions: ${btn.offsetWidth}x${btn.offsetHeight}px`);
        console.log(`       - Display: ${styles.display}`);
        console.log(`       - Visibility: ${styles.visibility}`);
        console.log(`       - Classes: ${btn.className}`);
      });
    });
  },
  
  // Test 2: Vérifier les conditions qui pourraient masquer des boutons
  checkConditionalRendering() {
    console.log('\n🔍 VÉRIFICATION DES CONDITIONS DE RENDU...');
    
    // Vérifier les statuts des messages
    const messageRows = document.querySelectorAll('tbody tr');
    messageRows.forEach((row, index) => {
      const statusCell = row.querySelector('td:nth-child(4)'); // Colonne statut
      if (statusCell) {
        const status = statusCell.textContent?.trim();
        console.log(`📨 Message ${index + 1}: Statut = "${status}"`);
        
        // Vérifier si le statut affecte l'affichage des boutons
        const actionCell = row.querySelector('td:last-child');
        const buttons = actionCell?.querySelectorAll('button') || [];
        console.log(`   - Boutons d'actions: ${buttons.length}`);
      }
    });
  },
  
  // Test 3: Vérifier l'espace disponible
  checkAvailableSpace() {
    console.log('\n🔍 VÉRIFICATION DE L\'ESPACE DISPONIBLE...');
    
    const actionCells = document.querySelectorAll('td:last-child');
    actionCells.forEach((cell, index) => {
      const cellWidth = cell.offsetWidth;
      const buttons = cell.querySelectorAll('button');
      const totalButtonWidth = buttons.length * 30; // Estimation largeur par bouton
      
      console.log(`📋 Cellule ${index + 1}:`);
      console.log(`   - Largeur cellule: ${cellWidth}px`);
      console.log(`   - Boutons présents: ${buttons.length}`);
      console.log(`   - Largeur estimée nécessaire: ${totalButtonWidth}px`);
      console.log(`   - Espace suffisant: ${cellWidth >= totalButtonWidth ? 'OUI' : 'NON'}`);
      
      if (cellWidth < totalButtonWidth) {
        console.log(`   ⚠️ PROBLÈME: Largeur insuffisante !`);
      }
    });
  },
  
  // Test 4: Forcer l'affichage de tous les boutons
  forceAllButtonsVisible() {
    console.log('\n🔧 TENTATIVE DE FORCAGE DE L\'AFFICHAGE...');
    
    const actionCells = document.querySelectorAll('td:last-child');
    actionCells.forEach((cell, cellIndex) => {
      const buttons = cell.querySelectorAll('button');
      
      if (buttons.length < 4) {
        console.log(`⚠️ Cellule ${cellIndex + 1}: Seulement ${buttons.length}/4 boutons`);
        
        // Essayer de corriger l'espacement
        const flexContainer = cell.querySelector('.flex');
        if (flexContainer) {
          flexContainer.style.gap = '1px';
          flexContainer.style.flexWrap = 'nowrap';
          console.log(`   ✅ Espacement corrigé`);
        }
        
        // Forcer la visibilité de tous les boutons
        buttons.forEach((btn, btnIndex) => {
          btn.style.display = 'inline-flex';
          btn.style.visibility = 'visible';
          btn.style.opacity = '1';
          btn.style.minWidth = 'auto';
          console.log(`   ✅ Bouton ${btnIndex + 1} forcé visible`);
        });
      }
    });
  },
  
  // Test 5: Vérifier les imports d'icônes
  checkIconImports() {
    console.log('\n🔍 VÉRIFICATION DES IMPORTS D\'ICÔNES...');
    
    const expectedIcons = ['Eye', 'MessageSquare', 'Archive', 'Trash2'];
    const foundIcons = [];
    
    const actionCells = document.querySelectorAll('td:last-child');
    actionCells.forEach((cell) => {
      const buttons = cell.querySelectorAll('button');
      buttons.forEach((btn) => {
        const icon = btn.querySelector('svg');
        if (icon) {
          const iconName = this.getIconName(icon);
          if (iconName && !foundIcons.includes(iconName)) {
            foundIcons.push(iconName);
          }
        }
      });
    });
    
    console.log(`📊 Icônes trouvées: ${foundIcons.join(', ')}`);
    console.log(`📊 Icônes attendues: ${expectedIcons.join(', ')}`);
    
    const missingIcons = expectedIcons.filter(icon => !foundIcons.includes(icon));
    if (missingIcons.length > 0) {
      console.log(`❌ Icônes manquantes: ${missingIcons.join(', ')}`);
    }
  },
  
  // Fonction utilitaire pour identifier l'icône
  getIconName(svgElement) {
    // Logique simple pour identifier l'icône basée sur les classes ou attributs
    const classes = svgElement.className || '';
    if (classes.includes('eye') || classes.includes('Eye')) return 'Eye';
    if (classes.includes('message') || classes.includes('MessageSquare')) return 'MessageSquare';
    if (classes.includes('archive') || classes.includes('Archive')) return 'Archive';
    if (classes.includes('trash') || classes.includes('Trash2')) return 'Trash2';
    return 'Unknown';
  },
  
  // Test complet
  runCompleteDiagnostic() {
    console.log('🚀 DIAGNOSTIC COMPLET DU PROBLÈME DES 3 ONGLETS');
    console.log('=' .repeat(60));
    
    this.countVisibleButtons();
    this.checkConditionalRendering();
    this.checkAvailableSpace();
    this.checkIconImports();
    this.forceAllButtonsVisible();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ DIAGNOSTIC TERMINÉ');
    console.log('\n💡 CAUSES POSSIBLES:');
    console.log('   1. Largeur de colonne insuffisante');
    console.log('   2. Espacement trop important entre boutons');
    console.log('   3. Conditions de rendu basées sur le statut');
    console.log('   4. Imports d\'icônes manquants');
    console.log('   5. Styles CSS qui masquent certains boutons');
  }
};

// Exposer la fonction pour utilisation dans la console
window.test3TabsIssue = test3TabsIssue;

console.log('📋 Script de diagnostic des 3 onglets chargé !');
console.log('💡 Utilisez: test3TabsIssue.runCompleteDiagnostic()'); 