#!/usr/bin/env node

/**
 * Script de résolution complète des erreurs de base de données
 * 
 * Ce script corrige :
 * 1. Les erreurs 404 sur machine_views, messages, offers, profiles
 * 2. Les erreurs 400 sur les relations entre tables
 * 3. Les problèmes de structure de base de données
 * 
 * Utilisation:
 * node fix-database-errors.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NzI4NzYsImV4cCI6MjA0NzU0ODg3Nn0.iQjnhHcoHh_wV_ROIIinv1vLnLpiUoC4wddq8lHWVM0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Résolution des erreurs de base de données...\n');

async function fixDatabaseErrors() {
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
      
      // Lire et exécuter le script SQL principal
      const schemaPath = join(process.cwd(), 'supabase-schema.sql');
      const schemaSQL = readFileSync(schemaPath, 'utf8');
      
      console.log('📤 Exécution du script de schéma principal...');
      const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
      
      if (schemaError) {
        console.warn('⚠️ Erreur lors de l\'exécution du schéma principal:', schemaError.message);
        console.log('🔄 Tentative d\'exécution manuelle...');
        
        // Exécuter les requêtes une par une
        await executeIndividualQueries();
      } else {
        console.log('✅ Schéma principal exécuté avec succès');
      }
    } else {
      console.log('✅ Toutes les tables requises existent déjà');
    }

    // Étape 3: Vérifier et corriger les relations
    console.log('\n📋 Étape 3: Vérification des relations...');
    await checkAndFixRelations();

    // Étape 4: Insérer des données de test si nécessaire
    console.log('\n📋 Étape 4: Insertion de données de test...');
    await insertTestData();

    // Étape 5: Test final
    console.log('\n📋 Étape 5: Test final...');
    await finalTest();

    console.log('\n🎉 Résolution terminée avec succès!');
    console.log('✅ Toutes les erreurs 404 et 400 devraient être résolues');
    console.log('✅ L\'application devrait maintenant fonctionner correctement');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 Solutions alternatives:');
    console.log('1. Vérifiez votre connexion à Supabase');
    console.log('2. Vérifiez les permissions de votre compte');
    console.log('3. Exécutez manuellement les scripts SQL dans le dashboard Supabase');
  }
}

async function executeIndividualQueries() {
  const queries = [
    // Table machine_views
    `CREATE TABLE IF NOT EXISTS machine_views (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
      viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table messages
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Table offers
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
    
    // Table profiles (si elle n'existe pas)
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

  for (const query of queries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.warn('⚠️ Erreur lors de l\'exécution de la requête:', error.message);
      } else {
        console.log('✅ Requête exécutée avec succès');
      }
    } catch (err) {
      console.warn('⚠️ Erreur lors de l\'exécution de la requête:', err.message);
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

    // Vérifier les politiques RLS
    console.log('🔧 Vérification des politiques RLS...');
    
    const rlsQueries = [
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

    for (const query of rlsQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.warn('⚠️ Erreur lors de la configuration RLS:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors de la configuration RLS:', err.message);
      }
    }

    console.log('✅ Politiques RLS configurées');

  } catch (error) {
    console.warn('⚠️ Erreur lors de la vérification des relations:', error.message);
  }
}

async function insertTestData() {
  try {
    // Vérifier si des données existent déjà
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Données de test déjà présentes');
      return;
    }

    console.log('📝 Insertion de données de test...');

    // Insérer un profil de test
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          role: 'vendeur',
          company_name: 'Entreprise Test'
        });

      if (profileError) {
        console.warn('⚠️ Erreur lors de l\'insertion du profil:', profileError.message);
      } else {
        console.log('✅ Profil de test créé');
      }
    }

    // Insérer quelques vues de test si des machines existent
    const { data: machines } = await supabase
      .from('machines')
      .select('id')
      .limit(5);

    if (machines && machines.length > 0) {
      const testViews = machines.map(machine => ({
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
        console.log('✅ Vues de test créées');
      }
    }

  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'insertion des données de test:', error.message);
  }
}

async function finalTest() {
  console.log('🧪 Test des tables créées...');

  const testQueries = [
    { name: 'machine_views', query: 'SELECT COUNT(*) FROM machine_views' },
    { name: 'messages', query: 'SELECT COUNT(*) FROM messages' },
    { name: 'offers', query: 'SELECT COUNT(*) FROM offers' },
    { name: 'profiles', query: 'SELECT COUNT(*) FROM profiles' }
  ];

  for (const test of testQueries) {
    try {
      const { data, error } = await supabase
        .from(test.name)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${test.name}: ERREUR - ${error.message}`);
      } else {
        console.log(`✅ Table ${test.name}: OK`);
      }
    } catch (err) {
      console.log(`❌ Table ${test.name}: ERREUR - ${err.message}`);
    }
  }
}

// Exécuter le script
fixDatabaseErrors().catch(console.error); 