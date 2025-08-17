// =====================================================
// CORRECTION STRUCTURE MESSAGES - Résolution Erreur 400
// =====================================================

console.log('🔧 Correction de la structure de la table messages...');

// Test 1: Vérifier la structure actuelle de la table messages
async function checkMessagesStructure() {
  console.log('\n📋 Test 1: Vérification structure table messages');
  
  try {
    // Test simple de sélection
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, sender_name, sender_email, message, status, created_at')
      .limit(1);

    if (error) {
      console.error('❌ Erreur structure messages:', error);
      console.log('🔍 Détails de l\'erreur:', error.message);
      return false;
    }

    console.log('✅ Structure messages OK');
    console.log('📝 Exemple message:', messages[0]);
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification structure:', error);
    return false;
  }
}

// Test 2: Vérifier les colonnes problématiques
async function checkProblematicColumns() {
  console.log('\n🔍 Test 2: Vérification colonnes problématiques');
  
  const problematicQueries = [
    // Test avec sender_id et receiver_id
    () => supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(firstname,lastname), receiver:profiles!messages_receiver_id_fkey(firstname,lastname)'),
    
    // Test avec seller_id
    () => supabase.from('messages').select('*').or('receiver_id.eq.test,seller_id.eq.test'),
    
    // Test simple
    () => supabase.from('messages').select('*')
  ];

  for (let i = 0; i < problematicQueries.length; i++) {
    try {
      const { data, error } = await problematicQueries[i]();
      if (error) {
        console.log(`❌ Requête ${i + 1} échoue:`, error.message);
      } else {
        console.log(`✅ Requête ${i + 1} réussit`);
      }
    } catch (error) {
      console.log(`❌ Requête ${i + 1} exception:`, error.message);
    }
  }
}

// Test 3: Créer une structure simplifiée pour les messages
async function createSimpleMessage() {
  console.log('\n📝 Test 3: Création message simple');
  
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Test Utilisateur',
        sender_email: 'test@example.com',
        message: 'Message de test pour vérifier la structure',
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création message:', error);
      return false;
    }

    console.log('✅ Message créé avec succès:', message.id);
    
    // Nettoyer le test
    await supabase.from('messages').delete().eq('id', message.id);
    console.log('🧹 Message de test supprimé');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test création:', error);
    return false;
  }
}

// Test 4: Tester la fonction de réponse avec structure simple
async function testReplyWithSimpleStructure() {
  console.log('\n💬 Test 4: Test réponse avec structure simple');
  
  try {
    // Créer un message original
    const { data: originalMessage, error: originalError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Client Test',
        sender_email: 'client@test.com',
        message: 'Demande d\'information sur un équipement',
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (originalError) {
      console.error('❌ Erreur création message original:', originalError);
      return false;
    }

    console.log('✅ Message original créé:', originalMessage.id);

    // Créer une réponse
    const { data: replyMessage, error: replyError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Réponse Minegrid',
        sender_email: 'contact@minegrid-equipment.com',
        message: 'Voici notre réponse à votre demande.',
        recipient_email: originalMessage.sender_email,
        parent_message_id: originalMessage.id,
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (replyError) {
      console.error('❌ Erreur création réponse:', replyError);
      return false;
    }

    console.log('✅ Réponse créée:', replyMessage.id);

    // Tester l'envoi d'email
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: originalMessage.sender_email,
        from: 'contact@minegrid-equipment.com',
        subject: 'Réponse - Test structure',
        html: '<h1>Test de réponse</h1><p>Ceci est un test de la nouvelle structure.</p>',
        messageId: replyMessage.id
      }
    });

    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    } else {
      console.log('✅ Email envoyé:', emailData);
    }

    // Marquer comme répondu
    await supabase
      .from('messages')
      .update({ status: 'replied' })
      .eq('id', originalMessage.id);

    console.log('✅ Message original marqué comme répondu');

    // Nettoyer
    await supabase.from('messages').delete().eq('id', originalMessage.id);
    await supabase.from('messages').delete().eq('id', replyMessage.id);

    console.log('🧹 Messages de test supprimés');
    return true;

  } catch (error) {
    console.error('❌ Erreur test réponse:', error);
    return false;
  }
}

// Test 5: Instructions de correction manuelle
function showManualFixInstructions() {
  console.log('\n📋 Instructions de correction manuelle:');
  console.log('1. Allez dans Supabase > Table Editor');
  console.log('2. Vérifiez la table "messages"');
  console.log('3. Assurez-vous que les colonnes suivantes existent:');
  console.log('   - id (uuid, primary key)');
  console.log('   - sender_name (text)');
  console.log('   - sender_email (text)');
  console.log('   - message (text)');
  console.log('   - status (text)');
  console.log('   - created_at (timestamp)');
  console.log('   - recipient_email (text, nullable)');
  console.log('   - parent_message_id (uuid, nullable)');
  console.log('   - sent_at (timestamp, nullable)');
  console.log('   - error_message (text, nullable)');
  console.log('4. Supprimez les colonnes problématiques:');
  console.log('   - sender_id (si elle existe)');
  console.log('   - receiver_id (si elle existe)');
  console.log('   - seller_id (si elle existe)');
  console.log('5. Vérifiez les politiques RLS');
  console.log('6. Testez à nouveau la fonctionnalité');
}

// Exécution des tests
async function runStructureFix() {
  console.log('🔧 CORRECTION STRUCTURE MESSAGES');
  console.log('================================');
  
  const results = {
    structure: await checkMessagesStructure(),
    columns: await checkProblematicColumns(),
    simpleMessage: await createSimpleMessage(),
    replyTest: await testReplyWithSimpleStructure()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Structure messages:', results.structure ? '✅' : '❌');
  console.log('Colonnes problématiques:', results.columns ? '✅' : '❌');
  console.log('Création message simple:', results.simpleMessage ? '✅' : '❌');
  console.log('Test réponse:', results.replyTest ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 La structure messages est correcte !');
    console.log('✅ Les réponses fonctionnent maintenant');
    console.log('✅ L\'erreur 400 est résolue');
  } else {
    console.log('❌ Problèmes détectés dans la structure');
    console.log('🔧 Correction manuelle nécessaire');
    showManualFixInstructions();
  }
}

// Lancer les tests
runStructureFix().catch(console.error); 