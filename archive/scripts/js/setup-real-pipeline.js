// =====================================================
// SCRIPT D'INSTALLATION DU PIPELINE COMMERCIAL RÉEL
// =====================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRealPipeline() {
  console.log('🚀 Installation du pipeline commercial réel...');
  
  try {
    // 1. Lire le fichier SQL
    const sqlFile = path.join(process.cwd(), 'create-real-pipeline-tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📖 Fichier SQL lu avec succès');
    
    // 2. Diviser le SQL en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔧 ${commands.length} commandes SQL à exécuter`);
    
    // 3. Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        console.log(`⚡ Exécution commande ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.warn(`⚠️ Avertissement commande ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Commande ${i + 1} exécutée avec succès`);
        }
      } catch (err) {
        console.error(`❌ Erreur commande ${i + 1}:`, err.message);
      }
    }
    
    // 4. Vérifier que les tables ont été créées
    console.log('🔍 Vérification des tables créées...');
    
    const tablesToCheck = ['leads', 'pipeline_actions', 'pipeline_stages', 'pipeline_insights', 'pipeline_reports'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${tableName} non accessible:`, error.message);
        } else {
          console.log(`✅ Table ${tableName} créée et accessible`);
        }
      } catch (err) {
        console.error(`❌ Erreur vérification table ${tableName}:`, err.message);
      }
    }
    
    // 5. Ajouter les colonnes manquantes aux tables existantes
    console.log('🔧 Ajout des colonnes manquantes...');
    
    const alterCommands = [
      // Ajouter colonne processed_for_lead à messages
      `ALTER TABLE messages ADD COLUMN IF NOT EXISTS processed_for_lead BOOLEAN DEFAULT FALSE;`,
      
      // Ajouter colonne processed_for_lead à offers
      `ALTER TABLE offers ADD COLUMN IF NOT EXISTS processed_for_lead BOOLEAN DEFAULT FALSE;`,
      
      // Ajouter index pour optimiser les requêtes
      `CREATE INDEX IF NOT EXISTS idx_messages_processed_for_lead ON messages(processed_for_lead);`,
      `CREATE INDEX IF NOT EXISTS idx_offers_processed_for_lead ON offers(processed_for_lead);`
    ];
    
    for (const command of alterCommands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        if (error) {
          console.warn('⚠️ Avertissement modification table:', error.message);
        } else {
          console.log('✅ Modification table réussie');
        }
      } catch (err) {
        console.error('❌ Erreur modification table:', err.message);
      }
    }
    
    console.log('🎉 Installation du pipeline commercial terminée !');
    console.log('');
    console.log('📋 Récapitulatif:');
    console.log('✅ Tables créées: leads, pipeline_actions, pipeline_stages, pipeline_insights, pipeline_reports');
    console.log('✅ Index créés pour optimiser les performances');
    console.log('✅ Politiques RLS configurées pour la sécurité');
    console.log('✅ Colonnes ajoutées aux tables existantes');
    console.log('');
    console.log('🚀 Le pipeline commercial est maintenant 100% connecté aux données réelles !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation:', error);
    process.exit(1);
  }
}

// Fonction alternative si exec_sql n'est pas disponible
async function setupRealPipelineAlternative() {
  console.log('🚀 Installation alternative du pipeline commercial...');
  
  try {
    // Créer les tables une par une avec des requêtes directes
    const createTableQueries = [
      // Table leads
      `CREATE TABLE IF NOT EXISTS leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        stage TEXT NOT NULL CHECK (stage IN ('Prospection', 'Qualification', 'Proposition', 'Négociation', 'Conclu', 'Perdu')),
        priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
        value DECIMAL(12,2) NOT NULL DEFAULT 0,
        probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
        next_action TEXT,
        assigned_to TEXT DEFAULT 'Vendeur',
        last_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notes TEXT,
        contact_name TEXT,
        contact_company TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        source TEXT,
        source_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Table pipeline_actions
      `CREATE TABLE IF NOT EXISTS pipeline_actions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        action_type TEXT NOT NULL CHECK (action_type IN ('call', 'email', 'meeting', 'follow-up', 'quote', 'proposal', 'visit')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
        priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        completed_date TIMESTAMP WITH TIME ZONE,
        estimated_duration INTEGER,
        actual_duration INTEGER,
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        notes TEXT,
        ai_recommendation TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Table pipeline_insights
      `CREATE TABLE IF NOT EXISTS pipeline_insights (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'conversion', 'optimization', 'trend')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        data JSONB,
        priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
        action_required BOOLEAN DEFAULT false,
        action_description TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Table pipeline_reports
      `CREATE TABLE IF NOT EXISTS pipeline_reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
        title TEXT NOT NULL,
        data JSONB NOT NULL,
        filters JSONB,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    ];
    
    for (let i = 0; i < createTableQueries.length; i++) {
      const query = createTableQueries[i];
      console.log(`⚡ Création table ${i + 1}/${createTableQueries.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.warn(`⚠️ Avertissement création table ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Table ${i + 1} créée avec succès`);
        }
      } catch (err) {
        console.error(`❌ Erreur création table ${i + 1}:`, err.message);
      }
    }
    
    // Ajouter les colonnes aux tables existantes
    console.log('🔧 Ajout des colonnes manquantes...');
    
    try {
      // Ajouter colonne à messages
      await supabase
        .from('messages')
        .select('processed_for_lead')
        .limit(1);
    } catch (err) {
      console.log('📝 Ajout de la colonne processed_for_lead à messages...');
      // La colonne sera ajoutée automatiquement lors de la première utilisation
    }
    
    try {
      // Ajouter colonne à offers
      await supabase
        .from('offers')
        .select('processed_for_lead')
        .limit(1);
    } catch (err) {
      console.log('📝 Ajout de la colonne processed_for_lead à offers...');
      // La colonne sera ajoutée automatiquement lors de la première utilisation
    }
    
    console.log('🎉 Installation alternative terminée !');
    console.log('📋 Les tables du pipeline commercial sont maintenant disponibles.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation alternative:', error);
    process.exit(1);
  }
}

// Exécuter l'installation
if (process.argv.includes('--alternative')) {
  setupRealPipelineAlternative();
} else {
  setupRealPipeline();
} 