// Test complet pour diagnostiquer le problème sellerId
// Copiez ce code dans la console du navigateur (F12) sur la page SellEquipment

console.log("🔍 DIAGNOSTIC COMPLET SELLERID");

// 1. Vérifier l'utilisateur connecté
async function checkUser() {
  console.log("1️⃣ Vérification de l'utilisateur...");
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.error("❌ Aucun utilisateur connecté");
      return null;
    }
    
    console.log("✅ Utilisateur connecté:", user);
    console.log("🆔 ID:", user.id);
    console.log("📧 Email:", user.email);
    console.log("🆔 Type de l'ID:", typeof user.id);
    console.log("🆔 ID est truthy:", !!user.id);
    
    return user;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
    return null;
  }
}

// 2. Tester la fonction getCurrentUser
async function testGetCurrentUser() {
  console.log("\n2️⃣ Test de getCurrentUser()...");
  
  try {
    const user = await getCurrentUser();
    console.log("✅ getCurrentUser() fonctionne:", user);
    console.log("🆔 ID via getCurrentUser:", user?.id);
    return user;
  } catch (error) {
    console.error("❌ getCurrentUser() échoue:", error);
    return null;
  }
}

// 3. Simuler l'envoi JSON complet
async function testJsonSend() {
  console.log("\n3️⃣ Test d'envoi JSON complet...");
  
  const user = await getCurrentUser();
  if (!user) {
    console.error("❌ Impossible de récupérer l'utilisateur");
    return;
  }
  
  // Créer un fichier Excel de test
  const testData = [
    { marque: 'Test', modele: 'Test', type: 'Test', annee: 2020, prix_euros: 1000 }
  ];
  
  const ws = XLSX.utils.json_to_sheet(testData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test");
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const testFile = new File([excelBuffer], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Convertir en base64
  const arrayBuffer = await testFile.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  // Préparer les données JSON
  const jsonData = {
    excelFile: {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size,
      data: base64
    },
    sellerId: user.id,
    imageLinks: []
  };
  
  console.log("📦 Données JSON préparées:");
  console.log("  - Nom du fichier:", jsonData.excelFile.name);
  console.log("  - Taille:", jsonData.excelFile.size);
  console.log("  - SellerId:", jsonData.sellerId);
  console.log("  - Type du sellerId:", typeof jsonData.sellerId);
  console.log("  - SellerId est truthy:", !!jsonData.sellerId);
  console.log("  - Liens d'images:", jsonData.imageLinks.length);
  
  // Vérifier que le sellerId est bien là
  if (!jsonData.sellerId) {
    console.error("❌ CRITIQUE: Le sellerId n'est pas dans les données JSON!");
    return;
  }
  
  console.log("✅ Le sellerId est présent dans les données JSON");
  
  // Test d'envoi réel vers n8n
  try {
    console.log("🚀 Envoi vers n8n...");
    console.log("🚀 URL:", 'https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel');
    console.log("🚀 Headers:", { 
      'Content-Type': 'application/json',
      'x-auth-token': 'minegrid-secret-token-2025'
    });
    
    const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': 'minegrid-secret-token-2025'
      },
      body: JSON.stringify(jsonData),
    });
    
    console.log("📊 Status HTTP:", response.status);
    console.log("📊 Headers de réponse:", Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log("📨 Réponse brute:", responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log("📨 Réponse JSON:", responseJson);
    } catch {
      console.log("📨 Réponse n'est pas du JSON valide");
    }
    
  } catch (error) {
    console.error("❌ Erreur envoi:", error);
  }
}

// 4. Vérifier les machines existantes
async function checkExistingMachines() {
  console.log("\n4️⃣ Vérification des machines existantes...");
  
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error("❌ Erreur récupération machines:", error);
      return;
    }
    
    console.log("📊 Machines existantes:", data?.length || 0);
    
    if (data && data.length > 0) {
      console.log("🆔 SellerIds utilisés:");
      const sellerIds = [...new Set(data.map(m => m.sellerId))];
      sellerIds.forEach(id => console.log(`  - ${id}`));
      
      // Vérifier les machines de l'utilisateur actuel
      const user = await getCurrentUser();
      if (user) {
        const myMachines = data.filter(m => m.sellerId === user.id);
        console.log(`📊 Mes machines (sellerId: ${user.id}):`, myMachines.length);
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  }
}

// 5. Test de création manuelle
async function testManualCreation() {
  console.log("\n5️⃣ Test de création manuelle...");
  
  const user = await getCurrentUser();
  if (!user) {
    console.error("❌ Impossible de récupérer l'utilisateur");
    return;
  }
  
  const testMachine = {
    name: "Test Machine - " + new Date().toISOString(),
    brand: "Test Brand",
    model: "Test Model",
    category: "Test",
    year: 2024,
    price: 10000,
    condition: "used",
    description: "Machine de test pour vérifier le sellerId",
    sellerId: user.id,
    specifications: {
      weight: "1000",
      dimensions: "",
      power: {
        value: "100",
        unit: "kW"
      },
      operatingCapacity: "5000",
      workingWeight: "1000"
    },
    images: []
  };
  
  console.log("📦 Machine de test à créer:", testMachine);
  console.log("🆔 SellerId utilisé:", testMachine.sellerId);
  
  try {
    const { data, error } = await supabase
      .from('machines')
      .insert([testMachine])
      .select();
    
    if (error) {
      console.error("❌ Erreur création:", error);
    } else {
      console.log("✅ Machine créée avec succès:", data);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la création:", error);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log("🚀 DÉMARRAGE DES TESTS COMPLETS SELLERID");
  console.log("=" .repeat(60));
  
  await checkUser();
  await testGetCurrentUser();
  await testJsonSend();
  await checkExistingMachines();
  await testManualCreation();
  
  console.log("=" .repeat(60));
  console.log("🏁 FIN DES TESTS COMPLETS SELLERID");
}

// Exporter les fonctions pour utilisation manuelle
window.debugSellerIdComplete = {
  checkUser,
  testGetCurrentUser,
  testJsonSend,
  checkExistingMachines,
  testManualCreation,
  runAllTests
};

// Exécuter automatiquement
runAllTests(); 