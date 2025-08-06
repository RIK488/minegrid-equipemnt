// Test pour vérifier que les tables du portail Pro ont été créées
console.log("🔧 TEST CRÉATION TABLES PORTAL PRO");

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTkyOTgsImV4cCI6MjA2OTI5NTI5OH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProPortalTables() {
  try {
    console.log("🔄 Vérification des tables du portail Pro...");

    // 1. Vérifier que toutes les tables existent
    const requiredTables = [
      'pro_clients',
      'client_equipment',
      'client_orders',
      'maintenance_interventions',
      'client_notifications',
      'technical_documents',
      'equipment_diagnostics',
      'client_users'
    ];

    console.log("📋 Tables requises:", requiredTables);

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ Table ${tableName} non accessible:`, error.message);
        } else {
          console.log(`✅ Table ${tableName} accessible`);
        }
      } catch (error) {
        console.error(`❌ Erreur avec la table ${tableName}:`, error.message);
      }
    }

    // 2. Vérifier la structure de la table maintenance_interventions
    console.log("\n🔍 Vérification de la structure maintenance_interventions...");
    
    try {
      const { data: structure, error: structureError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'maintenance_interventions')
        .order('ordinal_position');

      if (structureError) {
        console.error("❌ Erreur lors de la vérification de la structure:", structureError);
      } else {
        console.log("✅ Structure de maintenance_interventions:");
        structure.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Vérifier que equipment_id est nullable
        const equipmentIdColumn = structure.find(col => col.column_name === 'equipment_id');
        if (equipmentIdColumn && equipmentIdColumn.is_nullable === 'YES') {
          console.log("✅ Champ equipment_id est nullable (correct)");
        } else {
          console.log("⚠️ Champ equipment_id n'est pas nullable - problème potentiel");
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification de la structure:", error);
    }

    // 3. Tester la création d'un profil Pro
    console.log("\n🔄 Test de création d'un profil Pro...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("⚠️ Aucun utilisateur connecté - test limité");
        return;
      }

      console.log("✅ Utilisateur connecté:", user.id);

      // Vérifier si un profil Pro existe déjà
      const { data: existingProfile, error: profileError } = await supabase
        .from('pro_clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        console.log("ℹ️ Aucun profil Pro existant - création d'un profil de test...");
        
        const testProfile = {
          user_id: user.id,
          company_name: 'Test Company',
          contact_person: 'Test Contact',
          phone: '+212 6 12 34 56 78',
          address: '123 Test Street',
          subscription_type: 'pro',
          subscription_status: 'active'
        };

        const { data: newProfile, error: createError } = await supabase
          .from('pro_clients')
          .insert(testProfile)
          .select()
          .single();

        if (createError) {
          console.error("❌ Erreur lors de la création du profil Pro:", createError);
        } else {
          console.log("✅ Profil Pro créé:", newProfile);
        }
      } else if (profileError) {
        console.error("❌ Erreur lors de la vérification du profil Pro:", profileError);
      } else {
        console.log("✅ Profil Pro existant:", existingProfile);
      }

    } catch (error) {
      console.error("❌ Erreur lors du test de profil Pro:", error);
    }

    // 4. Tester la création d'une intervention de maintenance
    console.log("\n🔄 Test de création d'une intervention de maintenance...");
    
    try {
      // Récupérer un profil Pro pour le test
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("⚠️ Aucun utilisateur connecté - test d'intervention limité");
        return;
      }

      const { data: proProfile } = await supabase
        .from('pro_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!proProfile) {
        console.log("⚠️ Aucun profil Pro trouvé - test d'intervention limité");
        return;
      }

      const testIntervention = {
        client_id: proProfile.id,
        intervention_type: 'preventive',
        status: 'scheduled',
        priority: 'normal',
        description: 'Test intervention - maintenance préventive générale',
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Demain
        duration_hours: 8,
        technician_name: 'Technicien Test',
        cost: 150.00
        // equipment_id est omis intentionnellement pour tester le champ nullable
      };

      const { data: newIntervention, error: interventionError } = await supabase
        .from('maintenance_interventions')
        .insert(testIntervention)
        .select()
        .single();

      if (interventionError) {
        console.error("❌ Erreur lors de la création de l'intervention:", interventionError);
      } else {
        console.log("✅ Intervention créée avec succès:", newIntervention);
        
        // Nettoyer l'intervention de test
        const { error: deleteError } = await supabase
          .from('maintenance_interventions')
          .delete()
          .eq('id', newIntervention.id);
        
        if (deleteError) {
          console.error("⚠️ Erreur lors du nettoyage:", deleteError);
        } else {
          console.log("✅ Intervention de test nettoyée");
        }
      }

    } catch (error) {
      console.error("❌ Erreur lors du test d'intervention:", error);
    }

    console.log("\n✅ Test des tables du portail Pro terminé !");

  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  }
}

// Fonction pour afficher les instructions
function showInstructions() {
  console.log("📋 INSTRUCTIONS POUR RÉSOUDRE LES ERREURS:");
  console.log("");
  console.log("1. Exécutez le script SQL create-pro-portal-tables.sql dans Supabase:");
  console.log("   - Allez dans votre dashboard Supabase");
  console.log("   - Ouvrez l'éditeur SQL");
  console.log("   - Copiez-collez le contenu de create-pro-portal-tables.sql");
  console.log("   - Exécutez le script");
  console.log("");
  console.log("2. Vérifiez que toutes les tables ont été créées");
  console.log("");
  console.log("3. Testez avec testProPortalTables()");
  console.log("");
  console.log("4. Rechargez la page du portail Pro");
  console.log("");
  console.log("💡 Si vous avez des erreurs RLS, vérifiez que les politiques ont été créées");
}

// Exposer les fonctions
window.testProPortalTables = testProPortalTables;
window.showInstructions = showInstructions;

// Afficher les instructions
showInstructions();

// Exécuter le test automatiquement
testProPortalTables(); 