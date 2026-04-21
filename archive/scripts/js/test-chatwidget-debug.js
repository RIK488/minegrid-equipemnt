// test-chatwidget-debug.js
// Script de test pour reproduire exactement le comportement du ChatWidget

console.log('🧪 Test de debug du ChatWidget...');

async function testChatWidgetBehavior() {
  try {
    console.log('📡 Test de l\'API n8n...');
    
    const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'bonjour' })
    });

    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, errorText);
      return;
    }

    // Lire le body une seule fois
    const raw = await response.text();
    console.log('📄 Réponse brute:', raw);

    // Test 1: Tentative de parsing JSON
    let data;
    try {
      data = JSON.parse(raw);
      console.log('✅ Parsing JSON réussi:', data);
    } catch (e) {
      console.log('⚠️ Échec parsing JSON, tentative manuelle...');
      
      let cleaned = raw.trim().replace(/^=\s*/, '');
      if (cleaned.includes('"response":"=')) {
        cleaned = cleaned.replace('"response":"=', '"response":"');
      }
      cleaned = cleaned.replace(/\\n/g, ' ');
      
      try {
        data = JSON.parse(cleaned);
        console.log('✅ Parsing manuel réussi:', data);
      } catch (parseError) {
        console.log('❌ Parsing manuel échoué, utilisation brut');
        data = { response: cleaned };
      }
    }

    // Test 2: Extraction de la réponse
    let botResponseText;
    if (Array.isArray(data) && data.length > 0) {
      botResponseText = data[0]?.response ?? String(data[0] ?? 'Erreur: pas de réponse');
    } else {
      botResponseText = data?.response ?? String(data ?? 'Erreur: pas de réponse');
    }

    console.log('💬 Réponse extraite:', botResponseText);

    // Test 3: Vérification finale
    if (botResponseText.includes('Erreur de parsing') || 
        botResponseText.includes('Format de réponse') || 
        botResponseText.includes('JSON') ||
        botResponseText.includes('[object Object]')) {
      console.log('⚠️ Message d\'erreur technique détecté');
      botResponseText = "Bonjour ! Je suis l'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?";
    }

    console.log('🎯 Réponse finale:', botResponseText);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.error('❌ Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Message:', error instanceof Error ? error.message : String(error));
  }
}

testChatWidgetBehavior(); 