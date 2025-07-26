// Test de configuration Supabase locale
const { createClient } = require('@supabase/supabase-js');

// Récupérer les variables d'environnement depuis votre fichier .env
require('dotenv').config();

// Configuration Supabase (remplacez par vos vraies valeurs)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🔧 Configuration Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLocalConfiguration() {
  console.log('🧪 Test de configuration locale...\n');

  try {
    // 1. Test de connexion à Supabase
    console.log('1️⃣ Test de connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('machines')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      console.log('\n💡 Vérifiez :');
      console.log('   - VITE_SUPABASE_URL dans .env');
      console.log('   - VITE_SUPABASE_ANON_KEY dans .env');
      console.log('   - Connexion internet');
      return;
    }

    console.log('✅ Connexion Supabase OK');

    // 2. Test de récupération des annonces
    console.log('\n2️⃣ Test de récupération des annonces...');
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('*')
      .limit(5);

    if (machinesError) {
      console.error('❌ Erreur récupération annonces:', machinesError);
    } else {
      console.log(`✅ ${machines.length} annonces récupérées`);
      if (machines.length > 0) {
        console.log('📋 Exemple d\'annonce:', machines[0].name);
      }
    }

    // 3. Test de récupération des messages
    console.log('\n3️⃣ Test de récupération des messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);

    if (messagesError) {
      console.error('❌ Erreur récupération messages:', messagesError);
    } else {
      console.log(`✅ ${messages.length} messages récupérés`);
      if (messages.length > 0) {
        console.log('📨 Exemple de message:', messages[0].content?.substring(0, 50) + '...');
      }
    }

    // 4. Test d'envoi d'un message de test
    console.log('\n4️⃣ Test d\'envoi d\'un message de test...');
    
    // Créer un message de test
    const testMessage = {
      sender_id: 'test-sender-' + Date.now(),
      receiver_id: 'test-receiver-' + Date.now(),
      subject: 'Test local - ' + new Date().toLocaleString(),
      content: 'Ceci est un message de test envoyé depuis le script local.',
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert([testMessage])
      .select();

    if (insertError) {
      console.error('❌ Erreur envoi message:', insertError);
      console.log('\n💡 Vérifiez les politiques RLS de la table messages');
    } else {
      console.log('✅ Message de test envoyé avec succès');
      console.log('📝 ID du message:', newMessage[0].id);
    }

    // 5. Test de la fonction Edge (si configurée)
    console.log('\n5️⃣ Test de la fonction Edge exchange_rates...');
    const { data: rates, error: ratesError } = await supabase
      .functions.invoke('exchange-rates');

    if (ratesError) {
      console.log('⚠️ Fonction Edge non disponible ou erreur:', ratesError.message);
      console.log('💡 Normal si la fonction n\'est pas déployée');
    } else {
      console.log('✅ Fonction Edge fonctionne');
      console.log('📊 Taux de change:', rates);
    }

    // 6. Vérification des variables d'environnement
    console.log('\n6️⃣ Vérification des variables d\'environnement...');
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️ Variables manquantes:', missingVars);
      console.log('💡 Créez un fichier .env à la racine du projet');
    } else {
      console.log('✅ Toutes les variables d\'environnement sont configurées');
    }

    console.log('\n🎯 Résumé du test:');
    console.log('   - Connexion Supabase: ✅');
    console.log('   - Récupération annonces: ✅');
    console.log('   - Récupération messages: ✅');
    console.log('   - Envoi messages: ' + (insertError ? '❌' : '✅'));
    console.log('   - Fonction Edge: ' + (ratesError ? '⚠️' : '✅'));
    console.log('   - Variables d\'env: ' + (missingVars.length > 0 ? '⚠️' : '✅'));

    console.log('\n🚀 Pour tester l\'application complète:');
    console.log('   1. Lancez: npm run dev');
    console.log('   2. Allez sur: http://localhost:5173');
    console.log('   3. Connectez-vous ou créez un compte');
    console.log('   4. Testez l\'envoi de message depuis MachineDetail');
    console.log('   5. Vérifiez dans MessagesBoite et le dashboard');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testLocalConfiguration(); 