// Configuration des dashboards extraite d'EnterpriseDashboard.tsx

export const dashboardConfigs = {
  vendeur: {
    title: 'Dashboard Vendeur',
    description: 'Tableau de bord pour les vendeurs d\'équipements',
    widgets: [
      {
        id: 'daily-actions',
        type: 'daily-actions',
        title: 'Actions Prioritaires du Jour',
        size: 'large',
        position: { x: 0, y: 0, w: 12, h: 8 }
      },
      {
        id: 'performance-score',
        type: 'performance',
        title: 'Score de Performance',
        size: 'medium',
        position: { x: 0, y: 8, w: 6, h: 6 }
      },
      {
        id: 'inventory-status',
        type: 'inventory',
        title: 'Plan d\'action stock & revente',
        size: 'large',
        position: { x: 6, y: 8, w: 12, h: 8 }
      },
      {
        id: 'sales-evolution',
        type: 'chart',
        title: 'Évolution des ventes',
        chartType: 'line' as const,
        size: 'large',
        position: { x: 0, y: 16, w: 12, h: 6 }
      },
      {
        id: 'leads-pipeline',
        type: 'list',
        title: 'Pipeline des prospects',
        size: 'medium',
        position: { x: 12, y: 16, w: 6, h: 6 }
      }
    ]
  },
  
  loueur: {
    title: 'Dashboard Loueur',
    description: 'Tableau de bord pour les loueurs d\'équipements',
    widgets: [
      {
        id: 'rental-revenue',
        type: 'metric',
        title: 'Revenus location',
        size: 'small',
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        id: 'active-deliveries',
        type: 'metric',
        title: 'Livraisons actives',
        size: 'small',
        position: { x: 3, y: 0, w: 3, h: 2 }
      },
      {
        id: 'equipment-usage',
        type: 'chart',
        title: 'Utilisation des équipements',
        chartType: 'bar' as const,
        size: 'medium',
        position: { x: 6, y: 0, w: 6, h: 4 }
      },
      {
        id: 'upcoming-rentals',
        type: 'list',
        title: 'Locations à venir',
        size: 'medium',
        position: { x: 0, y: 2, w: 6, h: 4 }
      }
    ]
  },
  
  transitaire: {
    title: 'Dashboard Transitaire',
    description: 'Tableau de bord pour les transitaires',
    widgets: [
      {
        id: 'custom-declarations',
        type: 'metric',
        title: 'Déclarations douanières',
        size: 'small',
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        id: 'warehouse-occupancy',
        type: 'metric',
        title: 'Taux d\'occupation',
        size: 'small',
        position: { x: 3, y: 0, w: 3, h: 2 }
      },
      {
        id: 'import-export-stats',
        type: 'chart',
        title: 'Statistiques Import/Export',
        chartType: 'pie' as const,
        size: 'medium',
        position: { x: 6, y: 0, w: 6, h: 4 }
      },
      {
        id: 'gps-tracking',
        type: 'list',
        title: 'Suivi GPS',
        size: 'medium',
        position: { x: 0, y: 2, w: 6, h: 4 }
      }
    ]
  },
  
  transporteur: {
    title: 'Dashboard Transporteur',
    description: 'Tableau de bord pour les transporteurs',
    widgets: [
      {
        id: 'active-deliveries',
        type: 'metric',
        title: 'Livraisons actives',
        size: 'small',
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        id: 'transport-costs',
        type: 'chart',
        title: 'Coûts de transport',
        chartType: 'bar' as const,
        size: 'medium',
        position: { x: 3, y: 0, w: 6, h: 4 }
      },
      {
        id: 'driver-schedule',
        type: 'list',
        title: 'Planning chauffeurs',
        size: 'medium',
        position: { x: 0, y: 2, w: 6, h: 4 }
      }
    ]
  },
  
  mecanicien: {
    title: 'Dashboard Mécanicien',
    description: 'Tableau de bord pour les mécaniciens',
    widgets: [
      {
        id: 'repair-status',
        type: 'list',
        title: 'Statut des réparations',
        size: 'medium',
        position: { x: 0, y: 0, w: 6, h: 4 }
      },
      {
        id: 'spare-parts-stock',
        type: 'list',
        title: 'Stock pièces détachées',
        size: 'medium',
        position: { x: 6, y: 0, w: 6, h: 4 }
      },
      {
        id: 'service-revenue',
        type: 'chart',
        title: 'Revenus services',
        chartType: 'bar' as const,
        size: 'medium',
        position: { x: 0, y: 4, w: 6, h: 4 }
      },
      {
        id: 'intervention-schedule',
        type: 'list',
        title: 'Planning interventions',
        size: 'medium',
        position: { x: 6, y: 4, w: 6, h: 4 }
      }
    ]
  },
  
  financier: {
    title: 'Dashboard Financier',
    description: 'Tableau de bord pour les financiers',
    widgets: [
      {
        id: 'active-projects',
        type: 'metric',
        title: 'Projets actifs',
        size: 'small',
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        id: 'portfolio-value',
        type: 'metric',
        title: 'Valeur portefeuille',
        size: 'small',
        position: { x: 3, y: 0, w: 3, h: 2 }
      },
      {
        id: 'roi-analysis',
        type: 'chart',
        title: 'Analyse ROI',
        chartType: 'bar' as const,
        size: 'medium',
        position: { x: 6, y: 0, w: 6, h: 4 }
      },
      {
        id: 'documents',
        type: 'list',
        title: 'Documents en attente',
        size: 'medium',
        position: { x: 0, y: 2, w: 6, h: 4 }
      }
    ]
  }
};

export const getDashboardConfig = (userType: string) => {
  return dashboardConfigs[userType as keyof typeof dashboardConfigs] || dashboardConfigs.vendeur;
};

export const getUserTypes = () => {
  return Object.keys(dashboardConfigs);
}; 