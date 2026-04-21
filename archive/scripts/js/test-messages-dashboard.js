// Test pour vérifier l'affichage des messages dans le dashboard
// À exécuter dans la console du navigateur sur localhost:5175

console.log('🧪 Test d\'affichage des messages dans le dashboard');

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

// 2. Charger les messages de l'utilisateur
async function loadUserMessages(user) {
    console.log('2️⃣ Chargement des messages...');
    
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
        return [];
    }
    
    console.log('✅ Messages chargés:', messages?.length || 0);
    console.log('📧 Détail des messages:', messages);
    
    return messages || [];
}

// 3. Vérifier l'affichage dans le dashboard
function checkDashboardDisplay(messages) {
    console.log('3️⃣ Vérification de l\'affichage dans le dashboard...');
    
    // Vérifier que la section messages est accessible
    const messagesSection = document.querySelector('[onclick*="messages"]');
    if (!messagesSection) {
        console.error('❌ Section messages non trouvée dans le dashboard');
        return false;
    }
    
    console.log('✅ Section messages trouvée');
    
    // Cliquer sur la section messages
    messagesSection.click();
    
    // Attendre que la section se charge
    setTimeout(() => {
        const messagesContainer = document.querySelector('h3:contains("Messages reçus")');
        if (!messagesContainer) {
            console.error('❌ Conteneur des messages non trouvé');
            return;
        }
        
        console.log('✅ Conteneur des messages trouvé');
        
        // Vérifier le nombre de messages affichés
        const messageCards = document.querySelectorAll('[class*="bg-gradient-to-r from-blue-50"]');
        console.log('📊 Messages affichés:', messageCards.length);
        
        if (messageCards.length !== messages.length) {
            console.warn('⚠️ Nombre de messages affichés différent du nombre en base');
        }
        
        // Vérifier les boutons d'action
        const replyButtons = document.querySelectorAll('button:contains("Répondre")');
        const viewButtons = document.querySelectorAll('button:contains("Voir l\'équipement")');
        
        console.log('🔘 Boutons Répondre:', replyButtons.length);
        console.log('🔘 Boutons Voir l\'équipement:', viewButtons.length);
        
    }, 1000);
    
    return true;
}

// 4. Test de marquage comme lu
async function testMarkAsRead(messages) {
    if (messages.length === 0) {
        console.log('4️⃣ Aucun message à tester pour le marquage comme lu');
        return;
    }
    
    console.log('4️⃣ Test de marquage comme lu...');
    
    const newMessage = messages.find(m => m.status === 'new');
    if (!newMessage) {
        console.log('ℹ️ Aucun message nouveau à marquer comme lu');
        return;
    }
    
    console.log('📧 Message à marquer comme lu:', newMessage.id);
    
    const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', newMessage.id);
    
    if (error) {
        console.error('❌ Erreur marquage comme lu:', error);
        return;
    }
    
    console.log('✅ Message marqué comme lu avec succès');
}

// 5. Test complet
async function runCompleteTest() {
    console.log('🚀 Démarrage du test complet...');
    
    try {
        // Test 1: Connexion utilisateur
        const user = await testUserConnection();
        if (!user) return;
        
        // Test 2: Chargement messages
        const messages = await loadUserMessages(user);
        
        // Test 3: Affichage dashboard
        checkDashboardDisplay(messages);
        
        // Test 4: Marquage comme lu
        await testMarkAsRead(messages);
        
        console.log('🎉 Test complet terminé !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// 6. Test de création d'un message de test
async function createTestMessage(user) {
    console.log('5️⃣ Création d\'un message de test...');
    
    const testMessage = {
        sender_name: 'Testeur Automatique',
        sender_email: 'test@example.com',
        recipient_email: user.email,
        subject: 'Message de test automatique',
        message: 'Ceci est un message de test créé automatiquement pour vérifier l\'affichage dans le dashboard.',
        status: 'new',
        machine_id: null
    };
    
    const { data, error } = await supabase
        .from('messages')
        .insert(testMessage)
        .select();
    
    if (error) {
        console.error('❌ Erreur création message test:', error);
        return null;
    }
    
    console.log('✅ Message de test créé:', data[0]);
    return data[0];
}

// Fonctions d'aide pour les tests
function logMessageDetails(messages) {
    console.log('📋 Détail des messages:');
    messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.sender_name} (${msg.sender_email})`);
        console.log(`   Sujet: ${msg.subject || 'Aucun sujet'}`);
        console.log(`   Statut: ${msg.status}`);
        console.log(`   Date: ${new Date(msg.created_at).toLocaleString('fr-FR')}`);
        console.log(`   Équipement: ${msg.machine ? msg.machine.name : 'Aucun'}`);
        console.log('---');
    });
}

// Exécuter le test
console.log('🎯 Pour exécuter le test complet, tapez: runCompleteTest()');
console.log('🎯 Pour créer un message de test, tapez: createTestMessage(user)');
console.log('🎯 Pour voir les détails des messages, tapez: logMessageDetails(messages)');

// Exporter les fonctions pour utilisation manuelle
window.testMessages = {
    runCompleteTest,
    createTestMessage,
    logMessageDetails,
    testUserConnection,
    loadUserMessages
}; 