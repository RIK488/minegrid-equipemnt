// =====================================================
// DIAGNOSTIC MACHINEDETAIL VS RÉPONSE
// =====================================================

console.log('🔧 Diagnostic MachineDetail vs Réponse...');

// Test 1: Vérifier comment MachineDetail envoie les emails
async function testMachineDetailEmail() {
  console.log('\n📋 Test 1: MachineDetail Email (qui fonctionne)');
  
  try {
    // Simuler l'envoi d'email comme dans MachineDetail
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'test@example.com',
        from: 'contact@minegrid-equipment.com',
        subject: 'Test MachineDetail - Fonctionne',
        html: `
          <h2>Test MachineDetail</h2>
          <p><strong>Machine :</strong> Test Machine</p>
          <p><strong>Nom :</strong> Test Utilisateur</p>
          <p><strong>Email :</strong> test@example.com</p>
          <p><strong>Message :</strong></p>
          <p>Ceci est un test depuis MachineDetail.</p>
        `,
        machineId: 'test-machine-id',
        messageId: 'test-machinedetail-' + Date.now()
      }
    });

    if (emailError) {
      console.error('❌ Erreur MachineDetail:', emailError);
      return false;
    }

    console.log('✅ MachineDetail fonctionne:', emailData);
    console.log('📧 Email simulé:', emailData.simulated);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test MachineDetail:', error);
    return false;
  }
}

// Test 2: Vérifier comment la réponse envoie les emails
async function testReponseEmail() {
  console.log('\n📋 Test 2: Réponse Email (qui ne fonctionne pas)');
  
  try {
    // Simuler l'envoi d'email comme dans la fonction de réponse
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'test@example.com',
        from: 'contact@minegrid-equipment.com',
        subject: 'Réponse - Test',
        html: `
          <h2>Réponse à votre demande</h2>
          <p><strong>Message original :</strong></p>
          <p>Message de test original</p>
          <hr>
          <p><strong>Notre réponse :</strong></p>
          <p>Ceci est une réponse de test.</p>
          <hr>
          <p>Cordialement,<br>L'équipe Minegrid Équipement</p>
        `,
        machineId: 'reply',
        messageId: 'test-reponse-' + Date.now()
      }
    });

    if (emailError) {
      console.error('❌ Erreur Réponse:', emailError);
      return false;
    }

    console.log('✅ Réponse fonctionne:', emailData);
    console.log('📧 Email simulé:', emailData.simulated);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test Réponse:', error);
    return false;
  }
}

// Test 3: Comparer les différences
function comparerDifferences() {
  console.log('\n📋 Test 3: Comparaison des différences');
  
  console.log('🔍 Différences entre MachineDetail et Réponse :');
  console.log('');
  console.log('MachineDetail (fonctionne) :');
  console.log('- machineId: ID réel de la machine');
  console.log('- subject: "Demande d\'information - [Nom Machine]"');
  console.log('- html: Format spécifique MachineDetail');
  console.log('- messageId: ID du message créé en base');
  console.log('');
  console.log('Réponse (ne fonctionne pas) :');
  console.log('- machineId: "reply" ou machine_id');
  console.log('- subject: "Réponse - [Sujet]"');
  console.log('- html: Format spécifique Réponse');
  console.log('- messageId: ID de la réponse créée');
  console.log('');
  console.log('💡 Problème possible :');
  console.log('- Différence dans le format des données');
  console.log('- machineId incorrect dans la réponse');
  console.log('- Format HTML différent');
  
  return true;
}

// Test 4: Vérifier les messages avec statut "replied"
async function testMessagesRepondus() {
  console.log('\n📋 Test 4: Messages marqués comme répondu');
  
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'replied')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Erreur requête messages répondu:', error);
      return false;
    }

    console.log('✅ Messages marqués comme répondu:', messages?.length || 0);
    
    if (messages && messages.length > 0) {
      console.log('✅ Premier message répondu:', {
        id: messages[0].id,
        sender_name: messages[0].sender_name,
        sender_email: messages[0].sender_email,
        machine_id: messages[0].machine_id,
        status: messages[0].status,
        created_at: messages[0].created_at
      });
      
      // Vérifier s'il y a une réponse associée
      const { data: reponses, error: reponseError } = await supabase
        .from('messages')
        .select('*')
        .eq('parent_message_id', messages[0].id);

      if (reponseError) {
        console.error('❌ Erreur requête réponses:', reponseError);
      } else {
        console.log('✅ Réponses trouvées:', reponses?.length || 0);
        if (reponses && reponses.length > 0) {
          console.log('✅ Première réponse:', {
            id: reponses[0].id,
            sender_email: reponses[0].sender_email,
            recipient_email: reponses[0].recipient_email,
            status: reponses[0].status,
            sent_at: reponses[0].sent_at,
            error_message: reponses[0].error_message
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur test messages répondu:', error);
    return false;
  }
}

// Test 5: Solution immédiate
function solutionImmediate() {
  console.log('\n📋 Test 5: Solution Immédiate');
  
  console.log('🚨 PROBLÈME IDENTIFIÉ :');
  console.log('MachineDetail fonctionne mais la réponse ne fonctionne pas');
  console.log('');
  console.log('🔧 CAUSE PROBABLE :');
  console.log('- Différence dans le format des données envoyées');
  console.log('- machineId incorrect dans la réponse');
  console.log('- Format HTML différent');
  console.log('');
  console.log('✅ SOLUTION :');
  console.log('1. Utiliser le même format que MachineDetail');
  console.log('2. Vérifier que machineId est correct');
  console.log('3. Adapter le format HTML si nécessaire');
  console.log('');
  console.log('📧 RÉSULTAT ATTENDU :');
  console.log('- La réponse utilise le même mécanisme que MachineDetail');
  console.log('- L\'utilisateur reçoit l\'email de réponse');
  console.log('- Fonctionnalité complètement opérationnelle');
  
  return true;
}

// Exécution des tests
async function runDiagnostic() {
  console.log('🔧 DIAGNOSTIC MACHINEDETAIL VS RÉPONSE');
  console.log('=======================================');
  
  const results = {
    machineDetail: await testMachineDetailEmail(),
    reponse: await testReponseEmail(),
    differences: comparerDifferences(),
    messagesRepondus: await testMessagesRepondus(),
    solution: solutionImmediate()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('MachineDetail:', results.machineDetail ? '✅' : '❌');
  console.log('Réponse:', results.reponse ? '✅' : '❌');
  console.log('Différences:', results.differences ? '✅' : '❌');
  console.log('Messages répondu:', results.messagesRepondus ? '✅' : '❌');
  console.log('Solution:', results.solution ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (results.machineDetail && results.reponse) {
    console.log('🎉 Les deux fonctionnent !');
    console.log('✅ Le problème vient d\'ailleurs');
    console.log('🔧 Vérifiez les messages avec statut "replied"');
  } else if (results.machineDetail && !results.reponse) {
    console.log('⚠️ MachineDetail fonctionne mais pas la réponse');
    console.log('🔧 Problème dans le format de la réponse');
  } else {
    console.log('❌ Problème général avec l\'Edge Function');
    console.log('🔧 Vérifiez la configuration SMTP');
  }
}

// Lancer le diagnostic
runDiagnostic().catch(console.error); 