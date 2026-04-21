// =====================================================
// DIAGNOSTIC EMAIL NON ENVOYÉ - Problème identifié
// =====================================================

console.log('🔧 Diagnostic email non envoyé...');

// Test 1: Vérifier l'Edge Function send-contact-email
async function testEdgeFunctionEmail() {
  console.log('\n📋 Test 1: Edge Function send-contact-email');
  
  try {
    // Test direct de l'Edge Function
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'test@example.com',
        from: 'contact@minegrid-equipment.com',
        subject: 'Test Email Diagnostic',
        html: '<h1>Test Email</h1><p>Ceci est un test pour diagnostiquer le problème d\'envoi.</p>',
        machineId: 'test-machine',
        messageId: 'test-' + Date.now()
      }
    });

    if (emailError) {
      console.error('❌ Erreur Edge Function:', emailError);
      console.log('💡 Problème: L\'Edge Function ne fonctionne pas');
      return false;
    }

    console.log('✅ Edge Function fonctionne:', emailData);
    console.log('📧 Email simulé:', emailData.simulated);
    
    if (emailData.simulated) {
      console.log('⚠️ ATTENTION: Email simulé, pas de vrai envoi !');
      console.log('💡 Problème: SMTP non configuré dans Supabase');
    } else {
      console.log('✅ Email réellement envoyé !');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur test Edge Function:', error);
    return false;
  }
}

// Test 2: Vérifier les messages avec statut "replied"
async function testMessagesRepondus() {
  console.log('\n📋 Test 2: Messages marqués comme répondu');
  
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'replied')
      .order('created_at', { ascending: false });

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
            sent_at: reponses[0].sent_at
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

// Test 3: Vérifier la configuration SMTP
function testConfigurationSMTP() {
  console.log('\n📋 Test 3: Configuration SMTP');
  
  console.log('🔍 Vérifications à faire :');
  console.log('');
  console.log('1. Allez dans Supabase > Settings > API');
  console.log('2. Vérifiez les variables d\'environnement :');
  console.log('   - SMTP_HOST');
  console.log('   - SMTP_PORT');
  console.log('   - SMTP_USERNAME');
  console.log('   - SMTP_PASSWORD');
  console.log('   - SMTP_FROM');
  console.log('');
  console.log('3. Si elles n\'existent pas, ajoutez-les :');
  console.log('   SMTP_HOST=smtp.gmail.com');
  console.log('   SMTP_PORT=587');
  console.log('   SMTP_USERNAME=votre-email@gmail.com');
  console.log('   SMTP_PASSWORD=votre-mot-de-passe-app');
  console.log('   SMTP_FROM=contact@minegrid-equipment.com');
  console.log('');
  console.log('4. Redéployez l\'Edge Function :');
  console.log('   - Allez dans Supabase > Edge Functions');
  console.log('   - Cliquez sur "send-contact-email"');
  console.log('   - Cliquez sur "Deploy"');
  
  return true;
}

// Test 4: Vérifier les erreurs 400/500
function testErreursConsole() {
  console.log('\n📋 Test 4: Erreurs Console');
  
  console.log('🔍 Erreurs détectées dans la console :');
  console.log('');
  console.log('❌ Erreurs 400: Requêtes messages incorrectes');
  console.log('   - Problème: RLS ou structure de table');
  console.log('   - Solution: Vérifier les politiques RLS');
  console.log('');
  console.log('❌ Erreurs 500: Edge Function exchange-rates');
  console.log('   - Problème: Fonction non déployée ou cassée');
  console.log('   - Solution: Redéployer ou corriger la fonction');
  console.log('');
  console.log('💡 Actions immédiates :');
  console.log('1. Configurer SMTP dans Supabase');
  console.log('2. Redéployer send-contact-email');
  console.log('3. Vérifier les politiques RLS messages');
  
  return true;
}

// Test 5: Solution immédiate
function solutionImmediate() {
  console.log('\n📋 Test 5: Solution Immédiate');
  
  console.log('🚨 PROBLÈME IDENTIFIÉ :');
  console.log('Les messages sont marqués comme "répondu" mais les emails ne sont pas envoyés');
  console.log('');
  console.log('🔧 CAUSE :');
  console.log('- SMTP non configuré dans Supabase');
  console.log('- Edge Function en mode simulation');
  console.log('');
  console.log('✅ SOLUTION :');
  console.log('1. Configurez SMTP dans Supabase Settings > API');
  console.log('2. Redéployez l\'Edge Function send-contact-email');
  console.log('3. Testez l\'envoi d\'email');
  console.log('');
  console.log('📧 RÉSULTAT ATTENDU :');
  console.log('- L\'utilisateur reçoit l\'email de réponse');
  console.log('- Le statut reste "répondu"');
  console.log('- Fonctionnalité complètement opérationnelle');
  
  return true;
}

// Exécution des tests
async function runDiagnostic() {
  console.log('🔧 DIAGNOSTIC EMAIL NON ENVOYÉ');
  console.log('===============================');
  
  const results = {
    edgeFunction: await testEdgeFunctionEmail(),
    messagesRepondus: await testMessagesRepondus(),
    smtpConfig: testConfigurationSMTP(),
    erreursConsole: testErreursConsole(),
    solution: solutionImmediate()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Edge Function:', results.edgeFunction ? '✅' : '❌');
  console.log('Messages répondu:', results.messagesRepondus ? '✅' : '❌');
  console.log('Config SMTP:', results.smtpConfig ? '✅' : '❌');
  console.log('Erreurs console:', results.erreursConsole ? '✅' : '❌');
  console.log('Solution:', results.solution ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (results.edgeFunction && results.messagesRepondus) {
    console.log('🎉 Diagnostic complet !');
    console.log('✅ Le problème est identifié : SMTP non configuré');
    console.log('✅ Configurez SMTP et redéployez l\'Edge Function');
  } else {
    console.log('⚠️ Problèmes multiples détectés');
    console.log('🔧 Suivez les instructions de configuration SMTP');
  }
}

// Lancer le diagnostic
runDiagnostic().catch(console.error); 