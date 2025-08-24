import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { aiWidgetService, AIInsight, AIRecommendation, AIPrediction } from '../../../services/aiWidgetService';

interface AIInsightsWidgetProps {
  userId: string;
  widgetSize?: 'small' | 'medium' | 'large';
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ userId, widgetSize = 'medium' }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'predictions'>('insights');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAIData();
  }, [userId]);

  const loadAIData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chargement parallèle des données IA
      const [insightsData, recommendationsData, predictionsData] = await Promise.all([
        aiWidgetService.getAIInsights(userId),
        aiWidgetService.getAIRecommendations(userId),
        aiWidgetService.getSalesPredictions(userId)
      ]);

      setInsights(insightsData);
      setRecommendations(recommendationsData);
      setPredictions(predictionsData);
    } catch (err) {
      console.error('Erreur chargement données IA:', err);
      setError('Erreur lors du chargement des insights IA');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'optimization': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          <span className="text-gray-600">Analyse IA en cours...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Insights IA</h3>
        </div>
        <button
          onClick={loadAIData}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Actualiser les insights"
        >
          <Zap className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <Lightbulb className="w-4 h-4" />
            <span>Insights ({insights.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <Target className="w-4 h-4" />
            <span>Actions ({recommendations.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'predictions'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>Prédictions ({predictions.length})</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {activeTab === 'insights' && (
          <div className="space-y-3">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun insight disponible</p>
                <p className="text-sm">L'IA analysera vos données pour générer des insights</p>
              </div>
            ) : (
              insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <span className="text-xs bg-white px-2 py-1 rounded-full">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm mb-2">{insight.description}</p>
                      {insight.action && (
                        <div className="flex items-center space-x-2 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>{insight.action}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune recommandation disponible</p>
                <p className="text-sm">L'IA analysera vos performances pour suggérer des actions</p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <Target className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(rec.impact)} bg-white`}>
                            Impact: {rec.impact}
                          </span>
                          {rec.roi && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              ROI: {Math.round(rec.roi * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mb-2">{rec.description}</p>
                      <div className="space-y-1">
                        {rec.actions.slice(0, 2).map((action, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                            <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                            <span>{action}</span>
                          </div>
                        ))}
                        {rec.actions.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{rec.actions.length - 2} autres actions...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-3">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune prédiction disponible</p>
                <p className="text-sm">L'IA analysera vos tendances pour générer des prédictions</p>
              </div>
            ) : (
              predictions.map((pred, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{pred.metric}</h4>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(pred.trend)}
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {Math.round(pred.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">Actuel</div>
                      <div className="font-medium">{pred.currentValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Prédit ({pred.timeframe})</div>
                      <div className="font-medium text-green-600">{pred.predictedValue.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Facteurs clés:</div>
                    <div className="flex flex-wrap gap-1">
                      {pred.factors.slice(0, 2).map((factor, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsWidget; 