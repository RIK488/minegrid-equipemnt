// Script pour corriger la redirection du dashboard et forcer les widgets Loueur
console.log('🔧 CORRECTION REDIRECTION DASHBOARD ET WIDGETS LOUEUR');

// 1. Vérifier l'état actuel
console.log('📊 ÉTAT ACTUEL:');
console.log('   URL actuelle:', window.location.href);
console.log('   Hash actuel:', window.location.hash);

// 2. Nettoyer toutes les configurations existantes
console.log('🗑️ Nettoyage des configurations existantes...');
const allKeys = Object.keys(localStorage);
const dashboardKeys = allKeys.filter(key => 
  key.includes('dashboard') || 
  key.includes('widget') || 
  key.includes('config') || 
  key.includes('enterprise') ||
  key.includes('vendeur') ||
  key.includes('metier') ||
  key.includes('selected')
);

dashboardKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('   ✅ Supprimé:', key);
});

// 3. Configuration forcée pour le métier Loueur
const loueurConfig = {
  version: '3.0.0',
  metier: 'loueur',
  widgets: [
    {
      id: 'rental-revenue',
      type: 'metric',
      title: 'Revenus de location',
      description: 'Chiffre d\'affaires des locations',
      icon: { name: 'DollarSign' },
      dataSource: 'rental-revenue',
      enabled: true,
      isCollapsed: false,
      position: 0
    },
    {
      id: 'equipment-availability',
      type: 'equipment',
      title: 'Disponibilité Équipements',
      description: 'État de disponibilité des équipements',
      icon: { name: 'Building2' },
      dataSource: 'equipment-availability',
      enabled: true,
      isCollapsed: false,
      position: 1
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      description: 'Planning des locations et réservations',
      icon: { name: 'Calendar' },
      dataSource: 'upcoming-rentals',
      enabled: true,
      isCollapsed: false,
      position: 2
    },
    {
      id: 'rental-pipeline',
      type: 'pipeline',
      title: 'Pipeline de location',
      description: 'Suivi des demandes de location par étape',
      icon: { name: 'Users' },
      dataSource: 'rental-pipeline',
      enabled: true,
      isCollapsed: false,
      position: 3
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions prioritaires du jour',
      description: 'Tâches urgentes pour la gestion des locations',
      icon: { name: 'Target' },
      dataSource: 'daily-actions',
      enabled: true,
      isCollapsed: false,
      position: 4
    }
  ],
  layout: {
    lg: [
      { i: 'rental-revenue', x: 0, y: 0, w: 3, h: 2 },
      { i: 'equipment-availability', x: 3, y: 0, w: 3, h: 2 },
      { i: 'upcoming-rentals', x: 6, y: 0, w: 6, h: 4 },
      { i: 'rental-pipeline', x: 0, y: 2, w: 6, h: 4 },
      { i: 'daily-actions', x: 6, y: 4, w: 6, h: 2 }
    ]
  },
  theme: 'light',
  refreshInterval: 30,
  notifications: true,
  createdAt: new Date().toISOString(),
  forceInjection: true
};

// 4. Sauvegarder la configuration avec TOUTES les clés possibles
console.log('💾 Sauvegarde de la configuration Loueur...');

// Clé principale (celle que cherche EnterpriseDashboard.tsx)
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(loueurConfig));

// Clé spécifique au métier (celle que sauvegarde DashboardConfigurator)
localStorage.setItem('enterpriseDashboardConfig_loueur', JSON.stringify(loueurConfig));

// Clés de sélection
localStorage.setItem('selectedMetier', 'loueur');
localStorage.setItem('enterpriseDashboardConfigured', 'true');

// Configuration de fallback
localStorage.setItem('dashboardConfig', JSON.stringify(loueurConfig));

console.log('✅ Configuration Loueur sauvegardée avec succès !');
console.log('📊 Widgets configurés:', loueurConfig.widgets.length);

// 5. Vérification
console.log('🔍 Vérification des clés sauvegardées:');
console.log('   enterpriseDashboardConfig:', localStorage.getItem('enterpriseDashboardConfig') ? '✅' : '❌');
console.log('   enterpriseDashboardConfig_loueur:', localStorage.getItem('enterpriseDashboardConfig_loueur') ? '✅' : '❌');
console.log('   selectedMetier:', localStorage.getItem('selectedMetier'));
console.log('   enterpriseDashboardConfigured:', localStorage.getItem('enterpriseDashboardConfigured'));

// 6. Correction de la redirection
console.log('🔧 CORRECTION DE LA REDIRECTION...');

// Si on est sur dashboard-entreprise-display, rediriger vers le bon dashboard
if (window.location.hash === '#dashboard-entreprise-display') {
  console.log('🔄 Redirection vers le bon dashboard...');
  
  // Option 1: Rediriger vers le dashboard principal
  window.location.hash = '#dashboard-entreprise';
  
  // Option 2: Ou forcer le rechargement avec la bonne URL
  // window.location.href = window.location.origin + '/#dashboard-entreprise';
  
  console.log('✅ Redirection appliquée !');
  console.log('🔄 Rechargez la page pour voir les widgets Loueur.');
} else {
  console.log('ℹ️ Pas de redirection nécessaire.');
}

// 7. Afficher les détails
console.log('🎯 Détails de la configuration:');
loueurConfig.widgets.forEach((widget, index) => {
  console.log(`   ${index + 1}. ${widget.title} (${widget.id})`);
});

console.log('🔄 Rechargez la page pour voir les widgets Loueur !');
console.log('🌐 URL recommandée: http://localhost:5176/#dashboard-entreprise');

// 8. Debug supplémentaire
console.log('🐛 DEBUG - Structure de la configuration:');
console.log('   Métier:', loueurConfig.metier);
console.log('   Nombre de widgets:', loueurConfig.widgets.length);
console.log('   Layout défini:', loueurConfig.layout ? 'Oui' : 'Non');
console.log('   Version:', loueurConfig.version);

// 9. Fonction pour tester manuellement
window.testLoueurConfig = function() {
  console.log('🧪 Test de la configuration Loueur...');
  const config = localStorage.getItem('enterpriseDashboardConfig');
  if (config) {
    try {
      const parsed = JSON.parse(config);
      console.log('✅ Configuration trouvée:', parsed.metier);
      console.log('📊 Widgets:', parsed.widgets.length);
      return parsed;
    } catch (e) {
      console.log('❌ Erreur parsing:', e.message);
      return null;
    }
  } else {
    console.log('❌ Aucune configuration trouvée');
    return null;
  }
};

console.log('🎯 FONCTIONS DISPONIBLES:');
console.log('   testLoueurConfig() - Tester la configuration Loueur'); 