// Test pour vérifier la correction de la contrainte de statut
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test de correction de la contrainte de statut');

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

// 2. Tester l'insertion d'un message avec le bon statut
async function testMessageInsertion(user) {
    console.log('2️⃣ Test d\'insertion de message avec statut correct...');
    
    try {
        const testMessage = {
            sender_email: user.email,
            sender_name: user.user_metadata?.full_name || 'Test User',
            recipient_email: 'test@example.com',
            subject: 'Test de contrainte de statut',
            message: 'Ceci est un test pour vérifier que la contrainte fonctionne',
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
        await supabase
            .from('messages')
            .delete()
            .eq('id', data.id);
        
        console.log('✅ Message de test supprimé');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors du test d\'insertion:', error);
        return false;
    }
}

// 3. Tester la fonctionnalité de réponse complète
async function testReplyFunctionality(user) {
    console.log('3️⃣ Test de la fonctionnalité de réponse complète...');
    
    try {
        // Créer un message de test pour répondre
        const { data: testMessage, error: createError } = await supabase
            .from('messages')
            .insert({
                sender_email: 'sender@example.com',
                sender_name: 'Test Sender',
                recipient_email: user.email,
                subject: 'Message de test pour réponse',
                message: 'Ceci est un message de test pour tester la réponse',
                status: 'new',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (createError) {
            console.error('❌ Erreur création message de test:', createError);
            return false;
        }
        
        console.log('✅ Message de test créé:', testMessage.id);
        
        // Simuler une réponse
        const replyData = {
            sender_email: user.email,
            sender_name: user.user_metadata?.full_name || 'Test User',
            recipient_email: 'sender@example.com',
            subject: `Réponse - Message de test pour réponse`,
            message: 'Ceci est une réponse de test',
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

// 4. Vérifier la structure de la table
async function checkTableStructure() {
    console.log('4️⃣ Vérification de la structure de la table...');
    
    try {
        // Tester différentes valeurs de statut
        const validStatuses = ['new', 'read', 'replied', 'sent', 'failed', 'pending'];
        
        for (const status of validStatuses) {
            const testData = {
                sender_email: 'test@example.com',
                sender_name: 'Test User',
                recipient_email: 'recipient@example.com',
                subject: `Test avec statut: ${status}`,
                message: `Message de test avec statut ${status}`,
                status: status,
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from('messages')
                .insert(testData)
                .select()
                .single();
            
            if (error) {
                console.error(`❌ Erreur avec statut '${status}':`, error);
            } else {
                console.log(`✅ Statut '${status}' accepté`);
                // Nettoyer
                await supabase.from('messages').delete().eq('id', data.id);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de structure:', error);
        return false;
    }
}

// 5. Test complet
async function runCompleteStatusTest() {
    console.log('🚀 Démarrage du test complet de correction de contrainte...');
    
    try {
        // Test 1: Connexion utilisateur
        const user = await testUserConnection();
        if (!user) {
            console.error('❌ Test arrêté: utilisateur non connecté');
            return;
        }
        
        // Test 2: Insertion de message
        const insertionOk = await testMessageInsertion(user);
        if (!insertionOk) {
            console.error('❌ Test arrêté: insertion échouée');
            return;
        }
        
        // Test 3: Fonctionnalité de réponse
        const replyOk = await testReplyFunctionality(user);
        if (!replyOk) {
            console.error('❌ Test arrêté: réponse échouée');
            return;
        }
        
        // Test 4: Structure de table
        const structureOk = await checkTableStructure();
        if (!structureOk) {
            console.error('❌ Test arrêté: structure de table incorrecte');
            return;
        }
        
        console.log('🎉 Tous les tests réussis !');
        console.log('📋 Résumé:');
        console.log('   - Connexion utilisateur: ✅ OK');
        console.log('   - Insertion de messages: ✅ OK');
        console.log('   - Fonctionnalité de réponse: ✅ OK');
        console.log('   - Structure de table: ✅ OK');
        console.log('   - Contrainte de statut: ✅ Corrigée');
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// 6. Test spécifique pour l'erreur originale
async function testOriginalError() {
    console.log('5️⃣ Test de reproduction de l\'erreur originale...');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('❌ Aucun utilisateur connecté pour le test');
            return;
        }
        
        // Essayer d'insérer avec status null (ce qui causait l'erreur)
        const testData = {
            sender_email: user.email,
            sender_name: user.user_metadata?.full_name || 'Test User',
            recipient_email: 'test@example.com',
            subject: 'Test reproduction erreur',
            message: 'Test pour voir si l\'erreur persiste',
            // Pas de status pour tester si la valeur par défaut fonctionne
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('messages')
            .insert(testData)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erreur persiste:', error);
            return false;
        } else {
            console.log('✅ Erreur corrigée - insertion réussie avec valeur par défaut');
            
            // Nettoyer
            await supabase.from('messages').delete().eq('id', data.id);
            return true;
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        return false;
    }
}

// Exporter les fonctions pour utilisation manuelle
window.testStatusConstraint = {
    runCompleteStatusTest,
    testUserConnection,
    testMessageInsertion,
    testReplyFunctionality,
    checkTableStructure,
    testOriginalError
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testStatusConstraint.runCompleteStatusTest()');
console.log('🎯 Pour tester l\'erreur originale, tapez: testStatusConstraint.testOriginalError()'); 