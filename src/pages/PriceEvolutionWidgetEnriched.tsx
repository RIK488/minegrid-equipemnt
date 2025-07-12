import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Download, Eye, Target, DollarSign, Percent, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface PriceData {
  month: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
  growth?: number;
  marketShare?: number;
  competitorAverage?: number;
  inflationRate?: number;
  demandIndex?: number;
  supplyIndex?: number;
  priceIndex?: number;
  volatility?: number;
  forecast?: number;
  alerts?: string[];
  insights?: string[];
}

interface PriceEvolutionWidgetEnrichedProps {
  data?: PriceData[];
}

const PriceEvolutionWidgetEnriched: React.FC<PriceEvolutionWidgetEnrichedProps> = ({ data = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | '24m'>('12m');
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'volume' | 'growth' | 'volatility'>('price');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<'trend' | 'comparison' | 'forecast' | 'alerts'>('trend');

  // Données par défaut si aucune donnée n'est fournie
  const defaultData: PriceData[] = [
    { 
      month: 'Jan 2024', 
      averagePrice: 125000, 
      minPrice: 98000, 
      maxPrice: 145000, 
      volume: 45,
      growth: 2.3,
      marketShare: 18.5,
      competitorAverage: 122000,
      inflationRate: 1.8,
      demandIndex: 85,
      supplyIndex: 72,
      priceIndex: 102.3,
      volatility: 8.5,
      forecast: 128000,
      alerts: ['Hausse de la demande', 'Pénurie de pièces'],
      insights: ['Prix 2.5% au-dessus du marché', 'Croissance stable']
    },
    { 
      month: 'Fév 2024', 
      averagePrice: 128500, 
      minPrice: 102000, 
      maxPrice: 148000, 
      volume: 52,
      growth: 2.8,
      marketShare: 19.2,
      competitorAverage: 125000,
      inflationRate: 1.9,
      demandIndex: 88,
      supplyIndex: 70,
      priceIndex: 105.1,
      volatility: 7.8,
      forecast: 131000,
      alerts: ['Augmentation des coûts'],
      insights: ['Positionnement premium confirmé']
    },
    { 
      month: 'Mar 2024', 
      averagePrice: 132000, 
      minPrice: 105000, 
      maxPrice: 152000, 
      volume: 48,
      growth: 2.7,
      marketShare: 19.8,
      competitorAverage: 128000,
      inflationRate: 2.0,
      demandIndex: 92,
      supplyIndex: 68,
      priceIndex: 108.2,
      volatility: 9.2,
      forecast: 134500,
      alerts: ['Pression concurrentielle'],
      insights: ['Écart prix-marché se creuse']
    },
    { 
      month: 'Avr 2024', 
      averagePrice: 135500, 
      minPrice: 108000, 
      maxPrice: 155000, 
      volume: 55,
      growth: 2.7,
      marketShare: 20.5,
      competitorAverage: 131000,
      inflationRate: 2.1,
      demandIndex: 95,
      supplyIndex: 65,
      priceIndex: 111.0,
      volatility: 8.9,
      forecast: 137000,
      alerts: ['Tension sur les matières premières'],
      insights: ['Leadership prix consolidé']
    },
    { 
      month: 'Mai 2024', 
      averagePrice: 138000, 
      minPrice: 110000, 
      maxPrice: 158000, 
      volume: 51,
      growth: 1.8,
      marketShare: 21.2,
      competitorAverage: 134000,
      inflationRate: 2.2,
      demandIndex: 89,
      supplyIndex: 71,
      priceIndex: 113.1,
      volatility: 7.5,
      forecast: 139500,
      alerts: ['Stabilisation du marché'],
      insights: ['Équilibre offre-demande']
    },
    { 
      month: 'Juin 2024', 
      averagePrice: 140500, 
      minPrice: 112000, 
      maxPrice: 160000, 
      volume: 58,
      growth: 1.8,
      marketShare: 21.8,
      competitorAverage: 137000,
      inflationRate: 2.3,
      demandIndex: 93,
      supplyIndex: 69,
      priceIndex: 115.2,
      volatility: 8.1,
      forecast: 142000,
      alerts: ['Nouveaux entrants'],
      insights: ['Position dominante maintenue']
    }
  ];

  // Utiliser les données fournies ou les données par défaut
  const workingData = data.length > 0 ? data : defaultData;

  // Filtrer les données selon la période sélectionnée
  const filteredData = useMemo(() => {
    const months = selectedPeriod === '6m' ? 6 : selectedPeriod === '12m' ? 12 : 24;
    return workingData.slice(-months);
  }, [workingData, selectedPeriod]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const avgPrice = filteredData.reduce((sum, item) => sum + item.averagePrice, 0) / filteredData.length;
    const totalVolume = filteredData.reduce((sum, item) => sum + item.volume, 0);
    const avgGrowth = filteredData.reduce((sum, item) => sum + (item.growth || 0), 0) / filteredData.length;
    const avgVolatility = filteredData.reduce((sum, item) => sum + (item.volatility || 0), 0) / filteredData.length;
    const priceChange = ((filteredData[filteredData.length - 1]?.averagePrice || 0) - (filteredData[0]?.averagePrice || 0)) / (filteredData[0]?.averagePrice || 1) * 100;
    const marketPosition = filteredData[filteredData.length - 1]?.averagePrice || 0 > (filteredData[filteredData.length - 1]?.competitorAverage || 0) ? 'Premium' : 'Standard';

    return { avgPrice, totalVolume, avgGrowth, avgVolatility, priceChange, marketPosition };
  }, [filteredData]);

  // Fonctions utilitaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getMetricValue = (item: PriceData) => {
    switch (selectedMetric) {
      case 'price': return item.averagePrice;
      case 'volume': return item.volume;
      case 'growth': return item.growth || 0;
      case 'volatility': return item.volatility || 0;
      default: return item.averagePrice;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'price': return 'Prix Moyen';
      case 'volume': return 'Volume';
      case 'growth': return 'Croissance';
      case 'volatility': return 'Volatilité';
      default: return 'Prix Moyen';
    }
  };

  const getMetricUnit = () => {
    switch (selectedMetric) {
      case 'price': return '€';
      case 'volume': return 'unités';
      case 'growth': return '%';
      case 'volatility': return '%';
      default: return '€';
    }
  };

  const getTrendColor = (value: number) => {
    if (selectedMetric === 'volatility') {
      return value > 10 ? 'text-red-600' : value > 5 ? 'text-yellow-600' : 'text-green-600';
    }
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (value: number) => {
    if (selectedMetric === 'volatility') {
      return value > 10 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />;
    }
    return value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getAlertLevel = (alerts: string[] = []) => {
    if (alerts.length === 0) return { level: 'success', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' };
    if (alerts.length <= 2) return { level: 'warning', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-600' };
    return { level: 'critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Évolution des Prix</h3>
              <p className="text-blue-100 text-sm">Analyse enrichie des prix et tendances</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Afficher les détails"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Exporter les données"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Période</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as '6m' | '12m' | '24m')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6m">6 mois</option>
                <option value="12m">12 mois</option>
                <option value="24m">24 mois</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Métrique</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as 'price' | 'volume' | 'growth' | 'volatility')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="price">Prix Moyen</option>
                <option value="volume">Volume</option>
                <option value="growth">Croissance</option>
                <option value="volatility">Volatilité</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Position:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              stats.marketPosition === 'Premium' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {stats.marketPosition}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Prix Moyen</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(stats.avgPrice)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(stats.priceChange)}
              <span className={`text-sm font-medium ml-1 ${getTrendColor(stats.priceChange)}`}>
                {formatPercentage(stats.priceChange)}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-300 font-medium">Volume Total</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatNumber(stats.totalVolume)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-2">Unités vendues</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">Croissance</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatPercentage(stats.avgGrowth)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">Moyenne mensuelle</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-300 font-medium">Volatilité</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {stats.avgVolatility.toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-300 mt-2">Risque prix</p>
          </div>
        </div>

        {/* Graphique simplifié */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Évolution {getMetricLabel()}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Unité:</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getMetricUnit()}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredData.map((item, index) => {
              const value = getMetricValue(item);
              const maxValue = Math.max(...filteredData.map(getMetricValue));
              const percentage = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
                    {item.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedMetric === 'price' ? formatCurrency(value) : 
                         selectedMetric === 'volume' ? formatNumber(value) : 
                         `${value.toFixed(1)}%`}
                      </span>
                      <div className="flex items-center space-x-1">
                        {item.growth !== undefined && selectedMetric === 'price' && (
                          <>
                            {getTrendIcon(item.growth)}
                            <span className={`text-xs ${getTrendColor(item.growth)}`}>
                              {formatPercentage(item.growth)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedMetric === 'volatility' 
                            ? value > 10 ? 'bg-red-500' : value > 5 ? 'bg-yellow-500' : 'bg-green-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analyse détaillée */}
        {showDetails && (
          <div className="space-y-6">
            {/* Onglets d'analyse */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                {[
                  { id: 'trend', label: 'Tendances', icon: <TrendingUp className="h-4 w-4" /> },
                  { id: 'comparison', label: 'Comparaison', icon: <BarChart3 className="h-4 w-4" /> },
                  { id: 'forecast', label: 'Prévisions', icon: <Target className="h-4 w-4" /> },
                  { id: 'alerts', label: 'Alertes', icon: <AlertTriangle className="h-4 w-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedAnalysis(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedAnalysis === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="min-h-[300px]">
              {selectedAnalysis === 'trend' && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Analyse des Tendances</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2">Évolution Prix</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Le prix moyen a augmenté de {formatPercentage(stats.priceChange)} sur la période sélectionnée.
                        {stats.priceChange > 5 && ' Cette hausse significative reflète une forte demande.'}
                        {stats.priceChange < -5 && ' Cette baisse importante indique une pression concurrentielle.'}
                        {Math.abs(stats.priceChange) <= 5 && ' L\'évolution est stable et maîtrisée.'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2">Volatilité</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        La volatilité moyenne est de {stats.avgVolatility.toFixed(1)}%.
                        {stats.avgVolatility > 10 && ' Attention : volatilité élevée, risque de fluctuation importante.'}
                        {stats.avgVolatility <= 5 && ' Volatilité faible, prix stables.'}
                        {stats.avgVolatility > 5 && stats.avgVolatility <= 10 && ' Volatilité modérée, surveillance recommandée.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedAnalysis === 'comparison' && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Comparaison Marché</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mois</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notre Prix</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Concurrents</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Écart</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Part Marché</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.slice(-6).map((item, index) => {
                          const gap = item.averagePrice - (item.competitorAverage || 0);
                          const gapPercentage = ((item.averagePrice - (item.competitorAverage || 0)) / (item.competitorAverage || 1)) * 100;
                          
                          return (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.month}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{formatCurrency(item.averagePrice)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{formatCurrency(item.competitorAverage || 0)}</td>
                              <td className={`px-4 py-3 text-sm text-right font-medium ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {gap >= 0 ? '+' : ''}{formatCurrency(gap)} ({gapPercentage >= 0 ? '+' : ''}{gapPercentage.toFixed(1)}%)
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{item.marketShare?.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedAnalysis === 'forecast' && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Prévisions et Projections</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2">Prix Prévu (Prochain Mois)</h6>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {formatCurrency(filteredData[filteredData.length - 1]?.forecast || 0)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Basé sur les tendances actuelles et l'analyse des facteurs de marché
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2">Indicateurs de Marché</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Demande:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {filteredData[filteredData.length - 1]?.demandIndex || 0}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Offre:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {filteredData[filteredData.length - 1]?.supplyIndex || 0}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Inflation:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {(filteredData[filteredData.length - 1]?.inflationRate || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedAnalysis === 'alerts' && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Alertes et Insights</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                        Alertes Actuelles
                      </h6>
                      <div className="space-y-2">
                        {filteredData[filteredData.length - 1]?.alerts?.map((alert, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{alert}</span>
                          </div>
                        )) || (
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Aucune alerte critique</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <Info className="h-5 w-5 text-blue-500 mr-2" />
                        Insights
                      </h6>
                      <div className="space-y-2">
                        {filteredData[filteredData.length - 1]?.insights?.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
                          </div>
                        )) || (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Aucun insight disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceEvolutionWidgetEnriched; 