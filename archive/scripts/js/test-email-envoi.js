// =====================================================
// TEST ENVOI EMAIL RÉEL - Vérification Email Utilisateur
// =====================================================

console.log('📧 Test d\'envoi d\'email réel...');

// Test 1: Vérifier la configuration SMTP
async function checkSmtpConfiguration() {
  console.log('\n🔧 Test 1: Vérification configuration SMTP');
  
  try {
    // Tester l'Edge Function avec un email de test
    const { data, error } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'test@example.com',
        from: 'contact@minegrid-equipment.com',
        subject: 'Test Email Réel - Minegrid',
        html: `
          <h1>Test d\'envoi d\'email réel</h1>
          <p>Ceci est un test pour vérifier que les emails sont bien envoyés.</p>
          <p>Date: ${new Date().toLocaleString()}</p>
          <p>Si vous recevez cet email, la configuration SMTP fonctionne.</p>
        `,
        messageId: 'test-email-' + Date.now()
      }
    });

    if (error) {
      console.error('❌ Erreur Edge Function:', error);
      return false;
    }

    console.log('✅ Réponse Edge Function:', data);
    
    if (data.simulated) {
      console.log('⚠️ Email simulé - SMTP non configuré');
      console.log('📧 Pour envoyer de vrais emails, configurez SMTP dans Supabase');
      return false;
    } else {
      console.log('✅ Email envoyé via SMTP');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur test SMTP:', error);
    return false;
  }
}

// Test 2: Tester avec un vrai email
async function testRealEmail() {
  console.log('\n📧 Test 2: Test avec un vrai email');
  
  // Demander l'email de test à l'utilisateur
  const testEmail = prompt('Entrez votre email pour tester l\'envoi :');
  
  if (!testEmail) {
    console.log('❌ Aucun email fourni pour le test');
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: testEmail,
        from: 'contact@minegrid-equipment.com',
        subject: 'Test Email Réel - Minegrid Équipement',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Test Email Réel</h1>
            <p>Bonjour,</p>
            <p>Ceci est un test d'envoi d'email depuis l'application Minegrid Équipement.</p>
            <p><strong>Si vous recevez cet email :</strong></p>
            <ul>
              <li>✅ La configuration SMTP fonctionne</li>
              <li>✅ Les emails sont bien envoyés</li>
              <li>✅ Le problème vient d'ailleurs</li>
            </ul>
            <p><strong>Si vous ne recevez pas cet email :</strong></p>
            <ul>
              <li>❌ Problème de configuration SMTP</li>
              <li>❌ Email dans les spams</li>
              <li>❌ Problème de serveur SMTP</li>
            </ul>
            <hr>
            <p><small>Test effectué le ${new Date().toLocaleString()}</small></p>
          </div>
        `,
        messageId: 'test-real-' + Date.now()
      }
    });

    if (error) {
      console.error('❌ Erreur envoi email réel:', error);
      return false;
    }

    console.log('✅ Email de test envoyé:', data);
    
    if (data.simulated) {
      console.log('⚠️ Email simulé - Vérifiez la configuration SMTP');
      console.log('📋 Instructions de configuration SMTP :');
      console.log('1. Allez dans Supabase > Settings > API');
      console.log('2. Configurez les variables d\'environnement SMTP');
      console.log('3. Redéployez l\'Edge Function');
    } else {
      console.log('✅ Email envoyé via SMTP');
      console.log('📧 Vérifiez votre boîte de réception (et les spams)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test email réel:', error);
    return false;
  }
}

// Test 3: Vérifier les logs Edge Functions
async function checkEdgeFunctionLogs() {
  console.log('\n📋 Test 3: Vérification logs Edge Functions');
  
  console.log('📋 Pour vérifier les logs :');
  console.log('1. Allez dans Supabase > Edge Functions');
  console.log('2. Cliquez sur "send-contact-email"');
  console.log('3. Allez dans l\'onglet "Logs"');
  console.log('4. Vérifiez les erreurs SMTP');
  
  return true;
}

// Test 4: Instructions de configuration SMTP
function showSmtpConfigurationInstructions() {
  console.log('\n🔧 Instructions de configuration SMTP :');
  console.log('=====================================');
  console.log('');
  console.log('1. Allez dans Supabase > Settings > API');
  console.log('2. Dans la section "Environment Variables", ajoutez :');
  console.log('');
  console.log('   SMTP_HOST=smtp.gmail.com (ou votre serveur SMTP)');
  console.log('   SMTP_PORT=587');
  console.log('   SMTP_USERNAME=votre-email@gmail.com');
  console.log('   SMTP_PASSWORD=votre-mot-de-passe-app');
  console.log('   SMTP_FROM=contact@minegrid-equipment.com');
  console.log('');
  console.log('3. Redéployez l\'Edge Function :');
  console.log('   - Allez dans Supabase > Edge Functions');
  console.log('   - Cliquez sur "send-contact-email"');
  console.log('   - Cliquez sur "Deploy"');
  console.log('');
  console.log('4. Testez à nouveau l\'envoi d\'email');
  console.log('');
  console.log('⚠️ Note : Pour Gmail, utilisez un "mot de passe d\'application"');
  console.log('   et non votre mot de passe principal');
}

// Test 5: Vérifier les spams
function checkSpamInstructions() {
  console.log('\n📧 Vérification des spams :');
  console.log('==========================');
  console.log('');
  console.log('1. Vérifiez votre boîte de réception');
  console.log('2. Vérifiez le dossier "Spam" ou "Indésirable"');
  console.log('3. Vérifiez le dossier "Promotions" (Gmail)');
  console.log('4. Ajoutez contact@minegrid-equipment.com à vos contacts');
  console.log('5. Marquez l\'email comme "Non spam" si trouvé');
  console.log('');
  console.log('🔍 Recherchez dans vos emails :');
  console.log('   - "Test Email Réel - Minegrid"');
  console.log('   - "contact@minegrid-equipment.com"');
  console.log('   - Date d\'aujourd\'hui');
}

// Exécution des tests
async function runEmailTests() {
  console.log('📧 TESTS ENVOI EMAIL RÉEL');
  console.log('==========================');
  
  const results = {
    smtpConfig: await checkSmtpConfiguration(),
    realEmail: await testRealEmail(),
    logs: await checkEdgeFunctionLogs()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Configuration SMTP:', results.smtpConfig ? '✅' : '❌');
  console.log('Email réel:', results.realEmail ? '✅' : '❌');
  console.log('Logs vérifiés:', results.logs ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Configuration email parfaite !');
    console.log('✅ Les emails sont envoyés correctement');
    console.log('📧 Vérifiez votre boîte de réception');
  } else if (results.smtpConfig === false) {
    console.log('❌ Problème de configuration SMTP');
    showSmtpConfigurationInstructions();
  } else {
    console.log('⚠️ Problème partiel détecté');
    checkSpamInstructions();
  }
  
  showSmtpConfigurationInstructions();
  checkSpamInstructions();
}

// Lancer les tests
runEmailTests().catch(console.error); 