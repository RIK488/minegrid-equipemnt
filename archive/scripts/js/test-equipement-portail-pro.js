// Test pour vérifier l'affichage des équipements dans le portail pro
console.log("🔍 TEST ÉQUIPEMENTS PORTAL PRO");

async function testEquipementPortalPro() {
  try {
    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ Utilisateur non connecté");
      return;
    }
    console.log("✅ Utilisateur connecté:", user.id);

    // 2. Tester la fonction getUserMachines
    console.log("🔄 Test de getUserMachines...");
    const { data: userMachines, error: machinesError } = await supabase
      .from('machines')
      .select('*')
      .eq('sellerid', user.id)
      .order('created_at', { ascending: false });

    if (machinesError) {
      console.error("❌ Erreur getUserMachines:", machinesError);
      return;
    }

    console.log("✅ getUserMachines fonctionne");
    console.log("📊 Nombre d'équipements trouvés:", userMachines?.length || 0);

    if (userMachines && userMachines.length > 0) {
      console.log("📋 Équipements trouvés:");
      userMachines.forEach((machine, index) => {
        console.log(`  ${index + 1}. ${machine.name} (${machine.brand} ${machine.model})`);
        console.log(`     - Catégorie: ${machine.category}`);
        console.log(`     - Prix: ${machine.price}`);
        console.log(`     - État: ${machine.condition}`);
        console.log(`     - SellerId: ${machine.sellerid}`);
      });
    } else {
      console.log("⚠️ Aucun équipement trouvé pour cet utilisateur");
      
      // 3. Créer un équipement de test si aucun n'existe
      console.log("🔄 Création d'un équipement de test...");
      const testMachine = {
        name: "Équipement de test Portal Pro",
        brand: "Test Brand",
        model: "Test Model",
        category: "Test Category",
        year: 2023,
        price: "50000",
        condition: "used",
        description: "Équipement de test pour le portail pro",
        sellerid: user.id
      };

      const { data: newMachine, error: createError } = await supabase
        .from('machines')
        .insert(testMachine)
        .select()
        .single();

      if (createError) {
        console.error("❌ Erreur création équipement test:", createError);
        return;
      }

      console.log("✅ Équipement de test créé:", newMachine.name);
    }

    // 4. Tester la fonction getClientEquipment (équipements Pro)
    console.log("🔄 Test de getClientEquipment...");
    const { data: clientEquipment, error: clientError } = await supabase
      .from('client_equipment')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (clientError) {
      console.error("❌ Erreur getClientEquipment:", clientError);
    } else {
      console.log("✅ getClientEquipment fonctionne");
      console.log("📊 Nombre d'équipements Pro trouvés:", clientEquipment?.length || 0);
    }

    // 5. Vérifier l'onglet équipement dans ProDashboard
    console.log("🔄 Vérification de l'onglet équipement...");
    
    // Simuler le chargement des données comme dans ProDashboard
    const [equipmentData, userMachinesData] = await Promise.all([
      // getClientEquipment() - équipements Pro
      supabase
        .from('client_equipment')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }),
      
      // getUserMachines() - annonces d'équipements
      supabase
        .from('machines')
        .select('*')
        .eq('sellerid', user.id)
        .order('created_at', { ascending: false })
    ]);

    console.log("📊 Résumé pour l'onglet équipement:");
    console.log(`  - Équipements Pro: ${equipmentData.data?.length || 0}`);
    console.log(`  - Mes annonces: ${userMachinesData.data?.length || 0}`);
    console.log(`  - Total: ${(equipmentData.data?.length || 0) + (userMachinesData.data?.length || 0)}`);

    if ((equipmentData.data?.length || 0) + (userMachinesData.data?.length || 0) > 0) {
      console.log("✅ L'onglet équipement devrait afficher des données");
    } else {
      console.log("⚠️ L'onglet équipement sera vide");
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Exécuter le test
testEquipementPortalPro();

// Exposer la fonction pour les tests manuels
window.testEquipementPortalPro = testEquipementPortalPro; 