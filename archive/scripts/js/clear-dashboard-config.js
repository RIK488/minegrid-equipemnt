// Script pour nettoyer la configuration du tableau de bord
// et forcer le rechargement avec les nouveaux widgets

console.log('🧹 Nettoyage de la configuration du tableau de bord...');

// Supprimer la configuration sauvegardée
localStorage.removeItem('enterpriseDashboardConfig');

console.log('✅ Configuration supprimée du localStorage');
console.log('🔄 Rechargez la page pour voir les nouveaux widgets');

// Afficher les widgets disponibles dans VendeurWidgets
console.log('📋 Widgets disponibles dans VendeurWidgets:');
console.log([
  'sales-metrics',
  'sales-evolution', 
  'stock-status',
  'sales-pipeline',
  'daily-actions', // Nouveau widget
  'monthly-sales',
  'upcoming-rentals',
  'sales-analytics'
]);

alert('Configuration nettoyée ! Rechargez la page pour voir le nouveau widget "Actions Commerciales Prioritaires".');

// Configuration par défaut pour le métier "vendeur d'engins"
const defaultConfig = {
  companyName: 'Entreprise Test',
  siret: '12345678901234',
  address: '123 Rue Test, 75001 Paris',
  phone: '01 23 45 67 89',
  email: 'test@entreprise.com',
  contactPerson: 'M. Test',
  employeeCount: '10-50',
  mainActivity: 'Vendeur d\'engins',
  selectedModules: ['Gestion de stock', 'Fiches techniques auto', 'Statistiques de vente', 'Bons de commande'],
  budget: '5000-10000',
  timeline: '1-3 mois',
  additionalInfo: '',
  dashboardConfig: {
    widgets: [
      {
        id: 'sales-metrics',
        type: 'performance',
        title: 'Score de Performance Commerciale',
        description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA',
        icon: 'Target',
        dataSource: 'sales_performance',
        enabled: true,
        isCollapsed: false,
        position: 1
      },
      {
        id: 'inventory-status',
        type: 'list',
        title: 'Plan d\'action stock & revente',
        description: 'Produits en rupture et à commander',
        icon: 'Package',
        dataSource: 'inventory',
        enabled: true,
        isCollapsed: false,
        position: 2
      },
      {
        id: 'sales-chart',
        type: 'chart',
        title: 'Évolution des ventes',
        description: 'Analyse des tendances, prévisions et export',
        icon: 'TrendingUp',
        dataSource: 'sales-evolution',
        enabled: true,
        isCollapsed: false,
        position: 3
      },
      {
        id: 'leads-pipeline',
        type: 'list',
        title: 'Pipeline commercial',
        description: 'Prospects et opportunités',
        icon: 'Target',
        dataSource: 'leads',
        enabled: true,
        isCollapsed: false,
        position: 4
      }
    ],
    theme: 'light',
    layout: 'grid',
    refreshInterval: 30,
    notifications: true
  }
};

// Sauvegarder la configuration par défaut
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(defaultConfig));
localStorage.setItem('selectedMetier', 'vendeur');

console.log('✅ Configuration restaurée avec le widget "Score de Performance Commerciale"');
console.log('🔄 Rechargement de la page...');

// Recharger la page
window.location.reload(); 