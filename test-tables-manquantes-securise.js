// 🔍 TEST RAPIDE : Tables manquantes (sécurisé)
console.log("🔍 TEST RAPIDE - TABLES MANQUANTES");

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTkyOTgsImV4cCI6MjA2OTI5NTI5OH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTablesManquantes() {
  console.log("🚀 Test rapide des tables Portal Pro...\n");

  const tablesPortalPro = [
    'pro_clients',
    'client_equipment',
    'maintenance_interventions',
    'client_orders',
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
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${table}: MANQUANTE`);
          tablesManquantes.push(table);
        } else {
          console.log(`⚠️ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: OK`);
        tablesOK.push(table);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erreur de connexion`);
      tablesManquantes.push(table);
    }
  }

  console.log("\n📊 RÉSUMÉ:");
  console.log(`✅ Tables OK: ${tablesOK.length}/${tablesPortalPro.length}`);
  console.log(`❌ Tables manquantes: ${tablesManquantes.length}`);

  if (tablesManquantes.length > 0) {
    console.log("\n🚨 TABLES MANQUANTES:");
    tablesManquantes.forEach(table => {
      console.log(`   - ${table}`);
    });
    console.log("\n💡 SOLUTION: Exécutez create-pro-portal-tables.sql dans Supabase");
  } else {
    console.log("\n🎉 TOUTES LES TABLES SONT PRÉSENTES!");
    console.log("✅ Votre Supabase est prêt pour le portail Pro");
  }

  console.log("\n🏁 Test terminé");
}

// Exécution
testTablesManquantes().catch(console.error); 