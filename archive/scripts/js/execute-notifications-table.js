import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL
const supabaseServiceKey = 'your-service-role-key'; // Remplacez par votre clé

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNotificationsTable() {
  try {
    console.log('🔧 Création de la table notifications...');
    
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('create-notifications-table.sql', 'utf8');
    
    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Erreur lors de la création de la table:', error);
      return;
    }
    
    console.log('✅ Table notifications créée avec succès !');
    console.log('📋 Fonctionnalités disponibles :');
    console.log('   - Notifications internes pour les utilisateurs');
    console.log('   - Notifications en temps réel');
    console.log('   - Marquage comme lu/non lu');
    console.log('   - Types de notifications (message_reply, warning, error, etc.)');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Alternative : exécuter directement les requêtes SQL
async function createNotificationsTableDirect() {
  try {
    console.log('🔧 Création de la table notifications (méthode directe)...');
    
    // Créer la table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_email TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'info',
          data JSONB DEFAULT '{}',
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Erreur création table:', createError);
      return;
    }
    
    // Créer les index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      `
    });
    
    if (indexError) {
      console.error('❌ Erreur création index:', indexError);
      return;
    }
    
    // Activer RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;`
    });
    
    if (rlsError) {
      console.error('❌ Erreur activation RLS:', rlsError);
      return;
    }
    
    // Créer les politiques
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view their own notifications" ON notifications
          FOR SELECT USING (user_email = current_user);
          
        CREATE POLICY "Users can update their own notifications" ON notifications
          FOR UPDATE USING (user_email = current_user);
          
        CREATE POLICY "Allow insert notifications" ON notifications
          FOR INSERT WITH CHECK (true);
      `
    });
    
    if (policyError) {
      console.error('❌ Erreur création politiques:', policyError);
      return;
    }
    
    console.log('✅ Table notifications créée avec succès !');
    console.log('📋 Prêt pour les notifications internes !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter
createNotificationsTableDirect(); 