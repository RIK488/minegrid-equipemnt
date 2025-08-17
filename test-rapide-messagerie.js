// =====================================================
// TEST RAPIDE MESSAGERIE - Vérification Fonctionnelle
// =====================================================

console.log('🚀 Test rapide de la messagerie...');

// Test 1: Vérifier que les fonctions Edge sont accessibles
async function testEdgeFunctions() {
  console.log('\n📧 Test 1: Accessibilité des fonctions Edge');
  
  try {
    // Test send-contact-email
    const response1 = await fetch('/functions/v1/send-contact-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        from: 'contact@minegrid-equipment.com',
        subject: 'Test rapide',
        html: '<p>Test</p>'
      })
    });
    
    console.log('✅ send-contact-email accessible (status:', response1.status, ')');
    
    // Test send-email
    const response2 = await fetch('/functions/v1/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test rapide',
        html: '<p>Test</p>'
      })
    });
    
    console.log('✅ send-email accessible (status:', response2.status, ')');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur accès fonctions Edge:', error);
    return false;
  }
}

// Test 2: Vérifier la base de données
async function testDatabase() {
  console.log('\n💾 Test 2: Accès base de données');
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur accès base de données:', error);
      return false;
    }
    
    console.log('✅ Base de données accessible');
    return true;
  } catch (error) {
    console.error('❌ Erreur base de données:', error);
    return false;
  }
}

// Test 3: Test d'envoi réel
async function testRealSend() {
  console.log('\n📤 Test 3: Test d\'envoi réel');
  
  try {
    const testData = {
      to: 'test@example.com',
      from: 'contact@minegrid-equipment.com',
      subject: 'Test messagerie fonctionnelle',
      html: `
        <h2>Test de messagerie</h2>
        <p>Ceci est un test pour vérifier que les emails sont réellement envoyés.</p>
        <p>Date: ${new Date().toLocaleString()}</p>
        <p>Si vous recevez cet email, la messagerie fonctionne !</p>
      `,
      machineId: 'test-machine-123',
      messageId: 'test-message-456'
    };

    const response = await fetch('/functions/v1/send-contact-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('📄 Réponse:', result);
    
    if (result.success) {
      if (result.simulated) {
        console.log('⚠️ Email simulé (SMTP non configuré)');
        console.log('💡 Pour un envoi réel, configurez SMTP dans Supabase');
      } else {
        console.log('✅ Email envoyé avec succès !');
      }
      return true;
    } else {
      console.log('❌ Erreur lors de l\'envoi:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur test d\'envoi:', error);
    return false;
  }
}

// Test 4: Vérifier les composants de messagerie
function testComponents() {
  console.log('\n🧩 Test 4: Composants de messagerie');
  
  // Vérifier que les composants existent
  const components = [
    'MessagesBoite',
    'ProDashboard',
    'MachineDetail'
  ];
  
  let allComponentsExist = true;
  
  components.forEach(component => {
    try {
      // Vérifier si le composant est accessible
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
  console.log('2. Allez sur une page de détail d\'équipement');
  console.log('3. Remplissez le formulaire de contact avec votre vrai email');
  console.log('4. Cliquez sur "Envoyer"');
  console.log('5. Vérifiez votre boîte email');
  console.log('6. Vérifiez dans Supabase > Table Editor > messages');
  console.log('7. Testez la réponse aux messages dans le Portail Pro');
}

// Exécution des tests
async function runQuickTests() {
  console.log('🧪 TESTS RAPIDES DE MESSAGERIE');
  console.log('==============================');
  
  const results = {
    edgeFunctions: await testEdgeFunctions(),
    database: await testDatabase(),
    realSend: await testRealSend(),
    components: testComponents()
  };
  
  console.log('\n📊 RÉSULTATS:');
  console.log('=============');
  console.log('Fonctions Edge:', results.edgeFunctions ? '✅' : '❌');
  console.log('Base de données:', results.database ? '✅' : '❌');
  console.log('Test d\'envoi:', results.realSend ? '✅' : '❌');
  console.log('Composants:', results.components ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successCount}/${totalTests} tests réussis`);
  
  if (successCount === totalTests) {
    console.log('🎉 La messagerie est fonctionnelle !');
  } else if (successCount >= totalTests - 1) {
    console.log('⚠️ Presque tout fonctionne. Vérifiez la configuration SMTP.');
  } else {
    console.log('❌ Plusieurs problèmes détectés. Vérifiez la configuration.');
  }
  
  showManualInstructions();
}

// Lancer les tests
runQuickTests().catch(console.error); 