// Test de la fonction getSellerMachines
// À exécuter dans la console du navigateur

console.log("🧪 Test de getSellerMachines...");

// Test 1: Vérifier l'utilisateur connecté
async function testUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("❌ Erreur session:", error);
      return null;
    }
    
    if (!session || !session.user) {
      console.log("⚠️ Aucun utilisateur connecté");
      return null;
    }
    
    console.log("✅ Utilisateur connecté:", session.user.id);
    return session.user;
  } catch (err) {
    console.error("❌ Erreur test utilisateur:", err);
    return null;
  }
}

// Test 2: Test direct de la requête Supabase
async function testDirectQuery(userId) {
  if (!userId) {
    console.log("⚠️ Pas d'ID utilisateur pour le test");
    return;
  }
  
  try {
    console.log("🔍 Requête directe pour userId:", userId);
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('sellerId', userId);
    
    if (error) {
      console.error("❌ Erreur requête directe:", error);
      return;
    }
    
    console.log("✅ Résultat requête directe:", data);
    console.log("📊 Nombre de résultats:", data?.length || 0);
    
    return data;
  } catch (err) {
    console.error("❌ Erreur test requête directe:", err);
  }
}

// Test 3: Test de la fonction getSellerMachines
async function testGetSellerMachines() {
  try {
    console.log("🔍 Test de getSellerMachines...");
    
    // Simuler la fonction getSellerMachines
    const user = await getCurrentUser();
    console.log("👤 Utilisateur récupéré:", user?.id);
    
    if (!user) {
      console.log("⚠️ Pas d'utilisateur connecté");
      return;
    }
    
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('sellerId', user.id);
    
    if (error) {
      console.error("❌ Erreur getSellerMachines:", error);
      return;
    }
    
    console.log("✅ Résultat getSellerMachines:", data);
    console.log("📊 Nombre de machines:", data?.length || 0);
    
    return data;
  } catch (err) {
    console.error("❌ Erreur test getSellerMachines:", err);
  }
}

// Lancer tous les tests
async function runTests() {
  console.log("🚀 Lancement des tests...");
  
  const user = await testUser();
  if (user) {
    await testDirectQuery(user.id);
  }
  await testGetSellerMachines();
  
  console.log("✅ Tests terminés");
}

// Lancer les tests
runTests(); 