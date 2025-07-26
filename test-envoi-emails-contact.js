// =====================================================
// SCRIPT : TEST ENVOI EMAILS CONTACT MACHINE DETAIL
// =====================================================
// Ce script teste l'envoi d'emails depuis le formulaire de contact

console.log('🧪 Test du système d\'envoi d\'emails de contact...');

// 1. Vérifier la configuration de la base de données
async function checkDatabaseConfig() {
  console.log('📋 Vérification de la configuration de la base de données...');
  
  try {
    // Vérifier la table messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.error('❌ Erreur table messages:', messagesError);
      return false;
    }
    
    console.log('✅ Table messages accessible');
    
    // Vérifier la table profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erreur table profiles:', profilesError);
      return false;
    }
    
    console.log('✅ Table profiles accessible');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur vérification base de données:', error);
    return false;
  }
}

// 2. Simuler l'envoi d'un email de contact
async function simulateContactEmail() {
  console.log('\n📧 Simulation d\'envoi d\'email de contact...');
  
  const testData = {
    name: 'Test Utilisateur',
    email: 'test@example.com',
    phone: '+33123456789',
    message: 'Je suis intéressé par cette machine. Pouvez-vous me donner plus d\'informations ?',
    machineId: 'test-machine-id',
    sellerId: 'test-seller-id'
  };
  
  try {
    // 1. Sauvegarder le message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          sender_name: testData.name,
          sender_email: testData.email,
          sender_phone: testData.phone,
          message: testData.message,
          machine_id: testData.machineId,
          seller_id: testData.sellerId,
          status: 'new',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (messageError) {
      console.error('❌ Erreur sauvegarde message:', messageError);
      return false;
    }
    
    console.log('✅ Message sauvegardé avec ID:', messageData.id);
    
    // 2. Tester l'envoi d'email
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: 'contact@minegrid-equipment.com',
        from: testData.email,
        subject: `Test - Demande d'information`,
        html: `
          <h2>Test - Nouvelle demande d'information</h2>
          <p><strong>Nom :</strong> ${testData.name}</p>
          <p><strong>Email :</strong> ${testData.email}</p>
          <p><strong>Téléphone :</strong> ${testData.phone}</p>
          <p><strong>Message :</strong></p>
          <p>${testData.message}</p>
        `,
        machineId: testData.machineId,
        messageId: messageData.id
      }
    });
    
    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      return false;
    }
    
    console.log('✅ Email envoyé avec succès:', emailData);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur simulation email:', error);
    return false;
  }
}

// 3. Vérifier les messages existants
async function checkExistingMessages() {
  console.log('\n📨 Vérification des messages existants...');
  
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur récupération messages:', error);
      return;
    }
    
    console.log(`📊 ${messages.length} messages trouvés:`);
    messages.forEach((msg, idx) => {
      console.log(`   ${idx + 1}. ${msg.sender_name} (${msg.sender_email}) - ${msg.status} - ${new Date(msg.created_at).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification messages:', error);
  }
}

// 4. Instructions pour l'utilisateur
function showInstructions() {
  console.log('\n📝 Instructions de test:');
  console.log('1. Allez sur une page de détail de machine (ex: #machines/[machine-id])');
  console.log('2. Cliquez sur "Contacter le vendeur"');
  console.log('3. Remplissez le formulaire avec vos informations');
  console.log('4. Cliquez sur "Envoyer le message"');
  console.log('5. Vérifiez que le message est sauvegardé et l\'email envoyé');
  console.log('6. Vérifiez dans la boîte de réception du vendeur');
}

// 5. Configuration requise
function showRequiredConfig() {
  console.log('\n⚙️ Configuration requise dans Supabase:');
  console.log('1. Variables d\'environnement SMTP:');
  console.log('   - SMTP_HOST (ex: smtp.gmail.com)');
  console.log('   - SMTP_PORT (ex: 587)');
  console.log('   - SMTP_USERNAME (ex: contact@minegrid-equipment.com)');
  console.log('   - SMTP_PASSWORD (mot de passe SMTP)');
  console.log('   - SMTP_FROM (ex: contact@minegrid-equipment.com)');
  console.log('2. Edge Function déployée: send-contact-email');
  console.log('3. Table messages avec les bonnes colonnes');
  console.log('4. Permissions RLS configurées');
}

// 6. Exécution des tests
async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  const dbOk = await checkDatabaseConfig();
  if (!dbOk) {
    console.log('❌ Configuration base de données incorrecte');
    return;
  }
  
  await checkExistingMessages();
  
  const emailOk = await simulateContactEmail();
  if (emailOk) {
    console.log('\n🎉 Tests réussis ! Le système d\'envoi d\'emails fonctionne.');
  } else {
    console.log('\n⚠️ Tests partiellement réussis. Vérifiez la configuration SMTP.');
  }
  
  showInstructions();
  showRequiredConfig();
}

// =====================================================
// RÉSULTAT ATTENDU :
// - Formulaire de contact fonctionnel
// - Messages sauvegardés dans la base de données
// - Emails envoyés aux vendeurs
// - Notifications de succès/erreur
// ===================================================== 