import { ChartData } from '../../types/dashboardTypes';

// Données pour les graphiques
export const chartData: { [key: string]: ChartData[] } = {
  'sales-evolution': [
    { name: 'Jan', value: 125000, CA: 125000, Ventes: 8, Prévision: 120000 },
    { name: 'Fév', value: 145000, CA: 145000, Ventes: 10, Prévision: 140000 },
    { name: 'Mar', value: 138000, CA: 138000, Ventes: 9, Prévision: 135000 },
    { name: 'Avr', value: 162000, CA: 162000, Ventes: 12, Prévision: 150000 },
    { name: 'Mai', value: 178000, CA: 178000, Ventes: 13, Prévision: 165000 },
    { name: 'Juin', value: 195000, CA: 195000, Ventes: 15, Prévision: 180000 },
    { name: 'Juil', value: 182000, CA: 182000, Ventes: 14, Prévision: 175000 },
    { name: 'Août', value: 168000, CA: 168000, Ventes: 12, Prévision: 170000 },
    { name: 'Sep', value: 185000, CA: 185000, Ventes: 14, Prévision: 180000 },
    { name: 'Oct', value: 203000, CA: 203000, Ventes: 16, Prévision: 195000 },
    { name: 'Nov', value: 218000, CA: 218000, Ventes: 17, Prévision: 210000 },
    { name: 'Déc', value: 245000, CA: 245000, Ventes: 19, Prévision: 230000 }
  ],
  'equipment-usage': [
    { name: 'CAT 320D', value: 85 },
    { name: 'JCB 3CX', value: 72 },
    { name: 'Komatsu PC200', value: 68 },
    { name: 'CAT 950GC', value: 45 },
    { name: 'JCB 4CX', value: 38 }
  ],
  'transport-costs': [
    { name: 'Jan', value: 15000 },
    { name: 'Fév', value: 18000 },
    { name: 'Mar', value: 16500 },
    { name: 'Avr', value: 22000 },
    { name: 'Mai', value: 19500 },
    { name: 'Juin', value: 25000 }
  ],
  'import-export-stats': [
    { name: 'Import', value: 45 },
    { name: 'Export', value: 32 }
  ],
  'supply-chain-kpis': [
    { name: 'Délai livraison', value: 3.2 },
    { name: 'Taux service', value: 95 },
    { name: 'Coût stockage', value: 12500 }
  ],
  'service-revenue': [
    { name: 'Maintenance', value: 45000 },
    { name: 'Réparation', value: 32000 },
    { name: 'Inspection', value: 18000 },
    { name: 'Formation', value: 12000 }
  ],
  'roi-analysis': [
    { name: 'CAT 320D', value: 18.5 },
    { name: 'JCB 3CX', value: 22.3 },
    { name: 'Komatsu PC200', value: 15.8 },
    { name: 'CAT 950GC', value: 25.1 }
  ],
  'market-trends': [
    { name: 'Pelles hydrauliques', value: 1250000, trend: 'up' },
    { name: 'Chargeuses-pelleteuses', value: 450000, trend: 'stable' },
    { name: 'Pelles mécaniques', value: 680000, trend: 'down' },
    { name: 'Chargeurs sur pneus', value: 1200000, trend: 'up' },
    { name: 'Bulldozers', value: 950000, trend: 'up' }
  ],
  'sales-analytics': [
    { name: 'Jan', value: 1250000, target: 1200000 },
    { name: 'Fév', value: 1450000, target: 1400000 },
    { name: 'Mar', value: 1380000, target: 1350000 },
    { name: 'Avr', value: 1620000, target: 1500000 },
    { name: 'Mai', value: 1780000, target: 1650000 },
    { name: 'Juin', value: 1950000, target: 1800000 }
  ]
};
