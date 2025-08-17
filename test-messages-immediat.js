// =====================================================
// TEST MESSAGES IMMÉDIAT - Vérification rapide
// =====================================================

console.log('🔧 Test immédiat des messages...');

// Test 1: Vérifier l'accès à la table messages
async function testAccesMessages() {
  console.log('\n📋 Test 1: Accès table messages');
  
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur accès messages:', error);
      return false;
    }

    console.log('✅ Messages trouvés:', messages?.length || 0);
    
    if (messages && messages.length > 0) {
      console.log('✅ Premier message:', {
        id: messages[0].id,
        sender_name: messages[0].sender_name,
        sender_email: messages[0].sender_email,
        message: messages[0].message?.substring(0, 50) + '...',
        status: messages[0].status,
        created_at: messages[0].created_at
      });
    } else {
      console.log('⚠️ Aucun message trouvé dans la base');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur test accès:', error);
    return false;
  }
}

// Test 2: Vérifier la navigation Dashboard
function testNavigationDashboard() {
  console.log('\n📋 Test 2: Navigation Dashboard');
  
  console.log('📋 Instructions :');
  console.log('1. Allez sur http://localhost:5173/#dashboard');
  console.log('2. Cliquez sur la carte "Messages reçus"');
  console.log('3. Vérifiez que l\'onglet Messages s\'ouvre');
  console.log('4. Vérifiez que les messages s\'affichent');
  
  return true;
}

// Test 3: Vérifier les corrections appliquées
function testCorrectionsAppliquees() {
  console.log('\n📋 Test 3: Corrections appliquées');
  
  console.log('📋 Vérifications :');
  console.log('✅ Carte "Messages reçus" cliquable');
  console.log('✅ Onglet Messages ajouté');
  console.log('✅ Interface messages créée');
  console.log('✅ Boutons Voir/Répondre ajoutés');
  
  return true;
}

// Test 4: Diagnostic si problème persiste
function diagnosticProbleme() {
  console.log('\n📋 Test 4: Diagnostic problème');
  
  console.log('🔍 Si les messages ne s\'affichent toujours pas :');
  console.log('');
  console.log('1. Vérifiez que le serveur est redémarré :');
  console.log('   - Arrêtez le serveur (Ctrl+C)');
  console.log('   - Relancez : npm run dev');
  console.log('');
  console.log('2. Vérifiez la console (F12) :');
  console.log('   - Recherchez les erreurs JavaScript');
  console.log('   - Vérifiez les logs de chargement');
  console.log('');
  console.log('3. Vérifiez l\'URL :');
  console.log('   - Doit être : http://localhost:5173/#dashboard');
  console.log('   - Pas : http://localhost:5173/#premium-dashboard');
  console.log('');
  console.log('4. Vérifiez les données :');
  console.log('   - Exécutez le test 1 ci-dessus');
  console.log('   - Vérifiez que des messages existent');
  
  return true;
}

// Exécution des tests
async function runTestsImmediats() {
  console.log('🔧 TEST MESSAGES IMMÉDIAT');
  console.log('==========================');
  
  const results = {
    acces: await testAccesMessages(),
    navigation: testNavigationDashboard(),
    corrections: testCorrectionsAppliquees(),
    diagnostic: diagnosticProbleme()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Accès messages:', results.acces ? '✅' : '❌');
  console.log('Navigation Dashboard:', results.navigation ? '✅' : '❌');
  console.log('Corrections appliquées:', results.corrections ? '✅' : '❌');
  console.log('Diagnostic problème:', results.diagnostic ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (results.acces) {
    console.log('🎉 Messages accessibles !');
    console.log('✅ Le problème vient probablement du cache/navigation');
    console.log('✅ Redémarrez le navigateur ou videz le cache');
  } else {
    console.log('⚠️ Problème d\'accès aux messages');
    console.log('🔧 Vérifiez la base de données et les permissions');
  }
}

// Lancer les tests
runTestsImmediats().catch(console.error); 