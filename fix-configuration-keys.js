// Script pour corriger l'incompatibilité des clés localStorage
console.log('🔧 CORRECTION INCOMPATIBILITÉ DES CLÉS LOCALSTORAGE');

// 1. Vérifier l'état actuel
console.log('📊 ÉTAT ACTUEL DES CONFIGURATIONS:');
const allKeys = Object.keys(localStorage);
const dashboardKeys = allKeys.filter(key => 
  key.includes('enterpriseDashboardConfig')
);

console.log('🔍 Clés trouvées:');
dashboardKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`   ${key}: ${value ? '✅ Présent' : '❌ Absent'}`);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      console.log(`      Métier: ${parsed.metier}`);
      console.log(`      Widgets: ${parsed.widgets?.length || 0}`);
    } catch (e) {
      console.log(`      Erreur parsing: ${e.message}`);
    }
  }
});

// 2. Identifier le problème
console.log('🎯 ANALYSE DU PROBLÈME:');
const configGenerale = localStorage.getItem('enterpriseDashboardConfig');
const configLoueur = localStorage.getItem('enterpriseDashboardConfig_loueur');
const configVendeur = localStorage.getItem('enterpriseDashboardConfig_vendeur');

console.log('   Configuration générale (cherchée par EnterpriseDashboard):', configGenerale ? '✅' : '❌');
console.log('   Configuration Loueur (sauvegardée par DashboardConfigurator):', configLoueur ? '✅' : '❌');
console.log('   Configuration Vendeur:', configVendeur ? '✅' : '❌');

// 3. Fonction pour corriger l'incompatibilité
function corrigerIncompatibilite() {
  console.log('🔧 CORRECTION DE L\'INCOMPATIBILITÉ...');
  
  // Chercher la configuration la plus récente
  let configToUse = null;
  let metierToUse = null;
  
  // Priorité 1: Configuration spécifique au métier Loueur
  if (configLoueur) {
    try {
      const parsed = JSON.parse(configLoueur);
      if (parsed.metier === 'loueur') {
        configToUse = parsed;
        metierToUse = 'loueur';
        console.log('✅ Configuration Loueur trouvée et sélectionnée');
      }
    } catch (e) {
      console.log('❌ Erreur parsing config Loueur:', e.message);
    }
  }
  
  // Priorité 2: Configuration spécifique au métier Vendeur
  if (!configToUse && configVendeur) {
    try {
      const parsed = JSON.parse(configVendeur);
      if (parsed.metier === 'vendeur') {
        configToUse = parsed;
        metierToUse = 'vendeur';
        console.log('✅ Configuration Vendeur trouvée et sélectionnée');
      }
    } catch (e) {
      console.log('❌ Erreur parsing config Vendeur:', e.message);
    }
  }
  
  // Priorité 3: Configuration générale
  if (!configToUse && configGenerale) {
    try {
      const parsed = JSON.parse(configGenerale);
      configToUse = parsed;
      metierToUse = parsed.metier || 'vendeur';
      console.log('✅ Configuration générale trouvée et sélectionnée');
    } catch (e) {
      console.log('❌ Erreur parsing config générale:', e.message);
    }
  }
  
  // 4. Appliquer la correction
  if (configToUse) {
    console.log('💾 APPLICATION DE LA CORRECTION...');
    
    // Sauvegarder avec la clé que cherche EnterpriseDashboard
    localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(configToUse));
    
    // Sauvegarder aussi avec la clé spécifique au métier
    localStorage.setItem(`enterpriseDashboardConfig_${metierToUse}`, JSON.stringify(configToUse));
    
    // Sauvegarder le métier sélectionné
    localStorage.setItem('selectedMetier', metierToUse);
    localStorage.setItem('enterpriseDashboardConfigured', 'true');
    
    console.log('✅ Correction appliquée !');
    console.log(`   Métier configuré: ${metierToUse}`);
    console.log(`   Widgets configurés: ${configToUse.widgets?.length || 0}`);
    
    return { config: configToUse, metier: metierToUse };
  } else {
    console.log('❌ Aucune configuration valide trouvée');
    return null;
  }
}

// 5. Fonction pour forcer une configuration spécifique
function forcerConfiguration(metierId) {
  console.log(`🔧 FORÇAGE DE LA CONFIGURATION: ${metierId}`);
  
  // Configuration de base pour chaque métier
  const configurations = {
    loueur: {
      metier: 'loueur',
      widgets: [
        { id: 'rental-revenue', type: 'metric', title: 'Revenus de location', icon: { name: 'DollarSign' }, dataSource: 'rental-revenue', enabled: true },
        { id: 'equipment-availability', type: 'equipment', title: 'Disponibilité Équipements', icon: { name: 'Building2' }, dataSource: 'equipment-availability', enabled: true },
        { id: 'upcoming-rentals', type: 'calendar', title: 'Locations à venir', icon: { name: 'Calendar' }, dataSource: 'upcoming-rentals', enabled: true },
        { id: 'rental-pipeline', type: 'pipeline', title: 'Pipeline de location', icon: { name: 'Users' }, dataSource: 'rental-pipeline', enabled: true },
        { id: 'daily-actions', type: 'daily-actions', title: 'Actions prioritaires du jour', icon: { name: 'Target' }, dataSource: 'daily-actions', enabled: true }
      ],
      layout: { lg: [] },
      theme: 'light',
      refreshInterval: 30,
      notifications: true,
      createdAt: new Date().toISOString()
    },
    vendeur: {
      metier: 'vendeur',
      widgets: [
        { id: 'sales-metrics', type: 'metric', title: 'Score de Performance Commerciale', icon: { name: 'Target' }, dataSource: 'sales_performance', enabled: true },
        { id: 'inventory-status', type: 'list', title: "Plan d'action stock & revente", icon: { name: 'Package' }, dataSource: 'inventory', enabled: true },
        { id: 'sales-evolution', type: 'chart', title: 'Évolution des ventes', icon: { name: 'TrendingUp' }, dataSource: 'sales_history', enabled: true },
        { id: 'leads-pipeline', type: 'pipeline', title: 'Pipeline commercial', icon: { name: 'BarChart3' }, dataSource: 'leads', enabled: true },
        { id: 'daily-actions', type: 'daily-actions', title: 'Actions Commerciales Prioritaires', icon: { name: 'Calendar' }, dataSource: 'daily_actions', enabled: true }
      ],
      layout: { lg: [] },
      theme: 'light',
      refreshInterval: 30,
      notifications: true,
      createdAt: new Date().toISOString()
    }
  };
  
  const config = configurations[metierId];
  if (!config) {
    console.log('❌ Métier non supporté:', metierId);
    return null;
  }
  
  // Sauvegarder avec toutes les clés possibles
  localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(config));
  localStorage.setItem(`enterpriseDashboardConfig_${metierId}`, JSON.stringify(config));
  localStorage.setItem('selectedMetier', metierId);
  localStorage.setItem('enterpriseDashboardConfigured', 'true');
  
  console.log('✅ Configuration forcée !');
  console.log(`   Métier: ${metierId}`);
  console.log(`   Widgets: ${config.widgets.length}`);
  
  return config;
}

// 6. Exécuter la correction automatique
console.log('🚀 EXÉCUTION DE LA CORRECTION AUTOMATIQUE...');
const resultat = corrigerIncompatibilite();

if (resultat) {
  console.log('🎉 CORRECTION RÉUSSIE !');
  console.log('🔄 Rechargez la page pour voir les widgets corrects.');
  console.log(`🌐 URL: http://localhost:5176/#dashboard-entreprise-display`);
} else {
  console.log('⚠️ Aucune configuration trouvée. Utilisez forcerConfiguration("loueur") pour créer une configuration.');
}

// 7. Exposer les fonctions pour test manuel
window.corrigerIncompatibilite = corrigerIncompatibilite;
window.forcerConfiguration = forcerConfiguration;

console.log('🎯 FONCTIONS DISPONIBLES:');
console.log('   corrigerIncompatibilite() - Corriger automatiquement');
console.log('   forcerConfiguration("loueur") - Forcer configuration Loueur');
console.log('   forcerConfiguration("vendeur") - Forcer configuration Vendeur'); 