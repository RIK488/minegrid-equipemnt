// 🧪 TEST COMPLET PORTAL PRO
console.log("🧪 TEST COMPLET PORTAL PRO");

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTkyOTgsImV4cCI6MjA2OTI5NTI5OH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompletPortalPro() {
  console.log("🚀 Démarrage du test complet Portal Pro...\n");

  // 1. TEST DES TABLES
  console.log("📋 1. VÉRIFICATION DES TABLES PORTAL PRO");
  console.log("=" .repeat(50));

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

  // 2. TEST DE L'INTERFACE
  console.log("\n🎨 2. VÉRIFICATION DE L'INTERFACE");
  console.log("=" .repeat(50));

  // Vérifier que nous sommes sur le bon site
  if (window.location.hostname === 'localhost' && window.location.port === '5173') {
    console.log("✅ Site local: Correct");
  } else {
    console.log("⚠️ Site: Différent de localhost:5173");
  }

  // Vérifier la navigation vers le portail Pro
  const currentHash = window.location.hash;
  console.log(`ℹ️ Hash actuel: ${currentHash}`);

  if (currentHash === '#pro') {
    console.log("✅ Navigation: Déjà sur le portail Pro");
  } else {
    console.log("ℹ️ Navigation: Pour tester le portail Pro, allez sur localhost:5173/#pro");
  }

  // 3. TEST DES ÉLÉMENTS D'INTERFACE
  console.log("\n🔍 3. VÉRIFICATION DES ÉLÉMENTS D'INTERFACE");
  console.log("=" .repeat(50));

  const elementsATester = [
    { selector: 'nav', description: 'Navigation' },
    { selector: 'main', description: 'Contenu principal' },
    { selector: 'button', description: 'Boutons' }
  ];

  for (const element of elementsATester) {
    try {
      const foundElements = document.querySelectorAll(element.selector);
      if (foundElements.length > 0) {
        console.log(`✅ ${element.description}: ${foundElements.length} trouvé(s)`);
      } else {
        console.log(`⚠️ ${element.description}: Non trouvé`);
      }
    } catch (err) {
      console.log(`❌ ${element.description}: Erreur de test`);
    }
  }

  // 4. TEST DE CONNECTIVITÉ
  console.log("\n📡 4. TEST DE CONNECTIVITÉ");
  console.log("=" .repeat(50));

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log("❌ Erreur d'authentification:", error.message);
    } else if (user) {
      console.log("✅ Utilisateur connecté:", user.email);
    } else {
      console.log("ℹ️ Aucun utilisateur connecté (normal si pas connecté)");
    }
  } catch (err) {
    console.log("❌ Erreur lors du test d'authentification");
  }

  // 5. RÉSUMÉ COMPLET
  console.log("\n📊 5. RÉSUMÉ COMPLET");
  console.log("=" .repeat(50));

  console.log(`✅ Tables OK: ${tablesOK.length}/${tablesPortalPro.length}`);
  console.log(`❌ Tables manquantes: ${tablesManquantes.length}`);

  // 6. RECOMMANDATIONS
  console.log("\n💡 RECOMMANDATIONS:");
  console.log("=" .repeat(50));

  if (tablesManquantes.length > 0) {
    console.log("🚨 TABLES MANQUANTES DÉTECTÉES:");
    tablesManquantes.forEach(table => {
      console.log(`   - ${table}`);
    });
    console.log("\n🔧 ACTIONS REQUISES:");
    console.log("1. Exécutez create-pro-portal-tables.sql dans Supabase");
    console.log("2. Relancez ce test après création");
  } else {
    console.log("✅ TOUTES LES TABLES SONT PRÉSENTES!");
    console.log("✅ Votre Supabase est prêt pour le portail Pro");
  }

  console.log("\n🎯 TEST DES ICÔNES D'ACTIONS:");
  console.log("1. Allez sur localhost:5173/#pro");
  console.log("2. Cliquez sur l'onglet 'Équipements'");
  console.log("3. Testez les icônes d'actions (œil, crayon, poubelle, partage)");
  console.log("4. Vérifiez qu'elles affichent des alertes");

  // 7. INSTRUCTIONS DE TEST MANUEL
  console.log("\n📖 INSTRUCTIONS DE TEST MANUEL:");
  console.log("=" .repeat(50));

  console.log("1. Ouvrez localhost:5173/#pro");
  console.log("2. Cliquez sur 'Équipements'");
  console.log("3. Testez chaque icône d'action:");
  console.log("   - 👁️ Œil: Doit afficher 'Voir les détails'");
  console.log("   - ✏️ Crayon: Doit afficher 'Modifier'");
  console.log("   - 🗑️ Poubelle: Doit demander confirmation");
  console.log("   - 📤 Partage: Doit afficher 'Partager'");

  console.log("\n🏁 TEST COMPLET TERMINÉ");
  console.log("=" .repeat(50));
}

// Fonction pour afficher les instructions
function afficherInstructions() {
  console.log("\n📖 INSTRUCTIONS D'UTILISATION:");
  console.log("1. Assurez-vous d'être sur localhost:5173");
  console.log("2. Ce test vérifie les tables ET l'interface");
  console.log("3. Suivez les recommandations affichées");
  console.log("4. Testez manuellement les icônes d'actions");
}

// Exécution automatique
testCompletPortalPro().catch(console.error);

// Affichage des instructions
afficherInstructions(); 