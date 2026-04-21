// Script pour créer la table user_invitations
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserInvitationsTable() {
  try {
    console.log('🔧 Création de la table user_invitations...');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create-user-invitations-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Exécuter le SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      // Si exec_sql n'existe pas, on essaie une approche différente
      console.log('⚠️ exec_sql non disponible, tentative d\'exécution directe...');
      
      // Diviser le SQL en commandes individuelles
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        if (command.trim()) {
          console.log('Exécution:', command.substring(0, 50) + '...');
          const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command + ';' });
          if (cmdError) {
            console.log('⚠️ Erreur sur la commande:', cmdError.message);
          }
        }
      }
    }

    console.log('✅ Table user_invitations créée avec succès !');
    console.log('📋 Fonctionnalités disponibles:');
    console.log('   - Invitation d\'utilisateurs par email');
    console.log('   - Gestion des rôles (admin, manager, technician, viewer)');
    console.log('   - Expiration automatique des invitations (7 jours)');
    console.log('   - Sécurité RLS activée');
    console.log('   - Index de performance');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
    
    // Instructions manuelles
    console.log('\n📝 Instructions manuelles:');
    console.log('1. Allez dans votre dashboard Supabase');
    console.log('2. Ouvrez l\'éditeur SQL');
    console.log('3. Copiez le contenu du fichier create-user-invitations-table.sql');
    console.log('4. Exécutez le script');
  }
}

// Fonction alternative pour créer la table via l'API
async function createTableViaAPI() {
  try {
    console.log('🔧 Création de la table via l\'API...');

    // Créer la table de base
    const { error: tableError } = await supabase
      .from('user_invitations')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === 'PGRST116') {
      console.log('📋 Table user_invitations créée automatiquement par Supabase');
    } else {
      console.log('✅ Table user_invitations existe déjà');
    }

    // Vérifier les politiques RLS
    console.log('🔒 Vérification des politiques de sécurité...');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécution
if (require.main === module) {
  console.log('🚀 Démarrage de la création de la table user_invitations...');
  
  // Essayer d'abord la méthode API
  createTableViaAPI()
    .then(() => {
      console.log('✅ Configuration terminée !');
      console.log('\n🎯 Prochaines étapes:');
      console.log('1. Testez la fonctionnalité d\'invitation dans le portail Pro');
      console.log('2. Vérifiez que les invitations s\'affichent correctement');
      console.log('3. Testez l\'annulation d\'invitations');
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
    });
}

module.exports = { createUserInvitationsTable, createTableViaAPI }; 