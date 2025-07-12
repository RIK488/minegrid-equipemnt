import React from 'react';
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

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ 
  widget, 
  widgetSize = 'medium',
  onAction 
}) => {
  // Récupérer les données pour ce widget
  const rawData = getWidgetData(widget.id, widget.dataSource);

  // Fonctions de transformation des données pour les widgets avancés
  const getSalesPerformanceData = () => {
    if (rawData && typeof rawData === 'object' && 'revenue' in rawData) {
      return {
        score: 75,
        target: 85,
        rank: 3,
        totalVendors: 12,
        sales: rawData.revenue || 0,
        salesTarget: 3000000,
        growth: rawData.growth || 0,
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
          sales: { value: rawData.revenue || 0, target: 3000000, trend: 'up' as const },
          growth: { value: rawData.growth || 0, target: 15, trend: 'up' as const },
          prospects: { value: 18, target: 25, trend: 'stable' as const },
          responseTime: { value: 2.5, target: 1.5, trend: 'down' as const }
        }
      };
    }
    return null;
  };

  const getSalesPipelineData = () => {
    if (Array.isArray(rawData)) {
      return rawData;
    }
    // Données par défaut pour le pipeline
    return [
      {
        id: '1',
        title: 'Entreprise BTP Maroc',
        status: 'Qualifié',
        priority: 'high' as const,
        value: 450000,
        probability: 75,
        nextAction: 'Proposition commerciale',
        lastContact: '2024-01-18',
        assignedTo: 'Ahmed Benali',
        stage: 'Qualification',
        company: 'Entreprise BTP Maroc'
      },
      {
        id: '2',
        title: 'Construction Atlas',
        status: 'En négociation',
        priority: 'medium' as const,
        value: 320000,
        probability: 60,
        nextAction: 'Relance téléphonique',
        lastContact: '2024-01-17',
        assignedTo: 'Fatima Zahra',
        stage: 'Négociation',
        company: 'Construction Atlas'
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
      if (widget.id === 'sales-metrics') {
        return <SalesPerformanceScoreWidget data={getSalesPerformanceData()} />;
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
        return <SalesPipelineWidget data={getSalesPipelineData() as any} />;
      }
      if (widget.id === 'stock-status') {
        // Utiliser le widget avancé d'inventaire s'il existe
        return (
          <ListWidget 
            widget={widget} 
            data={rawData as any[]} 
            widgetSize={widgetSize as any}
            onAction={handleWidgetAction}
          />
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