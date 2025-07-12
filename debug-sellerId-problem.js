// Script de diagnostic pour le problème sellerId
// À exécuter dans la console du navigateur sur la page SellEquipment

console.log("🔍 DIAGNOSTIC SELLERID - Démarrage...");

// 1. Vérifier si l'utilisateur est connecté
async function checkUserConnection() {
  console.log("1️⃣ Vérification de la connexion utilisateur...");
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Erreur session:", error);
      return null;
    }
    
    if (!session) {
      console.error("❌ Aucune session active");
      return null;
    }
    
    if (!session.user) {
      console.error("❌ Aucun utilisateur dans la session");
      return null;
    }
    
    console.log("✅ Utilisateur connecté:", session.user);
    console.log("🆔 ID utilisateur:", session.user.id);
    console.log("📧 Email:", session.user.email);
    
    return session.user;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
    return null;
  }
}

// 2. Tester la fonction getCurrentUser
async function testGetCurrentUser() {
  console.log("\n2️⃣ Test de la fonction getCurrentUser...");
  
  try {
    const user = await getCurrentUser();
    console.log("✅ getCurrentUser() fonctionne:", user);
    return user;
  } catch (error) {
    console.error("❌ getCurrentUser() échoue:", error);
    return null;
  }
}

// 3. Simuler l'envoi vers n8n
async function testN8nSend() {
  console.log("\n3️⃣ Test d'envoi vers n8n...");
  
  const user = await getCurrentUser();
  if (!user) {
    console.error("❌ Impossible de récupérer l'utilisateur");
    return;
  }
  
  // Créer un fichier Excel de test
  const testData = [
    { marque: 'Test', modèle: 'Test', type: 'Test', année: 2020, 'prix (€)': 1000 }
  ];
  
  const ws = XLSX.utils.json_to_sheet(testData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test");
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const testFile = new File([excelBuffer], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Créer le FormData
  const formData = new FormData();
  formData.append('excel', testFile);
  formData.append('sellerId', user.id);
  
  console.log("📦 FormData créé:");
  for (let [key, value] of formData.entries()) {
    if (key === 'excel') {
      console.log(`  ${key}: [File: ${value.name}]`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  // Vérifier que le sellerId est bien là
  const sellerIdInForm = formData.get('sellerId');
  console.log("🆔 SellerId dans FormData:", sellerIdInForm);
  console.log("🆔 Type du sellerId:", typeof sellerIdInForm);
  
  if (!sellerIdInForm) {
    console.error("❌ CRITIQUE: Le sellerId n'est pas dans le FormData!");
    return;
  }
  
  console.log("✅ Le sellerId est bien présent dans le FormData");
  
  // Test d'envoi (optionnel - décommentez pour tester)
  /*
  try {
    console.log("🚀 Envoi vers n8n...");
    const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel', {
      method: 'POST',
      headers: {
        'x-auth-token': 'minegrid-secret-token-2025'
      },
      body: formData,
    });
    
    const responseText = await response.text();
    console.log("📨 Réponse n8n:", responseText);
    console.log("📊 Status:", response.status);
  } catch (error) {
    console.error("❌ Erreur envoi:", error);
  }
  */
}

// 4. Vérifier les machines existantes
async function checkExistingMachines() {
  console.log("\n4️⃣ Vérification des machines existantes...");
  
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error("❌ Erreur récupération machines:", error);
      return;
    }
    
    console.log("📊 Machines existantes:", data);
    
    if (data && data.length > 0) {
      console.log("🆔 SellerIds utilisés:");
      const sellerIds = [...new Set(data.map(m => m.sellerId))];
      sellerIds.forEach(id => console.log(`  - ${id}`));
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log("🚀 DÉMARRAGE DES TESTS SELLERID");
  console.log("=" .repeat(50));
  
  await checkUserConnection();
  await testGetCurrentUser();
  await testN8nSend();
  await checkExistingMachines();
  
  console.log("=" .repeat(50));
  console.log("🏁 FIN DES TESTS SELLERID");
}

// Exporter les fonctions pour utilisation manuelle
window.debugSellerId = {
  checkUserConnection,
  testGetCurrentUser,
  testN8nSend,
  checkExistingMachines,
  runAllTests
};

// Exécuter automatiquement
runAllTests(); 