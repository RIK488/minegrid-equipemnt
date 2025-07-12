import React from 'react';

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

const SalesPerformanceScoreWidget: React.FC<{ data: Partial<SalesPerformanceScoreData> }> = ({ data }) => {
  const safeData = {
    score: data?.score || 0,
    target: data?.target || 85,
    rank: data?.rank || 1,
    totalVendors: data?.totalVendors || 1,
    sales: data?.sales || 0,
    salesTarget: data?.salesTarget || 3000000,
    growth: data?.growth || 0,
    growthTarget: data?.growthTarget || 15,
    prospects: data?.prospects || 0,
    activeProspects: data?.activeProspects || 0,
    responseTime: data?.responseTime || 2.5,
    responseTarget: data?.responseTarget || 1.5,
    activityLevel: data?.activityLevel || 'modéré',
    activityRecommendation: data?.activityRecommendation || 'Analyser les opportunités d\'amélioration',
    recommendations: data?.recommendations || [
      {
        action: 'Commencer à collecter des données',
        impact: '+10 points',
        priority: 'high',
      },
      {
        action: 'Définir vos objectifs',
        impact: '+5 points',
        priority: 'medium',
      },
      {
        action: 'Optimiser votre processus',
        impact: '+3 points',
        priority: 'low',
      },
    ],
    trends: data?.trends || {
      sales: 'stable',
      growth: 'stable',
      prospects: 'stable',
      responseTime: 'stable',
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-orange-600';
    if (score >= 60) return 'text-orange-500';
    return 'text-orange-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-orange-500';
    if (score >= 60) return 'bg-orange-400';
    return 'bg-orange-300';
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'élevé': return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30';
      case 'modéré': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'faible': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/10';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-orange-600';
      case 'down': return 'text-orange-400';
      case 'stable': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'low': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/10';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* En-tête avec score principal */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Score de Performance Commerciale</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Votre performance globale avec recommandations IA</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(safeData.score)}`}>
            {safeData.score}/100
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Objectif: {safeData.target}/100
          </div>
        </div>
      </div>

      {/* Jauge circulaire animée */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Cercle de fond */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Cercle de progression */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - safeData.score / 100)}`}
              className={`${getScoreBarColor(safeData.score)} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(safeData.score)}`}>{safeData.score}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression vers l'objectif */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progression vers l'objectif</span>
          <span className="text-gray-600 dark:text-gray-400">{Math.round((safeData.score / safeData.target) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(safeData.score)}`}
            style={{ width: `${Math.min((safeData.score / safeData.target) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Rang anonymisé */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Rang parmi les vendeurs (anonymisé)
          </span>
          <span className="text-lg font-bold text-orange-900 dark:text-orange-100">
            {safeData.rank}/{safeData.totalVendors}
          </span>
        </div>
      </div>

      {/* Niveau d'activité recommandé */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Niveau d'activité recommandé
            </span>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              {safeData.activityRecommendation}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityLevelColor(safeData.activityLevel)}`}>
            {safeData.activityLevel}
          </div>
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Ventes</span>
            <span className={`text-sm ${getTrendColor(safeData.trends.sales)}`}>{getTrendIcon(safeData.trends.sales)}</span>
          </div>
          <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">{formatCurrency(safeData.sales)}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Objectif: {formatCurrency(safeData.salesTarget)}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Croissance</span>
            <span className={`text-sm ${getTrendColor(safeData.trends.growth)}`}>{getTrendIcon(safeData.trends.growth)}</span>
          </div>
          <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">{safeData.growth}%</div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Objectif: {safeData.growthTarget}%</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Prospects</span>
            <span className={`text-sm ${getTrendColor(safeData.trends.prospects)}`}>{getTrendIcon(safeData.trends.prospects)}</span>
          </div>
          <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">{safeData.prospects}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Actifs: {safeData.activeProspects}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Réactivité</span>
            <span className={`text-sm ${getTrendColor(safeData.trends.responseTime)}`}>{getTrendIcon(safeData.trends.responseTime)}</span>
          </div>
          <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">{safeData.responseTime === 0 ? 'Aucune donnée' : `${safeData.responseTime}h`}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Objectif: {safeData.responseTarget}h</div>
        </div>
      </div>

      {/* Recommandations IA */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
          Recommandations IA pour améliorer votre score
        </h4>
        <div className="space-y-2">
          {safeData.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{rec.action}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Impact: {rec.impact}</div>
              </div>
              <button className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors">
                Agir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceScoreWidget; 