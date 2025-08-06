// Script simplifié pour corriger les politiques RLS
import { createClient } from '@supabase/supabase-js';

// Configuration - Remplacez par vos vraies valeurs
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseServiceKey = 'your-service-role-key';

console.log('🔧 Début de la correction des politiques RLS...');

// Vérification de la configuration
if (supabaseUrl === 'https://your-project.supabase.co' || supabaseServiceKey === 'your-service-role-key') {
  console.error('❌ Erreur : Configuration Supabase manquante');
  console.log('📝 Veuillez modifier les variables supabaseUrl et supabaseServiceKey dans ce fichier');
  console.log('📝 Ou définir les variables d\'environnement :');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  try {
    console.log('📋 Vérification des politiques existantes...');
    
    // Vérifier les politiques existantes
    const { data: existingPolicies, error: checkError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'client_equipment');

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }

    console.log('📊 Politiques existantes:');
    existingPolicies.forEach(policy => {
      console.log(`  - ${policy.policyname} (${policy.cmd})`);
    });

    // Politiques nécessaires
    const requiredPolicies = [
      {
        name: 'Client users can insert equipment',
        cmd: 'INSERT',
        exists: existingPolicies.some(p => p.policyname === 'Client users can insert equipment')
      },
      {
        name: 'Client users can update equipment',
        cmd: 'UPDATE',
        exists: existingPolicies.some(p => p.policyname === 'Client users can update equipment')
      },
      {
        name: 'Client users can delete equipment',
        cmd: 'DELETE',
        exists: existingPolicies.some(p => p.policyname === 'Client users can delete equipment')
      }
    ];

    console.log('\n🔍 Analyse des politiques manquantes...');
    const missingPolicies = requiredPolicies.filter(p => !p.exists);
    
    if (missingPolicies.length === 0) {
      console.log('✅ Toutes les politiques nécessaires existent déjà !');
      return;
    }

    console.log(`📝 ${missingPolicies.length} politique(s) à créer:`);
    missingPolicies.forEach(policy => {
      console.log(`  - ${policy.name} (${policy.cmd})`);
    });

    // Créer les politiques manquantes
    console.log('\n⚙️ Création des politiques manquantes...');
    
    for (const policy of missingPolicies) {
      console.log(`\n🔧 Création de: ${policy.name}`);
      
      let sqlCommand = '';
      
      switch (policy.cmd) {
        case 'INSERT':
          sqlCommand = `
            CREATE POLICY "Client users can insert equipment" ON client_equipment
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM client_users 
                WHERE client_users.client_id = client_equipment.client_id 
                AND client_users.user_id = auth.uid()
              )
            );
          `;
          break;
          
        case 'UPDATE':
          sqlCommand = `
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
          `;
          break;
          
        case 'DELETE':
          sqlCommand = `
            CREATE POLICY "Client users can delete equipment" ON client_equipment
            FOR DELETE USING (
              EXISTS (
                SELECT 1 FROM client_users 
                WHERE client_users.client_id = client_equipment.client_id 
                AND client_users.user_id = auth.uid()
              )
            );
          `;
          break;
      }

      try {
        // Utiliser l'API REST pour exécuter le SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: sqlCommand })
        });

        if (response.ok) {
          console.log(`✅ Politique ${policy.name} créée avec succès`);
        } else {
          const error = await response.text();
          console.error(`❌ Erreur lors de la création de ${policy.name}:`, error);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${policy.name}:`, error);
      }
    }

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { data: finalPolicies, error: finalError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'client_equipment');

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log('📊 Politiques finales:');
      finalPolicies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }

    console.log('\n🎉 Correction des politiques RLS terminée !');
    console.log('✅ Vous pouvez maintenant tester la modification d\'équipement');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécution
fixRLSPolicies(); 