import React, { useState, useEffect } from 'react';
import { Widget } from '../../constants/dashboardTypes';
import { getWidgetData } from '../../constants/mockData';

// Import des widgets avancés avec IA
import SalesPerformanceScoreWidget from './widgets/SalesPerformanceScoreWidget';
import SalesPipelineWidget from './widgets/SalesPipelineWidget';
import SalesEvolutionWidgetEnriched from '../../components/SalesEvolutionWidgetEnriched';
import DailyActionsPriorityWidget from './widgets/DailyActionsPriorityWidget';

// Import des widgets basiques (fallback)
import MetricWidget from './widgets/MetricWidget';
import ChartWidget from './widgets/ChartWidget';
import ListWidget from './widgets/ListWidget';
import InventoryWidget from './widgets/InventoryWidget';
import PerformanceWidget from './widgets/PerformanceWidget';
import DailyActionsWidget from './widgets/DailyActionsWidget';
import StockStatusWidget from './widgets/StockStatusWidget';

// Import des widgets spécialisés pour vendeur
import {
  EquipmentCatalogWidget,
  CustomerLeadsWidget,
  QuotesManagementWidget,
  AfterSalesServiceWidget,
  MarketTrendsWidget,
  SalesAnalyticsWidget
} from '../../pages/widgets/VendeurWidgets';

interface WidgetRendererProps {
  widget: Widget;
  widgetSize?: 'small' | 'medium' | 'large';
  onAction?: (action: string, data: any) => void;
}

// Déterminer la taille du texte en fonction de la taille du widget et du type d'élément
function getFontSizeFromWidgetSize(size: string, type: 'title' | 'value' = 'title') {
  if (type === 'value') {
    if (size === '1/3') return 'text-[clamp(1rem,2vw,1.2rem)]';
    if (size === '1/2') return 'text-[clamp(1.1rem,2.5vw,1.5rem)]';
    if (size === '2/3') return 'text-[clamp(1.3rem,3vw,2rem)]';
    if (size === '1/1') return 'text-[clamp(1.5rem,4vw,2.5rem)]';
  } else {
    if (size === '1/3') return 'text-sm md:text-base';
    if (size === '1/2') return 'text-base md:text-lg';
    if (size === '2/3') return 'text-lg md:text-xl';
    if (size === '1/1') return 'text-xl md:text-2xl';
  }
  return 'text-base';
}

// Classe CSS pour l'ellipsis (à ajouter dans le global CSS si besoin)
// .ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

// Composant asynchrone pour le widget de performance commerciale
const SalesPerformanceScoreWidgetAsync: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { getSalesPerformanceData } = await import('../../utils/api');
        const realData = await getSalesPerformanceData();
        setData(realData);
      } catch (err) {
        console.error('Erreur lors du chargement des données de performance:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        // Utiliser des données par défaut en cas d'erreur
        setData({
          score: 75,
          target: 85,
          rank: 3,
          totalVendors: 12,
          sales: 0,
          salesTarget: 3000000,
          growth: 0,
          growthTarget: 15,
          prospects: 25,
          activeProspects: 18,
          responseTime: 2.5,
          responseTarget: 1.5,
          activityLevel: 'modéré',
          activityRecommendation: 'Analyser les opportunités d\'amélioration',
          recommendations: [
            {
              type: 'process',
              action: 'Optimiser le temps de réponse',
              impact: 'Réduire le temps de réponse aux prospects de 2.5h à 1.5h',
              priority: 'high' as const
            }
          ],
          trends: {
            sales: 'up' as const,
            growth: 'up' as const,
            prospects: 'stable' as const,
            responseTime: 'down' as const
          },
          metrics: {
            sales: { value: 0, target: 3000000, trend: 'up' as const },
            growth: { value: 0, target: 15, trend: 'up' as const },
            prospects: { value: 18, target: 25, trend: 'stable' as const },
            responseTime: { value: 2.5, target: 1.5, trend: 'down' as const }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2 text-gray-600">Chargement des données...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return <SalesPerformanceScoreWidget data={data} />;
};

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ 
  widget, 
  widgetSize = 'medium',
  onAction 
}) => {
  // Récupérer les données pour ce widget
  const rawData = getWidgetData(widget.id, widget.dataSource);

  // Déterminer la taille du texte à appliquer
  const fontSizeClass = getFontSizeFromWidgetSize(widget.size || widgetSize);

  // Fonctions de transformation des données pour les widgets avancés
  const getSalesPerformanceData = async () => {
    try {
      // Importer la fonction pour récupérer les vraies données
      const { getSalesPerformanceData } = await import('../../utils/api');
      const realData = await getSalesPerformanceData();
      console.log("📊 Données réelles récupérées pour SalesPerformanceScoreWidget:", realData);
      return realData;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données réelles:", error);
      
      // Données par défaut en cas d'erreur
      const defaultData = {
        score: 75,
        target: 85,
        rank: 3,
        totalVendors: 12,
        sales: 0,
        salesTarget: 3000000,
        growth: 0,
        growthTarget: 15,
        prospects: 25,
        activeProspects: 18,
        responseTime: 2.5,
        responseTarget: 1.5,
        activityLevel: 'modéré',
        activityRecommendation: 'Analyser les opportunités d\'amélioration',
        recommendations: [
          {
            type: 'process',
            action: 'Optimiser le temps de réponse',
            impact: 'Réduire le temps de réponse aux prospects de 2.5h à 1.5h',
            priority: 'high' as const
          },
          {
            type: 'prospection',
            action: 'Augmenter le nombre de prospects',
            impact: 'Passer de 25 à 35 prospects actifs',
            priority: 'medium' as const
          }
        ],
        trends: {
          sales: 'up' as const,
          growth: 'up' as const,
          prospects: 'stable' as const,
          responseTime: 'down' as const
        },
        metrics: {
          sales: { value: 0, target: 3000000, trend: 'up' as const },
          growth: { value: 0, target: 15, trend: 'up' as const },
          prospects: { value: 18, target: 25, trend: 'stable' as const },
          responseTime: { value: 2.5, target: 1.5, trend: 'down' as const }
        }
      };

      // Si rawData existe et a la propriété revenue, on l'utilise
      if (rawData && typeof rawData === 'object' && 'revenue' in rawData) {
        return {
          ...defaultData,
          sales: rawData.revenue || 0,
          growth: rawData.growth || 0,
          metrics: {
            ...defaultData.metrics,
            sales: { value: rawData.revenue || 0, target: 3000000, trend: 'up' as const },
            growth: { value: rawData.growth || 0, target: 15, trend: 'up' as const }
          }
        };
      }

      console.log("📊 Utilisation des données par défaut pour SalesPerformanceScoreWidget");
      return defaultData;
    }
  };

  const getSalesPipelineData = () => {
    if (Array.isArray(rawData)) {
      return rawData;
    }
    // Données par défaut complètes pour le pipeline commercial
    return [
      {
        id: '1',
        title: 'Excavatrice CAT 320',
        status: 'Qualifié',
        priority: 'high' as const,
        value: 850000,
        probability: 85,
        nextAction: 'Envoi devis détaillé',
        lastContact: '2024-01-20',
        assignedTo: 'Ahmed Benali',
        stage: 'Devis',
        company: 'Entreprise BTP Maroc',
        email: 'contact@btp-maroc.ma',
        phone: '+212 5 22 34 56 78'
      },
      {
        id: '2',
        title: 'Chargeuse JCB 3CX',
        status: 'En négociation',
        priority: 'high' as const,
        value: 420000,
        probability: 70,
        nextAction: 'Réunion technique',
        lastContact: '2024-01-19',
        assignedTo: 'Fatima Zahra',
        stage: 'Négociation',
        company: 'Construction Atlas',
        email: 'achat@atlas-construction.ma',
        phone: '+212 5 24 12 34 56'
      },
      {
        id: '3',
        title: 'Bulldozer Komatsu D65',
        status: 'Prospection',
        priority: 'medium' as const,
        value: 1200000,
        probability: 40,
        nextAction: 'Premier contact',
        lastContact: '2024-01-15',
        assignedTo: 'Karim Alami',
        stage: 'Prospection',
        company: 'Mines du Sud',
        email: 'direction@mines-sud.ma',
        phone: '+212 5 28 98 76 54'
      },
      {
        id: '4',
        title: 'Pelle mécanique Volvo EC220',
        status: 'Conclu',
        priority: 'low' as const,
        value: 680000,
        probability: 100,
        nextAction: 'Livraison prévue',
        lastContact: '2024-01-18',
        assignedTo: 'Ahmed Benali',
        stage: 'Conclu',
        company: 'Travaux Publics Plus',
        email: 'commande@tpp.ma',
        phone: '+212 5 26 45 67 89'
      },
      {
        id: '5',
        title: 'Camion benne Mercedes',
        status: 'Perdu',
        priority: 'low' as const,
        value: 280000,
        probability: 0,
        nextAction: 'Archiver le dossier',
        lastContact: '2024-01-10',
        assignedTo: 'Fatima Zahra',
        stage: 'Perdu',
        company: 'Transport Express',
        email: 'info@transport-express.ma',
        phone: '+212 5 22 11 22 33'
      },
      {
        id: '6',
        title: 'Groupe électrogène Perkins',
        status: 'Qualifié',
        priority: 'medium' as const,
        value: 180000,
        probability: 60,
        nextAction: 'Démonstration produit',
        lastContact: '2024-01-16',
        assignedTo: 'Karim Alami',
        stage: 'Devis',
        company: 'Énergie Solutions',
        email: 'technique@energie-solutions.ma',
        phone: '+212 5 25 67 89 01'
      },
      {
        id: '7',
        title: 'Compresseur d\'air Atlas Copco',
        status: 'En négociation',
        priority: 'high' as const,
        value: 320000,
        probability: 75,
        nextAction: 'Négociation prix',
        lastContact: '2024-01-17',
        assignedTo: 'Ahmed Benali',
        stage: 'Négociation',
        company: 'Industries Modernes',
        email: 'achats@industries-modernes.ma',
        phone: '+212 5 23 45 67 89'
      },
      {
        id: '8',
        title: 'Bétonnière mobile',
        status: 'Prospection',
        priority: 'medium' as const,
        value: 95000,
        probability: 30,
        nextAction: 'Présentation catalogue',
        lastContact: '2024-01-12',
        assignedTo: 'Fatima Zahra',
        stage: 'Prospection',
        company: 'Béton Pro',
        email: 'contact@beton-pro.ma',
        phone: '+212 5 27 89 01 23'
      }
    ];
  };

  const getSalesEvolutionData = () => {
    if (Array.isArray(rawData)) {
      return rawData;
    }
    // Données par défaut pour l'évolution des ventes
    return [];
  };

  // Fonction pour gérer les actions des widgets
  const handleWidgetAction = (action: string, actionData: any) => {
    if (onAction) {
      onAction(action, actionData);
    }
    
    // Logique spécifique selon le type d'action
    switch (action) {
      case 'contact':
        console.log('Action contact:', actionData);
        // Ici on pourrait ouvrir un modal de contact, etc.
        break;
      case 'complete':
        console.log('Action complete:', actionData);
        // Ici on pourrait marquer une tâche comme terminée
        break;
      case 'edit':
        console.log('Action edit:', actionData);
        // Ici on pourrait ouvrir un formulaire d'édition
        break;
      case 'delete':
        console.log('Action delete:', actionData);
        // Ici on pourrait supprimer un élément
        break;
      default:
        console.log('Action non reconnue:', action, actionData);
    }
  };

  // Rendre le widget approprié selon son type et ID
  switch (widget.type) {
    // Widgets avancés avec IA - Priorité haute
    case 'performance':
      if (widget.id === 'sales-performance-score') {
        // Utiliser un composant avec état pour gérer les données asynchrones
        return <SalesPerformanceScoreWidgetAsync />;
      }
      return (
        <PerformanceWidget 
          widget={widget} 
          widgetSize={widgetSize as any}
          onShowDetails={() => {}}
        />
      );

    case 'chart':
      if (widget.id === 'sales-evolution') {
        return <SalesEvolutionWidgetEnriched data={getSalesEvolutionData()} />;
      }
      return (
        <ChartWidget 
          widget={widget} 
          data={rawData as any[]} 
          widgetSize={widgetSize as any}
        />
      );

    case 'list':
      if (widget.id === 'sales-pipeline') {
        // Affiche le pipeline commercial
        return (
          <div className="flex-1 overflow-y-auto min-h-0 p-4" style={{ maxHeight: '100%' }}>
            <SalesPipelineWidget data={{ leads: getSalesPipelineData() }} />
          </div>
        );
      }
      if (widget.id === 'stock-status') {
        // Affiche le widget Plan d'action Stock & Revente
        return <StockStatusWidget />;
      }
      return (
        <ListWidget 
          widget={widget} 
          data={rawData as any[]} 
          widgetSize={widgetSize as any}
          onAction={handleWidgetAction}
        />
      );

    case 'pipeline':
      // Cas spécial pour le widget "Pipeline commercial"
      if (widget.id === 'stock-status') {
        // Adapter le mapping pour la version avancée : passer un objet avec la clé 'leads'
        return (
          <div className="flex-1 overflow-y-auto min-h-0 p-4" style={{ maxHeight: '100%' }}>
            <SalesPipelineWidget data={{ leads: getSalesPipelineData() }} />
          </div>
        );
      }
      return (
        <ListWidget 
          widget={widget} 
          data={rawData as any[]} 
          widgetSize={widgetSize as any}
          onAction={handleWidgetAction}
        />
      );

    case 'daily-actions':
      return (
        <DailyActionsPriorityWidget 
          data={rawData as any[]} 
          widgetSize={widgetSize as any}
          onAction={handleWidgetAction}
        />
      );

    case 'metric':
      return (
        <MetricWidget 
          widget={widget} 
          data={rawData as any} 
          widgetSize={widgetSize as any}
        />
      );

    case 'inventory':
      return (
        <InventoryWidget 
          widget={widget} 
          widgetSize={widgetSize as any}
          onShowDetails={() => {}}
        />
      );

    // Widgets spécialisés pour vendeur d'engins
    case 'equipment-catalog':
      return (
        <EquipmentCatalogWidget 
          data={rawData as any[]} 
        />
      );

    case 'customer-leads':
      return (
        <CustomerLeadsWidget 
          data={rawData as any[]} 
        />
      );

    case 'quotes-management':
      return (
        <QuotesManagementWidget 
          data={rawData as any[]} 
        />
      );

    case 'after-sales-service':
      return (
        <AfterSalesServiceWidget 
          data={rawData as any[]} 
        />
      );

    case 'market-trends':
      return (
        <MarketTrendsWidget 
          data={rawData as any[]} 
        />
      );

    case 'sales-analytics':
      return (
        <SalesAnalyticsWidget 
          data={rawData as any[]} 
        />
      );

    default:
      return (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">Type de widget non supporté: {widget.type}</div>
          <div className="text-xs">ID: {widget.id}</div>
        </div>
      );
  }
};

export default WidgetRenderer; 