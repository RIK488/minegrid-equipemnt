// Test pour vérifier la correction de la table maintenance_interventions
console.log("🔧 TEST CORRECTION TABLE MAINTENANCE_INTERVENTIONS");

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMaintenanceInterventionFix() {
  try {
    console.log("🔄 Test de la correction de la table maintenance_interventions...");

    // 1. Vérifier la structure de la table
    console.log("📋 Vérification de la structure de la table...");
    
    const { data: structure, error: structureError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'maintenance_interventions')
      .order('ordinal_position');

    if (structureError) {
      console.error("❌ Erreur lors de la vérification de la structure:", structureError);
      return;
    }

    console.log("✅ Structure de la table:");
    structure.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 2. Vérifier si equipment_id est nullable
    const equipmentIdColumn = structure.find(col => col.column_name === 'equipment_id');
    if (equipmentIdColumn && equipmentIdColumn.is_nullable === 'YES') {
      console.log("✅ Champ equipment_id est maintenant nullable");
    } else {
      console.log("⚠️ Champ equipment_id n'est pas nullable - correction nécessaire");
    }

    // 3. Tester l'insertion d'une intervention sans equipment_id
    console.log("🔄 Test d'insertion d'intervention sans equipment_id...");
    
    const testIntervention = {
      client_id: 'test-client-id', // Remplacez par un vrai client_id
      intervention_type: 'preventive',
      status: 'scheduled',
      priority: 'normal',
      description: 'Test intervention - maintenance préventive générale',
      scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Demain
      duration_hours: 8,
      technician_name: 'Technicien Test',
      cost: 150.00
      // equipment_id est omis intentionnellement
    };

    const { data: newIntervention, error: insertError } = await supabase
      .from('maintenance_interventions')
      .insert(testIntervention)
      .select()
      .single();

    if (insertError) {
      console.error("❌ Erreur lors de l'insertion:", insertError);
      console.log("💡 Vérifiez que le script fix-maintenance-interventions-table.sql a été exécuté");
      return;
    }

    console.log("✅ Intervention créée avec succès:", newIntervention);

    // 4. Vérifier que l'intervention apparaît dans la liste
    console.log("🔄 Vérification de la récupération des interventions...");
    
    const { data: interventions, error: fetchError } = await supabase
      .from('maintenance_interventions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error("❌ Erreur lors de la récupération:", fetchError);
      return;
    }

    console.log("✅ Interventions récupérées:", interventions.length);
    interventions.forEach(intervention => {
      console.log(`   - ${intervention.intervention_type} (${intervention.status}) - ${intervention.description}`);
    });

    // 5. Nettoyer les données de test
    console.log("🔄 Nettoyage des données de test...");
    
    const { error: deleteError } = await supabase
      .from('maintenance_interventions')
      .delete()
      .eq('description', 'Test intervention - maintenance préventive générale');

    if (deleteError) {
      console.error("⚠️ Erreur lors du nettoyage:", deleteError);
    } else {
      console.log("✅ Données de test nettoyées");
    }

    console.log("✅ Test de correction terminé avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

// Fonction pour exécuter le script SQL de correction
async function executeFixScript() {
  console.log("🔄 Exécution du script de correction...");
  
  const fixQueries = [
    "ALTER TABLE maintenance_interventions DROP CONSTRAINT IF EXISTS maintenance_interventions_equipment_id_fkey;",
    "ALTER TABLE maintenance_interventions ALTER COLUMN equipment_id DROP NOT NULL;",
    `ALTER TABLE maintenance_interventions 
     ADD CONSTRAINT maintenance_interventions_equipment_id_fkey 
     FOREIGN KEY (equipment_id) REFERENCES client_equipment(id) ON DELETE SET NULL;`
  ];

  for (const query of fixQueries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: query });
      if (error) {
        console.error("❌ Erreur lors de l'exécution de la requête:", error);
        console.log("💡 Exécutez manuellement le script fix-maintenance-interventions-table.sql");
        return;
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'exécution:", error);
      console.log("💡 Exécutez manuellement le script fix-maintenance-interventions-table.sql");
      return;
    }
  }

  console.log("✅ Script de correction exécuté");
}

// Instructions pour l'utilisateur
function showInstructions() {
  console.log("📋 INSTRUCTIONS POUR CORRIGER LE PROBLÈME:");
  console.log("");
  console.log("1. Exécutez le script SQL fix-maintenance-interventions-table.sql dans votre base de données Supabase");
  console.log("2. Ou utilisez la fonction executeFixScript() si vous avez les permissions");
  console.log("3. Puis testez avec testMaintenanceInterventionFix()");
  console.log("");
  console.log("💡 Pour exécuter le script SQL:");
  console.log("   - Allez dans votre dashboard Supabase");
  console.log("   - Ouvrez l'éditeur SQL");
  console.log("   - Copiez-collez le contenu de fix-maintenance-interventions-table.sql");
  console.log("   - Exécutez le script");
}

// Exposer les fonctions
window.testMaintenanceInterventionFix = testMaintenanceInterventionFix;
window.executeFixScript = executeFixScript;
window.showInstructions = showInstructions;

// Afficher les instructions
showInstructions(); 