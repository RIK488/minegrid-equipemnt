// test-integration-ia.js
// Script de test complet pour l'intégration des agents IA Minegrid

const testAIIntegration = async () => {
  console.log('🧪 Test d\'intégration IA Minegrid Équipement...\n');
  
  const baseURL = 'https://n8n.srv786179.hstgr.cloud/webhook/';
  const results = {
    assistant: false,
    analysis: false,
    autoSpecs: false,
    errors: []
  };
  
  // Configuration de test
  const testConfig = {
    timeout: 30000, // 30 secondes
    retries: 2
  };

  // Fonction utilitaire pour les requêtes avec timeout
  const fetchWithTimeout = async (url, options, timeout = testConfig.timeout) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Test 1: Assistant Virtuel Enrichi
  console.log('1️⃣ Test Assistant Virtuel Enrichi...');
  console.log('   URL:', `${baseURL}assistant_virtuel_enrichi`);
  
  try {
    const testCases = [
      {
        name: 'Salutation basique',
        payload: {
          message: 'Bonjour, je cherche une excavatrice Caterpillar',
          user_id: 'test-user-123',
          session_id: 'test-session-456',
          context: {
            page: '/equipment',
            user_type: 'acheteur'
          }
        }
      },
      {
        name: 'Demande de prix',
        payload: {
          message: 'Combien coûte une excavatrice CAT 320D?',
          user_id: 'test-user-123',
          session_id: 'test-session-456',
          context: {
            page: '/equipment/cat-320d',
            equipment_id: 'eq-123',
            user_type: 'acheteur'
          }
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`   🔍 ${testCase.name}...`);
      
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${baseURL}assistant_virtuel_enrichi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.payload)
      });
      
      const duration = Date.now() - startTime;
      const result = await response.json();
      
      if (response.ok && result.response) {
        console.log(`   ✅ ${testCase.name}: OK (${duration}ms)`);
        console.log(`      Réponse: ${result.response.substring(0, 100)}...`);
        console.log(`      Intent: ${result.metadata?.intent || 'N/A'}`);
        console.log(`      Confiance: ${result.metadata?.confidence || 'N/A'}`);
        console.log(`      Suggestions: ${result.suggestions?.actions?.length || 0}`);
        results.assistant = true;
      } else {
        throw new Error(`Réponse invalide: ${JSON.stringify(result)}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Assistant IA: ERREUR - ${error.message}`);
    results.errors.push(`Assistant IA: ${error.message}`);
  }
  
  console.log('');

  // Test 2: Analyse Prédictive
  console.log('2️⃣ Test Analyse Prédictive...');
  console.log('   URL:', `${baseURL}analyse_predictive`);
  
  try {
    const analysisTests = [
      {
        name: 'Pipeline Commercial',
        payload: {
          analysis_type: 'pipeline_commercial',
          user_id: 'test-user-123',
          business_unit: 'vendeur',
          date_range: { start: '2024-01-01', end: '2024-12-31' },
          filters: { priority: 'normal', notify: false }
        }
      },
      {
        name: 'Performance Équipements',
        payload: {
          analysis_type: 'performance_equipements',
          user_id: 'test-user-123',
          business_unit: 'loueur',
          filters: { types: 'excavatrice', priority: 'high' }
        }
      }
    ];

    for (const test of analysisTests) {
      console.log(`   🔍 ${test.name}...`);
      
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${baseURL}analyse_predictive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });
      
      const duration = Date.now() - startTime;
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        console.log(`   ✅ ${test.name}: OK (${duration}ms)`);
        console.log(`      Analyse ID: ${result.analysis_id}`);
        console.log(`      Score santé: ${result.executive_summary?.overall_health_score || 'N/A'}%`);
        console.log(`      Actions immédiates: ${result.actions?.immediate_count || 0}`);
        console.log(`      Confiance: ${result.metadata?.performance_metrics?.prediction_confidence || 'N/A'}`);
        results.analysis = true;
      } else {
        throw new Error(`Analyse échouée: ${JSON.stringify(result)}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Analyse Prédictive: ERREUR - ${error.message}`);
    results.errors.push(`Analyse Prédictive: ${error.message}`);
  }
  
  console.log('');

  // Test 3: Auto-Specs Enrichi
  console.log('3️⃣ Test Auto-Specs Enrichi...');
  console.log('   URL:', `${baseURL}auto_specs`);
  
  try {
    const specsTests = [
      {
        name: 'Caterpillar 320D',
        payload: {
          brand: 'caterpillar',
          model: '320d',
          schema: 'minegrid.auto_specs.v1',
          includeMissing: true,
          context: {
            source: 'test_integration',
            timestamp: new Date().toISOString()
          }
        }
      },
      {
        name: 'Komatsu PC200',
        payload: {
          brand: 'komatsu',
          model: 'pc200',
          schema: 'minegrid.auto_specs.v1',
          includeMissing: true
        }
      }
    ];

    for (const test of specsTests) {
      console.log(`   🔍 ${test.name}...`);
      
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${baseURL}auto_specs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });
      
      const duration = Date.now() - startTime;
      const result = await response.json();
      
      if (response.ok && result.specs) {
        console.log(`   ✅ ${test.name}: OK (${duration}ms)`);
        console.log(`      Marque: ${result.specs.brand || 'N/A'}`);
        console.log(`      Modèle: ${result.specs.model || 'N/A'}`);
        console.log(`      Poids: ${result.specs.weight_kg || 'N/A'} kg`);
        console.log(`      Puissance: ${result.specs.engine?.power_kw || result.specs.engine?.power_hp || 'N/A'}`);
        console.log(`      Champs manquants: ${result.missing?.length || 0}`);
        results.autoSpecs = true;
      } else {
        throw new Error(`Specs non trouvées: ${JSON.stringify(result)}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Auto-Specs: ERREUR - ${error.message}`);
    results.errors.push(`Auto-Specs: ${error.message}`);
  }

  console.log('');

  // Test 4: Performance et Latence
  console.log('4️⃣ Test Performance et Latence...');
  
  try {
    const performanceTests = [];
    const testCount = 3;
    
    for (let i = 0; i < testCount; i++) {
      const startTime = Date.now();
      
      const response = await fetchWithTimeout(`${baseURL}assistant_virtuel_enrichi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Test performance ${i + 1}`,
          user_id: 'perf-test',
          session_id: `perf-session-${i}`
        })
      });
      
      const duration = Date.now() - startTime;
      performanceTests.push(duration);
      
      if (response.ok) {
        console.log(`   ✅ Test ${i + 1}: ${duration}ms`);
      } else {
        console.log(`   ⚠️ Test ${i + 1}: ${duration}ms (erreur)`);
      }
    }
    
    const avgLatency = performanceTests.reduce((sum, time) => sum + time, 0) / performanceTests.length;
    const maxLatency = Math.max(...performanceTests);
    
    console.log(`   📊 Latence moyenne: ${Math.round(avgLatency)}ms`);
    console.log(`   📊 Latence maximum: ${maxLatency}ms`);
    
    if (avgLatency < 3000) {
      console.log('   ✅ Performance: EXCELLENTE (<3s)');
    } else if (avgLatency < 5000) {
      console.log('   ⚠️ Performance: ACCEPTABLE (3-5s)');
    } else {
      console.log('   ❌ Performance: LENTE (>5s)');
    }
  } catch (error) {
    console.log(`   ❌ Test Performance: ERREUR - ${error.message}`);
  }

  console.log('');

  // Test 5: Connectivité N8N
  console.log('5️⃣ Test Connectivité N8N...');
  
  try {
    // Test simple de connectivité
    const response = await fetchWithTimeout('https://n8n.srv786179.hstgr.cloud/', {
      method: 'GET'
    }, 5000);
    
    if (response.ok || response.status === 404) {
      console.log('   ✅ Serveur N8N: ACCESSIBLE');
    } else {
      console.log(`   ⚠️ Serveur N8N: Status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Serveur N8N: INACCESSIBLE - ${error.message}`);
    results.errors.push(`Connectivité N8N: ${error.message}`);
  }

  console.log('');

  // Résumé final
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(50));
  
  const passedTests = [results.assistant, results.analysis, results.autoSpecs].filter(Boolean).length;
  const totalTests = 3;
  
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Erreurs: ${results.errors.length}`);
  
  if (results.assistant) console.log('✅ Assistant Virtuel: OPÉRATIONNEL');
  else console.log('❌ Assistant Virtuel: DÉFAILLANT');
  
  if (results.analysis) console.log('✅ Analyse Prédictive: OPÉRATIONNELLE');
  else console.log('❌ Analyse Prédictive: DÉFAILLANTE');
  
  if (results.autoSpecs) console.log('✅ Auto-Specs: OPÉRATIONNEL');
  else console.log('❌ Auto-Specs: DÉFAILLANT');
  
  if (results.errors.length > 0) {
    console.log('\n🔍 DÉTAILS DES ERREURS:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n🔗 URLS DE CONFIGURATION:');
  console.log(`   • N8N Admin: https://n8n.srv786179.hstgr.cloud`);
  console.log(`   • Assistant IA: ${baseURL}assistant_virtuel_enrichi`);
  console.log(`   • Analyse: ${baseURL}analyse_predictive`);
  console.log(`   • Auto-Specs: ${baseURL}auto_specs`);
  
  console.log('\n📋 ACTIONS RECOMMANDÉES:');
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont réussis ! Vous pouvez procéder à l\'intégration.');
    console.log('   1. Ajouter le service IA au frontend');
    console.log('   2. Modifier les composants existants');
    console.log('   3. Tester en environnement de développement');
    console.log('   4. Déployer en production');
  } else {
    console.log('⚠️ Certains tests ont échoué. Actions requises:');
    
    if (!results.assistant) {
      console.log('   1. Vérifier le workflow Assistant Virtuel dans N8N');
      console.log('   2. S\'assurer que le webhook est actif');
    }
    
    if (!results.analysis) {
      console.log('   1. Importer le workflow Analyse Prédictive');
      console.log('   2. Vérifier la configuration des données');
    }
    
    if (!results.autoSpecs) {
      console.log('   1. Vérifier le workflow Auto-Specs existant');
      console.log('   2. Valider la structure des données');
    }
    
    console.log('   • Consulter les logs N8N pour plus de détails');
    console.log('   • Réexécuter ce test après corrections');
  }
  
  console.log('\n✅ Test d\'intégration terminé !\n');
  
  // Retourner les résultats pour usage programmatique
  return {
    success: passedTests === totalTests,
    results,
    summary: {
      passed: passedTests,
      total: totalTests,
      errors: results.errors.length
    }
  };
};

// Fonction pour test rapide d'un endpoint spécifique
const testSingleEndpoint = async (endpoint, payload) => {
  const baseURL = 'https://n8n.srv786179.hstgr.cloud/webhook/';
  
  try {
    console.log(`🧪 Test ${endpoint}...`);
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test réussi:', result);
      return { success: true, data: result };
    } else {
      console.log('❌ Test échoué:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return { success: false, error: error.message };
  }
};

// Gestion des arguments de ligne de commande
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Test d'un endpoint spécifique
    const endpoint = args[0];
    
    let payload = {};
    if (args[1]) {
      try {
        payload = JSON.parse(args[1]);
      } catch {
        console.log('⚠️ Payload JSON invalide, utilisation payload par défaut');
      }
    }
    
    // Payloads par défaut selon l'endpoint
    if (endpoint === 'assistant_virtuel_enrichi' && Object.keys(payload).length === 0) {
      payload = {
        message: 'Test rapide',
        user_id: 'test-user',
        session_id: 'test-session'
      };
    } else if (endpoint === 'analyse_predictive' && Object.keys(payload).length === 0) {
      payload = {
        analysis_type: 'pipeline_commercial',
        user_id: 'test-user'
      };
    } else if (endpoint === 'auto_specs' && Object.keys(payload).length === 0) {
      payload = {
        brand: 'caterpillar',
        model: '320d'
      };
    }
    
    testSingleEndpoint(endpoint, payload);
  } else {
    // Test complet
    testAIIntegration()
      .then((results) => {
        process.exit(results.success ? 0 : 1);
      })
      .catch((error) => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
      });
  }
}

module.exports = { testAIIntegration, testSingleEndpoint }; 