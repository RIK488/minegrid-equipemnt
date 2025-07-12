// Types pour les widgets du dashboard
export interface Widget {
  id: string;
  title: string;
  description?: string;
  type: 'metric' | 'chart' | 'list' | 'inventory' | 'performance' | 'daily-actions';
  icon?: string | React.ComponentType<any>;
  dataSource?: string;
  size?: 'small' | 'medium' | 'large';
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: any;
}

// Types pour les données des widgets
export interface MetricData {
  revenue?: number;
  count?: number;
  value?: number;
  growth?: number;
  occupancy?: number;
  declarations?: number;
  active?: number;
  completed?: number;
  pending?: number;
  in_transit?: number;
  delivered?: number;
  approved?: number;
  available?: number;
  risk?: string;
}

export interface ChartData {
  name: string;
  value: number;
  CA?: number;
  Ventes?: number;
  Prévision?: number;
  [key: string]: any;
}

export interface ListItem {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  timestamp?: string;
  [key: string]: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  status: 'available' | 'rented' | 'maintenance' | 'sold';
  location: string;
  lastUpdate: string;
  nextMaintenance?: string;
  returnDate?: string;
}

export interface PerformanceData {
  score: number;
  metrics: {
    sales: number;
    efficiency: number;
    customerSatisfaction: number;
  };
  trends: Array<{
    period: string;
    change: number;
    direction: 'up' | 'down';
  }>;
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export interface DailyAction {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  impact: string;
  impactDescription: string;
  estimatedTime: string;
  status: 'pending' | 'completed' | 'cancelled';
  contact: {
    name: string;
    phone: string;
    email: string;
    company: string;
    lastContact: string;
  };
  action: string;
  notes: string;
  deadline: string;
}

// Types pour la configuration du dashboard
export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout?: any;
  theme?: 'light' | 'dark';
  currency?: string;
  language?: string;
}

// Types pour les métiers
export type BusinessType = 
  | 'vendeur'
  | 'loueur'
  | 'mecanicien'
  | 'transporteur'
  | 'transitaire'
  | 'financier';

// Types pour les données étendues des ventes
export interface ExtendedSalesData {
  current: {
    revenue: number;
    count: number;
    growth: number;
    averageTicket: number;
  };
  previous: {
    revenue: number;
    count: number;
    growth: number;
    averageTicket: number;
  };
  forecast: {
    revenue: number;
    count: number;
    growth: number;
    averageTicket: number;
  };
}

// Types pour les props des widgets
export interface WidgetProps {
  widget: Widget;
  data: any;
  widgetSize?: 'small' | 'medium' | 'large';
  onAction?: (action: string, data: any) => void;
}

// Types pour les événements du dashboard
export interface DashboardEvent {
  type: 'widget-click' | 'widget-resize' | 'widget-move' | 'data-update';
  widgetId: string;
  data?: any;
  timestamp: string;
}

// Types pour les filtres
export interface DashboardFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  businessType?: BusinessType;
  category?: string;
  status?: string;
  priority?: string;
}

// Types pour les notifications
export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
} 