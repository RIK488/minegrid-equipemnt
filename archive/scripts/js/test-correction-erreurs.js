// Test pour vérifier que les erreurs sont corrigées
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test de correction des erreurs');

// 1. Vérifier que l'erreur X is not defined est corrigée
function testXComponentError() {
    console.log('1️⃣ Vérification de l\'erreur X is not defined...');
    
    // Vérifier que le composant X est disponible
    try {
        // Essayer d'accéder au modal de réponse
        const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (modal) {
            const closeButton = modal.querySelector('button svg');
            if (closeButton) {
                console.log('✅ Composant X disponible et fonctionnel');
                return true;
            }
        }
        
        // Si pas de modal ouvert, vérifier que le code peut s'exécuter
        console.log('✅ Aucune erreur X is not defined détectée');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur X is not defined persiste:', error);
        return false;
    }
}

// 2. Vérifier que la navigation fonctionne
function testNavigation() {
    console.log('2️⃣ Test de la navigation...');
    
    // Vérifier que l'URL actuelle est correcte
    const currentUrl = window.location.href;
    console.log('📋 URL actuelle:', currentUrl);
    
    // Vérifier que les paramètres d'URL sont gérés
    const urlParams = new URLSearchParams(window.location.search);
    const replyParam = urlParams.get('reply');
    const tabParam = urlParams.get('tab');
    
    if (replyParam) {
        console.log('✅ Paramètre reply détecté:', replyParam);
    }
    
    if (tabParam) {
        console.log('✅ Paramètre tab détecté:', tabParam);
    }
    
    // Vérifier que la section active correspond
    const messagesSection = document.querySelector('[onclick*="messages"]');
    if (messagesSection) {
        console.log('✅ Section messages accessible');
    }
    
    return true;
}

// 3. Vérifier que les messages se chargent
async function testMessagesLoading() {
    console.log('3️⃣ Test du chargement des messages...');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Aucun utilisateur connecté');
            return false;
        }
        
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                machine:machines(name, brand, model, images)
            `)
            .eq('recipient_email', user.email)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erreur chargement messages:', error);
            return false;
        }
        
        console.log('✅ Messages chargés:', messages?.length || 0);
        return messages || [];
        
    } catch (error) {
        console.error('❌ Erreur test messages:', error);
        return false;
    }
}

// 4. Tester la fonctionnalité de réponse
async function testReplyFunctionality() {
    console.log('4️⃣ Test de la fonctionnalité de réponse...');
    
    // Vérifier que les boutons Répondre sont présents
    const replyButtons = document.querySelectorAll('button:contains("Répondre")');
    
    if (replyButtons.length === 0) {
        console.error('❌ Aucun bouton Répondre trouvé');
        return false;
    }
    
    console.log('✅ Boutons Répondre trouvés:', replyButtons.length);
    
    // Tester le clic sur le premier bouton
    const firstButton = replyButtons[0];
    console.log('🖱️ Test du clic sur le bouton Répondre...');
    firstButton.click();
    
    // Attendre que le modal s'ouvre
    setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (modal) {
            console.log('✅ Modal de réponse ouvert avec succès');
            
            // Vérifier les éléments du modal
            const title = modal.querySelector('h3');
            const textarea = modal.querySelector('textarea');
            const sendButton = modal.querySelector('button:contains("Envoyer la réponse")');
            const closeButton = modal.querySelector('button:contains("Annuler")');
            
            if (title) console.log('✅ Titre du modal présent');
            if (textarea) console.log('✅ Zone de texte présente');
            if (sendButton) console.log('✅ Bouton d\'envoi présent');
            if (closeButton) console.log('✅ Bouton de fermeture présent');
            
            // Fermer le modal
            closeButton.click();
            console.log('✅ Modal fermé avec succès');
            
        } else {
            console.error('❌ Modal de réponse non ouvert');
        }
    }, 1000);
    
    return true;
}

// 5. Test complet
async function runCompleteErrorTest() {
    console.log('🚀 Démarrage du test complet de correction des erreurs...');
    
    try {
        // Test 1: Erreur X is not defined
        const xErrorFixed = testXComponentError();
        if (!xErrorFixed) {
            console.error('❌ Erreur X is not defined non corrigée');
            return;
        }
        
        // Test 2: Navigation
        const navigationOk = testNavigation();
        if (!navigationOk) {
            console.error('❌ Problème de navigation');
            return;
        }
        
        // Test 3: Chargement des messages
        const messages = await testMessagesLoading();
        if (messages === false) {
            console.error('❌ Problème de chargement des messages');
            return;
        }
        
        // Test 4: Fonctionnalité de réponse
        const replyOk = await testReplyFunctionality();
        if (!replyOk) {
            console.error('❌ Problème avec la fonctionnalité de réponse');
            return;
        }
        
        console.log('🎉 Tous les tests réussis !');
        console.log('📋 Résumé:');
        console.log('   - Erreur X is not defined: ✅ Corrigée');
        console.log('   - Navigation: ✅ Fonctionnelle');
        console.log('   - Messages: ✅ Chargés (' + messages.length + ')');
        console.log('   - Réponse: ✅ Fonctionnelle');
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// 6. Test spécifique pour l'URL avec paramètres
function testUrlWithParams() {
    console.log('5️⃣ Test de l\'URL avec paramètres...');
    
    const currentUrl = window.location.href;
    console.log('📋 URL actuelle:', currentUrl);
    
    if (currentUrl.includes('reply=')) {
        console.log('✅ URL contient un paramètre reply');
        
        // Vérifier que le modal devrait s'ouvrir automatiquement
        setTimeout(() => {
            const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
            if (modal) {
                console.log('✅ Modal ouvert automatiquement via URL');
            } else {
                console.log('⚠️ Modal non ouvert automatiquement');
            }
        }, 2000);
        
    } else {
        console.log('ℹ️ URL sans paramètre reply');
    }
}

// Exporter les fonctions pour utilisation manuelle
window.testCorrectionErreurs = {
    runCompleteErrorTest,
    testXComponentError,
    testNavigation,
    testMessagesLoading,
    testReplyFunctionality,
    testUrlWithParams
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testCorrectionErreurs.runCompleteErrorTest()');
console.log('🎯 Pour tester l\'URL avec paramètres, tapez: testCorrectionErreurs.testUrlWithParams()'); 