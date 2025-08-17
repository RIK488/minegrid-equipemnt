// Test pour vérifier la fonctionnalité de réponse dans ProDashboard
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test de la fonctionnalité de réponse ProDashboard');

// 1. Vérifier que l'utilisateur est connecté
async function testUserConnection() {
    console.log('1️⃣ Vérification de la connexion utilisateur...');
    
    try {
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
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        return false;
    }
}

// 2. Vérifier que ProDashboard est accessible
function testProDashboardAccess() {
    console.log('2️⃣ Vérification de l\'accès ProDashboard...');
    
    // Vérifier si on est sur la page ProDashboard
    const currentUrl = window.location.href;
    const isProDashboard = currentUrl.includes('pro-dashboard') || 
                          document.querySelector('[data-testid="pro-dashboard"]') ||
                          document.querySelector('.pro-dashboard');
    
    if (isProDashboard) {
        console.log('✅ ProDashboard accessible');
        return true;
    } else {
        console.log('⚠️ Pas sur ProDashboard, navigation nécessaire');
        // Naviguer vers ProDashboard
        window.location.href = '/#pro-dashboard';
        return false;
    }
}

// 3. Tester la création d'un message de test
async function testMessageCreation(user) {
    console.log('3️⃣ Création d\'un message de test...');
    
    try {
        const testMessage = {
            sender_email: 'test-sender@example.com',
            sender_name: 'Test Sender',
            recipient_email: user.email,
            subject: 'Message de test pour ProDashboard',
            message: 'Ceci est un message de test pour tester la réponse dans ProDashboard',
            status: 'new',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('messages')
            .insert(testMessage)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erreur création message de test:', error);
            return false;
        }
        
        console.log('✅ Message de test créé:', data.id);
        return data;
        
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
        return false;
    }
}

// 4. Tester la fonctionnalité de réponse
async function testReplyFunctionality(user, testMessage) {
    console.log('4️⃣ Test de la fonctionnalité de réponse...');
    
    try {
        // Simuler une réponse
        const replyData = {
            sender_email: user.email,
            sender_name: user.user_metadata?.full_name || 'Test User',
            recipient_email: testMessage.sender_email,
            subject: `Réponse - ${testMessage.subject}`,
            message: 'Ceci est une réponse de test depuis ProDashboard',
            parent_message_id: testMessage.id,
            status: 'new'
        };
        
        const { data: reply, error: replyError } = await supabase
            .from('messages')
            .insert(replyData)
            .select()
            .single();
        
        if (replyError) {
            console.error('❌ Erreur lors de la réponse:', replyError);
            return false;
        }
        
        console.log('✅ Réponse créée avec succès:', reply.id);
        
        // Nettoyer les tests
        await supabase.from('messages').delete().eq('id', testMessage.id);
        await supabase.from('messages').delete().eq('id', reply.id);
        
        console.log('✅ Messages de test supprimés');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors du test de réponse:', error);
        return false;
    }
}

// 5. Vérifier l'interface utilisateur
function testUserInterface() {
    console.log('5️⃣ Vérification de l\'interface utilisateur...');
    
    // Vérifier les éléments de l'interface
    const elements = {
        messagesTab: document.querySelector('[data-testid="messages-tab"]') || 
                    document.querySelector('button:contains("Messages")'),
        replyButton: document.querySelector('[data-testid="reply-button"]') || 
                    document.querySelector('button:contains("Répondre")'),
        replyModal: document.querySelector('[data-testid="reply-modal"]') || 
                   document.querySelector('.modal:contains("Répondre")')
    };
    
    let allElementsFound = true;
    
    Object.entries(elements).forEach(([name, element]) => {
        if (element) {
            console.log(`✅ ${name} trouvé`);
        } else {
            console.log(`⚠️ ${name} non trouvé`);
            allElementsFound = false;
        }
    });
    
    return allElementsFound;
}

// 6. Test complet
async function runCompleteProDashboardTest() {
    console.log('🚀 Démarrage du test complet ProDashboard...');
    
    try {
        // Test 1: Connexion utilisateur
        const user = await testUserConnection();
        if (!user) {
            console.error('❌ Test arrêté: utilisateur non connecté');
            return;
        }
        
        // Test 2: Accès ProDashboard
        const dashboardAccess = testProDashboardAccess();
        if (!dashboardAccess) {
            console.log('⚠️ Navigation vers ProDashboard en cours...');
            return;
        }
        
        // Test 3: Création message de test
        const testMessage = await testMessageCreation(user);
        if (!testMessage) {
            console.error('❌ Test arrêté: création message échouée');
            return;
        }
        
        // Test 4: Fonctionnalité de réponse
        const replyOk = await testReplyFunctionality(user, testMessage);
        if (!replyOk) {
            console.error('❌ Test arrêté: réponse échouée');
            return;
        }
        
        // Test 5: Interface utilisateur
        const uiOk = testUserInterface();
        if (!uiOk) {
            console.warn('⚠️ Interface utilisateur incomplète');
        }
        
        console.log('🎉 Tous les tests ProDashboard réussis !');
        console.log('📋 Résumé:');
        console.log('   - Connexion utilisateur: ✅ OK');
        console.log('   - Accès ProDashboard: ✅ OK');
        console.log('   - Création de messages: ✅ OK');
        console.log('   - Fonctionnalité de réponse: ✅ OK');
        console.log('   - Interface utilisateur: ' + (uiOk ? '✅ OK' : '⚠️ Partiel'));
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// 7. Test spécifique pour l'erreur de l'image
async function testSpecificError() {
    console.log('6️⃣ Test spécifique pour l\'erreur de l\'image...');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('❌ Aucun utilisateur connecté');
            return;
        }
        
        // Vérifier si l'erreur client_users persiste
        const { data: clientUsers, error: clientUsersError } = await supabase
            .from('client_users')
            .select('*')
            .limit(1);
        
        if (clientUsersError) {
            console.log('⚠️ Erreur client_users détectée:', clientUsersError.message);
            console.log('💡 Cette erreur peut affecter la fonctionnalité de réponse');
        } else {
            console.log('✅ Table client_users accessible');
        }
        
        // Vérifier la structure de la table messages
        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .limit(1);
        
        if (messagesError) {
            console.error('❌ Erreur table messages:', messagesError);
        } else {
            console.log('✅ Table messages accessible');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test spécifique:', error);
    }
}

// Exporter les fonctions pour utilisation manuelle
window.testProDashboard = {
    runCompleteProDashboardTest,
    testUserConnection,
    testProDashboardAccess,
    testMessageCreation,
    testReplyFunctionality,
    testUserInterface,
    testSpecificError
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testProDashboard.runCompleteProDashboardTest()');
console.log('🎯 Pour tester l\'erreur spécifique, tapez: testProDashboard.testSpecificError()'); 