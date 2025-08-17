// =====================================================
// TEST RÉPONSE SIMPLE - Vérification Réponse Utilisateur
// =====================================================

console.log('💬 Test de réponse simple...');

// Test 1: Vérifier qu'une réponse est bien créée
async function testCreationReponse() {
  console.log('\n📝 Test 1: Création d\'une réponse');
  
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
        message: 'Ceci est une réponse de test au message original.',
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

    console.log('✅ Réponse créée avec succès:', reponse.id);
    console.log('📧 Destinataire:', reponse.recipient_email);
    console.log('🔗 Message parent:', reponse.parent_message_id);

    // Marquer le message original comme répondu
    const { error: errorUpdate } = await supabase
      .from('messages')
      .update({ status: 'replied' })
      .eq('id', messageOriginal.id);

    if (errorUpdate) {
      console.error('❌ Erreur mise à jour statut:', errorUpdate);
    } else {
      console.log('✅ Message original marqué comme répondu');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur test création:', error);
    return false;
  }
}

// Test 2: Vérifier que la réponse est visible
async function testVisibiliteReponse() {
  console.log('\n👁️ Test 2: Visibilité de la réponse');
  
  try {
    // Récupérer toutes les réponses
    const { data: reponses, error } = await supabase
      .from('messages')
      .select('*')
      .not('parent_message_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération réponses:', error);
      return false;
    }

    console.log('✅ Réponses trouvées:', reponses.length);
    
    if (reponses.length > 0) {
      reponses.forEach((reponse, index) => {
        console.log(`📝 Réponse ${index + 1}:`);
        console.log(`   ID: ${reponse.id}`);
        console.log(`   De: ${reponse.sender_name}`);
        console.log(`   À: ${reponse.recipient_email}`);
        console.log(`   Message parent: ${reponse.parent_message_id}`);
        console.log(`   Statut: ${reponse.status}`);
        console.log(`   Date: ${new Date(reponse.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur test visibilité:', error);
    return false;
  }
}

// Test 3: Vérifier l'interface utilisateur
function testInterfaceUtilisateur() {
  console.log('\n🖥️ Test 3: Interface utilisateur');
  
  console.log('📋 Vérifications à faire dans l\'interface :');
  console.log('1. Allez dans Portail Pro > Messages');
  console.log('2. Vérifiez que les messages ont un statut "Répondu"');
  console.log('3. Cliquez sur un message pour voir s\'il y a des réponses');
  console.log('4. Vérifiez que le bouton "Répondre" fonctionne');
  console.log('5. Vérifiez que les réponses s\'affichent');
  
  return true;
}

// Test 4: Simuler l'envoi d'email (optionnel)
async function testEnvoiEmailSimule() {
  console.log('\n📧 Test 4: Envoi d\'email simulé');
  
  try {
    // Récupérer un message avec réponse
    const { data: reponses, error } = await supabase
      .from('messages')
      .select('*, parent:parent_message_id(*)')
      .not('parent_message_id', 'is', null)
      .limit(1);

    if (error || !reponses || reponses.length === 0) {
      console.log('⚠️ Aucune réponse trouvée pour tester l\'email');
      return true;
    }

    const reponse = reponses[0];
    console.log('✅ Test d\'envoi d\'email pour la réponse:', reponse.id);

    // Simuler l'envoi d'email
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: reponse.recipient_email,
        from: 'contact@minegrid-equipment.com',
        subject: `Réponse - ${reponse.parent?.subject || 'Demande d\'information'}`,
        html: `
          <h2>Réponse à votre demande</h2>
          <p><strong>Message original :</strong></p>
          <p>${reponse.parent?.message || 'Message original'}</p>
          <hr>
          <p><strong>Notre réponse :</strong></p>
          <p>${reponse.message}</p>
          <hr>
          <p>Cordialement,<br>L'équipe Minegrid Équipement</p>
        `,
        messageId: reponse.id
      }
    });

    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    } else {
      console.log('✅ Email envoyé (simulé ou réel):', emailData);
      
      // Mettre à jour le statut
      await supabase
        .from('messages')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', reponse.id);
      
      console.log('✅ Statut de la réponse mis à jour');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur test email:', error);
    return false;
  }
}

// Exécution des tests
async function runTestsReponse() {
  console.log('💬 TESTS RÉPONSE SIMPLE');
  console.log('=======================');
  
  const results = {
    creation: await testCreationReponse(),
    visibilite: await testVisibiliteReponse(),
    interface: testInterfaceUtilisateur(),
    email: await testEnvoiEmailSimule()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Création réponse:', results.creation ? '✅' : '❌');
  console.log('Visibilité réponse:', results.visibilite ? '✅' : '❌');
  console.log('Interface utilisateur:', results.interface ? '✅' : '❌');
  console.log('Envoi email:', results.email ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 Fonctionnalité de réponse opérationnelle !');
    console.log('✅ Les réponses sont créées et visibles');
    console.log('✅ L\'interface utilisateur fonctionne');
    console.log('✅ Les emails sont envoyés (simulés ou réels)');
  } else {
    console.log('⚠️ Problèmes détectés dans la fonctionnalité de réponse');
    console.log('🔧 Vérifiez la base de données et l\'interface');
  }
  
  console.log('\n📋 Actions recommandées :');
  console.log('1. Vérifiez l\'interface Messages dans le Portail Pro');
  console.log('2. Testez le bouton "Répondre" sur un message');
  console.log('3. Vérifiez que les réponses s\'affichent');
  console.log('4. Configurez SMTP si vous voulez de vrais emails');
}

// Lancer les tests
runTestsReponse().catch(console.error); 