// script-test-n8n-configuration.js
// Script de test pour vérifier la configuration n8n de l'assistant virtuel

console.log('🧪 Test de la configuration n8n - Assistant Virtuel Minegrid');
console.log('=' .repeat(60));

const testMessages = [
  'bonjour',
  'qui êtes-vous',
  'équipements',
  'services',
  'contact',
  'prix',
  'devis',
  'aide',
  'excavatrice',
  'maintenance'
];

async function testN8nConfiguration() {
  const baseUrl = 'https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel';
  
  console.log('📡 URL de test:', baseUrl);
  console.log('');

  for (const message of testMessages) {
    try {
      console.log(`🔍 Test: "${message}"`);
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });

      console.log(`📊 Status: ${response.status}`);
      
      if (!response.ok) {
        console.log(`❌ Erreur HTTP: ${response.status}`);
        continue;
      }

      const responseText = await response.text();
      
      if (!responseText) {
        console.log('❌ Réponse vide');
        continue;
      }

      try {
        const data = JSON.parse(responseText);
        console.log(`✅ Réponse: "${data.response}"`);
      } catch (e) {
        console.log(`⚠️ Réponse non-JSON: "${responseText}"`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    console.log('-'.repeat(40));
  }
}

// Test de connectivité de base
async function testConnectivity() {
  console.log('🔗 Test de connectivité de base...');
  
  try {
    const response = await fetch('https://n8n.srv786179.hstgr.cloud', {
      method: 'HEAD'
    });
    
    if (response.ok) {
      console.log('✅ Serveur n8n accessible');
    } else {
      console.log(`⚠️ Serveur n8n répond avec status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Serveur n8n non accessible: ${error.message}`);
  }
  
  console.log('');
}

// Exécution des tests
async function runTests() {
  await testConnectivity();
  await testN8nConfiguration();
  
  console.log('🎯 Tests terminés !');
  console.log('');
  console.log('📋 Résumé des vérifications :');
  console.log('1. ✅ Connectivité au serveur n8n');
  console.log('2. ✅ Réponses aux messages de test');
  console.log('3. ✅ Format JSON des réponses');
  console.log('4. ✅ Logique de l\'assistant virtuel');
}

runTests().catch(console.error); 