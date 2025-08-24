import { supabaseClient } from '../utils/supabaseClient';

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'prediction' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  data?: any;
  createdAt: Date;
}

export interface AIPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: '7d' | '30d' | '90d';
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export interface AIRecommendation {
  id: string;
  category: 'sales' | 'inventory' | 'performance' | 'marketing';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  roi?: number;
  actions: string[];
  priority: number;
}

class AIWidgetService {
  private sessionId: string;

  constructor() {
    this.sessionId = `ai_session_${Date.now()}`;
  }

  // 🧠 ANALYSE PRÉDICTIVE DES VENTES
  async getSalesPredictions(userId: string): Promise<AIPrediction[]> {
    try {
      // Récupération des données historiques
      const { data: salesData, error } = await supabaseClient
        .from('machines')
        .select('*')
        .eq('sellerId', userId);

      if (error) throw error;

      // Analyse des tendances (simulation IA)
      const predictions: AIPrediction[] = [
        {
          metric: 'Ventes mensuelles',
          currentValue: this.calculateCurrentSales(salesData),
          predictedValue: this.predictNextMonthSales(salesData),
          confidence: 0.85,
          timeframe: '30d',
          trend: 'up',
          factors: ['Saisonnalité positive', 'Nouveaux prospects', 'Optimisation SEO']
        },
        {
          metric: 'Taux de conversion',
          currentValue: this.calculateConversionRate(salesData),
          predictedValue: this.predictConversionRate(salesData),
          confidence: 0.78,
          timeframe: '30d',
          trend: 'stable',
          factors: ['Qualité des leads', 'Prix compétitifs', 'Support client']
        }
      ];

      return predictions;
    } catch (error) {
      console.error('Erreur prédictions ventes:', error);
      return [];
    }
  }

  // 🎯 RECOMMANDATIONS INTELLIGENTES
  async getAIRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      const { data: userData, error } = await supabaseClient
        .from('machines')
        .select('*')
        .eq('sellerId', userId);

      if (error) throw error;

      const recommendations: AIRecommendation[] = [];

      // Analyse du stock
      const stockAnalysis = this.analyzeStock(userData);
      if (stockAnalysis.hasDormantStock) {
        recommendations.push({
          id: 'stock_optimization',
          category: 'inventory',
          title: 'Optimisation du stock dormant',
          description: `${stockAnalysis.dormantCount} équipements en stock depuis plus de 60 jours`,
          impact: 'high',
          effort: 'medium',
          roi: 0.25,
          actions: [
            'Réduire les prix de 15%',
            'Booster la visibilité Premium',
            'Créer des offres flash',
            'Contacter les prospects qualifiés'
          ],
          priority: 1
        });
      }

      // Analyse des performances
      const performanceAnalysis = this.analyzePerformance(userData);
      if (performanceAnalysis.lowVisibility) {
        recommendations.push({
          id: 'visibility_boost',
          category: 'marketing',
          title: 'Amélioration de la visibilité',
          description: 'Vos annonces ont une visibilité inférieure à la moyenne',
          impact: 'high',
          effort: 'low',
          roi: 0.40,
          actions: [
            'Optimiser les titres SEO',
            'Ajouter plus de photos',
            'Compléter les descriptions',
            'Activer la promotion Premium'
          ],
          priority: 2
        });
      }

      // Analyse des ventes
      const salesAnalysis = this.analyzeSales(userData);
      if (salesAnalysis.needsFollowUp) {
        recommendations.push({
          id: 'follow_up_system',
          category: 'sales',
          title: 'Système de suivi client',
          description: `${salesAnalysis.pendingLeads} prospects nécessitent un suivi`,
          impact: 'medium',
          effort: 'low',
          roi: 0.30,
          actions: [
            'Envoyer des emails de relance',
            'Planifier des appels de suivi',
            'Créer des devis personnalisés',
            'Offrir des démonstrations'
          ],
          priority: 3
        });
      }

      return recommendations.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      console.error('Erreur recommandations IA:', error);
      return [];
    }
  }

  // 🔍 INSIGHTS INTELLIGENTS
  async getAIInsights(userId: string): Promise<AIInsight[]> {
    try {
      const { data: userData, error } = await supabaseClient
        .from('machines')
        .select('*')
        .eq('sellerId', userId);

      if (error) throw error;

      const insights: AIInsight[] = [];

      // Analyse des patterns de vente
      const salesPatterns = this.analyzeSalesPatterns(userData);
      if (salesPatterns.bestPerformingCategory) {
        insights.push({
          id: 'best_category',
          type: 'recommendation',
          title: 'Catégorie performante détectée',
          description: `Les ${salesPatterns.bestPerformingCategory} génèrent ${salesPatterns.performanceGain}% plus de vues`,
          confidence: 0.92,
          priority: 'high',
          action: 'Augmenter l\'inventaire de cette catégorie',
          data: salesPatterns,
          createdAt: new Date()
        });
      }

      // Détection d'opportunités
      const opportunities = this.detectOpportunities(userData);
      if (opportunities.hasOpportunity) {
        insights.push({
          id: 'market_opportunity',
          type: 'prediction',
          title: 'Opportunité de marché identifiée',
          description: opportunities.description,
          confidence: 0.78,
          priority: 'medium',
          action: 'Analyser la concurrence et ajuster les prix',
          data: opportunities,
          createdAt: new Date()
        });
      }

      // Alertes de performance
      const alerts = this.generatePerformanceAlerts(userData);
      alerts.forEach(alert => {
        insights.push({
          id: `alert_${Date.now()}`,
          type: 'alert',
          title: alert.title,
          description: alert.description,
          confidence: alert.confidence,
          priority: alert.priority,
          action: alert.action,
          data: alert.data,
          createdAt: new Date()
        });
      });

      return insights;
    } catch (error) {
      console.error('Erreur insights IA:', error);
      return [];
    }
  }

  // 📊 OPTIMISATION AUTOMATIQUE
  async getOptimizationSuggestions(userId: string): Promise<any[]> {
    try {
      const { data: userData, error } = await supabaseClient
        .from('machines')
        .select('*')
        .eq('sellerId', userId);

      if (error) throw error;

      const suggestions = [];

      // Optimisation des prix
      const priceOptimization = this.suggestPriceOptimization(userData);
      if (priceOptimization.hasOptimization) {
        suggestions.push({
          type: 'price_optimization',
          title: 'Optimisation des prix suggérée',
          description: priceOptimization.description,
          actions: priceOptimization.actions,
          expectedImpact: priceOptimization.expectedImpact
        });
      }

      // Optimisation du SEO
      const seoOptimization = this.suggestSEOOptimization(userData);
      if (seoOptimization.hasOptimization) {
        suggestions.push({
          type: 'seo_optimization',
          title: 'Optimisation SEO recommandée',
          description: seoOptimization.description,
          actions: seoOptimization.actions,
          expectedImpact: seoOptimization.expectedImpact
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Erreur suggestions optimisation:', error);
      return [];
    }
  }

  // 🔧 MÉTHODES PRIVÉES D'ANALYSE

  private calculateCurrentSales(data: any[]): number {
    // Simulation du calcul des ventes actuelles
    return data.length * 15000; // Prix moyen estimé
  }

  private predictNextMonthSales(data: any[]): number {
    // Simulation de prédiction basée sur les tendances
    const currentSales = this.calculateCurrentSales(data);
    return currentSales * 1.15; // +15% prédit
  }

  private calculateConversionRate(data: any[]): number {
    // Simulation du taux de conversion
    return 0.12; // 12%
  }

  private predictConversionRate(data: any[]): number {
    // Simulation de prédiction du taux de conversion
    return 0.14; // 14% prédit
  }

  private analyzeStock(data: any[]): any {
    const dormantCount = data.filter(item => 
      new Date(item.created_at).getTime() < Date.now() - (60 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      hasDormantStock: dormantCount > 0,
      dormantCount,
      totalStock: data.length
    };
  }

  private analyzePerformance(data: any[]): any {
    // Simulation d'analyse de performance
    return {
      lowVisibility: data.length > 5, // Si plus de 5 annonces, potentiellement faible visibilité
      averageViews: 45,
      targetViews: 100
    };
  }

  private analyzeSales(data: any[]): any {
    // Simulation d'analyse des ventes
    return {
      needsFollowUp: data.length > 0,
      pendingLeads: Math.floor(data.length * 0.3),
      conversionRate: 0.12
    };
  }

  private analyzeSalesPatterns(data: any[]): any {
    // Simulation d'analyse des patterns de vente
    return {
      bestPerformingCategory: 'Excavatrices',
      performanceGain: 25,
      trend: 'up'
    };
  }

  private detectOpportunities(data: any[]): any {
    // Simulation de détection d'opportunités
    return {
      hasOpportunity: data.length > 3,
      description: 'Marché en croissance détecté pour les équipements de construction',
      marketGrowth: 0.18
    };
  }

  private generatePerformanceAlerts(data: any[]): any[] {
    const alerts = [];

    if (data.length === 0) {
      alerts.push({
        title: 'Aucune annonce active',
        description: 'Créez votre première annonce pour commencer à vendre',
        confidence: 1.0,
        priority: 'critical',
        action: 'Créer une annonce',
        data: { type: 'no_listings' }
      });
    }

    if (data.length > 10) {
      alerts.push({
        title: 'Inventaire important',
        description: 'Vous avez beaucoup d\'équipements en stock. Considérez des promotions.',
        confidence: 0.85,
        priority: 'medium',
        action: 'Créer des promotions',
        data: { type: 'high_inventory' }
      });
    }

    return alerts;
  }

  private suggestPriceOptimization(data: any[]): any {
    // Simulation de suggestions d'optimisation des prix
    return {
      hasOptimization: data.length > 0,
      description: 'Ajustement des prix recommandé basé sur l\'analyse du marché',
      actions: [
        'Analyser les prix de la concurrence',
        'Ajuster les prix de 5-10%',
        'Créer des offres promotionnelles'
      ],
      expectedImpact: 'Augmentation des ventes de 15-20%'
    };
  }

  private suggestSEOOptimization(data: any[]): any {
    // Simulation de suggestions d'optimisation SEO
    return {
      hasOptimization: data.length > 0,
      description: 'Amélioration du référencement recommandée',
      actions: [
        'Optimiser les titres avec des mots-clés',
        'Ajouter des descriptions détaillées',
        'Utiliser des tags pertinents',
        'Améliorer la qualité des photos'
      ],
      expectedImpact: 'Augmentation de la visibilité de 30-40%'
    };
  }
}

export const aiWidgetService = new AIWidgetService(); 