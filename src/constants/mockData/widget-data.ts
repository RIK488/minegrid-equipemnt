import { chartData } from './charts';
import { dailyActionsData } from './daily-actions';
import { inventoryData } from './inventory';
import { listData } from './lists';
import { metricData } from './metrics';
import { performanceData } from './performance';
import { salesAnalyticsData } from './sales-analytics';

// Fonction pour obtenir les données selon le type de widget
export const getWidgetData = (widgetId: string, dataSource?: string) => {
  // Métriques
  if (metricData[widgetId as keyof typeof metricData]) {
    return metricData[widgetId as keyof typeof metricData];
  }

  // Graphiques
  if (chartData[widgetId]) {
    return chartData[widgetId];
  }

  // Listes
  if (listData[widgetId]) {
    // Cas spécial : stock-status utilise les données du pipeline commercial
    if (widgetId === 'stock-status') {
      return listData['sales-pipeline'];
    }
    return listData[widgetId];
  }

  // Actions quotidiennes
  if (widgetId === 'daily-actions' || dataSource === 'daily-actions') {
    return dailyActionsData;
  }

  // Inventaire
  if (inventoryData[widgetId as keyof typeof inventoryData]) {
    return inventoryData[widgetId as keyof typeof inventoryData];
  }

  // Performances
  if (performanceData[widgetId as keyof typeof performanceData]) {
    return performanceData[widgetId as keyof typeof performanceData];
  }

  // Analytics commerciales
  if (widgetId === 'sales-analytics' || dataSource === 'sales-analytics') {
    return salesAnalyticsData;
  }

  // Fallback
  return null;
};
