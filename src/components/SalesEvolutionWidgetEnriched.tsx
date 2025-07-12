import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Megaphone, PlusCircle, Pencil, Brain } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  month: string;
  sales: number;
  target: number;
  previousYear: number;
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  action?: string;
}

interface AISuggestion {
  id: string;
  type: 'optimization' | 'alert' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface BenchmarkData {
  sector: string;
  average: number;
  top25: number;
  yourPerformance: number;
}

interface Props {
  data?: any[]; // ou le vrai type si tu l'as
}

const SalesEvolutionWidgetEnriched: React.FC<Props> = ({ data }) => {
  console.log('✅ SalesEvolutionWidgetEnriched chargé');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'target' | 'previousYear'>('sales');
  const [showDetails, setShowDetails] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);

  // Données par défaut si pas de données réelles
  const defaultData: SalesData[] = [
    { month: 'Jan', sales: 42000, target: 50000, previousYear: 45000 },
    { month: 'Fév', sales: 48000, target: 55000, previousYear: 48000 },
    { month: 'Mar', sales: 52000, target: 60000, previousYear: 52000 },
    { month: 'Avr', sales: 58000, target: 65000, previousYear: 55000 },
    { month: 'Mai', sales: 62000, target: 70000, previousYear: 58000 },
    { month: 'Juin', sales: 68000, target: 75000, previousYear: 62000 },
  ];

  useEffect(() => {
    // Simulation de chargement des données
    setTimeout(() => {
      // Ici tu peux remplacer par un vrai appel API
      setSalesData(defaultData);
      setLoading(false);
      
      // Génération des notifications automatiques
      generateNotifications();
      
      // Génération des suggestions IA
      generateAISuggestions();
      
      // Chargement des données de benchmark
      loadBenchmarkData();
    }, 1000);
  }, []);

  const generateNotifications = () => {
    const currentMonth = defaultData[defaultData.length - 1];
    const notifications: Notification[] = [];

    if (currentMonth && currentMonth.sales < currentMonth.target * 0.85) {
      notifications.push({
        id: '1',
        type: 'warning',
        message: `Baisse de ${Math.round(((currentMonth.target - currentMonth.sales) / currentMonth.target) * 100)}% par rapport à l'objectif`,
        action: 'Corriger ce mois'
      });
    }

    if (currentMonth && currentMonth.sales > currentMonth.previousYear * 1.2) {
      notifications.push({
        id: '2',
        type: 'success',
        message: `Croissance de ${Math.round(((currentMonth.sales - currentMonth.previousYear) / currentMonth.previousYear) * 100)}% vs année précédente`,
        action: 'Capitaliser'
      });
    }

    setNotifications(notifications);
  };

  const generateAISuggestions = () => {
    const suggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'optimization',
        title: 'Optimiser les prix de vente',
        description: 'L\'IA suggère une augmentation de 5% des prix pour maximiser les marges',
        impact: 'high'
      },
      {
        id: '2',
        type: 'opportunity',
        title: 'Cibler les clients premium',
        description: 'Focus sur les clients avec un panier moyen > 50k€',
        impact: 'medium'
      },
      {
        id: '3',
        type: 'alert',
        title: 'Réduire les stocks',
        description: 'Liquidité recommandée pour les équipements en stock > 6 mois',
        impact: 'low'
      }
    ];

    setAiSuggestions(suggestions);
  };

  const loadBenchmarkData = () => {
    // Simulation de données de benchmark
    setBenchmarkData({
      sector: 'Équipements BTP',
      average: 65000,
      top25: 85000,
      yourPerformance: salesData[salesData.length - 1]?.sales || 0
    });
  };

  const getMetricColor = (value: number) => {
    if (selectedMetric === 'sales') {
      if (value === 0) return '#6B7280'; // Gris pour les données par défaut
      return value > 70000 ? '#10B981' : value > 50000 ? '#F59E0B' : '#EF4444';
    }
    return '#3B82F6';
  };

  const chartData = {
    labels: salesData.map(d => d.month),
    datasets: [
      {
        label: 'Ventes actuelles',
        data: salesData.map(d => d.sales),
        borderColor: getMetricColor(salesData[salesData.length - 1]?.sales || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Objectif',
        data: salesData.map(d => d.target),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Année précédente',
        data: salesData.map(d => d.previousYear),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des Ventes',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 80000,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'publish_promo':
        alert('Redirection vers la page de publication de promotion...');
        break;
      case 'add_equipment':
        alert('Redirection vers l\'ajout d\'équipement...');
        break;
      case 'correct_month':
        alert('Ouverture du formulaire de correction...');
        break;
      case 'ai_forecast':
        setShowForecast(true);
        break;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Évolution des Ventes
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="sales">Ventes</option>
            <option value="target">Objectif</option>
            <option value="previousYear">Année précédente</option>
          </select>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="mb-6 h-64">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
            }).format(salesData[salesData.length - 1]?.sales || 0)}
          </div>
          <div className="text-sm text-gray-600">Ventes du mois</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {salesData[salesData.length - 1]?.sales > 0 
              ? `${Math.round((salesData[salesData.length - 1]?.sales / salesData[salesData.length - 1]?.target) * 100)}%`
              : '0%'
            }
          </div>
          <div className="text-sm text-gray-600">Objectif atteint</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {salesData[salesData.length - 1]?.sales > 0 && salesData[salesData.length - 1]?.previousYear > 0
              ? `${Math.round(((salesData[salesData.length - 1]?.sales - salesData[salesData.length - 1]?.previousYear) / salesData[salesData.length - 1]?.previousYear) * 100)}%`
              : '0%'
            }
          </div>
          <div className="text-sm text-gray-600">vs année précédente</div>
        </div>
      </div>

      {/* Notifications automatiques */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Notifications</h4>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                notif.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                notif.type === 'success' ? 'bg-green-50 border-green-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{notif.message}</span>
                  {notif.action && (
                    <button
                      onClick={() => handleQuickAction('correct_month')}
                      className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                    >
                      {notif.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions IA */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Suggestions IA</h4>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {suggestion.impact.toUpperCase()}
                      </span>
                      <span className="font-medium text-sm">{suggestion.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmark secteur */}
      {benchmarkData && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Benchmark Secteur</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(benchmarkData.average)}
                </div>
                <div className="text-sm text-gray-600">Moyenne secteur</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(benchmarkData.top25)}
                </div>
                <div className="text-sm text-gray-600">Top 25%</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(benchmarkData.yourPerformance)}
                </div>
                <div className="text-sm text-gray-600">Votre performance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowDetails(true)}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Analyse complète
        </button>
        <button
          onClick={() => setShowForecast(true)}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Prévision IA
        </button>
        <button
          onClick={() => setShowBenchmark(true)}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Benchmark secteur
        </button>
      </div>

      {/* Actions rapides */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Actions rapides</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickAction('publish_promo')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Publier promo
          </button>
          <button
            onClick={() => handleQuickAction('add_equipment')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter équipement
          </button>
          <button
            onClick={() => handleQuickAction('correct_month')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Corriger ce mois
          </button>
          <button
            onClick={() => handleQuickAction('ai_forecast')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <Brain className="w-4 h-4 mr-2" />
            Prévision IA
          </button>
        </div>
      </div>

      {/* Modales (simplifiées) */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Analyse complète des ventes</h3>
            <p className="text-gray-600 mb-4">
              Analyse détaillée des tendances, saisonnalité, et recommandations d'optimisation.
            </p>
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showForecast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Prévision IA</h3>
            <p className="text-gray-600 mb-4">
              Prévisions basées sur l'historique, les tendances du marché et l'IA.
            </p>
            <button
              onClick={() => setShowForecast(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showBenchmark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Benchmark secteur</h3>
            <p className="text-gray-600 mb-4">
              Comparaison détaillée avec les concurrents et le marché.
            </p>
            <button
              onClick={() => setShowBenchmark(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Test de rendu avec données simulées */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-4">Test widget ventes enrichies</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            ✅ Widget enrichi rendu avec succès - {salesData.length} mois de données
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesEvolutionWidgetEnriched; 