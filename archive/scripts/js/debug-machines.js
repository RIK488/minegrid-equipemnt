// Script de débogage pour vérifier les machines dans Supabase
// À exécuter dans la console du navigateur sur ton site

console.log("🔍 Début du débogage des machines...");

// 1. Vérifier l'utilisateur connecté
async function debugUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log("👤 Session:", session);
    console.log("👤 Utilisateur:", session?.user);
    console.log("🆔 ID utilisateur:", session?.user?.id);
    return session?.user;
  } catch (err) {
    console.error("❌ Erreur récupération utilisateur:", err);
    return null;
  }
}

// 2. Vérifier toutes les machines dans la base
async function debugAllMachines() {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*');
    
    console.log("📊 Toutes les machines:", data);
    console.log("📊 Nombre total de machines:", data?.length || 0);
    
    if (data && data.length > 0) {
      console.log("📋 Détail des sellerId:");
      data.forEach((machine, index) => {
        console.log(`  Machine ${index + 1}:`, {
          id: machine.id,
          name: machine.name,
          sellerId: machine.sellerId,
          created_at: machine.created_at
        });
      });
    }
    
    return data;
  } catch (err) {
    console.error("❌ Erreur récupération machines:", err);
    return null;
  }
}

// 3. Vérifier les machines d'un utilisateur spécifique
async function debugUserMachines(userId) {
  if (!userId) {
    console.log("⚠️ Pas d'ID utilisateur fourni");
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('sellerId', userId);
    
    console.log(`📊 Machines pour l'utilisateur ${userId}:`, data);
    console.log(`📊 Nombre de machines pour cet utilisateur:`, data?.length || 0);
    
    return data;
  } catch (err) {
    console.error("❌ Erreur récupération machines utilisateur:", err);
    return null;
  }
}

// Exécuter le débogage
async function runDebug() {
  console.log("🚀 Lancement du débogage...");
  
  const user = await debugUser();
  await debugAllMachines();
  
  if (user) {
    await debugUserMachines(user.id);
  }
  
  console.log("✅ Débogage terminé");
}

// Lancer le débogage
runDebug(); 