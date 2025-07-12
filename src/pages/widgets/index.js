// Export centralisé de tous les widgets par métier
export { VendeurWidgets } from './VendeurWidgets';
export { 
  VendeurWidgets as VendeurWidgetsTS,
  PerformanceScoreWidget,
  SalesEvolutionWidget,
  StockActionWidget,
  ProspectionAssistantWidget,
  DailyActionsWidget
} from './VendeurWidgets.tsx';
export { LoueurWidgets } from './LoueurWidgets';
export { MecanicienWidgets } from './MecanicienWidgets';
export { TransporteurWidgets } from './TransporteurWidgets';
export { TransitaireWidgets } from './TransitaireWidgets';
export { FinancierWidgets } from './FinancierWidgets';

// Configuration des métiers disponibles
export const metiersConfig = [
  {
    key: 'vendeur',
    label: 'Vendeur',
    widgetConfig: 'VendeurWidgets',
    description: 'Vente d\'équipements et matériels'
  },
  {
    key: 'loueur',
    label: 'Loueur',
    widgetConfig: 'LoueurWidgets',
    description: 'Location d\'équipements et matériels'
  },
  {
    key: 'mecanicien',
    label: 'Mécanicien / Atelier',
    widgetConfig: 'MecanicienWidgets',
    description: 'Maintenance et réparation d\'équipements'
  },
  {
    key: 'transporteur',
    label: 'Transporteur / Logistique',
    widgetConfig: 'TransporteurWidgets',
    description: 'Transport et livraison d\'équipements'
  },
  {
    key: 'transitaire',
    label: 'Transitaire / Freight Forwarder',
    widgetConfig: 'TransitaireWidgets',
    description: 'Gestion des opérations douanières et logistiques internationales'
  },
  {
    key: 'financier',
    label: 'Financier / Finance',
    widgetConfig: 'FinancierWidgets',
    description: 'Gestion financière et comptabilité'
  }
];

// Fonction utilitaire pour récupérer les widgets d'un métier
export const getWidgetsByMetier = (metierKey) => {
  const metier = metiersConfig.find(m => m.key === metierKey);
  if (!metier) return null;
  
  // Import dynamique des widgets selon le métier
  switch (metierKey) {
    case 'vendeur':
      return require('./VendeurWidgets').VendeurWidgets;
    case 'loueur':
      return require('./LoueurWidgets').LoueurWidgets;
    case 'mecanicien':
      return require('./MecanicienWidgets').MecanicienWidgets;
    case 'transporteur':
      return require('./TransporteurWidgets').TransporteurWidgets;
    case 'transitaire':
      return require('./TransitaireWidgets').TransitaireWidgets;
    case 'financier':
      return require('./FinancierWidgets').FinancierWidgets;
    default:
      return null;
  }
}; 