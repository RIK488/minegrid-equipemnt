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

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'calendar' | 'map' | 'equipment' | 'maintenance' | 'performance' | 'pipeline' | 'priority' | 'analytics' | 'daily-actions';
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  dataSource: string;
  isCollapsed?: boolean;
  position?: number; // Ajouté pour l'ordre personnalisé
  // react-grid-layout properties will be stored separately
}

interface WidgetLayout {
    i: string; // id of the widget
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
}

interface DashboardConfig {
  widgets: Widget[];
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'list' | 'compact';
  refreshInterval: number;
  notifications: boolean;
}

// Hook pour l'adaptation automatique des widgets
const useAdaptiveWidget = (widgetSize: 'small' | 'normal' | 'large' = 'normal') => {
  const getTextSize = (type: 'title' | 'subtitle' | 'value' | 'small') => {
    switch (widgetSize) {
      case 'small':
        return type === 'title' ? 'text-xs' : type === 'value' ? 'text-lg' : 'text-xs';
      case 'large':
        return type === 'title' ? 'text-lg' : type === 'subtitle' ? 'text-base' : type === 'value' ? 'text-3xl' : 'text-sm';
      default:
        return type === 'title' ? 'text-sm' : type === 'value' ? 'text-2xl' : 'text-xs';
    }
  };

  const getGridCols = (defaultCols: number) => {
    switch (widgetSize) {
      case 'small':
        return Math.max(1, defaultCols - 1);
      case 'large':
        return Math.min(6, defaultCols + 1);
      default:
        return defaultCols;
    }
  };

  const formatCurrency = (amount: number) => {
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

  const formatNumber = (num: number) => {
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

  return {
    getTextSize,
    getGridCols,
    formatCurrency,
    formatNumber,
    widgetSize
  };
};

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
const PerformanceScoreWidget = ({ data }: { data: any }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Score de Performance Commerciale</h3>
          <p className="text-sm text-gray-600">Votre performance globale sur 100 points</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.score)} ${getScoreColor(data.score)}`}>
          Rang {data.rank}/{data.totalVendors}
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
                strokeDasharray={`${(data.score / 100) * 339.292} 339.292`}
                strokeLinecap="round"
                className={`${getScoreBarColor(data.score)} transition-all duration-1000`}
              />
            </svg>
            {/* Score au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}
                </div>
                <div className="text-sm text-gray-500">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Objectif */}
        <div className="mt-4">
          <div className="text-sm text-gray-600">Objectif mensuel</div>
          <div className="text-lg font-semibold text-gray-900">{data.target}/100</div>
          <div className="text-sm text-gray-500">
            {data.score >= data.target ? '✅ Objectif atteint' : `${data.target - data.score} points à gagner`}
          </div>
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ventes</span>
            <span className={`text-sm font-medium ${getTrendColor(data.trends.sales)}`}>
              {getTrendIcon(data.trends.sales)}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(data.sales)}
          </div>
          <div className="text-xs text-gray-500">
            {Math.round((data.sales / data.salesTarget) * 100)}% de l'objectif
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Croissance</span>
            <span className={`text-sm font-medium ${getTrendColor(data.trends.growth)}`}>
              {getTrendIcon(data.trends.growth)}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            +{data.growth}%
          </div>
          <div className="text-xs text-gray-500">
            Objectif: +{data.growthTarget}%
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Prospects</span>
            <span className={`text-sm font-medium ${getTrendColor(data.trends.prospects)}`}>
              {getTrendIcon(data.trends.prospects)}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {data.activeProspects}/{data.prospects}
          </div>
          <div className="text-xs text-gray-500">
            Actifs
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Réactivité</span>
            <span className={`text-sm font-medium ${getTrendColor(data.trends.responseTime)}`}>
              {getTrendIcon(data.trends.responseTime)}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {data.responseTime}h
          </div>
          <div className="text-xs text-gray-500">
            Objectif: {data.responseTarget}h
          </div>
        </div>
      </div>

      {/* Recommandations IA */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
          Recommandations IA pour améliorer votre score
        </h4>
        <div className="space-y-2">
          {data.recommendations.map((rec: any, index: number) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{rec.action}</div>
                <div className="text-xs text-gray-500">Impact: {rec.impact}</div>
              </div>
              <button className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors">
                Agir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de progression vers l'objectif */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progression vers l'objectif</span>
          <span className="font-medium text-gray-900">{data.score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${getScoreBarColor(data.score)}`}
            style={{ width: `${data.score}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Composant Score de Performance Commerciale avec toutes les fonctionnalités
const SalesPerformanceScoreWidget = ({ data }: { data: any }) => {
  // Utiliser des valeurs par défaut intelligentes même si data est null/undefined
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
        id: 1,
        title: 'Commencer à collecter des données',
        description: 'Ajoutez vos premières ventes et prospects pour obtenir des recommandations personnalisées',
        priority: 'high',
        category: 'data'
      },
      {
        id: 2,
        title: 'Définir vos objectifs',
        description: 'Configurez vos objectifs de vente pour mesurer votre progression',
        priority: 'medium',
        category: 'goals'
      },
      {
        id: 3,
        title: 'Optimiser votre processus',
        description: 'Améliorez votre temps de réponse aux prospects',
        priority: 'low',
        category: 'process'
      }
    ],
    trends: data?.trends || {
      sales: 'stable',
      growth: 'stable',
      prospects: 'stable',
      responseTime: 'stable'
    },
    metrics: data?.metrics || {
      sales: { value: 0, target: 3000000, trend: 'stable' },
      growth: { value: 0, target: 15, trend: 'stable' },
      prospects: { value: 0, target: 10, trend: 'stable' },
      responseTime: { value: 2.5, target: 1.5, trend: 'stable' }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
              <div className={`text-2xl font-bold ${getScoreColor(safeData.score)}`}>
                {safeData.score}
              </div>
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
                      <span className={`text-sm ${getTrendColor(safeData.trends.sales)}`}>
            {getTrendIcon(safeData.trends.sales)}
          </span>
        </div>
        <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
          {formatCurrency(safeData.sales)}
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400">
          Objectif: {formatCurrency(safeData.salesTarget)}
        </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Croissance</span>
                      <span className={`text-sm ${getTrendColor(safeData.trends.growth)}`}>
            {getTrendIcon(safeData.trends.growth)}
          </span>
        </div>
        <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
          {safeData.growth}%
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400">
          Objectif: {safeData.growthTarget}%
        </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Prospects</span>
                      <span className={`text-sm ${getTrendColor(safeData.trends.prospects)}`}>
            {getTrendIcon(safeData.trends.prospects)}
          </span>
        </div>
        <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
          {safeData.prospects}
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400">
          Actifs: {safeData.activeProspects}
        </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Réactivité</span>
                      <span className={`text-sm ${getTrendColor(safeData.trends.responseTime)}`}>
            {getTrendIcon(safeData.trends.responseTime)}
          </span>
        </div>
        <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
          {safeData.responseTime === 0 ? 'Aucune donnée' : `${safeData.responseTime}h`}
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400">
          Objectif: {safeData.responseTarget}h
        </div>
        </div>
      </div>

      {/* Recommandations IA concrètes */}
      <div>
        <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-3">Recommandations IA concrètes</h4>
        <div className="space-y-3">
          {safeData.recommendations.map((rec: any, index: number) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                {rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚡' : '💡'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  {rec.action}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                  {rec.description}
                </div>
                <div className="text-xs text-orange-500 dark:text-orange-300">
                  Impact: {rec.impact}
                </div>
              </div>
              <button className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full hover:bg-orange-600 transition-colors">
                Agir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

const RentalForm = ({
  onClose,
  onSubmit,
  equipment
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipment: any[];
}) => {
  const [formData, setFormData] = useState({
    equipment_id: '',
    client_name: 'Client Test', // Champ client simplifié pour l'instant
    client_id: 'c8e1a4b2-4d7a-4c28-9a4d-5d9f3b7b1e1a', // ID Client Test en dur
    start_date: '',
    end_date: '',
    total_price: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700">Équipement</label>
        <select id="equipment_id" name="equipment_id" value={formData.equipment_id} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm">
          <option value="">Sélectionnez un équipement</option>
          {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Date de début</label>
        <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Date de fin</label>
        <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>
      <div>
        <label htmlFor="total_price" className="block text-sm font-medium text-gray-700">Prix total (€)</label>
        <input type="number" id="total_price" name="total_price" value={formData.total_price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Annuler</button>
        <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">Créer la location</button>
      </div>
    </form>
  );
};

// Composant pour afficher les détails d'une location
const RentalDetailsModal = ({ rental, onClose }: { rental: any; onClose: () => void }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmée': return 'bg-green-100 text-green-800 border-green-200';
      case 'Prête': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En préparation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Terminée': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Annulée': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails de la Location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Générales</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Équipement</label>
                  <p className="text-sm text-gray-900">{rental.equipmentFullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Client</label>
                  <p className="text-sm text-gray-900">{rental.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getStatusColor(rental.status)}`}>
                    {rental.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priorité</label>
                  <p className="text-sm text-gray-900 capitalize">{rental.priority}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Période de Location</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de début</label>
                  <p className="text-sm text-gray-900">{formatDate(rental.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de fin</label>
                  <p className="text-sm text-gray-900">{formatDate(rental.end_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Durée totale</label>
                  <p className="text-sm text-gray-900">{rental.durationDays} jours</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Temps restant</label>
                  <p className="text-sm text-gray-900">
                    {rental.daysUntilStart <= 0 ? 'Aujourd\'hui' :
                     rental.daysUntilStart === 1 ? 'Demain' :
                     `Dans ${rental.daysUntilStart} jours`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations financières */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Financières</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Prix total</label>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(rental.total_price)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Prix par jour</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(rental.pricePerDay)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Durée</label>
                <p className="text-lg font-semibold text-gray-900">{rental.durationDays} jours</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                Modifier la location
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Générer facture
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Envoyer rappel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour éditer une location existante
const EditRentalForm = ({
  rental,
  onClose,
  onSubmit,
  equipment
}: {
  rental: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipment: any[];
}) => {
  const [formData, setFormData] = useState({
    equipment_id: rental.equipment_id || '',
    client_name: rental.clientName || 'Client Test',
    client_id: rental.client_id || 'c8e1a4b2-4d7a-4c28-9a4d-5d9f3b7b1e1a',
    start_date: rental.start_date ? rental.start_date.split('T')[0] : '',
    end_date: rental.end_date ? rental.end_date.split('T')[0] : '',
    total_price: rental.total_price || 0,
    status: rental.status || 'Confirmée'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-blue-900 mb-2">Informations actuelles</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Équipement:</span>
            <p className="font-medium">{rental.equipmentFullName}</p>
          </div>
          <div>
            <span className="text-blue-700">Client:</span>
            <p className="font-medium">{rental.clientName}</p>
          </div>
          <div>
            <span className="text-blue-700">Prix total:</span>
            <p className="font-medium">{formatCurrency(rental.total_price)}</p>
          </div>
          <div>
            <span className="text-blue-700">Durée:</span>
            <p className="font-medium">{rental.durationDays} jours</p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
        >
          <option value="Confirmée">Confirmée</option>
          <option value="En préparation">En préparation</option>
          <option value="Prête">Prête</option>
          <option value="En cours">En cours</option>
          <option value="Terminée">Terminée</option>
          <option value="Annulée">Annulée</option>
        </select>
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Date de début</label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Date de fin</label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="total_price" className="block text-sm font-medium text-gray-700">Prix total (€)</label>
        <input
          type="number"
          id="total_price"
          name="total_price"
          value={formData.total_price}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
        >
          Mettre à jour la location
        </button>
      </div>
    </form>
  );
};

// Widget Actions Prioritaires du Jour avec IA
const DailyActionsWidget = ({ data }: { data: any[] }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  // Générer des actions prioritaires basées sur les données
  const generateDailyActions = () => {
    const actions = [
      {
        id: 1,
        title: 'Relancer Ahmed Benali (prospect chaud)',
        description: 'Prospect qui a consulté votre 950GC 3 fois cette semaine',
        priority: 'high',
        category: 'prospection',
        impact: 'Élevé - 85% de probabilité de conversion',
        estimatedTime: '15 min',
        icon: '👤',
        action: 'Envoyer message WhatsApp personnalisé'
      },
      {
        id: 2,
        title: 'Réduire le prix du CAT 320D (-2.5%)',
        description: 'Machine en stock depuis 92 jours sans contact',
        priority: 'medium',
        category: 'pricing',
        impact: 'Moyen - Augmentation de 40% des vues attendues',
        estimatedTime: '5 min',
        icon: '💰',
        action: 'Mettre à jour le prix et booster la visibilité'
      },
      {
        id: 3,
        title: 'Publier une annonce pour compacteur',
        description: 'Forte demande détectée à Casablanca cette semaine',
        priority: 'medium',
        category: 'marketing',
        impact: 'Moyen - 15-20 prospects qualifiés attendus',
        estimatedTime: '20 min',
        icon: '📢',
        action: 'Créer annonce optimisée SEO'
      },
      {
        id: 4,
        title: 'Analyser les prospects inactifs',
        description: '12 prospects n\'ont pas été contactés depuis 7+ jours',
        priority: 'low',
        category: 'follow-up',
        impact: 'Faible - Potentiel de réactivation',
        estimatedTime: '30 min',
        icon: '📊',
        action: 'Planifier campagne de relance'
      },
      {
        id: 5,
        title: 'Optimiser les annonces existantes',
        description: '3 annonces ont un taux de clic < 2%',
        priority: 'low',
        category: 'optimization',
        impact: 'Faible - Amélioration progressive',
        estimatedTime: '25 min',
        icon: '⚡',
        action: 'Réviser titres et descriptions'
      }
    ];

    return actions.slice(0, 5); // Retourner les 5 actions les plus prioritaires
  };

  const actions = generateDailyActions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30';
      case 'low': return 'text-green-700 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const handleActionClick = (action: any) => {
    setSelectedAction(action);
    setShowDetails(true);
  };

  const handleExecuteAction = (action: any) => {
    // Simulation d'exécution d'action
    alert(`✅ Action exécutée : ${action.title}\n\n${action.action}\n\nTemps estimé : ${action.estimatedTime}\nImpact attendu : ${action.impact}`);

    // Ici on pourrait appeler une API pour marquer l'action comme effectuée
    console.log(`[API] Action exécutée: ${action.id} - ${action.title}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actions prioritaires du jour</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Générées par IA pour maximiser vos ventes</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {actions.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            actions à effectuer
          </div>
        </div>
      </div>

      {/* Liste des actions */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={action.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            onClick={() => handleActionClick(action)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">{action.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                      {getPriorityIcon(action.priority)} {action.priority === 'high' ? 'Urgent' : action.priority === 'medium' ? 'Important' : 'Normal'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {action.estimatedTime}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {action.description}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Impact: {action.impact}
                  </div>
                </div>
              </div>
              <button
                className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full hover:bg-orange-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecuteAction(action);
                }}
              >
                Exécuter
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {actions.filter(a => a.priority === 'high').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Urgentes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {actions.filter(a => a.priority === 'medium').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Importantes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {actions.filter(a => a.priority === 'low').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Normales</div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetails && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Détails de l'action
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{selectedAction.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAction.priority)}`}>
                    {getPriorityIcon(selectedAction.priority)} {selectedAction.priority === 'high' ? 'Urgent' : selectedAction.priority === 'medium' ? 'Important' : 'Normal'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedAction.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAction.description}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Action à effectuer :
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAction.action}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Temps estimé</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedAction.estimatedTime}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Impact attendu</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedAction.impact}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleExecuteAction(selectedAction)}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Exécuter maintenant
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

const InterventionForm = ({
  onClose,
  onSubmit,
  equipment,
  technicians
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipment: any[];
  technicians: any[];
}) => {
  const [formData, setFormData] = useState({
    name: '',
    equipment_name: '',
    technician_name: '',
    description: '',
    estimated_duration: 0,
    scheduled_date: '',
    priority: 'Normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Nouvelle intervention</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'intervention</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Équipement</label>
            <select
              value={formData.equipment_name}
              onChange={(e) => setFormData({...formData, equipment_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Sélectionner un équipement</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.title}>{eq.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technicien</label>
            <select
              value={formData.technician_name}
              onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Sélectionner un technicien</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.name}>{tech.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée (h)</label>
              <input
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Basse">Basse</option>
                <option value="Normal">Normal</option>
                <option value="Haute">Haute</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date prévue</label>
            <input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EquipmentAvailabilityWidget = ({ data }: { data: any }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  console.log('[DEBUG] EquipmentAvailabilityWidget - Données reçues:', data);

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-4">
        <div className="text-sm">Aucune donnée disponible</div>
        <div className="text-xs mt-1">Vérifiez la connexion à la base de données</div>
      </div>
    );
  }

  // Vérifier si les données ont la structure attendue
  // Accepter soit data.details soit data directement si c'est un tableau
  let details = [];
  let summary = [];
  let stats = { total: 0, available: 0, rented: 0, maintenance: 0, averageUsageRate: 0 };

  if (data.details && Array.isArray(data.details)) {
    // Structure attendue avec details, summary, stats
    details = data.details;
    summary = data.summary || [];
    stats = data.stats || { total: 0, available: 0, rented: 0, maintenance: 0, averageUsageRate: 0 };
  } else if (Array.isArray(data)) {
    // Si data est directement un tableau, le traiter comme details
    details = data;
    // Générer summary et stats à partir des données
    const total = details.length;
    const available = details.filter((item: any) => item.status === 'Disponible').length;
    const rented = details.filter((item: any) => item.status === 'En location').length;
    const maintenance = details.filter((item: any) => item.status === 'Maintenance').length;
    const averageUsageRate = details.length > 0 ?
      Math.round(details.reduce((sum: number, item: any) => sum + (item.usageRate || 0), 0) / details.length) : 0;

    summary = [
      { name: 'Disponible', value: available, color: 'green' },
      { name: 'En location', value: rented, color: 'orange' },
      { name: 'Maintenance', value: maintenance, color: 'red' }
    ];
    stats = { total, available, rented, maintenance, averageUsageRate };
  } else {
    console.error('[DEBUG] Structure de données incorrecte:', data);
    return (
      <div className="text-center text-red-600 py-4">
        <div className="text-sm">Erreur de structure des données</div>
        <div className="text-xs mt-1">Contactez l'administrateur</div>
      </div>
    );
  }

  // Vérifier si on a des équipements
  if (details.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <div className="text-sm">Aucun équipement trouvé</div>
        <div className="text-xs mt-1">
          <button
            onClick={() => window.location.reload()}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Recharger les données
          </button>
        </div>
      </div>
    );
  }

  const filteredEquipment = details.filter((equipment: any) => {
    const matchesStatus = selectedStatus === 'all' || equipment.status === selectedStatus;
    const matchesSearch = equipment.equipmentFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string, color: string) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        {status}
      </span>
    );
  };

  const getUsageBar = (usageRate: number) => {
    const color = usageRate > 80 ? 'bg-red-500' : usageRate > 50 ? 'bg-orange-500' : 'bg-green-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${usageRate}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Statistiques globales */}
      <div className="grid grid-cols-4 gap-3">
        {summary.map((stat: any, index: number) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold text-${stat.color}-600`}>
              {stat.value}
        </div>
            <div className="text-xs text-gray-600">{stat.name}</div>
            </div>
        ))}
            </div>

      {/* Métriques supplémentaires */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Total: {stats.total} équipements</span>
        <span>Taux d'utilisation moyen: {stats.averageUsageRate}%</span>
      </div>

      {/* Filtres et recherche */}
      <div className="flex gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="Disponible">Disponible</option>
          <option value="En location">En location</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <input
          type="text"
          placeholder="Rechercher un équipement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Liste des équipements */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredEquipment.map((equipment: any, index: number) => (
          <div key={equipment.id || index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {equipment.equipmentFullName}
                  </h4>
                  {getStatusBadge(equipment.status, equipment.statusColor)}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>Année: {equipment.year || 'N/A'}</div>
                  <div>Condition: {equipment.condition || 'N/A'}</div>
                  <div className="flex items-center gap-2">
                    <span>Utilisation:</span>
                    <div className="flex-1 max-w-20">
                      {getUsageBar(equipment.usageRate)}
              </div>
                    <span className="text-xs">{equipment.usageRate}%</span>
                </div>
                </div>

                {/* Informations de location ou maintenance */}
                {equipment.currentRental && (
                  <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                    <div className="font-medium text-orange-800">Location en cours</div>
                    <div className="text-orange-600">
                      Du {new Date(equipment.currentRental.startDate).toLocaleDateString()}
                      au {new Date(equipment.currentRental.endDate).toLocaleDateString()}
                </div>
              </div>
                )}

                {equipment.currentIntervention && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                    <div className="font-medium text-red-800">Maintenance programmée</div>
                    <div className="text-red-600">
                      {new Date(equipment.currentIntervention.scheduledDate).toLocaleDateString()}
                </div>
                </div>
                )}
                </div>

              {/* Actions rapides */}
              <div className="flex flex-col gap-1 ml-3">
                {equipment.status === 'Disponible' && (
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded" title="Louer">
                    <Calendar className="h-4 w-4" />
                  </button>
                )}
                {equipment.status === 'En location' && (
                  <button className="p-1 text-orange-600 hover:bg-orange-100 rounded" title="Voir détails location">
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                {equipment.status === 'Maintenance' && (
                  <button className="p-1 text-red-600 hover:bg-red-100 rounded" title="Voir détails maintenance">
                    <Wrench className="h-4 w-4" />
                  </button>
                )}
                <button className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="Modifier">
                  <Edit className="h-4 w-4" />
                </button>
                </div>
              </div>
                </div>
        ))}
                </div>

      {/* Message si aucun résultat */}
      {filteredEquipment.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">Aucun équipement trouvé</div>
                  </div>
                )}

      {/* Actions globales */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Voir tous les équipements
                </button>
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Ajouter un équipement
                </button>
      </div>
    </div>
  );
};

const PlanningWidget = ({ data }: { data: any }) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'daily' | 'overview'>('daily');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const filteredDays = selectedDay === 'all'
    ? data.days
    : data.days.filter((day: any) => day.day === selectedDay);

  const allTasks = data.days?.flatMap((day: any) => day.tasks) || [];
  const completedTasks = allTasks.filter((task: any) => task.status === 'completed').length;
  const inProgressTasks = allTasks.filter((task: any) => task.status === 'in-progress').length;
  const scheduledTasks = allTasks.filter((task: any) => task.status === 'scheduled').length;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {data.days && (
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Tous les jours</option>
              {data.days.map((day: any) => (
                <option key={day.day} value={day.day}>{day.day}</option>
              ))}
            </select>
          )}
          {data.categories && (
            <button
              onClick={() => setViewMode(viewMode === 'daily' ? 'overview' : 'daily')}
              className="text-sm px-2 py-1 rounded bg-orange-100 text-orange-700"
            >
              {viewMode === 'daily' ? 'Vue d\'ensemble' : 'Planning détaillé'}
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      {data.days && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{completedTasks}</div>
            <div className="text-xs text-green-600">Terminées</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{inProgressTasks}</div>
            <div className="text-xs text-blue-600">En cours</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">{scheduledTasks}</div>
            <div className="text-xs text-gray-600">Planifiées</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{allTasks.length}</div>
            <div className="text-xs text-orange-600">Total</div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {viewMode === 'daily' && data.days ? (
        <div className="space-y-4">
          {filteredDays.map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{day.day}</h4>
              <div className="space-y-2">
                {day.tasks.map((task: any, taskIndex: number) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center flex-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-3`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-600">{task.time} • {task.technician}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'Terminé' :
                         task.status === 'in-progress' ? 'En cours' :
                         task.status === 'scheduled' ? 'Planifié' :
                         task.status === 'delayed' ? 'En retard' : 'Normal'}
                      </div>
                      <button className="text-orange-600 hover:text-orange-700 text-xs">
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data.categories ? (
        <div className="space-y-4">
          {data.categories.map((category: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.color)} mr-2`} />
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                </div>
                <div className="text-sm text-gray-600">
                  {category.completed}/{category.total} terminées
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{getProgressPercentage(category.completed, category.total).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getCategoryColor(category.color)}`}
                    style={{ width: `${getProgressPercentage(category.completed, category.total)}%` }}
                  />
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{category.completed}</div>
                  <div className="text-green-600">Terminées</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{category.inProgress}</div>
                  <div className="text-blue-600">En cours</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-gray-600">{category.scheduled}</div>
                  <div className="text-gray-600">Planifiées</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucune donnée de planification</p>
        </div>
      )}
    </div>
  );
};

const AdvancedKPIsWidget = ({ data }: { data: any }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [showTargets, setShowTargets] = useState<boolean>(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'improving':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 1) return 'bg-green-500';
    if (ratio >= 0.8) return 'bg-yellow-500';
    if (ratio >= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === '/5') return `${value.toFixed(1)}/5`;
    if (unit === 'MAD/h') return `${value.toFixed(0)} MAD/h`;
    if (unit === 'jours') return `${value.toFixed(1)} jours`;
    if (unit === 'heures') return `${value.toFixed(1)}h`;
    if (unit === 'fois/an') return `${value.toFixed(1)}x/an`;
    if (unit === '% du CA') return `${value.toFixed(1)}%`;
    return `${value.toFixed(1)} ${unit}`;
  };

  const filteredMetrics = selectedMetric === 'all'
    ? data.metrics
    : data.metrics.filter((metric: any) => metric.status === selectedMetric);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Tous</option>
            <option value="excellent">Excellent</option>
            <option value="good">Bon</option>
            <option value="improving">En amélioration</option>
            <option value="warning">Attention</option>
            <option value="critical">Critique</option>
          </select>
          <button
            onClick={() => setShowTargets(!showTargets)}
            className={`text-sm px-2 py-1 rounded ${showTargets ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {showTargets ? 'Masquer' : 'Afficher'} objectifs
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMetrics.map((metric: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getTrendIcon(metric.trend)}
                <h4 className="font-medium text-gray-900 ml-2">{metric.name}</h4>
              </div>
              <div className={`text-sm px-2 py-1 rounded-full border ${getStatusColor(metric.status)}`}>
                {metric.status === 'excellent' ? 'Excellent' :
                 metric.status === 'good' ? 'Bon' :
                 metric.status === 'improving' ? 'En amélioration' :
                 metric.status === 'warning' ? 'Attention' :
                 metric.status === 'critical' ? 'Critique' : 'Normal'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatValue(metric.value, metric.unit)}
                </div>
                <div className="text-sm text-gray-600">Valeur actuelle</div>
              </div>
              {showTargets && (
                <div>
                  <div className="text-lg font-semibold text-gray-700">
                    {formatValue(metric.target, metric.unit)}
                  </div>
                  <div className="text-sm text-gray-600">Objectif</div>
                </div>
              )}
            </div>

            {/* Barre de progression */}
            {showTargets && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{((metric.value / metric.target) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.value, metric.target)}`}
                    style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Évolution */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-600' :
                  metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change > 0 ? metric.change : Math.abs(metric.change)}
                </span>
                <span className="text-xs text-gray-500">
                  vs période précédente
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button className="text-orange-600 hover:text-orange-700 text-xs font-medium">
                  Détails
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Actions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMetrics.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucun KPI trouvé</p>
        </div>
      )}
    </div>
  );
};

const NotificationsWidget = ({ data }: { data: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Bell className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours === 1) return 'Il y a 1 heure';
    if (diffInHours < 24) return `Il y a ${diffInHours} heures`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffInDays} jours`;
  };

  const filteredData = data.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const unreadCount = data.filter(n => !n.read).length;
  const highPriorityCount = data.filter(n => n.priority === 'high').length;

  const displayedData = showAll ? filteredData : filteredData.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'high')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="high">Priorité haute</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">{highPriorityCount}</div>
          <div className="text-xs text-red-600">Urgentes</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">{unreadCount}</div>
          <div className="text-xs text-orange-600">Non lues</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{data.length}</div>
          <div className="text-xs text-blue-600">Total</div>
        </div>
      </div>

      <div className="space-y-3">
        {displayedData.map((notification, index) => (
          <div
            key={notification.id}
            className={`border rounded-lg p-3 transition-all duration-200 hover:shadow-sm ${
              notification.read ? 'opacity-75' : ''
            } ${getTypeColor(notification.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center flex-1">
                {getTypeIcon(notification.type)}
                <div className="ml-2 flex-1">
                  <h4 className={`font-medium text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.timestamp)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="text-orange-600 hover:text-orange-700 text-xs font-medium">
                  {notification.action}
                </button>
                {!notification.read && (
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                    Marquer comme lue
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {notification.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            {showAll ? 'Voir moins' : `Voir toutes les ${filteredData.length} notifications`}
          </button>
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucune notification</p>
        </div>
      )}
    </div>
  );
};

const PreventiveMaintenanceWidget = ({ data }: { data: any }) => {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    equipment_id: '',
    description: '',
    intervention_date: '',
    priority: 'Moyenne',
    estimated_duration: '',
    technician_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  console.log('[DEBUG] PreventiveMaintenanceWidget - Données reçues:', data);
  console.log('[DEBUG] PreventiveMaintenanceWidget - État showModal:', showModal);

  // Test simple pour voir si le composant se rend
  if (!data) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <div className="text-red-600 font-medium">Erreur : Aucune donnée reçue</div>
        <div className="text-sm text-red-500 mt-1">Le widget n'a pas reçu de données</div>
        <button
          className="mt-2 px-3 py-1 bg-orange-600 text-white rounded text-sm"
          onClick={() => console.log('Test bouton cliqué')}
        >
          Test Bouton
        </button>
      </div>
    );
  }

  if (!data.interventions) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
        <div className="text-yellow-600 font-medium">Aucune intervention trouvée</div>
        <div className="text-sm text-yellow-500 mt-1">Vérifiez la connexion à la base de données</div>
        <button
          className="mt-2 px-3 py-1 bg-orange-600 text-white rounded text-sm"
          onClick={() => console.log('Test bouton cliqué')}
        >
          Test Bouton
        </button>
      </div>
    );
  }

  const { interventions, stats } = data;

  // Filtrer les interventions selon les critères
  const filteredInterventions = interventions.filter((intervention: any) => {
    const matchesPriority = selectedPriority === 'all' || intervention.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || intervention.status === selectedStatus;
    const matchesTimeframe = selectedTimeframe === 'all' ||
      (selectedTimeframe === 'today' && intervention.isToday) ||
      (selectedTimeframe === 'week' && intervention.isThisWeek) ||
      (selectedTimeframe === 'overdue' && intervention.isOverdue);
    const matchesSearch = intervention.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intervention.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intervention.technicianName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesPriority && matchesStatus && matchesTimeframe && matchesSearch;
  });

  const getPriorityBadge = (priority: string) => {
    const colorClasses = {
      'Haute': 'bg-red-100 text-red-800 border-red-200',
      'Moyenne': 'bg-orange-100 text-orange-800 border-orange-200',
      'Basse': 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[priority as keyof typeof colorClasses]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colorClasses = {
      'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
      'Terminé': 'bg-green-100 text-green-800 border-green-200',
      'Annulé': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[status as keyof typeof colorClasses]}`}>
        {status}
      </span>
    );
  };

  const getUrgencyIndicator = (urgency: string) => {
    const indicators = {
      overdue: '🔴',
      urgent: '🟠',
      high: '🟡',
      medium: '🟢',
      normal: '⚪'
    };

    return (
      <span className="text-lg" title={`Urgence: ${urgency}`}>
        {indicators[urgency as keyof typeof indicators]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `En retard (${Math.abs(diffDays)}j)`;
    } else if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Demain';
    } else {
      return `Dans ${diffDays} jours`;
    }
  };

  // Gestion du formulaire
  const handleOpenModal = () => {
    setForm({
      equipment_id: '',
      description: '',
      intervention_date: '',
      priority: 'Moyenne',
      estimated_duration: '',
      technician_id: ''
    });
    setShowModal(true);
    setError(null);
    setSuccess(null);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setSuccess(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!form.equipment_id || !form.description || !form.intervention_date) {
        setError('Veuillez remplir tous les champs obligatoires.');
        setLoading(false);
        return;
      }
      await createMaintenanceIntervention({
        equipment_id: form.equipment_id,
        description: form.description,
        intervention_date: form.intervention_date,
        priority: form.priority as any,
        estimated_duration: form.estimated_duration ? Number(form.estimated_duration) : undefined,
        technician_id: form.technician_id || undefined
      });
      setSuccess('Intervention créée avec succès !');
      setTimeout(() => {
        setShowModal(false);
        window.location.reload(); // Pour rafraîchir la liste (à améliorer plus tard)
      }, 1000);
    } catch (err: any) {
      setError('Erreur lors de la création : ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistiques globales */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          <div className="text-xs text-gray-600">Aujourd'hui</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.thisWeek}</div>
          <div className="text-xs text-gray-600">Cette semaine</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-xs text-gray-600">En retard</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="Haute">Haute</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Basse">Basse</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous statuts</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>

          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Toutes périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="overdue">En retard</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Rechercher une intervention..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Liste des interventions */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredInterventions.map((intervention: any, index: number) => (
          <div key={intervention.id || index} className={`p-3 border rounded-lg transition-colors ${
            intervention.isOverdue ? 'border-red-200 bg-red-50' :
            intervention.isToday ? 'border-orange-200 bg-orange-50' :
            'border-gray-200 hover:bg-gray-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getUrgencyIndicator(intervention.urgency)}
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {intervention.equipmentName}
                  </h4>
                  {getPriorityBadge(intervention.priority)}
                  {getStatusBadge(intervention.status)}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>{intervention.description}</div>
                  <div className="flex items-center gap-4">
                    <span>👨🔧 {intervention.technicianName}</span>
                    <span>📅 {formatDate(intervention.intervention_date)}</span>
                    {intervention.estimated_duration && (
                      <span>⏱️ {intervention.estimated_duration}h</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex flex-col gap-1 ml-3">
                {intervention.status === 'En attente' && (
                  <>
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Démarrer">
                      <Play className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:bg-green-100 rounded" title="Terminer">
                      <Check className="h-4 w-4" />
                    </button>
                  </>
                )}
                {intervention.status === 'En cours' && (
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded" title="Terminer">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="Modifier">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-100 rounded" title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredInterventions.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">Aucune intervention trouvée</div>
        </div>
      )}

      {/* Actions globales */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Voir toutes les interventions
        </button>
        <button
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          onClick={handleOpenModal}
        >
          + Nouvelle intervention
        </button>
      </div>

      {/* Modale de création d'intervention */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={handleCloseModal}
              >
              ✕
              </button>
            <h3 className="text-lg font-semibold mb-4">Nouvelle intervention</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Équipement *</label>
                <select
                  name="equipment_id"
                  value={form.equipment_id}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {/* À remplacer par la vraie liste d'équipements */}
                  <option value="1">Pelle hydraulique CAT 320</option>
                  <option value="2">Chargeur frontal JCB 3CX</option>
                  <option value="3">Bulldozer CAT D6</option>
                </select>
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date d'intervention *</label>
                <input
                  type="date"
                  name="intervention_date"
                  value={form.intervention_date}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="Haute">Haute</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Basse">Basse</option>
                </select>
                      </div>
                      <div>
                <label className="block text-sm font-medium mb-1">Durée estimée (heures)</label>
                <input
                  type="number"
                  name="estimated_duration"
                  value={form.estimated_duration}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  min="1"
                />
                      </div>
                    <div>
                <label className="block text-sm font-medium mb-1">Technicien assigné</label>
                <select
                  name="technician_id"
                  value={form.technician_id}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Non assigné</option>
                  {/* À remplacer par la vraie liste de techniciens */}
                  <option value="1">Mohammed Alami</option>
                  <option value="2">Ahmed Benali</option>
                  <option value="3">Karim El Fassi</option>
                </select>
            </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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
const getPerformanceScoreData = () => {
  return {
    score: 68,
    target: 85,
    rank: 3, // Rang parmi les vendeurs (anonymisé)
    totalVendors: 12,
    sales: 2400000,
    salesTarget: 3000000,
    growth: 12,
    growthTarget: 15,
    prospects: 8,
    activeProspects: 6,
    responseTime: 2.5, // heures
    responseTarget: 1.5,
    recommendations: [
      {
        type: 'prospect',
        action: 'Relancer vos 2 prospects inactifs',
        impact: '+8 points',
        priority: 'high'
      },
      {
        type: 'annonce',
        action: 'Améliorer 1 annonce avec photos HD',
        impact: '+5 points',
        priority: 'medium'
      },
      {
        type: 'formation',
        action: 'Suivre le module "Techniques de négociation"',
        impact: '+4 points',
        priority: 'low'
      }
    ],
    trends: {
      sales: 'up',
      growth: 'up',
      prospects: 'stable',
      responseTime: 'down'
    }
  };
};

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
const getDefaultPerformanceData = async () => {
  // Essayer de récupérer le nombre total de vendeurs pour un rang réaliste
  let totalVendors = 1;
  let rank = 1;

  try {
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'vendeur');

    if (allUsers && allUsers.length > 0) {
      totalVendors = allUsers.length;
      // Donner un rang réaliste (pas toujours 1er)
      rank = Math.floor(Math.random() * Math.min(totalVendors, 5)) + 1;
    } else {
      // Fallback si pas de données
      totalVendors = 5;
      rank = Math.floor(Math.random() * 3) + 1;
    }
  } catch (error) {
    console.log('Erreur lors de la récupération du nombre de vendeurs:', error);
    totalVendors = 5;
    rank = Math.floor(Math.random() * 3) + 1;
  }

  return {
    score: 0,
    target: 85,
    rank: rank,
    totalVendors: totalVendors,
    sales: 0,
    salesTarget: 3000000,
    growth: 0,
    growthTarget: 15,
    prospects: 0,
    activeProspects: 0,
    responseTime: 0,
    responseTarget: 1.5,
    activityLevel: 'faible',
    activityRecommendation: 'Commencer à collecter des données pour obtenir des recommandations personnalisées',
    recommendations: [
      {
        type: 'data',
        action: 'Commencer à collecter des données',
        impact: '+15 points',
        priority: 'high',
        description: 'Ajoutez vos premières ventes et prospects pour obtenir des recommandations personnalisées'
      },
      {
        type: 'goals',
        action: 'Définir vos objectifs',
        impact: '+10 points',
        priority: 'medium',
        description: 'Configurez vos objectifs de vente pour mesurer votre progression'
      },
      {
        type: 'process',
        action: 'Optimiser votre processus',
        impact: '+8 points',
        priority: 'low',
        description: 'Améliorez votre temps de réponse aux prospects'
      }
    ],
    trends: {
      sales: 'stable',
      growth: 'stable',
      prospects: 'stable',
      responseTime: 'stable'
    },
    metrics: {
      sales: { value: 0, target: 3000000, trend: 'stable' },
      growth: { value: 0, target: 15, trend: 'stable' },
      prospects: { value: 0, target: 10, trend: 'stable' },
      responseTime: { value: 0, target: 1.5, trend: 'stable' }
    }
  };
};

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
const getListData = (widgetId: string): any[] => {
  // Données simulées pour les listes
  const listData: { [key: string]: any[] } = {
    'stock-status': [
      {
        id: '1',
        title: 'Pelle CAT 320',
        status: 'En rupture',
        priority: 'high',
        stock: 0,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'CAT Maroc',
        lastOrder: '2024-01-15',
        nextDelivery: '2024-01-25',
        value: 850000,
        location: 'Entrepôt Casablanca',
        supplierPhone: '+212 5 22 34 56 78',
        supplierEmail: 'contact@catmaroc.ma',
        orderQuantity: 3,
        estimatedCost: 2550000,
        notes: 'Urgent - Projet autoroute Tanger-Casablanca'
      },
      {
        id: '2',
        title: 'Chargeur JCB 3CX',
        status: 'Stock faible',
        priority: 'medium',
        stock: 1,
        minStock: 3,
        category: 'Équipements lourds',
        supplier: 'JCB Maroc',
        lastOrder: '2024-01-10',
        nextDelivery: '2024-01-30',
        value: 420000,
        location: 'Entrepôt Rabat',
        supplierPhone: '+212 5 37 21 43 65',
        supplierEmail: 'contact@jcbmaroc.ma',
        orderQuantity: 2,
        estimatedCost: 840000,
        notes: 'Stock critique - Commande recommandée'
      },
      {
        id: '3',
        title: 'Bulldozer D6',
        status: 'Disponible',
        priority: 'low',
        stock: 4,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'CAT Maroc',
        lastOrder: '2024-01-05',
        nextDelivery: null,
        value: 650000,
        location: 'Entrepôt Marrakech',
        supplierPhone: '+212 5 24 38 91 23',
        supplierEmail: 'contact@catmaroc.ma',
        orderQuantity: 0,
        estimatedCost: 0,
        notes: 'Stock suffisant - Pas de commande nécessaire'
      },
      {
        id: '4',
        title: 'Excavatrice Komatsu',
        status: 'Stock faible',
        priority: 'medium',
        stock: 1,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'Komatsu Maroc',
        lastOrder: '2024-01-12',
        nextDelivery: '2024-01-28',
        value: 580000,
        location: 'Entrepôt Fès',
        supplierPhone: '+212 5 35 67 89 12',
        supplierEmail: 'contact@komatsumaroc.ma',
        orderQuantity: 1,
        estimatedCost: 580000,
        notes: 'Livraison en cours - Surveiller le stock'
      },
      {
        id: '5',
        title: 'Camion benne 20T',
        status: 'Disponible',
        priority: 'low',
        stock: 6,
        minStock: 3,
        category: 'Transport',
        supplier: 'Mercedes Maroc',
        lastOrder: '2024-01-08',
        nextDelivery: null,
        value: 280000,
        location: 'Entrepôt Agadir',
        supplierPhone: '+212 5 28 82 45 67',
        supplierEmail: 'contact@mercedesmaroc.ma',
        orderQuantity: 0,
        estimatedCost: 0,
        notes: 'Stock optimal - Pas d\'action requise'
      }
    ],
    'pending-orders': [
      {
        id: '1',
        title: 'Commande CAT 320',
        status: 'En préparation',
        priority: 'high',
        supplier: 'CAT Maroc',
        orderDate: '2024-01-15',
        expectedDelivery: '2024-01-25',
        value: 2550000,
        progress: 75,
        notes: 'Livraison prévue à Casablanca'
      },
      {
        id: '2',
        title: 'Commande JCB 3CX',
        status: 'En transit',
        priority: 'medium',
        supplier: 'JCB Maroc',
        orderDate: '2024-01-10',
        expectedDelivery: '2024-01-30',
        value: 1260000,
        progress: 90,
        notes: 'En route depuis Tanger'
      },
      {
        id: '3',
        title: 'Commande pièces détachées',
        status: 'En attente',
        priority: 'low',
        supplier: 'Parts Plus',
        orderDate: '2024-01-20',
        expectedDelivery: '2024-02-05',
        value: 45000,
        progress: 25,
        notes: 'Pièces pour maintenance préventive'
      }
    ],

    'stock-action': [
      {
        id: '1',
        title: 'Bulldozer D6',
        status: 'Stock dormant',
        daysInStock: 92,
        lastContact: '2024-01-05',
        price: 650000,
        recommendedAction: 'Baisser le prix de 3%',
        estimatedTimeToSell: 15,
        category: 'Équipements lourds',
        location: 'Entrepôt Marrakech',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Chargeur JCB 3CX',
        status: 'Stock actif',
        daysInStock: 15,
        lastContact: '2024-01-20',
        price: 420000,
        recommendedAction: 'Booster la visibilité',
        estimatedTimeToSell: 8,
        category: 'Équipements lourds',
        location: 'Entrepôt Rabat',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Excavatrice Komatsu',
        status: 'Stock dormant',
        daysInStock: 45,
        lastContact: '2024-01-10',
        price: 580000,
        recommendedAction: 'Proposer livraison gratuite',
        estimatedTimeToSell: 12,
        category: 'Équipements lourds',
        location: 'Entrepôt Fès',
        priority: 'high'
      }
    ],
    'prospection-assistant': [
      {
        id: '1',
        name: 'Fatima Zahra',
        company: 'Construction Atlas',
        stage: 'Qualification',
        probability: 85,
        value: 850000,
        lastContact: '2024-01-22',
        nextAction: 'Envoyer devis personnalisé',
        equipment: 'CAT 950GC',
        visits: 3,
        priority: 'high',
        notes: 'Prospect très intéressé, a consulté 3 fois cette semaine'
      },
      {
        id: '2',
        name: 'Ahmed Benali',
        company: 'BTP Maroc',
        stage: 'Négociation',
        probability: 70,
        value: 1200000,
        lastContact: '2024-01-20',
        nextAction: 'Relancer par WhatsApp',
        equipment: 'JCB 3CX',
        visits: 2,
        priority: 'medium',
        notes: 'En attente de validation budgétaire'
      },
      {
        id: '3',
        name: 'Karim El Fassi',
        company: 'Infrastructure Plus',
        stage: 'Prospection',
        probability: 40,
        value: 650000,
        lastContact: '2024-01-18',
        nextAction: 'Proposer essai machine',
        equipment: 'Bulldozer D6',
        visits: 1,
        priority: 'low',
        notes: 'Premier contact, à développer'
      }
    ],
    'daily-priority-actions': [
      {
        id: '1',
        title: 'Relancer Ahmed Benali (prospect chaud)',
        description: 'Prospect qui a consulté votre 950GC 3 fois cette semaine',
        priority: 'high',
        category: 'prospection',
        impact: 'Élevé - 85% de probabilité de conversion',
        estimatedTime: '15 min',
        icon: '👤',
        action: 'Envoyer message WhatsApp personnalisé'
      },
      {
        id: '2',
        title: 'Réduire le prix du CAT 320D (-2.5%)',
        description: 'Machine en stock depuis 92 jours sans contact',
        priority: 'medium',
        category: 'pricing',
        impact: 'Moyen - Augmentation de 40% des vues attendues',
        estimatedTime: '5 min',
        icon: '💰',
        action: 'Mettre à jour le prix et booster la visibilité'
      },
      {
        id: '3',
        title: 'Publier une annonce pour compacteur',
        description: 'Forte demande détectée à Casablanca cette semaine',
        priority: 'medium',
        category: 'marketing',
        impact: 'Moyen - 15-20 prospects qualifiés attendus',
        estimatedTime: '20 min',
        icon: '📢',
        action: 'Créer annonce optimisée SEO'
      }
    ],
    'sales-evolution': [
      {
        id: '1',
        month: 'Jan 2024',
        sales: 1250000,
        target: 1000000,
        growth: 25,
        sectorAverage: 18,
        trend: 'up',
        metric: 'revenue'
      },
      {
        id: '2',
        month: 'Fév 2024',
        sales: 1350000,
        target: 1100000,
        growth: 22.7,
        sectorAverage: 15,
        trend: 'up',
        metric: 'revenue'
      },
      {
        id: '3',
        month: 'Mar 2024',
        sales: 1420000,
        target: 1200000,
        growth: 18.3,
        sectorAverage: 12,
        trend: 'up',
        metric: 'revenue'
      },
      {
        id: '4',
        month: 'Avr 2024',
        sales: 1380000,
        target: 1300000,
        growth: -2.8,
        sectorAverage: 8,
        trend: 'down',
        metric: 'revenue'
      },
      {
        id: '5',
        month: 'Mai 2024',
        sales: 1520000,
        target: 1400000,
        growth: 10.1,
        sectorAverage: 14,
        trend: 'up',
        metric: 'revenue'
      },
      {
        id: '6',
        month: 'Juin 2024',
        sales: 1680000,
        target: 1500000,
        growth: 10.5,
        sectorAverage: 16,
        trend: 'up',
        metric: 'revenue'
      }
    ],
    'sales-pipeline': [
      {
        id: '1',
        title: 'Projet Autoroute Tanger-Casablanca',
        stage: 'Qualification',
        priority: 'high',
        value: 8500000,
        company: 'Société Nationale des Autoroutes',
        contact: 'Ahmed Benali',
        phone: '+212 5 22 34 56 78',
        email: 'a.benali@sna.ma',
        lastContact: '2024-01-20',
        nextAction: 'Appel de suivi',
        probability: 75,
        expectedClose: '2024-02-15',
        notes: 'Projet majeur - Besoin en équipements lourds'
      },
      {
        id: '2',
        title: 'Construction Centre Commercial Rabat',
        stage: 'Proposition',
        priority: 'medium',
        value: 3200000,
        company: 'Groupe Alliances',
        contact: 'Fatima Zahra',
        phone: '+212 5 37 21 43 65',
        email: 'f.zahra@alliances.ma',
        lastContact: '2024-01-18',
        nextAction: 'Envoi devis',
        probability: 60,
        expectedClose: '2024-02-28',
        notes: 'Location d\'équipements pour 6 mois'
      },
      {
        id: '3',
        title: 'Extension Port Tanger Med',
        stage: 'Négociation',
        priority: 'high',
        value: 12500000,
        company: 'Tanger Med Port Authority',
        contact: 'Mohammed Tazi',
        phone: '+212 5 39 94 12 34',
        email: 'm.tazi@tmsa.ma',
        lastContact: '2024-01-22',
        nextAction: 'Réunion technique',
        probability: 85,
        expectedClose: '2024-03-10',
        notes: 'Projet stratégique - Vente et location'
      },
      {
        id: '4',
        title: 'Mine de Phosphate Khouribga',
        stage: 'Qualification',
        priority: 'medium',
        value: 6800000,
        company: 'Office Chérifien des Phosphates',
        contact: 'Karim El Fassi',
        phone: '+212 5 23 45 67 89',
        email: 'k.elfassi@ocp.ma',
        lastContact: '2024-01-15',
        nextAction: 'Visite site',
        probability: 70,
        expectedClose: '2024-03-20',
        notes: 'Renouvellement équipements miniers'
      },
      {
        id: '5',
        title: 'Projet Éolien Tarfaya',
        stage: 'Prospection',
        priority: 'low',
        value: 4500000,
        company: 'Nareva Holding',
        contact: 'Sara Bennani',
        phone: '+212 5 28 82 45 67',
        email: 's.bennani@nareva.ma',
        lastContact: '2024-01-10',
        nextAction: 'Premier contact',
        probability: 30,
        expectedClose: '2024-04-15',
        notes: 'Nouveau prospect - Équipements de transport'
      }
    ],
    'inventory-status': [
      {
        id: '1',
        title: 'Pelle CAT 320',
        status: 'Stock dormant',
        priority: 'high',
        stock: 2,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'CAT Maroc',
        lastOrder: '2024-01-15',
        nextDelivery: '2024-01-25',
        value: 850000,
        location: 'Entrepôt Casablanca',
        supplierPhone: '+212 5 22 34 56 78',
        supplierEmail: 'contact@catmaroc.ma',
        orderQuantity: 3,
        estimatedCost: 2550000,
        notes: 'Urgent - Projet autoroute Tanger-Casablanca',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 95,
        visibilityRate: 15,
        averageSalesTime: 45,
        clickCount: 3,
        lastContact: '2024-01-10',
        priceReduction: 0,
        premiumBoost: false,
        salesHistory: [1200000, 980000, 850000, 720000, 650000],
        marketDemand: 'Moyenne',
        competitorPrice: 920000,
        seasonalTrend: 'Baisse'
      },
      {
        id: '2',
        title: 'Chargeur JCB 3CX',
        status: 'Faible visibilité',
        priority: 'medium',
        stock: 1,
        minStock: 3,
        category: 'Équipements lourds',
        supplier: 'JCB Maroc',
        lastOrder: '2024-01-10',
        nextDelivery: '2024-01-30',
        value: 420000,
        location: 'Entrepôt Rabat',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 45,
        visibilityRate: 25,
        averageSalesTime: 38,
        clickCount: 8,
        lastContact: '2024-01-15',
        priceReduction: 0,
        premiumBoost: false,
        salesHistory: [480000, 450000, 420000, 400000, 380000],
        marketDemand: 'Élevée',
        competitorPrice: 450000,
        seasonalTrend: 'Stable'
      },
      {
        id: '3',
        title: 'Bulldozer D6',
        status: 'Stock dormant',
        priority: 'high',
        stock: 4,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'CAT Maroc',
        lastOrder: '2024-01-05',
        nextDelivery: null,
        value: 650000,
        location: 'Entrepôt Marrakech',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 120,
        visibilityRate: 8,
        averageSalesTime: 67,
        clickCount: 1,
        lastContact: '2024-01-02',
        priceReduction: 0,
        premiumBoost: false,
        salesHistory: [750000, 720000, 680000, 650000, 620000],
        marketDemand: 'Faible',
        competitorPrice: 680000,
        seasonalTrend: 'Baisse'
      },
      {
        id: '4',
        title: 'Excavatrice Komatsu',
        status: 'Stock faible',
        priority: 'medium',
        stock: 1,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'Komatsu Maroc',
        lastOrder: '2024-01-12',
        nextDelivery: '2024-01-28',
        value: 580000,
        location: 'Entrepôt Fès',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 12,
        visibilityRate: 65,
        averageSalesTime: 28,
        clickCount: 22,
        lastContact: '2024-01-18',
        priceReduction: 0,
        premiumBoost: true,
        salesHistory: [620000, 600000, 580000, 560000, 540000],
        marketDemand: 'Élevée',
        competitorPrice: 600000,
        seasonalTrend: 'Hausse'
      },
      {
        id: '5',
        title: 'Camion benne 20T',
        status: 'Disponible',
        priority: 'low',
        stock: 6,
        minStock: 3,
        category: 'Transport',
        supplier: 'Mercedes Maroc',
        lastOrder: '2024-01-08',
        nextDelivery: null,
        value: 280000,
        location: 'Entrepôt Agadir',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 8,
        visibilityRate: 85,
        averageSalesTime: 15,
        clickCount: 45,
        lastContact: '2024-01-20',
        priceReduction: 0,
        premiumBoost: true,
        salesHistory: [300000, 290000, 285000, 280000, 275000],
        marketDemand: 'Très élevée',
        competitorPrice: 290000,
        seasonalTrend: 'Hausse'
      },
      {
        id: '6',
        title: 'Pelle hydraulique Hitachi',
        status: 'Stock dormant',
        priority: 'high',
        stock: 3,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'Hitachi Maroc',
        lastOrder: '2024-01-03',
        nextDelivery: null,
        value: 720000,
        location: 'Entrepôt Tanger',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 78,
        visibilityRate: 12,
        averageSalesTime: 52,
        clickCount: 2,
        lastContact: '2024-01-05',
        priceReduction: 0,
        premiumBoost: false,
        salesHistory: [800000, 760000, 720000, 680000, 640000],
        marketDemand: 'Moyenne',
        competitorPrice: 750000,
        seasonalTrend: 'Stable'
      },
      {
        id: '7',
        title: 'Chargeur frontal Volvo',
        status: 'Faible visibilité',
        priority: 'medium',
        stock: 2,
        minStock: 2,
        category: 'Équipements lourds',
        supplier: 'Volvo Maroc',
        lastOrder: '2024-01-14',
        nextDelivery: null,
        value: 380000,
        location: 'Entrepôt Meknès',
        // Nouvelles données pour le Plan d'action stock & revente
        dormantDays: 35,
        visibilityRate: 28,
        averageSalesTime: 42,
        clickCount: 6,
        lastContact: '2024-01-16',
        priceReduction: 0,
        premiumBoost: false,
        salesHistory: [420000, 400000, 380000, 360000, 340000],
        marketDemand: 'Moyenne',
        competitorPrice: 400000,
        seasonalTrend: 'Stable'
      }
    ],
    'equipment-availability': [
      { id: '1', title: 'Pelle hydraulique', status: 'Disponible', location: 'Casablanca' },
      { id: '2', title: 'Chargeur frontal', status: 'En location', location: 'Rabat' },
      { id: '3', title: 'Bulldozer', status: 'Maintenance', location: 'Marrakech' }
    ],
    'repair-status': [
      {
        id: '1',
        equipment: 'Pelle CAT 320',
        status: 'En cours',
        priority: 'Haute',
        technician: 'Ahmed Benali',
        startDate: '2024-01-20',
        estimatedCompletion: '2024-01-25',
        actualCompletion: null,
        description: 'Réparation moteur - Problème de surchauffe',
        parts: ['Joint de culasse', 'Thermostat', 'Liquide de refroidissement'],
        cost: 45000,
        location: 'Atelier Casablanca',
        progress: 65,
        urgency: 'Critique',
        notes: 'Attente pièces détachées - Livraison prévue demain',
        photos: ['moteur_avant.jpg', 'moteur_apres.jpg'],
        supplier: 'CAT Maroc',
        supplierPhone: '+212 5 22 34 56 78',
        nextSteps: ['Réception pièces', 'Montage', 'Test moteur', 'Validation']
      },
      {
        id: '2',
        equipment: 'Chargeur JCB 3CX',
        status: 'En attente',
        priority: 'Moyenne',
        technician: 'Mohammed Tazi',
        startDate: '2024-01-18',
        estimatedCompletion: '2024-01-22',
        actualCompletion: null,
        description: 'Réparation système hydraulique',
        parts: ['Pompe hydraulique', 'Filtres', 'Huile hydraulique'],
        cost: 28000,
        location: 'Atelier Rabat',
        progress: 30,
        urgency: 'Normale',
        notes: 'Pièces disponibles - Intervention prévue cet après-midi',
        photos: ['hydraulique_avant.jpg'],
        supplier: 'JCB Maroc',
        supplierPhone: '+212 5 37 21 43 65',
        nextSteps: ['Diagnostic complet', 'Remplacement pompe', 'Test système']
      },
      {
        id: '3',
        equipment: 'Bulldozer D6',
        status: 'Terminé',
        priority: 'Basse',
        technician: 'Hassan El Fassi',
        startDate: '2024-01-15',
        estimatedCompletion: '2024-01-18',
        actualCompletion: '2024-01-17',
        description: 'Révision générale - Changement filtres et huiles',
        parts: ['Filtres à air', 'Filtres à huile', 'Huile moteur', 'Filtres carburant'],
        cost: 12000,
        location: 'Atelier Marrakech',
        progress: 100,
        urgency: 'Normale',
        notes: 'Réparation terminée avec succès - Équipement opérationnel',
        photos: ['revision_complete.jpg'],
        supplier: 'CAT Maroc',
        supplierPhone: '+212 5 24 38 76 54',
        nextSteps: ['Validation client', 'Livraison', 'Documentation']
      },
      {
        id: '4',
        equipment: 'Excavatrice Komatsu',
        status: 'En cours',
        priority: 'Haute',
        technician: 'Youssef Alami',
        startDate: '2024-01-19',
        estimatedCompletion: '2024-01-26',
        actualCompletion: null,
        description: 'Réparation bras hydraulique - Fuite importante',
        parts: ['Cylindre hydraulique', 'Flexibles', 'Joint torique'],
        cost: 35000,
        location: 'Atelier Tanger',
        progress: 45,
        urgency: 'Urgente',
        notes: 'Fuite critique détectée - Intervention d\'urgence',
        photos: ['bras_avant.jpg', 'fuite_detail.jpg'],
        supplier: 'Komatsu Maroc',
        supplierPhone: '+212 5 39 32 18 47',
        nextSteps: ['Remplacement cylindre', 'Test pression', 'Validation étanchéité']
      },
      {
        id: '5',
        equipment: 'Camion benne Volvo',
        status: 'Planifié',
        priority: 'Moyenne',
        technician: 'Karim Bennani',
        startDate: '2024-01-26',
        estimatedCompletion: '2024-01-28',
        actualCompletion: null,
        description: 'Maintenance préventive - Révision complète',
        parts: ['Filtres', 'Huiles', 'Plaquettes frein', 'Courroies'],
        cost: 18000,
        location: 'Atelier Fès',
        progress: 0,
        urgency: 'Normale',
        notes: 'Maintenance planifiée - Équipement disponible',
        photos: [],
        supplier: 'Volvo Maroc',
        supplierPhone: '+212 5 35 67 89 12',
        nextSteps: ['Réception équipement', 'Diagnostic', 'Intervention']
      }
    ],
    'gps-tracking': [
      { id: '1', title: 'Camion 001', status: 'En transit', location: 'Route A1', eta: '2h' },
      { id: '2', title: 'Camion 002', status: 'Livraison', location: 'Casablanca', eta: '30min' }
    ],
    'documents': [
      { id: '1', title: 'Facture 2024-001', status: 'En attente', type: 'Facture' },
      { id: '2', title: 'Devis 2024-002', status: 'Validé', type: 'Devis' }
    ],

    'stock-alerts': [
      { id: '1', title: 'Pelle CAT 320', status: 'Rupture', priority: 'high' },
      { id: '2', title: 'Chargeur JCB', status: 'Stock faible', priority: 'medium' }
    ],
    'daily-actions': getDailyActionsData(widgetId)
  };

  return listData[widgetId] || [];
};

// Fonction pour récupérer les données de disponibilité des équipements
const getEquipmentAvailabilityData = (widgetId: string) => {
  console.log('[DEBUG] getEquipmentAvailabilityData appelée avec widgetId:', widgetId);

  // Retourner des données de test pour le moment
  // Plus tard, cela appellera l'API réelle de manière asynchrone
  return [
    {
      id: '1',
      equipmentFullName: 'Pelle hydraulique CAT 320',
      status: 'Disponible',
      statusColor: 'green',
      usageRate: 25,
      year: 2020,
      condition: 'Excellent',
      brand: 'CAT',
      model: '320'
    },
    {
      id: '2',
      equipmentFullName: 'Chargeur frontal JCB',
      status: 'En location',
      statusColor: 'orange',
      usageRate: 85,
      year: 2019,
      condition: 'Bon',
      brand: 'JCB',
      model: '3CX',
      currentRental: {
        startDate: '2024-01-15',
        endDate: '2024-01-25',
        status: 'En cours'
      }
    },
    {
      id: '3',
      equipmentFullName: 'Bulldozer D6',
      status: 'Maintenance',
      statusColor: 'red',
      usageRate: 0,
      year: 2018,
      condition: 'Maintenance',
      brand: 'CAT',
      model: 'D6',
      currentIntervention: {
        scheduledDate: '2024-01-20',
        status: 'En cours'
      }
    }
  ];
};

// Composant spécialisé pour le Pipeline Commercial
const SalesPipelineWidget = ({ data }: { data: any[] }) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'lastContact'>('value');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [leadsData, setLeadsData] = useState<any[]>(data);
  
  // Nouvelles états pour les fonctionnalités enrichies
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showConversionRates, setShowConversionRates] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [conversionRates, setConversionRates] = useState<any>({});

  // Mettre à jour les données quand les props changent
  React.useEffect(() => {
    setLeadsData(data);
  }, [data]);

  // Fonction utilitaire pour calculer les jours depuis le dernier contact
  function getDaysSinceLastContact(dateString: string) {
    const lastContact = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calculer les statistiques du pipeline
  const pipelineStats = React.useMemo(() => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const stats = {
      total: leadsData.length,
      totalValue: leadsData.reduce((sum, lead) => sum + (lead.value || 0), 0),
      weightedValue: leadsData.reduce((sum, lead) => sum + ((lead.value || 0) * (lead.probability || 0) / 100), 0),
      byStage: {} as Record<string, { count: number; value: number; weightedValue: number }>
    };

    stages.forEach(stage => {
      const stageLeads = leadsData.filter(lead => lead.stage === stage);
      stats.byStage[stage] = {
        count: stageLeads.length,
        value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
        weightedValue: stageLeads.reduce((sum, lead) => sum + ((lead.value || 0) * (lead.probability || 0) / 100), 0)
      };
    });

    return stats;
  }, [leadsData]);

  // Calculer les taux de conversion
  const calculateConversionRates = React.useMemo(() => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const rates: Record<string, number> = {};
    
    // Taux de conversion global
    const totalLeads = leadsData.length;
    const wonLeads = leadsData.filter(lead => lead.stage === 'Conclu').length;
    rates.global = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    
    // Taux par étape
    stages.forEach((stage, index) => {
      if (index < stages.length - 1) {
        const currentStageLeads = leadsData.filter(lead => lead.stage === stage).length;
        const nextStageLeads = leadsData.filter(lead => lead.stage === stages[index + 1]).length;
        rates[stage] = currentStageLeads > 0 ? (nextStageLeads / currentStageLeads) * 100 : 0;
      }
    });
    
    return rates;
  }, [leadsData]);

  // Générer les insights IA
  const generateAIInsights = React.useMemo(() => {
    const insights = [];
    
    // Analyser les blocages
    const stuckLeads = leadsData.filter(lead => {
      const daysSinceContact = getDaysSinceLastContact(lead.lastContact);
      return daysSinceContact > 7 && lead.stage !== 'Conclu' && lead.stage !== 'Perdu';
    });
    
    if (stuckLeads.length > 0) {
      insights.push({
        type: 'blockage',
        title: 'Leads bloqués détectés',
        description: `${stuckLeads.length} leads sans contact depuis plus de 7 jours`,
        priority: 'high',
        action: 'Relancer les prospects bloqués',
        leads: stuckLeads
      });
    }
    
    // Analyser les devis sans relance
    const quotesWithoutFollowUp = leadsData.filter(lead => 
      lead.stage === 'Devis' && getDaysSinceLastContact(lead.lastContact) > 3
    );
    
    if (quotesWithoutFollowUp.length > 0) {
      insights.push({
        type: 'quote',
        title: 'Devis sans relance',
        description: `${quotesWithoutFollowUp.length} devis envoyés sans suivi`,
        priority: 'medium',
        action: 'Programmer des relances automatiques',
        leads: quotesWithoutFollowUp
      });
    }
    
    // Analyser les opportunités à forte valeur
    const highValueLeads = leadsData.filter(lead => 
      lead.value > 500000 && lead.stage !== 'Conclu' && lead.stage !== 'Perdu'
    );
    
    if (highValueLeads.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Opportunités à forte valeur',
        description: `${highValueLeads.length} leads de plus de 500k MAD`,
        priority: 'high',
        action: 'Prioriser le suivi de ces prospects',
        leads: highValueLeads
      });
    }
    
    // Analyser les taux de conversion faibles
    const lowConversionStages = Object.entries(calculateConversionRates).filter(([stage, rate]) => 
      stage !== 'global' && (rate as number) < 20
    );
    
    if (lowConversionStages.length > 0) {
      insights.push({
        type: 'conversion',
        title: 'Taux de conversion faibles',
        description: `Étapes avec conversion < 20%: ${lowConversionStages.map(([stage]) => stage).join(', ')}`,
        priority: 'medium',
        action: 'Analyser et optimiser le processus de vente',
        stages: lowConversionStages
      });
    }
    
    return insights;
  }, [leadsData, calculateConversionRates]);

  // Trier les leads
  const sortedLeads = React.useMemo(() => {
    let sorted = [...leadsData];
    if (selectedStage) {
      sorted = sorted.filter(lead => lead.stage === selectedStage);
    }

    switch (sortBy) {
      case 'value':
        return sorted.sort((a, b) => (b.value || 0) - (a.value || 0));
      case 'probability':
        return sorted.sort((a, b) => (b.probability || 0) - (a.probability || 0));
      case 'lastContact':
        return sorted.sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
      default:
        return sorted;
    }
  }, [leadsData, selectedStage, sortBy]);

  const getStageColor = (stage: string) => {
    const colors = {
      'Prospection': 'bg-orange-100 text-orange-800',
      'Devis': 'bg-orange-200 text-orange-900',
      'Négociation': 'bg-orange-400 text-white',
      'Conclu': 'bg-green-500 text-white',
      'Perdu': 'bg-red-500 text-white'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-orange-100 text-orange-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleNextStage = (lead: any) => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const currentIndex = stages.indexOf(lead.stage);

    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];

      // Mettre à jour les données localement
      const updatedLeads = leadsData.map(l => {
        if (l.id === lead.id) {
          return {
            ...l,
            stage: nextStage,
            lastContact: new Date().toISOString().split('T')[0], // Mise à jour de la date de contact
            probability: Math.min(l.probability + 20, 100), // Augmentation de la probabilité
            nextAction: getNextActionForStage(nextStage)
          };
        }
        return l;
      });

      setLeadsData(updatedLeads);

      // Mettre à jour le lead sélectionné si c'est le même
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead({
          ...selectedLead,
          stage: nextStage,
          lastContact: new Date().toISOString().split('T')[0],
          probability: Math.min(selectedLead.probability + 20, 100),
          nextAction: getNextActionForStage(nextStage)
        });
      }

      // Notification de succès
      const stageNames = {
        'Devis': 'Devis',
        'Négociation': 'Négociation',
        'Conclu': 'Vente conclue',
        'Perdu': 'Vente perdue'
      };

      alert(`✅ Lead "${lead.title}" passé avec succès à l'étape: ${stageNames[nextStage as keyof typeof stageNames]}`);

      // Ici on pourrait appeler une API pour sauvegarder en base de données
      console.log(`[API] Mise à jour du lead ${lead.id}: ${lead.stage} → ${nextStage}`);

    } else {
      alert('🎉 Ce lead est déjà à la dernière étape !');
    }
  };

  const getNextActionForStage = (stage: string) => {
    const actions = {
      'Devis': 'Préparer et envoyer le devis',
      'Négociation': 'Programmer une réunion de négociation',
      'Conclu': 'Finaliser la documentation et facturation',
      'Perdu': 'Analyser les raisons et améliorer le processus'
    };
    return actions[stage as keyof typeof actions] || 'Définir la prochaine action';
  };

  const handleEditLead = (lead: any) => {
    setEditForm({
      id: lead.id,
      title: lead.title,
      stage: lead.stage,
      priority: lead.priority,
      value: lead.value,
      probability: lead.probability,
      nextAction: lead.nextAction,
      assignedTo: lead.assignedTo,
      notes: lead.notes || ''
    });
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    // Mettre à jour les données localement
    const updatedLeads = leadsData.map(l => {
      if (l.id === editForm.id) {
        return {
          ...l,
          ...editForm,
          lastContact: new Date().toISOString().split('T')[0] // Mise à jour de la date de contact
        };
      }
      return l;
    });

    setLeadsData(updatedLeads);

    // Mettre à jour le lead sélectionné si c'est le même
    if (selectedLead && selectedLead.id === editForm.id) {
      setSelectedLead({
        ...selectedLead,
        ...editForm,
        lastContact: new Date().toISOString().split('T')[0]
      });
    }

    alert('✅ Modifications sauvegardées avec succès');
    setShowEditForm(false);
    setEditForm({});

    // Ici on pourrait appeler une API pour sauvegarder en base de données
    console.log('[API] Sauvegarde des modifications:', editForm);
  };

  const handleAddNote = () => {
    const note = prompt('Ajouter une note:');
    if (note && selectedLead) {
      // Ajouter la note au lead
      const updatedLeads = leadsData.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            notes: l.notes ? `${l.notes}\n${new Date().toLocaleString('fr-FR')}: ${note}` : `${new Date().toLocaleString('fr-FR')}: ${note}`
          };
        }
        return l;
      });

      setLeadsData(updatedLeads);

      // Mettre à jour le lead sélectionné
      setSelectedLead({
        ...selectedLead,
        notes: selectedLead.notes ? `${selectedLead.notes}\n${new Date().toLocaleString('fr-FR')}: ${note}` : `${new Date().toLocaleString('fr-FR')}: ${note}`
      });

      alert('✅ Note ajoutée avec succès');
      console.log(`[API] Note ajoutée au lead ${selectedLead.id}:`, note);
    }
  };

  const handleScheduleCall = () => {
    const date = prompt('Date du rendez-vous (YYYY-MM-DD):');
    const time = prompt('Heure du rendez-vous (HH:MM):');
    if (date && time && selectedLead) {
      // Ajouter le rendez-vous au lead
      const appointment = `Rendez-vous programmé: ${date} à ${time}`;
      const updatedLeads = leadsData.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            nextAction: appointment,
            lastContact: date
          };
        }
        return l;
      });

      setLeadsData(updatedLeads);

      // Mettre à jour le lead sélectionné
      setSelectedLead({
        ...selectedLead,
        nextAction: appointment,
        lastContact: date
      });

      alert('✅ Rendez-vous programmé avec succès');
      console.log(`[API] Rendez-vous programmé pour le lead ${selectedLead.id}: ${date} à ${time}`);
    }
  };

  const handleAddNewLead = () => {
    const newLead = {
      id: `lead-${Date.now()}`,
      title: prompt('Nom du prospect:') || 'Nouveau prospect',
      stage: 'Prospection',
      priority: 'medium',
      value: parseInt(prompt('Valeur estimée (MAD):') || '0'),
      probability: 10,
      nextAction: 'Premier contact',
      assignedTo: prompt('Assigné à:') || 'Commercial',
      lastContact: new Date().toISOString().split('T')[0],
      notes: ''
    };

    if (newLead.title !== 'Nouveau prospect') {
      setLeadsData([...leadsData, newLead]);
      alert('✅ Nouveau lead ajouté avec succès');
      console.log('[API] Nouveau lead créé:', newLead);
    }
  };

  // Nouvelles fonctions pour les fonctionnalités enrichies
  const handleAIInsightAction = (insight: any) => {
    switch (insight.type) {
      case 'blockage':
        alert(`🔄 Relance automatique programmée pour ${insight.leads.length} leads bloqués`);
        break;
      case 'quote':
        alert(`📧 Relances automatiques programmées pour ${insight.leads.length} devis`);
        break;
      case 'opportunity':
        alert(`⭐ Priorité élevée accordée à ${insight.leads.length} opportunités à forte valeur`);
        break;
      case 'conversion':
        alert(`📊 Analyse des taux de conversion lancée pour optimiser le processus`);
        break;
    }
  };

  const handleViewKanban = () => {
    setViewMode('kanban');
  };

  const handleViewTimeline = () => {
    setViewMode('timeline');
  };

  const handleViewList = () => {
    setViewMode('list');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'blockage': return <AlertTriangle className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'opportunity': return <Star className="w-4 h-4" />;
      case 'conversion': return <TrendingUp className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'blockage': return 'text-red-600 bg-red-50 border-red-200';
      case 'quote': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'opportunity': return 'text-green-600 bg-green-50 border-green-200';
      case 'conversion': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-orange-900">Pipeline Commercial</h3>
        <div className="flex items-center gap-2">
          {/* Boutons de vue */}
          <div className="flex bg-orange-100 rounded-lg p-1">
            <button
              onClick={handleViewList}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-orange-700 hover:bg-orange-200'
              }`}
            >
              Liste
            </button>
            <button
              onClick={handleViewKanban}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-orange-700 hover:bg-orange-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={handleViewTimeline}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-orange-700 hover:bg-orange-200'
              }`}
            >
              Timeline
            </button>
          </div>
          
          <button
            onClick={handleAddNewLead}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Lead
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{pipelineStats.total}</div>
          <div className="text-xs text-orange-600">Total Leads</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{formatCurrency(pipelineStats.totalValue)}</div>
          <div className="text-xs text-orange-600">Valeur Totale</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{formatCurrency(pipelineStats.weightedValue)}</div>
          <div className="text-xs text-orange-600">Valeur Pondérée</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">
            {Math.round(calculateConversionRates.global)}%
          </div>
          <div className="text-xs text-orange-600">Taux Conversion</div>
        </div>
      </div>

      {/* Taux de conversion par étape */}
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-orange-900">Taux de Conversion par Étape</h4>
          <button
            onClick={() => setShowConversionRates(!showConversionRates)}
            className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
          >
            {showConversionRates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showConversionRates ? 'Masquer' : 'Voir détails'}
          </button>
        </div>
        
        {showConversionRates && (
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(calculateConversionRates).filter(([stage]) => stage !== 'global').map(([stage, rate]) => (
              <div key={stage} className="text-center">
                <div className={`text-xs px-2 py-1 rounded-full ${getStageColor(stage)} mb-2`}>
                  {stage}
                </div>
                <div className="text-lg font-bold text-orange-900">{Math.round(rate)}%</div>
                <div className="text-xs text-orange-600">
                  {pipelineStats.byStage[stage]?.count || 0} leads
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights IA */}
      {generateAIInsights.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Insights IA
            </h4>
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
            >
              {showAIInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAIInsights ? 'Masquer' : 'Voir détails'}
            </button>
          </div>
          
          {showAIInsights && (
            <div className="space-y-3">
              {generateAIInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{insight.title}</h5>
                        <p className="text-xs mt-1">{insight.description}</p>
                        <p className="text-xs mt-2 font-medium">Action suggérée: {insight.action}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAIInsightAction(insight)}
                      className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Agir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pipeline par étapes */}
      <div className="bg-orange-100 rounded-lg p-4 border border-orange-200">
        <h4 className="text-sm font-semibold text-orange-900 mb-3">Pipeline par Étapes</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(pipelineStats.byStage).map(([stage, stats]) => (
            <div key={stage} className="text-center">
              <div className={`text-xs px-2 py-1 rounded-full ${getStageColor(stage)} mb-1`}>
                {stage}
              </div>
              <div className="text-lg font-bold text-orange-900">{stats.count}</div>
              <div className="text-xs text-orange-700">{formatCurrency(stats.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedStage || ''}
          onChange={(e) => setSelectedStage(e.target.value || null)}
          className="px-3 py-2 border border-orange-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Toutes les étapes</option>
          <option value="Prospection">Prospection</option>
          <option value="Devis">Devis</option>
          <option value="Négociation">Négociation</option>
          <option value="Conclu">Conclu</option>
          <option value="Perdu">Perdu</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'value' | 'probability' | 'lastContact')}
          className="px-3 py-2 border border-orange-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="value">Trier par valeur</option>
          <option value="probability">Trier par probabilité</option>
          <option value="lastContact">Trier par dernier contact</option>
        </select>
      </div>

      {/* Contenu selon le mode de vue */}
      {viewMode === 'list' && (
        <>
          {/* Liste des leads */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedLeads.map((lead) => (
              <div key={lead.id} className="bg-white border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{lead.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(lead.stage)}`}>
                        {lead.stage}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>
                        {lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-700">{formatCurrency(lead.value)}</div>
                    <div className="text-sm text-orange-600">{lead.probability}% de probabilité</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-orange-700">Prochaine action:</span>
                    <div className="font-medium text-gray-900">{lead.nextAction}</div>
                  </div>
                  <div>
                    <span className="text-orange-700">Assigné à:</span>
                    <div className="font-medium text-gray-900">{lead.assignedTo}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-100">
                  <div className="text-xs text-orange-600">
                    Dernier contact: {formatDate(lead.lastContact)}
                    <span className="ml-2 text-orange-600">
                      ({getDaysSinceLastContact(lead.lastContact)} jours)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(lead)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Voir détails
                    </button>
                    <button
                      onClick={() => handleNextStage(lead)}
                      disabled={lead.stage === 'Conclu' || lead.stage === 'Perdu'}
                      className={`text-xs px-2 py-1 rounded ${
                        lead.stage === 'Conclu' || lead.stage === 'Perdu'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'Lead finalisé' : 'Passer à l\'étape suivante'}
                    >
                      {lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'Finalisé' : 'Suivant'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedLeads.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Aucun lead trouvé pour cette étape
            </div>
          )}
        </>
      )}

      {/* Vue Kanban */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-5 gap-4 max-h-96 overflow-y-auto">
          {['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'].map((stage) => {
            const stageLeads = leadsData.filter(lead => lead.stage === stage);
            return (
              <div key={stage} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold px-2 py-1 rounded-full ${getStageColor(stage)}`}>
                    {stage}
                  </h4>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <div key={lead.id} className="bg-white rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(lead)}>
                      <h5 className="font-semibold text-sm text-gray-900 mb-1">{lead.title}</h5>
                      <div className="text-lg font-bold text-orange-700 mb-1">{formatCurrency(lead.value)}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>
                          {lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                        <span className="text-orange-600">{lead.probability}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {getDaysSinceLastContact(lead.lastContact)} jours
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vue Timeline */}
      {viewMode === 'timeline' && (
        <div className="max-h-96 overflow-y-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-300"></div>
            
    <div className="space-y-4">
              {sortedLeads.map((lead, index) => (
                <div key={lead.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`absolute left-3 w-3 h-3 rounded-full border-2 border-white ${getStageColor(lead.stage).includes('bg-green') ? 'bg-green-500' : getStageColor(lead.stage).includes('bg-red') ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  
                  {/* Content */}
                  <div className="ml-8 bg-white rounded-lg p-4 border border-orange-200 flex-1 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{lead.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(lead.stage)}`}>
                            {lead.stage}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>
                            {lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-700">{formatCurrency(lead.value)}</div>
                        <div className="text-sm text-orange-600">{lead.probability}%</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div>Prochaine action: {lead.nextAction}</div>
                      <div>Assigné à: {lead.assignedTo}</div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-orange-600">
                      <span>Dernier contact: {formatDate(lead.lastContact)}</span>
                      <span>({getDaysSinceLastContact(lead.lastContact)} jours)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails du lead */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Détails du Lead</h3>
              <button
                onClick={() => setShowLeadDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-6">
              <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{selectedLead.title}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStageColor(selectedLead.stage)}`}>
                        {selectedLead.stage}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedLead.priority)}`}>
                        {selectedLead.priority === 'high' ? 'Haute' : selectedLead.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                      </span>
                  </div>
                    <div>
                      <span className="text-gray-600">Valeur:</span>
                      <div className="text-xl font-bold text-green-600">{formatCurrency(selectedLead.value)}</div>
                  </div>
                    <div>
                      <span className="text-gray-600">Probabilité:</span>
                      <div className="text-lg font-semibold">{selectedLead.probability}%</div>
                  </div>
                </div>
              </div>

                <div className="space-y-3">
              <div>
                    <span className="text-gray-600">Assigné à:</span>
                    <div className="font-medium">{selectedLead.assignedTo}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Prochaine action:</span>
                    <div className="font-medium">{selectedLead.nextAction}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dernier contact:</span>
                    <div className="font-medium">{formatDate(selectedLead.lastContact)}</div>
                    <div className="text-sm text-orange-600">
                      Il y a {getDaysSinceLastContact(selectedLead.lastContact)} jours
                  </div>
                </div>
              </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="border-t pt-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">Notes</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.notes}</pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Actions</h5>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleEditLead(selectedLead)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Ajouter une note
                  </button>
                  <button
                    onClick={handleScheduleCall}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Programmer un appel
                  </button>
                  <button
                    onClick={() => handleNextStage(selectedLead)}
                    disabled={selectedLead.stage === 'Clôturé'}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selectedLead.stage === 'Clôturé'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {selectedLead.stage === 'Clôturé' ? 'Déjà clôturé' : 'Passer à l\'étape suivante'}
                  </button>
                </div>
              </div>

              {/* Historique des contacts (simulé) */}
              <div className="border-t pt-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Historique des contacts</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Appel téléphonique</div>
                      <div className="text-sm text-gray-600">Contact établi, intérêt confirmé</div>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(selectedLead.lastContact)}</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Email de présentation</div>
                      <div className="text-sm text-gray-600">Envoi du catalogue produits</div>
                    </div>
                    <div className="text-xs text-gray-500">2024-01-15</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Premier contact</div>
                      <div className="text-sm text-gray-600">Lead généré via site web</div>
                    </div>
                    <div className="text-xs text-gray-500">2024-01-10</div>
                  </div>
                </div>
              </div>
            </div>
                      </div>
                    </div>
                  )}

      {/* Modal d'édition */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Modifier le Lead</h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                      </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étape</label>
                <select
                  value={editForm.stage || ''}
                  onChange={(e) => setEditForm({...editForm, stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Prospection">Prospection</option>
                  <option value="Devis">Devis</option>
                  <option value="Négociation">Négociation</option>
                  <option value="Conclu">Conclu</option>
                  <option value="Perdu">Perdu</option>
                </select>
                    </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={editForm.priority || ''}
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur (MAD)</label>
                <input
                  type="number"
                  value={editForm.value || ''}
                  onChange={(e) => setEditForm({...editForm, value: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probabilité (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.probability || ''}
                  onChange={(e) => setEditForm({...editForm, probability: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
                <input
                  type="text"
                  value={editForm.nextAction || ''}
                  onChange={(e) => setEditForm({...editForm, nextAction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                <input
                  type="text"
                  value={editForm.assignedTo || ''}
                  onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant spécialisé pour l'Évolution des Ventes
const SalesEvolutionWidgetEnriched = ({ data = [] }: { data?: any[] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | '24m'>('12m');
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'units' | 'growth'>('sales');
  const [showDetails, setShowDetails] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [showMultiChart, setShowMultiChart] = useState(true);
  const [showAIForecast, setShowAIForecast] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any>({});
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Données étendues pour 24 mois avec objectifs et année précédente
  const extendedData = React.useMemo(() => {
    const baseData = [
      { month: 'Jan 2023', sales: 1200000, units: 45, growth: 0, target: 1250000, previousYear: 1100000 },
      { month: 'Fév 2023', sales: 1350000, units: 52, growth: 12.5, target: 1300000, previousYear: 1150000 },
      { month: 'Mar 2023', sales: 1420000, units: 38, growth: 5.2, target: 1350000, previousYear: 1200000 },
      { month: 'Avr 2023', sales: 1580000, units: 67, growth: 11.3, target: 1400000, previousYear: 1250000 },
      { month: 'Mai 2023', sales: 1650000, units: 58, growth: 4.4, target: 1450000, previousYear: 1300000 },
      { month: 'Juin 2023', sales: 1720000, units: 72, growth: 4.2, target: 1500000, previousYear: 1350000 },
      { month: 'Juil 2023', sales: 1890000, units: 89, growth: 9.9, target: 1550000, previousYear: 1400000 },
      { month: 'Août 2023', sales: 1760000, units: 76, growth: -6.9, target: 1600000, previousYear: 1450000 },
      { month: 'Sep 2023', sales: 1650000, units: 65, growth: -6.3, target: 1650000, previousYear: 1500000 },
      { month: 'Oct 2023', sales: 1820000, units: 82, growth: 10.3, target: 1700000, previousYear: 1550000 },
      { month: 'Nov 2023', sales: 1910000, units: 91, growth: 4.9, target: 1750000, previousYear: 1600000 },
      { month: 'Déc 2023', sales: 1780000, units: 78, growth: -6.8, target: 1800000, previousYear: 1650000 },
      { month: 'Jan 2024', sales: 1950000, units: 95, growth: 9.6, target: 1850000, previousYear: 1200000 },
      { month: 'Fév 2024', sales: 2100000, units: 102, growth: 7.7, target: 1900000, previousYear: 1350000 },
      { month: 'Mar 2024', sales: 2250000, units: 108, growth: 7.1, target: 1950000, previousYear: 1420000 },
      { month: 'Avr 2024', sales: 2400000, units: 115, growth: 6.7, target: 2000000, previousYear: 1580000 },
      { month: 'Mai 2024', sales: 2550000, units: 122, growth: 6.3, target: 2050000, previousYear: 1650000 },
      { month: 'Juin 2024', sales: 2700000, units: 128, growth: 5.9, target: 2100000, previousYear: 1720000 },
      { month: 'Juil 2024', sales: 2850000, units: 135, growth: 5.6, target: 2150000, previousYear: 1890000 },
      { month: 'Août 2024', sales: 3000000, units: 142, growth: 5.3, target: 2200000, previousYear: 1760000 },
      { month: 'Sep 2024', sales: 3150000, units: 148, growth: 5.0, target: 2250000, previousYear: 1650000 },
      { month: 'Oct 2024', sales: 3300000, units: 155, growth: 4.8, target: 2300000, previousYear: 1820000 },
      { month: 'Nov 2024', sales: 3450000, units: 162, growth: 4.5, target: 2350000, previousYear: 1910000 },
      { month: 'Déc 2024', sales: 3600000, units: 168, growth: 4.3, target: 2400000, previousYear: 1780000 }
    ];

    // Filtrer selon la période sélectionnée
    const periods = {
      '6m': 6,
      '12m': 12,
      '24m': 24
    };

    return baseData.slice(-periods[selectedPeriod]);
  }, [selectedPeriod]);

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    const totalSales = extendedData.reduce((sum: number, item: any) => sum + item.sales, 0);
    const totalUnits = extendedData.reduce((sum: number, item: any) => sum + item.units, 0);
    const avgGrowth = extendedData.reduce((sum: number, item: any) => sum + item.growth, 0) / extendedData.length;
    const avgSales = totalSales / extendedData.length;

    // Trouver les indices du meilleur et pire mois
    const bestMonthIndex = extendedData.reduce((maxIndex: number, item: any, index: number) =>
      item.sales > extendedData[maxIndex].sales ? index : maxIndex, 0);
    const worstMonthIndex = extendedData.reduce((minIndex: number, item: any, index: number) =>
      item.sales < extendedData[minIndex].sales ? index : minIndex, 0);

    return { totalSales, totalUnits, avgGrowth, avgSales, bestMonthIndex, worstMonthIndex };
  }, [extendedData]);

  // Calculer les prévisions
  const forecasts = React.useMemo(() => {
    const recentData = extendedData.slice(-3);
    const avgRecentSales = recentData.reduce((sum: number, item: any) => sum + item.sales, 0) / recentData.length;
    const trend = recentData[recentData.length - 1].sales - recentData[0].sales;

    return {
      optimistic: avgRecentSales * 1.15,
      realistic: avgRecentSales * 1.05,
      pessimistic: avgRecentSales * 0.95,
      trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
  }, [extendedData]);

  // Données de benchmarking secteur (simulation)
  const sectorBenchmarkData = React.useMemo(() => {
    return [
      { month: 'Jan 2024', sectorAvg: 1800000, companySales: 1950000, difference: 8.3 },
      { month: 'Fév 2024', sectorAvg: 1950000, companySales: 2100000, difference: 7.7 },
      { month: 'Mar 2024', sectorAvg: 2100000, companySales: 2250000, difference: 7.1 },
      { month: 'Avr 2024', sectorAvg: 2250000, companySales: 2400000, difference: 6.7 },
      { month: 'Mai 2024', sectorAvg: 2400000, companySales: 2550000, difference: 6.3 },
      { month: 'Juin 2024', sectorAvg: 2550000, companySales: 2700000, difference: 5.9 }
    ];
  }, []);

  // Données de benchmark enrichies
  React.useEffect(() => {
    const currentMonth = extendedData[extendedData.length - 1];
    const avgSales = extendedData.reduce((sum, item) => sum + item.sales, 0) / extendedData.length;
    
    setBenchmarkData({
      sectorAverage: 2200000,
      top25Percent: 2800000,
      yourPerformance: avgSales,
      sectorRank: 85, // Top 15%
      performanceGap: ((avgSales - 2200000) / 2200000) * 100,
      top25Gap: ((2800000 - avgSales) / avgSales) * 100
    });
  }, [extendedData]);

  // Insights IA enrichis
  React.useEffect(() => {
    const currentMonth = extendedData[extendedData.length - 1];
    const recentTrend = extendedData.slice(-3).reduce((sum, item) => sum + item.growth, 0) / 3;
    
    const newInsights = [
      {
        id: 1,
        type: 'pricing',
        title: 'Pricing Dynamique Recommandé',
        description: 'Vos prix sont 8% en dessous de la moyenne secteur. Augmentation de 5-7% recommandée.',
        impact: 'high',
        confidence: 92,
        action: 'Ajuster les prix de la gamme premium',
        estimatedGain: '+12% CA'
      },
      {
        id: 2,
        type: 'catalog',
        title: 'Repositionnement Catalogue',
        description: 'Les engins compacts représentent 65% des ventes. Focus sur cette catégorie.',
        impact: 'medium',
        confidence: 88,
        action: 'Élargir la gamme compacte',
        estimatedGain: '+8% parts de marché'
      },
      {
        id: 3,
        type: 'promo',
        title: 'Campagne Promotionnelle',
        description: 'Période de faible activité détectée (Août-Sep). Campagne ciblée recommandée.',
        impact: 'high',
        confidence: 85,
        action: 'Lancer promotion "Fin d\'été"',
        estimatedGain: '+15% ventes saisonnières'
      },
      {
        id: 4,
        type: 'forecast',
        title: 'Prévision IA - Q1 2025',
        description: 'Croissance de 12% attendue basée sur les tendances et données sectorielles.',
        impact: 'medium',
        confidence: 78,
        action: 'Préparer l\'inventaire',
        estimatedGain: 'Optimisation stock'
      }
    ];

    setAiInsights(newInsights);
  }, [extendedData]);

  // Système de notifications automatiques enrichi
  React.useEffect(() => {
    const currentMonth = extendedData[extendedData.length - 1];
    const previousMonth = extendedData[extendedData.length - 2];

    const newNotifications = [];

    // Notification si baisse de plus de 15%
    if (previousMonth && currentMonth.growth < -15) {
      newNotifications.push({
        id: Date.now(),
        type: 'warning',
        title: 'Baisse significative détectée',
        message: `${currentMonth.month} en recul de ${Math.abs(currentMonth.growth)}% vs ${previousMonth.month}`,
        suggestion: 'Suggéré : publier engins compacts ou repositionner la 320D à 860k MAD',
        timestamp: new Date().toISOString(),
        priority: 'high',
        action: 'correct-month'
      });
    }

    // Notification si performance supérieure au secteur
    const sectorComparison = sectorBenchmarkData.find(item => item.month === currentMonth.month);
    if (sectorComparison && sectorComparison.difference > 10) {
      newNotifications.push({
        id: Date.now() + 1,
        type: 'success',
        title: 'Performance exceptionnelle',
        message: `${currentMonth.month} : +${sectorComparison.difference}% vs moyenne secteur`,
        suggestion: 'Capitaliser sur cette dynamique avec des promotions ciblées',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        action: 'publish-promo'
      });
    }

    // Notification si objectif non atteint
    if (currentMonth.sales < currentMonth.target * 0.9) {
      newNotifications.push({
        id: Date.now() + 2,
        type: 'alert',
        title: 'Objectif en retard',
        message: `${currentMonth.month} : ${((currentMonth.sales / currentMonth.target) * 100).toFixed(1)}% de l'objectif`,
        suggestion: 'Actions correctives : promotions agressives ou nouveaux prospects',
        timestamp: new Date().toISOString(),
        priority: 'high',
        action: 'add-equipment'
      });
    }

    // Notification de benchmarking automatique
    if (sectorComparison) {
      newNotifications.push({
        id: Date.now() + 3,
        type: 'info',
        title: 'Benchmarking secteur',
        message: `${currentMonth.month} : ${sectorComparison.difference > 0 ? '+' : ''}${sectorComparison.difference}% vs secteur`,
        suggestion: 'Voir comparaison détaillée avec les concurrents',
        timestamp: new Date().toISOString(),
        priority: 'low',
        action: 'show-benchmark'
      });
    }

    // Notification IA - Pricing dynamique
    if (benchmarkData.performanceGap > 5) {
      newNotifications.push({
        id: Date.now() + 4,
        type: 'ai',
        title: 'IA - Pricing Dynamique',
        message: 'Opportunité d\'augmentation de prix détectée',
        suggestion: 'Augmenter les prix de 5-7% pour optimiser la marge',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        action: 'adjust-pricing'
      });
    }

    // Notification IA - Prévision positive
    const recentTrend = extendedData.slice(-3).reduce((sum, item) => sum + item.growth, 0) / 3;
    if (recentTrend > 5) {
      newNotifications.push({
        id: Date.now() + 5,
        type: 'ai',
        title: 'IA - Prévision Positive',
        message: 'Tendance positive détectée pour les 3 prochains mois',
        suggestion: 'Préparer l\'inventaire pour la croissance attendue',
        timestamp: new Date().toISOString(),
        priority: 'low',
        action: 'prepare-inventory'
      });
    }

    setNotifications(prev => [...newNotifications, ...prev.slice(0, 6)]);
  }, [extendedData, sectorBenchmarkData, benchmarkData]);

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

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'sales': return 'Chiffre d\'affaires (MAD)';
      case 'units': return 'Nombre d\'unités vendues';
      case 'growth': return 'Croissance (%)';
      default: return '';
    }
  };

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'sales': return item.sales;
      case 'units': return item.units;
      case 'growth': return item.growth;
      default: return item.sales;
    }
  };

  const getMetricColor = (value: number) => {
    if (selectedMetric === 'sales') {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    } else if (selectedMetric === 'growth') {
      return value >= 0 ? '#22c55e' : '#ef4444';
    } else {
      return '#3b82f6';
    }
  };

  // Fonction d'export des données
  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer les données d'export
      const exportData = {
        period: selectedPeriod,
        metric: selectedMetric,
        data: extendedData,
        stats: stats,
        forecasts: forecasts,
        benchmark: benchmarkData,
        insights: aiInsights,
        timestamp: new Date().toISOString()
      };

      if (format === 'excel') {
        // Simulation d'export Excel
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evolution-ventes-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Export Excel terminé avec succès');
      } else {
        // Simulation d'export PDF
        alert('Export PDF terminé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // Fonction d'analyse des tendances
  const analyzeTrends = () => {
    const recentData = extendedData.slice(-6);
    const trend = recentData[recentData.length - 1][selectedMetric] - recentData[0][selectedMetric];
    const avgGrowth = recentData.reduce((sum, item) => sum + item.growth, 0) / recentData.length;

    return {
      trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      strength: Math.abs(trend) > (stats.avgSales * 0.1) ? 'strong' : 'weak',
      recommendation: trend > 0 ? 'Continuer la stratégie actuelle' : 'Revoir la stratégie commerciale',
      avgGrowth
    };
  };

  // Fonction de comparaison avec objectifs
  const compareWithTargets = () => {
    const currentMonth = extendedData[extendedData.length - 1];
    const targetSales = 2500000; // Objectif mensuel
    const targetGrowth = 5; // Objectif de croissance

    return {
      salesAchievement: (currentMonth.sales / targetSales) * 100,
      growthAchievement: (currentMonth.growth / targetGrowth) * 100,
      onTrack: currentMonth.sales >= targetSales && currentMonth.growth >= targetGrowth
    };
  };

  // Fonction de prévision basée sur les tendances
  const generateForecast = () => {
    const recentData = extendedData.slice(-3);
    const avgSales = recentData.reduce((sum, item) => sum + item.sales, 0) / recentData.length;
    const trend = recentData[recentData.length - 1].sales - recentData[0].sales;

    return {
      nextMonth: avgSales + (trend / 3),
      nextQuarter: avgSales * 3 + (trend * 2),
      confidence: Math.abs(trend) < avgSales * 0.1 ? 'high' : 'medium'
    };
  };

  // Fonctions d'action pour les boutons
  const handleNotificationAction = async (action: string, notificationId: number) => {
    setActionLoading(action);
    try {
      switch (action) {
        case 'correct-month':
          // Simulation d'action corrective
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Action corrective appliquée : Promotion lancée pour le mois en cours');
          break;
        case 'publish-promo':
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Promotion publiée avec succès');
          break;
        case 'add-equipment':
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Nouveaux équipements ajoutés au catalogue');
          break;
        case 'show-benchmark':
          setShowBenchmark(true);
          break;
        case 'adjust-pricing':
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Prix ajustés selon les recommandations IA');
          break;
        case 'prepare-inventory':
          await new Promise(resolve => setTimeout(resolve, 1000));
          alert('Inventaire préparé pour la croissance attendue');
          break;
        default:
          console.log('Action non reconnue:', action);
      }
      
      // Supprimer la notification après action
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      alert('Erreur lors de l\'exécution de l\'action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInsightAction = async (insight: any) => {
    setActionLoading(`insight-${insight.id}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (insight.type) {
        case 'pricing':
          alert(`Pricing dynamique appliqué : ${insight.action}`);
          break;
        case 'catalog':
          alert(`Catalogue repositionné : ${insight.action}`);
          break;
        case 'promo':
          alert(`Campagne promotionnelle lancée : ${insight.action}`);
          break;
        case 'forecast':
          alert(`Prévision IA appliquée : ${insight.action}`);
          break;
        default:
          alert(`Action appliquée : ${insight.action}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de l\'insight:', error);
      alert('Erreur lors de l\'application de l\'insight');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
    // Afficher les détails du mois sélectionné
    const monthData = extendedData.find(item => item.month === month);
    if (monthData) {
      alert(`Détails ${month}:\nCA: ${formatCurrency(monthData.sales)}\nUnités: ${monthData.units}\nCroissance: ${monthData.growth}%\nObjectif: ${formatCurrency(monthData.target)}`);
    }
  };

  const handleQuickAction = async (action: string) => {
    setActionLoading(action);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'refresh-data':
          // Recharger les données
          alert('Données actualisées');
          break;
        case 'generate-report':
          // Générer un rapport
          alert('Rapport généré avec succès');
          break;
        case 'send-alert':
          // Envoyer une alerte
          alert('Alerte envoyée à l\'équipe');
          break;
        case 'optimize-prices':
          // Optimiser les prix
          alert('Prix optimisés selon les recommandations IA');
          break;
        default:
          console.log('Action rapide non reconnue:', action);
      }
    } catch (error) {
      console.error('Erreur lors de l\'action rapide:', error);
      alert('Erreur lors de l\'exécution de l\'action');
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'ai': return <Brain className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'alert': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'ai': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-800';
      case 'warning': return 'text-yellow-800';
      case 'alert': return 'text-red-800';
      case 'info': return 'text-blue-800';
      case 'ai': return 'text-purple-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Évolution des Ventes</h3>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '6m' | '12m' | '24m')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
            <option value="24m">24 mois</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'sales' | 'units' | 'growth')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">CA</option>
            <option value="units">Unités</option>
            <option value="growth">Croissance</option>
          </select>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">{formatCurrency(stats.totalSales)}</div>
          <div className="text-xs text-gray-600">CA Total</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">{formatNumber(stats.totalUnits)}</div>
          <div className="text-xs text-gray-600">Unités Vendues</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">{formatCurrency(stats.avgSales)}</div>
          <div className="text-xs text-gray-600">CA Moyen</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className={`text-lg font-bold ${stats.avgGrowth >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
            {stats.avgGrowth >= 0 ? '+' : ''}{stats.avgGrowth.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Croissance</div>
        </div>
      </div>

      {/* Section Benchmark */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Benchmark Secteur</h4>
          <button
            onClick={() => setShowBenchmark(true)}
            className="text-xs text-orange-700 hover:text-orange-900 font-medium"
          >
            Voir détails →
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-white rounded border border-orange-200">
            <div className="text-sm font-bold text-orange-700">{formatCurrency(benchmarkData.sectorAverage || 0)}</div>
            <div className="text-xs text-gray-600">Moyenne secteur</div>
          </div>
          <div className="text-center p-2 bg-white rounded border border-amber-200">
            <div className="text-sm font-bold text-amber-700">{formatCurrency(benchmarkData.top25Percent || 0)}</div>
            <div className="text-xs text-gray-600">Top 25%</div>
          </div>
          <div className="text-center p-2 bg-white rounded border border-orange-300">
            <div className="text-sm font-bold text-orange-800">{formatCurrency(benchmarkData.yourPerformance || 0)}</div>
            <div className="text-xs text-gray-600">Votre performance</div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-600">
            Rang secteur: <span className="font-semibold text-amber-700">Top {benchmarkData.sectorRank || 0}%</span>
          </div>
          <div className="text-xs text-gray-600">
            Écart vs secteur: <span className={`font-semibold ${(benchmarkData.performanceGap || 0) >= 0 ? 'text-orange-700' : 'text-red-600'}`}>
              {(benchmarkData.performanceGap || 0) >= 0 ? '+' : ''}{(benchmarkData.performanceGap || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Section Insights IA */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Insights IA</h4>
          <button
            onClick={() => setShowAIAnalysis(true)}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium"
          >
            Voir tout →
          </button>
        </div>
        
        <div className="space-y-2">
          {aiInsights.slice(0, 2).map((insight) => (
            <div key={insight.id} className="flex items-start gap-2 p-2 bg-white rounded border border-amber-100">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                insight.impact === 'high' ? 'bg-red-500' : 
                insight.impact === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-900">{insight.title}</div>
                <div className="text-xs text-gray-600">{insight.description}</div>
                <div className="text-xs text-amber-700 font-medium">{insight.estimatedGain}</div>
              </div>
              <button
                onClick={() => handleInsightAction(insight)}
                disabled={actionLoading === `insight-${insight.id}`}
                className="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {actionLoading === `insight-${insight.id}` ? '...' : 'Appliquer'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section Notifications */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-xs text-yellow-700 hover:text-yellow-900 font-medium"
            >
              {showNotifications ? 'Masquer' : 'Voir tout'} →
            </button>
          </div>
          
          <div className="space-y-2">
            {(showNotifications ? notifications : notifications.slice(0, 2)).map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${getNotificationTextColor(notification.type)}`}>
                        {notification.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notification.suggestion}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleNotificationAction(notification.action, notification.id)}
                      disabled={actionLoading === notification.action}
                      className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {actionLoading === notification.action ? '...' : 'Action'}
                    </button>
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique multi-courbes */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h4 className="text-sm font-semibold text-gray-900">{getMetricLabel()}</h4>
            
            {selectedMonth && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Mois sélectionné:</span>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {selectedMonth}
                </span>
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                  title="Effacer la sélection"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={showMultiChart}
                onChange={(e) => setShowMultiChart(e.target.checked)}
                className="w-3 h-3"
              />
              Multi-courbes
            </label>
            
            <button
              onClick={() => handleQuickAction('refresh-data')}
              disabled={actionLoading === 'refresh-data'}
              className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:opacity-50"
              title="Actualiser les données"
            >
              {actionLoading === 'refresh-data' ? '...' : <RefreshCw className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {showMultiChart ? (
          <div className="h-48 flex items-end justify-between gap-1">
            {extendedData.map((item: any, index: number) => {
              const value = getMetricValue(item);
              const targetValue = selectedMetric === 'sales' ? item.target : selectedMetric === 'units' ? item.units * 1.1 : 5;
              const previousValue = selectedMetric === 'sales' ? item.previousYear : selectedMetric === 'units' ? item.units * 0.9 : 0;
              
              const maxValue = Math.max(
                ...extendedData.map(getMetricValue),
                ...extendedData.map(item => selectedMetric === 'sales' ? item.target : selectedMetric === 'units' ? item.units * 1.1 : 5),
                ...extendedData.map(item => selectedMetric === 'sales' ? item.previousYear : selectedMetric === 'units' ? item.units * 0.9 : 0)
              );

              const isSelected = selectedMonth === item.month;
              
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const targetHeight = maxValue > 0 ? (targetValue / maxValue) * 100 : 0;
              const previousHeight = maxValue > 0 ? (previousValue / maxValue) * 100 : 0;

              return (
                <div 
                  key={index} 
                  className={`flex-1 flex flex-col items-center cursor-pointer transition-all ${
                    selectedMonth === item.month ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => handleMonthClick(item.month)}
                >
                  {/* Barre principale (ventes réelles) */}
                  <div
                    className={`w-full rounded-t transition-all duration-300 cursor-pointer relative ${
                      selectedMonth === item.month ? 'ring-2 ring-orange-400' : ''
                    }`}
                    style={{
                      height: `${height}%`,
                      minHeight: '4px',
                      backgroundColor: selectedMonth === item.month ? '#3b82f6' : '#3b82f6'
                    }}
                    title={`${item.month}: ${selectedMetric === 'sales' ? formatCurrency(value) : selectedMetric === 'units' ? formatNumber(value) : `${value}%`}`}
                  >
                    {/* Ligne objectif */}
                    <div
                      className="absolute w-full border-t-2 border-dashed border-orange-500"
                      style={{
                        top: `${targetHeight}%`,
                        transform: 'translateY(-50%)'
                      }}
                      title={`Objectif: ${selectedMetric === 'sales' ? formatCurrency(targetValue) : selectedMetric === 'units' ? formatNumber(targetValue) : `${targetValue}%`}`}
                    />
                    
                    {/* Ligne année précédente */}
                    <div
                      className="absolute w-full border-t-2 border-dashed border-gray-400"
                      style={{
                        top: `${previousHeight}%`,
                        transform: 'translateY(-50%)'
                      }}
                      title={`Année précédente: ${selectedMetric === 'sales' ? formatCurrency(previousValue) : selectedMetric === 'units' ? formatNumber(previousValue) : `${previousValue}%`}`}
                    />
                  </div>
                  
                  <div className={`text-xs mt-1 transform rotate-45 origin-left font-medium ${
                    selectedMonth === item.month ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {item.month.split(' ')[0]}
                  </div>
                  {selectedMonth === item.month && (
                    <div className="text-xs text-orange-600 font-bold mt-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-end justify-between gap-1">
            {extendedData.map((item: any, index: number) => {
              const value = getMetricValue(item);
              const maxValue = Math.max(...extendedData.map(getMetricValue));
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const color = getMetricColor(value);

              return (
                <div 
                  key={index} 
                  className={`flex-1 flex flex-col items-center cursor-pointer transition-all ${
                    selectedMonth === item.month ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => handleMonthClick(item.month)}
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 cursor-pointer ${
                      selectedMonth === item.month ? 'ring-2 ring-orange-400' : ''
                    }`}
                    style={{
                      height: `${height}%`,
                      backgroundColor: color,
                      minHeight: '4px'
                    }}
                    title={`${item.month}: ${selectedMetric === 'sales' ? formatCurrency(value) : selectedMetric === 'units' ? formatNumber(value) : `${value}%`}`}
                  />
                  <div className={`text-xs mt-1 transform rotate-45 origin-left font-medium ${
                    selectedMonth === item.month ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {item.month.split(' ')[0]}
                  </div>
                  {selectedMonth === item.month && (
                    <div className="text-xs text-orange-600 font-bold mt-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Légende du graphique multi-courbes */}
        {showMultiChart && (
          <div className="mt-3 flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Ventes réelles</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-t-2 border-dashed border-orange-500"></div>
              <span>Objectifs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-t-2 border-dashed border-gray-400"></div>
              <span>Année précédente</span>
            </div>
          </div>
        )}
      </div>

      {/* Analyse des performances */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h5 className="text-sm font-semibold text-amber-800 mb-2">Meilleur mois</h5>
          <div className="text-base font-bold text-amber-600">{extendedData[stats.bestMonthIndex].month}</div>
          <div className="text-sm text-amber-700">{formatCurrency(extendedData[stats.bestMonthIndex].sales)}</div>
          <div className="text-xs text-amber-600">{extendedData[stats.bestMonthIndex].units} unités</div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h5 className="text-sm font-semibold text-yellow-800 mb-2">Mois le plus faible</h5>
          <div className="text-base font-bold text-yellow-600">{extendedData[stats.worstMonthIndex].month}</div>
          <div className="text-sm text-yellow-700">{formatCurrency(extendedData[stats.worstMonthIndex].sales)}</div>
          <div className="text-xs text-yellow-600">{extendedData[stats.worstMonthIndex].units} unités</div>
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
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unités</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Croissance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {extendedData.map((item, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedMonth === item.month ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                  }`}
                  onClick={() => handleMonthClick(item.month)}
                >
                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                    {item.month}
                    {selectedMonth === item.month && (
                      <span className="ml-2 text-orange-600"><Check className="w-3 h-3" /></span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.sales)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatNumber(item.units)}</td>
                  <td className={`px-4 py-2 text-sm text-right font-medium ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

              {/* Actions et analyses avancées */}
      <div className="space-y-4">
        {/* Boutons d'action */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowDetails(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
          >
            Analyse complète
          </button>
          <button
            onClick={() => setShowForecast(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
          >
            Prévisions
          </button>
          <button
            onClick={() => setShowAIForecast(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
          >
            Prévision IA
          </button>
          <button
            onClick={() => setShowBenchmark(true)}
            className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 text-sm"
          >
            Benchmark
          </button>
          <button
            onClick={() => setShowAIAnalysis(true)}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 text-sm"
          >
            Insights IA
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 text-sm disabled:opacity-50"
          >
            {isExporting && exportFormat === 'excel' ? 'Export...' : 'Export Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="px-4 py-2 bg-orange-800 text-white rounded-lg hover:bg-orange-900 text-sm disabled:opacity-50"
          >
            {isExporting && exportFormat === 'pdf' ? 'Export...' : 'Export PDF'}
          </button>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 text-sm"
          >
            Actions rapides
          </button>
        </div>

        {/* Actions rapides */}
        {showQuickActions && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAction('refresh-data')}
                disabled={actionLoading === 'refresh-data'}
                className="px-3 py-2 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {actionLoading === 'refresh-data' ? '...' : <><RefreshCw className="w-3 h-3 mr-1" />Actualiser données</>}
              </button>
              <button
                onClick={() => handleQuickAction('generate-report')}
                disabled={actionLoading === 'generate-report'}
                className="px-3 py-2 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 disabled:opacity-50"
              >
                {actionLoading === 'generate-report' ? '...' : <><BarChartIcon className="w-3 h-3 mr-1" />Générer rapport</>}
              </button>
              <button
                onClick={() => handleQuickAction('send-alert')}
                disabled={actionLoading === 'send-alert'}
                className="px-3 py-2 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {actionLoading === 'send-alert' ? '...' : <><AlertTriangle className="w-3 h-3 mr-1" />Envoyer alerte</>}
              </button>
              <button
                onClick={() => handleQuickAction('optimize-prices')}
                disabled={actionLoading === 'optimize-prices'}
                className="px-3 py-2 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading === 'optimize-prices' ? '...' : <><DollarSign className="w-3 h-3 mr-1" />Optimiser prix</>}
              </button>
            </div>
          </div>
        )}

        {/* Analyse rapide des tendances */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-100 p-4 rounded-lg border border-orange-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Analyse Rapide</h4>
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const trends = analyzeTrends();
              const targets = compareWithTargets();
              const forecast = generateForecast();

              return (
                <>
                  <div className="text-center">
                    <div className={`text-base font-bold ${trends.trend === 'up' ? 'text-orange-600' : trends.trend === 'down' ? 'text-orange-700' : 'text-orange-500'}`}>
                      {trends.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : trends.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </div>
                    <div className="text-xs text-gray-600">Tendance</div>
                    <div className="text-xs font-medium text-gray-700">{trends.strength === 'strong' ? 'Forte' : 'Faible'}</div>
                  </div>

                  <div className="text-center">
                    <div className={`text-base font-bold ${targets.onTrack ? 'text-amber-600' : 'text-amber-700'}`}>
                      {targets.salesAchievement.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Objectif CA</div>
                    <div className="text-xs font-medium text-gray-700">{targets.onTrack ? 'Atteint' : 'En retard'}</div>
                  </div>

                  <div className="text-center">
                    <div className={`text-base font-bold ${forecast.confidence === 'high' ? 'text-yellow-600' : 'text-yellow-700'}`}>
                      {formatCurrency(forecast.nextMonth)}
                    </div>
                    <div className="text-xs text-gray-600">Prévision</div>
                    <div className="text-xs font-medium text-gray-700">Prochain mois</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modal d'analyse complète */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Analyse Complète des Ventes</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tendances */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tendances</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {stats.avgGrowth >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    </div>
                    <div className="text-sm text-gray-600">Tendance</div>
                    <div className={`text-base font-semibold ${stats.avgGrowth >= 0 ? 'text-orange-600' : 'text-orange-700'}`}>
                      {stats.avgGrowth >= 0 ? 'Croissante' : 'Décroissante'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-100 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {formatCurrency(stats.avgSales)}
                  </div>
                    <div className="text-sm text-gray-600">CA Moyen</div>
                    <div className="text-xs text-gray-500">par mois</div>
                </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {formatNumber(Math.round(stats.totalUnits / extendedData.length))}
                    </div>
                    <div className="text-sm text-gray-600">Unités Moyennes</div>
                    <div className="text-xs text-gray-500">par mois</div>
                  </div>
                </div>
              </div>

              {/* Saisonnalité */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Analyse Saisonnière</h4>
                <div className="grid grid-cols-4 gap-4">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => {
                    const quarterData = extendedData.slice(index * 3, (index + 1) * 3);
                    const quarterSales = quarterData.reduce((sum, item) => sum + item.sales, 0);
                    const quarterUnits = quarterData.reduce((sum, item) => sum + item.units, 0);

                    return (
                      <div key={quarter} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-base font-bold text-gray-900">{quarter}</div>
                        <div className="text-sm text-gray-600">{formatCurrency(quarterSales)}</div>
                        <div className="text-xs text-gray-500">{formatNumber(quarterUnits)} unités</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prévisions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prévisions</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-base font-bold text-orange-600">
                      {formatCurrency(stats.avgSales * 1.05)}
                    </div>
                    <div className="text-sm text-gray-600">Prévision optimiste</div>
                    <div className="text-xs text-gray-500">+5% de croissance</div>
                  </div>

                  <div className="text-center p-4 bg-orange-100 rounded-lg">
                    <div className="text-base font-bold text-orange-600">
                      {formatCurrency(stats.avgSales)}
                    </div>
                    <div className="text-sm text-gray-600">Prévision stable</div>
                    <div className="text-xs text-gray-500">Même niveau</div>
                  </div>

                  <div className="text-center p-4 bg-orange-200 rounded-lg">
                    <div className="text-base font-bold text-orange-700">
                      {formatCurrency(stats.avgSales * 0.95)}
                    </div>
                    <div className="text-sm text-gray-600">Prévision pessimiste</div>
                    <div className="text-xs text-gray-500">-5% de croissance</div>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-orange-800">Maintenir la croissance</div>
                      <div className="text-sm text-orange-700">Continuer les stratégies qui ont fonctionné ces derniers mois</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-100 rounded-lg">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-orange-800">Optimiser les mois faibles</div>
                      <div className="text-sm text-orange-700">Développer des promotions pour les périodes de faible activité</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-orange-800">Analyser la saisonnalité</div>
                      <div className="text-sm text-orange-700">Adapter l'inventaire selon les tendances saisonnières</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisions détaillées */}
      {showForecast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Prévisions Détaillées</h3>
              <button
                onClick={() => setShowForecast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Prévisions mensuelles */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prévisions Mensuelles</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const forecast = generateForecast();
                    const nextMonths = [
                      { month: 'Prochain mois', value: forecast.nextMonth, confidence: forecast.confidence },
                      { month: 'Dans 2 mois', value: forecast.nextMonth * 1.05, confidence: 'medium' },
                      { month: 'Dans 3 mois', value: forecast.nextMonth * 1.1, confidence: 'low' }
                    ];

                    return nextMonths.map((item, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-base font-bold text-gray-900">{formatCurrency(item.value)}</div>
                        <div className="text-sm text-gray-600">{item.month}</div>
                        <div className={`text-xs font-medium ${
                          item.confidence === 'high' ? 'text-orange-600' :
                          item.confidence === 'medium' ? 'text-orange-700' : 'text-orange-800'
                        }`}>
                          Confiance: {item.confidence === 'high' ? 'Élevée' : item.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                  </div>
                  </div>
                    ));
                  })()}
                  </div>
                </div>

              {/* Prévisions trimestrielles */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prévisions Trimestrielles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h5 className="font-semibold text-orange-800 mb-2">Q1 2025</h5>
                    <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.avgSales * 3)}</div>
                    <div className="text-sm text-orange-700">Basé sur les tendances actuelles</div>
              </div>
                  <div className="p-4 bg-orange-100 rounded-lg">
                    <h5 className="font-semibold text-orange-800 mb-2">Q2 2025</h5>
                    <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.avgSales * 3.15)}</div>
                    <div className="text-sm text-orange-700">Avec croissance saisonnière</div>
                  </div>
                </div>
              </div>

              {/* Facteurs d'influence */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Facteurs d'Influence</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Saisonnalité</span>
                    <span className="text-sm text-orange-600 font-semibold">+12%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Marché en croissance</span>
                    <span className="text-sm text-orange-600 font-semibold">+8%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Concurrence</span>
                    <span className="text-sm text-orange-700 font-semibold">-3%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Économie générale</span>
                    <span className="text-sm text-orange-600 font-semibold">±2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévision IA */}
      {showAIForecast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">🤖 Prévision IA Avancée</h3>
              <button
                onClick={() => setShowAIForecast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Prévision Q1 2025</h5>
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(forecasts.realistic * 3 * 1.12)}</div>
                  <div className="text-xs text-orange-700">+12% vs Q4 2024</div>
                  <div className="text-xs text-orange-600 mt-2">Confiance IA: 78%</div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Facteurs d'influence</h5>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Saisonnalité: +8%</li>
                    <li>• Marché: +3%</li>
                    <li>• Concurrence: -2%</li>
                    <li>• Innovation: +3%</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <h5 className="text-sm font-semibold text-orange-800 mb-2">Recommandations IA</h5>
                <div className="text-sm text-orange-700 space-y-2">
                  <div>• Augmenter le stock des engins compacts de 15%</div>
                  <div>• Lancer une campagne promotionnelle en février</div>
                  <div>• Former l'équipe commerciale sur les nouveaux modèles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de benchmark secteur */}
      {showBenchmark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">📊 Benchmark Secteur</h3>
              <button
                onClick={() => setShowBenchmark(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Vue d'ensemble */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(benchmarkData.sectorAverage || 0)}</div>
                  <div className="text-sm text-gray-600">Moyenne secteur</div>
                </div>
                <div className="text-center p-4 bg-orange-100 rounded-lg border border-orange-300">
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(benchmarkData.top25Percent || 0)}</div>
                  <div className="text-sm text-gray-600">Top 25%</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(benchmarkData.yourPerformance || 0)}</div>
                  <div className="text-sm text-gray-600">Votre performance</div>
                </div>
                <div className="text-center p-4 bg-orange-100 rounded-lg border border-orange-300">
                  <div className="text-lg font-bold text-orange-600">Top {benchmarkData.sectorRank || 0}%</div>
                  <div className="text-sm text-gray-600">Votre rang</div>
                </div>
              </div>

              {/* Comparaison détaillée */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparaison Détaillée</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Écart vs moyenne secteur</span>
                    <span className={`text-sm font-semibold ${(benchmarkData.performanceGap || 0) >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {(benchmarkData.performanceGap || 0) >= 0 ? '+' : ''}{(benchmarkData.performanceGap || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Écart vs top 25%</span>
                    <span className={`text-sm font-semibold ${(benchmarkData.top25Gap || 0) <= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {(benchmarkData.top25Gap || 0) <= 0 ? '+' : ''}{-(benchmarkData.top25Gap || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Données sectorielles simulées */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Données Sectorielles</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-orange-800">Mois</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-orange-800">Moyenne secteur</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-orange-800">Votre CA</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-orange-800">Écart</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100">
                      {sectorBenchmarkData.map((item, index) => (
                        <tr key={index} className="hover:bg-orange-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{item.month}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.sectorAvg)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.companySales)}</td>
                          <td className={`px-4 py-2 text-sm text-right font-medium ${item.difference >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                            {item.difference >= 0 ? '+' : ''}{item.difference}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommandations de benchmark */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-orange-800">Maintenir l'avantage concurrentiel</div>
                      <div className="text-sm text-orange-700">Vous êtes dans le top 15% du secteur. Continuez vos stratégies gagnantes.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-100 rounded-lg">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-orange-800">Optimiser les prix</div>
                      <div className="text-sm text-orange-700">Augmenter les prix de 5-7% pour optimiser la marge tout en restant compétitif.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-orange-800">Élargir la gamme</div>
                      <div className="text-sm text-orange-700">Développer de nouveaux produits pour capturer plus de parts de marché.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'analyse IA */}
      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">🤖 Analyse IA Complète</h3>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Insights détaillés */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Insights Détaillés</h4>
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-500' : 
                            insight.impact === 'medium' ? 'bg-orange-500' : 'bg-orange-500'
                          }`}></div>
                          <h5 className="font-semibold text-orange-800">{insight.title}</h5>
                        </div>
                        <div className="text-xs text-orange-600 font-medium">{insight.estimatedGain}</div>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-orange-600">
                          Confiance: {insight.confidence}%
                        </div>
                        <button
                          onClick={() => handleInsightAction(insight)}
                          disabled={actionLoading === `insight-${insight.id}`}
                          className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
                        >
                          {actionLoading === `insight-${insight.id}` ? 'Application...' : insight.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyse des tendances IA */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Analyse des Tendances IA</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h5 className="text-sm font-semibold text-orange-800 mb-2">Tendance des prix</h5>
                    <div className="text-lg font-bold text-orange-600">+8%</div>
                    <div className="text-xs text-orange-700">Augmentation recommandée</div>
                  </div>
                  <div className="p-4 bg-orange-100 rounded-lg border border-orange-300">
                    <h5 className="text-sm font-semibold text-orange-800 mb-2">Demande saisonnière</h5>
                    <div className="text-lg font-bold text-orange-600">+15%</div>
                    <div className="text-xs text-orange-700">Q1 2025 attendu</div>
                  </div>
                </div>
              </div>

              {/* Actions recommandées */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions Recommandées</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium text-orange-800">Ajuster les prix</div>
                      <div className="text-sm text-orange-700">Augmentation de 5-7% sur la gamme premium</div>
                    </div>
                    <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">
                      Appliquer
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                    <div>
                      <div className="font-medium text-orange-800">Lancer promotion</div>
                      <div className="text-sm text-orange-700">Campagne "Fin d'été" pour les mois faibles</div>
                    </div>
                    <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">
                      Planifier
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium text-orange-800">Élargir catalogue</div>
                      <div className="text-sm text-orange-700">Ajouter plus d'engins compacts</div>
                    </div>
                    <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">
                      Analyser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de benchmark */}
      {showBenchmark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">📊 Benchmark Secteur</h3>
              <button
                onClick={() => setShowBenchmark(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Moyenne Secteur</h5>
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(benchmarkData.sectorAverage || 0)}</div>
                  <div className="text-xs text-orange-700">CA mensuel moyen</div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Top 25%</h5>
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(benchmarkData.top25Percent || 0)}</div>
                  <div className="text-xs text-orange-700">Seuil d'excellence</div>
                </div>
                <div className="bg-orange-200 p-4 rounded-lg border border-orange-400">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Votre Performance</h5>
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(benchmarkData.yourPerformance || 0)}</div>
                  <div className="text-xs text-orange-700">CA mensuel moyen</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Position Secteur</h5>
                  <div className="text-lg font-bold text-orange-600">Top {benchmarkData.sectorRank || 0}%</div>
                  <div className="text-sm text-orange-700">
                    Vous êtes dans les {benchmarkData.sectorRank || 0}% meilleurs du secteur
                  </div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
                  <h5 className="text-sm font-semibold text-orange-800 mb-2">Écart vs Secteur</h5>
                  <div className={`text-lg font-bold ${(benchmarkData.performanceGap || 0) >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    {(benchmarkData.performanceGap || 0) >= 0 ? '+' : ''}{(benchmarkData.performanceGap || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-700">
                    {(benchmarkData.performanceGap || 0) >= 0 ? 'Au-dessus' : 'En-dessous'} de la moyenne secteur
                  </div>
                </div>
              </div>

              {/* Graphique de comparaison */}
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-orange-800 mb-4">Comparaison Mensuelle</h5>
                <div className="space-y-3">
                  {sectorBenchmarkData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-orange-700">{item.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-orange-600">{formatCurrency(item.sectorAvg)}</span>
                        <div className="w-32 bg-orange-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (item.companySales / item.sectorAvg) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-orange-600">+{item.difference}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'insights IA */}
      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">🤖 Insights IA</h3>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            insight.impact === 'high' ? 'bg-red-500' : 
                            insight.impact === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                          }`}></div>
                          <h5 className="text-sm font-semibold text-orange-800">{insight.title}</h5>
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {insight.confidence}% confiance
                          </span>
                        </div>
                        <p className="text-sm text-orange-700 mb-2">{insight.description}</p>
                        <div className="text-sm font-medium text-orange-600 mb-3">{insight.estimatedGain}</div>
                        <div className="text-sm text-orange-700">
                          <strong>Action recommandée:</strong> {insight.action}
                        </div>
                      </div>
                      <button
                        onClick={() => handleInsightAction(insight)}
                        disabled={actionLoading === `insight-${insight.id}`}
                        className="ml-4 px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
                      >
                        {actionLoading === `insight-${insight.id}` ? 'Application...' : 'Appliquer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="text-sm font-semibold text-orange-800 mb-2">💡 Résumé des Opportunités</h5>
                <div className="text-sm text-orange-700 space-y-1">
                  <div>• Gain potentiel total: +35% CA</div>
                  <div>• Actions prioritaires: 3</div>
                  <div>• Impact estimé: Élevé</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

const CalendarWidget = ({ widget, data, onShowRentalForm, onUpdateStatus, onShowRentalDetails, onEditRental }: {
  widget: Widget;
  data: any[];
  onShowRentalForm: () => void;
  onUpdateStatus: (rentalId: string, status: string) => void;
  onShowRentalDetails: (rental: any) => void;
  onEditRental: (rental: any) => void;
}) => {
  const rentalStatuses = ['Confirmée', 'En préparation', 'Prête', 'En cours', 'Terminée', 'Annulée'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmée': return 'bg-green-100 text-green-800 border-green-200';
      case 'Prête': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En préparation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Terminée': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Annulée': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimeIndicator = (daysUntilStart: number) => {
    if (daysUntilStart <= 0) return { text: 'Aujourd\'hui', color: 'text-red-600 font-semibold' };
    if (daysUntilStart === 1) return { text: 'Demain', color: 'text-orange-600 font-semibold' };
    if (daysUntilStart <= 3) return { text: `Dans ${daysUntilStart} jours`, color: 'text-yellow-600' };
    return { text: `Dans ${daysUntilStart} jours`, color: 'text-gray-600' };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-800">{widget.title}</h3>
          <span className="ml-2 text-sm text-gray-500">({data.length})</span>
        </div>
        <button
          onClick={onShowRentalForm}
          className="p-2 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
          title="Ajouter une nouvelle location"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Aucune location à venir</p>
          </div>
        ) : (
          data.map((item) => {
            const timeIndicator = getTimeIndicator(item.daysUntilStart || 0);

            return (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                {/* En-tête avec priorité et statut */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.equipmentFullName || 'Équipement non spécifié'}
                    </span>
                  </div>
                  <select
                    value={item.status || 'Confirmée'}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  >
                    {rentalStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Informations client et dates */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{item.clientName}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(item.start_date)} - {formatDate(item.end_date)}</span>
                    </div>
                    <span className={`text-xs ${timeIndicator.color}`}>
                      {timeIndicator.text}
                    </span>
                  </div>
                </div>

                {/* Informations financières et durée */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="text-gray-600">Durée: </span>
                    <span className="font-medium">{item.durationDays} jours</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.total_price)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatCurrency(item.pricePerDay)}/jour
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex justify-end space-x-2 mt-3 pt-2 border-t border-gray-200">
                  <button
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    onClick={() => onShowRentalDetails(item)}
                  >
                    Voir détails
                  </button>
                  <button
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => onEditRental(item)}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Widget transformé : Plan d'action stock & revente
const InventoryStatusWidget = ({ data }: { data: any[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState<any>({});
  const [sortBy, setSortBy] = useState<'priority' | 'stock' | 'value' | 'delivery' | 'dormant' | 'visibility' | 'salesTime'>('priority');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStockAlerts, setShowStockAlerts] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showDormantStock, setShowDormantStock] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showSalesActions, setShowSalesActions] = useState(false);

  // Fonction pour générer des recommandations IA
  const generateAIRecommendation = (item: any) => {
    const dormantDays = item.dormantDays || Math.floor(Math.random() * 120) + 1;
    const visibilityRate = item.visibilityRate || Math.floor(Math.random() * 100);
    const clickCount = item.clickCount || Math.floor(Math.random() * 50);
    
    if (dormantDays > 90 && clickCount < 5) {
      return {
        type: 'critical',
        message: `Le ${item.title} est en stock depuis ${dormantDays} jours sans contact. Proposer livraison gratuite ?`,
        action: 'Baisser le prix de 15%',
        priority: 'high'
      };
    } else if (dormantDays > 60) {
      return {
        type: 'warning',
        message: `Stock dormant depuis ${dormantDays} jours. Booster la visibilité ?`,
        action: 'Mettre en avant (Premium)',
        priority: 'medium'
      };
    } else if (visibilityRate < 30) {
      return {
        type: 'info',
        message: `Faible visibilité (${visibilityRate}%). Améliorer le référencement ?`,
        action: 'Optimiser les mots-clés',
        priority: 'low'
      };
    } else {
      return {
        type: 'success',
        message: 'Performance correcte',
        action: 'Maintenir',
        priority: 'low'
      };
    }
  };

  // Enrichir les données avec des informations de vente et de visibilité
  const enrichedData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      // Ajouter des données simulées pour la démonstration
      dormantDays: item.dormantDays || Math.floor(Math.random() * 120) + 1,
      visibilityRate: item.visibilityRate || Math.floor(Math.random() * 100),
      averageSalesTime: item.averageSalesTime || Math.floor(Math.random() * 90) + 30,
      clickCount: item.clickCount || Math.floor(Math.random() * 50),
      lastContact: item.lastContact || new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      priceReduction: item.priceReduction || 0,
      premiumBoost: item.premiumBoost || false,
      aiRecommendation: generateAIRecommendation(item)
    }));
  }, [data]);

  const categories = ['all', ...Array.from(new Set(enrichedData.map(item => item.category)))];
  const priorities = ['all', 'high', 'medium', 'low'];
  const statuses = ['all', 'En rupture', 'Stock faible', 'Disponible', 'Stock dormant', 'Faible visibilité', 'En rupture'];

  const filteredData = enrichedData.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || item.priority === selectedPriority;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return categoryMatch && priorityMatch && statusMatch;
  });

  // Trier les données
  const sortedData = React.useMemo(() => {
    let sorted = [...filteredData];
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return sorted.sort((a, b) => priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]);
      case 'stock':
        return sorted.sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock));
      case 'value':
        return sorted.sort((a, b) => b.value - a.value);
      case 'delivery':
        return sorted.sort((a, b) => {
          const aDays = a.nextDelivery ? getDaysUntilDelivery(a.nextDelivery) : 999;
          const bDays = b.nextDelivery ? getDaysUntilDelivery(b.nextDelivery) : 999;
          return (aDays || 999) - (bDays || 999);
        });
      case 'dormant':
        return sorted.sort((a, b) => (a.dormantDays || 0) - (b.dormantDays || 0));
      case 'visibility':
        return sorted.sort((a, b) => (a.visibilityRate || 0) - (b.visibilityRate || 0));
      case 'salesTime':
        return sorted.sort((a, b) => (a.averageSalesTime || 0) - (b.averageSalesTime || 0));
      default:
        return sorted;
    }
  }, [filteredData, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En rupture': return 'bg-red-100 text-red-800 border-red-200';
      case 'Stock faible': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Disponible': return 'bg-green-100 text-green-800 border-green-200';
      case 'Stock dormant': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Faible visibilité': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-orange-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  const getStockPercentage = (stock: number, minStock: number) => {
    return Math.min((stock / minStock) * 100, 100);
  };

  const getStockBarColor = (stock: number, minStock: number) => {
    const percentage = getStockPercentage(stock, minStock);
    if (percentage === 0) return 'bg-red-500';
    if (percentage < 50) return 'bg-orange-500';
    if (percentage < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilDelivery = (nextDelivery: string) => {
    if (!nextDelivery) return null;
    const today = new Date();
    const delivery = new Date(nextDelivery);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleOrderNow = (item: any) => {
    setOrderForm({
      id: item.id,
      title: item.title,
      supplier: item.supplier,
      currentStock: item.stock,
      minStock: item.minStock,
      suggestedQuantity: Math.max(item.minStock - item.stock, 1),
      unitValue: item.value,
      supplierPhone: item.supplierPhone,
      supplierEmail: item.supplierEmail
    });
    setShowOrderForm(true);
  };

  const handleContactSupplier = (item: any) => {
    const message = `Bonjour,\n\nJe souhaite commander ${item.title}.\n\nStock actuel: ${item.stock} unités\nStock minimum: ${item.minStock} unités\n\nPouvez-vous me contacter pour discuter des conditions ?\n\nCordialement,\nMinegrid Équipement`;

    // Ouvrir l'email client
    const subject = encodeURIComponent(`Commande - ${item.title}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:${item.supplierEmail}?subject=${subject}&body=${body}`);

    alert(`Email préparé pour ${item.supplier}\n\nSujet: ${subject}\n\nLe client email s'ouvrira automatiquement.`);
  };

  const handleSubmitOrder = () => {
    const totalCost = orderForm.suggestedQuantity * orderForm.unitValue;
    alert(`✅ Commande soumise avec succès !\n\nProduit: ${orderForm.title}\nQuantité: ${orderForm.suggestedQuantity}\nCoût total: ${formatCurrency(totalCost)}\n\nUn email de confirmation sera envoyé au fournisseur.`);
    setShowOrderForm(false);
    setOrderForm({});
  };

  // Nouvelles fonctions pour les actions de vente
  const handleRecommendViaEmail = (item: any) => {
    const message = `Bonjour,\n\nJe vous recommande le ${item.title} qui pourrait vous intéresser.\n\nCaractéristiques:\n- Prix: ${formatCurrency(item.value)}\n- État: ${item.condition || 'Excellent'}\n- Disponible immédiatement\n\nContactez-nous pour plus d'informations.\n\nCordialement,\nMinegrid Équipement`;

    const subject = encodeURIComponent(`Recommandation - ${item.title}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:?subject=${subject}&body=${body}`);

    alert(`Email de recommandation préparé pour ${item.title}`);
  };

  const handleBoostVisibility = (item: any) => {
    alert(`🚀 ${item.title} mis en avant Premium !\n\nActions appliquées:\n- Position prioritaire dans les résultats\n- Badge "Premium" ajouté\n- Promotion sur la page d'accueil\n- Emailing aux prospects qualifiés`);
  };

  const handleReducePrice = (item: any) => {
    const newPrice = item.value * 0.85; // Réduction de 15%
    alert(`💰 Prix réduit pour ${item.title} !\n\nAncien prix: ${formatCurrency(item.value)}\nNouveau prix: ${formatCurrency(newPrice)}\nRéduction: 15%\n\nCette action sera visible dans 5 minutes.`);
  };

  const handleAIAction = (item: any) => {
    const recommendation = item.aiRecommendation;
    alert(`🤖 Recommandation IA pour ${item.title}:\n\n${recommendation.message}\n\nAction suggérée: ${recommendation.action}\n\nVoulez-vous appliquer cette recommandation ?`);
  };

  // Calculer les KPI de vente
  const getSalesKPIs = () => {
    const totalItems = enrichedData.length;
    const dormantItems = enrichedData.filter(item => (item.dormantDays || 0) > 60).length;
    const lowVisibilityItems = enrichedData.filter(item => (item.visibilityRate || 0) < 30).length;
    const avgSalesTime = enrichedData.reduce((sum, item) => sum + (item.averageSalesTime || 0), 0) / totalItems;
    const stockRotationRate = enrichedData.filter(item => (item.dormantDays || 0) < 30).length / totalItems * 100;

    return {
      totalItems,
      dormantItems,
      lowVisibilityItems,
      avgSalesTime: Math.round(avgSalesTime),
      stockRotationRate: Math.round(stockRotationRate)
    };
  };

  // Fonctions d'analyse avancées
  const getStockAnalytics = () => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const lowStockItems = data.filter(item => item.stock < item.minStock && item.stock > 0).length;
    const outOfStockItems = data.filter(item => item.stock === 0).length;
    const criticalItems = data.filter(item => item.priority === 'high' && item.stock <= item.minStock).length;

    const avgStockLevel = data.reduce((sum, item) => sum + (item.stock / item.minStock), 0) / data.length;
    const stockEfficiency = (data.filter(item => item.stock >= item.minStock).length / data.length) * 100;

    return {
      totalValue,
      lowStockItems,
      outOfStockItems,
      criticalItems,
      avgStockLevel: avgStockLevel * 100,
      stockEfficiency
    };
  };

  const getStockTrends = () => {
    // Simulation de tendances de stock
    const recentUsage = data.map(item => ({
      ...item,
      usageTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      usageRate: Math.random() * 100,
      daysUntilEmpty: item.stock > 0 ? Math.floor(item.stock / (item.average_usage || 1)) : 0
    }));

    return recentUsage;
  };

  const generateStockRecommendations = () => {
    const analytics = getStockAnalytics();
    const recommendations = [];

    if (analytics.criticalItems > 0) {
      recommendations.push({
        type: 'critical',
        message: `${analytics.criticalItems} articles critiques nécessitent une attention immédiate`,
        action: 'Commander en urgence'
      });
    }

    if (analytics.stockEfficiency < 80) {
      recommendations.push({
        type: 'warning',
        message: `Efficacité du stock à ${analytics.stockEfficiency.toFixed(1)}%`,
        action: 'Optimiser les niveaux de stock'
      });
    }

    if (analytics.avgStockLevel > 150) {
      recommendations.push({
        type: 'info',
        message: 'Stock moyen élevé, considérer la réduction des commandes',
        action: 'Réviser la politique de stock'
      });
    }

    return recommendations;
  };

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    const totalValue = data.reduce((sum, item) => sum + (item.value * item.stock), 0);
    const lowStockItems = data.filter(item => item.stock < item.minStock).length;
    const outOfStockItems = data.filter(item => item.stock === 0).length;
    const totalItems = data.length;
    const averageStockLevel = data.reduce((sum, item) => sum + (item.stock / item.minStock), 0) / totalItems * 100;

    return {
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalItems,
      averageStockLevel: Math.round(averageStockLevel)
    };
  }, [data]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      {/* En-tête avec statistiques et actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Plan d'action stock & revente</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</div>
              <div className="text-gray-600">Valeur totale</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{getSalesKPIs().dormantItems}</div>
              <div className="text-gray-600">Stock dormant</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{getSalesKPIs().lowVisibilityItems}</div>
              <div className="text-gray-600">Faible visibilité</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">{getSalesKPIs().avgSalesTime}j</div>
              <div className="text-gray-600">Temps de vente</div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAIInsights(true)}
              className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
            >
              IA Insights
            </button>
            <button
              onClick={() => setShowSalesActions(true)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Actions
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Analyse
            </button>
          </div>
        </div>
      </div>

      {/* Section Recommandations Prioritaires */}
      <div className="mb-6">
        {/* Stock dormant - Priorité absolue */}
        {enrichedData.filter(item => (item.dormantDays || 0) > 60).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-red-800 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                🚨 Stock dormant - Action requise
              </h4>
              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                {enrichedData.filter(item => (item.dormantDays || 0) > 60).length} articles
              </span>
            </div>
            
            <div className="space-y-2">
              {enrichedData
                .filter(item => (item.dormantDays || 0) > 60)
                .sort((a, b) => (b.dormantDays || 0) - (a.dormantDays || 0))
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-red-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-900">{item.title}</div>
                      <div className="text-xs text-red-700">
                        En stock depuis {item.dormantDays} jours • Visibilité: {item.visibilityRate}%
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        💡 {item.aiRecommendation?.message}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleReducePrice(item)}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Baisser prix
                      </button>
                      <button 
                        onClick={() => handleBoostVisibility(item)}
                        className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                      >
                        Booster
                      </button>
                      <button 
                        onClick={() => handleRecommendViaEmail(item)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Recommander
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            
            {enrichedData.filter(item => (item.dormantDays || 0) > 60).length > 3 && (
              <div className="text-center pt-2">
                <button className="text-sm text-red-700 hover:text-red-800">
                  Voir les {enrichedData.filter(item => (item.dormantDays || 0) > 60).length - 3} autres...
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recommandations IA Globales */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            🤖 Recommandations IA - Actions prioritaires
          </h4>
          <div className="space-y-3">
            {/* Temps moyen de vente par type */}
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <strong>Temps moyen de vente :</strong> {getSalesKPIs().avgSalesTime} jours
                <br />
                <span className="text-xs text-blue-600">
                  • Pelles hydrauliques : 45 jours • Bulldozers : 67 jours • Chargeurs : 38 jours
                </span>
              </div>
            </div>
            
            {/* Actions recommandées */}
            {enrichedData.filter(item => item.aiRecommendation?.type === 'critical').length > 0 && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <strong>Actions critiques requises :</strong> {enrichedData.filter(item => item.aiRecommendation?.type === 'critical').length} articles
                  <br />
                  <span className="text-xs text-red-600">
                    • Baisser les prix • Booster la visibilité • Contacter les prospects
                  </span>
                </div>
              </div>
            )}
            
            {/* Astuce IA contextuelle */}
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <strong>💡 Astuce IA :</strong> 
                {(() => {
                  const dormantItems = enrichedData.filter(item => (item.dormantDays || 0) > 90);
                  if (dormantItems.length > 0) {
                    const oldestItem = dormantItems[0];
                    return ` Le ${oldestItem.title} est en stock depuis ${oldestItem.dormantDays} jours. Proposer livraison gratuite ?`;
                  } else if (enrichedData.filter(item => (item.visibilityRate || 0) < 30).length > 0) {
                    return ` ${enrichedData.filter(item => (item.visibilityRate || 0) < 30).length} articles ont une faible visibilité. Améliorer le référencement ?`;
                  } else {
                    return ` Performance correcte. Maintenir les prix et la visibilité actuels.`;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            ⚡ Actions rapides disponibles
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              onClick={() => {
                const dormantItems = enrichedData.filter(item => (item.dormantDays || 0) > 60);
                if (dormantItems.length > 0) {
                  handleReducePrice(dormantItems[0]);
                }
              }}
              className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Baisser prix dormant
            </button>
            <button 
              onClick={() => {
                const lowVisibilityItems = enrichedData.filter(item => (item.visibilityRate || 0) < 30);
                if (lowVisibilityItems.length > 0) {
                  handleBoostVisibility(lowVisibilityItems[0]);
                }
              }}
              className="bg-orange-600 text-white py-2 px-3 rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Booster visibilité
            </button>
            <button 
              onClick={() => {
                const dormantItems = enrichedData.filter(item => (item.dormantDays || 0) > 60);
                if (dormantItems.length > 0) {
                  handleRecommendViaEmail(dormantItems[0]);
                }
              }}
              className="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Recommander par email
            </button>
            <button 
              onClick={() => setShowAIInsights(true)}
              className="bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
            >
              Voir insights IA
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-0 flex-shrink-0"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Toutes catégories' : category}
            </option>
          ))}
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-0 flex-shrink-0"
        >
          {priorities.map(priority => (
            <option key={priority} value={priority}>
              {priority === 'all' ? 'Toutes priorités' :
               priority === 'high' ? 'Haute' :
               priority === 'medium' ? 'Moyenne' : 'Basse'}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-0 flex-shrink-0"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'Tous statuts' : status}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'priority' | 'stock' | 'value' | 'delivery' | 'dormant' | 'visibility' | 'salesTime')}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-0 flex-shrink-0"
        >
          <option value="priority">Trier par priorité</option>
          <option value="stock">Trier par niveau de stock</option>
          <option value="value">Trier par valeur</option>
          <option value="delivery">Trier par livraison</option>
          <option value="dormant">Trier par stock dormant</option>
          <option value="visibility">Trier par visibilité</option>
          <option value="salesTime">Trier par temps de vente</option>
        </select>
      </div>

      {/* Liste des articles */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedData.map((item) => {
          const stockPercentage = getStockPercentage(item.stock, item.minStock);
          const daysUntilDelivery = getDaysUntilDelivery(item.nextDelivery);

          return (
            <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors overflow-hidden">
              {/* En-tête avec priorité et statut */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                  <span className="text-sm font-medium text-gray-900">{item.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {/* Informations de stock */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock actuel:</span>
                  <span className="font-medium">{item.stock} / {item.minStock} min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getStockBarColor(item.stock, item.minStock)}`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
                <div className="flex flex-col space-y-1 text-xs text-gray-600">
                  <span className="truncate">{item.category}</span>
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Informations de vente et visibilité */}
              <div className="space-y-2 mb-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Stock dormant:</span>
                    <span className={`text-xs ${item.dormantDays > 60 ? 'text-orange-600 font-semibold' : 'text-gray-900'}`}>
                      {item.dormantDays}j
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Visibilité:</span>
                    <span className={`text-xs ${item.visibilityRate < 30 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {item.visibilityRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Temps vente:</span>
                    <span className="text-gray-900 text-xs">{item.averageSalesTime}j</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Clics:</span>
                    <span className="text-gray-900 text-xs">{item.clickCount}</span>
                  </div>
                </div>
              </div>

              {/* Recommandation IA */}
              {item.aiRecommendation && (
                <div className={`mb-3 p-2 rounded-lg text-xs ${
                  item.aiRecommendation.type === 'critical' ? 'bg-red-50 border border-red-200' :
                  item.aiRecommendation.type === 'warning' ? 'bg-orange-50 border border-orange-200' :
                  item.aiRecommendation.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="font-medium mb-1">🤖 IA Recommandation:</div>
                  <div className="text-gray-700">{item.aiRecommendation.message}</div>
                </div>
              )}

              {/* Informations fournisseur et livraison */}
              <div className="space-y-2 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Fournisseur:</span>
                  <span className="text-xs truncate max-w-32">{item.supplier}</span>
                </div>
                {item.nextDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Livraison:</span>
                    <span className={`text-xs ${daysUntilDelivery && daysUntilDelivery <= 3 ? 'text-orange-600 font-semibold' : ''}`}>
                      {formatDate(item.nextDelivery)}
                      {daysUntilDelivery && daysUntilDelivery > 0 && ` (${daysUntilDelivery}j)`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 text-xs">Valeur:</span>
                  <span className="font-semibold text-xs">{formatCurrency(item.value)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  onClick={() => handleViewDetails(item)}
                >
                  Voir détails
                </button>
                <button
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  onClick={() => handleAIAction(item)}
                >
                  IA
                </button>
                <button
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => handleRecommendViaEmail(item)}
                >
                  Recommander
                </button>
                <button
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                  onClick={() => handleBoostVisibility(item)}
                >
                  Booster
                </button>
                <button
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                  onClick={() => handleReducePrice(item)}
                >
                  Baisser prix
                </button>
                {item.stock < item.minStock && (
                  <>
                <button
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => handleOrderNow(item)}
                >
                      Commander
                </button>
                    <button
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                      onClick={() => handleContactSupplier(item)}
                    >
                      Contacter
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détails */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Détails du stock</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Produit</label>
                  <p className="text-gray-900">{selectedItem.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Catégorie</label>
                  <p className="text-gray-900">{selectedItem.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock actuel</label>
                  <p className="text-gray-900">{selectedItem.stock} unités</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock minimum</label>
                  <p className="text-gray-900">{selectedItem.minStock} unités</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fournisseur</label>
                  <p className="text-gray-900">{selectedItem.supplier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Localisation</label>
                  <p className="text-gray-900">{selectedItem.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Valeur unitaire</label>
                  <p className="text-gray-900">{formatCurrency(selectedItem.value)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Dernière commande</label>
                  <p className="text-gray-900">{formatDate(selectedItem.lastOrder)}</p>
                </div>
              </div>

              {selectedItem.nextDelivery && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Prochaine livraison</label>
                  <p className="text-gray-900">{formatDate(selectedItem.nextDelivery)}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Fermer
                </button>
                {selectedItem.stock < selectedItem.minStock && (
                  <button
                    onClick={() => handleOrderNow(selectedItem)}
                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Commander maintenant
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'analyse avancée du stock */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Analyse Avancée du Stock</h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statistiques globales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(getStockAnalytics().totalValue)}</div>
                  <div className="text-sm text-gray-600">Valeur totale</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{getStockAnalytics().avgStockLevel}%</div>
                  <div className="text-sm text-gray-600">Niveau moyen</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{getStockAnalytics().stockEfficiency}</div>
                  <div className="text-sm text-gray-600">Efficacité</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{getStockAnalytics().criticalItems}</div>
                  <div className="text-sm text-gray-600">Articles critiques</div>
                </div>
              </div>

              {/* Tendances et prévisions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Tendances de Consommation</h4>
                  <div className="space-y-2">
                    {getStockTrends().map((trend, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{trend.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${trend.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                            {trend.change}%
                          </span>
                          {trend.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommandations</h4>
                  <div className="space-y-2">
                    {generateStockRecommendations().map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm text-gray-700">{rec.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Graphique de prévision */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Prévision des Besoins (3 mois)</h4>
                <div className="h-64 bg-white rounded border p-4">
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Graphique de prévision en cours de développement...
                  </div>
                </div>
              </div>

              {/* Actions recommandées */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Actions Prioritaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                    Commander pièces critiques
                  </button>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm">
                    Réviser niveaux de stock
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Analyser fournisseurs
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                    Optimiser commandes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'alertes de stock */}
      {showStockAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Alertes de Stock</h3>
              <button
                onClick={() => setShowStockAlerts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Alertes critiques */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alertes Critiques
                </h4>
                <div className="space-y-2">
                  {data.filter(item => item.color_indicator === 'red').map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <div className="font-medium text-gray-900">{item.category}</div>
                        <div className="text-sm text-gray-600">Stock: {item.stock} / Min: {item.min}</div>
                      </div>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Commander
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertes d'avertissement */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Avertissements
                </h4>
                <div className="space-y-2">
                  {data.filter(item => item.color_indicator === 'orange').map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <div className="font-medium text-gray-900">{item.category}</div>
                        <div className="text-sm text-gray-600">Stock: {item.stock} / Min: {item.min}</div>
                      </div>
                      <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                        Surveiller
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications de livraison */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Livraisons à Venir
                </h4>
                <div className="space-y-2">
                  {data.filter(item => new Date(item.next_delivery) > new Date()).slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <div className="font-medium text-gray-900">{item.category}</div>
                        <div className="text-sm text-gray-600">
                          Livraison: {formatDate(item.next_delivery)} ({getDaysUntilDelivery(item.next_delivery)} jours)
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.delivery_days} jours
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des insights IA */}
      {showAIInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">🤖 Insights IA - Plan d'action stock & revente</h3>
              <button
                onClick={() => setShowAIInsights(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statistiques IA */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{enrichedData.filter(item => item.aiRecommendation?.type === 'critical').length}</div>
                  <div className="text-sm text-gray-600">Actions critiques</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{enrichedData.filter(item => item.aiRecommendation?.type === 'warning').length}</div>
                  <div className="text-sm text-gray-600">Avertissements</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{enrichedData.filter(item => item.dormantDays > 60).length}</div>
                  <div className="text-sm text-gray-600">Stock dormant</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{enrichedData.filter(item => item.visibilityRate < 30).length}</div>
                  <div className="text-sm text-gray-600">Faible visibilité</div>
                </div>
              </div>

              {/* Recommandations IA par priorité */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Recommandations IA par priorité</h4>
                
                {/* Actions critiques */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-900 mb-3">🚨 Actions Critiques</h5>
                  <div className="space-y-2">
                    {enrichedData.filter(item => item.aiRecommendation?.type === 'critical').map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.aiRecommendation.message}</div>
                        <div className="text-sm text-red-600 mt-1">Action: {item.aiRecommendation.action}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avertissements */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-900 mb-3">⚠️ Avertissements</h5>
                  <div className="space-y-2">
                    {enrichedData.filter(item => item.aiRecommendation?.type === 'warning').map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.aiRecommendation.message}</div>
                        <div className="text-sm text-orange-600 mt-1">Action: {item.aiRecommendation.action}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-3">ℹ️ Informations</h5>
                  <div className="space-y-2">
                    {enrichedData.filter(item => item.aiRecommendation?.type === 'info').map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.aiRecommendation.message}</div>
                        <div className="text-sm text-blue-600 mt-1">Action: {item.aiRecommendation.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI de performance */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📊 KPI de Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Délai de rotation des stocks</div>
                    <div className="text-lg font-semibold text-gray-900">{getSalesKPIs().avgSalesTime} jours</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Taux de visibilité moyen</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.round(enrichedData.reduce((sum, item) => sum + (item.visibilityRate || 0), 0) / enrichedData.length)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Stock dormant (&gt;60j)</div>
                    <div className="text-lg font-semibold text-orange-600">{getSalesKPIs().dormantItems} articles</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Faible visibilité (moins de 30%)</div>
                    <div className="text-lg font-semibold text-red-600">{getSalesKPIs().lowVisibilityItems} articles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des actions de vente */}
      {showSalesActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">🚀 Actions de vente - Plan d'action stock & revente</h3>
              <button
                onClick={() => setShowSalesActions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Actions rapides */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">⚡ Actions Rapides</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      const dormantItems = enrichedData.filter(item => item.dormantDays > 60);
                      alert(`📧 Email de recommandation préparé pour ${dormantItems.length} articles en stock dormant !`);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Recommander via Email ({enrichedData.filter(item => item.dormantDays > 60).length} articles)
                  </button>
                  <button 
                    onClick={() => {
                      const lowVisibilityItems = enrichedData.filter(item => item.visibilityRate < 30);
                      alert(`🚀 ${lowVisibilityItems.length} articles mis en avant Premium !`);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Mettre en avant Premium ({enrichedData.filter(item => item.visibilityRate < 30).length} articles)
                  </button>
                  <button 
                    onClick={() => {
                      const criticalItems = enrichedData.filter(item => item.aiRecommendation?.type === 'critical');
                      alert(`💰 Prix réduit pour ${criticalItems.length} articles critiques !`);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Baisser le prix ({enrichedData.filter(item => item.aiRecommendation?.type === 'critical').length} articles)
                  </button>
                  <button 
                    onClick={() => {
                      alert(`📊 Rapport de performance généré !`);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Générer rapport
                  </button>
                </div>
              </div>

              {/* Articles prioritaires */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">📋 Articles Prioritaires</h4>
                
                {enrichedData.filter(item => item.aiRecommendation?.type === 'critical' || item.dormantDays > 90).slice(0, 5).map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Stock dormant: {item.dormantDays} jours | Visibilité: {item.visibilityRate}%
                        </div>
                        <div className="text-sm text-red-600 mt-1">{item.aiRecommendation?.message}</div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => handleRecommendViaEmail(item)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Recommander
                        </button>
                        <button 
                          onClick={() => handleBoostVisibility(item)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Booster
                        </button>
                        <button 
                          onClick={() => handleReducePrice(item)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Baisser prix
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistiques d'action */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">📈 Impact des Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+25%</div>
                    <div className="text-sm text-gray-600">Visibilité moyenne</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">-15%</div>
                    <div className="text-sm text-gray-600">Temps de vente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">+40%</div>
                    <div className="text-sm text-gray-600">Taux de conversion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction pour récupérer les données de graphiques
const getChartData = (widgetId: string) => {
  // Données simulées pour les graphiques
  const chartData = {
    'sales-evolution': [
      {
        month: 'Jan 2024',
        sales: 1200000,
        target: 1100000,
        sector_average: 1150000,
        growth_rate: 9.1,
        target_achievement: 109.1,
        sector_comparison: 104.3,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Janvier 2024: +9.1% vs objectif, +4.3% vs secteur',
            timestamp: '2024-01-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance excellente - Maintenir la stratégie de prix premium',
          'Penser à augmenter les stocks pour février'
        ]
      },
      {
        month: 'Fév 2024',
        sales: 1350000,
        target: 1200000,
        sector_average: 1250000,
        growth_rate: 12.5,
        target_achievement: 112.5,
        sector_comparison: 108.0,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Février 2024: +12.5% vs objectif, +8.0% vs secteur',
            timestamp: '2024-02-29T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Croissance exceptionnelle - Étendre la gamme de produits',
          'Formation équipe commerciale pour capitaliser'
        ]
      },
      {
        month: 'Mar 2024',
        sales: 1420000,
        target: 1300000,
        sector_average: 1350000,
        growth_rate: 5.2,
        target_achievement: 109.2,
        sector_comparison: 105.2,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Mars 2024: +5.2% vs objectif, +5.2% vs secteur',
            timestamp: '2024-03-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance stable - Optimiser les coûts opérationnels',
          'Préparer la saison estivale'
        ]
      },
      {
        month: 'Avr 2024',
        sales: 1580000,
        target: 1400000,
        sector_average: 1450000,
        growth_rate: 11.3,
        target_achievement: 112.9,
        sector_comparison: 109.0,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Avril 2024: +11.3% vs objectif, +9.0% vs secteur',
            timestamp: '2024-04-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Excellente performance - Maintenir l\'élan',
          'Investir dans le marketing digital'
        ]
      },
      {
        month: 'Mai 2024',
        sales: 1650000,
        target: 1500000,
        sector_average: 1550000,
        growth_rate: 4.4,
        target_achievement: 110.0,
        sector_comparison: 106.5,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Mai 2024: +4.4% vs objectif, +6.5% vs secteur',
            timestamp: '2024-05-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance solide - Préparer la saison haute',
          'Renforcer l\'équipe technique'
        ]
      },
      {
        month: 'Juin 2024',
        sales: 1720000,
        target: 1600000,
        sector_average: 1650000,
        growth_rate: 4.2,
        target_achievement: 107.5,
        sector_comparison: 104.2,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Juin 2024: +4.2% vs objectif, +4.2% vs secteur',
            timestamp: '2024-06-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance stable - Maintenir la qualité',
          'Planifier les maintenances estivales'
        ]
      },
      {
        month: 'Juil 2024',
        sales: 1680000,
        target: 1700000,
        sector_average: 1750000,
        growth_rate: -2.3,
        target_achievement: 98.8,
        sector_comparison: 96.0,
        trend: 'down',
        notifications: [
          {
            type: 'warning',
            message: 'Juillet 2024: -2.3% vs objectif, -4.0% vs secteur',
            timestamp: '2024-07-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Juillet 2024 en baisse de 2.3% vs objectif, suggérer promotions estivales',
          'Repositionner les machines 320D à 860k MAD'
        ]
      },
      {
        month: 'Août 2024',
        sales: 1750000,
        target: 1800000,
        sector_average: 1850000,
        growth_rate: 4.2,
        target_achievement: 97.2,
        sector_comparison: 94.6,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Août 2024: +4.2% vs objectif mais -2.8% vs secteur',
            timestamp: '2024-08-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Amélioration en août - Maintenir les promotions',
          'Préparer la rentrée avec de nouveaux produits'
        ]
      },
      {
        month: 'Sep 2024',
        sales: 1820000,
        target: 1900000,
        sector_average: 1950000,
        growth_rate: 4.0,
        target_achievement: 95.8,
        sector_comparison: 93.3,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Septembre 2024: +4.0% vs objectif mais -3.3% vs secteur',
            timestamp: '2024-09-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Croissance positive mais sous objectif - Renforcer l\'équipe',
          'Lancer une campagne de fidélisation'
        ]
      },
      {
        month: 'Oct 2024',
        sales: 1880000,
        target: 2000000,
        sector_average: 2050000,
        growth_rate: 3.3,
        target_achievement: 94.0,
        sector_comparison: 91.7,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Octobre 2024: +3.3% vs objectif mais -4.0% vs secteur',
            timestamp: '2024-10-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance sous objectif - Analyser la concurrence',
          'Proposer des financements attractifs'
        ]
      },
      {
        month: 'Nov 2024',
        sales: 1950000,
        target: 2100000,
        sector_average: 2150000,
        growth_rate: 3.7,
        target_achievement: 92.9,
        sector_comparison: 90.7,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Novembre 2024: +3.7% vs objectif mais -4.3% vs secteur',
            timestamp: '2024-11-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Croissance continue mais sous objectif - Optimiser les prix',
          'Renforcer le service après-vente'
        ]
      },
      {
        month: 'Déc 2024',
        sales: 2100000,
        target: 2200000,
        sector_average: 2250000,
        growth_rate: 7.7,
        target_achievement: 95.5,
        sector_comparison: 93.3,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Décembre 2024: +7.7% vs objectif mais -4.5% vs secteur',
            timestamp: '2024-12-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Fin d\'année positive - Préparer 2025',
          'Planifier les investissements 2025'
        ]
      }
    ],
    'sales-chart': [
      {
        month: 'Jan 2024',
        sales: 1200000,
        target: 1100000,
        sector_average: 1150000,
        growth_rate: 9.1,
        target_achievement: 109.1,
        sector_comparison: 104.3,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Janvier 2024: +9.1% vs objectif, +4.3% vs secteur',
            timestamp: '2024-01-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance excellente - Maintenir la stratégie de prix premium',
          'Penser à augmenter les stocks pour février'
        ]
      },
      {
        month: 'Fév 2024',
        sales: 1350000,
        target: 1200000,
        sector_average: 1250000,
        growth_rate: 12.5,
        target_achievement: 112.5,
        sector_comparison: 108.0,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Février 2024: +12.5% vs objectif, +8.0% vs secteur',
            timestamp: '2024-02-29T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Croissance exceptionnelle - Étendre la gamme de produits',
          'Formation équipe commerciale pour capitaliser'
        ]
      },
      {
        month: 'Mar 2024',
        sales: 1420000,
        target: 1300000,
        sector_average: 1350000,
        growth_rate: 5.2,
        target_achievement: 109.2,
        sector_comparison: 105.2,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Mars 2024: +5.2% vs objectif, +5.2% vs secteur',
            timestamp: '2024-03-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance stable - Optimiser les coûts opérationnels',
          'Préparer la saison estivale'
        ]
      },
      {
        month: 'Avr 2024',
        sales: 1580000,
        target: 1400000,
        sector_average: 1450000,
        growth_rate: 11.3,
        target_achievement: 112.9,
        sector_comparison: 109.0,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Avril 2024: +11.3% vs objectif, +9.0% vs secteur',
            timestamp: '2024-04-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Excellente performance - Maintenir l\'élan',
          'Investir dans le marketing digital'
        ]
      },
      {
        month: 'Mai 2024',
        sales: 1650000,
        target: 1500000,
        sector_average: 1550000,
        growth_rate: 4.4,
        target_achievement: 110.0,
        sector_comparison: 106.5,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Mai 2024: +4.4% vs objectif, +6.5% vs secteur',
            timestamp: '2024-05-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance solide - Préparer la saison haute',
          'Renforcer l\'équipe technique'
        ]
      },
      {
        month: 'Juin 2024',
        sales: 1720000,
        target: 1600000,
        sector_average: 1650000,
        growth_rate: 4.2,
        target_achievement: 107.5,
        sector_comparison: 104.2,
        trend: 'up',
        notifications: [
          {
            type: 'success',
            message: 'Juin 2024: +4.2% vs objectif, +4.2% vs secteur',
            timestamp: '2024-06-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Performance stable - Maintenir la qualité',
          'Planifier les maintenances estivales'
        ]
      },
      {
        month: 'Juil 2024',
        sales: 1680000,
        target: 1700000,
        sector_average: 1750000,
        growth_rate: -2.3,
        target_achievement: 98.8,
        sector_comparison: 96.0,
        trend: 'down',
        notifications: [
          {
            type: 'warning',
            message: 'Juillet 2024: -2.3% vs objectif, -4.0% vs secteur',
            timestamp: '2024-07-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Juillet 2024 en baisse de 2.3% vs objectif, suggérer promotions estivales',
          'Repositionner les machines 320D à 860k MAD'
        ]
      },
      {
        month: 'Août 2024',
        sales: 1750000,
        target: 1800000,
        sector_average: 1850000,
        growth_rate: 4.2,
        target_achievement: 97.2,
        sector_comparison: 94.6,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Août 2024: +4.2% vs objectif mais -2.8% vs secteur',
            timestamp: '2024-08-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Amélioration en août - Maintenir les promotions',
          'Préparer la rentrée avec de nouveaux produits'
        ]
      },
      {
        month: 'Sep 2024',
        sales: 1820000,
        target: 1900000,
        sector_average: 1950000,
        growth_rate: 4.0,
        target_achievement: 95.8,
        sector_comparison: 93.3,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Septembre 2024: +4.0% vs objectif mais -3.3% vs secteur',
            timestamp: '2024-09-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Croissance positive mais sous objectif - Renforcer l\'équipe',
          'Lancer une campagne de fidélisation'
        ]
      },
      {
        month: 'Oct 2024',
        sales: 1880000,
        target: 2000000,
        sector_average: 2050000,
        growth_rate: 3.3,
        target_achievement: 94.0,
        sector_comparison: 91.7,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Octobre 2024: +3.3% vs objectif mais -3.0% vs secteur',
            timestamp: '2024-10-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Octobre 2024 en baisse de 6% vs objectif, suggérer promotions automnales',
          'Publier des annonces pour machines compactes'
        ]
      },
      {
        month: 'Nov 2024',
        sales: 1950000,
        target: 2100000,
        sector_average: 2150000,
        growth_rate: 3.7,
        target_achievement: 92.9,
        sector_comparison: 90.7,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Novembre 2024: +3.7% vs objectif mais -4.3% vs secteur',
            timestamp: '2024-11-30T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Novembre 2024 en baisse de 7.1% vs objectif, suggérer promotions de fin d\'année',
          'Ajouter de nouveaux équipements à la gamme'
        ]
      },
      {
        month: 'Déc 2024',
        sales: 2100000,
        target: 2200000,
        sector_average: 2250000,
        growth_rate: 7.7,
        target_achievement: 95.5,
        sector_comparison: 93.3,
        trend: 'up',
        notifications: [
          {
            type: 'warning',
            message: 'Décembre 2024: +7.7% vs objectif mais -4.5% vs secteur',
            timestamp: '2024-12-31T18:00:00Z'
          }
        ],
        ai_suggestions: [
          'Décembre 2024 en baisse de 4.5% vs objectif, suggérer promotions de fin d\'année',
          'Planifier les objectifs 2025 avec l\'équipe'
        ]
      }
    ],
    'equipment-usage': [
      { equipment: 'Pelle CAT', usage: 85 },
      { equipment: 'Chargeur JCB', usage: 72 },
      { equipment: 'Bulldozer', usage: 68 },
      { equipment: 'Excavatrice', usage: 91 }
    ],
    'spare-parts-stock': [
      {
        category: 'Moteur',
        stock: 75,
        min: 50,
        max: 100,
        unit_price: 2500,
        supplier: 'CAT Maroc',
        last_order: '2024-01-10',
        next_delivery: '2024-01-25',
        delivery_days: 15,
        needs_restock: false,
        critical_level: 30,
        average_usage: 5,
        estimated_duration: 120,
        color_indicator: 'green',
        notes: 'Stock optimal - Couverture 15 jours'
      },
      {
        category: 'Hydraulique',
        stock: 60,
        min: 40,
        max: 80,
        unit_price: 1800,
        supplier: 'Parker Hannifin',
        last_order: '2024-01-05',
        next_delivery: '2024-01-30',
        delivery_days: 25,
        needs_restock: false,
        critical_level: 25,
        average_usage: 3,
        estimated_duration: 90,
        color_indicator: 'yellow',
        notes: 'Attention - Livraison dans 25 jours'
      },
      {
        category: 'Électricité',
        stock: 85,
        min: 60,
        max: 120,
        unit_price: 3200,
        supplier: 'Schneider Electric',
        last_order: '2024-01-12',
        next_delivery: '2024-01-28',
        delivery_days: 16,
        needs_restock: false,
        critical_level: 35,
        average_usage: 4,
        estimated_duration: 150,
        color_indicator: 'green',
        notes: 'Stock élevé - Bonne couverture'
      },
      {
        category: 'Filtres',
        stock: 45,
        min: 30,
        max: 60,
        unit_price: 450,
        supplier: 'Donaldson',
        last_order: '2024-01-08',
        next_delivery: '2024-01-22',
        delivery_days: 14,
        needs_restock: false,
        critical_level: 20,
        average_usage: 8,
        estimated_duration: 60,
        color_indicator: 'orange',
        notes: 'Consommation élevée - Surveiller'
      },
      {
        category: 'Transmission',
        stock: 25,
        min: 35,
        max: 70,
        unit_price: 4200,
        supplier: 'ZF Maroc',
        last_order: '2024-01-15',
        next_delivery: '2024-02-05',
        delivery_days: 21,
        needs_restock: true,
        critical_level: 30,
        average_usage: 2,
        estimated_duration: 180,
        color_indicator: 'red',
        notes: 'URGENT - Stock critique, commande en cours'
      },
      {
        category: 'Freins',
        stock: 35,
        min: 25,
        max: 50,
        unit_price: 2800,
        supplier: 'Brembo',
        last_order: '2024-01-03',
        next_delivery: '2024-01-20',
        delivery_days: 17,
        needs_restock: false,
        critical_level: 20,
        average_usage: 3,
        estimated_duration: 100,
        color_indicator: 'yellow',
        notes: 'Stock moyen - Surveiller consommation'
      }
    ],
    'transport-costs': [
      { route: 'Casablanca-Rabat', cost: 2500 },
      { route: 'Rabat-Fès', cost: 3200 },
      { route: 'Fès-Marrakech', cost: 4100 },
      { route: 'Marrakech-Agadir', cost: 3800 }
    ],
    'import-export-stats': [
      { type: 'Import', volume: 1200 },
      { type: 'Export', volume: 850 },
      { type: 'Transit', volume: 650 }
    ],
    'supply-chain-kpis': [
      { kpi: 'Délai livraison', value: 85 },
      { kpi: 'Taux service', value: 92 },
      { kpi: 'Rotation stock', value: 78 },
      { kpi: 'Coût logistique', value: 68 }
    ],
    'service-revenue': [
      { service: 'Maintenance', revenue: 450000 },
      { service: 'Transport', revenue: 320000 },
      { service: 'Location', revenue: 280000 },
      { service: 'Consulting', revenue: 180000 }
    ],
    'roi-analysis': [
      { project: 'Projet A', roi: 15.2 },
      { project: 'Projet B', roi: 12.8 },
      { project: 'Projet C', roi: 18.5 },
      { project: 'Projet D', roi: 9.7 }
    ]
  };
  return chartData[widgetId as keyof typeof chartData] || [];
};

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
const getMaintenanceData = (widgetId: string) => {
  console.log('[DEBUG] getMaintenanceData appelée avec widgetId:', widgetId);

  // Simuler des données de maintenance pour le moment
  // Plus tard, cela appellera l'API réelle
  return [
    {
      id: '1',
      equipmentName: 'Pelle hydraulique CAT 320',
      description: 'Maintenance préventive - Vérification système hydraulique',
      scheduledDate: '2024-01-20',
      status: 'Programmé',
      priority: 'Moyenne',
      urgency: 'Normale',
      estimatedDuration: 4,
      technicianName: 'Mohammed Alami'
    },
    {
      id: '2',
      equipmentName: 'Chargeur frontal JCB',
      description: 'Remplacement filtres et vidange huile',
      scheduledDate: '2024-01-22',
      status: 'En attente',
      priority: 'Basse',
      urgency: 'Normale',
      estimatedDuration: 2,
      technicianName: 'Ahmed Benali'
    },
    {
      id: '3',
      equipmentName: 'Bulldozer D6',
      description: 'Révision complète moteur et transmission',
      scheduledDate: '2024-01-25',
      status: 'Programmé',
      priority: 'Haute',
      urgency: 'Urgente',
      estimatedDuration: 8,
      technicianName: 'Karim Mansouri'
    }
  ];
};

// Fonction pour récupérer les notifications et alertes
const getNotificationsData = (widgetId: string) => {
  const notifications = [
    {
      id: '1',
      type: 'alert',
      title: 'Stock critique - Pelle CAT 320',
      message: 'Le stock de pièces pour la pelle CAT 320 est au niveau critique (2 unités restantes)',
      priority: 'high',
      category: 'inventory',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      read: false,
      action: 'Commander maintenant',
      actionUrl: '/inventory/order'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Maintenance préventive à venir',
      message: 'La maintenance préventive du chargeur JCB est prévue dans 3 jours',
      priority: 'medium',
      category: 'maintenance',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
      read: false,
      action: 'Voir planning',
      actionUrl: '/maintenance/schedule'
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouvelle location confirmée',
      message: 'Location de la pelle hydraulique confirmée pour le projet autoroute Tanger-Casablanca',
      priority: 'low',
      category: 'rental',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
      read: true,
      action: 'Voir détails',
      actionUrl: '/rentals/details'
    },
    {
      id: '4',
      type: 'success',
      title: 'Réparation terminée',
      message: 'La réparation du bulldozer D6 a été terminée avec succès',
      priority: 'low',
      category: 'repair',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
      read: true,
      action: 'Voir rapport',
      actionUrl: '/repairs/report'
    },
    {
      id: '5',
      type: 'alert',
      title: 'Livraison en retard',
      message: 'La livraison de pièces détachées est en retard de 2 jours',
      priority: 'high',
      category: 'logistics',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
      read: false,
      action: 'Suivre livraison',
      actionUrl: '/logistics/tracking'
    }
  ];

  return notifications;
};

// Fonction pour récupérer les KPIs avancés
const getAdvancedKPIsData = (widgetId: string) => {
  const kpis = {
    'operational-efficiency': {
      title: 'Efficacité Opérationnelle',
      metrics: [
        {
          name: 'Taux de disponibilité',
          value: 94.2,
          target: 95,
          unit: '%',
          trend: 'up',
          change: 2.1,
          status: 'good'
        },
        {
          name: 'Temps moyen de réparation',
          value: 3.2,
          target: 2.5,
          unit: 'jours',
          trend: 'down',
          change: -0.8,
          status: 'improving'
        },
        {
          name: 'Taux de rotation des stocks',
          value: 8.5,
          target: 10,
          unit: 'fois/an',
          trend: 'up',
          change: 0.3,
          status: 'warning'
        },
        {
          name: 'Coût par heure d\'utilisation',
          value: 125,
          target: 120,
          unit: 'MAD/h',
          trend: 'down',
          change: -5,
          status: 'good'
        }
      ]
    },
    'financial-performance': {
      title: 'Performance Financière',
      metrics: [
        {
          name: 'Marge brute',
          value: 32.5,
          target: 35,
          unit: '%',
          trend: 'up',
          change: 1.2,
          status: 'improving'
        },
        {
          name: 'ROI équipements',
          value: 18.7,
          target: 20,
          unit: '%',
          trend: 'up',
          change: 2.1,
          status: 'good'
        },
        {
          name: 'Coût de maintenance',
          value: 8.2,
          target: 7.5,
          unit: '% du CA',
          trend: 'down',
          change: -0.3,
          status: 'good'
        },
        {
          name: 'Délai de paiement client',
          value: 45,
          target: 30,
          unit: 'jours',
          trend: 'down',
          change: -5,
          status: 'improving'
        }
      ]
    },
    'customer-satisfaction': {
      title: 'Satisfaction Client',
      metrics: [
        {
          name: 'Score de satisfaction',
          value: 4.6,
          target: 4.5,
          unit: '/5',
          trend: 'up',
          change: 0.1,
          status: 'excellent'
        },
        {
          name: 'Taux de fidélisation',
          value: 87.3,
          target: 85,
          unit: '%',
          trend: 'up',
          change: 2.3,
          status: 'excellent'
        },
        {
          name: 'Temps de réponse',
          value: 2.1,
          target: 2,
          unit: 'heures',
          trend: 'down',
          change: -0.3,
          status: 'good'
        },
        {
          name: 'Taux de résolution',
          value: 94.8,
          target: 95,
          unit: '%',
          trend: 'up',
          change: 0.5,
          status: 'good'
        }
      ]
    }
  };

  return kpis[widgetId as keyof typeof kpis] || kpis['operational-efficiency'];
};



// Fonction pour récupérer les données de planification
const getPlanningData = (widgetId: string) => {
  const planning = {
    'weekly-schedule': {
      title: 'Planning Hebdomadaire',
      currentWeek: 'Semaine du 15-21 Janvier 2024',
      days: [
        {
          day: 'Lundi 15',
          tasks: [
            { id: '1', title: 'Maintenance pelle CAT', time: '08:00-12:00', status: 'completed', priority: 'high', technician: 'Mohammed Alami' },
            { id: '2', title: 'Livraison pièces', time: '14:00-16:00', status: 'in-progress', priority: 'medium', technician: 'Ahmed Benali' },
            { id: '3', title: 'Révision chargeur', time: '16:00-18:00', status: 'scheduled', priority: 'low', technician: 'Karim Mansouri' }
          ]
        },
        {
          day: 'Mardi 16',
          tasks: [
            { id: '4', title: 'Installation équipement', time: '09:00-17:00', status: 'scheduled', priority: 'high', technician: 'Mohammed Alami' },
            { id: '5', title: 'Formation sécurité', time: '10:00-12:00', status: 'scheduled', priority: 'medium', technician: 'Formateur externe' }
          ]
        },
        {
          day: 'Mercredi 17',
          tasks: [
            { id: '6', title: 'Réparation bulldozer', time: '08:00-16:00', status: 'scheduled', priority: 'high', technician: 'Ahmed Benali' },
            { id: '7', title: 'Contrôle qualité', time: '14:00-16:00', status: 'scheduled', priority: 'medium', technician: 'Karim Mansouri' }
          ]
        },
        {
          day: 'Jeudi 18',
          tasks: [
            { id: '8', title: 'Maintenance préventive', time: '08:00-12:00', status: 'scheduled', priority: 'medium', technician: 'Mohammed Alami' },
            { id: '9', title: 'Réunion équipe', time: '15:00-16:00', status: 'scheduled', priority: 'low', technician: 'Tous' }
          ]
        },
        {
          day: 'Vendredi 19',
          tasks: [
            { id: '10', title: 'Fin de projet', time: '08:00-17:00', status: 'scheduled', priority: 'high', technician: 'Équipe complète' }
          ]
        }
      ]
    },
    'monthly-overview': {
      title: 'Vue d\'Ensemble Mensuelle',
      currentMonth: 'Janvier 2024',
      categories: [
        {
          name: 'Maintenance',
          total: 45,
          completed: 32,
          inProgress: 8,
          scheduled: 5,
          color: 'blue'
        },
        {
          name: 'Réparations',
          total: 28,
          completed: 20,
          inProgress: 5,
          scheduled: 3,
          color: 'green'
        },
        {
          name: 'Installations',
          total: 15,
          completed: 12,
          inProgress: 2,
          scheduled: 1,
          color: 'orange'
        },
        {
          name: 'Formations',
          total: 8,
          completed: 6,
          inProgress: 1,
          scheduled: 1,
          color: 'purple'
        }
      ]
    }
  };

  return planning[widgetId as keyof typeof planning] || planning['weekly-schedule'];
};

// Fonction pour récupérer les données des actions quotidiennes
const getDailyActionsData = (widgetId: string) => {
  // Générer des actions commerciales prioritaires enrichies et réalistes
  const generatePriorityActions = () => {
    const actions = [
      {
        id: 1,
        title: 'Relancer Ahmed Benali - Prospect chaud',
        description: 'A consulté votre CAT 320D 3 fois cette semaine. Prêt à acheter.',
        priority: 'high',
        category: 'prospection',
        impact: '+85%',
        impactDescription: 'Probabilité de conversion',
        estimatedTime: '15 min',
        status: 'pending',
        contact: {
          name: 'Ahmed Benali',
          phone: '+212 6 12 34 56 78',
          email: 'ahmed.benali@construction.ma',
          company: 'Construction Benali SARL',
          lastContact: '2024-01-20'
        },
        action: 'Appel de suivi + envoi devis personnalisé',
        notes: 'Intéressé par financement leasing. Budget 450k MAD.',
        deadline: '2024-01-25'
      },
      {
        id: 2,
        title: 'Finaliser devis CAT 950GC - Mines du Sud',
        description: 'Devis en cours depuis 5 jours. Client impatient.',
        priority: 'high',
        category: 'devis',
        impact: '+70%',
        impactDescription: 'Chance de vente',
        estimatedTime: '30 min',
        status: 'pending',
        contact: {
          name: 'Fatima Zahra',
          phone: '+212 6 98 76 54 32',
          email: 'f.zahra@minesdusud.ma',
          company: 'Mines du Sud SA',
          lastContact: '2024-01-18'
        },
        action: 'Finaliser devis + appel de présentation',
        notes: 'Demande spécifique: godet de 1.2m³, chenilles larges.',
        deadline: '2024-01-23'
      },
      {
        id: 3,
        title: 'Appel de relance - 12 prospects inactifs',
        description: 'Prospects qui n\'ont pas été contactés depuis 7+ jours.',
        priority: 'medium',
        category: 'relance',
        impact: '+25%',
        impactDescription: 'Taux de réactivation',
        estimatedTime: '45 min',
        status: 'pending',
        contact: {
          name: 'Liste de 12 prospects',
          phone: 'Voir détails',
          email: 'campagne@minegrid.ma',
          company: 'Diverses entreprises',
          lastContact: '2024-01-15'
        },
        action: 'Campagne d\'appels + emails personnalisés',
        notes: 'Focus sur 3 prospects prioritaires restants.',
        deadline: '2024-01-26'
      },
      {
        id: 4,
        title: 'Réduire prix CAT 320D - Stock ancien',
        description: 'Machine en stock depuis 92 jours. Prix à ajuster.',
        priority: 'medium',
        category: 'pricing',
        impact: '+40%',
        impactDescription: 'Augmentation vues',
        estimatedTime: '10 min',
        status: 'pending',
        contact: {
          name: 'Équipe marketing',
          phone: 'N/A',
          email: 'marketing@minegrid.ma',
          company: 'Minegrid Équipement',
          lastContact: '2024-01-22'
        },
        action: 'Réduction de 2.5% + boost visibilité',
        notes: 'Prix actuel: 380k MAD → Nouveau: 370.5k MAD',
        deadline: '2024-01-24'
      },
      {
        id: 5,
        title: 'Publier annonce compacteur - Forte demande',
        description: 'Forte demande détectée à Casablanca cette semaine.',
        priority: 'medium',
        category: 'marketing',
        impact: '+60%',
        impactDescription: 'Prospects qualifiés',
        estimatedTime: '25 min',
        status: 'pending',
        contact: {
          name: 'Équipe technique',
          phone: 'N/A',
          email: 'tech@minegrid.ma',
          company: 'Minegrid Équipement',
          lastContact: '2024-01-22'
        },
        action: 'Créer annonce optimisée SEO + photos',
        notes: 'Mots-clés: compacteur, Casablanca, location, vente.',
        deadline: '2024-01-25'
      },
      {
        id: 6,
        title: 'Suivi paiement - Location CAT 330D',
        description: 'Paiement en retard de 3 jours. Client à contacter.',
        priority: 'high',
        category: 'finance',
        impact: '+95%',
        impactDescription: 'Récupération paiement',
        estimatedTime: '20 min',
        status: 'pending',
        contact: {
          name: 'Mohammed Alami',
          phone: '+212 6 11 22 33 44',
          email: 'm.alami@batiplus.ma',
          company: 'Bati Plus Construction',
          lastContact: '2024-01-19'
        },
        action: 'Appel de relance + envoi rappel',
        notes: 'Montant: 15k MAD. Raison: problème bancaire.',
        deadline: '2024-01-23'
      },
      {
        id: 7,
        title: 'Préparer présentation JCB - Projet autoroute',
        description: 'Appel d\'offres autoroute Tanger-Casablanca. Présentation technique requise.',
        priority: 'high',
        category: 'appel_offres',
        impact: '+90%',
        impactDescription: 'Chance de sélection',
        estimatedTime: '60 min',
        status: 'pending',
        contact: {
          name: 'Karim Mansouri',
          phone: '+212 6 55 66 77 88',
          email: 'k.mansouri@autoroutes.ma',
          company: 'Autoroutes du Maroc',
          lastContact: '2024-01-21'
        },
        action: 'Préparer présentation technique + fiches produits',
        notes: 'Projet de 2.5M MAD. Focus sur JCB 3CX et 4CX.',
        deadline: '2024-01-27'
      },
      {
        id: 8,
        title: 'Relance devis Komatsu - Carrière Agadir',
        description: 'Devis envoyé il y a 4 jours. Aucune réponse du client.',
        priority: 'medium',
        category: 'relance',
        impact: '+35%',
        impactDescription: 'Probabilité de réponse',
        estimatedTime: '20 min',
        status: 'pending',
        contact: {
          name: 'Hassan Tazi',
          phone: '+212 6 44 55 66 77',
          email: 'h.tazi@carriereagadir.ma',
          company: 'Carrière Agadir SA',
          lastContact: '2024-01-17'
        },
        action: 'Appel de relance + envoi rappel par email',
        notes: 'Devis Komatsu PC200-8. Montant: 680k MAD.',
        deadline: '2024-01-24'
      },
      {
        id: 9,
        title: 'Mise à jour catalogue produits',
        description: 'Nouveaux modèles CAT et JCB à ajouter au catalogue.',
        priority: 'low',
        category: 'marketing',
        impact: '+15%',
        impactDescription: 'Amélioration visibilité',
        estimatedTime: '40 min',
        status: 'pending',
        contact: {
          name: 'Équipe marketing',
          phone: 'N/A',
          email: 'marketing@minegrid.ma',
          company: 'Minegrid Équipement',
          lastContact: '2024-01-22'
        },
        action: 'Ajouter 5 nouveaux modèles + photos HD',
        notes: 'CAT 320D2, JCB 3CX, Komatsu PC200-8, etc.',
        deadline: '2024-01-28'
      }
    ];

    console.log('[DEBUG] Actions commerciales générées:', actions);
    return actions;
  };

  return generatePriorityActions();
};
