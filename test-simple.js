// Test simple pour vérifier le sellerId
// Copiez ce code dans la console du navigateur (F12)

console.log("🧪 TEST SIMPLE SELLERID");

// 1. Vérifier l'utilisateur
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;

if (!user) {
  console.error("❌ Aucun utilisateur connecté");
} else {
  console.log("✅ Utilisateur:", user.id);
  
  // 2. Créer des données de test
  const testData = {
    excelFile: {
      name: "test.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 100,
      data: "test"
    },
    sellerId: user.id,
    imageLinks: []
  };
  
  console.log("📦 Données de test:", testData);
  console.log("🆔 SellerId:", testData.sellerId);
  
  // 3. Convertir en JSON
  const jsonString = JSON.stringify(testData);
  console.log("📄 JSON stringifié:", jsonString);
  console.log("🆔 Contient sellerId:", jsonString.includes('"sellerId"'));
  console.log("🆔 Contient l'ID:", jsonString.includes(user.id));
  
  // 4. Test d'envoi
  try {
    console.log("🚀 Envoi vers n8n...");
    const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': 'minegrid-secret-token-2025'
      },
      body: jsonString,
    });
    
    console.log("📊 Status:", response.status);
    const responseText = await response.text();
    console.log("📨 Réponse:", responseText);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
} 