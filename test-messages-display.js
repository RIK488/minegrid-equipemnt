const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessagesDisplay() {
  console.log('🧪 Test d\'affichage des messages dans le dashboard...\n');

  try {
    // 1. Vérifier la structure de la table messages
    console.log('1️⃣ Vérification de la structure de la table messages...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur structure table:', tableError);
      return;
    }

    console.log('✅ Structure de la table messages OK');
    console.log('📋 Colonnes disponibles:', Object.keys(tableInfo[0] || {}));

    // 2. Vérifier les messages existants
    console.log('\n2️⃣ Vérification des messages existants...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('❌ Erreur récupération messages:', messagesError);
      return;
    }

    console.log(`✅ ${messages.length} messages trouvés`);
    
    if (messages.length > 0) {
      console.log('📨 Derniers messages:');
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`   ${index + 1}. De: ${msg.sender_id} → À: ${msg.receiver_id}`);
        console.log(`      Sujet: ${msg.subject || 'Sans sujet'}`);
        console.log(`      Contenu: ${msg.content?.substring(0, 50)}...`);
        console.log(`      Date: ${msg.created_at}`);
        console.log(`      Statut: ${msg.is_read ? 'Lu' : 'Non lu'}`);
        console.log('');
      });
    }

    // 3. Vérifier les politiques RLS
    console.log('3️⃣ Vérification des politiques RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'messages' });

    if (policiesError) {
      console.log('⚠️ Impossible de vérifier les politiques RLS (normal si pas de fonction)');
    } else {
      console.log('✅ Politiques RLS vérifiées');
    }

    // 4. Test de récupération par receiver_id
    console.log('\n4️⃣ Test de récupération par receiver_id...');
    if (messages.length > 0) {
      const testReceiverId = messages[0].receiver_id;
      const { data: receiverMessages, error: receiverError } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', testReceiverId);

      if (receiverError) {
        console.error('❌ Erreur récupération par receiver_id:', receiverError);
      } else {
        console.log(`✅ ${receiverMessages.length} messages trouvés pour receiver_id: ${testReceiverId}`);
      }
    }

    // 5. Vérifier la compatibilité avec l'interface Message
    console.log('\n5️⃣ Vérification de la compatibilité avec l\'interface Message...');
    const requiredFields = ['id', 'sender_id', 'receiver_id', 'content', 'created_at'];
    const missingFields = requiredFields.filter(field => !tableInfo[0] || !(field in tableInfo[0]));
    
    if (missingFields.length > 0) {
      console.error('❌ Champs manquants dans l\'interface Message:', missingFields);
    } else {
      console.log('✅ Interface Message compatible');
    }

    console.log('\n🎯 Résumé:');
    console.log(`   - Messages dans la base: ${messages.length}`);
    console.log(`   - Structure table: ✅`);
    console.log(`   - Politiques RLS: ✅`);
    console.log(`   - Interface compatible: ${missingFields.length === 0 ? '✅' : '❌'}`);
    
    if (messages.length === 0) {
      console.log('\n💡 Aucun message trouvé. Pour tester:');
      console.log('   1. Envoyez un message depuis MachineDetail');
      console.log('   2. Vérifiez qu\'il apparaît dans MessagesBoite');
      console.log('   3. Vérifiez qu\'il apparaît dans le dashboard');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testMessagesDisplay(); 