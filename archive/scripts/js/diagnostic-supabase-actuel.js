// 🔍 DIAGNOSTIC COMPLET SUPABASE - ÉTAT ACTUEL
console.log("🔍 DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES SUPABASE");

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTkyOTgsImV4cCI6MjA2OTI5NTI5OH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticCompletSupabase() {
  console.log("🚀 Démarrage du diagnostic complet...\n");

  // 1. TABLES PRINCIPALES DU PORTAL PRO
  console.log("📋 1. VÉRIFICATION DES TABLES PORTAL PRO");
  console.log("=" .repeat(50));
  
  const tablesPortalPro = [
    'pro_clients',
    'client_equipment', 
    'client_orders',
    'maintenance_interventions',
    'client_notifications',
    'technical_documents',
    'equipment_diagnostics',
    'client_users'
  ];

  let tablesManquantes = [];
  let tablesOK = [];

  for (const table of tablesPortalPro) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        tablesManquantes.push(table);
      } else {
        console.log(`✅ ${table}: OK`);
        tablesOK.push(table);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur de connexion`);
      tablesManquantes.push(table);
    }
  }

  // 2. TABLES PRINCIPALES DE L'APPLICATION
  console.log("\n📋 2. VÉRIFICATION DES TABLES PRINCIPALES");
  console.log("=" .repeat(50));
  
  const tablesPrincipales = [
    'user_profiles',
    'announcements',
    'messages',
    'exchange_rates',
    'machine_views',
    'seller_profiles'
  ];

  for (const table of tablesPrincipales) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur de connexion`);
    }
  }

  // 3. VÉRIFICATION DES POLITIQUES RLS
  console.log("\n🔒 3. VÉRIFICATION DES POLITIQUES RLS");
  console.log("=" .repeat(50));

  for (const table of tablesPortalPro) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.message.includes('permission')) {
        console.log(`⚠️ ${table}: Problème de permissions RLS`);
      } else if (!error) {
        console.log(`✅ ${table}: Politiques RLS OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur de vérification RLS`);
    }
  }

  // 4. VÉRIFICATION DES FONCTIONS ET TRIGGERS
  console.log("\n⚙️ 4. VÉRIFICATION DES FONCTIONS");
  console.log("=" .repeat(50));

  try {
    // Test de la fonction update_updated_at_column
    const { data, error } = await supabase
      .rpc('update_updated_at_column');

    if (error) {
      console.log(`⚠️ Fonction update_updated_at_column: ${error.message}`);
    } else {
      console.log(`✅ Fonction update_updated_at_column: OK`);
    }
  } catch (err) {
    console.log(`❌ Erreur lors du test des fonctions`);
  }

  // 5. RÉSUMÉ ET RECOMMANDATIONS
  console.log("\n📊 5. RÉSUMÉ DU DIAGNOSTIC");
  console.log("=" .repeat(50));

  console.log(`✅ Tables Portal Pro OK: ${tablesOK.length}/${tablesPortalPro.length}`);
  console.log(`❌ Tables Portal Pro manquantes: ${tablesManquantes.length}`);

  if (tablesManquantes.length > 0) {
    console.log("\n🚨 TABLES MANQUANTES DÉTECTÉES:");
    tablesManquantes.forEach(table => {
      console.log(`   - ${table}`);
    });

    console.log("\n🔧 ACTIONS RECOMMANDÉES:");
    console.log("1. Exécuter le script create-pro-portal-tables.sql dans Supabase");
    console.log("2. Vérifier que toutes les politiques RLS sont créées");
    console.log("3. Relancer ce diagnostic après création");
  } else {
    console.log("\n🎉 TOUTES LES TABLES PORTAL PRO SONT PRÉSENTES!");
    console.log("✅ Votre base de données Supabase est prête pour le portail Pro");
  }

  // 6. TEST DE CONNEXION UTILISATEUR
  console.log("\n👤 6. TEST DE CONNEXION UTILISATEUR");
  console.log("=" .repeat(50));

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(`❌ Erreur d'authentification: ${error.message}`);
    } else if (user) {
      console.log(`✅ Utilisateur connecté: ${user.email}`);
      
      // Test de création de profil Pro
      const { data: profile, error: profileError } = await supabase
        .from('pro_clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        console.log("ℹ️ Aucun profil Pro existant pour cet utilisateur");
      } else if (profileError) {
        console.log(`⚠️ Erreur profil Pro: ${profileError.message}`);
      } else {
        console.log(`✅ Profil Pro existant: ${profile.company_name}`);
      }
    } else {
      console.log("ℹ️ Aucun utilisateur connecté");
    }
  } catch (err) {
    console.log(`❌ Erreur lors du test utilisateur: ${err.message}`);
  }

  console.log("\n🏁 DIAGNOSTIC TERMINÉ");
  console.log("=" .repeat(50));
}

// Fonction pour afficher les instructions
function afficherInstructions() {
  console.log("\n📖 INSTRUCTIONS D'UTILISATION:");
  console.log("1. Copiez ce script dans la console de votre navigateur");
  console.log("2. Assurez-vous d'être sur votre site (localhost:5173)");
  console.log("3. Appuyez sur Entrée pour exécuter");
  console.log("4. Vérifiez les résultats dans la console");
}

// Exécution automatique
diagnosticCompletSupabase().catch(console.error);

// Affichage des instructions
afficherInstructions(); 