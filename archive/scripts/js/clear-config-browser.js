// Script à exécuter dans la console du navigateur
console.log('🧹 Nettoyage de la configuration du dashboard...');

// Supprimer la configuration
localStorage.removeItem('enterpriseDashboardConfig');
localStorage.removeItem('dashboardConfig');
localStorage.removeItem('widgetConfig');
localStorage.removeItem('layoutConfig');

console.log('✅ Configuration supprimée');
console.log('🔄 Rechargez la page pour voir les widgets vendeurs restaurés'); 