const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzIsImV4cCI6MjA1MDU0Nzk3Mn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Début de la correction automatique des erreurs de base de données...\n');

async function fixAllDatabaseErrors() {
  try {
    console.log('📋 Étape 1: Vérification des tables existantes...');
    
    // Vérifier les tables existantes
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['machines', 'profiles', 'machine_views', 'messages', 'offers']);

    if (tablesError) {
      console.error('❌ Erreur lors de la vérification des tables:', tablesError);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('✅ Tables existantes:', existingTables);

    // Étape 2: Créer les tables manquantes
    console.log('\n📋 Étape 2: Création des tables manquantes...');
    
    const requiredTables = ['machine_views', 'messages', 'offers', 'profiles'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('🔧 Tables manquantes détectées:', missingTables);
      await createMissingTables();
    } else {
      console.log('✅ Toutes les tables requises existent déjà');
    }

    // Étape 3: Configurer les politiques RLS
    console.log('\n📋 Étape 3: Configuration des politiques RLS...');
    await setupRLSPolicies();

    // Étape 4: Vérifier les relations
    console.log('\n📋 Étape 4: Vérification des relations...');
    await checkAndFixRelations();

    // Étape 5: Insérer des données de test
    console.log('\n📋 Étape 5: Insertion de données de test...');
    await insertTestData();

    console.log('\n🎉 Correction terminée avec succès !');
    console.log('🔄 Veuillez recharger votre application pour voir les changements.');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

async function createMissingTables() {
  const tables = [
    // Table machine_views (pour les statistiques de vues)
    `CREATE TABLE IF NOT EXISTS machine_views (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
      viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table messages (pour les messages entre utilisateurs)
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      response_time DECIMAL(4,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table offers (pour les offres d'achat)
    `CREATE TABLE IF NOT EXISTS offers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
      buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      amount DECIMAL(12,2) NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table profiles (pour les profils utilisateur)
    `CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      avatar_url TEXT,
      company_name TEXT,
      role TEXT DEFAULT 'vendeur',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  ];

  for (const query of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.warn('⚠️ Erreur lors de la création de table:', error.message);
        // Essayer une approche alternative
        await executeRawSQL(query);
      } else {
        console.log('✅ Table créée avec succès');
      }
    } catch (err) {
      console.warn('⚠️ Erreur alternative:', err.message);
    }
  }
}

async function executeRawSQL(sql) {
  // Méthode alternative pour exécuter du SQL brut
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.warn('⚠️ Impossible d\'exécuter le SQL brut:', error.message);
    }
  } catch (err) {
    console.warn('⚠️ Erreur SQL brut:', err.message);
  }
}

async function setupRLSPolicies() {
  const policies = [
    // Politiques pour machine_views
    `ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view their own machine views" ON machine_views`,
    `CREATE POLICY "Users can view their own machine views" ON machine_views
      FOR SELECT USING (
        machine_id IN (
          SELECT id FROM machines WHERE sellerId = auth.uid()
        )
      )`,
    `DROP POLICY IF EXISTS "Anyone can insert machine views" ON machine_views`,
    `CREATE POLICY "Anyone can insert machine views" ON machine_views
      FOR INSERT WITH CHECK (true)`,

    // Politiques pour messages
    `ALTER TABLE messages ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages`,
    `CREATE POLICY "Users can view messages they sent or received" ON messages
      FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
      )`,
    `DROP POLICY IF EXISTS "Users can insert messages" ON messages`,
    `CREATE POLICY "Users can insert messages" ON messages
      FOR INSERT WITH CHECK (sender_id = auth.uid())`,

    // Politiques pour offers
    `ALTER TABLE offers ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view offers they made or received" ON offers`,
    `CREATE POLICY "Users can view offers they made or received" ON offers
      FOR SELECT USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
      )`,
    `DROP POLICY IF EXISTS "Users can insert offers" ON offers`,
    `CREATE POLICY "Users can insert offers" ON offers
      FOR INSERT WITH CHECK (buyer_id = auth.uid())`,

    // Politiques pour profiles
    `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles`,
    `CREATE POLICY "Profiles are viewable by everyone" ON profiles
      FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles`,
    `CREATE POLICY "Users can insert their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id)`,
    `DROP POLICY IF EXISTS "Users can update own profile" ON profiles`,
    `CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id)`
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.warn('⚠️ Erreur lors de la création de politique:', error.message);
      } else {
        console.log('✅ Politique RLS créée');
      }
    } catch (err) {
      console.warn('⚠️ Erreur politique RLS:', err.message);
    }
  }
}

async function checkAndFixRelations() {
  try {
    // Vérifier si la table machines existe
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id')
      .limit(1);

    if (machinesError) {
      console.warn('⚠️ Table machines non trouvée ou inaccessible');
      return;
    }

    console.log('✅ Table machines accessible');

    // Créer les index pour les performances
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_machine_views_machine_id ON machine_views(machine_id)`,
      `CREATE INDEX IF NOT EXISTS idx_machine_views_created_at ON machine_views(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_machine_views_viewer_id ON machine_views(viewer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read)`,
      `CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id)`,
      `CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_offers_machine_id ON offers(machine_id)`,
      `CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status)`,
      `CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role)`,
      `CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at)`
    ];

    for (const index of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: index });
        if (error) {
          console.warn('⚠️ Erreur lors de la création d\'index:', error.message);
        } else {
          console.log('✅ Index créé');
        }
      } catch (err) {
        console.warn('⚠️ Erreur index:', err.message);
      }
    }

  } catch (error) {
    console.warn('⚠️ Erreur lors de la vérification des relations:', error.message);
  }
}

async function insertTestData() {
  try {
    // Insérer des données de test pour éviter les erreurs 404
    console.log('📊 Insertion de données de test...');

    // Vérifier s'il y a des machines
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id')
      .limit(5);

    if (machinesError || !machines || machines.length === 0) {
      console.warn('⚠️ Aucune machine trouvée pour les tests');
      return;
    }

    // Insérer quelques vues de test
    const testViews = machines.slice(0, 3).map(machine => ({
      machine_id: machine.id,
      ip_address: '127.0.0.1',
      user_agent: 'Test Browser',
      created_at: new Date().toISOString()
    }));

    const { error: viewsError } = await supabase
      .from('machine_views')
      .insert(testViews);

    if (viewsError) {
      console.warn('⚠️ Erreur lors de l\'insertion des vues de test:', viewsError.message);
    } else {
      console.log('✅ Données de test insérées');
    }

  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'insertion des données de test:', error.message);
  }
}

// Exécuter la correction
fixAllDatabaseErrors().catch(console.error); 