// diagnostic-portail-pro.js
// Script de diagnostic pour le portail Pro
console.log('🔍 Diagnostic du portail Pro...');

// 1. Vérifier l'authentification
async function checkAuth() {
  console.log('🔐 Vérification de l\'authentification...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Erreur d\'authentification:', error);
      return false;
    }
    
    if (!user) {
      console.error('❌ Aucun utilisateur connecté');
      return false;
    }
    
    console.log('✅ Utilisateur connecté:', user.email);
    console.log('✅ User ID:', user.id);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification d\'authentification:', error);
    return false;
  }
}

// 2. Vérifier les tables Supabase
async function checkTables() {
  console.log('🗄️ Vérification des tables Supabase...');
  
  const tables = [
    'user_profiles',
    'pro_clients',
    'client_equipment',
    'client_orders',
    'maintenance_interventions',
    'client_notifications'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table} non accessible:`, error.message);
      } else {
        console.log(`✅ Table ${table} accessible`);
      }
    } catch (error) {
      console.error(`❌ Erreur avec la table ${table}:`, error);
    }
  }
}

// 3. Vérifier le profil utilisateur
async function checkUserProfile() {
  console.log('👤 Vérification du profil utilisateur...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('❌ Erreur profil utilisateur:', error.message);
      if (error.code === 'PGRST116') {
        console.log('⚠️ Profil utilisateur inexistant, création nécessaire');
      }
    } else {
      console.log('✅ Profil utilisateur trouvé:', profile);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du profil:', error);
  }
}

// 4. Vérifier le profil Pro
async function checkProProfile() {
  console.log('🏢 Vérification du profil Pro...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: proProfile, error } = await supabase
      .from('pro_clients')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('❌ Erreur profil Pro:', error.message);
      if (error.code === 'PGRST116') {
        console.log('⚠️ Profil Pro inexistant, création nécessaire');
      }
    } else {
      console.log('✅ Profil Pro trouvé:', proProfile);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du profil Pro:', error);
  }
}

// 5. Tester les fonctions API
async function testApiFunctions() {
  console.log('🧪 Test des fonctions API...');
  
  try {
    // Test getProClientProfile
    console.log('📋 Test getProClientProfile...');
    const profile = await getProClientProfile();
    console.log('✅ Profil Pro:', profile);
    
    // Test getClientEquipment
    console.log('📦 Test getClientEquipment...');
    const equipment = await getClientEquipment();
    console.log('✅ Équipements:', equipment?.length || 0);
    
    // Test getClientOrders
    console.log('📋 Test getClientOrders...');
    const orders = await getClientOrders();
    console.log('✅ Commandes:', orders?.length || 0);
    
    // Test getMaintenanceInterventions
    console.log('🔧 Test getMaintenanceInterventions...');
    const interventions = await getMaintenanceInterventions();
    console.log('✅ Interventions:', interventions?.length || 0);
    
    // Test getClientNotifications
    console.log('🔔 Test getClientNotifications...');
    const notifications = await getClientNotifications();
    console.log('✅ Notifications:', notifications?.length || 0);
    
    // Test getPortalStats
    console.log('📊 Test getPortalStats...');
    const stats = await getPortalStats();
    console.log('✅ Statistiques:', stats);
    
  } catch (error) {
    console.error('❌ Erreur lors du test des fonctions API:', error);
  }
}

// 6. Vérifier les logs de la console
function checkConsoleLogs() {
  console.log('📝 Vérification des logs de la console...');
  console.log('🔍 Regardez les logs ci-dessus pour voir les erreurs');
  console.log('🔍 Vérifiez que les fonctions API sont bien importées');
}

// Exécution du diagnostic
async function runDiagnostic() {
  console.log('🚀 Démarrage du diagnostic complet...\n');
  
  // 1. Authentification
  const isAuthenticated = await checkAuth();
  console.log('');
  
  if (!isAuthenticated) {
    console.log('❌ DIAGNOSTIC ARRÊTÉ: Utilisateur non connecté');
    console.log('💡 Solution: Connectez-vous d\'abord');
    return;
  }
  
  // 2. Tables
  await checkTables();
  console.log('');
  
  // 3. Profils
  await checkUserProfile();
  console.log('');
  
  await checkProProfile();
  console.log('');
  
  // 4. Fonctions API
  await testApiFunctions();
  console.log('');
  
  // 5. Logs
  checkConsoleLogs();
  console.log('');
  
  console.log('🎯 DIAGNOSTIC TERMINÉ');
  console.log('📋 Vérifiez les résultats ci-dessus pour identifier le problème');
}

// Lancer le diagnostic
runDiagnostic(); 