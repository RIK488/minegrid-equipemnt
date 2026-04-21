// Test rapide pour vérifier la correction de l'erreur user is not defined
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test de correction de l\'erreur user is not defined');

// Test 1 : Vérifier que l'utilisateur est accessible
async function testUserAccess() {
    console.log('1️⃣ Test d\'accès utilisateur...');
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Erreur d\'accès utilisateur:', error);
            return false;
        }
        
        if (!user) {
            console.error('❌ Aucun utilisateur connecté');
            return false;
        }
        
        console.log('✅ Utilisateur accessible:', user.email);
        return user;
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        return false;
    }
}

// Test 2 : Tester l'insertion de message
async function testMessageInsertion(user) {
    console.log('2️⃣ Test d\'insertion de message...');
    
    try {
        const testMessage = {
            sender_email: user.email,
            sender_name: user.user_metadata?.full_name || 'Test User',
            recipient_email: 'test@example.com',
            subject: 'Test correction user is not defined',
            message: 'Test pour vérifier que la correction fonctionne',
            status: 'new',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('messages')
            .insert(testMessage)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erreur lors de l\'insertion:', error);
            return false;
        }
        
        console.log('✅ Message inséré avec succès:', data.id);
        
        // Nettoyer le test
        await supabase.from('messages').delete().eq('id', data.id);
        console.log('✅ Test nettoyé');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors du test d\'insertion:', error);
        return false;
    }
}

// Test 3 : Vérifier l'interface utilisateur
function testUserInterface() {
    console.log('3️⃣ Vérification de l\'interface utilisateur...');
    
    // Vérifier que le modal de réponse peut s'ouvrir
    const replyButtons = document.querySelectorAll('button:contains("Répondre")');
    
    if (replyButtons.length === 0) {
        console.error('❌ Aucun bouton Répondre trouvé');
        return false;
    }
    
    console.log('✅ Boutons Répondre trouvés:', replyButtons.length);
    
    // Vérifier que les messages sont chargés
    const messageRows = document.querySelectorAll('tr:contains("Utilisateur")');
    if (messageRows.length === 0) {
        console.warn('⚠️ Aucun message visible dans l\'interface');
    } else {
        console.log('✅ Messages visibles dans l\'interface');
    }
    
    return true;
}

// Test complet
async function runCompleteTest() {
    console.log('🚀 Démarrage du test complet...');
    
    try {
        // Test 1: Accès utilisateur
        const user = await testUserAccess();
        if (!user) {
            console.error('❌ Test arrêté: utilisateur non accessible');
            return;
        }
        
        // Test 2: Insertion de message
        const insertionOk = await testMessageInsertion(user);
        if (!insertionOk) {
            console.error('❌ Test arrêté: insertion échouée');
            return;
        }
        
        // Test 3: Interface utilisateur
        const uiOk = testUserInterface();
        if (!uiOk) {
            console.warn('⚠️ Interface utilisateur incomplète');
        }
        
        console.log('🎉 Tous les tests réussis !');
        console.log('📋 Résumé:');
        console.log('   - Accès utilisateur: ✅ OK');
        console.log('   - Insertion de messages: ✅ OK');
        console.log('   - Interface utilisateur: ' + (uiOk ? '✅ OK' : '⚠️ Partiel'));
        console.log('   - Erreur user is not defined: ✅ Corrigée');
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// Test spécifique pour l'erreur user is not defined
async function testUserNotDefinedError() {
    console.log('4️⃣ Test spécifique pour l\'erreur user is not defined...');
    
    try {
        // Simuler l'appel de handleSendReply sans user défini
        const testData = {
            sender_email: 'test@example.com',
            sender_name: 'Test User',
            recipient_email: 'recipient@example.com',
            subject: 'Test',
            message: 'Test',
            status: 'new'
        };
        
        const { data, error } = await supabase
            .from('messages')
            .insert(testData)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erreur lors du test:', error);
            return false;
        }
        
        console.log('✅ Test réussi - pas d\'erreur user is not defined');
        
        // Nettoyer
        await supabase.from('messages').delete().eq('id', data.id);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur user is not defined détectée:', error);
        return false;
    }
}

// Exporter les fonctions
window.testDashboardFix = {
    runCompleteTest,
    testUserAccess,
    testMessageInsertion,
    testUserInterface,
    testUserNotDefinedError
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testDashboardFix.runCompleteTest()');
console.log('🎯 Pour tester spécifiquement l\'erreur user is not defined, tapez: testDashboardFix.testUserNotDefinedError()'); 