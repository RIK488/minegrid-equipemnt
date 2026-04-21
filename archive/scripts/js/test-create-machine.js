// Script pour tester la création d'une machine
// Copie ce code dans la console du navigateur (F12)

console.log("🧪 Test de création d'une machine...");

// Créer une machine de test
const createTestMachine = async () => {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      console.error("❌ Aucun utilisateur connecté");
      return;
    }
    
    console.log("👤 Utilisateur:", userId);
    
    // Créer une machine de test
    const testMachine = {
      name: "Machine de test",
      brand: "Test Brand",
      model: "Test Model",
      category: "Test",
      year: 2024,
      price: 10000,
      condition: "used",
      description: "Machine de test pour vérifier le dashboard",
      sellerId: userId,
      specifications: {
        weight: "1000",
        dimensions: {
          length: "5",
          width: "2",
          height: "3"
        },
        power: {
          value: "100",
          unit: "kW"
        },
        operatingCapacity: {
          value: "5000",
          unit: "kg"
        }
      },
      images: []
    };
    
    console.log("📝 Machine à créer:", testMachine);
    
    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('machines')
      .insert([testMachine])
      .select();
    
    if (error) {
      console.error("❌ Erreur création:", error);
      return;
    }
    
    console.log("✅ Machine créée:", data);
    
    // Vérifier qu'elle apparaît dans getSellerMachines
    const { data: userMachines, error: fetchError } = await supabase
      .from('machines')
      .select('*')
      .eq('sellerId', userId);
    
    if (fetchError) {
      console.error("❌ Erreur récupération:", fetchError);
      return;
    }
    
    console.log("📊 Machines de l'utilisateur après création:", userMachines);
    console.log("📊 Nombre de machines:", userMachines?.length || 0);
    
    return data;
    
  } catch (err) {
    console.error("❌ Erreur générale:", err);
  }
};

// Lancer le test
createTestMachine(); 