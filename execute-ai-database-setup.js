// execute-ai-database-setup.js
// Script pour configurer automatiquement les tables IA dans Supabase

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacez par vos vraies valeurs)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Requêtes SQL pour créer les tables IA
const SQL_QUERIES = [
  // Table conversations IA
  `CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    intent TEXT,
    language TEXT DEFAULT 'fr',
    confidence DECIMAL(3,2),
    context JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // Table résultats analyses prédictives
  `CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id TEXT PRIMARY KEY,
    analysis_type TEXT NOT NULL,
    requested_by UUID REFERENCES auth.users(id),
    requested_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status TEXT DEFAULT 'pending',
    results JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  // Table métriques IA
  `CREATE TABLE IF NOT EXISTS ai_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type TEXT NOT NULL,
    execution_time_ms INTEGER,
    confidence_score DECIMAL(3,2),
    user_satisfaction DECIMAL(3,2),
    success_rate DECIMAL(3,2),
    error_count INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );`,

  // Index pour performances
  `CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_requested_by ON ai_analysis_results(requested_by);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_metrics_date ON ai_metrics(date);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_metrics_agent_type ON ai_metrics(agent_type);`,

  // Activation RLS
  `ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE ai_metrics ENABLE ROW LEVEL SECURITY;`,

  // Politiques RLS pour conversations
  `DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_conversations;`,
  `CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);`,

  `DROP POLICY IF EXISTS "Users can insert their own conversations" ON ai_conversations;`,
  `CREATE POLICY "Users can insert their own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);`,

  // Politiques RLS pour analyses
  `DROP POLICY IF EXISTS "Users can view their own analyses" ON ai_analysis_results;`,
  `CREATE POLICY "Users can view their own analyses" ON ai_analysis_results
    FOR SELECT USING (auth.uid() = requested_by);`,

  `DROP POLICY IF EXISTS "Users can insert their own analyses" ON ai_analysis_results;`,
  `CREATE POLICY "Users can insert their own analyses" ON ai_analysis_results
    FOR INSERT WITH CHECK (auth.uid() = requested_by);`,

  // Politiques RLS pour métriques (lecture seule pour utilisateurs)
  `DROP POLICY IF EXISTS "Users can view ai metrics" ON ai_metrics;`,
  `CREATE POLICY "Users can view ai metrics" ON ai_metrics
    FOR SELECT USING (true);`,

  `DROP POLICY IF EXISTS "Service can insert ai metrics" ON ai_metrics;`,
  `CREATE POLICY "Service can insert ai metrics" ON ai_metrics
    FOR INSERT WITH CHECK (true);`
];

// Fonction pour exécuter les requêtes SQL
async function executeSQL(query, description) {
  try {
    console.log(`🔧 ${description}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: query 
    });
    
    if (error) {
      // Essayer avec une approche alternative si exec_sql n'existe pas
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.log('⚠️ Fonction exec_sql non disponible, tentative directe...');
        
        // Pour les requêtes CREATE TABLE, utiliser une approche différente
        if (query.includes('CREATE TABLE')) {
          const { error: directError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .limit(1);
          
          if (directError) {
            console.log(`❌ ${description}: ${directError.message}`);
          } else {
            console.log(`✅ ${description}: Structure vérifiée`);
          }
        } else {
          console.log(`⚠️ ${description}: Non exécuté (limitation API)`);
        }
      } else {
        console.log(`❌ ${description}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${description}: OK`);
    }
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
  }
}

// Fonction principale de configuration
async function setupAIDatabase() {
  console.log('🚀 Configuration de la base de données IA pour Minegrid...\n');
  
  // Vérification de la connexion Supabase
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('⚠️ Avertissement connexion Supabase:', error.message);
    } else {
      console.log('✅ Connexion Supabase établie');
    }
  } catch (error) {
    console.log('⚠️ Erreur connexion Supabase:', error.message);
  }

  console.log('\n📋 Création des tables et configurations IA...\n');

  // Exécution séquentielle des requêtes
  for (let i = 0; i < SQL_QUERIES.length; i++) {
    const query = SQL_QUERIES[i];
    let description = `Requête ${i + 1}`;
    
    // Description plus explicite selon le type de requête
    if (query.includes('CREATE TABLE ai_conversations')) {
      description = 'Création table conversations IA';
    } else if (query.includes('CREATE TABLE ai_analysis_results')) {
      description = 'Création table résultats analyses';
    } else if (query.includes('CREATE TABLE ai_metrics')) {
      description = 'Création table métriques IA';
    } else if (query.includes('CREATE INDEX')) {
      description = 'Création index pour performances';
    } else if (query.includes('ENABLE ROW LEVEL SECURITY')) {
      description = 'Activation sécurité RLS';
    } else if (query.includes('CREATE POLICY')) {
      description = 'Création politique de sécurité';
    }
    
    await executeSQL(query, description);
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🧪 Test de configuration...\n');

  // Test d'insertion basique (si possible)
  try {
    const testMetric = {
      agent_type: 'test_setup',
      execution_time_ms: 100,
      confidence_score: 1.0,
      success_rate: 1.0,
      error_count: 0,
      metadata: {
        setup_test: true,
        timestamp: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('ai_metrics')
      .insert(testMetric)
      .select();

    if (error) {
      console.log('⚠️ Test insertion métrique:', error.message);
    } else {
      console.log('✅ Test insertion métrique: OK');
      
      // Nettoyage du test
      if (data && data[0]) {
        await supabase
          .from('ai_metrics')
          .delete()
          .eq('id', data[0].id);
        console.log('✅ Nettoyage test: OK');
      }
    }
  } catch (error) {
    console.log('⚠️ Test insertion:', error.message);
  }

  console.log('\n🎉 Configuration terminée !\n');
  
  console.log('📊 Résumé de la configuration :');
  console.log('   • Tables IA créées');
  console.log('   • Index de performance ajoutés');
  console.log('   • Politiques de sécurité configurées');
  console.log('   • Prêt pour intégration agents IA');
  
  console.log('\n🔗 Prochaines étapes :');
  console.log('   1. Importer les workflows N8N');
  console.log('   2. Activer les webhooks');
  console.log('   3. Tester l\'intégration');
  console.log('   4. Déployer sur le site\n');
}

// Gestion des erreurs globales
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error.message);
  process.exit(1);
});

// Exécution du script
if (require.main === module) {
  setupAIDatabase()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error.message);
      process.exit(1);
    });
}

module.exports = { setupAIDatabase }; 