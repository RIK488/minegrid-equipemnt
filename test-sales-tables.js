// Script de test pour vérifier les tables de vente
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacer par vos vraies valeurs)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSalesTables() {
  console.log('🔍 Test des tables de vente...\n');

  try {
    // Test 1: Vérifier l'existence des tables
    console.log('📋 Test 1: Vérification de l\'existence des tables');
    
    const tables = ['profiles', 'sales', 'prospects', 'user_targets', 'prospect_interactions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ERREUR - ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ERREUR - ${err.message}`);
      }
    }

    console.log('\n📊 Test 2: Vérification des données');

    // Test 2: Compter les vendeurs
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'vendeur');

      if (profilesError) {
        console.log(`❌ Erreur lors du comptage des vendeurs: ${profilesError.message}`);
      } else {
        console.log(`✅ Vendeurs trouvés: ${profiles.length}`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors du comptage des vendeurs: ${err.message}`);
    }

    // Test 3: Compter les ventes
    try {
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id');

      if (salesError) {
        console.log(`❌ Erreur lors du comptage des ventes: ${salesError.message}`);
      } else {
        console.log(`✅ Ventes trouvées: ${sales.length}`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors du comptage des ventes: ${err.message}`);
    }

    // Test 4: Compter les prospects
    try {
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('id');

      if (prospectsError) {
        console.log(`❌ Erreur lors du comptage des prospects: ${prospectsError.message}`);
      } else {
        console.log(`✅ Prospects trouvés: ${prospects.length}`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors du comptage des prospects: ${err.message}`);
    }

    // Test 5: Compter les objectifs
    try {
      const { data: targets, error: targetsError } = await supabase
        .from('user_targets')
        .select('id');

      if (targetsError) {
        console.log(`❌ Erreur lors du comptage des objectifs: ${targetsError.message}`);
      } else {
        console.log(`✅ Objectifs trouvés: ${targets.length}`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors du comptage des objectifs: ${err.message}`);
    }

    // Test 6: Compter les interactions
    try {
      const { data: interactions, error: interactionsError } = await supabase
        .from('prospect_interactions')
        .select('id');

      if (interactionsError) {
        console.log(`❌ Erreur lors du comptage des interactions: ${interactionsError.message}`);
      } else {
        console.log(`✅ Interactions trouvées: ${interactions.length}`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors du comptage des interactions: ${err.message}`);
    }

    console.log('\n🎯 Test 3: Test du calcul de rang');

    // Test 7: Simuler le calcul de rang
    try {
      // Récupérer tous les vendeurs
      const { data: allVendors, error: vendorsError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'vendeur');

      if (vendorsError) {
        console.log(`❌ Erreur lors de la récupération des vendeurs: ${vendorsError.message}`);
      } else {
        console.log(`✅ Total vendeurs: ${allVendors.length}`);
        
        if (allVendors.length > 0) {
          // Récupérer les ventes des 3 derniers mois
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          const { data: recentSales, error: salesError } = await supabase
            .from('sales')
            .select('seller_id, amount')
            .gte('created_at', threeMonthsAgo.toISOString());

          if (salesError) {
            console.log(`❌ Erreur lors de la récupération des ventes récentes: ${salesError.message}`);
          } else {
            console.log(`✅ Ventes récentes (3 mois): ${recentSales.length}`);
            
            // Calculer le rang pour le premier vendeur
            if (allVendors.length > 0 && recentSales.length > 0) {
              const testSellerId = allVendors[0].id;
              
              // Calculer les performances par vendeur
              const sellerPerformance = recentSales.reduce((acc, sale) => {
                const sellerId = sale.seller_id;
                if (!acc[sellerId]) {
                  acc[sellerId] = { totalSales: 0, salesCount: 0 };
                }
                acc[sellerId].totalSales += parseFloat(sale.amount || 0);
                acc[sellerId].salesCount += 1;
                return acc;
              }, {});

              // Créer un score pour chaque vendeur
              const sellerScores = allVendors.map(user => {
                const sellerData = sellerPerformance[user.id] || { totalSales: 0, salesCount: 0 };
                const avgSales = sellerData.salesCount > 0 ? sellerData.totalSales / sellerData.salesCount : 0;
                const score = Math.min(100, (avgSales / 500000) * 100); // 500k = 100%
                
                return {
                  sellerId: user.id,
                  score: score,
                  totalSales: sellerData.totalSales,
                  salesCount: sellerData.salesCount
                };
              });

              // Trier par score
              sellerScores.sort((a, b) => b.score - a.score);

              // Trouver le rang du vendeur test
              const testSellerRank = sellerScores.findIndex(seller => seller.sellerId === testSellerId);
              const rank = testSellerRank >= 0 ? testSellerRank + 1 : allVendors.length;

              console.log(`✅ Rang calculé pour le vendeur test: ${rank}/${allVendors.length}`);
              console.log(`✅ Score du vendeur test: ${sellerScores[testSellerRank]?.score.toFixed(1)}/100`);
            }
          }
        }
      }
    } catch (err) {
      console.log(`❌ Erreur lors du test de calcul de rang: ${err.message}`);
    }

    console.log('\n🎉 Test terminé !');

    // Résumé
    console.log('\n📋 Résumé:');
    console.log('✅ Si toutes les tables sont marquées "OK", le widget devrait fonctionner');
    console.log('✅ Si des données sont trouvées, le rang sera calculé correctement');
    console.log('⚠️  Si des erreurs apparaissent, vérifiez le script SQL');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testSalesTables(); 