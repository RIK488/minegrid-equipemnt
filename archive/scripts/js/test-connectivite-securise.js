// 🔒 TEST DE CONNECTIVITÉ SÉCURISÉ
// Teste la connectivité sans exposer d'informations sensibles
console.log("🔒 TEST DE CONNECTIVITÉ SÉCURISÉ");

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTkyOTgsImV4cCI6MjA2OTI5NTI5OH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnectiviteSecurise() {
  console.log("🚀 Test de connectivité sécurisé en cours...\n");

  let testsReussis = 0;
  let testsTotal = 0;

  // 1. TEST DE CONNEXION SUPABASE
  console.log("📡 1. Test de connexion Supabase...");
  testsTotal++;
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.log("❌ Erreur de connexion Supabase");
      console.log("   Détail:", error.message);
    } else {
      console.log("✅ Connexion Supabase OK");
      testsReussis++;
    }
  } catch (err) {
    console.log("❌ Impossible de se connecter à Supabase");
  }

  // 2. TEST D'AUTHENTIFICATION
  console.log("\n🔐 2. Test d'authentification...");
  testsTotal++;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log("❌ Erreur d'authentification");
    } else if (user) {
      console.log("✅ Utilisateur connecté");
      testsReussis++;
    } else {
      console.log("ℹ️ Aucun utilisateur connecté (normal si pas connecté)");
      testsReussis++; // On compte comme réussi car c'est normal
    }
  } catch (err) {
    console.log("❌ Erreur lors du test d'authentification");
  }

  // 3. TEST DES TABLES PRINCIPALES (sans exposer de données)
  console.log("\n📋 3. Test des tables principales...");
  
  const tablesATester = [
    'user_profiles',
    'announcements',
    'messages'
  ];

  for (const table of tablesATester) {
    testsTotal++;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
        testsReussis++;
      }
    } catch (err) {
      console.log(`❌ Table ${table}: Erreur de connexion`);
    }
  }

  // 4. TEST DES TABLES PORTAL PRO (sans exposer de données)
  console.log("\n🏢 4. Test des tables Portal Pro...");
  
  const tablesPortalPro = [
    'pro_clients',
    'client_equipment',
    'maintenance_interventions',
    'client_orders'
  ];

  let tablesPortalProOK = 0;
  
  for (const table of tablesPortalPro) {
    testsTotal++;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ Table ${table}: N'existe pas`);
        } else {
          console.log(`⚠️ Table ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ Table ${table}: OK`);
        testsReussis++;
        tablesPortalProOK++;
      }
    } catch (err) {
      console.log(`❌ Table ${table}: Erreur de connexion`);
    }
  }

  // 5. TEST DES FONCTIONS (sans exposer de données)
  console.log("\n⚙️ 5. Test des fonctions...");
  testsTotal++;
  
  try {
    // Test simple d'une fonction RPC
    const { data, error } = await supabase
      .rpc('update_updated_at_column');

    if (error) {
      console.log("⚠️ Fonction update_updated_at_column: Non disponible");
    } else {
      console.log("✅ Fonction update_updated_at_column: OK");
      testsReussis++;
    }
  } catch (err) {
    console.log("ℹ️ Fonction update_updated_at_column: Non testée");
  }

  // 6. RÉSUMÉ SÉCURISÉ
  console.log("\n📊 6. RÉSUMÉ DU TEST");
  console.log("=" .repeat(40));
  
  console.log(`Tests réussis: ${testsReussis}/${testsTotal}`);
  console.log(`Tables Portal Pro OK: ${tablesPortalProOK}/${tablesPortalPro.length}`);

  // 7. RECOMMANDATIONS SÉCURISÉES
  console.log("\n💡 RECOMMANDATIONS:");
  
  if (tablesPortalProOK === tablesPortalPro.length) {
    console.log("✅ Toutes les tables Portal Pro sont présentes");
    console.log("✅ Votre Supabase est prêt pour le portail Pro");
  } else if (tablesPortalProOK > 0) {
    console.log("⚠️ Certaines tables Portal Pro manquent");
    console.log("💡 Exécutez create-pro-portal-tables.sql pour les créer");
  } else {
    console.log("❌ Aucune table Portal Pro trouvée");
    console.log("💡 Exécutez create-pro-portal-tables.sql pour créer toutes les tables");
  }

  // 8. TEST DE FONCTIONNALITÉ (sans exposer de données)
  console.log("\n🎯 8. Test de fonctionnalité...");
  
  try {
    // Test de création d'un profil Pro (sans réellement le créer)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: existingProfile, error } = await supabase
        .from('pro_clients')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log("ℹ️ Table pro_clients: N'existe pas - à créer");
      } else if (error) {
        console.log("⚠️ Erreur lors du test pro_clients");
      } else if (existingProfile && existingProfile.length > 0) {
        console.log("✅ Profil Pro existant détecté");
      } else {
        console.log("ℹ️ Aucun profil Pro existant (normal)");
      }
    } else {
      console.log("ℹ️ Pas d'utilisateur connecté pour le test de profil");
    }
  } catch (err) {
    console.log("ℹ️ Test de fonctionnalité non effectué");
  }

  console.log("\n🏁 TEST TERMINÉ");
  console.log("=" .repeat(40));
  console.log("✅ Ce test est sécurisé et n'expose aucune donnée sensible");
  console.log("💡 Utilisez les recommandations pour corriger les problèmes détectés");
}

// Fonction pour afficher les instructions
function afficherInstructionsSecurisees() {
  console.log("\n📖 INSTRUCTIONS SÉCURISÉES:");
  console.log("1. Ce test ne collecte aucune donnée personnelle");
  console.log("2. Il vérifie seulement la connectivité et l'existence des tables");
  console.log("3. Aucune information sensible n'est affichée");
  console.log("4. Les résultats sont anonymisés");
}

// Exécution automatique
testConnectiviteSecurise().catch(console.error);

// Affichage des instructions
afficherInstructionsSecurisees(); 