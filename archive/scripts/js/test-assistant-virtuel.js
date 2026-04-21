// test-assistant-virtuel.js
// Script de test pour vérifier le fonctionnement de l'assistant virtuel

console.log('🧪 Test de l\'assistant virtuel...');

async function testAssistantVirtuel() {
  try {
    console.log('📡 Tentative de connexion à l\'API...');
    
    const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'test' })
    });

    console.log('📊 Status de la réponse:', response.status);
    console.log('📊 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, errorText);
      return false;
    }

    const responseText = await response.text();
    console.log('📦 Réponse brute:', responseText);

    if (!responseText) {
      console.error('❌ Réponse vide');
      return false;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Réponse JSON valide:', data);
      return true;
    } catch (e) {
      console.log('⚠️ Réponse non-JSON:', responseText);
      return true; // L'API peut renvoyer du texte simple
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return false;
  }
}

// Exécuter le test
testAssistantVirtuel().then(success => {
  if (success) {
    console.log('✅ L\'API de l\'assistant virtuel fonctionne !');
  } else {
    console.log('❌ L\'API de l\'assistant virtuel ne fonctionne pas.');
  }
}); 