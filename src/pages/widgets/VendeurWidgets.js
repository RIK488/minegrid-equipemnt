import React from 'react';
import { DollarSign, TrendingUp, Package, Calendar, Target, Users, AlertTriangle, BarChart3 } from 'lucide-react';

// Widgets pour le métier Vendeur avec toutes les améliorations demandées
export const VendeurWidgets = {
  metier: 'Vendeur',
  description: 'Vente d\'équipements et matériels avec IA et recommandations avancées',
  widgets: [
    {
      id: 'sales-metrics',
      type: 'performance',
      title: 'Score de Performance Commerciale',
      description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA',
      icon: Target,
      dataSource: 'sales-performance-score',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        aiRecommendations: true,
        benchmarking: true
      }
    },
    {
      id: 'sales-evolution',
      type: 'chart',
      title: 'Évolution des ventes enrichie',
      description: 'Courbe avec benchmarking secteur, notifications automatiques, actions rapides',
      icon: TrendingUp,
      dataSource: 'sales-evolution',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        sectorComparison: true,
        autoNotifications: true,
        quickActions: true
      }
    },
    {
      id: 'stock-status',
      type: 'pipeline',
      title: 'Pipeline Commercial',
      description: 'Assistant prospection active avec alertes de relance, score de probabilité, actions intelligentes',
      icon: Users,
      dataSource: 'sales-pipeline',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        autoReminders: true,
        probabilityScoring: true,
        smartActions: true
      }
    },

    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions Commerciales Prioritaires',
      description: 'Actions du jour triées par impact/priorité avec contacts rapides et actions interactives',
      icon: AlertTriangle,
      dataSource: 'daily-actions',
      features: {
        periodSelector: false,
        export: false,
        analytics: false,
        alerts: true,
        aiGenerated: true,
        dynamicContent: true,
        stickyDisplay: true
      }
    },
    {
      id: 'monthly-sales',
      type: 'metric',
      title: 'Ventes du mois (Legacy)',
      description: 'Chiffre d\'affaires, nombre de ventes, export, etc.',
      icon: DollarSign,
      dataSource: 'monthly-sales',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      description: 'Planning des locations et réservations',
      icon: Calendar,
      dataSource: 'upcoming-rentals',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'sales-analytics',
      type: 'analytics',
      title: 'Analytics commerciales avancées',
      description: 'KPIs détaillés, tendances, prévisions',
      icon: BarChart3,
      dataSource: 'sales-analytics',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        forecasting: true,
        trendAnalysis: true
      }
    }
  ]
};

export default VendeurWidgets; 