import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMachinesStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table machines...\n');

    // 1. Vérifier la structure de la table machines
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'machines' 
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (columnsError) {
      console.log('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return;
    }

    console.log('📋 Structure de la table machines:');
    console.log('=====================================');
    
    if (columns && columns.length > 0) {
      columns.forEach(col => {
        console.log(`${col.column_name} | ${col.data_type} | Nullable: ${col.is_nullable} | Default: ${col.column_default || 'NULL'}`);
      });
    } else {
      console.log('❌ Aucune colonne trouvée dans la table machines');
    }

    // 2. Vérifier si total_hours existe
    const hasTotalHours = columns && columns.some(col => col.column_name === 'total_hours');
    console.log('\n🔍 Champ total_hours:');
    console.log('=====================');
    if (hasTotalHours) {
      console.log('✅ Le champ total_hours existe déjà dans la table machines');
    } else {
      console.log('❌ Le champ total_hours n\'existe pas dans la table machines');
      console.log('💡 Il faut l\'ajouter pour enregistrer le nombre d\'heures des machines');
    }

    // 3. Vérifier les politiques RLS
    console.log('\n🔐 Politiques RLS pour machines:');
    console.log('==================================');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            cmd,
            permissive,
            roles
          FROM pg_policies 
          WHERE tablename = 'machines'
          ORDER BY policyname;
        `
      });

    if (policiesError) {
      console.log('❌ Erreur lors de la vérification des politiques:', policiesError);
    } else if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`${policy.policyname} | ${policy.cmd} | ${policy.permissive ? 'Permissive' : 'Restrictive'}`);
      });
    } else {
      console.log('❌ Aucune politique RLS trouvée pour la table machines');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkMachinesStructure(); 