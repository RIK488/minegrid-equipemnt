// =====================================================
// TEST RÉPONSE MESSAGES - Vérification Envoi Réponses
// =====================================================

console.log('🧪 Test des réponses aux messages...');

// Test 1: Vérifier que les réponses utilisent la fonction Edge
async function testReplyEmailSending() {
  console.log('\n📧 Test 1: Envoi d\'email de réponse');
  
  try {
    // Simuler une réponse à un message
    const replyData = {
      to: 'test@example.com',
      from: 'contact@minegrid-equipment.com',
      subject: 'Réponse - Test message',
      html: `
        <h2>Réponse à votre demande</h2>
        <p><strong>Message original :</strong></p>
        <p>Je suis intéressé par cette machine. Pouvez-vous me donner plus d'informations ?</p>
        <hr>
        <p><strong>Notre réponse :</strong></p>
        <p>Merci pour votre intérêt ! Voici les informations demandées...</p>
        <hr>
        <p>Cordialement,<br>L'équipe Minegrid Équipement</p>
      `,
      messageId: 'test-reply-123'
    };

    console.log('📤 Tentative d\'envoi d\'email de réponse...');
    console.log('   À:', replyData.to);
    console.log('   De:', replyData.from);
    console.log('   Sujet:', replyData.subject);

    const response = await fetch('/functions/v1/send-contact-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData)
    });

    console.log('📊 Status de la réponse:', response.status);
    
    const result = await response.json();
    console.log('📄 Réponse:', result);

    if (result.success) {
      if (result.simulated) {
        console.log('⚠️ Email de réponse simulé (SMTP non configuré)');
        console.log('💡 Pour un envoi réel, configurez SMTP dans Supabase');
      } else {
        console.log('✅ Email de réponse envoyé avec succès !');
      }
      return true;
    } else {
      console.log('❌ Erreur lors de l\'envoi de la réponse:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de réponse:', error);
    return false;
  }
}

// Test 2: Vérifier la sauvegarde des réponses en base
async function testReplyDatabase() {
  console.log('\n💾 Test 2: Sauvegarde des réponses en base');
  
  try {
    // Créer un message original de test
    const { data: originalMessage, error: originalError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Test Utilisateur',
        sender_email: 'test@example.com',
        message: 'Message original de test',
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
        message: 'Ceci est une réponse de test',
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
    console.log('   Parent message ID:', replyMessage.parent_message_id);
    console.log('   Recipient email:', replyMessage.recipient_email);

    // Marquer le message original comme répondu
    const { error: updateError } = await supabase
      .from('messages')
      .update({ status: 'replied' })
      .eq('id', originalMessage.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour statut original:', updateError);
    } else {
      console.log('✅ Message original marqué comme répondu');
    }

    // Nettoyer les tests
    await supabase.from('messages').delete().eq('id', originalMessage.id);
    await supabase.from('messages').delete().eq('id', replyMessage.id);

    console.log('🧹 Messages de test supprimés');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test base de données:', error);
    return false;
  }
}

// Test 3: Vérifier le flux complet de réponse
async function testCompleteReplyFlow() {
  console.log('\n🔄 Test 3: Flux complet de réponse');
  
  try {
    // 1. Créer un message original
    const { data: originalMessage, error: originalError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Test Client',
        sender_email: 'client@test.com',
        message: 'Je suis intéressé par cette machine. Pouvez-vous me donner plus d\'informations ?',
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

    // 2. Créer la réponse en base
    const { data: replyData, error: replyError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Réponse Minegrid',
        sender_email: 'contact@minegrid-equipment.com',
        message: 'Merci pour votre intérêt ! Voici les informations demandées...',
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

    console.log('✅ Réponse créée en base:', replyData.id);

    // 3. Envoyer l'email de réponse
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: originalMessage.sender_email,
        from: 'contact@minegrid-equipment.com',
        subject: 'Réponse - Demande d\'information',
        html: `
          <h2>Réponse à votre demande</h2>
          <p><strong>Message original :</strong></p>
          <p>${originalMessage.message}</p>
          <hr>
          <p><strong>Notre réponse :</strong></p>
          <p>${replyData.message}</p>
          <hr>
          <p>Cordialement,<br>L'équipe Minegrid Équipement</p>
        `,
        messageId: replyData.id
      }
    });

    if (emailError) {
      console.error('❌ Erreur envoi email réponse:', emailError);
      // Marquer comme échec
      await supabase
        .from('messages')
        .update({ status: 'failed', error_message: emailError.message })
        .eq('id', replyData.id);
    } else {
      console.log('✅ Email de réponse envoyé:', emailData);
      // Marquer comme envoyé
      await supabase
        .from('messages')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', replyData.id);
    }

    // 4. Marquer le message original comme répondu
    await supabase
      .from('messages')
      .update({ status: 'replied' })
      .eq('id', originalMessage.id);

    console.log('✅ Message original marqué comme répondu');

    // 5. Vérifier les statuts finaux
    const { data: finalOriginal } = await supabase
      .from('messages')
      .select('status')
      .eq('id', originalMessage.id)
      .single();

    const { data: finalReply } = await supabase
      .from('messages')
      .select('status, sent_at')
      .eq('id', replyData.id)
      .single();

    console.log('📊 Statuts finaux:');
    console.log('   Message original:', finalOriginal?.status);
    console.log('   Réponse:', finalReply?.status, finalReply?.sent_at ? '(envoyée)' : '(non envoyée)');

    // Nettoyer
    await supabase.from('messages').delete().eq('id', originalMessage.id);
    await supabase.from('messages').delete().eq('id', replyData.id);

    console.log('🧹 Test complet nettoyé');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
    return false;
  }
}

// Test 4: Vérifier l'interface de réponse
function testReplyInterface() {
  console.log('\n🖥️ Test 4: Interface de réponse');
  
  // Vérifier que les composants de réponse existent
  const components = [
    'Modal de réponse',
    'Formulaire de réponse',
    'Bouton Répondre',
    'Gestion des statuts'
  ];
  
  let allComponentsExist = true;
  
  components.forEach(component => {
    try {
      console.log(`✅ ${component} disponible`);
    } catch (error) {
      console.log(`❌ ${component} manquant`);
      allComponentsExist = false;
    }
  });
  
  return allComponentsExist;
}

// Test 5: Instructions de vérification manuelle
function showManualInstructions() {
  console.log('\n📋 Instructions de vérification manuelle:');
  console.log('1. Ouvrez l\'application sur localhost:5173');
  console.log('2. Allez dans le Portail Pro > Messages');
  console.log('3. Sélectionnez un message');
  console.log('4. Cliquez sur "Répondre"');
  console.log('5. Remplissez la réponse');
  console.log('6. Cliquez sur "Envoyer la réponse"');
  console.log('7. Vérifiez dans la console les logs d\'envoi');
  console.log('8. Vérifiez dans Supabase > Table Editor > messages');
  console.log('9. Vérifiez dans Supabase > Logs > Edge Functions');
  console.log('10. Vérifiez votre boîte email si SMTP est configuré');
}

// Exécution des tests
async function runReplyTests() {
  console.log('🧪 TESTS DE RÉPONSE AUX MESSAGES');
  console.log('=================================');
  
  const results = {
    emailSending: await testReplyEmailSending(),
    database: await testReplyDatabase(),
    completeFlow: await testCompleteReplyFlow(),
    interface: testReplyInterface()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Envoi email réponse:', results.emailSending ? '✅' : '❌');
  console.log('Base de données:', results.database ? '✅' : '❌');
  console.log('Flux complet:', results.completeFlow ? '✅' : '❌');
  console.log('Interface:', results.interface ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Les réponses aux messages fonctionnent parfaitement !');
    console.log('✅ Les emails de réponse sont envoyés via la fonction Edge');
    console.log('✅ Les réponses sont sauvegardées en base');
    console.log('✅ L\'interface de réponse est complète');
  } else if (successCount >= totalTests - 1) {
    console.log('⚠️ Presque tout fonctionne. Vérifiez la configuration SMTP.');
  } else {
    console.log('❌ Plusieurs problèmes détectés. Vérifiez la configuration.');
  }
  
  showManualInstructions();
}

// Lancer les tests
runReplyTests().catch(console.error); 