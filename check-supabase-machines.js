// Script pour vérifier les machines dans Supabase
// Copie ce code dans la console du navigateur (F12)

console.log("🔍 Vérification des machines dans Supabase...");

// 1. Vérifier l'utilisateur connecté
const checkUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log("👤 Utilisateur connecté:", session?.user?.id);
  return session?.user;
};

// 2. Vérifier toutes les machines
const checkAllMachines = async () => {
  const { data, error } = await supabase.from('machines').select('*');
  
  if (error) {
    console.error("❌ Erreur:", error);
    return;
  }
  
  console.log("📊 Toutes les machines:", data);
  console.log("📊 Nombre total:", data?.length || 0);
  
  if (data && data.length > 0) {
    data.forEach((machine, i) => {
      console.log(`  Machine ${i+1}:`, {
        id: machine.id,
        name: machine.name,
        sellerId: machine.sellerId,
        created_at: machine.created_at
      });
    });
  }
  
  return data;
};

// 3. Vérifier les machines de l'utilisateur connecté
const checkUserMachines = async (userId) => {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('sellerId', userId);
  
  if (error) {
    console.error("❌ Erreur:", error);
    return;
  }
  
  console.log(`📊 Machines pour l'utilisateur ${userId}:`, data);
  console.log(`📊 Nombre pour cet utilisateur:`, data?.length || 0);
  
  return data;
};

// Exécuter les vérifications
const runCheck = async () => {
  const user = await checkUser();
  await checkAllMachines();
  
  if (user) {
    await checkUserMachines(user.id);
  }
  
  console.log("✅ Vérification terminée");
};

// Lancer la vérification
runCheck(); 