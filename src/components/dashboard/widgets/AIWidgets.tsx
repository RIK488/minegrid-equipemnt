import React from 'react';
import { Brain, Zap, Target, TrendingUp, Lightbulb, Settings } from 'lucide-react';
import AIInsightsWidget from './AIInsightsWidget';
import AIOptimizationWidget from './AIOptimizationWidget';

// Configuration des widgets IA
export const AIWidgets = {
  widgets: [
    {
      id: 'ai-insights',
      title: 'Insights IA',
      description: 'Analyses et recommandations intelligentes basées sur vos données',
      icon: Brain,
      component: AIInsightsWidget,
      category: 'ai',
      size: 'medium',
      defaultSize: '1/2',
      features: [
        'Prédictions de ventes',
        'Recommandations d\'actions',
        'Insights automatiques',
        'Analyse de performance'
      ]
    },
    {
      id: 'ai-optimization',
      title: 'Optimisation IA',
      description: 'Suggestions d\'amélioration automatiques pour vos annonces',
      icon: Zap,
      component: AIOptimizationWidget,
      category: 'ai',
      size: 'medium',
      defaultSize: '1/2',
      features: [
        'Optimisation SEO',
        'Ajustement des prix',
        'Amélioration du contenu',
        'Stratégies marketing'
      ]
    }
  ],

  // Méthodes utilitaires pour les widgets IA
  getWidgetById: (id: string) => {
    return AIWidgets.widgets.find(widget => widget.id === id);
  },

  getWidgetsByCategory: (category: string) => {
    return AIWidgets.widgets.filter(widget => widget.category === category);
  },

  getAllWidgets: () => {
    return AIWidgets.widgets;
  },

  // Configuration des catégories IA
  categories: {
    ai: {
      name: 'Intelligence Artificielle',
      description: 'Widgets alimentés par l\'IA pour optimiser vos performances',
      icon: Brain,
      color: 'orange'
    }
  },

  // Configuration des fonctionnalités IA
  features: {
    predictions: {
      name: 'Prédictions',
      description: 'Analyse prédictive des ventes et performances',
      icon: TrendingUp
    },
    recommendations: {
      name: 'Recommandations',
      description: 'Suggestions d\'actions basées sur l\'IA',
      icon: Target
    },
    insights: {
      name: 'Insights',
      description: 'Découvertes automatiques dans vos données',
      icon: Lightbulb
    },
    optimization: {
      name: 'Optimisation',
      description: 'Améliorations automatiques suggérées',
      icon: Settings
    }
  }
};

export default AIWidgets; 