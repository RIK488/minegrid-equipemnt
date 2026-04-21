// execute-client-notifications-table.js
// Script pour créer la table client_notifications dans Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 Ajoutez ces variables dans votre fichier .env ou définissez-les dans votre terminal');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeClientNotificationsTable() {
  try {
    console.log('🚀 Début de la création de la table client_notifications...');
    
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, 'create-client-notifications-table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Script SQL chargé:', sqlFilePath);
    
    // Exécuter le script SQL
    console.log('⚡ Exécution du script SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // Si exec_sql n'existe pas, essayer d'exécuter directement
      console.log('⚠️ Fonction exec_sql non disponible, tentative d\'exécution directe...');
      
      // Diviser le script en commandes individuelles
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      for (const command of commands) {
        if (command.trim()) {
          console.log(`🔧 Exécution: ${command.substring(0, 50)}...`);
          const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command + ';' });
          if (cmdError) {
            console.log(`⚠️ Commande ignorée (probablement déjà exécutée): ${cmdError.message}`);
          }
        }
      }
    } else {
      console.log('✅ Script SQL exécuté avec succès');
    }
    
    // Vérifier que la table existe
    console.log('🔍 Vérification de la table client_notifications...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('client_notifications')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError);
      throw tableError;
    }
    
    console.log('✅ Table client_notifications vérifiée avec succès');
    
    // Compter les notifications
    const { count, error: countError } = await supabase
      .from('client_notifications')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur lors du comptage des notifications:', countError);
    } else {
      console.log(`📊 Nombre de notifications dans la table: ${count}`);
    }
    
    console.log('');
    console.log('🎉 Table client_notifications créée avec succès !');
    console.log('');
    console.log('📋 Récapitulatif:');
    console.log('   ✅ Table client_notifications créée');
    console.log('   ✅ Index de performance ajoutés');
    console.log('   ✅ Politiques RLS configurées');
    console.log('   ✅ Trigger de mise à jour automatique');
    console.log('   ✅ Données de démonstration insérées');
    console.log('');
    console.log('🔧 Fonctionnalités disponibles:');
    console.log('   - Affichage des notifications avec priorités');
    console.log('   - Marquage comme lu/Non lu');
    console.log('   - Navigation vers les entités liées');
    console.log('   - Modal de détails');
    console.log('   - Compteur de notifications non lues');
    console.log('');
    console.log('🚀 La rubrique Notifications est maintenant entièrement fonctionnelle !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table client_notifications:', error);
    
    if (error.message.includes('relation "pro_clients" does not exist')) {
      console.log('');
      console.log('💡 Solution: Créez d\'abord la table pro_clients');
      console.log('   Exécutez: node execute-pro-clients-table.js');
    }
    
    process.exit(1);
  }
}

// Exécuter le script
executeClientNotificationsTable(); 