import React, { useState, useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';
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
import { notificationService, exportService } from '../services';
import { supabaseClient } from '../utils/supabaseClient';
import { aiWidgetService } from '../services/aiWidgetService';
import type { AIPrediction, AISalesBenchmark } from '../services/aiWidgetService';

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
  source?: 'monitor' | 'local';
  note?: string;
}

interface Props {
  data?: any[]; // ou le vrai type si tu l'as
}

/** Utilise les données passées par le dashboard quand elles sont au bon format. */
function normalizeSalesDataFromProp(raw?: any[] | null): SalesData[] | null {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return null;
  const first = raw[0];
  if (first && typeof first.month === 'string' && typeof first.sales === 'number') {
    return raw.map((r: any) => ({
      month: r.month,
      sales: r.sales,
      target: typeof r.target === 'number' ? r.target : 0,
      previousYear: typeof r.previousYear === 'number' ? r.previousYear : 0,
    }));
  }
  return null;
}

const SalesEvolutionWidgetEnriched: React.FC<Props> = ({ data }) => {
  console.log('✅ SalesEvolutionWidgetEnriched chargé');
  const dataSyncKey = useMemo(() => {
    if (!data?.length) return 'empty';
    return JSON.stringify(
      data.map((d: any) => [d.month, d.sales, d.target, d.previousYear])
    );
  }, [data]);

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
  const [forecastPredictions, setForecastPredictions] = useState<AIPrediction[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastSource, setForecastSource] = useState<'monitor' | 'local' | null>(null);
  const [benchmarkModalLoading, setBenchmarkModalLoading] = useState(false);
  const [benchmarkModalData, setBenchmarkModalData] = useState<AISalesBenchmark | null>(null);
  const [benchmarkModalSource, setBenchmarkModalSource] = useState<'monitor' | 'local' | null>(null);

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
    // dataSyncKey évite une boucle si le parent passe un nouveau tableau [] à chaque rendu.
  }, [dataSyncKey]);

  const loadSalesData = async () => {
    try {
      setLoading(true);

      // TODO: Remplacer par un vrai appel API quand la table sales sera créée
      const fromDashboard = normalizeSalesDataFromProp(data);
      const rows = fromDashboard ?? defaultData;

      setSalesData(rows);
      generateNotifications(rows);
      generateAISuggestions();
      setBenchmarkData({
        sector: 'Équipements BTP',
        average: 65000,
        top25: 85000,
        yourPerformance: rows[rows.length - 1]?.sales ?? 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données de vente:', error);
      notificationService.error('Erreur de chargement', 'Impossible de charger les données de vente');
      const fallback = defaultData;
      setSalesData(fallback);
      generateNotifications(fallback);
      setBenchmarkData({
        sector: 'Équipements BTP',
        average: 65000,
        top25: 85000,
        yourPerformance: fallback[fallback.length - 1]?.sales ?? 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (rows: SalesData[]) => {
    const currentMonth = rows[rows.length - 1];
    const notifications: Notification[] = [];

    if (currentMonth && currentMonth.target > 0 && currentMonth.sales < currentMonth.target * 0.85) {
      notifications.push({
        id: '1',
        type: 'warning',
        message: `Baisse de ${Math.round(((currentMonth.target - currentMonth.sales) / currentMonth.target) * 100)}% par rapport à l'objectif`,
        action: 'Corriger ce mois'
      });
    }

    if (
      currentMonth &&
      currentMonth.previousYear > 0 &&
      currentMonth.sales > currentMonth.previousYear * 1.2
    ) {
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

  const handleQuickAction = (e: MouseEvent<HTMLButtonElement>, action: string) => {
    const button = e.currentTarget;
    button.disabled = true;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';

    switch (action) {
      case 'publish_promo':
        handlePublishPromo();
        break;
      case 'add_equipment':
        handleAddEquipment();
        break;
      case 'correct_month':
        handleCorrectMonth();
        break;
      case 'ai_forecast':
        handleAIForecast();
        break;
      case 'export_data':
        handleExportData();
        break;
      case 'capitalize':
        notificationService.success(
          'Capitaliser sur la croissance',
          'Ouverture de l’analyse détaillée pour prolonger cette dynamique.'
        );
        setShowDetails(true);
        break;
      default:
        notificationService.warning('Action non reconnue', `L'action "${action}" n'est pas implémentée`);
    }

    setTimeout(() => {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    }, 280);
  };

  const handleNotificationAction = (notif: Notification, e: MouseEvent<HTMLButtonElement>) => {
    if (notif.action === 'Corriger ce mois') {
      handleQuickAction(e, 'correct_month');
      return;
    }
    if (notif.action === 'Capitaliser') {
      handleQuickAction(e, 'capitalize');
      return;
    }
    notificationService.info('Notification', notif.message);
  };

  const handlePublishPromo = () => {
    try {
      // Action immédiate
      notificationService.info('Création de promotion', 'Ouverture du formulaire de promotion...');
      setShowPromoModal(true);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
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
        
        // apiService.createPromotion(promotionData).then(response => {
        //   if (response.success) {
        //     notificationService.promotionCreated(promotionData.title);
        //   } else {
        //     notificationService.apiError('création de promotion', response.error || 'Erreur inconnue');
        //   }
        // }).catch(error => {
        //   console.error('Erreur API création promotion:', error);
        // });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de la création de promotion:', error);
      notificationService.error('Erreur', 'Impossible de créer la promotion');
    }
  };

  const handleAddEquipment = () => {
    try {
      // Action immédiate
      notificationService.info('Ajout d\'équipement', 'Redirection vers le formulaire d\'ajout...');
      setShowEquipmentModal(true);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        // TODO: Implémenter la vraie logique d'ajout d'équipement
        // Rediriger vers la page d'ajout d'équipement ou ouvrir un modal
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'équipement:', error);
      notificationService.error('Erreur', 'Impossible d\'ajouter l\'équipement');
    }
  };

  const handleCorrectMonth = () => {
    try {
      // Action immédiate
      notificationService.info('Correction des données', 'Ouverture du formulaire de correction...');
      setShowCorrectionModal(true);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        // TODO: Implémenter la vraie logique de correction
        // const correctionData = {
        //   month: 'Juin',
        //   newSales: 72000,
        //   reason: 'Correction des données de vente'
        // };
        
        // apiService.updateSalesData(correctionData).then(response => {
        //   if (response.success) {
        //     notificationService.success('Données corrigées', 'Les données de vente ont été mises à jour');
        //     loadSalesData(); // Recharger les données
        //   } else {
        //     notificationService.apiError('correction des données', response.error || 'Erreur inconnue');
        //   }
        // }).catch(error => {
        //   console.error('Erreur API correction données:', error);
        // });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de la correction:', error);
      notificationService.error('Erreur', 'Impossible de corriger les données');
    }
  };

  const formatPredictionMetricValue = (metric: string, value: number) => {
    if (/conversion/i.test(metric)) {
      return `${Math.round(value)} %`;
    }
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const trendLabel = (t: AIPrediction['trend']) => {
    if (t === 'up') return 'Hausse';
    if (t === 'down') return 'Baisse';
    return 'Stable';
  };

  const timeframeLabel = (tf: AIPrediction['timeframe']) => {
    if (tf === '7d') return '7 jours';
    if (tf === '90d') return '90 jours';
    return '30 jours';
  };

  const formatBenchmarkMoney = (value: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(value);

  const openBenchmarkModal = () => {
    setShowBenchmark(true);
    setBenchmarkModalLoading(true);

    void (async () => {
      try {
        const { data: auth } = await supabaseClient.auth.getSession();
        const userId = auth.session?.user?.id;
        if (!userId) {
          notificationService.warning(
            'Benchmark secteur',
            'Connectez-vous pour charger les indicateurs depuis le serveur ou l’analyse locale.'
          );
          setBenchmarkModalLoading(false);
          return;
        }

        const { data, source } = await aiWidgetService.getSalesBenchmarkWithSource(userId);
        setBenchmarkModalData(data);
        setBenchmarkModalSource(source);
        setBenchmarkData((prev) =>
          prev
            ? {
                ...prev,
                sector: data.sector,
                average: data.average,
                top25: data.top25,
                yourPerformance: data.yourPerformance,
                source,
                note: data.note,
              }
            : prev
        );
      } catch (e) {
        console.error('Benchmark secteur:', e);
        notificationService.error('Benchmark', 'Impossible de charger les données.');
      } finally {
        setBenchmarkModalLoading(false);
      }
    })();
  };

  const handleAIForecast = () => {
    notificationService.aiProcessing();
    setShowForecast(true);
    setForecastLoading(true);
    setForecastPredictions([]);
    setForecastSource(null);

    void (async () => {
      try {
        const { data: auth } = await supabaseClient.auth.getSession();
        const userId = auth.session?.user?.id;
        if (!userId) {
          notificationService.warning(
            'Prévision IA',
            'Connectez-vous pour obtenir des prévisions liées à votre activité.'
          );
          notificationService.aiCompleted();
          return;
        }

        const { items, source } = await aiWidgetService.getSalesPredictionsWithSource(userId);
        setForecastPredictions(items);
        setForecastSource(source);
        notificationService.aiCompleted();
        if (items.length === 0) {
          notificationService.info('Prévision IA', 'Aucune prévision renvoyée pour le moment.');
        }
      } catch (error) {
        console.error('Erreur lors de la prévision IA:', error);
        notificationService.error('Erreur IA', 'Impossible de charger les prévisions.');
        notificationService.aiCompleted();
      } finally {
        setForecastLoading(false);
      }
    })();
  };

  const handleExportData = () => {
    try {
      // Action immédiate
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
      
      // Export immédiat (sans await)
      exportService.exportSalesEvolution(exportData, { format: 'pdf' }).then(result => {
        if (result.success) {
          notificationService.success('Export réussi', `Rapport téléchargé: ${result.filename}`);
        } else {
          notificationService.error('Erreur d\'export', result.error || 'Erreur inconnue');
        }
      }).catch(error => {
        console.error('Erreur export:', error);
        notificationService.error('Erreur d\'export', 'Impossible d\'exporter les données');
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
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
        <h3 className="text-lg font-semibold text-gray-900">Évolution des ventes enrichie</h3>
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
            {salesData[salesData.length - 1]?.target > 0
              ? `${Math.round(
                  (salesData[salesData.length - 1].sales / salesData[salesData.length - 1].target) * 100
                )}%`
              : '0%'}
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
                      type="button"
                      onClick={(ev) => handleNotificationAction(notif, ev)}
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

      {/* Benchmark secteur (aperçu : dernier mois du graphique pour « votre performance » jusqu’au 1er chargement détaillé) */}
      {benchmarkData && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="font-semibold text-gray-900">Benchmark secteur</h4>
            {benchmarkData.source && (
              <span className="text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                {benchmarkData.source === 'monitor' ? 'À jour · serveur' : 'À jour · analyse locale'}
              </span>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {formatBenchmarkMoney(benchmarkData.average)}
                </div>
                <div className="text-sm text-gray-600">Moyenne secteur</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {formatBenchmarkMoney(benchmarkData.top25)}
                </div>
                <div className="text-sm text-gray-600">Top 25%</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatBenchmarkMoney(benchmarkData.yourPerformance)}
                </div>
                <div className="text-sm text-gray-600">Votre performance</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Ouvrez « Benchmark secteur » pour synchroniser avec{' '}
              <span className="font-medium">GET /ai/widgets/benchmark</span> (ou le calcul local).
            </p>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Analyse complète
        </button>
        <button
          type="button"
          onClick={(ev) => handleQuickAction(ev, 'ai_forecast')}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Prévision IA
        </button>
        <button
          type="button"
          onClick={() => openBenchmarkModal()}
          className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors"
        >
          Benchmark secteur
        </button>
        <button
          type="button"
          onClick={(ev) => handleQuickAction(ev, 'export_data')}
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
            type="button"
            onClick={(ev) => handleQuickAction(ev, 'publish_promo')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Publier promo
          </button>
          <button
            type="button"
            onClick={(ev) => handleQuickAction(ev, 'add_equipment')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter équipement
          </button>
          <button
            type="button"
            onClick={(ev) => handleQuickAction(ev, 'correct_month')}
            className="px-3 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded hover:bg-orange-200 text-sm transition-colors flex items-center"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Corriger ce mois
          </button>
          <button
            type="button"
            title="Même action que « Prévision IA » dans la barre principale"
            onClick={(ev) => handleQuickAction(ev, 'ai_forecast')}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Prévision IA</h3>
              {forecastSource && !forecastLoading && (
                <span className="text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                  {forecastSource === 'monitor' ? 'Source : serveur (monitor)' : 'Source : analyse locale'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Prévisions issues du service{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">/ai/widgets/predictions</code> lorsque vous êtes
              connecté et autorisé ; sinon modèle local basé sur vos annonces.
            </p>

            {forecastLoading && (
              <div className="flex items-center gap-3 py-8 justify-center text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
                <span>Analyse en cours…</span>
              </div>
            )}

            {!forecastLoading && forecastPredictions.length === 0 && (
              <p className="text-sm text-gray-500 py-4">
                Aucune donnée de prévision à afficher. Vérifiez votre connexion ou votre abonnement aux fonctions IA.
              </p>
            )}

            {!forecastLoading && forecastPredictions.length > 0 && (
              <ul className="space-y-4 mb-6">
                {forecastPredictions.map((p, idx) => (
                  <li
                    key={`${p.metric}-${idx}`}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="font-medium text-gray-900 mb-2">{p.metric}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="text-gray-500">Actuel : </span>
                        {formatPredictionMetricValue(p.metric, p.currentValue)}
                      </div>
                      <div>
                        <span className="text-gray-500">Prévu ({timeframeLabel(p.timeframe)}) : </span>
                        {formatPredictionMetricValue(p.metric, p.predictedValue)}
                      </div>
                      <div>
                        <span className="text-gray-500">Confiance : </span>
                        {Math.round((p.confidence ?? 0) * 100)} %
                      </div>
                      <div>
                        <span className="text-gray-500">Tendance : </span>
                        {trendLabel(p.trend)}
                      </div>
                    </div>
                    {p.factors?.length ? (
                      <div className="mt-3 text-xs text-gray-600">
                        <span className="font-medium text-gray-700">Facteurs : </span>
                        {p.factors.join(' · ')}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end gap-2 flex-wrap">
              <button
                type="button"
                disabled={forecastLoading}
                onClick={() => {
                  if (!forecastLoading) handleAIForecast();
                }}
                className="px-4 py-2 bg-orange-100 text-orange-900 border border-orange-300 rounded hover:bg-orange-200 disabled:opacity-50 text-sm"
              >
                Actualiser
              </button>
              <button
                type="button"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Benchmark secteur</h3>
              {benchmarkModalSource && !benchmarkModalLoading && (
                <span className="text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                  {benchmarkModalSource === 'monitor'
                    ? 'Source : serveur (monitor)'
                    : 'Source : analyse locale'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Données issues de <code className="text-xs bg-gray-100 px-1 rounded">/ai/widgets/benchmark</code> lorsque
              le monitor est disponible et votre compte autorisé ; sinon même logique que le fallback prédictions
              (annonces actives).
            </p>

            {benchmarkModalLoading && (
              <div className="flex items-center gap-3 py-8 justify-center text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
                <span>Chargement du benchmark…</span>
              </div>
            )}

            {!benchmarkModalLoading && !benchmarkModalData && (
              <p className="text-sm text-gray-500 py-4">
                Connectez-vous pour afficher le benchmark. Le bandeau du widget reprend le dernier point du graphique
                jusqu’à la première synchronisation.
              </p>
            )}

            {!benchmarkModalLoading && benchmarkModalData && (
              <>
                <p className="text-sm font-medium text-gray-800 mb-2">{benchmarkModalData.sector}</p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-700">
                        {formatBenchmarkMoney(benchmarkModalData.average)}
                      </div>
                      <div className="text-sm text-gray-600">Moyenne secteur</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatBenchmarkMoney(benchmarkModalData.top25)}
                      </div>
                      <div className="text-sm text-gray-600">Top 25 %</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatBenchmarkMoney(benchmarkModalData.yourPerformance)}
                      </div>
                      <div className="text-sm text-gray-600">Votre performance (estim.)</div>
                    </div>
                  </div>
                </div>
                {benchmarkModalData.note && (
                  <p className="text-xs text-gray-600 mb-4 border-l-4 border-orange-200 pl-3">{benchmarkModalData.note}</p>
                )}
              </>
            )}

            <div className="flex justify-end gap-2 flex-wrap">
              <button
                type="button"
                disabled={benchmarkModalLoading}
                onClick={() => {
                  if (!benchmarkModalLoading) openBenchmarkModal();
                }}
                className="px-4 py-2 bg-orange-100 text-orange-900 border border-orange-300 rounded hover:bg-orange-200 disabled:opacity-50 text-sm"
              >
                Actualiser
              </button>
              <button
                type="button"
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