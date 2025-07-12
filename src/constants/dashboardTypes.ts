// Types et interfaces pour le dashboard enterprise
export interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'calendar' | 'map' | 'equipment' | 'maintenance' | 'performance' | 'pipeline' | 'priority' | 'analytics' | 'daily-actions' | 'daily-priority' | 'inventory' | 'equipment-catalog' | 'customer-leads' | 'quotes-management' | 'after-sales-service' | 'market-trends' | 'sales-analytics';
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  dataSource: string;
  isCollapsed?: boolean;
  position?: number;
  size?: 'small' | 'normal' | 'large';
  advanced?: boolean;
  options?: any;
}

export interface WidgetLayout {
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

export interface DashboardConfig {
  widgets: Widget[];
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'list' | 'compact';
  refreshInterval: number;
  notifications: boolean;
}

export interface WidgetProps<T = any> {
  data: T;
  config: Widget;
  onUpdate?: (data: Partial<T>) => void;
  onDelete?: () => void;
  widgetSize?: 'small' | 'normal' | 'large';
}

export interface MetricData {
  value: number;
  label: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  currency?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ListItem {
  id: string | number;
  title: string;
  description?: string;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
  timestamp?: string;
  [key: string]: any;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'rental' | 'maintenance' | 'delivery' | 'meeting';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  [key: string]: any;
}

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'equipment' | 'delivery' | 'maintenance';
  status: string;
  [key: string]: any;
}

export interface PerformanceData {
  score: number;
  metrics: {
    sales: number;
    efficiency: number;
    customerSatisfaction: number;
    [key: string]: number;
  };
  trends: {
    period: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }[];
  recommendations: string[];
}

export interface DailyAction {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  impactDescription: string;
  estimatedTime: string;
  status: 'pending' | 'completed' | 'cancelled';
  contact?: {
    name: string;
    phone: string;
    email: string;
    company: string;
    lastContact?: string;
  };
  action: string;
  notes?: string;
  deadline?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'rented' | 'maintenance' | 'sold';
  location: string;
  lastUpdate: string;
  daysInStock: number;
  price: number;
  recommendations: string[];
  [key: string]: any;
}

export interface SalesData {
  period: string;
  revenue: number;
  units: number;
  growth: number;
  target: number;
  [key: string]: any;
}

export interface NotificationItem {
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

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  widgets: Widget[];
}

export type WidgetSize = 'small' | 'normal' | 'large';
export type WidgetType = Widget['type'];
export type Theme = 'light' | 'dark' | 'auto';
export type Layout = 'grid' | 'list' | 'compact'; 