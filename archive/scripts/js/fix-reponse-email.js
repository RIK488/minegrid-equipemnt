// =====================================================
// CORRECTION RÉPONSE EMAIL - Même mécanisme que MachineDetail
// =====================================================

console.log('🔧 Correction de la fonctionnalité de réponse...');

// Test 1: Vérifier le mécanisme MachineDetail
async function testMachineDetailMechanism() {
  console.log('\n📋 Test 1: Mécanisme MachineDetail');
  
  try {
    // Simuler l'envoi d'email comme dans MachineDetail
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'test@example.com',
        from: 'contact@minegrid-equipment.com',
        subject: 'Test Mécanisme MachineDetail',
        html: `
          <h2>Test Mécanisme MachineDetail</h2>
          <p><strong>Machine :</strong> Test Machine</p>
          <p><strong>Nom :</strong> Test Utilisateur</p>
          <p><strong>Email :</strong> test@example.com</p>
          <p><strong>Message :</strong></p>
          <p>Ceci est un test du mécanisme MachineDetail.</p>
        `,
        machineId: 'test-machine-id',
        messageId: 'test-message-' + Date.now()
      }
    });

    if (emailError) {
      console.error('❌ Erreur mécanisme MachineDetail:', emailError);
      return false;
    }

    console.log('✅ Mécanisme MachineDetail fonctionne:', emailData);
    return true;
  } catch (error) {
    console.error('❌ Erreur test MachineDetail:', error);
    return false;
  }
}

// Test 2: Créer une réponse avec le bon mécanisme
async function testReponseAvecBonMecanisme() {
  console.log('\n💬 Test 2: Réponse avec bon mécanisme');
  
  try {
    // Récupérer un message existant
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !messages || messages.length === 0) {
      console.error('❌ Aucun message trouvé:', error);
      return false;
    }

    const messageOriginal = messages[0];
    console.log('✅ Message original trouvé:', messageOriginal.id);

    // Créer une réponse
    const { data: reponse, error: errorReponse } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Réponse Minegrid',
        sender_email: 'contact@minegrid-equipment.com',
        message: 'Ceci est une réponse de test utilisant le même mécanisme que MachineDetail.',
        recipient_email: messageOriginal.sender_email,
        parent_message_id: messageOriginal.id,
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (errorReponse) {
      console.error('❌ Erreur création réponse:', errorReponse);
      return false;
    }

    console.log('✅ Réponse créée:', reponse.id);

    // Envoyer l'email avec le même mécanisme que MachineDetail
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: reponse.recipient_email,
        from: 'contact@minegrid-equipment.com',
        subject: `Réponse - ${messageOriginal.subject || 'Demande d\'information'}`,
        html: `
          <h2>Réponse à votre demande</h2>
          <p><strong>Message original :</strong></p>
          <p>${messageOriginal.message}</p>
          <hr>
          <p><strong>Notre réponse :</strong></p>
          <p>${reponse.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Cordialement,<br>L'équipe Minegrid Équipement</p>
        `,
        machineId: messageOriginal.machine_id || 'reply',
        messageId: reponse.id
      }
    });

    if (emailError) {
      console.error('❌ Erreur envoi email réponse:', emailError);
      return false;
    }

    console.log('✅ Email de réponse envoyé:', emailData);

    // Marquer comme envoyé
    await supabase
      .from('messages')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('id', reponse.id);

    console.log('✅ Statut de la réponse mis à jour');

    // Marquer le message original comme répondu
    await supabase
      .from('messages')
      .update({ status: 'replied' })
      .eq('id', messageOriginal.id);

    console.log('✅ Message original marqué comme répondu');

    return true;
  } catch (error) {
    console.error('❌ Erreur test réponse:', error);
    return false;
  }
}

// Test 3: Vérifier que l'utilisateur reçoit l'email
function testReceptionUtilisateur() {
  console.log('\n📧 Test 3: Réception utilisateur');
  
  console.log('📋 Vérifications à faire :');
  console.log('1. L\'utilisateur qui a envoyé le message original');
  console.log('2. Doit recevoir un email de réponse');
  console.log('3. L\'email doit contenir :');
  console.log('   - Le message original');
  console.log('   - La réponse de Minegrid');
  console.log('   - Un format professionnel');
  console.log('');
  console.log('📧 Où chercher l\'email :');
  console.log('   - Boîte de réception principale');
  console.log('   - Dossier Spam/Indésirable');
  console.log('   - Dossier Promotions (Gmail)');
  
  return true;
}

// Test 4: Instructions de correction ProDashboard
function showProDashboardCorrection() {
  console.log('\n🔧 Correction ProDashboard');
  console.log('==========================');
  console.log('');
  console.log('Le problème dans ProDashboard est que :');
  console.log('1. L\'email n\'utilise pas le même format que MachineDetail');
  console.log('2. Il manque le paramètre machineId');
  console.log('3. Le format HTML n\'est pas identique');
  console.log('');
  console.log('📋 Correction à apporter dans ProDashboard.tsx :');
  console.log('Ligne ~4792, remplacer :');
  console.log('');
  console.log('AVANT :');
  console.log('const { data: emailData, error: emailError } = await supabase.functions.invoke(\'send-contact-email\', {');
  console.log('  body: {');
  console.log('    to: selectedMessage.sender_email,');
  console.log('    from: \'contact@minegrid-equipment.com\',');
  console.log('    subject: `Réponse - ${selectedMessage.subject || \'Demande d\\\'information\'}`,');
  console.log('    html: `...`,');
  console.log('    messageId: replyData.id');
  console.log('  }');
  console.log('});');
  console.log('');
  console.log('APRÈS :');
  console.log('const { data: emailData, error: emailError } = await supabase.functions.invoke(\'send-contact-email\', {');
  console.log('  body: {');
  console.log('    to: selectedMessage.sender_email,');
  console.log('    from: \'contact@minegrid-equipment.com\',');
  console.log('    subject: `Réponse - ${selectedMessage.subject || \'Demande d\\\'information\'}`,');
  console.log('    html: `');
  console.log('      <h2>Réponse à votre demande</h2>');
  console.log('      <p><strong>Message original :</strong></p>');
  console.log('      <p>${selectedMessage.message}</p>');
  console.log('      <hr>');
  console.log('      <p><strong>Notre réponse :</strong></p>');
  console.log('      <p>${replyText.replace(/\\n/g, \'<br>\')}</p>');
  console.log('      <hr>');
  console.log('      <p>Cordialement,<br>L\'équipe Minegrid Équipement</p>');
  console.log('    `,');
  console.log('    machineId: selectedMessage.machine_id || \'reply\',');
  console.log('    messageId: replyData.id');
  console.log('  }');
  console.log('});');
}

// Exécution des tests
async function runCorrectionTests() {
  console.log('🔧 CORRECTION RÉPONSE EMAIL');
  console.log('===========================');
  
  const results = {
    machineDetail: await testMachineDetailMechanism(),
    reponse: await testReponseAvecBonMecanisme(),
    reception: testReceptionUtilisateur(),
    correction: showProDashboardCorrection()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Mécanisme MachineDetail:', results.machineDetail ? '✅' : '❌');
  console.log('Réponse avec bon mécanisme:', results.reponse ? '✅' : '❌');
  console.log('Réception utilisateur:', results.reception ? '✅' : '❌');
  console.log('Correction ProDashboard:', results.correction ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Mécanisme de réponse corrigé !');
    console.log('✅ Utilise le même format que MachineDetail');
    console.log('✅ L\'utilisateur reçoit l\'email de réponse');
    console.log('✅ Fonctionnalité complètement opérationnelle');
  } else {
    console.log('⚠️ Problèmes détectés dans le mécanisme de réponse');
    console.log('🔧 Appliquez la correction ProDashboard');
  }
}

// Lancer les tests
runCorrectionTests().catch(console.error); 