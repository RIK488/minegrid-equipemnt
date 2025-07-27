// Script pour forcer le chargement des widgets du métier "loueur"
// Exécuter ce script dans la console du navigateur pour activer les widgets loueur

console.log('🚀 Activation des widgets du métier "Loueur d\'engins"...');

// 1. Importer la configuration des widgets loueur
import { LoueurWidgets } from './src/pages/widgets/LoueurWidgets.js';

// 2. Configuration forcée pour le métier loueur
const forcedLoueurConfig = {
  metier: 'loueur',
  dashboardConfig: {
    widgets: [
      {
        id: 'rental-revenue',
        type: 'metric',
        title: 'Revenus de location',
        description: 'Chiffre d\'affaires des locations',
        icon: 'DollarSign',
        enabled: true,
        dataSource: 'rental-revenue',
        isCollapsed: false,
        position: 0
      },
      {
        id: 'equipment-availability',
        type: 'equipment',
        title: 'Disponibilité Équipements',
        description: 'État de disponibilité des équipements',
        icon: 'Building2',
        enabled: true,
        dataSource: 'equipment-availability',
        isCollapsed: false,
        position: 1
      },
      {
        id: 'equipment-usage',
        type: 'chart',
        title: 'Utilisation équipements',
        description: 'Taux d\'utilisation des équipements',
        icon: 'TrendingUp',
        enabled: true,
        dataSource: 'equipment-usage',
        isCollapsed: false,
        position: 2
      },
      {
        id: 'upcoming-rentals',
        type: 'calendar',
        title: 'Locations à venir',
        description: 'Planning des locations et réservations',
        icon: 'Calendar',
        enabled: true,
        dataSource: 'upcoming-rentals',
        isCollapsed: false,
        position: 3
      },
      {
        id: 'preventive-maintenance',
        type: 'maintenance',
        title: 'Maintenance préventive',
        description: 'Planning des maintenances préventives',
        icon: 'Wrench',
        enabled: true,
        dataSource: 'preventive-maintenance',
        isCollapsed: false,
        position: 4
      },
      {
        id: 'delivery-map',
        type: 'map',
        title: 'Carte des livraisons',
        description: 'Suivi GPS des livraisons en cours',
        icon: 'MapPin',
        enabled: true,
        dataSource: 'delivery-map',
        isCollapsed: false,
        position: 5
      },
      {
        id: 'rental-pipeline',
        type: 'pipeline',
        title: 'Pipeline de location',
        description: 'Suivi des demandes de location par étape',
        icon: 'Users',
        enabled: true,
        dataSource: 'rental-pipeline',
        isCollapsed: false,
        position: 6
      },
      {
        id: 'rental-contracts',
        type: 'list',
        title: 'Contrats de location',
        description: 'Gestion des contrats et documents',
        icon: 'FileText',
        enabled: true,
        dataSource: 'rental-contracts',
        isCollapsed: false,
        position: 7
      },
      {
        id: 'delivery-schedule',
        type: 'calendar',
        title: 'Planning des livraisons',
        description: 'Organisation des livraisons et retours',
        icon: 'Truck',
        enabled: true,
        dataSource: 'delivery-schedule',
        isCollapsed: false,
        position: 8
      },
      {
        id: 'rental-analytics',
        type: 'chart',
        title: 'Analytics de location',
        description: 'KPIs et analyses détaillées',
        icon: 'BarChart3',
        enabled: true,
        dataSource: 'rental-analytics',
        isCollapsed: false,
        position: 9
      },
      {
        id: 'daily-actions',
        type: 'daily-actions',
        title: 'Actions prioritaires du jour',
        description: 'Tâches urgentes pour la gestion des locations',
        icon: 'Target',
        enabled: true,
        dataSource: 'daily-actions',
        isCollapsed: false,
        position: 10
      },
      {
        id: 'rental-notifications',
        type: 'notifications',
        title: 'Notifications de location',
        description: 'Alertes et notifications importantes',
        icon: 'Bell',
        enabled: true,
        dataSource: 'rental-notifications',
        isCollapsed: false,
        position: 11
      }
    ],
    theme: 'light',
    layout: 'grid',
    refreshInterval: 30,
    notifications: true
  },
  layouts: {
    lg: [
      // Layout pour les widgets loueur - disposition optimisée
      { i: 'rental-revenue', x: 0, y: 0, w: 3, h: 2 },
      { i: 'equipment-availability', x: 3, y: 0, w: 3, h: 2 },
      { i: 'equipment-usage', x: 6, y: 0, w: 6, h: 4 },
      { i: 'upcoming-rentals', x: 0, y: 2, w: 6, h: 4 },
      { i: 'preventive-maintenance', x: 6, y: 4, w: 6, h: 4 },
      { i: 'delivery-map', x: 0, y: 6, w: 6, h: 4 },
      { i: 'rental-pipeline', x: 6, y: 8, w: 6, h: 4 },
      { i: 'rental-contracts', x: 0, y: 10, w: 6, h: 4 },
      { i: 'delivery-schedule', x: 6, y: 12, w: 6, h: 4 },
      { i: 'rental-analytics', x: 0, y: 14, w: 6, h: 4 },
      { i: 'daily-actions', x: 6, y: 16, w: 6, h: 4 },
      { i: 'rental-notifications', x: 0, y: 18, w: 6, h: 4 }
    ]
  },
  savedAt: new Date().toISOString()
};

// 3. Sauvegarder la configuration forcée
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(forcedLoueurConfig));

// 4. Nettoyer les anciennes configurations
localStorage.removeItem('enterpriseDashboardConfig_vendeur');
localStorage.removeItem('enterpriseDashboardConfig_loueur');

// 5. Sauvegarder aussi spécifiquement pour le métier loueur
localStorage.setItem('enterpriseDashboardConfig_loueur', JSON.stringify(forcedLoueurConfig));

console.log('✅ Configuration des widgets loueur sauvegardée !');
console.log('📋 Widgets configurés :', forcedLoueurConfig.dashboardConfig.widgets.length);
console.log('🔄 Rechargez la page pour voir les widgets loueur');

// 6. Afficher les détails de la configuration
console.log('📊 Détails de la configuration :', {
  metier: forcedLoueurConfig.metier,
  widgets: forcedLoueurConfig.dashboardConfig.widgets.map(w => ({
    id: w.id,
    title: w.title,
    type: w.type,
    position: w.position
  })),
  layout: forcedLoueurConfig.layouts.lg.length + ' éléments de layout'
});

// 7. Instructions pour l'utilisateur
console.log('🎯 Pour voir les widgets loueur :');
console.log('1. Rechargez la page (F5 ou Ctrl+R)');
console.log('2. Allez sur #entreprise pour configurer');
console.log('3. Sélectionnez le métier "Loueur d\'engins"');
console.log('4. Les widgets loueur devraient maintenant apparaître');

// 8. Vérification de la sauvegarde
const savedConfig = localStorage.getItem('enterpriseDashboardConfig');
if (savedConfig) {
  const parsed = JSON.parse(savedConfig);
  console.log('✅ Vérification : Configuration sauvegardée avec succès');
  console.log('📋 Métier configuré :', parsed.metier);
  console.log('📊 Nombre de widgets :', parsed.dashboardConfig.widgets.length);
} else {
  console.error('❌ Erreur : Configuration non sauvegardée');
} 