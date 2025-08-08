// Script pour créer la table technical_documents
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseServiceKey || supabaseServiceKey === 'your-service-role-key') {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configuré');
  console.log('📝 Instructions:');
  console.log('1. Allez dans votre projet Supabase');
  console.log('2. Settings > API');
  console.log('3. Copiez la "service_role" key');
  console.log('4. Définissez la variable d\'environnement:');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTechnicalDocumentsTable() {
  try {
    console.log('🔧 Création de la table technical_documents...');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create-technical-documents-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Erreur lors de la création de la table:', error);
      return;
    }
    
    console.log('✅ Table technical_documents créée avec succès !');
    console.log('📋 Fonctionnalités ajoutées:');
    console.log('   - Table technical_documents avec toutes les colonnes nécessaires');
    console.log('   - Index pour les performances');
    console.log('   - RLS (Row Level Security) activé');
    console.log('   - Politiques de sécurité pour les utilisateurs');
    console.log('   - Trigger pour updated_at automatique');
    console.log('   - Documents de test insérés');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Alternative si exec_sql n'existe pas
async function createTableManually() {
  try {
    console.log('🔧 Création manuelle de la table technical_documents...');
    
    // Créer la table
    const { error: createError } = await supabase
      .from('technical_documents')
      .select('id')
      .limit(1);
    
    if (createError && createError.code === '42P01') {
      // Table n'existe pas, on va la créer avec une requête SQL directe
      console.log('📝 Table inexistante, création en cours...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS technical_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          document_type TEXT NOT NULL DEFAULT 'manual',
          file_path TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );
      `;
      
      // Note: Cette approche nécessite des permissions admin
      console.log('⚠️  Note: Cette opération nécessite des permissions admin sur Supabase');
      console.log('📝 Veuillez exécuter manuellement le script SQL dans l\'éditeur SQL de Supabase');
      console.log('📄 Fichier: create-technical-documents-table.sql');
      
    } else {
      console.log('✅ Table technical_documents existe déjà !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
if (process.argv.includes('--manual')) {
  createTableManually();
} else {
  createTechnicalDocumentsTable();
} 