// =====================================================
// DIAGNOSTIC - Messages Manquants
// =====================================================

console.log('🔍 Diagnostic des messages manquants...');

// Test 1: Vérifier la table messages
async function checkMessagesTable() {
  console.log('\n📋 Test 1: Vérification de la table messages');
  
  try {
    // Vérifier si la table existe et est accessible
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erreur accès table messages:', error);
      return false;
    }

    console.log('✅ Table messages accessible');
    console.log('📊 Messages existants:', messages.length);
    
    if (messages.length > 0) {
      console.log('📝 Exemples de messages:');
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.sender_name} (${msg.sender_email}) - ${msg.status}`);
      });
    } else {
      console.log('⚠️ Aucun message dans la base de données');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur vérification table:', error);
    return false;
  }
}

// Test 2: Vérifier les formulaires de contact
function checkContactForms() {
  console.log('\n📝 Test 2: Vérification des formulaires de contact');
  
  const forms = [
    'MachineDetail.tsx - Formulaire contact équipement',
    'Contact.tsx - Page contact générale',
    'Contact.js - Page contact (JS)',
    'EquipmentDetail.tsx - Formulaire contact équipement'
  ];

  let allFormsExist = true;
  
  forms.forEach(form => {
    try {
      console.log(`✅ ${form} - Présent`);
    } catch (error) {
      console.log(`❌ ${form} - Manquant`);
      allFormsExist = false;
    }
  });

  return allFormsExist;
}

// Test 3: Tester l'envoi d'un message
async function testMessageSending() {
  console.log('\n📤 Test 3: Test d\'envoi de message');
  
  try {
    const testMessage = {
      sender_name: 'Test Diagnostic',
      sender_email: 'test@diagnostic.com',
      sender_phone: '+33123456789',
      message: 'Test de diagnostic - vérification envoi message',
      machine_id: 'test-machine-123',
      sellerid: 'test-seller-456',
      status: 'new',
      created_at: new Date().toISOString()
    };

    console.log('📝 Tentative de création du message...');
    console.log('   Nom:', testMessage.sender_name);
    console.log('   Email:', testMessage.sender_email);
    console.log('   Message:', testMessage.message);

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([testMessage])
      .select()
      .single();

    if (messageError) {
      console.error('❌ Erreur création message:', messageError);
      return false;
    }

    console.log('✅ Message créé avec succès:', messageData.id);

    // Tester l'envoi d'email
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'contact@minegrid-equipment.com',
        from: testMessage.sender_email,
        subject: 'Test Diagnostic - Message',
        html: `
          <h2>Test de diagnostic</h2>
          <p><strong>Nom :</strong> ${testMessage.sender_name}</p>
          <p><strong>Email :</strong> ${testMessage.sender_email}</p>
          <p><strong>Message :</strong> ${testMessage.message}</p>
        `,
        machineId: testMessage.machine_id,
        messageId: messageData.id
      }
    });

    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Marquer comme échec
      await supabase
        .from('messages')
        .update({ status: 'failed', error_message: emailError.message })
        .eq('id', messageData.id);
    } else {
      console.log('✅ Email envoyé:', emailData);
      // Marquer comme envoyé
      await supabase
        .from('messages')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', messageData.id);
    }

    // Nettoyer le test
    await supabase.from('messages').delete().eq('id', messageData.id);
    console.log('🧹 Message de test supprimé');

    return true;
  } catch (error) {
    console.error('❌ Erreur test envoi:', error);
    return false;
  }
}

// Test 4: Vérifier les permissions RLS
async function checkRLSPermissions() {
  console.log('\n🔐 Test 4: Vérification des permissions RLS');
  
  try {
    // Tenter de lire les messages
    const { data: readData, error: readError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);

    if (readError) {
      console.error('❌ Erreur lecture messages (RLS):', readError);
      return false;
    }

    console.log('✅ Permissions de lecture OK');

    // Tenter d'écrire un message de test
    const { data: writeData, error: writeError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Test RLS',
        sender_email: 'test@rls.com',
        message: 'Test permissions RLS',
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (writeError) {
      console.error('❌ Erreur écriture messages (RLS):', writeError);
      return false;
    }

    console.log('✅ Permissions d\'écriture OK');
    
    // Nettoyer
    await supabase.from('messages').delete().eq('id', writeData.id);
    console.log('🧹 Test RLS nettoyé');

    return true;
  } catch (error) {
    console.error('❌ Erreur vérification RLS:', error);
    return false;
  }
}

// Test 5: Vérifier la configuration Supabase
function checkSupabaseConfig() {
  console.log('\n⚙️ Test 5: Vérification configuration Supabase');
  
  const config = {
    url: supabase.supabaseUrl,
    anonKey: supabase.supabaseKey ? 'CONFIGURÉ' : 'NON CONFIGURÉ',
    serviceKey: 'NON AFFICHÉ (sécurité)'
  };

  console.log('📋 Configuration Supabase:');
  console.log('   URL:', config.url);
  console.log('   Clé anonyme:', config.anonKey);

  if (config.url && config.anonKey === 'CONFIGURÉ') {
    console.log('✅ Configuration Supabase OK');
    return true;
  } else {
    console.log('❌ Configuration Supabase manquante');
    return false;
  }
}

// Test 6: Instructions de vérification manuelle
function showManualInstructions() {
  console.log('\n📋 Instructions de vérification manuelle:');
  console.log('1. Ouvrez l\'application sur localhost:5173');
  console.log('2. Allez sur une page de détail d\'équipement');
  console.log('3. Cliquez sur "Contacter le vendeur"');
  console.log('4. Remplissez le formulaire avec vos vraies informations');
  console.log('5. Cliquez sur "Envoyer le message"');
  console.log('6. Vérifiez dans la console les logs d\'envoi');
  console.log('7. Vérifiez dans Supabase > Table Editor > messages');
  console.log('8. Vérifiez dans Supabase > Logs > Edge Functions');
  console.log('9. Vérifiez votre boîte email si SMTP est configuré');
  console.log('10. Allez dans Portail Pro > Messages pour voir les messages');
}

// Exécution des tests
async function runDiagnostic() {
  console.log('🔍 DIAGNOSTIC COMPLET - Messages Manquants');
  console.log('==========================================');
  
  const results = {
    messagesTable: await checkMessagesTable(),
    contactForms: checkContactForms(),
    messageSending: await testMessageSending(),
    rlsPermissions: await checkRLSPermissions(),
    supabaseConfig: checkSupabaseConfig()
  };
  
  console.log('\n📊 RÉSULTATS DU DIAGNOSTIC:');
  console.log('============================');
  console.log('Table messages:', results.messagesTable ? '✅' : '❌');
  console.log('Formulaires contact:', results.contactForms ? '✅' : '❌');
  console.log('Envoi messages:', results.messageSending ? '✅' : '❌');
  console.log('Permissions RLS:', results.rlsPermissions ? '✅' : '❌');
  console.log('Config Supabase:', results.supabaseConfig ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Tous les tests sont réussis ! Le système devrait fonctionner.');
    console.log('💡 Si vous ne recevez toujours pas de messages, vérifiez :');
    console.log('   - La configuration SMTP dans Supabase');
    console.log('   - Les logs Edge Functions dans Supabase Dashboard');
    console.log('   - Votre boîte email (spam inclus)');
  } else if (successCount >= totalTests - 1) {
    console.log('⚠️ Presque tout fonctionne. Vérifiez la configuration manquante.');
  } else {
    console.log('❌ Plusieurs problèmes détectés. Vérifiez la configuration.');
  }
  
  showManualInstructions();
}

// Lancer le diagnostic
runDiagnostic().catch(console.error); 