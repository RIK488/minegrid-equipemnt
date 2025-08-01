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

// Mapping des icônes pour la récupération depuis la configuration
export const iconMap: { [key: string]: any } = {
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
  BarChartIcon,
  TargetIcon,
  TrendingUpIcon
};

// Fonction pour obtenir une icône par nom
export const getIcon = (iconName: string) => {
  return iconMap[iconName] || Target;
};

// Fonction pour obtenir toutes les icônes disponibles
export const getAvailableIcons = () => {
  return Object.keys(iconMap);
}; 