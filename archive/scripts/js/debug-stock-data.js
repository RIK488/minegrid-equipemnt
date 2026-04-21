// =====================================================
// SCRIPT DE DÉBOGAGE POUR LE SYSTÈME DE STOCK
// =====================================================

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugStockData() {
  console.log('🔍 Débogage du système de stock...');
  
  try {
    // 1. Vérifier la structure de la table machines
    console.log('\n📋 1. Structure de la table machines:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'machines' });
    
    if (columnsError) {
      console.log('⚠️ Impossible de récupérer la structure, essayons une requête directe...');
      const { data: sampleData, error: sampleError } = await supabase
        .from('machines')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Erreur récupération échantillon:', sampleError);
      } else if (sampleData && sampleData.length > 0) {
        console.log('✅ Structure détectée:', Object.keys(sampleData[0]));
      }
    } else {
      console.log('✅ Colonnes de la table machines:', columns);
    }

    // 2. Vérifier les données existantes
    console.log('\n📊 2. Données existantes dans machines:');
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('*')
      .limit(5);
    
    if (machinesError) {
      console.error('❌ Erreur récupération machines:', machinesError);
    } else {
      console.log(`✅ ${machines?.length || 0} machines trouvées`);
      if (machines && machines.length > 0) {
        console.log('📝 Exemple de machine:', {
          id: machines[0].id,
          name: machines[0].name,
          sellerid: machines[0].sellerid,
          seller_id: machines[0].seller_id,
          user_id: machines[0].user_id,
          created_at: machines[0].created_at
        });
      }
    }

    // 3. Vérifier les utilisateurs
    console.log('\n👥 3. Utilisateurs existants:');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, firstname, lastname, email')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
    } else {
      console.log(`✅ ${users?.length || 0} utilisateurs trouvés`);
      if (users && users.length > 0) {
        console.log('📝 Exemple d\'utilisateur:', users[0]);
      }
    }

    // 4. Tester différentes colonnes pour seller_id
    console.log('\n🔍 4. Test des différentes colonnes seller:');
    
    const possibleSellerColumns = ['sellerid', 'seller_id', 'user_id', 'owner_id'];
    
    for (const column of possibleSellerColumns) {
      try {
        const { data, error } = await supabase
          .from('machines')
          .select(`id, name, ${column}`)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          console.log(`✅ Colonne "${column}" existe avec valeur:`, data[0][column]);
        } else {
          console.log(`❌ Colonne "${column}" n'existe pas ou erreur:`, error?.message);
        }
      } catch (err) {
        console.log(`❌ Erreur test colonne "${column}":`, err.message);
      }
    }

    // 5. Vérifier les tables de stock créées
    console.log('\n📦 5. Tables de stock créées:');
    const stockTables = ['promotions', 'stock_insights', 'equipment_analytics', 'stock_actions'];
    
    for (const table of stockTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table "${table}" existe avec ${data?.length || 0} enregistrements`);
        } else {
          console.log(`❌ Table "${table}" n'existe pas ou erreur:`, error.message);
        }
      } catch (err) {
        console.log(`❌ Erreur test table "${table}":`, err.message);
      }
    }

    // 6. Recommandations
    console.log('\n💡 6. Recommandations:');
    console.log('- Vérifiez que la colonne seller_id existe dans la table machines');
    console.log('- Vérifiez que les utilisateurs ont des machines associées');
    console.log('- Vérifiez que les tables de stock ont été créées');
    console.log('- Vérifiez les permissions RLS sur les tables');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le débogage
debugStockData().then(() => {
  console.log('\n✅ Débogage terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 