import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Download, Eye, Target } from 'lucide-react';

interface SalesData {
  month: string;
  sales: number;
  target?: number;
  growth?: number;
  units?: number;
  // Propriétés supplémentaires pour compatibilité
  sector_average?: number;
  growth_rate?: number;
  target_achievement?: number;
  sector_comparison?: number;
  trend?: string;
  notifications?: any[];
  ai_suggestions?: string[];
}

interface SalesEvolutionWidgetEnrichedProps {
  data?: SalesData[];
}

const SalesEvolutionWidgetEnriched: React.FC<SalesEvolutionWidgetEnrichedProps> = ({ data = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | '24m'>('12m');
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'units' | 'growth'>('sales');

  // Données par défaut si aucune donnée n'est fournie
  const defaultData: SalesData[] = [
    { month: 'Jan 2024', sales: 1200000, target: 1100000, growth: 9.1, units: 45 },
    { month: 'Fév 2024', sales: 1350000, target: 1200000, growth: 12.5, units: 52 },
    { month: 'Mar 2024', sales: 1420000, target: 1300000, growth: 5.2, units: 38 },
    { month: 'Avr 2024', sales: 1580000, target: 1400000, growth: 11.3, units: 67 },
    { month: 'Mai 2024', sales: 1650000, target: 1500000, growth: 4.4, units: 58 },
    { month: 'Juin 2024', sales: 1720000, target: 1600000, growth: 4.2, units: 72 },
    { month: 'Juil 2024', sales: 1680000, target: 1700000, growth: -2.3, units: 89 },
    { month: 'Août 2024', sales: 1750000, target: 1800000, growth: 4.2, units: 76 },
    { month: 'Sep 2024', sales: 1820000, target: 1900000, growth: 4.0, units: 65 },
    { month: 'Oct 2024', sales: 1880000, target: 2000000, growth: 3.3, units: 82 },
    { month: 'Nov 2024', sales: 1950000, target: 2100000, growth: 3.7, units: 91 },
    { month: 'Déc 2024', sales: 2000000, target: 2200000, growth: 2.6, units: 78 }
  ];

  // Normaliser les données reçues pour s'assurer qu'elles ont les bonnes propriétés
  const normalizeData = (rawData: any[]): SalesData[] => {
    return rawData.map(item => ({
      month: item.month,
      sales: item.sales,
      target: item.target || item.sales * 1.1,
      growth: item.growth || item.growth_rate || 0,
      units: item.units || Math.floor(item.sales / 30000), // Estimation basée sur le CA
      sector_average: item.sector_average,
      growth_rate: item.growth_rate,
      target_achievement: item.target_achievement,
      sector_comparison: item.sector_comparison,
      trend: item.trend,
      notifications: item.notifications,
      ai_suggestions: item.ai_suggestions
    }));
  };

  const chartData = data && data.length > 0 ? normalizeData(data) : defaultData;

  // Filtrer selon la période sélectionnée
  const filteredData = useMemo(() => {
    const periods = { '6m': 6, '12m': 12, '24m': 24 };
    return chartData.slice(-periods[selectedPeriod]);
  }, [chartData, selectedPeriod]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
    const totalUnits = filteredData.reduce((sum, item) => sum + (item.units || 0), 0);
    const avgGrowth = filteredData.reduce((sum, item) => sum + (item.growth || 0), 0) / filteredData.length;
    const avgSales = totalSales / filteredData.length;
    const totalTarget = filteredData.reduce((sum, item) => sum + (item.target || item.sales * 1.1), 0);
    const targetAchievement = (totalSales / totalTarget) * 100;

    return { totalSales, totalUnits, avgGrowth, avgSales, targetAchievement };
  }, [filteredData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-MA').format(num);
  };

  const getMetricValue = (item: SalesData) => {
    switch (selectedMetric) {
      case 'sales': return item.sales;
      case 'units': return item.units || 0;
      case 'growth': return item.growth || 0;
      default: return item.sales;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'sales': return 'Chiffre d\'affaires (MAD)';
      case 'units': return 'Nombre d\'unités vendues';
      case 'growth': return 'Croissance (%)';
      default: return '';
    }
  };

  const getMetricColor = (value: number) => {
    if (selectedMetric === 'growth') {
      return value >= 0 ? '#22c55e' : '#ef4444';
    }
    return '#3b82f6';
  };

  const maxValue = Math.max(...filteredData.map(getMetricValue));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Évolution des Ventes</h3>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '6m' | '12m' | '24m')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
            <option value="24m">24 mois</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'sales' | 'units' | 'growth')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="sales">CA</option>
            <option value="units">Unités</option>
            <option value="growth">Croissance</option>
          </select>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalSales)}</div>
          <div className="text-sm text-gray-600">CA Total</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{formatNumber(stats.totalUnits)}</div>
          <div className="text-sm text-gray-600">Unités Vendues</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.avgSales)}</div>
          <div className="text-sm text-gray-600">CA Moyen</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className={`text-xl font-bold ${stats.avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.avgGrowth >= 0 ? '+' : ''}{stats.avgGrowth.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Croissance</div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900">{getMetricLabel()}</h4>
        </div>

        <div className="h-48 flex items-end justify-between gap-2">
          {filteredData.map((item, index) => {
            const value = getMetricValue(item);
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const color = getMetricColor(value);

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                  title={`${item.month}: ${selectedMetric === 'sales' ? formatCurrency(value) : selectedMetric === 'units' ? formatNumber(value) : `${value}%`}`}
                />
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                  {item.month.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analyse des performances */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h5 className="text-sm font-semibold text-green-800">Meilleur mois</h5>
          </div>
          <div className="text-base font-bold text-green-600">
            {filteredData.reduce((max, item) => item.sales > max.sales ? item : max).month}
          </div>
          <div className="text-sm text-green-700">
            {formatCurrency(filteredData.reduce((max, item) => item.sales > max.sales ? item : max).sales)}
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <h5 className="text-sm font-semibold text-red-800">Mois le plus faible</h5>
          </div>
          <div className="text-base font-bold text-red-600">
            {filteredData.reduce((min, item) => item.sales < min.sales ? item : min).month}
          </div>
          <div className="text-sm text-red-700">
            {formatCurrency(filteredData.reduce((min, item) => item.sales < min.sales ? item : min).sales)}
          </div>
        </div>
      </div>

      {/* Objectifs et actions */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Objectif d'atteinte</h4>
            <div className="text-2xl font-bold text-orange-600">{stats.targetAchievement.toFixed(1)}%</div>
            <div className="text-sm text-orange-700">de l'objectif global</div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Détails
            </button>
            <button className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h5 className="text-sm font-semibold text-gray-900">Détail mensuel</h5>
        </div>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mois</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">CA</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Objectif</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unités</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Croissance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{item.month}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.sales)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.target || item.sales * 1.1)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatNumber(item.units || 0)}</td>
                  <td className={`px-4 py-2 text-sm text-right font-medium ${(item.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(item.growth || 0) >= 0 ? '+' : ''}{item.growth || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesEvolutionWidgetEnriched; 