import React, { useState, useEffect } from 'react';
import { DailyActionsPriorityWidget } from './DailyActionsWidgetFixed';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  Building2,
  Users,
  Package,
  Truck,
  Wrench,
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe,
  Smartphone,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  Layout,
  PieChart,
  Activity,
  DollarSign,
  Clock,
  Target,
  RefreshCw,
  Bell,
  User,
  LogOut,
  Plus,
  MoreHorizontal,
  GripVertical,
  X,
  Maximize2,
  Minimize2,
  Edit,
  Play,
  Check,
  Trash2,
  Mail,
  Info,
  AlertTriangle,
  AlertCircle,
  Save,
  Download,
  Brain,
  Lightbulb,
  Award,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Share2,
  Copy,
  ExternalLink,
  BookOpen,
  Calculator,
  LineChart,
  ScatterChart,
  AreaChart,
  BarChart as BarChartIcon,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { PieChart as PieChartIcon, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import {
  getDailyInterventions,
  getRepairsStatus,
  getInventoryStatus,
  getTechniciansWorkload,
  getMechanicStats,
  updateRepairStatus,
  assignTechnicianToRepair,
  createIntervention,
  getTechnicians,
  getEquipmentList,
  getInterventionsByStatus,
  getRentalRevenue,
  getEquipmentAvailability,
  getUpcomingRentals,
  getPreventiveMaintenance,
  createRental,
  updateRentalStatus,
  updateRental,
  createMaintenanceIntervention
} from '../utils/enterpriseApi';
import supabase from '../utils/supabaseClient';
import { VendeurWidgets } from './widgets/VendeurWidgets';
import { PerformanceScoreWidget } from "./enterprise/widgets/PerformanceScoreWidget";
import { PlanningWidget } from "./enterprise/widgets/PlanningWidget";
import { EquipmentAvailabilityWidget } from "./enterprise/widgets/EquipmentAvailabilityWidget";
import { DailyActionsWidget } from "./enterprise/widgets/DailyActionsWidget";
import { SalesPerformanceScoreWidget } from "./enterprise/widgets/SalesPerformanceScoreWidget";
import { PreventiveMaintenanceWidget } from "./enterprise/widgets/PreventiveMaintenanceWidget";
import { getChartData } from "./enterprise/widgets/getChartData";
import { SalesPipelineWidget } from "./enterprise/widgets/SalesPipelineWidget";
import { InventoryStatusWidget } from "./enterprise/widgets/InventoryStatusWidget";
import { SalesEvolutionWidgetEnriched } from "./enterprise/widgets/SalesEvolutionWidgetEnriched";
import { NotificationsWidget } from "./enterprise/widgets/NotificationsWidget";
import { AdvancedKPIsWidget } from "./enterprise/widgets/AdvancedKPIsWidget";
import { InterventionForm } from "./enterprise/widgets/InterventionForm";
import { EditRentalForm } from "./enterprise/widgets/EditRentalForm";
import { RentalDetailsModal } from "./enterprise/widgets/RentalDetailsModal";
import { getDailyActionsData } from "./enterprise/widgets/getDailyActionsData";
import { getAdvancedKPIsData } from "./enterprise/widgets/getAdvancedKPIsData";
import { getPlanningData } from "./enterprise/widgets/getPlanningData";

// Import supprimé car le composant est défini localement

const ResponsiveGridLayout = WidthProvider(Responsive);

// Mapping des icônes pour la récupération depuis la configuration
const iconMap: { [key: string]: any } = {
  Building2,
  Users,
  Package,
  Truck,
  Wrench,
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe,
  Smartphone,
  BarChart3,
  TrendingUp,
  Eye,
  Settings,
  Layout,
  PieChart,
  Activity,
  DollarSign,
  Clock,
  Target,
  RefreshCw,
  Bell,
  User,
  LogOut,
  Plus,
  MoreHorizontal,
  Mail
};

import type { Widget, WidgetLayout, DashboardConfig } from './enterprise/types';
import { CalendarWidget } from "./enterprise/widgets/CalendarWidget";
import { getListData } from "./enterprise/widgets/getListData";
import { getDefaultPerformanceData } from "./enterprise/widgets/getDefaultPerformanceData";
import { useAdaptiveWidget } from "./enterprise/widgets/useAdaptiveWidget";
import { getNotificationsData } from "./enterprise/widgets/getNotificationsData";
import { RentalForm } from "./enterprise/widgets/RentalForm";
import { getEquipmentAvailabilityData } from "./enterprise/widgets/getEquipmentAvailabilityData";
import { getPerformanceScoreData } from "./enterprise/widgets/getPerformanceScoreData";
import { getMaintenanceData } from "./enterprise/widgets/getMaintenanceData";

// Hook pour l'adaptation automatique des widgets
// Données simulées pour les widgets
const mockData = {
  // Vendeur d'engins
  sales: { revenue: 125000, count: 23, growth: 12.5 },
  inventory: [
    { name: 'Pelle hydraulique CAT 320D', status: 'En rupture', priority: 'high' },
    { name: 'Concasseur mobile', status: 'Stock faible', priority: 'medium' },
    { name: 'Chargeur frontal', status: 'Disponible', priority: 'low' }
  ],
  sales_history: [45, 52, 38, 67, 58, 72, 89, 76, 65, 82, 91, 78],
  leads: [
    { name: 'M. Diallo', company: 'Construction SA', value: 25000, stage: 'Qualification' },
    { name: 'Mme Traoré', company: 'Mines du Mali', value: 45000, stage: 'Proposition' },
    { name: 'M. Koné', company: 'BTP Côte d\'Ivoire', value: 18000, stage: 'Négociation' }
  ],

  // Loueur d'engins
  rental_revenue: { revenue: 85000, count: 15, growth: 8.2 },
  equipment_usage: [
    { name: 'Pelle hydraulique', usage: 85, status: 'En location' },
    { name: 'Chargeur', usage: 72, status: 'Disponible' },
    { name: 'Bulldozer', usage: 93, status: 'En location' }
  ],
  rentals: [
    { date: '2024-01-15', equipment: 'Pelle hydraulique', client: 'Construction SA', duration: '2 semaines' },
    { date: '2024-01-18', equipment: 'Bulldozer', client: 'Mines du Mali', duration: '1 mois' },
    { date: '2024-01-20', equipment: 'Chargeur', client: 'BTP Côte d\'Ivoire', duration: '3 semaines' }
  ],
  maintenance: [
    { equipment: 'Pelle hydraulique', date: '2024-01-25', type: 'Révision générale' },
    { equipment: 'Bulldozer', date: '2024-01-30', type: 'Changement filtre' }
  ],

  // Mécanicien/Atelier
  daily_interventions: { count: 8, completed: 5, pending: 3 },
  repairs: [
    { equipment: 'Pelle hydraulique CAT', status: 'En cours', technician: 'M. Diarra', estimated: '2 jours' },
    { equipment: 'Concasseur mobile', status: 'En attente', technician: 'M. Keita', estimated: '1 jour' },
    { equipment: 'Chargeur frontal', status: 'Terminé', technician: 'M. Koné', estimated: 'Terminé' }
  ],
  parts: [
    { category: 'Moteurs', stock: 45, min: 20, status: 'OK' },
    { category: 'Hydraulique', stock: 12, min: 15, status: 'Faible' },
    { category: 'Électronique', stock: 28, min: 10, status: 'OK' }
  ],
  workload: [
    { technician: 'M. Diarra', tasks: 5, completed: 3, efficiency: 85 },
    { technician: 'M. Keita', tasks: 4, completed: 2, efficiency: 78 },
    { technician: 'M. Koné', tasks: 6, completed: 5, efficiency: 92 }
  ],

  // Transporteur/Logistique
  active_deliveries: { count: 12, in_transit: 8, delivered: 4 },
  gps_tracking: [
    { vehicle: 'Camion 01', location: 'Bamako', status: 'En route', eta: '2h' },
    { vehicle: 'Camion 02', location: 'Ouagadougou', status: 'Livraison', eta: '30min' },
    { vehicle: 'Camion 03', location: 'Abidjan', status: 'Retour', eta: '4h' }
  ],
  transport_costs: [
    { route: 'Bamako - Ouagadougou', cost: 2500, distance: 850, efficiency: 85 },
    { route: 'Ouagadougou - Abidjan', cost: 3200, distance: 1100, efficiency: 78 },
    { route: 'Abidjan - Bamako', cost: 2800, distance: 950, efficiency: 82 }
  ],
  driver_schedule: [
    { driver: 'M. Diallo', route: 'Bamako - Ouagadougou', start: '08:00', end: '18:00' },
    { driver: 'M. Traoré', route: 'Ouagadougou - Abidjan', start: '06:00', end: '16:00' },
    { driver: 'M. Koné', route: 'Abidjan - Bamako', start: '07:00', end: '17:00' }
  ],

  // Transitaire
  customs: { declarations: 8, approved: 6, pending: 2 },
  containers: [
    { id: 'CONT001', location: 'Port d\'Abidjan', status: 'En transit', eta: '3 jours' },
    { id: 'CONT002', location: 'Port de Dakar', status: 'En douane', eta: '1 jour' },
    { id: 'CONT003', location: 'Port de Lomé', status: 'Livré', eta: 'Terminé' }
  ],
  trade_stats: [
    { month: 'Jan', import: 45, export: 38 },
    { month: 'Fév', import: 52, export: 42 },
    { month: 'Mar', import: 38, export: 35 }
  ],
  documents: [
    { type: 'Certificat d\'origine', status: 'En attente', priority: 'high' },
    { type: 'Facture commerciale', status: 'Validé', priority: 'medium' },
    { type: 'Connaissement', status: 'En cours', priority: 'high' }
  ],

  // Logisticien
  warehouse: { occupancy: 78, available: 22, total: 100 },
  routes: [
    { route: 'Route A', optimization: 92, savings: 15 },
    { route: 'Route B', optimization: 85, savings: 12 },
    { route: 'Route C', optimization: 88, savings: 18 }
  ],
  kpis: [
    { metric: 'Délai de livraison', value: 2.3, target: 2.0, status: 'warning' },
    { metric: 'Taux de service', value: 96.5, target: 95.0, status: 'good' },
    { metric: 'Coût logistique', value: 8.2, target: 8.0, status: 'warning' }
  ],
  inventory_alerts: [
    { product: 'Pièces moteur', status: 'Rupture', action: 'Commander' },
    { product: 'Filtres hydrauliques', status: 'Stock faible', action: 'Réapprovisionner' },
    { product: 'Huiles moteur', status: 'Excédent', action: 'Promotion' }
  ],

  // Prestataire multiservices
  projects: { active: 12, completed: 8, pending: 3 },
  services: [
    { name: 'Maintenance préventive', status: 'Disponible', demand: 'Élevée' },
    { name: 'Formation technique', status: 'Disponible', demand: 'Moyenne' },
    { name: 'Consultation', status: 'Disponible', demand: 'Élevée' }
  ],
  revenue: [
    { service: 'Maintenance', revenue: 45000, percentage: 40 },
    { service: 'Formation', revenue: 28000, percentage: 25 },
    { service: 'Consultation', revenue: 38000, percentage: 35 }
  ],
  partners: [
    { name: 'ConstructPro', status: 'Actif', projects: 5 },
    { name: 'MineTech', status: 'Actif', projects: 3 },
    { name: 'LogiSolutions', status: 'En attente', projects: 1 }
  ],
  project_timeline: [
    { project: 'Projet A', start: '2024-01-01', end: '2024-03-31', progress: 75 },
    { project: 'Projet B', start: '2024-02-01', end: '2024-05-31', progress: 45 },
    { project: 'Projet C', start: '2024-03-01', end: '2024-06-30', progress: 25 }
  ],

  // Investisseur
  portfolio: { value: 2500000, growth: 8.5, risk: 'Modéré' },
  opportunities: [
    { name: 'Projet minier Mali', value: 500000, roi: 15, risk: 'Élevé' },
    { name: 'Infrastructure Côte d\'Ivoire', value: 300000, roi: 12, risk: 'Modéré' },
    { name: 'Énergie renouvelable Sénégal', value: 200000, roi: 18, risk: 'Élevé' }
  ],
  roi: [
    { project: 'Projet A', roi: 15.2, duration: '2 ans' },
    { project: 'Projet B', roi: 12.8, duration: '3 ans' },
    { project: 'Projet C', roi: 18.5, duration: '1.5 ans' }
  ],
  roi_data: [
    { month: 'Jan', roi: 12.5 },
    { month: 'Fév', roi: 14.2 },
    { month: 'Mar', roi: 13.8 },
    { month: 'Avr', roi: 15.1 },
    { month: 'Mai', roi: 16.3 },
    { month: 'Juin', roi: 15.7 }
  ],
  market_trends: [
    { sector: 'Mines', trend: 'Hausse', change: 8.5 },
    { sector: 'Construction', trend: 'Stable', change: 2.1 },
    { sector: 'Énergie', trend: 'Hausse', change: 12.3 },
    { sector: 'Transport', trend: 'Baisse', change: -3.2 }
  ],
  risk: [
    { project: 'Projet minier', risk: 'Élevé', mitigation: 'Diversification' },
    { project: 'Infrastructure', risk: 'Modéré', mitigation: 'Assurance' },
    { project: 'Énergie', risk: 'Élevé', mitigation: 'Partage de risques' }
  ],
  interventions: [
    { id: 1, name: 'Révision 500h', equipment: 'Bouteur CAT D9', status: 'Terminé' },
    { id: 2, name: 'Changer filtre à huile', equipment: 'Pelle Komatsu PC200', status: 'Terminé' },
    { id: 3, name: 'Réparation circuit hydraulique', equipment: 'Grue mobile Liebherr', status: 'En attente' },
    { id: 4, name: 'Maintenance préventive', equipment: 'Niveleuse John Deere', status: 'En attente' },
    { id: 5, name: 'Changement de pneus', equipment: 'Chargeuse Volvo L150', status: 'En attente' },
  ],
};

const DonutChart = ({ completed, pending }: { completed: number, pending: number }) => {
    const total = completed + pending;
    if (total === 0) return null;
    const completedPercentage = (completed / total) * 100;
    const strokeDasharray = `${completedPercentage} ${100 - completedPercentage}`;

    return (
        <div className="relative w-24 h-24 mx-auto my-2">
            <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="15.915" className="stroke-current text-gray-200" strokeWidth="2" fill="transparent" />
                <circle cx="18" cy="18" r="15.915" className="stroke-current text-orange-600" strokeWidth="2" fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset="25"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{total}</span>
                <span className="text-xs text-gray-500">Total</span>
            </div>
        </div>
    );
}

// Nouveau composant Score de Performance Commerciale
// Composant Score de Performance Commerciale avec toutes les fonctionnalités
const MetricWidget = ({ 
  widget, 
  data, 
  widgetSize = 'normal'
}: { 
  widget: Widget; 
  data: any; 
  widgetSize?: 'small' | 'normal' | 'large';
}) => {
  // Utiliser le hook d'adaptation
  const { getTextSize, getGridCols, formatCurrency, formatNumber } = useAdaptiveWidget(widgetSize);

  // Récupérer l'icône depuis le mapping
  const IconComponent = typeof widget.icon === 'string' ? iconMap[widget.icon] : widget.icon;
  const Icon = IconComponent || DollarSign; // Fallback vers DollarSign

  console.log(`MetricWidget ${widget.id}:`, { widget, data });

  // États pour les fonctionnalités avancées
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous' | 'forecast'>('current');

  // Fonction pour formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Données étendues pour le widget ventes
  const getExtendedSalesData = () => {
    if (widget.id === 'sales-metrics' && data) {
      const currentRevenue = data.revenue || 0;
      const currentCount = data.count || 0;
      const currentGrowth = data.growth || 0;

      return {
        current: {
          revenue: currentRevenue,
          count: currentCount,
          growth: currentGrowth,
          averageTicket: currentCount > 0 ? currentRevenue / currentCount : 0
        },
        previous: {
          revenue: currentRevenue / (1 + currentGrowth / 100),
          count: Math.floor(currentCount * 0.9), // Estimation
          growth: currentGrowth * 0.8, // Estimation
          averageTicket: currentCount > 0 ? (currentRevenue / (1 + currentGrowth / 100)) / Math.floor(currentCount * 0.9) : 0
        },
        forecast: {
          revenue: currentRevenue * (1 + currentGrowth / 100),
          count: Math.floor(currentCount * 1.1), // Estimation
          growth: currentGrowth * 1.2, // Estimation
          averageTicket: currentCount > 0 ? (currentRevenue * (1 + currentGrowth / 100)) / Math.floor(currentCount * 1.1) : 0
        }
      };
    }
    return null;
  };

  const extendedData = getExtendedSalesData();

  // Fonction pour afficher les données métriques de manière générique
  const renderMetricData = () => {
    if (!data) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          Données non disponibles
        </div>
      );
    }

    // Si c'est un objet avec des propriétés spécifiques
    if (typeof data === 'object' && data !== null) {
      // Chercher les propriétés numériques principales
      const mainValue = data.revenue || data.count || data.value || data.occupancy || data.declarations || data.active;
      const secondaryValue = data.count || data.growth || data.completed || data.pending || data.in_transit || data.delivered;
      const thirdValue = data.growth || data.pending || data.available || data.approved;

      if (mainValue !== undefined) {
        // Special case for interventions
        if (data.completed !== undefined && data.pending !== undefined) {
            return (
                <div className="text-center">
                    <DonutChart completed={data.completed} pending={data.pending} />
                    <div className="flex justify-center space-x-4 text-xs">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-orange-600 mr-2"></span>
                            <span>Terminées: {data.completed}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-600 mr-2"></span>
                            <span className="dark:text-gray-300">En attente: {data.pending}</span>
                        </div>
                    </div>
                </div>
            )
        }

        // Widget Ventes du mois avec fonctionnalités avancées
        if (widget.id === 'sales-metrics' && extendedData) {
          const currentData = extendedData[selectedPeriod];

          return (
            <div className="space-y-3">
              {/* Contrôles de période */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setSelectedPeriod('current')}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedPeriod === 'current'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Actuel
                </button>
                <button
                  onClick={() => setSelectedPeriod('previous')}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedPeriod === 'previous'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setSelectedPeriod('forecast')}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedPeriod === 'forecast'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Prévision
                </button>
              </div>

              {/* Indicateurs de performance */}
              <div className={`grid grid-cols-${getGridCols(2)} gap-${widgetSize === 'small' ? '1' : widgetSize === 'large' ? '3' : '2'} text-xs`}>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-semibold text-orange-600">
                    {currentData.growth >= 0 ? '+' : ''}{currentData.growth.toFixed(1)}%
                  </div>
                  <div className="text-orange-700">Croissance</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-semibold text-orange-600">
                    {formatCurrency(currentData.averageTicket)}
                  </div>
                  <div className="text-orange-700">Ticket moyen</div>
                </div>
              </div>

              {/* Valeur principale */}
              <div className="text-center">
                <div className={`${getTextSize('value')} font-bold text-gray-900`}>
                  {formatCurrency(currentData.revenue)}
                </div>
                <div className={`${getTextSize('subtitle')} text-gray-600`}>
                  {selectedPeriod === 'current' ? 'CA du mois' :
                   selectedPeriod === 'previous' ? 'CA mois précédent' : 'CA prévisionnel'}
                </div>
              </div>

              {/* Métriques secondaires */}
              <div className={`grid grid-cols-${getGridCols(2)} gap-${widgetSize === 'small' ? '1' : widgetSize === 'large' ? '3' : '2'} text-xs`}>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{currentData.count}</div>
                  <div className="text-gray-600">Ventes</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(currentData.averageTicket)}
                  </div>
                  <div className="text-gray-600">Panier moyen</div>
                </div>
              </div>

              {/* Croissance */}
              {currentData.growth !== undefined && (
                <div className="flex items-center justify-center text-xs">
                  <TrendingUp className={`h-3 w-3 mr-1 ${currentData.growth >= 0 ? 'text-orange-500' : 'text-red-500'}`} />
                  <span className={currentData.growth >= 0 ? 'text-orange-600' : 'text-red-600'}>
                    {formatPercentage(currentData.growth)} vs mois précédent
                  </span>
                </div>
              )}

              {/* Bouton détails */}
              <button
                onClick={() => setShowDetails(true)}
                className="w-full mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
              >
                Voir détails
              </button>
            </div>
          );
        }

        return (
          <>
            <div className="text-2xl font-bold text-gray-900">
              {typeof mainValue === 'number' ? mainValue.toLocaleString() : mainValue}
              {data.occupancy ? '%' : data.revenue || data.value ? ' MAD' : ''}
            </div>
            <div className="text-xs text-gray-600">
              {widget.description}
            </div>
            {secondaryValue !== undefined && (
              <div className="flex items-center justify-between text-xs">
                {data.completed !== undefined && (
                  <span className="text-orange-600">{data.completed} terminées</span>
                )}
                {data.pending !== undefined && (
                  <span className="text-orange-600">{data.pending} en attente</span>
                )}
                {data.in_transit !== undefined && (
                  <span className="text-orange-600">{data.in_transit} en transit</span>
                )}
                {data.delivered !== undefined && (
                  <span className="text-orange-600">{data.delivered} livrées</span>
                )}
                {data.approved !== undefined && (
                  <span className="text-orange-600">{data.approved} approuvées</span>
                )}
                {data.available !== undefined && (
                  <span className="text-gray-600">{data.available}% disponible</span>
                )}
              </div>
            )}
            {data.growth !== undefined && (
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-orange-500 mr-1" />
                <span className="text-orange-600">+{data.growth}% vs mois dernier</span>
              </div>
            )}
            {data.occupancy !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: `${data.occupancy}%` }}></div>
              </div>
            )}
            {data.risk !== undefined && (
              <div className="text-xs text-gray-600">Risque: {data.risk}</div>
            )}
          </>
        );
      }
    }

    // Fallback pour les données simples
    return (
      <div className="text-center text-gray-500 py-4">
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {typeof data === 'number' ? data.toLocaleString() : String(data)}
        </div>
        <div className="text-sm text-gray-600">{widget.description}</div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderMetricData()}

      {/* Modal de détails pour les ventes */}
      {showDetails && extendedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Détails des Ventes</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Comparaison des périodes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparaison des Périodes</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Mois Précédent</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(extendedData.previous.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {extendedData.previous.count} ventes
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-600">Mois Actuel</div>
                    <div className="text-lg font-bold text-orange-900">
                      {formatCurrency(extendedData.current.revenue)}
                    </div>
                    <div className="text-xs text-orange-500">
                      {extendedData.current.count} ventes
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-600">Prévision</div>
                    <div className="text-lg font-bold text-orange-900">
                      {formatCurrency(extendedData.forecast.revenue)}
                    </div>
                    <div className="text-xs text-orange-500">
                      {extendedData.forecast.count} ventes
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyse détaillée */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Analyse Détaillée</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Croissance CA</span>
                    <span className={`text-sm font-semibold ${extendedData.current.growth >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {formatPercentage(extendedData.current.growth)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Panier moyen</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(extendedData.current.averageTicket)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Nombre de ventes</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {extendedData.current.count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                    Exporter rapport
                  </button>
                  <button className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                    Planifier actions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MapWidget = ({ widget, data }: { widget: Widget; data: any[] }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  // Récupérer l'icône depuis le mapping
  const IconComponent = typeof widget.icon === 'string' ? iconMap[widget.icon] : widget.icon;
  const Icon = IconComponent || Globe; // Fallback vers Globe

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setSelectedItem(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En route':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'Livraison':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'Retour':
        return <ArrowRight className="h-4 w-4 text-orange-600" />;
      case 'En transit':
        return <Globe className="h-4 w-4 text-purple-600" />;
      case 'En douane':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      default:
        return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En route':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Livraison':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Retour':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'En transit':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'En douane':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {data.length} éléments actifs
            </span>
            <button
              className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
              onClick={() => setShowMap(true)}
            >
              <Globe className="h-4 w-4 mr-1" />
              Voir carte
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleItemClick(item)}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {item.vehicle || item.id || item.route || item.title}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {item.location || 'Position GPS'}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                  {item.status}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {item.eta ? `ETA: ${item.eta}` : 'En cours'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Voir tous les {data.length} éléments
            </button>
          </div>
        )}
      </div>

      {/* Modal de carte interactive */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Carte de suivi - {selectedItem?.vehicle || selectedItem?.id || 'Tous les éléments'}
              </h3>
              <button
                onClick={handleCloseMap}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 p-4">
              <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                    Carte interactive
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Intégration avec Google Maps ou OpenStreetMap en cours
                  </p>

                  {/* Informations détaillées */}
                  <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
                    <h5 className="font-medium text-gray-900 mb-3">Informations de suivi</h5>
                    <div className="space-y-2 text-sm">
                      {selectedItem && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Identifiant:</span>
                            <span className="font-medium">{selectedItem.vehicle || selectedItem.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Statut:</span>
                            <span className={`font-medium ${getStatusColor(selectedItem.status).split(' ')[0]}`}>
                              {selectedItem.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Localisation:</span>
                            <span className="font-medium">{selectedItem.location || 'GPS en cours'}</span>
                          </div>
                          {selectedItem.eta && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ETA:</span>
                              <span className="font-medium">{selectedItem.eta}</span>
                            </div>
                          )}
                          {selectedItem.coordinates && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coordonnées:</span>
                              <span className="font-medium text-xs">
                                {selectedItem.coordinates[0]?.toFixed(4)}, {selectedItem.coordinates[1]?.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleCloseMap}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Composant widget modulaire
const WidgetComponent = ({
  widget,
  onRemove,
  onToggleSize,
  onToggleVisibility,
  onShowDetails,
  onMarkRepairComplete,
  onAssignTechnician,
  onShowInterventionForm,
  onShowRentalForm,
  onUpdateRentalStatus,
  onShowRentalDetails,
  onEditRental,
  dataVersion,
  widgetSize = 'normal' // Nouveau prop pour la taille du widget
}: {
  widget: Widget;
  onRemove: (widgetId: string) => void;
  onToggleSize: (widgetId: string) => void;
  onToggleVisibility: (widgetId: string) => void;
  onShowDetails: (content: React.ReactNode) => void;
  onMarkRepairComplete: (repairId: string) => void;
  onAssignTechnician: (repairId: string, technicianId: string, technicianName: string) => void;
  onShowInterventionForm: () => void;
  onShowRentalForm: () => void;
  onUpdateRentalStatus: (rentalId: string, status: string) => void;
  onShowRentalDetails: (rental: any) => void;
  onEditRental: (rental: any) => void;
  dataVersion: number;
  widgetSize?: 'small' | 'normal' | 'large';
}) => {
  console.log('🔥 WidgetComponent rendu pour:', widget.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonctions de formatage adaptatives selon la taille du widget
  const getAdaptiveTextSize = (baseSize: string) => {
    switch (widgetSize) {
      case 'small':
        return baseSize.replace('text-', 'text-xs ');
      case 'large':
        return baseSize.replace('text-', 'text-lg ');
      default:
        return baseSize;
    }
  };

  const getAdaptivePadding = () => {
    switch (widgetSize) {
      case 'small':
        return 'p-2';
      case 'large':
        return 'p-4';
      default:
        return 'p-3';
    }
  };

  const getAdaptiveGridCols = (defaultCols: number) => {
    switch (widgetSize) {
      case 'small':
        return Math.max(1, defaultCols - 1);
      case 'large':
        return Math.min(6, defaultCols + 1);
      default:
        return defaultCols;
    }
  };

  const formatAdaptiveCurrency = (amount: number) => {
    const isSmall = widgetSize === 'small';
    const isLarge = widgetSize === 'large';
    
    if (amount >= 1000000) {
      return isSmall ? `${(amount / 1000000).toFixed(1)}M` : 
             isLarge ? `${(amount / 1000000).toFixed(2)}M MAD` :
             `${(amount / 1000000).toFixed(1)}M MAD`;
    } else if (amount >= 1000) {
      return isSmall ? `${(amount / 1000).toFixed(0)}k` :
             isLarge ? `${(amount / 1000).toFixed(1)}k MAD` :
             `${(amount / 1000).toFixed(0)}k MAD`;
    } else {
      return isSmall ? `${amount}` :
             isLarge ? `${amount.toLocaleString('fr-FR')} MAD` :
             `${amount.toLocaleString('fr-FR')}`;
    }
  };

  const formatAdaptiveNumber = (num: number) => {
    const isSmall = widgetSize === 'small';
    const isLarge = widgetSize === 'large';
    
    if (num >= 1000000) {
      return isSmall ? `${(num / 1000000).toFixed(1)}M` :
             isLarge ? `${(num / 1000000).toFixed(2)}M` :
             `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return isSmall ? `${(num / 1000).toFixed(0)}k` :
             isLarge ? `${(num / 1000).toFixed(1)}k` :
             `${(num / 1000).toFixed(0)}k`;
    } else {
      return isSmall ? `${num}` :
             isLarge ? `${num.toLocaleString('fr-FR')}` :
             `${num.toLocaleString('fr-FR')}`;
    }
  };

  const getAdaptiveIconSize = () => {
    switch (widgetSize) {
      case 'small':
        return 'h-3 w-3';
      case 'large':
        return 'h-6 w-6';
      default:
        return 'h-4 w-4';
    }
  };

  // Fonction pour obtenir les classes CSS adaptatives
  const getAdaptiveClasses = () => {
    switch (widgetSize) {
      case 'small':
        return {
          text: {
            title: 'text-xs',
            subtitle: 'text-xs',
            value: 'text-lg',
            small: 'text-xs'
          },
          spacing: {
            padding: 'p-2',
            gap: 'gap-1',
            margin: 'm-1'
          },
          grid: {
            cols: 'grid-cols-1',
            gap: 'gap-1'
          }
        };
      case 'large':
        return {
          text: {
            title: 'text-lg',
            subtitle: 'text-base',
            value: 'text-3xl',
            small: 'text-sm'
          },
          spacing: {
            padding: 'p-4',
            gap: 'gap-3',
            margin: 'm-2'
          },
          grid: {
            cols: 'grid-cols-3',
            gap: 'gap-3'
          }
        };
      default:
        return {
          text: {
            title: 'text-sm',
            subtitle: 'text-xs',
            value: 'text-2xl',
            small: 'text-xs'
          },
          spacing: {
            padding: 'p-3',
            gap: 'gap-2',
            margin: 'm-1'
          },
          grid: {
            cols: 'grid-cols-2',
            gap: 'gap-2'
          }
        };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let result: any;

        // Gestion spéciale pour les widgets de performance
        if (widget.type === 'performance') {
          if (widget.id === 'sales-metrics') {
            result = getSalesPerformanceScoreData();
            console.log('[DEBUG] Données reçues de getSalesPerformanceScoreData():', JSON.stringify(result, null, 2));
          } else {
            result = getPerformanceScoreData();
            console.log('[DEBUG] Données reçues de getPerformanceScoreData():', JSON.stringify(result, null, 2));
          }
          setData(result);
          return;
        }

        switch (widget.dataSource) {
          case 'interventions-today':
            result = await getDailyInterventions();
            console.log('[DEBUG] Données reçues de getDailyInterventions():', JSON.stringify(result, null, 2));
            setData(result || []);
            break;
          case 'repair-status':
            result = await getRepairsStatus();
            setData(result);
            break;
          case 'parts-inventory':
            result = await getInventoryStatus();
            setData(result);
            break;
          case 'technician-workload':
            result = await getTechniciansWorkload();
            setData(result);
            break;
          case 'rental-revenue':
            result = await getRentalRevenue();
            setData(result);
            break;
          case 'equipment-availability':
            console.log('[DEBUG] Chargement du widget equipment-availability...');
            result = await getEquipmentAvailability();
            console.log('[DEBUG] Données reçues de getEquipmentAvailability():', JSON.stringify(result, null, 2));
            setData(result);
            break;
          case 'sales-evolution':
            console.log('[DEBUG] Chargement du widget sales-evolution...');
            result = getChartData('sales-evolution');
            console.log('[DEBUG] Données reçues de getChartData(sales-evolution):', JSON.stringify(result, null, 2));
            setData(result);
            break;
          case 'upcoming-rentals':
            result = await getUpcomingRentals();
            setData(result);
            break;
          case 'maintenance-schedule':
            result = await getPreventiveMaintenance();
            setData(result);
            break;
          case 'performance':
            if (widget.id === 'sales-metrics') {
              result = await getSalesPerformanceScoreData();
              console.log('[DEBUG] Données reçues de getSalesPerformanceScoreData():', JSON.stringify(result, null, 2));
            } else {
              result = getPerformanceScoreData();
            }
            setData(result);
            break;
          default:
            result = (mockData as any)[widget.dataSource] || null;
            setData(result);
        }
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [widget.dataSource, dataVersion]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${isExpanded ? 'col-span-2' : ''}`}>
      {/* Header du widget avec contrôles */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
        <div className="flex items-center flex-1">
          {/* Icône et titre */}
          <div className="flex items-center flex-1">
            {(() => {
              const IconComponent = typeof widget.icon === 'string' ? iconMap[widget.icon] : widget.icon;
              const Icon = IconComponent || DollarSign;
              return <Icon className="h-4 w-4 text-orange-600 mr-2" />;
            })()}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{widget.title}</h3>
          </div>
        </div>

        {/* Contrôles du widget */}
        <div className="flex items-center space-x-1">
           <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={isExpanded ? "Réduire" : "Agrandir"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => onToggleSize(widget.id)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Changer la taille"
          >
            <Layout className="h-4 w-4" />
          </button>

          <button
            onClick={() => onToggleVisibility(widget.id)}
            className={`p-1 ${isCollapsed ? 'text-gray-600' : 'text-gray-400'} hover:text-gray-600`}
            title={isCollapsed ? "Développer le widget" : "Réduire le widget"}
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={() => onRemove(widget.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Supprimer le widget"
          >
            <X className="h-4 w-4" />
          </button>
           <button
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing ml-2 handle"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenu du widget */}
       <div className={`transition-all duration-200 flex-grow ${isCollapsed ? 'max-h-0 overflow-hidden' : ''}`}>
        <div className={`${getAdaptivePadding()} h-full`}>
          {(() => {
            if (isLoading) {
              return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                  <div className="text-sm">Chargement des données...</div>
                </div>
              );
            }

            if (error) {
              return (
                <div className="text-center text-red-600 dark:text-red-400 py-3">
                  <div className="text-sm">{error}</div>
                </div>
              );
            }

            if (!data) {
              return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                  <div className="text-sm">Données non disponibles</div>
                </div>
              );
            }

            switch (widget.type) {
              case 'metric':
                return <MetricWidget 
                  widget={widget} 
                  data={data} 
                  widgetSize={widgetSize}
                />;
              case 'list':
                // Traitement spécial pour equipment-availability
                if (widget.id === 'equipment-availability') {
                  return <EquipmentAvailabilityWidget data={data} />;
                }
                // Traitement spécial pour leads-pipeline
                if (widget.id === 'leads-pipeline') {
                  return <SalesPipelineWidget data={data} />;
                }
                return <ListWidget
                  widget={widget}
                  data={data}
                  onShowDetails={onShowDetails}
                  onMarkRepairComplete={onMarkRepairComplete}
                  onAssignTechnician={onAssignTechnician}
                  onShowInterventionForm={onShowInterventionForm}
                />;
              case 'chart':
                console.log('[DEBUG] Rendu du widget chart enrichi pour:', widget.id);
                if (widget.id === 'sales-chart') {
                  return <SalesEvolutionWidgetEnriched data={data} />;
                }
                return <ChartWidget
                  widget={widget}
                  data={data}
                  onShowDetails={onShowDetails}
                  onShowInterventionForm={onShowInterventionForm}
                />;
              case 'calendar':
                return <CalendarWidget
                  widget={widget}
                  data={getCalendarData(widget.id)}
                  onShowRentalForm={() => {}}
                  onUpdateStatus={() => {}}
                  onShowRentalDetails={() => {}}
                  onEditRental={() => {}}
                />;
              case 'map':
                return <MapWidget widget={widget} data={getMapData(widget.id)} />;
              case 'equipment':
                console.log('[DEBUG] Rendu du widget equipment pour:', widget.id);
                return <EquipmentAvailabilityWidget data={getEquipmentAvailabilityData(widget.id)} />;
              case 'maintenance':
                console.log('[DEBUG] Rendu du widget maintenance pour:', widget.id);
                return <PreventiveMaintenanceWidget data={getMaintenanceData(widget.id)} />;
              case 'performance':
                console.log('[DEBUG] Rendu du widget performance pour:', widget.id);
                if (widget.id === 'sales-metrics') {
                  return <SalesPerformanceScoreWidget data={data} />;
                }
                return <PerformanceScoreWidget data={data} />;
              case 'daily-actions':
                console.log('[DEBUG] Rendu du widget daily-actions pour:', widget.id);
                return <DailyActionsPriorityWidget data={data} widgetSize={widgetSize} />;
              default:
                return (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                    <div className="text-sm">Type de widget non supporté</div>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);
// Composant pour afficher les détails d'une location
// Composant pour éditer une location existante
// Widget Actions Prioritaires du Jour avec IA

export default function EnterpriseDashboard() {
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [layout, setLayout] = useState<{ [key: string]: WidgetLayout[] }>({ lg: [] });
  const [dataVersion, setDataVersion] = useState(0);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [showEditRentalForm, setShowEditRentalForm] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMetier, setSelectedMetier] = useState<string>('vendeur');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const handleShowDetails = (content: React.ReactNode) => {
    setModalContent(content);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Session utilisateur trouvée:', session);
          setIsAuthenticated(true);
        } else {
          console.error('❌ AUCUNE SESSION UTILISATEUR TROUVÉE. Veuillez vous connecter pour voir les données.');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setIsAuthenticated(false);
      } finally {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  // Système de rafraîchissement automatique
  useEffect(() => {
    if (!isAuthenticated) return;

    // Démarrer le rafraîchissement automatique toutes les 2 minutes
    const interval = setInterval(() => {
      console.log('🔄 Rafraîchissement automatique des données...');
      refreshDashboardData();
    }, 120000); // 2 minutes

    setAutoRefreshInterval(interval);

    // Nettoyer l'intervalle lors du démontage
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated]);

  // Nettoyer l'intervalle lors du démontage du composant
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  useEffect(() => {
    // 1. Essayer de charger la configuration depuis le DashboardConfigurator
    const savedConfig = localStorage.getItem('enterpriseDashboardConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      console.log('🎯 [DEBUG] Configuration trouvée:', config.metier, 'Widgets:', config.widgets?.length);
      
      if (config.widgets && config.widgets.length > 0) {
        // Configuration du DashboardConfigurator trouvée
        const widgets: Widget[] = config.widgets.map((widget: any, index: number) => ({
          id: widget.id,
          type: widget.type as any,
          title: widget.title,
          description: widget.description,
          icon: iconMap[widget.icon?.name] || Target,
          enabled: widget.enabled !== false,
          dataSource: widget.dataSource,
          isCollapsed: false,
          position: widget.position || index
        }));
        
        const dashboardConfig: DashboardConfig = { 
          widgets, 
          theme: 'light', 
          layout: 'grid', 
          refreshInterval: 30, 
          notifications: true 
        };
        
        setDashboardConfig(dashboardConfig);
        setSelectedMetier(config.metier || 'vendeur');
        
        // Générer le layout
        if (config.layout?.lg) {
          setLayout(config.layout);
        } else {
          const defaultLayout = generateLayout(widgets);
          setLayout({ lg: defaultLayout });
        }
      } else {
        // Fallback vers la configuration par défaut vendeur
        loadDefaultVendeurConfig();
      }
    } else {
      // Aucune configuration trouvée, charger la configuration par défaut vendeur
      loadDefaultVendeurConfig();
    }
    setLoading(false);
  }, []);

  // Fonction pour charger la configuration par défaut vendeur
  const loadDefaultVendeurConfig = () => {
    console.log('🔄 [DEBUG] Chargement de la configuration par défaut vendeur');
    const widgets: Widget[] = VendeurWidgets.widgets.map((widget, index) => {
      console.log("🔍 [DEBUG] Widget trouvé:", widget.id, "Type:", widget.type, "Titre:", widget.title);
      
      // Log spécial pour le widget sales-evolution
      if (widget.id === 'sales-evolution') {
        console.log("🎯 [DEBUG] Widget sales-evolution trouvé dans la configuration!");
        console.log("🎯 [DEBUG] Détails du widget:", {
          id: widget.id,
          type: widget.type,
          title: widget.title,
          dataSource: widget.dataSource,
          priority: widget.priority
        });
      }
      
      return {
        id: widget.id,
        type: widget.type as any,
        title: widget.title,
        description: widget.description,
        icon: iconMap[widget.icon.name] || Target,
        enabled: true, // Activer tous les widgets enrichis
        dataSource: widget.dataSource,
        isCollapsed: false,
        position: index
      };
    });
    const defaultConfig: DashboardConfig = { widgets, theme: 'light', layout: 'grid', refreshInterval: 30, notifications: true };
    setDashboardConfig(defaultConfig);
    const defaultLayout = generateLayout(widgets);
    setLayout({ lg: defaultLayout });
    setSelectedMetier('vendeur');
  };

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [techs, equip] = await Promise.all([
          getTechnicians(),
          getEquipmentList()
        ]);
        setTechnicians(techs);
        setEquipment(equip);
      } catch (error) {
        console.error('Erreur lors du chargement des données de référence:', error);
      }
    };
    loadReferenceData();
  }, []);

  const generateLayout = (widgets: Widget[]): WidgetLayout[] => {
    // Trier les widgets par position pour respecter l'ordre de réorganisation
    const sortedWidgets = widgets.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    console.log("📐 [DEBUG] Génération du layout pour", sortedWidgets.length, "widgets");
    console.log("📐 [DEBUG] Widgets dans le layout:", sortedWidgets.map(w => ({ id: w.id, title: w.title, position: w.position })));

    return sortedWidgets.map((widget, index) => {
      // Disposition 1/3 - 2/3 : les 2 premiers widgets à gauche (1/3), les 2 suivants à droite (2/3)
      if (index < 2) {
        // Colonne gauche (1/3) - widgets 0 et 1
        return {
          i: widget.id,
          x: 0, // Position x = 0 (début)
          y: index, // Position y = 0 pour le premier, 1 pour le deuxième
          w: 4, // Largeur = 4 colonnes sur 12 (1/3)
          h: 2, // Hauteur = 2 unités
        };
      } else if (index < 4) {
        // Colonne droite (2/3) - widgets 2 et 3
        return {
          i: widget.id,
          x: 4, // Position x = 4 (après la colonne gauche)
          y: index - 2, // Position y = 0 pour le troisième, 1 pour le quatrième
          w: 8, // Largeur = 8 colonnes sur 12 (2/3)
          h: 2, // Hauteur = 2 unités
        };
      } else {
        // Widgets supplémentaires (au-delà de 4) - disposition en grille complète
        const row = Math.floor((index - 4) / 3);
        const col = (index - 4) % 3;
        return {
          i: widget.id,
          x: col * 4, // 3 colonnes de 4 unités chacune
          y: row + 2, // Commencer après les 2 premières lignes
          w: 4, // Largeur = 4 colonnes
          h: 2, // Hauteur = 2 unités
        };
      }
    });
  };

  const onLayoutChange = (layout: WidgetLayout[], allLayouts: { [key: string]: WidgetLayout[] }) => {
    setLayout(allLayouts);
    // Sauvegarder dans localStorage
    const savedConfig = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
    savedConfig.layouts = allLayouts;
    localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(savedConfig));
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!dashboardConfig) return;
    const newWidgets = dashboardConfig.widgets.filter(w => w.id !== widgetId);
    setDashboardConfig({ ...dashboardConfig, widgets: newWidgets });

    // Remove from layouts
    const newLayouts = { ...layout };
    for (const key in newLayouts) {
        newLayouts[key] = newLayouts[key].filter(l => l.i !== widgetId);
    }
    setLayout(newLayouts);

    // Persist changes
    const savedConfig = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
    savedConfig.dashboardConfig = { ...dashboardConfig, widgets: newWidgets };
    savedConfig.layouts = newLayouts;
    localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(savedConfig));
  };

  const handleToggleSize = (widgetId: string) => {
    const newLayouts = { ...layout };
    let changed = false;
    for (const key in newLayouts) {
        newLayouts[key] = newLayouts[key].map(l => {
            if (l.i === widgetId) {
                changed = true;
                // Cycle through 1/3, 2/3, 3/3 width. Assume 12 columns.
                const currentW = l.w;
                let nextW;
                if (currentW < 8) nextW = 8; // 2/3
                else if (currentW < 12) nextW = 12; // 3/3
                else nextW = 4; // 1/3
                return { ...l, w: nextW, h: l.h }; // Keep height for now
            }
            return l;
        });
    }

    if (changed) {
        setLayout(newLayouts);
        // Persist changes
        const savedConfig = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
        savedConfig.layouts = newLayouts;
        localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(savedConfig));
    }
  };

  const handleToggleVisibility = (widgetId: string) => {
    if (!dashboardConfig) return;
    const newWidgets = dashboardConfig.widgets.map(w => {
        if (w.id === widgetId) {
            return { ...w, isCollapsed: !w.isCollapsed };
        }
        return w;
    });
    const newConfig = { ...dashboardConfig, widgets: newWidgets };
    setDashboardConfig(newConfig);

    // Persist changes
    const savedConfig = JSON.parse(localStorage.getItem('enterpriseDashboardConfig') || '{}');
    savedConfig.dashboardConfig = newConfig;
    localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(savedConfig));
  };

  const handleMarkRepairComplete = async (repairId: string) => {
    try {
      await updateRepairStatus(repairId, 'Terminé');
      // Recharger les données du dashboard
      if (dashboardConfig) {
        const newConfig = { ...dashboardConfig };
        setDashboardConfig(newConfig);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleAssignTechnician = async (repairId: string, technicianId: string, technicianName: string) => {
    try {
      await assignTechnicianToRepair(repairId, technicianId, technicianName);
      // Recharger les données du dashboard
      if (dashboardConfig) {
        const newConfig = { ...dashboardConfig };
        setDashboardConfig(newConfig);
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  const handleCreateIntervention = async (formData: any) => {
    try {
      console.log('Création d\'une nouvelle intervention avec les données:', formData);
      await createIntervention(formData);
      setShowInterventionForm(false);
      refreshDashboardData();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleCreateRental = async (formData: any) => {
    try {
      await createRental(formData);
      setShowRentalForm(false);
      refreshDashboardData();
    } catch (error) {
      console.error('Erreur lors de la création de la location:', error);
    }
  };

  const handleUpdateRentalStatus = async (rentalId: string, status: string) => {
    try {
      await updateRentalStatus(rentalId, status);
      refreshDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const refreshDashboardData = () => {
    console.log('🔄 Rafraîchissement des données du tableau de bord...');
    setDataVersion(prevVersion => prevVersion + 1);
  };

  // Ajouter la fonction saveDashboardConfig
  const saveDashboardConfig = () => {
    if (dashboardConfig) {
      const savedConfig = {
        ...dashboardConfig,
        layouts: layout
      };
      localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(savedConfig));
    }
  };

  const handleSaveDashboard = () => {
    if (!dashboardConfig) return;

    // Créer un nom unique pour la sauvegarde avec timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const dashboardName = `Tableau de bord ${selectedMetier} - ${timestamp}`;

    const savedConfig = {
      name: dashboardName,
      dashboardConfig,
      layouts: layout,
      metier: selectedMetier,
      savedAt: new Date().toISOString()
    };

    // Récupérer les sauvegardes existantes
    const existingSaves = JSON.parse(localStorage.getItem('enterpriseDashboardSaves') || '[]');
    existingSaves.push(savedConfig);

    // Garder seulement les 10 dernières sauvegardes
    if (existingSaves.length > 10) {
      existingSaves.splice(0, existingSaves.length - 10);
    }

    localStorage.setItem('enterpriseDashboardSaves', JSON.stringify(existingSaves));

    // Sauvegarder aussi la configuration actuelle
    saveDashboardConfig();

    // Afficher la modale de confirmation
    setShowSaveModal(true);
  };

  const handleLoadDashboard = () => {
    const existingSaves = JSON.parse(localStorage.getItem('enterpriseDashboardSaves') || '[]');

    if (existingSaves.length === 0) {
      alert('Aucune sauvegarde trouvée.');
      return;
    }

    // Charger les sauvegardes dans l'état
    setSavedDashboards(existingSaves);
    setShowLoadModal(true);
  };

  const handleLoadSelectedDashboard = (index: number) => {
    const selectedSave = savedDashboards[index];

    // Charger la configuration
    setDashboardConfig(selectedSave.dashboardConfig);
    setLayout(selectedSave.layouts);
    setSelectedMetier(selectedSave.metier);

    // Sauvegarder comme configuration actuelle
    localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(selectedSave));

    // Fermer la modale
    setShowLoadModal(false);

    alert(`Tableau de bord "${selectedSave.name}" chargé avec succès.`);
  };

  const handleShowRentalDetails = (rental: any) => {
    setSelectedRental(rental);
    setShowRentalDetails(true);
  };

  const handleCloseRentalDetails = () => {
    setShowRentalDetails(false);
    setSelectedRental(null);
  };

  const handleEditRental = (rental: any) => {
    setSelectedRental(rental);
    setShowEditRentalForm(true);
  };

  const handleCloseEditRental = () => {
    setShowEditRentalForm(false);
    setSelectedRental(null);
  };

  const handleUpdateRental = async (formData: any) => {
    try {
      if (!selectedRental) return;

      // Préparer les données pour la mise à jour
      const updateData = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_price: parseFloat(formData.total_price),
        status: formData.status
      };

      // Mettre à jour la location dans la base de données
      await updateRental(selectedRental.id, updateData);

      // Fermer le formulaire d'édition
      setShowEditRentalForm(false);
      setSelectedRental(null);

      // Recharger les données du dashboard
      refreshDashboardData();

      console.log('Location mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la location:', error);
    }
  };

  if (!sessionChecked) {
    return <div className="p-8 text-center">Vérification de la session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Vous n'êtes pas connecté. Veuillez vous connecter pour accéder au tableau de bord.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de Bord Entreprise
              </h1>
              <p className="text-sm text-gray-600">
                {selectedMetier && `Métier: ${selectedMetier.charAt(0).toUpperCase() + selectedMetier.slice(1)}`}
                {dashboardConfig && dashboardConfig.widgets && (
                  <span className="ml-2 text-orange-600">
                    • {dashboardConfig.widgets.filter(w => w.enabled).length} widgets actifs
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.hash = '#entreprise'}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des widgets
              </button>

              <button
                onClick={handleSaveDashboard}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                title="Enregistrer le tableau de bord"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </button>

              <button
                onClick={handleLoadDashboard}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                title="Charger un tableau de bord sauvegardé"
              >
                <Download className="h-4 w-4 mr-2" />
                Charger
              </button>

              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={refreshDashboardData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Rafraîchir les données"
              >
                <RefreshCw className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Communs - Affichés seulement quand le dashboard est configuré */}
        {dashboardConfig && dashboardConfig.widgets && layout.lg && layout.lg.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                Services en commun
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  📧 Messages prioritaires
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <a
                  href="#vitrine"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <Globe className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Vitrine</span>
                </a>
                <a
                  href="#publication"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <FileText className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Publication</span>
                </a>
                <a
                  href="#devis"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <DollarSign className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Devis</span>
                </a>
                <a
                  href="#documents"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <Package className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Documents</span>
                </a>
                <a
                  href="#messages"
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 rounded-lg transition-all duration-300 group border-2 border-orange-300 shadow-md hover:shadow-lg relative overflow-hidden"
                >
                  {/* Indicateur de nouveaux messages */}
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  
                  <Mail className="h-6 w-6 text-orange-700 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-orange-800">Boîte de réception</span>
                  
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>
                <a
                  href="#planning"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <Calendar className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Planning</span>
                </a>
                <a
                  href="#assistant-ia"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <Zap className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Assistant IA</span>
                </a>
                <a
                  href="#dashboard-entreprise"
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                >
                  <BarChart3 className="h-6 w-6 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Tableau de bord</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {dashboardConfig && dashboardConfig.widgets && layout.lg && layout.lg.length > 0 && (
          <ResponsiveGridLayout
            className="layout"
            layouts={layout}
            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
            cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
            rowHeight={100}
            onLayoutChange={(currentLayout, allLayouts) => {
              setLayout(allLayouts);
              saveDashboardConfig();
            }}
            draggableHandle=".handle"
          >
            {dashboardConfig && dashboardConfig.widgets && dashboardConfig.widgets
              .filter((widget) => widget.enabled)
              .slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((widget) => {
                // Déterminer la taille du widget basée sur sa largeur dans la grille
                const widgetLayout = layout?.lg?.find((l: any) => l.i === widget.id);
                const widgetWidth = widgetLayout?.w || 1;
                let widgetSize: 'small' | 'normal' | 'large' = 'normal';
                
                if (widgetWidth <= 2) {
                  widgetSize = 'small';
                } else if (widgetWidth >= 4) {
                  widgetSize = 'large';
                }
                
                return (
                  <div key={widget.id}>
                    <WidgetComponent
                      widget={widget}
                      onRemove={handleRemoveWidget}
                      onToggleSize={handleToggleSize}
                      onToggleVisibility={handleToggleVisibility}
                      onShowDetails={handleShowDetails}
                      onMarkRepairComplete={handleMarkRepairComplete}
                      onAssignTechnician={handleAssignTechnician}
                      onShowInterventionForm={() => setShowInterventionForm(true)}
                      onShowRentalForm={() => setShowRentalForm(true)}
                      onUpdateRentalStatus={handleUpdateRentalStatus}
                      onShowRentalDetails={handleShowRentalDetails}
                      onEditRental={handleEditRental}
                      dataVersion={dataVersion}
                      widgetSize={widgetSize}
                    />
                  </div>
                );
              })}
          </ResponsiveGridLayout>
        )}

        {(!dashboardConfig || !dashboardConfig.widgets || dashboardConfig.widgets.length === 0) && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <Layout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun widget configuré
              </h3>
              <p className="text-gray-600 mb-4">
                Configurez votre tableau de bord en allant dans le configurateur entreprise.
              </p>
              <button
                onClick={() => window.location.hash = '#entreprise'}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Configurer mon tableau de bord
              </button>
            </div>
          </div>
        )}
      </main>

      {showInterventionForm && (
        <Modal title="Nouvelle Intervention" onClose={() => setShowInterventionForm(false)}>
          <InterventionForm onClose={() => setShowInterventionForm(false)} onSubmit={handleCreateIntervention} equipment={equipment} technicians={technicians} />
        </Modal>
      )}

      {showRentalForm && (
        <Modal title="Nouvelle Location" onClose={() => setShowRentalForm(false)}>
          <RentalForm onClose={() => setShowRentalForm(false)} onSubmit={handleCreateRental} equipment={equipment} />
        </Modal>
      )}

      {showEditRentalForm && selectedRental && (
        <Modal title="Modifier la Location" onClose={handleCloseEditRental}>
          <EditRentalForm
            rental={selectedRental}
            onClose={handleCloseEditRental}
            onSubmit={handleUpdateRental}
            equipment={equipment}
          />
        </Modal>
      )}

      {showRentalDetails && selectedRental && (
        <RentalDetailsModal rental={selectedRental} onClose={handleCloseRentalDetails} />
      )}

      {modalContent && (
        <Modal title="Détails" onClose={() => setModalContent(null)}>
          {modalContent}
        </Modal>
      )}

      {/* Modale de confirmation de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Sauvegarde réussie</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-center text-gray-700 mb-6">
                Votre tableau de bord a été sauvegardé avec succès !
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de chargement des sauvegardes */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Charger un tableau de bord</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {savedDashboards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Aucune sauvegarde trouvée.</p>
                  <p className="text-sm text-gray-500 mt-2">Sauvegardez d'abord votre tableau de bord actuel.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDashboards.map((save, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleLoadSelectedDashboard(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{save.name}</h4>
                          <p className="text-sm text-gray-600">
                            Métier: {save.metier.charAt(0).toUpperCase() + save.metier.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Sauvegardé le: {new Date(save.savedAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            {save.dashboardConfig?.widgets?.filter((w: any) => w.enabled).length || 0} widgets
                          </span>
                          <Download className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {savedDashboards.length} sauvegarde{savedDashboards.length > 1 ? 's' : ''} disponible{savedDashboards.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Configuration des widgets par métier
const widgetConfigs = {
  vendeur: [
    { id: 'daily-actions', type: 'daily-actions', title: 'Actions Commerciales Prioritaires', description: 'Liste des tâches urgentes du jour (appels, relances, devis) triées par impact/priorité', icon: 'AlertTriangle', enabled: true, dataSource: 'daily-actions', isCollapsed: false, position: 0 },
    { id: 'sales-metrics', type: 'performance', title: 'Score de Performance Commerciale', description: 'Votre performance globale avec recommandations IA', icon: 'Target', enabled: true, dataSource: 'performance-score', isCollapsed: false, position: 1 },
    { id: 'inventory-status', type: 'list', title: 'Plan d\'action stock & revente', description: 'Statut stock dormant, recommandations automatiques, actions rapides, et KPI', enabled: true, position: 2 },
    { id: 'sales-chart', type: 'chart', title: 'Évolution des ventes', description: 'Analyse des tendances, prévisions et export', icon: 'TrendingUp', enabled: true, dataSource: 'sales-evolution', isCollapsed: false, advanced: true, options: { periodSelector: true, metrics: ['CA', 'Ventes', 'Prévision'], export: true, analysis: true }, position: 3 },
    { id: 'leads-pipeline', type: 'list', title: 'Pipeline commercial', enabled: true, position: 4 }
  ],
  loueur: [
    { id: 'rental-revenue', type: 'metric', title: 'Revenus de location', enabled: true },
    { id: 'equipment-availability', type: 'equipment', title: 'Disponibilité Équipements', enabled: true },
    { id: 'equipment-usage', type: 'chart', title: 'Utilisation équipements', enabled: true },
    { id: 'upcoming-rentals', type: 'calendar', title: 'Locations à venir', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true },
    { id: 'delivery-map', type: 'map', title: 'Carte des livraisons', enabled: true },
    { id: 'rental-pipeline', type: 'pipeline', title: 'Pipeline de location', enabled: true },
    { id: 'rental-contracts', type: 'list', title: 'Contrats de location', enabled: true },
    { id: 'delivery-schedule', type: 'calendar', title: 'Planning des livraisons', enabled: true },
    { id: 'rental-analytics', type: 'chart', title: 'Analytics de location', enabled: true },
    { id: 'daily-actions', type: 'daily-actions', title: 'Actions prioritaires du jour', enabled: true },
    { id: 'rental-notifications', type: 'notifications', title: 'Notifications de location', enabled: true }
  ],
  mecanicien: [
    { id: 'daily-interventions', type: 'metric', title: 'Interventions du jour', enabled: true },
    { id: 'repair-status', type: 'list', title: 'État des réparations', enabled: true },
    { id: 'spare-parts-stock', type: 'chart', title: 'Stock pièces détachées', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true },
    { id: 'driver-schedule', type: 'calendar', title: 'Planning chauffeurs', enabled: true },
    { id: 'gps-tracking', type: 'list', title: 'Suivi GPS', enabled: true }
  ],
  transporteur: [
    { id: 'active-deliveries', type: 'metric', title: 'Livraisons actives', enabled: true },
    { id: 'gps-tracking', type: 'list', title: 'Suivi GPS', enabled: true },
    { id: 'transport-costs', type: 'chart', title: 'Coûts de transport', enabled: true },
    { id: 'driver-schedule', type: 'calendar', title: 'Planning chauffeurs', enabled: true },
    { id: 'delivery-map', type: 'map', title: 'Carte des livraisons', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true }
  ],
  transitaire: [
    { id: 'custom-declarations', type: 'metric', title: 'Déclarations douanières', enabled: true },
    { id: 'documents', type: 'list', title: 'Documents', enabled: true },
    { id: 'import-export-stats', type: 'chart', title: 'Statistiques I/E', enabled: true },
    { id: 'container-tracking', type: 'map', title: 'Suivi conteneurs', enabled: true },
    { id: 'intervention-schedule', type: 'calendar', title: 'Planning interventions', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true }
  ],
  logisticien: [
    { id: 'warehouse-occupancy', type: 'metric', title: 'Taux d\'occupation', enabled: true },
    { id: 'stock-alerts', type: 'list', title: 'Alertes stock', enabled: true },
    { id: 'supply-chain-kpis', type: 'chart', title: 'KPIs Supply Chain', enabled: true },
    { id: 'route-optimization', type: 'map', title: 'Optimisation routes', enabled: true },
    { id: 'intervention-schedule', type: 'calendar', title: 'Planning interventions', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true }
  ],
  prestataire: [
    { id: 'active-projects', type: 'metric', title: 'Projets actifs', enabled: true },
    { id: 'service-revenue', type: 'chart', title: 'CA par service', enabled: true },
    { id: 'intervention-schedule', type: 'calendar', title: 'Planning interventions', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true },
    { id: 'documents', type: 'list', title: 'Documents', enabled: true },
    { id: 'delivery-map', type: 'map', title: 'Carte des livraisons', enabled: true }
  ],
  investisseur: [
    { id: 'portfolio-value', type: 'metric', title: 'Valeur portefeuille', enabled: true },
    { id: 'roi-analysis', type: 'chart', title: 'Analyse ROI', enabled: true },
    { id: 'preventive-maintenance', type: 'maintenance', title: 'Maintenance préventive', enabled: true },
    { id: 'documents', type: 'list', title: 'Documents', enabled: true },
    { id: 'intervention-schedule', type: 'calendar', title: 'Planning interventions', enabled: true },
    { id: 'delivery-map', type: 'map', title: 'Carte des livraisons', enabled: true }
  ]
};

// Fonction pour rendre le contenu du widget
const renderWidgetContent = (widget: any, widgetSize: 'small' | 'normal' | 'large' = 'normal') => {
  console.log('[DEBUG] Appel widget ID:', widget.id);
  console.log('[DEBUG] renderWidgetContent appelée avec widget:', widget);
  console.log('[DEBUG] Type de widget:', widget.type);
  console.log('[DEBUG] Titre du widget:', widget.title);

  // Cas spécial pour le widget "Plan d'action stock & revente" (anciennement "État du stock")
  if (widget.id === 'stock-status' || widget.id === 'inventory-status' || widget.id === 'stock-action') {
    return <InventoryStatusWidget data={getListData(widget.id)} />;
  }

  // Cas spécial pour le widget "Évolution des ventes enrichie"
  if (widget.id === 'sales-evolution' || widget.id === 'sales-chart') {
    console.log('🎯 [DEBUG] Widget sales-evolution détecté! Rendu du composant enrichi');
    try {
      // Récupérer les données pour le widget d'évolution des ventes
      const salesData = getChartData(widget.id);
      console.log('📊 [DEBUG] Données récupérées pour sales-evolution:', salesData);
      return <SalesEvolutionWidgetEnriched data={salesData} />;
    } catch (err) {
      console.error('❌ [ERROR] Erreur rendering SalesEvolutionWidgetEnriched:', err);
      return <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Erreur de rendu du widget enrichi</h3>
        <p className="text-red-600 text-sm">ID: {widget.id}</p>
        <p className="text-red-600 text-sm">Erreur: {err instanceof Error ? err.message : String(err)}</p>
      </div>;
    }
  }

  // Cas spécial pour le widget "Actions prioritaires du jour"
  if (widget.id === 'daily-actions') {
    console.log('[DEBUG] Widget daily-actions détecté, utilisation de getDailyActionsData');
    return <DailyActionsPriorityWidget data={getDailyActionsData(widget.id)} widgetSize={widgetSize} />;
  }

  // Cas spécial pour le widget "Pipeline commercial"
  if (widget.id === 'sales-pipeline') {
    return <SalesPipelineWidget data={getListData(widget.id)} />;
  }



  // Cas spécial pour le widget "Score de performance commerciale"
  if (widget.id === 'performance-score') {
    return <PerformanceScoreWidget data={getPerformanceScoreData()} />;
  }

  // Cas spécial pour le widget "Assistant Prospection Active"
  if (widget.id === 'prospection-assistant') {
    return <SalesPipelineWidget data={getListData(widget.id)} />;
  }

  // Cas spécial pour le widget "Actions prioritaires du jour"
  if (widget.id === 'daily-priority-actions') {
    return <DailyActionsWidget data={getListData(widget.id)} />;
  }

  // Cas spécial pour le widget "Actions commerciales prioritaires"
  if (widget.id === 'daily-actions-priority' || widget.type === 'daily-actions') {
    return <DailyActionsPriorityWidget data={getListData(widget.id)} widgetSize={widgetSize} />;
  }

  // Cas spécial pour le widget "Notifications"
  if (widget.id === 'notifications') {
    return <NotificationsWidget data={getNotificationsData(widget.id)} />;
  }

  // Cas spécial pour les widgets KPIs avancés
  if (widget.id === 'operational-efficiency' || widget.id === 'financial-performance' || widget.id === 'customer-satisfaction') {
    return <AdvancedKPIsWidget data={getAdvancedKPIsData(widget.id)} />;
  }

  // Cas spécial pour les widgets de planification
  if (widget.id === 'weekly-schedule' || widget.id === 'monthly-overview') {
    return <PlanningWidget data={getPlanningData(widget.id)} />;
  }

  switch (widget.type) {
    case 'metric':
      return <MetricWidget widget={widget} data={getMetricData(widget.id)} />;
    case 'list':
      return <ListWidget
        widget={widget}
        data={getListData(widget.id)}
        onShowDetails={() => {}}
        onMarkRepairComplete={() => {}}
        onAssignTechnician={() => {}}
        onShowInterventionForm={() => {}}
      />;
    case 'chart':
      // Cas spécial pour le widget "Évolution des ventes enrichie"
      if (widget.id === 'sales-evolution' || widget.id === 'sales-chart') {
        console.log('🎯 [DEBUG] Widget sales-evolution/sales-chart détecté! Rendu du composant enrichi');
        try {
          const chartData = getChartData(widget.id);
          console.log('📊 [DEBUG] Données pour le widget enrichi:', chartData);
          return <SalesEvolutionWidgetEnriched data={chartData} />;
        } catch (err) {
          console.error('❌ [ERROR] Erreur rendering SalesEvolutionWidgetEnriched:', err);
          return <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold">Erreur de rendu du widget enrichi</h3>
            <p className="text-red-600 text-sm">ID: {widget.id}</p>
            <p className="text-red-600 text-sm">Erreur: {err instanceof Error ? err.message : String(err)}</p>
          </div>;
        }
      }
      // Pour les autres widgets de type chart
      return <ChartWidget
        widget={widget}
        data={getChartData(widget.id)}
        onShowDetails={() => {}}
        onShowInterventionForm={() => {}}
      />;
    case 'calendar':
      return <CalendarWidget
        widget={widget}
        data={getCalendarData(widget.id)}
        onShowRentalForm={() => {}}
        onUpdateStatus={() => {}}
        onShowRentalDetails={() => {}}
        onEditRental={() => {}}
      />;
    case 'map':
      return <MapWidget widget={widget} data={getMapData(widget.id)} />;
    case 'equipment':
      console.log('[DEBUG] Rendu du widget equipment pour:', widget.id);
      return <EquipmentAvailabilityWidget data={getEquipmentAvailabilityData(widget.id)} />;
    case 'maintenance':
      console.log('[DEBUG] Rendu du widget maintenance pour:', widget.id);
      return <PreventiveMaintenanceWidget data={getMaintenanceData(widget.id)} />;
    case 'notifications':
      console.log('[DEBUG] Rendu du widget notifications pour:', widget.id);
      return <NotificationsWidget data={getNotificationsData(widget.id)} />;
    case 'performance':
      console.log('[DEBUG] Rendu du widget performance pour:', widget.id);
      if (widget.id === 'sales-metrics') {
        return <SalesPerformanceScoreWidget data={getSalesPerformanceScoreData()} />;
      }
      return <PerformanceScoreWidget data={getPerformanceScoreData()} />;
    case 'pipeline':
      console.log('[DEBUG] Rendu du widget pipeline pour:', widget.id);
      if (widget.id === 'sales-pipeline') {
        return <SalesPipelineWidget data={getListData(widget.id)} />;
      }
      return <div>Pipeline non reconnu: {widget.id}</div>;
    case 'priority':
      console.log('[DEBUG] Rendu du widget priority pour:', widget.id);
      if (widget.id === 'daily-actions') {
        return <DailyActionsPriorityWidget data={getDailyActionsData(widget.id)} widgetSize={widgetSize} />;
      }
      return <div>Widget priorité non reconnu: {widget.id}</div>;
    case 'daily-actions':
      console.log('[DEBUG] Rendu du widget daily-actions pour:', widget.id);
      return <DailyActionsPriorityWidget data={getDailyActionsData(widget.id)} widgetSize={widgetSize} />;
    case 'analytics':
      console.log('[DEBUG] Rendu du widget analytics pour:', widget.id);
      return <div>Widget analytics: {widget.title}</div>;
    default:
      console.log('[DEBUG] Type de widget non reconnu:', widget.type);
      return <div>Type de widget non reconnu: {widget.type}</div>;
  }
};

// Fonction pour récupérer les données métriques
const getMetricData = (widgetId: string) => {
  // Données simulées pour les métriques
  const metricData = {
    'sales-metrics': { value: '2.4M MAD', change: '+12%', trend: 'up' },
    'monthly-sales': { value: '2.4M MAD', change: '+12%', trend: 'up' },
    'rental-revenue': { value: '850K MAD', change: '+8%', trend: 'up' },
    'daily-interventions': { value: '15', change: '+3', trend: 'up' },
    'active-deliveries': { value: '8', change: '-2', trend: 'down' },
    'custom-declarations': { value: '24', change: '+5', trend: 'up' },
    'warehouse-occupancy': { value: '78%', change: '+3%', trend: 'up' },
    'active-projects': { value: '12', change: '+2', trend: 'up' },
    'portfolio-value': { value: '15.2M MAD', change: '+18%', trend: 'up' }
  };
  return metricData[widgetId as keyof typeof metricData] || { value: '0', change: '0%', trend: 'neutral' };
};

// Nouvelle fonction pour le Score de Performance Commerciale
// Fonction pour le Score de Performance Commerciale (widget Ventes du mois transformé)
// Fonction pour récupérer les données réelles de performance commerciale
const getSalesPerformanceScoreData = async () => {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Utilisateur non connecté, utilisation des données par défaut');
      return getDefaultPerformanceData();
    }

    // Récupérer les données de vente réelles avec gestion d'erreur
    let salesData = null;
    let salesError = null;
    try {
      const salesResult = await supabase
        .from('sales')
        .select('*')
        .eq('seller_id', user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte('created_at', new Date().toISOString());
      salesData = salesResult.data;
      salesError = salesResult.error;
    } catch (error) {
      console.log('Erreur lors de la récupération des ventes:', error);
      salesData = [];
    }

    // Récupérer les prospects réels avec gestion d'erreur
    let prospectsData = null;
    let prospectsError = null;
    try {
      const prospectsResult = await supabase
        .from('prospects')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active');
      prospectsData = prospectsResult.data;
      prospectsError = prospectsResult.error;
    } catch (error) {
      console.log('Erreur lors de la récupération des prospects:', error);
      prospectsData = [];
    }

    // Récupérer les objectifs de l'utilisateur avec gestion d'erreur
    let targetsData = null;
    try {
      const targetsResult = await supabase
        .from('user_targets')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'monthly')
        .single();
      targetsData = targetsResult.data;
    } catch (error) {
      console.log('Erreur lors de la récupération des objectifs:', error);
      targetsData = null;
    }

    // Récupérer les temps de réponse moyens avec gestion d'erreur
    let responseData = null;
    try {
      const responseResult = await supabase
        .from('prospect_interactions')
        .select('response_time')
        .eq('seller_id', user.id)
        .not('response_time', 'is', null)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      responseData = responseResult.data;
    } catch (error) {
      console.log('Erreur lors de la récupération des temps de réponse:', error);
      responseData = [];
    }

    // Calculer les métriques avec valeurs par défaut si les données sont manquantes
    const totalSales = salesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
    const salesTarget = targetsData?.sales_target || 3000000;
    const salesScore = Math.min(100, Math.round((totalSales / salesTarget) * 100));

    const activeProspects = prospectsData?.length || 0;
    const prospectsTarget = targetsData?.prospects_target || 10;
    const prospectsScore = Math.min(100, Math.round((activeProspects / prospectsTarget) * 100));

    // Calculer le temps de réponse moyen
    const avgResponseTime = responseData?.length > 0
      ? responseData.reduce((sum, interaction) => sum + (interaction.response_time || 0), 0) / responseData.length
      : 2.5;
    const responseTarget = targetsData?.response_time_target || 1.5;
    const responseScore = Math.min(100, Math.round((responseTarget / avgResponseTime) * 100));

    // Calculer la croissance (comparaison avec le mois précédent)
    let lastMonthTotal = 0;
    try {
      const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

      const { data: lastMonthSales } = await supabase
        .from('sales')
        .select('amount')
        .eq('seller_id', user.id)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      lastMonthTotal = lastMonthSales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
    } catch (error) {
      console.log('Erreur lors du calcul de la croissance:', error);
      lastMonthTotal = 0;
    }

    const growth = lastMonthTotal > 0 ? ((totalSales - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    const growthTarget = targetsData?.growth_target || 15;
    const growthScore = Math.min(100, Math.round((growth / growthTarget) * 100));

    // Calculer le score global
    const globalScore = Math.round((salesScore + prospectsScore + responseScore + growthScore) / 4);

    // Récupérer le rang parmi les vendeurs (anonymisé) avec gestion d'erreur
    let rank = 1;
    let totalVendors = 1;
    try {
      // Récupérer TOUS les vendeurs du site, pas seulement ceux avec des ventes récentes
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'vendeur');

      if (allUsers && allUsers.length > 0) {
        totalVendors = allUsers.length;

        // Calculer le rang basé sur les 3 derniers mois pour plus de stabilité
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: allSellersSales } = await supabase
          .from('sales')
          .select('seller_id, amount, created_at')
          .gte('created_at', threeMonthsAgo.toISOString());

        // Calculer les performances moyennes sur 3 mois
        const sellerPerformance = allSellersSales?.reduce((acc, sale) => {
          const sellerId = sale.seller_id as string;
          const amount = typeof sale.amount === 'number' ? sale.amount : 0;

          if (!acc[sellerId]) {
            acc[sellerId] = {
              totalSales: 0,
              salesCount: 0,
              avgResponseTime: 0,
              prospectsCount: 0
            };
          }

          acc[sellerId].totalSales += amount;
          acc[sellerId].salesCount += 1;
          return acc;
        }, {} as { [key: string]: { totalSales: number; salesCount: number; avgResponseTime: number; prospectsCount: number } }) || {};

        // Ajouter les données de prospects et temps de réponse
        const { data: allProspects } = await supabase
          .from('prospects')
          .select('seller_id, status')
          .gte('created_at', threeMonthsAgo.toISOString());

        allProspects?.forEach(prospect => {
          const sellerId = prospect.seller_id as string;
          if (sellerPerformance[sellerId]) {
            sellerPerformance[sellerId].prospectsCount += 1;
          }
        });

        // Créer un score pour TOUS les vendeurs, même ceux sans données récentes
        const sellerScores = allUsers.map(user => {
          const sellerData = sellerPerformance[user.id] || {
            totalSales: 0,
            salesCount: 0,
            avgResponseTime: 0,
            prospectsCount: 0
          };

          const avgSales = sellerData.salesCount > 0 ? sellerData.totalSales / sellerData.salesCount : 0;
          const prospectsScore = Math.min(100, (sellerData.prospectsCount / 10) * 100); // 10 prospects = 100%
          const salesScore = Math.min(100, (avgSales / 500000) * 100); // 500k = 100%

          // Score composite (ventes 60%, prospects 40%)
          const compositeScore = (salesScore * 0.6) + (prospectsScore * 0.4);

          return {
            sellerId: user.id,
            score: compositeScore,
            totalSales: sellerData.totalSales,
            prospectsCount: sellerData.prospectsCount
          };
        });

        // Trier par score composite
        sellerScores.sort((a, b) => b.score - a.score);

        // Trouver le rang de l'utilisateur actuel
        const userRank = sellerScores.findIndex(seller => seller.sellerId === user.id);
        rank = userRank >= 0 ? userRank + 1 : totalVendors;

        console.log(`📊 Rang calculé: ${rank}/${totalVendors} vendeurs sur le site`);
      } else {
        // Fallback si pas de données d'utilisateurs
        rank = Math.floor(Math.random() * 5) + 1;
        totalVendors = Math.max(5, totalVendors);
      }

    } catch (error) {
      console.log('Erreur lors du calcul du rang:', error);
      // Donner un rang réaliste même en cas d'erreur
      rank = Math.floor(Math.random() * 8) + 1; // Rang entre 1 et 8
      totalVendors = Math.max(totalVendors, 8);
    }

    // Déterminer le niveau d'activité
    let activityLevel = 'faible';
    if (globalScore >= 80) activityLevel = 'élevé';
    else if (globalScore >= 60) activityLevel = 'modéré';

    // Générer des recommandations basées sur les données réelles
    const recommendations = [];

    if (salesScore < 70) {
      recommendations.push({
        type: 'vente',
        action: 'Augmenter les efforts de vente',
        impact: '+15 points',
        priority: 'high',
        description: `Vous êtes à ${Math.round((totalSales / salesTarget) * 100)}% de votre objectif de vente`
      });
    }

    if (prospectsScore < 70) {
      recommendations.push({
        type: 'prospect',
        action: 'Développer votre pipeline prospects',
        impact: '+10 points',
        priority: 'medium',
        description: `Vous avez ${activeProspects} prospects actifs sur ${prospectsTarget} attendus`
      });
    }

    if (avgResponseTime > responseTarget) {
      recommendations.push({
        type: 'réactivité',
        action: 'Améliorer le temps de réponse',
        impact: '+8 points',
        priority: 'high',
        description: `Temps de réponse moyen: ${avgResponseTime.toFixed(1)}h (objectif: ${responseTarget}h)`
      });
    }

    if (growth < growthTarget) {
      recommendations.push({
        type: 'croissance',
        action: 'Stimuler la croissance des ventes',
        impact: '+12 points',
        priority: 'medium',
        description: `Croissance: ${growth.toFixed(1)}% (objectif: ${growthTarget}%)`
      });
    }

    // Si aucune recommandation n'a été générée, en ajouter une par défaut
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'général',
        action: 'Maintenir votre performance actuelle',
        impact: '+5 points',
        priority: 'low',
        description: 'Votre performance est satisfaisante, continuez ainsi'
      });
    }

    // Déterminer les tendances
    const trends = {
      sales: totalSales > lastMonthTotal ? 'up' : totalSales < lastMonthTotal ? 'down' : 'stable',
      growth: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable',
      prospects: activeProspects > (prospectsTarget * 0.8) ? 'up' : 'down',
      responseTime: avgResponseTime < responseTarget ? 'up' : 'down'
    };

    return {
      score: globalScore,
      target: 85,
      rank,
      totalVendors,
      sales: totalSales,
      salesTarget,
      growth: Math.round(growth * 10) / 10,
      growthTarget,
      prospects: activeProspects,
      activeProspects,
      responseTime: Math.round(avgResponseTime * 10) / 10,
      responseTarget,
      activityLevel,
      activityRecommendation: getActivityRecommendation(activityLevel),
      recommendations,
      trends,
      metrics: {
        sales: { value: totalSales, target: salesTarget, trend: trends.sales },
        growth: { value: Math.round(growth * 10) / 10, target: growthTarget, trend: trends.growth },
        prospects: { value: activeProspects, target: prospectsTarget, trend: trends.prospects },
        responseTime: { value: Math.round(avgResponseTime * 10) / 10, target: responseTarget, trend: trends.responseTime }
      }
    };

  } catch (error) {
    console.error('Erreur générale lors de la récupération des données de performance:', error);
    return await getDefaultPerformanceData();
  }
};

// Fonction pour générer des données par défaut quand il n'y a pas de données réelles
// Fonction helper pour les recommandations d'activité
const getActivityRecommendation = (level: string) => {
  switch (level) {
    case 'élevé':
      return 'Maintenir ce rythme et optimiser les processus';
    case 'modéré':
      return 'Augmenter les relances prospects et améliorer la conversion';
    case 'faible':
      return 'Intensifier les actions commerciales et la prospection';
    default:
      return 'Analyser les opportunités d\'amélioration';
  }
};

// Fonction pour récupérer les données de liste
// Fonction pour récupérer les données de disponibilité des équipements
// Composant spécialisé pour le Pipeline Commercial
// Composant spécialisé pour l'Évolution des Ventes
const ListWidget = ({
  widget,
  data,
  onShowDetails,
  onMarkRepairComplete,
  onAssignTechnician,
  onShowInterventionForm
}: {
  widget: Widget;
  data: any[];
  onShowDetails: (content: React.ReactNode) => void;
  onMarkRepairComplete: (repairId: string) => void;
  onAssignTechnician: (repairId: string, technicianId: string, technicianName: string) => void;
  onShowInterventionForm: () => void;
}) => {
  const IconComponent = typeof widget.icon === 'string' ? iconMap[widget.icon] : widget.icon;

  const renderListData = () => {
    // Spécifique pour 'repair-status'
    if (widget.id === 'repair-status') {
      const detailedView = (
              <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Détail des réparations</h3>
              <button
                onClick={onShowInterventionForm}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Nouvelle réparation
              </button>
            </div>
            <div className="space-y-2">
            {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center min-w-0">
                    {item.status === 'Terminé' && <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />}
                    {item.status === 'En cours' && <Wrench className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />}
                    {item.status === 'En attente' && <Clock className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{item.equipment}</div>
                    <div className="text-sm text-gray-600">Technicien: {item.technician}</div>
                    </div>
                </div>
                <div className="text-right ml-4">
                    <div className="text-sm font-medium text-gray-800">{item.estimated}</div>
                    <div className="text-xs text-gray-500">Délai estimé</div>
                    {item.status !== 'Terminé' && (
                      <button
                        onClick={() => onMarkRepairComplete(item.id)}
                        className="mt-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Terminer
                      </button>
                    )}
                </div>
                </div>
            ))}
            </div>
        </div>
      );

      return (
        <div className="space-y-2">
          {data.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0">
                {item.status === 'Terminé' && <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />}
                {item.status === 'En cours' && <Wrench className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />}
                {item.status === 'En attente' && <Clock className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{item.equipment}</div>
                  <div className="text-xs text-gray-600">Technicien: {item.technician}</div>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-xs font-medium text-gray-800">{item.estimated}</div>
                <div className="text-xs text-gray-500">Délai</div>
                {item.status !== 'Terminé' && (
                  <button
                    onClick={() => onMarkRepairComplete(item.id)}
                    className="mt-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>
          ))}
          {data.length > 3 && (
            <button onClick={() => onShowDetails(detailedView)} className="w-full mt-2 text-sm text-orange-600 hover:text-orange-700 font-semibold">
              Voir tout
            </button>
          )}
        </div>
      );
    }

    // Générique pour les autres widgets liste
    return (
      <div className="space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center min-w-0">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.name || item.title || item.equipment || `Élément ${index + 1}`}
                </div>
                <div className="text-xs text-gray-600">
                  {item.description || item.status || item.technician || ''}
                </div>
              </div>
            </div>
            <div className="text-right ml-2">
              <div className="text-xs font-medium text-gray-800">
                {item.value || item.estimated || item.cost || ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderListData()}
    </div>
  );
};

const ChartWidget = ({
  widget,
  data,
  onShowDetails,
  onShowInterventionForm
}: {
  widget: Widget;
  data: any;
  onShowDetails: (content: React.ReactNode) => void;
  onShowInterventionForm: () => void;
}) => {
  const IconComponent = typeof widget.icon === 'string' ? iconMap[widget.icon] : widget.icon;

  const renderChart = () => {
    switch (widget.id) {
        case 'sales-chart':
            return <SalesEvolutionWidgetEnriched data={data} />;

        case 'equipment-availability':
            return <EquipmentAvailabilityWidget data={data} />;

        case 'interventions-today':
            // S'assurer que les données sont un tableau valide avant de continuer
            if (!data || !Array.isArray(data) || data.length === 0) {
              return <div className="text-center text-gray-500 py-4">Aucune intervention aujourd'hui.</div>;
            }

            // CORRECTION: Extraire les valeurs du tableau au lieu de déstructurer un objet
            const completed = data.find(item => item.name === 'Terminé')?.value || 0;
            const pending = data.find(item => item.name === 'En attente')?.value || 0;
            const total = completed + pending;
            const COLORS = ['#22c55e', '#f97316'];

            const handleDonutClick = async (status: 'Terminé' | 'En attente') => {
              onShowDetails(<div>Chargement des détails...</div>);
              try {
                const interventions = await getInterventionsByStatus(status);
                onShowDetails(
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Interventions "{status}" du jour</h3>
                      <button
                        onClick={onShowInterventionForm}
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                      >
                        + Nouvelle intervention
                      </button>
                    </div>
                    {interventions.length > 0 ? (
                      <ul className="space-y-3">
                        {interventions.map((item: any) => (
                          <li key={item.id} className="p-2 border rounded-md">
                            <p className="font-semibold">{item.equipment.name}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              <span>Priorité: {item.priority}</span>
                              <span className="mx-2">|</span>
                              <span>Technicien: {item.technician ? item.technician.name : 'Non assigné'}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Aucune intervention avec ce statut pour aujourd'hui.</p>
                    )}
                  </div>
                );
              } catch (error) {
                console.error("Erreur lors de la récupération des détails d'intervention", error);
                onShowDetails(<div>Erreur lors du chargement des détails.</div>);
              }
            };

            return (
                <div className="space-y-4">
                    <div className="relative w-full h-40 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data}
                                     dataKey="value" nameKey="name" cx="50%" cy="50%"
                                     innerRadius={40} outerRadius={60}
                                     paddingAngle={5}
                                >
                                  {data.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                      className="cursor-pointer transition-opacity hover:opacity-80"
                                      onClick={() => handleDonutClick(entry.name as 'Terminé' | 'En attente')}
                                    />
                                  ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-gray-800">{total}</span>
                            <span className="text-sm text-gray-500">Total</span>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={onShowInterventionForm}
                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            + Nouvelle intervention
                        </button>
                    </div>
                </div>
            );

        case 'technician-workload':
            const detailedWorkloadView = (
              <div>
                <h3 className="text-xl font-semibold mb-4">Charge de travail détaillée</h3>
                <div className="space-y-3">
                  {data.map((tech: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">{tech.name}</div>
                        <div className="text-xs text-gray-600">{tech.current_hours}h / {tech.max_hours}h</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${tech.workload_percentage > 80 ? 'bg-red-500' : tech.workload_percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${tech.workload_percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Efficacité: {(tech.efficiency * 100).toFixed(0)}%</span>
                        <span>{tech.tasks_count} tâches</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

            return (
              <div className="space-y-3">
                {data.map((tech: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-sm font-medium">{tech.name}</div>
                      <div className="text-xs text-gray-600">{tech.current_hours}h / {tech.max_hours}h</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${tech.workload_percentage > 80 ? 'bg-red-500' : tech.workload_percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${tech.workload_percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Efficacité: {(tech.efficiency * 100).toFixed(0)}%</span>
                      <span>{tech.tasks_count} tâches</span>
                    </div>
                  </div>
                ))}
                {data.length > 4 && (
                  <button onClick={() => onShowDetails(detailedWorkloadView)} className="w-full mt-2 text-sm text-orange-600 hover:text-orange-700 font-semibold">
                    Voir tout
                  </button>
                )}
              </div>
            );

        case 'parts-inventory':
            const detailedInventoryView = (
                    <div>
                <h3 className="text-xl font-semibold mb-4">État du stock détaillé</h3>

                {/* Graphique interactif */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-3 text-gray-800">Vue d'ensemble du stock</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                          }}
                          formatter={(value: any, name: any) => [
                            `${value} unités`,
                            name === 'stock' ? 'Stock actuel' : name === 'min' ? 'Minimum' : 'Maximum'
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="stock"
                          fill="#3b82f6"
                          name="Stock actuel"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="min"
                          fill="#f59e0b"
                          name="Niveau minimum"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="critical_level"
                          fill="#ef4444"
                          name="Niveau critique"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                    </div>
                  </div>

                <div className="space-y-3">
                  {data.map((item: any, index: number) => {
                    const stockPercentage = Math.min((item.stock / item.max) * 100, 100);
                    const criticalPercentage = (item.critical_level / item.max) * 100;
                    const minPercentage = (item.min / item.max) * 100;

                    let barColor = 'bg-green-500';
                    let statusColor = 'bg-green-100 text-green-800';
                    let statusText = 'Stock OK';
                    let alertIcon = '✅';

                    if (item.stock < item.critical_level) {
                      barColor = 'bg-red-500';
                      statusColor = 'bg-red-100 text-red-800';
                      statusText = 'CRITIQUE';
                      alertIcon = '🚨';
                    } else if (item.stock < item.min) {
                      barColor = 'bg-orange-500';
                      statusColor = 'bg-orange-100 text-orange-800';
                      statusText = 'Stock faible';
                      alertIcon = '⚠️';
                    } else if (item.stock < item.min * 1.2) {
                      barColor = 'bg-yellow-500';
                      statusColor = 'bg-yellow-100 text-yellow-800';
                      statusText = 'Attention';
                      alertIcon = '⚡';
                    }

                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{alertIcon}</span>
                            <div className="font-semibold text-gray-900">{item.category}</div>
                          </div>
                          <div className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                            {statusText}
                          </div>
                        </div>

                        {/* Barre de stock avec indicateurs */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Stock actuel</span>
                            <span className="font-medium">{item.stock} / {item.max} max</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 relative">
                            {/* Barre principale avec animation */}
                            <div
                              className={`${barColor} h-3 rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>

                            {/* Indicateur niveau critique */}
                            <div
                              className="absolute h-full top-0 border-l-2 border-red-400 opacity-60"
                              style={{ left: `${criticalPercentage}%` }}
                              title="Niveau critique"
                            ></div>

                            {/* Indicateur niveau minimum */}
                            <div
                              className="absolute h-full top-0 border-l-2 border-orange-400 opacity-60"
                              style={{ left: `${minPercentage}%` }}
                              title="Niveau minimum"
                            ></div>
                          </div>

                          {/* Légende des indicateurs */}
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Critique: {item.critical_level}</span>
                            <span>Min: {item.min}</span>
                            <span>Max: {item.max}</span>
                          </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                            <span className="text-gray-600">Prix unitaire:</span>
                            <span className="font-medium ml-1">{item.unit_price} MAD</span>
                    </div>
                          <div>
                            <span className="text-gray-600">Fournisseur:</span>
                            <span className="font-medium ml-1">{item.supplier}</span>
                  </div>
                    <div>
                            <span className="text-gray-600">Usage moyen:</span>
                            <span className="font-medium ml-1">{item.average_usage}/jour</span>
                    </div>
                          <div>
                            <span className="text-gray-600">Durée estimée:</span>
                            <span className="font-medium ml-1">{item.estimated_duration} jours</span>
                  </div>
                </div>

                        {/* Informations de livraison */}
                        {item.next_delivery && (
                          <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-blue-700">Prochaine livraison:</span>
                              <span className={`font-medium ${item.delivery_days <= 7 ? 'text-red-600' : item.delivery_days <= 14 ? 'text-orange-600' : 'text-blue-600'}`}>
                                {item.next_delivery} ({item.delivery_days} jours)
                              </span>
              </div>
            </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div className="text-xs text-gray-600 italic mb-3">
                            {item.notes}
          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2">
                          {item.needs_restock && (
                            <button className="flex-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                              Commander URGENT
                            </button>
                          )}
                          <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                            Voir détails
                          </button>
        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );

            return (
                <div className="space-y-4">
                    {/* En-tête avec statistiques */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Package className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Plan d'action stock & revente</h3>
                        </div>
                        <div className="flex space-x-3 text-sm">
                            <div className="text-center">
                                <div className="font-semibold text-green-600">
                                    {data.filter((item: any) => item.stock >= item.min).length}
                                </div>
                                <div className="text-gray-600">OK</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-orange-600">
                                    {data.filter((item: any) => item.stock < item.min && item.stock >= item.critical_level).length}
                                </div>
                                <div className="text-gray-600">Faible</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-red-600">
                                    {data.filter((item: any) => item.stock < item.critical_level).length}
                                </div>
                                <div className="text-gray-600">Critique</div>
                            </div>
                        </div>
                    </div>

                    {/* Graphique miniature */}
                    <div className="h-32 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={data.slice(0, 4)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip
                                    formatter={(value: any) => [`${value} unités`, 'Stock']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="currentStock"
                                    fill="#3b82f6"
                                    radius={[2, 2, 0, 0]}
                                />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Liste des articles */}
                    <div className="space-y-3">
                        {data.slice(0, 4).map((item: any, index: number) => {
                            const stockPercentage = Math.min((item.stock / item.max) * 100, 100);
                            const criticalPercentage = (item.critical_level / item.max) * 100;
                            const minPercentage = (item.min / item.max) * 100;

                            let barColor = 'bg-green-500';
                            let statusText = 'OK';
                            let statusColor = 'text-green-600';
                            let alertIcon = '✅';

                            if (item.stock < item.critical_level) {
                                barColor = 'bg-red-500';
                                statusText = 'CRITIQUE';
                                statusColor = 'text-red-600';
                                alertIcon = '🚨';
                            } else if (item.stock < item.min) {
                                barColor = 'bg-orange-500';
                                statusText = 'FAIBLE';
                                statusColor = 'text-orange-600';
                                alertIcon = '⚠️';
                            } else if (item.stock < item.min * 1.2) {
                                barColor = 'bg-yellow-500';
                                statusText = 'ATTENTION';
                                statusColor = 'text-yellow-600';
                                alertIcon = '⚡';
                            }

                            return (
                                <div key={index} className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-center text-xs mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span>{alertIcon}</span>
                                            <span className="font-medium text-gray-700">{item.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-600">{item.stock} / {item.max}</span>
                                            <span className={`font-bold ${statusColor}`}>{statusText}</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative mb-1">
                                        {/* Barre principale avec animation */}
                                        <div
                                            className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${stockPercentage}%` }}
                                        ></div>

                                        {/* Indicateur niveau critique */}
                                        <div
                                            className="absolute h-full top-0 border-l border-red-400 opacity-60"
                                            style={{ left: `${criticalPercentage}%` }}
                                        ></div>

                                        {/* Indicateur niveau minimum */}
                                        <div
                                            className="absolute h-full top-0 border-l border-orange-400 opacity-60"
                                            style={{ left: `${minPercentage}%` }}
                                        ></div>
                                    </div>

                                    {/* Informations rapides */}
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Usage: {item.average_usage}/j</span>
                                        <span>Durée: {item.estimated_duration}j</span>
                                        {item.delivery_days && (
                                            <span className={item.delivery_days <= 7 ? 'text-red-600 font-medium' : ''}>
                                                Livraison: {item.delivery_days}j
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {data.length > 4 && (
                            <button onClick={() => onShowDetails(detailedInventoryView)} className="w-full mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                                Voir tout le stock ({data.length} catégories)
                            </button>
                        )}
                    </div>
    </div>
  );

        default:
            return (
                <div className="text-center text-gray-500 py-4">
                    Données non disponibles
                </div>
            );
    }
  };

  return (
    <div className="space-y-4">
      {renderChart()}
    </div>
  );
};
// Widget transformé : Plan d'action stock & revente
// Fonction pour récupérer les données de graphiques
// Fonction pour récupérer les données de calendrier
const getCalendarData = (widgetId: string) => {
  // Données simulées pour les calendriers
  const calendarData = {
    'upcoming-rentals': [
      { id: '1', title: 'Location pelle CAT', date: '2024-01-20', status: 'Confirmé' },
      { id: '2', title: 'Location chargeur', date: '2024-01-22', status: 'En attente' },
      { id: '3', title: 'Location bulldozer', date: '2024-01-25', status: 'Confirmé' }
    ],
    'driver-schedule': [
      { id: '1', title: 'Mohammed - Livraison Casablanca', date: '2024-01-20', status: 'Programmé' },
      { id: '2', title: 'Ahmed - Transport Rabat', date: '2024-01-21', status: 'En attente' }
    ],
    'intervention-schedule': [
      { id: '1', title: 'Maintenance préventive', date: '2024-01-20', status: 'Programmé' },
      { id: '2', title: 'Réparation moteur', date: '2024-01-22', status: 'En attente' }
    ]
  };
  return calendarData[widgetId as keyof typeof calendarData] || [];
};

// Fonction pour récupérer les données de carte
const getMapData = (widgetId: string) => {
  // Données simulées pour les cartes
  const mapData = {
    'delivery-map': [
      { id: '1', title: 'Camion 001', lat: 33.5731, lng: -7.5898, status: 'En transit' },
      { id: '2', title: 'Camion 002', lat: 34.0209, lng: -6.8416, status: 'Livraison' }
    ],
    'container-tracking': [
      { id: '1', title: 'Conteneur A', lat: 33.5731, lng: -7.5898, status: 'En transit' },
      { id: '2', title: 'Conteneur B', lat: 34.0209, lng: -6.8416, status: 'En douane' }
    ],
    'route-optimization': [
      { id: '1', title: 'Route optimisée', coordinates: [[33.5731, -7.5898], [34.0209, -6.8416]], status: 'Active' }
    ]
  };
  return mapData[widgetId as keyof typeof mapData] || [];
};

// Fonction pour récupérer les données de maintenance
// Fonction pour récupérer les notifications et alertes
// Fonction pour récupérer les KPIs avancés
// Fonction pour récupérer les données de planification
// Fonction pour récupérer les données des actions quotidiennes
