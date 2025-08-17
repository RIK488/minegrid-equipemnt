// Test pour vérifier que la fonctionnalité de réponse fonctionne en version gratuite
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test de la fonctionnalité de réponse en version gratuite');

// 1. Vérifier que l'utilisateur est connecté
async function testUserConnection() {
    console.log('1️⃣ Vérification de la connexion utilisateur...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('❌ Erreur de connexion:', error);
        return false;
    }
    
    if (!user) {
        console.error('❌ Aucun utilisateur connecté');
        return false;
    }
    
    console.log('✅ Utilisateur connecté:', user.email);
    return user;
}

// 2. Vérifier que les messages sont accessibles
async function testMessagesAccess(user) {
    console.log('2️⃣ Vérification de l\'accès aux messages...');
    
    const { data: messages, error } = await supabase
        .from('messages')
        .select(`
            *,
            machine:machines(name, brand, model, images)
        `)
        .eq('recipient_email', user.email)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('❌ Erreur accès messages:', error);
        return false;
    }
    
    console.log('✅ Messages accessibles:', messages?.length || 0);
    return messages || [];
}

// 3. Vérifier que le bouton Répondre est présent
function testReplyButtonPresence() {
    console.log('3️⃣ Vérification de la présence du bouton Répondre...');
    
    const replyButtons = document.querySelectorAll('button:contains("Répondre")');
    
    if (replyButtons.length === 0) {
        console.error('❌ Aucun bouton Répondre trouvé');
        return false;
    }
    
    console.log('✅ Boutons Répondre trouvés:', replyButtons.length);
    
    // Vérifier que les boutons sont cliquables
    replyButtons.forEach((button, index) => {
        const isDisabled = button.disabled;
        const isVisible = button.offsetParent !== null;
        console.log(`   Bouton ${index + 1}: ${isDisabled ? 'Désactivé' : 'Actif'} - ${isVisible ? 'Visible' : 'Caché'}`);
    });
    
    return replyButtons.length > 0;
}

// 4. Tester le clic sur le bouton Répondre
function testReplyButtonClick() {
    console.log('4️⃣ Test du clic sur le bouton Répondre...');
    
    const replyButtons = document.querySelectorAll('button:contains("Répondre")');
    
    if (replyButtons.length === 0) {
        console.error('❌ Aucun bouton Répondre à tester');
        return false;
    }
    
    // Cliquer sur le premier bouton Répondre
    const firstReplyButton = replyButtons[0];
    console.log('🖱️ Clic sur le premier bouton Répondre...');
    firstReplyButton.click();
    
    // Attendre que le modal apparaisse
    setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (modal) {
            console.log('✅ Modal de réponse ouvert avec succès');
            
            // Vérifier les éléments du modal
            const modalTitle = modal.querySelector('h3');
            const textarea = modal.querySelector('textarea');
            const sendButton = modal.querySelector('button:contains("Envoyer la réponse")');
            
            if (modalTitle) console.log('✅ Titre du modal présent');
            if (textarea) console.log('✅ Zone de texte présente');
            if (sendButton) console.log('✅ Bouton d\'envoi présent');
            
            // Fermer le modal
            const closeButton = modal.querySelector('button:contains("Annuler")');
            if (closeButton) {
                closeButton.click();
                console.log('✅ Modal fermé avec succès');
            }
            
        } else {
            console.error('❌ Modal de réponse non ouvert');
        }
    }, 1000);
    
    return true;
}

// 5. Tester l'envoi d'une réponse
async function testSendReply() {
    console.log('5️⃣ Test de l\'envoi d\'une réponse...');
    
    // Ouvrir le modal de réponse
    const replyButtons = document.querySelectorAll('button:contains("Répondre")');
    if (replyButtons.length === 0) {
        console.error('❌ Aucun bouton Répondre trouvé');
        return false;
    }
    
    replyButtons[0].click();
    
    // Attendre que le modal s'ouvre
    setTimeout(async () => {
        const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (!modal) {
            console.error('❌ Modal non ouvert');
            return;
        }
        
        // Remplir le formulaire
        const textarea = modal.querySelector('textarea');
        if (textarea) {
            textarea.value = 'Ceci est un test de réponse automatique pour vérifier que la fonctionnalité fonctionne en version gratuite.';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ Texte de réponse saisi');
        }
        
        // Cliquer sur Envoyer
        const sendButton = modal.querySelector('button:contains("Envoyer la réponse")');
        if (sendButton && !sendButton.disabled) {
            console.log('🖱️ Clic sur Envoyer la réponse...');
            sendButton.click();
            
            // Attendre le résultat
            setTimeout(() => {
                console.log('✅ Test d\'envoi de réponse terminé');
                console.log('📋 Vérifiez dans la console s\'il y a des erreurs');
            }, 3000);
            
        } else {
            console.error('❌ Bouton d\'envoi non disponible ou désactivé');
        }
        
    }, 1000);
    
    return true;
}

// 6. Test complet
async function runCompleteReplyTest() {
    console.log('🚀 Démarrage du test complet de réponse...');
    
    try {
        // Test 1: Connexion utilisateur
        const user = await testUserConnection();
        if (!user) return;
        
        // Test 2: Accès aux messages
        const messages = await testMessagesAccess(user);
        if (messages === false) return;
        
        // Test 3: Présence du bouton Répondre
        const buttonsPresent = testReplyButtonPresence();
        if (!buttonsPresent) return;
        
        // Test 4: Clic sur le bouton Répondre
        const clickWorks = testReplyButtonClick();
        if (!clickWorks) return;
        
        // Test 5: Envoi de réponse (optionnel)
        console.log('🎯 Pour tester l\'envoi de réponse, tapez: testSendReply()');
        
        console.log('🎉 Tests de base terminés avec succès !');
        console.log('📋 La fonctionnalité de réponse semble fonctionnelle en version gratuite');
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// 7. Vérifier les différences entre version gratuite et premium
function checkVersionDifferences() {
    console.log('6️⃣ Vérification des différences entre versions...');
    
    // Vérifier si l'utilisateur a un abonnement actif
    const hasActiveSubscription = localStorage.getItem('userSubscription') || 
                                 localStorage.getItem('tempSubscription') ||
                                 localStorage.getItem('enterpriseDashboardConfigured');
    
    console.log('📊 Statut abonnement:', hasActiveSubscription ? 'Actif' : 'Gratuit');
    
    // Vérifier les fonctionnalités disponibles
    const features = {
        messages: document.querySelector('[onclick*="messages"]') !== null,
        replyButton: document.querySelectorAll('button:contains("Répondre")').length > 0,
        modal: document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50') !== null
    };
    
    console.log('🔧 Fonctionnalités disponibles:');
    console.log(`   - Messages: ${features.messages ? '✅' : '❌'}`);
    console.log(`   - Bouton Répondre: ${features.replyButton ? '✅' : '❌'}`);
    console.log(`   - Modal de réponse: ${features.modal ? '✅' : '❌'}`);
    
    return features;
}

// Exporter les fonctions pour utilisation manuelle
window.testReponseGratuite = {
    runCompleteReplyTest,
    testSendReply,
    testUserConnection,
    testMessagesAccess,
    testReplyButtonPresence,
    testReplyButtonClick,
    checkVersionDifferences
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testReponseGratuite.runCompleteReplyTest()');
console.log('🎯 Pour tester l\'envoi de réponse, tapez: testReponseGratuite.testSendReply()');
console.log('🎯 Pour vérifier les différences, tapez: testReponseGratuite.checkVersionDifferences()'); 