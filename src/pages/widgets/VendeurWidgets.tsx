import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar, 
  Target, 
  Users, 
  AlertTriangle, 
  BarChart3,
  Zap,
  Star,
  TrendingDown,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Share2,
  Download,
  Eye,
  Heart,
  ShoppingCart,
  Truck,
  Wrench,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Info,
  FileText
} from 'lucide-react';

// Types pour les widgets enrichis
interface WidgetFeature {
  periodSelector: boolean;
  export: boolean;
  analytics: boolean;
  alerts: boolean;
  aiRecommendations?: boolean;
  benchmarking?: boolean;
  sectorComparison?: boolean;
  autoNotifications?: boolean;
  quickActions?: boolean;
  stockAnalytics?: boolean;
  recommendations?: boolean;
  autoReminders?: boolean;
  probabilityScoring?: boolean;
  smartActions?: boolean;
  aiGenerated?: boolean;
  dynamicContent?: boolean;
  stickyDisplay?: boolean;
  forecasting?: boolean;
  trendAnalysis?: boolean;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: any;
  dataSource: string;
  features: WidgetFeature;
  priority?: number;
  category?: string;
}

interface VendeurWidgetsConfig {
  metier: string;
  description: string;
  widgets: Widget[];
}

// Widgets pour le métier Vendeur avec toutes les améliorations demandées
export const VendeurWidgets: VendeurWidgetsConfig = {
  metier: 'Vendeur',
  description: 'Vente d\'équipements et matériels avec IA et recommandations avancées',
  widgets: [
    {
      id: 'sales-metrics',
      type: 'performance',
      title: 'Score de Performance Commerciale',
      description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA',
      icon: Target,
      dataSource: 'sales-performance-score',
      priority: 1,
      category: 'performance',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        aiRecommendations: true,
        benchmarking: true,
      }
    },
    {
      id: 'sales-evolution',
      type: 'chart',
      title: 'Évolution des ventes enrichie',
      description: 'Courbe avec benchmarking secteur, notifications automatiques, actions rapides',
      icon: TrendingUp,
      dataSource: 'sales-evolution',
      priority: 2,
      category: 'analytics',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        sectorComparison: true,
        autoNotifications: true,
        quickActions: true,
      }
    },
    {
      id: 'stock-status',
      type: 'list',
      title: 'Plan d\'action stock & revente',
      description: 'Statut stock dormant, recommandations automatiques, actions rapides',
      icon: Package,
      dataSource: 'stock-status',
      priority: 3,
      category: 'inventory',
      features: {
        periodSelector: false,
        export: true,
        analytics: true,
        alerts: true,
        stockAnalytics: true,
        recommendations: true,
        quickActions: true,
      }
    },
    {
      id: 'sales-pipeline',
      type: 'list',
      title: 'Assistant Prospection Active',
      description: 'Alertes de relance, score de probabilité, actions intelligentes',
      icon: Users,
      dataSource: 'sales-pipeline',
      priority: 4,
      category: 'prospection',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true,
        autoReminders: true,
        probabilityScoring: true,
        smartActions: true,
      }
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions Commerciales Prioritaires',
      description: 'Liste des tâches urgentes du jour triées par impact/priorité',
      icon: AlertTriangle,
      dataSource: 'daily-actions',
      priority: 5,
      category: 'actions',
      features: {
        periodSelector: false,
        export: false,
        analytics: false,
        alerts: true,
        aiGenerated: true,
        dynamicContent: true,
        stickyDisplay: true,
      }
    },
    {
      id: 'monthly-sales',
      type: 'metric',
      title: 'Ventes du mois (Legacy)',
      description: 'Chiffre d\'affaires, nombre de ventes, export, etc.',
      icon: DollarSign,
      dataSource: 'monthly-sales',
      priority: 6,
      category: 'metrics',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false,
      }
    },
    {
      id: 'equipment-catalog',
      type: 'list',
      title: 'Catalogue équipements',
      description: 'Liste des équipements disponibles avec statut et prix',
      icon: Package,
      dataSource: 'equipment-catalog',
      priority: 7,
      category: 'catalog',
      features: {
        periodSelector: false,
        export: true,
        analytics: true,
        alerts: false,
      }
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      description: 'Planning des locations et réservations',
      icon: Calendar,
      dataSource: 'upcoming-rentals',
      priority: 8,
      category: 'rentals',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: true,
      }
    }
  ]
};

// Composants de widgets spécialisés pour vendeur d'engins
export const EquipmentCatalogWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('name');

  const categories = ['all', ...Array.from(new Set(data?.map(item => item.category) || []))];

  const filteredData = data?.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return b.price - a.price;
      case 'status': return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'En location': return 'bg-blue-100 text-blue-800';
      case 'En maintenance': return 'bg-orange-100 text-orange-800';
      case 'Vendu': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="h-5 w-5 mr-2 text-blue-600" />
          Catalogue équipements
        </h3>
        <div className="flex space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Toutes catégories' : cat}
              </option>
            ))}
          </select>
          <select
value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="name">Par nom</option>
            <option value="price">Par prix</option>
            <option value="status">Par statut</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {sortedData.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-gray-600" />
</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.category}</p>
</div>
</div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatPrice(item.price)}</div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
      </div>
</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CustomerLeadsWidget: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-green-600" />
        Prospects clients
</h3>
      <div className="space-y-3">
        {data?.map((lead) => (
          <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                <p className="text-sm text-gray-600">{lead.company}</p>
</div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{lead.status}</div>
                <div className="text-xs text-gray-500">{lead.lastContact}</div>
</div>
</div>
      </div>
        ))}
</div>
    </div>
  );
};

export const QuotesManagementWidget: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2 text-purple-600" />
          Gestion des devis
        </h3>
      <div className="space-y-3">
        {data?.map((quote) => (
          <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{quote.title}</h4>
                <p className="text-sm text-gray-600">{quote.customer}</p>
</div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{quote.amount}</div>
                <div className="text-xs text-gray-500">{quote.status}</div>
</div>
</div>
      </div>
        ))}
</div>
    </div>
  );
};

export const AfterSalesServiceWidget: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Wrench className="h-5 w-5 mr-2 text-orange-600" />
          Service après-vente
        </h3>
      <div className="space-y-3">
        {data?.map((service) => (
          <div key={service.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{service.title}</h4>
                <p className="text-sm text-gray-600">{service.customer}</p>
</div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{service.status}</div>
                <div className="text-xs text-gray-500">{service.date}</div>
</div>
</div>
      </div>
        ))}
</div>
    </div>
  );
};

export const MarketTrendsWidget: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Tendances du marché
        </h3>
      <div className="space-y-3">
        {data?.map((trend) => (
          <div key={trend.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{trend.title}</h4>
                <p className="text-sm text-gray-600">{trend.description}</p>
      </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{trend.impact}</div>
                <div className="text-xs text-gray-500">{trend.date}</div>
</div>
</div>
              </div>
        ))}
      </div>
</div>
  );
};

export const SalesAnalyticsWidget: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
        Analytics de vente
</h3>
      <div className="space-y-3">
        {data?.map((analytic) => (
          <div key={analytic.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{analytic.metric}</h4>
                <p className="text-sm text-gray-600">{analytic.description}</p>
</div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{analytic.value}</div>
                <div className="text-xs text-gray-500">{analytic.trend}</div>
              </div>
      </div>
</div>
        ))}
</div>
              </div>
  );
}; 