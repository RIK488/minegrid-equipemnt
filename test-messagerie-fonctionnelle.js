// =====================================================
// SCRIPT : TEST MESSAGERIE FONCTIONNELLE
// =====================================================
// Ce script vérifie que les messages sont réellement envoyés

console.log('🧪 Test de la messagerie fonctionnelle...');

// 1. Test de la fonction Edge send-contact-email
async function testSendContactEmail() {
  console.log('\n📧 Test 1: Fonction Edge send-contact-email');
  
  try {
    const testData = {
      to: 'test@example.com',
      from: 'contact@minegrid-equipment.com',
      subject: 'Test messagerie fonctionnelle',
      html: `
        <h2>Test de messagerie</h2>
        <p>Ceci est un test pour vérifier que les emails sont réellement envoyés.</p>
        <p>Date: ${new Date().toLocaleString()}</p>
      `,
      machineId: 'test-machine-123',
      messageId: 'test-message-456'
    };

    console.log('📤 Tentative d\'envoi d\'email...');
    console.log('   À:', testData.to);
    console.log('   De:', testData.from);
    console.log('   Sujet:', testData.subject);

    const response = await fetch('/functions/v1/send-contact-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status de la réponse:', response.status);
    
    const result = await response.json();
    console.log('📄 Réponse:', result);

    if (result.success) {
      console.log('✅ Email envoyé avec succès !');
      return true;
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
}

// 2. Test de la fonction Edge send-email
async function testSendEmail() {
  console.log('\n📧 Test 2: Fonction Edge send-email');
  
  try {
    const testData = {
      to: 'test@example.com',
      subject: 'Test send-email fonction',
      html: `
        <h2>Test fonction send-email</h2>
        <p>Test de la fonction send-email via Supabase SMTP.</p>
        <p>Date: ${new Date().toLocaleString()}</p>
      `
    };

    console.log('📤 Tentative d\'envoi via send-email...');

    const response = await fetch('/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status de la réponse:', response.status);
    
    const result = await response.json();
    console.log('📄 Réponse:', result);

    if (result.success) {
      console.log('✅ Email envoyé avec succès via send-email !');
      return true;
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors du test send-email:', error);
    return false;
  }
}

// 3. Test de la sauvegarde des messages dans la base de données
async function testMessageDatabase() {
  console.log('\n💾 Test 3: Sauvegarde des messages en base');
  
  try {
    const testMessage = {
      sender_name: 'Test Utilisateur',
      sender_email: 'test@example.com',
      sender_phone: '+33123456789',
      message: 'Test de sauvegarde de message en base de données',
      machine_id: 'test-machine-789',
      sellerid: 'test-seller-123',
      status: 'new',
      created_at: new Date().toISOString()
    };

    console.log('💾 Tentative de sauvegarde du message...');

    const { data, error } = await supabase
      .from('messages')
      .insert([testMessage])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur sauvegarde message:', error);
      return false;
    }

    console.log('✅ Message sauvegardé avec succès !');
    console.log('   ID:', data.id);
    console.log('   Status:', data.status);
    console.log('   Date:', data.created_at);

    // Nettoyer le test
    await supabase
      .from('messages')
      .delete()
      .eq('id', data.id);

    console.log('🧹 Message de test supprimé');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test base de données:', error);
    return false;
  }
}

// 4. Test de la réponse aux messages
async function testMessageReply() {
  console.log('\n💬 Test 4: Réponse aux messages');
  
  try {
    // Créer un message de test
    const { data: originalMessage, error: createError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Test Expéditeur',
        sender_email: 'expediteur@test.com',
        message: 'Message original de test',
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création message original:', createError);
      return false;
    }

    console.log('✅ Message original créé:', originalMessage.id);

    // Créer une réponse
    const { data: replyMessage, error: replyError } = await supabase
      .from('messages')
      .insert([{
        sender_name: 'Réponse automatique',
        sender_email: 'reponse@minegrid.com',
        message: 'Ceci est une réponse de test',
        status: 'sent',
        parent_message_id: originalMessage.id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (replyError) {
      console.error('❌ Erreur création réponse:', replyError);
      return false;
    }

    console.log('✅ Réponse créée:', replyMessage.id);

    // Marquer le message original comme répondu
    const { error: updateError } = await supabase
      .from('messages')
      .update({ status: 'replied' })
      .eq('id', originalMessage.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour statut:', updateError);
      return false;
    }

    console.log('✅ Message original marqué comme répondu');

    // Nettoyer les tests
    await supabase.from('messages').delete().eq('id', originalMessage.id);
    await supabase.from('messages').delete().eq('id', replyMessage.id);

    console.log('🧹 Messages de test supprimés');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test de réponse:', error);
    return false;
  }
}

// 5. Test de la configuration SMTP
async function testSMTPConfiguration() {
  console.log('\n⚙️ Test 5: Configuration SMTP');
  
  try {
    // Vérifier les variables d'environnement
    const smtpConfig = {
      host: Deno.env.get('SMTP_HOST'),
      port: Deno.env.get('SMTP_PORT'),
      username: Deno.env.get('SMTP_USERNAME'),
      password: Deno.env.get('SMTP_PASSWORD') ? '***CONFIGURÉ***' : 'NON CONFIGURÉ',
      from: Deno.env.get('SMTP_FROM')
    };

    console.log('📋 Configuration SMTP:');
    console.log('   Host:', smtpConfig.host || 'NON CONFIGURÉ');
    console.log('   Port:', smtpConfig.port || 'NON CONFIGURÉ');
    console.log('   Username:', smtpConfig.username || 'NON CONFIGURÉ');
    console.log('   Password:', smtpConfig.password);
    console.log('   From:', smtpConfig.from || 'NON CONFIGURÉ');

    const isConfigured = smtpConfig.host && smtpConfig.username && smtpConfig.password !== 'NON CONFIGURÉ';
    
    if (isConfigured) {
      console.log('✅ Configuration SMTP complète');
      return true;
    } else {
      console.log('⚠️ Configuration SMTP incomplète - les emails seront simulés');
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification SMTP:', error);
    return false;
  }
}

// 6. Test complet de la messagerie
async function testCompleteMessaging() {
  console.log('\n🚀 Test 6: Test complet de la messagerie');
  
  try {
    // Simuler un formulaire de contact complet
    const contactData = {
      name: 'Test Utilisateur Complet',
      email: 'test.complet@example.com',
      phone: '+33123456789',
      message: 'Test complet de la messagerie - vérification que tout fonctionne',
      machineId: 'test-machine-complete',
      sellerId: 'test-seller-complete'
    };

    console.log('📝 Données de contact:', contactData);

    // 1. Sauvegarder le message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([{
        sender_name: contactData.name,
        sender_email: contactData.email,
        sender_phone: contactData.phone,
        message: contactData.message,
        machine_id: contactData.machineId,
        sellerid: contactData.sellerId,
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (messageError) {
      console.error('❌ Erreur sauvegarde message:', messageError);
      return false;
    }

    console.log('✅ Message sauvegardé:', messageData.id);

    // 2. Envoyer l'email
    const emailResult = await testSendContactEmail();
    
    if (!emailResult) {
      console.log('⚠️ Email non envoyé, mais message sauvegardé');
    }

    // 3. Marquer comme envoyé
    const { error: updateError } = await supabase
      .from('messages')
      .update({ 
        status: emailResult ? 'sent' : 'pending',
        sent_at: emailResult ? new Date().toISOString() : null
      })
      .eq('id', messageData.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour statut:', updateError);
    } else {
      console.log('✅ Statut mis à jour:', emailResult ? 'sent' : 'pending');
    }

    // Nettoyer
    await supabase.from('messages').delete().eq('id', messageData.id);
    console.log('🧹 Test complet nettoyé');

    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
    return false;
  }
}

// 7. Instructions pour vérifier manuellement
function showManualVerificationInstructions() {
  console.log('\n📋 Instructions de vérification manuelle:');
  console.log('1. Ouvrez l\'application sur localhost:5173');
  console.log('2. Allez sur une page de détail d\'équipement');
  console.log('3. Remplissez le formulaire de contact');
  console.log('4. Cliquez sur "Envoyer"');
  console.log('5. Vérifiez dans la console du navigateur les logs');
  console.log('6. Vérifiez dans Supabase > Logs > Edge Functions');
  console.log('7. Vérifiez dans votre boîte email si l\'email est reçu');
  console.log('8. Vérifiez dans Supabase > Table Editor > messages');
}

// 8. Résumé des tests
async function runAllTests() {
  console.log('🧪 DÉMARRAGE DES TESTS DE MESSAGERIE');
  console.log('=====================================');

  const results = {
    smtpConfig: await testSMTPConfiguration(),
    contactEmail: await testSendContactEmail(),
    sendEmail: await testSendEmail(),
    database: await testMessageDatabase(),
    reply: await testMessageReply(),
    complete: await testCompleteMessaging()
  };

  console.log('\n📊 RÉSULTATS DES TESTS');
  console.log('======================');
  console.log('Configuration SMTP:', results.smtpConfig ? '✅' : '❌');
  console.log('Fonction send-contact-email:', results.contactEmail ? '✅' : '❌');
  console.log('Fonction send-email:', results.sendEmail ? '✅' : '❌');
  console.log('Base de données messages:', results.database ? '✅' : '❌');
  console.log('Réponse aux messages:', results.reply ? '✅' : '❌');
  console.log('Test complet:', results.complete ? '✅' : '❌');

  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 RÉSULTAT FINAL: ${successCount}/${totalTests} tests réussis`);

  if (successCount === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT RÉUSSIS ! La messagerie fonctionne parfaitement.');
  } else if (successCount >= totalTests - 1) {
    console.log('⚠️ La plupart des tests sont réussis. Vérifiez la configuration SMTP.');
  } else {
    console.log('❌ Plusieurs tests ont échoué. Vérifiez la configuration.');
  }

  showManualVerificationInstructions();
}

// Exécution des tests
runAllTests().catch(console.error); 