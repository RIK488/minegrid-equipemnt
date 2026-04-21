// Test pour vérifier l'affichage des onglets d'actions dans Messages ProDashboard
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test des onglets d\'actions Messages ProDashboard');

// 1. Vérifier que ProDashboard est accessible
function testProDashboardAccess() {
    console.log('1️⃣ Vérification de l\'accès ProDashboard...');
    
    const currentUrl = window.location.href;
    const isProDashboard = currentUrl.includes('pro-dashboard') || 
                          document.querySelector('[data-testid="pro-dashboard"]') ||
                          document.querySelector('.pro-dashboard');
    
    if (isProDashboard) {
        console.log('✅ ProDashboard accessible');
        return true;
    } else {
        console.log('⚠️ Pas sur ProDashboard, navigation nécessaire');
        window.location.href = '/#pro-dashboard';
        return false;
    }
}

// 2. Vérifier l'affichage des onglets d'actions
function testActionTabs() {
    console.log('2️⃣ Vérification des onglets d\'actions...');
    
    // Vérifier que la table des messages est présente
    const messagesTable = document.querySelector('table');
    if (!messagesTable) {
        console.error('❌ Table des messages non trouvée');
        return false;
    }
    
    console.log('✅ Table des messages trouvée');
    
    // Vérifier les en-têtes de colonnes
    const headers = messagesTable.querySelectorAll('th');
    const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
    console.log('📋 En-têtes de colonnes:', headerTexts);
    
    // Vérifier que la colonne Actions existe
    const actionsHeader = Array.from(headers).find(h => h.textContent?.includes('Actions'));
    if (!actionsHeader) {
        console.error('❌ Colonne Actions non trouvée');
        return false;
    }
    
    console.log('✅ Colonne Actions trouvée');
    
    // Vérifier les boutons d'actions dans les lignes
    const actionCells = messagesTable.querySelectorAll('td:last-child');
    console.log('📊 Cellules d\'actions trouvées:', actionCells.length);
    
    if (actionCells.length === 0) {
        console.error('❌ Aucune cellule d\'action trouvée');
        return false;
    }
    
    // Analyser la première cellule d'action
    const firstActionCell = actionCells[0];
    const actionButtons = firstActionCell.querySelectorAll('button');
    
    console.log('🔘 Boutons d\'action trouvés:', actionButtons.length);
    
    // Vérifier chaque bouton
    const expectedActions = ['Voir', 'Répondre', 'Archiver', 'Supprimer'];
    const foundActions = [];
    
    actionButtons.forEach((button, index) => {
        const title = button.getAttribute('title') || button.textContent?.trim();
        const icon = button.querySelector('svg');
        const iconClass = icon?.className || '';
        
        console.log(`🔘 Bouton ${index + 1}:`, {
            title: title,
            iconClass: iconClass,
            visible: button.offsetParent !== null
        });
        
        foundActions.push(title);
    });
    
    // Vérifier que tous les boutons attendus sont présents
    const missingActions = expectedActions.filter(action => 
        !foundActions.some(found => found?.includes(action))
    );
    
    if (missingActions.length > 0) {
        console.error('❌ Actions manquantes:', missingActions);
        return false;
    }
    
    console.log('✅ Toutes les actions sont présentes');
    return true;
}

// 3. Tester les fonctionnalités des boutons
function testButtonFunctionality() {
    console.log('3️⃣ Test des fonctionnalités des boutons...');
    
    const messagesTable = document.querySelector('table');
    if (!messagesTable) {
        console.error('❌ Table des messages non trouvée');
        return false;
    }
    
    const actionCells = messagesTable.querySelectorAll('td:last-child');
    if (actionCells.length === 0) {
        console.error('❌ Aucune cellule d\'action trouvée');
        return false;
    }
    
    const firstActionCell = actionCells[0];
    const actionButtons = firstActionCell.querySelectorAll('button');
    
    // Tester chaque bouton
    actionButtons.forEach((button, index) => {
        const title = button.getAttribute('title') || button.textContent?.trim();
        
        console.log(`🔘 Test du bouton "${title}"...`);
        
        // Vérifier que le bouton est cliquable
        if (button.disabled) {
            console.warn(`⚠️ Bouton "${title}" est désactivé`);
        } else {
            console.log(`✅ Bouton "${title}" est cliquable`);
        }
        
        // Vérifier les styles
        const styles = window.getComputedStyle(button);
        const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden';
        
        if (!isVisible) {
            console.warn(`⚠️ Bouton "${title}" n'est pas visible`);
        } else {
            console.log(`✅ Bouton "${title}" est visible`);
        }
    });
    
    return true;
}

// 4. Vérifier les modals associés
function testModals() {
    console.log('4️⃣ Vérification des modals...');
    
    // Vérifier les modals existants
    const modals = document.querySelectorAll('.fixed.inset-0');
    console.log('📋 Modals trouvés:', modals.length);
    
    // Vérifier les modals spécifiques
    const viewModal = document.querySelector('[data-testid="view-message-modal"]');
    const replyModal = document.querySelector('[data-testid="reply-message-modal"]');
    const archiveModal = document.querySelector('[data-testid="archive-message-modal"]');
    
    if (viewModal) console.log('✅ Modal de visualisation trouvé');
    if (replyModal) console.log('✅ Modal de réponse trouvé');
    if (archiveModal) console.log('✅ Modal d\'archivage trouvé');
    
    return true;
}

// 5. Test complet
function runCompleteActionTabsTest() {
    console.log('🚀 Démarrage du test complet des onglets d\'actions...');
    
    try {
        // Test 1: Accès ProDashboard
        const dashboardAccess = testProDashboardAccess();
        if (!dashboardAccess) {
            console.log('⚠️ Navigation vers ProDashboard en cours...');
            return;
        }
        
        // Attendre que la page se charge
        setTimeout(() => {
            // Test 2: Onglets d'actions
            const actionTabsOk = testActionTabs();
            if (!actionTabsOk) {
                console.error('❌ Test arrêté: onglets d\'actions incorrects');
                return;
            }
            
            // Test 3: Fonctionnalités des boutons
            const buttonFunctionalityOk = testButtonFunctionality();
            if (!buttonFunctionalityOk) {
                console.error('❌ Test arrêté: fonctionnalités des boutons incorrectes');
                return;
            }
            
            // Test 4: Modals
            const modalsOk = testModals();
            if (!modalsOk) {
                console.warn('⚠️ Modals incomplets');
            }
            
            console.log('🎉 Tous les tests réussis !');
            console.log('📋 Résumé:');
            console.log('   - Accès ProDashboard: ✅ OK');
            console.log('   - Onglets d\'actions: ✅ OK');
            console.log('   - Fonctionnalités des boutons: ✅ OK');
            console.log('   - Modals: ' + (modalsOk ? '✅ OK' : '⚠️ Partiel'));
            
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// 6. Test spécifique pour les actions manquantes
function testMissingActions() {
    console.log('5️⃣ Test spécifique pour les actions manquantes...');
    
    const messagesTable = document.querySelector('table');
    if (!messagesTable) {
        console.error('❌ Table des messages non trouvée');
        return;
    }
    
    const actionCells = messagesTable.querySelectorAll('td:last-child');
    if (actionCells.length === 0) {
        console.error('❌ Aucune cellule d\'action trouvée');
        return;
    }
    
    const firstActionCell = actionCells[0];
    const actionButtons = firstActionCell.querySelectorAll('button');
    
    console.log('🔍 Analyse détaillée des boutons d\'action:');
    
    actionButtons.forEach((button, index) => {
        const title = button.getAttribute('title');
        const text = button.textContent?.trim();
        const icon = button.querySelector('svg');
        const iconName = icon?.className?.includes('Eye') ? 'Eye' :
                        icon?.className?.includes('MessageSquare') ? 'MessageSquare' :
                        icon?.className?.includes('Archive') ? 'Archive' :
                        icon?.className?.includes('Trash2') ? 'Trash2' : 'Inconnu';
        
        console.log(`🔘 Bouton ${index + 1}:`, {
            title: title,
            text: text,
            icon: iconName,
            visible: button.offsetParent !== null,
            styles: {
                display: window.getComputedStyle(button).display,
                visibility: window.getComputedStyle(button).visibility,
                opacity: window.getComputedStyle(button).opacity
            }
        });
    });
}

// Exporter les fonctions
window.testActionTabs = {
    runCompleteActionTabsTest,
    testProDashboardAccess,
    testActionTabs,
    testButtonFunctionality,
    testModals,
    testMissingActions
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testActionTabs.runCompleteActionTabsTest()');
console.log('🎯 Pour analyser les actions manquantes, tapez: testActionTabs.testMissingActions()'); 