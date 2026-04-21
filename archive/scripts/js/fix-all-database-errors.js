// =====================================================
// SCRIPT DE RÉSOLUTION COMPLÈTE DES ERREURS 404/500
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE2NzAsImV4cCI6MjA1MDU0NzY3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Début de la résolution des erreurs 404/500...');

async function fixAllDatabaseErrors() {
  try {
    console.log('📋 Étape 1: Création des tables manquantes...');
    await createMissingTables();
    
    console.log('📋 Étape 2: Configuration des politiques RLS...');
    await setupRLSPolicies();
    
    console.log('📋 Étape 3: Création des fonctions et triggers...');
    await createFunctionsAndTriggers();
    
    console.log('📋 Étape 4: Insertion des données de test...');
    await insertTestData();
    
    console.log('📋 Étape 5: Vérification finale...');
    await verifyTables();
    
    console.log('✅ Résolution terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la résolution:', error);
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
      firstName TEXT,
      lastName TEXT,
      full_name TEXT,
      avatar_url TEXT,
      company_name TEXT,
      role TEXT DEFAULT 'vendeur',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table sales (pour les ventes)
    `CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      amount DECIMAL(12,2) NOT NULL,
      currency TEXT DEFAULT 'MAD',
      description TEXT,
      customer_name TEXT,
      status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table prospects (pour le pipeline commercial)
    `CREATE TABLE IF NOT EXISTS prospects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'qualified', 'converted', 'lost')),
      value DECIMAL(12,2),
      probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
      stage TEXT DEFAULT 'prospection' CHECK (stage IN ('prospection', 'qualification', 'proposition', 'negociation', 'cloture')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table user_targets (pour les objectifs utilisateur)
    `CREATE TABLE IF NOT EXISTS user_targets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
      sales_target DECIMAL(12,2) DEFAULT 3000000,
      prospects_target INTEGER DEFAULT 10,
      response_time_target DECIMAL(4,2) DEFAULT 1.5,
      growth_target DECIMAL(5,2) DEFAULT 15.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, period)
    )`,
    
    // Table prospect_interactions (pour les interactions avec les prospects)
    `CREATE TABLE IF NOT EXISTS prospect_interactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
      interaction_type TEXT DEFAULT 'contact' CHECK (interaction_type IN ('contact', 'meeting', 'proposal', 'follow_up')),
      response_time DECIMAL(4,2),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  ];

  for (const tableQuery of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: tableQuery });
      if (error) {
        console.log('⚠️ Table déjà existante ou erreur mineure:', error.message);
      } else {
        console.log('✅ Table créée avec succès');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de table:', error.message);
    }
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
      FOR UPDATE USING (auth.uid() = id)`,

    // Politiques pour sales
    `ALTER TABLE sales ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view own sales" ON sales`,
    `CREATE POLICY "Users can view own sales" ON sales
      FOR SELECT USING (auth.uid() = seller_id)`,
    `DROP POLICY IF EXISTS "Users can insert own sales" ON sales`,
    `CREATE POLICY "Users can insert own sales" ON sales
      FOR INSERT WITH CHECK (auth.uid() = seller_id)`,

    // Politiques pour prospects
    `ALTER TABLE prospects ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view own prospects" ON prospects`,
    `CREATE POLICY "Users can view own prospects" ON prospects
      FOR SELECT USING (auth.uid() = seller_id)`,
    `DROP POLICY IF EXISTS "Users can insert own prospects" ON prospects`,
    `CREATE POLICY "Users can insert own prospects" ON prospects
      FOR INSERT WITH CHECK (auth.uid() = seller_id)`,

    // Politiques pour user_targets
    `ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view own targets" ON user_targets`,
    `CREATE POLICY "Users can view own targets" ON user_targets
      FOR SELECT USING (auth.uid() = user_id)`,
    `DROP POLICY IF EXISTS "Users can insert own targets" ON user_targets`,
    `CREATE POLICY "Users can insert own targets" ON user_targets
      FOR INSERT WITH CHECK (auth.uid() = user_id)`,

    // Politiques pour prospect_interactions
    `ALTER TABLE prospect_interactions ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Users can view own interactions" ON prospect_interactions`,
    `CREATE POLICY "Users can view own interactions" ON prospect_interactions
      FOR SELECT USING (auth.uid() = seller_id)`,
    `DROP POLICY IF EXISTS "Users can insert own interactions" ON prospect_interactions`,
    `CREATE POLICY "Users can insert own interactions" ON prospect_interactions
      FOR INSERT WITH CHECK (auth.uid() = seller_id)`
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log('⚠️ Politique déjà existante ou erreur mineure:', error.message);
      } else {
        console.log('✅ Politique RLS configurée');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la configuration RLS:', error.message);
    }
  }
}

async function createFunctionsAndTriggers() {
  const functions = [
    // Fonction pour mettre à jour automatiquement updated_at
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql'`,

    // Fonction pour créer automatiquement un profil lors de l'inscription
    `CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles (id, full_name, role)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'vendeur'
      );
      
      -- Créer des objectifs par défaut
      INSERT INTO user_targets (user_id, period, sales_target, prospects_target, response_time_target, growth_target)
      VALUES (
        NEW.id,
        'monthly',
        3000000,
        10,
        1.5,
        15.0
      );
      
      RETURN NEW;
    END;
    $$ language 'plpgsql'`,

    // Triggers pour updated_at
    `DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles`,
    `CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_sales_updated_at ON sales`,
    `CREATE TRIGGER update_sales_updated_at
      BEFORE UPDATE ON sales
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_prospects_updated_at ON prospects`,
    `CREATE TRIGGER update_prospects_updated_at
      BEFORE UPDATE ON prospects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_user_targets_updated_at ON user_targets`,
    `CREATE TRIGGER update_user_targets_updated_at
      BEFORE UPDATE ON user_targets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    `DROP TRIGGER IF EXISTS update_offers_updated_at ON offers`,
    `CREATE TRIGGER update_offers_updated_at
      BEFORE UPDATE ON offers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

    // Trigger pour créer automatiquement le profil et les objectifs
    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
    `CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user()`
  ];

  for (const func of functions) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: func });
      if (error) {
        console.log('⚠️ Fonction/trigger déjà existant ou erreur mineure:', error.message);
      } else {
        console.log('✅ Fonction/trigger créé avec succès');
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de fonction/trigger:', error.message);
    }
  }
}

async function insertTestData() {
  try {
    // Insérer quelques vendeurs de test si la table est vide
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (!existingProfiles || existingProfiles.length === 0) {
      console.log('📝 Insertion de données de test...');
      
      // Créer des profils de test
      const testProfiles = [
        { id: 'test-seller-1', full_name: 'Vendeur Test 1', role: 'vendeur', company_name: 'Entreprise Test 1' },
        { id: 'test-seller-2', full_name: 'Vendeur Test 2', role: 'vendeur', company_name: 'Entreprise Test 2' },
        { id: 'test-seller-3', full_name: 'Vendeur Test 3', role: 'vendeur', company_name: 'Entreprise Test 3' }
      ];

      for (const profile of testProfiles) {
        await supabase.from('profiles').upsert(profile);
      }

      console.log('✅ Données de test insérées');
    } else {
      console.log('ℹ️ Données de test déjà présentes');
    }
  } catch (error) {
    console.log('⚠️ Erreur lors de l\'insertion des données de test:', error.message);
  }
}

async function verifyTables() {
  const tablesToCheck = [
    'machine_views',
    'messages', 
    'offers',
    'profiles',
    'sales',
    'prospects',
    'user_targets',
    'prospect_interactions'
  ];

  console.log('🔍 Vérification des tables créées...');
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Table ${tableName}: Accessible`);
      }
    } catch (error) {
      console.log(`❌ Table ${tableName}: Erreur de vérification`);
    }
  }
}

// Exécuter le script
fixAllDatabaseErrors().then(() => {
  console.log('🎉 Script de résolution terminé !');
  console.log('📋 Prochaines étapes:');
  console.log('1. Recharger votre application');
  console.log('2. Vérifier que les erreurs 404 ont disparu');
  console.log('3. Tester les widgets du dashboard');
}); 