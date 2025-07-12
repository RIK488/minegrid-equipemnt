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
import { apiService, notificationService, exportService, communicationService } from '../services';

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
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

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
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      
      // TODO: Remplacer par un vrai appel API quand la table sales sera créée
      // const response = await apiService.getSalesData();
      // if (response.success && response.data) {
      //   setSalesData(response.data);
      // } else {
      //   setSalesData(defaultData);
      //   notificationService.warning('Données de vente', 'Utilisation des données par défaut');
      // }
      
      // Pour l'instant, utiliser les données par défaut
      setSalesData(defaultData);
      
      // Génération des notifications automatiques
      generateNotifications();
      
      // Génération des suggestions IA
      generateAISuggestions();
      
      // Chargement des données de benchmark
      loadBenchmarkData();
      
    } catch (error) {
      console.error('Erreur lors du chargement des données de vente:', error);
      notificationService.error('Erreur de chargement', 'Impossible de charger les données de vente');
      setSalesData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = () => {
    const currentMonth = salesData[salesData.length - 1];
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
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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

  // Actions rapides connectées aux services
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'publish_promo':
        await handlePublishPromo();
        break;
      case 'add_equipment':
        await handleAddEquipment();
        break;
      case 'correct_month':
        await handleCorrectMonth();
        break;
      case 'ai_forecast':
        await handleAIForecast();
        break;
      case 'export_data':
        await handleExportData();
        break;
    }
  };

  const handlePublishPromo = async () => {
    try {
      notificationService.info('Création de promotion', 'Ouverture du formulaire de promotion...');
      
      // Ouvrir modal de création de promotion
      setShowPromoModal(true);
      
      // TODO: Implémenter la vraie logique de création de promotion
      // const promotionData = {
      //   title: 'Promotion spéciale',
      //   description: 'Offre limitée sur les équipements',
      //   discount: 15,
      //   startDate: new Date().toISOString(),
      //   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      //   equipmentIds: [],
      //   status: 'active'
      // };
      
      // const response = await apiService.createPromotion(promotionData);
      // if (response.success) {
      //   notificationService.promotionCreated(promotionData.title);
      // } else {
      //   notificationService.apiError('création de promotion', response.error || 'Erreur inconnue');
      // }
      
    } catch (error) {
      notificationService.error('Erreur', 'Impossible de créer la promotion');
    }
  };

  const handleAddEquipment = async () => {
    try {
      notificationService.info('Ajout d\'équipement', 'Redirection vers le formulaire d\'ajout...');
      
      // Ouvrir modal d'ajout d'équipement
      setShowEquipmentModal(true);
      
      // TODO: Implémenter la vraie logique d'ajout d'équipement
      // Rediriger vers la page d'ajout d'équipement ou ouvrir un modal
      
    } catch (error) {
      notificationService.error('Erreur', 'Impossible d\'ajouter l\'équipement');
    }
  };

  const handleCorrectMonth = async () => {
    try {
      notificationService.info('Correction des données', 'Ouverture du formulaire de correction...');
      
      // Ouvrir modal de correction
      setShowCorrectionModal(true);
      
      // TODO: Implémenter la vraie logique de correction
      // const correctionData = {
      //   month: 'Juin',
      //   newSales: 72000,
      //   reason: 'Correction des données de vente'
      // };
      
      // const response = await apiService.updateSalesData(correctionData);
      // if (response.success) {
      //   notificationService.success('Données corrigées', 'Les données de vente ont été mises à jour');
      //   loadSalesData(); // Recharger les données
      // } else {
      //   notificationService.apiError('correction des données', response.error || 'Erreur inconnue');
      // }
      
    } catch (error) {
      notificationService.error('Erreur', 'Impossible de corriger les données');
    }
  };

  const handleAIForecast = async () => {
    try {
      notificationService.aiProcessing();
      
      // Simuler un délai d'analyse IA
      setTimeout(() => {
        setShowForecast(true);
        notificationService.aiCompleted();
      }, 2000);
      
      // TODO: Implémenter la vraie logique de prévision IA
      // const forecastData = await apiService.getAIForecast(salesData);
      // if (forecastData.success) {
      //   setForecastData(forecastData.data);
      //   setShowForecast(true);
      //   notificationService.aiCompleted();
      // } else {
      //   notificationService.apiError('prévision IA', forecastData.error || 'Erreur inconnue');
      // }
      
    } catch (error) {
      notificationService.error('Erreur IA', 'Impossible de générer la prévision');
    }
  };

  const handleExportData = async () => {
    try {
      notificationService.info('Export en cours', 'Génération du rapport...');
      
      const exportData = {
        monthlyData: salesData.map(month => ({
          month: month.month,
          sales: month.sales,
          target: month.target,
          gap: month.target - month.sales,
          achievementRate: Math.round((month.sales / month.target) * 100)
        }))
      };
      
      const result = await exportService.exportSalesEvolution(exportData, { format: 'pdf' });
      
      if (result.success) {
        notificationService.success('Export réussi', `Rapport téléchargé: ${result.filename}`);
      } else {
        notificationService.error('Erreur d\'export', result.error || 'Erreur inconnue');
      }
      
    } catch (error) {
      notificationService.error('Erreur d\'export', 'Impossible d\'exporter les données');
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
          onClick={() => handleQuickAction('ai_forecast')}
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
        <button
          onClick={() => handleQuickAction('export_data')}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Exporter
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
              Analyse détaillée des performances de vente avec recommandations d'amélioration.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showForecast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Prévision IA</h3>
            <p className="text-gray-600 mb-4">
              Prévisions de vente basées sur l'intelligence artificielle et l'analyse des tendances.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForecast(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showBenchmark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Benchmark secteur</h3>
            <p className="text-gray-600 mb-4">
              Comparaison détaillée avec les performances du secteur.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBenchmark(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales pour les actions rapides */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Créer une promotion</h3>
            <p className="text-gray-600 mb-4">
              Formulaire de création de promotion (à implémenter).
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200"
              >
                Créer
              </button>
              <button
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un équipement</h3>
            <p className="text-gray-600 mb-4">
              Formulaire d'ajout d'équipement (à implémenter).
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showCorrectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Corriger les données</h3>
            <p className="text-gray-600 mb-4">
              Formulaire de correction des données (à implémenter).
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200"
              >
                Corriger
              </button>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesEvolutionWidgetEnriched; 