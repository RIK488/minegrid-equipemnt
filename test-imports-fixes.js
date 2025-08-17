// Test pour vérifier que les imports sont corrigés
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test des imports corrigés');

// 1. Vérifier que supabase est accessible
async function testSupabaseImport() {
    console.log('1️⃣ Test import Supabase...');
    
    try {
        // Vérifier que supabase est défini globalement
        if (typeof window.supabase !== 'undefined') {
            console.log('✅ Supabase disponible globalement');
            return true;
        }
        
        // Essayer d'importer depuis le module
        const { supabaseClient } = await import('/src/utils/supabaseClient.ts');
        console.log('✅ Supabase importé avec succès');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur import Supabase:', error);
        return false;
    }
}

// 2. Vérifier la connexion utilisateur
async function testUserConnection() {
    console.log('2️⃣ Test connexion utilisateur...');
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Erreur connexion:', error);
            return false;
        }
        
        if (!user) {
            console.error('❌ Aucun utilisateur connecté');
            return false;
        }
        
        console.log('✅ Utilisateur connecté:', user.email);
        return user;
        
    } catch (error) {
        console.error('❌ Erreur test connexion:', error);
        return false;
    }
}

// 3. Vérifier l'accès aux messages
async function testMessagesAccess(user) {
    console.log('3️⃣ Test accès aux messages...');
    
    try {
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
        
    } catch (error) {
        console.error('❌ Erreur test messages:', error);
        return false;
    }
}

// 4. Vérifier l'accès aux offres
async function testOffersAccess(user) {
    console.log('4️⃣ Test accès aux offres...');
    
    try {
        const { data: offers, error } = await supabase
            .from('offers')
            .select(`
                *,
                machine:machines(name, brand, model, images)
            `)
            .eq('seller_email', user.email)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erreur accès offres:', error);
            return false;
        }
        
        console.log('✅ Offres accessibles:', offers?.length || 0);
        return offers || [];
        
    } catch (error) {
        console.error('❌ Erreur test offres:', error);
        return false;
    }
}

// 5. Test complet
async function runCompleteImportTest() {
    console.log('🚀 Démarrage du test complet des imports...');
    
    try {
        // Test 1: Import Supabase
        const supabaseOk = await testSupabaseImport();
        if (!supabaseOk) {
            console.error('❌ Test échoué: Import Supabase');
            return;
        }
        
        // Test 2: Connexion utilisateur
        const user = await testUserConnection();
        if (!user) {
            console.error('❌ Test échoué: Connexion utilisateur');
            return;
        }
        
        // Test 3: Accès messages
        const messages = await testMessagesAccess(user);
        if (messages === false) {
            console.error('❌ Test échoué: Accès messages');
            return;
        }
        
        // Test 4: Accès offres
        const offers = await testOffersAccess(user);
        if (offers === false) {
            console.error('❌ Test échoué: Accès offres');
            return;
        }
        
        console.log('🎉 Tous les tests réussis !');
        console.log('📊 Résumé:');
        console.log(`   - Utilisateur: ${user.email}`);
        console.log(`   - Messages: ${messages.length}`);
        console.log(`   - Offres: ${offers.length}`);
        
        // Vérifier que le dashboard peut se charger
        console.log('🔍 Vérification du dashboard...');
        const dashboardElement = document.querySelector('[class*="dashboard"]');
        if (dashboardElement) {
            console.log('✅ Dashboard trouvé dans le DOM');
        } else {
            console.log('⚠️ Dashboard non trouvé dans le DOM');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test complet:', error);
    }
}

// 6. Test de création d'un message de test
async function createTestMessage() {
    console.log('5️⃣ Création d\'un message de test...');
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Aucun utilisateur connecté');
            return;
        }
        
        const testMessage = {
            sender_name: 'Testeur Import',
            sender_email: 'test@import.com',
            recipient_email: user.email,
            subject: 'Test après correction des imports',
            message: 'Ce message a été créé pour tester que les imports fonctionnent correctement après correction.',
            status: 'new',
            machine_id: null
        };
        
        const { data, error } = await supabase
            .from('messages')
            .insert(testMessage)
            .select();
        
        if (error) {
            console.error('❌ Erreur création message test:', error);
            return;
        }
        
        console.log('✅ Message de test créé:', data[0]);
        return data[0];
        
    } catch (error) {
        console.error('❌ Erreur création message test:', error);
    }
}

// Exporter les fonctions pour utilisation manuelle
window.testImports = {
    runCompleteImportTest,
    createTestMessage,
    testSupabaseImport,
    testUserConnection,
    testMessagesAccess,
    testOffersAccess
};

// Instructions
console.log('🎯 Pour exécuter le test complet, tapez: testImports.runCompleteImportTest()');
console.log('🎯 Pour créer un message de test, tapez: testImports.createTestMessage()'); 