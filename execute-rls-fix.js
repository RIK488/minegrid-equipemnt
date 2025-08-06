// Script pour exécuter automatiquement la correction des politiques RLS
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase (à adapter selon votre projet)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseServiceKey || supabaseServiceKey === 'your-service-role-key') {
  console.error('❌ Erreur : Clé de service Supabase manquante');
  console.log('📝 Veuillez définir la variable d\'environnement SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeRLSFix() {
  console.log('🔧 Début de la correction des politiques RLS...');

  try {
    // 1. Lire le script SQL
    const sqlScript = fs.readFileSync(path.join(process.cwd(), 'fix-equipment-rls-policies.sql'), 'utf8');
    
    // 2. Diviser le script en commandes individuelles
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 ${commands.length} commandes SQL à exécuter`);

    // 3. Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.toLowerCase().includes('select')) {
        // Pour les requêtes SELECT, on les exécute et on affiche le résultat
        console.log(`\n🔍 Exécution de la requête de vérification ${i + 1}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erreur lors de la vérification ${i + 1}:`, error);
        } else {
          console.log(`✅ Vérification ${i + 1} réussie:`, data);
        }
      } else {
        // Pour les autres commandes (CREATE POLICY, etc.)
        console.log(`\n⚙️ Exécution de la commande ${i + 1}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erreur lors de l'exécution ${i + 1}:`, error);
        } else {
          console.log(`✅ Commande ${i + 1} exécutée avec succès`);
        }
      }
    }

    // 4. Vérification finale
    console.log('\n🔍 Vérification finale des politiques...');
    const { data: policies, error: verifyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'client_equipment');

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification finale:', verifyError);
    } else {
      console.log('📊 Politiques existantes pour client_equipment:');
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }

    console.log('\n🎉 Correction des politiques RLS terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Alternative : Utilisation directe de l'API REST si RPC n'est pas disponible
async function executeRLSFixAlternative() {
  console.log('🔧 Début de la correction des politiques RLS (méthode alternative)...');

  try {
    // Politiques à créer
    const policies = [
      {
        name: "Client users can insert equipment",
        command: `
          CREATE POLICY "Client users can insert equipment" ON client_equipment
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM client_users 
              WHERE client_users.client_id = client_equipment.client_id 
              AND client_users.user_id = auth.uid()
            )
          );
        `
      },
      {
        name: "Client users can update equipment",
        command: `
          CREATE POLICY "Client users can update equipment" ON client_equipment
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM client_users 
              WHERE client_users.client_id = client_equipment.client_id 
              AND client_users.user_id = auth.uid()
            )
          ) WITH CHECK (
            EXISTS (
              SELECT 1 FROM client_users 
              WHERE client_users.client_id = client_equipment.client_id 
              AND client_users.user_id = auth.uid()
            )
          );
        `
      },
      {
        name: "Client users can delete equipment",
        command: `
          CREATE POLICY "Client users can delete equipment" ON client_equipment
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM client_users 
              WHERE client_users.client_id = client_equipment.client_id 
              AND client_users.user_id = auth.uid()
            )
          );
        `
      }
    ];

    // Exécuter chaque politique
    for (const policy of policies) {
      console.log(`\n⚙️ Création de la politique: ${policy.name}`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.command });
        
        if (error) {
          console.error(`❌ Erreur lors de la création de ${policy.name}:`, error);
        } else {
          console.log(`✅ Politique ${policy.name} créée avec succès`);
        }
      } catch (err) {
        console.error(`❌ Erreur lors de la création de ${policy.name}:`, err);
      }
    }

    console.log('\n🎉 Correction des politiques RLS terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécution
if (process.argv.includes('--alternative')) {
  executeRLSFixAlternative();
} else {
  executeRLSFix();
} 