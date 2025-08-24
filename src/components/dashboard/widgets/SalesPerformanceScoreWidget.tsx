import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getSalesPerformanceData } from '../../../utils/api';
import { apiCall, showNotification } from '../../../services/apiService';

interface SalesPerformanceScoreData {
  score: number;
  target: number;
  rank: number;
  totalVendors: number;
  sales: number;
  salesTarget: number;
  growth: number;
  growthTarget: number;
  prospects: number;
  activeProspects: number;
  responseTime: number;
  responseTarget: number;
  activityLevel?: string;
  activityRecommendation?: string;
  recommendations: Array<{
    type?: string;
    action: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  trends: {
    sales: string;
    growth: string;
    prospects: string;
    responseTime: string;
  };
}

// Composant Score de Performance Commerciale avec toutes les fonctionnalités (copié depuis EnterpriseDashboard)
const SalesPerformanceScoreWidget = ({ data }: { data: any }) => {
  console.log("✅ Composant SalesPerformanceScoreWidget monté");
  console.log("📊 Données reçues:", data);

  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour charger les vraies données depuis Supabase
  const loadRealData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des données réelles depuis Supabase...");
      
      const performanceData = await getSalesPerformanceData();
      console.log("✅ Données réelles chargées:", performanceData);
      
      setRealData(performanceData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données réelles:", error);
      // En cas d'erreur, on garde les données simulées
    } finally {
      setLoading(false);
    }
  };

  // Charger les données réelles au montage du composant
  useEffect(() => {
    loadRealData();
  }, []);

  // Utiliser les données réelles si disponibles, sinon les données simulées
  const displayData = realData || data;

  // Protection contre les données null/undefined
  if (!displayData) {
    console.log("⚠️ Données manquantes, utilisation des valeurs par défaut");
    data = {
      score: 0,
      target: 85,
      rank: 1,
      totalVendors: 1,
      sales: 0,
      salesTarget: 3000000,
      growth: 0,
      growthTarget: 15,
      prospects: 0,
      activeProspects: 0,
      responseTime: 2.5,
      responseTarget: 1.5,
      activityLevel: 'modéré',
      activityRecommendation: 'Analyser les opportunités d\'amélioration',
      recommendations: [
        {
          action: 'Commencer à collecter des données',
          impact: 'Ajoutez vos premières ventes et prospects pour obtenir des recommandations personnalisées',
          priority: 'high' as const
        },
        {
          action: 'Définir vos objectifs',
          impact: 'Configurez vos objectifs de vente pour mesurer votre progression',
          priority: 'medium' as const
        },
        {
          action: 'Optimiser votre processus',
          impact: 'Améliorez votre temps de réponse aux prospects',
          priority: 'low' as const
        }
      ],
      trends: {
        sales: 'stable',
        growth: 'stable',
        prospects: 'stable',
        responseTime: 'stable'
      }
    };
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Fonction pour gérer l'action du bouton Agir avec réactivité maximale
  const handleRecommendationAction = (recommendation: any) => {
    // Feedback visuel immédiat
    const button = event?.target as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
    }

    console.log(`🔄 Action recommandation: ${recommendation.action}`);
    
    // Action immédiate
    showNotification('success', `Action recommandée : ${recommendation.action}`);
    
    // Appel API en arrière-plan (sans await)
    setTimeout(() => {
      apiCall('POST', '/api/recommendations/execute', {
        recommendationId: recommendation.id,
        action: recommendation.action
      }).catch(error => {
        console.error('Erreur API recommandation:', error);
      });
    }, 50);

    // Restaurer le bouton immédiatement après l'action
    setTimeout(() => {
      if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    }, 100);
  };

  const [showQuickActions, setShowQuickActions] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Score de Performance Commerciale</h3>
          <p className="text-sm text-gray-600">
            {loading ? 'Chargement des données réelles...' : realData ? 'Données en temps réel' : 'Données simulées'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          )}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(displayData.score)} ${getScoreColor(displayData.score)}`}>
            Rang {displayData.rank}/{displayData.totalVendors}
          </div>
        </div>
      </div>

      {/* Score Principal */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {/* Jauge circulaire */}
          <div className="w-32 h-32 mx-auto relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Cercle de fond */}
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              {/* Cercle de progression */}
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(displayData.score / 100) * 339.292} 339.292`}
                strokeLinecap="round"
                className={`${getScoreBarColor(displayData.score)} transition-all duration-1000`}
              />
            </svg>
            {/* Score au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(displayData.score)}`}>{displayData.score}</div>
                <div className="text-sm text-gray-500">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Objectif */}
        <div className="mt-4">
          <div className="text-sm text-gray-600">Objectif mensuel</div>
          <div className="text-lg font-semibold text-gray-900">{displayData.target}/100</div>
          <div className="text-sm text-gray-500">
            {displayData.score >= displayData.target ? '✅ Objectif atteint' : `${displayData.target - displayData.score} points à gagner`}
          </div>
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ventes</span>
            <span className={`text-sm font-medium ${getTrendColor(displayData.trends.sales)}`}>{getTrendIcon(displayData.trends.sales)}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{formatCurrency(displayData.sales)}</div>
          <div className="text-xs text-gray-500">{Math.round((displayData.sales / displayData.salesTarget) * 100)}% de l'objectif</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Croissance</span>
            <span className={`text-sm font-medium ${getTrendColor(displayData.trends.growth)}`}>{getTrendIcon(displayData.trends.growth)}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">+{displayData.growth}%</div>
          <div className="text-xs text-gray-500">Objectif: +{displayData.growthTarget}%</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Prospects</span>
            <span className={`text-sm font-medium ${getTrendColor(displayData.trends.prospects)}`}>{getTrendIcon(displayData.trends.prospects)}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{displayData.activeProspects}/{displayData.prospects}</div>
          <div className="text-xs text-gray-500">Actifs</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Réactivité</span>
            <span className={`text-sm font-medium ${getTrendColor(displayData.trends.responseTime)}`}>{getTrendIcon(displayData.trends.responseTime)}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{displayData.responseTime}h</div>
          <div className="text-xs text-gray-500">Objectif: {displayData.responseTarget}h</div>
        </div>
      </div>

      {/* Recommandations IA */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Recommandations IA pour améliorer votre score
          </h4>
          <button
            className="p-1 text-orange-500 hover:text-orange-700 transition-colors"
            onClick={() => setShowQuickActions((v) => !v)}
            title={showQuickActions ? 'Fermer' : 'Ouvrir'}
          >
            {showQuickActions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {showQuickActions && (
          <div className="space-y-2">
            {displayData.recommendations.map((rec: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{rec.action}</div>
                  <div className="text-xs text-gray-500">Impact: {rec.impact}</div>
                </div>
                <button
                  className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                  onClick={() => handleRecommendationAction(rec)}
                >
                  Agir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barre de progression vers l'objectif */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progression vers l'objectif</span>
          <span className="font-medium text-gray-900">{displayData.score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-1000 ${getScoreBarColor(displayData.score)}`} style={{ width: `${displayData.score}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceScoreWidget; 