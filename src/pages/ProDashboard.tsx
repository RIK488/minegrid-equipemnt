import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  FileText, 
  Wrench, 
  Activity, 
  Users, 
  Bell,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import {
  getProClientProfile,
  getClientEquipment,
  getClientOrders,
  getMaintenanceInterventions,
  getClientNotifications,
  getPortalStats,
  hasActiveProSubscription,
  addClientEquipment,
  createClientOrder,
  createMaintenanceIntervention,
  inviteClientUser,
  type ProClient,
  type ClientEquipment,
  type ClientOrder,
  type MaintenanceIntervention,
  type ClientNotification
} from '../utils/proApi';

interface PortalStats {
  totalEquipment: number;
  activeEquipment: number;
  pendingOrders: number;
  upcomingInterventions: number;
  unreadNotifications: number;
}

export default function ProDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [proProfile, setProProfile] = useState<ProClient | null>(null);
  const [equipment, setEquipment] = useState<ClientEquipment[]>([]);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [interventions, setInterventions] = useState<MaintenanceIntervention[]>([]);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'equipment' | 'order' | 'maintenance' | 'user' | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        profile,
        equipmentData,
        ordersData,
        interventionsData,
        notificationsData,
        statsData
      ] = await Promise.all([
        getProClientProfile(),
        getClientEquipment(),
        getClientOrders(),
        getMaintenanceInterventions(),
        getClientNotifications(),
        getPortalStats()
      ]);

      setProProfile(profile);
      setEquipment(equipmentData);
      setOrders(ordersData);
      setInterventions(interventionsData);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewButtonClick = () => {
    setShowNewMenu(!showNewMenu);
  };

  const handleNewItem = (type: 'equipment' | 'order' | 'maintenance' | 'user') => {
    setModalType(type);
    setShowModal(true);
    setShowNewMenu(false);
  };

  const getNewMenuItems = () => {
    const baseItems = [
      { type: 'equipment', label: 'Nouvel équipement', icon: Package },
      { type: 'order', label: 'Nouvelle commande', icon: FileText },
      { type: 'maintenance', label: 'Intervention maintenance', icon: Wrench },
    ];

    if (activeTab === 'users') {
      baseItems.push({ type: 'user', label: 'Inviter utilisateur', icon: Users });
    }

    return baseItems;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du portail Pro...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'equipment', label: 'Équipements', icon: Package },
    { id: 'orders', label: 'Commandes', icon: FileText },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Portail Pro - {proProfile?.company_name || 'Minegrid'}
              </h1>
              <p className="text-sm text-gray-600">
                Abonnement {proProfile?.subscription_type || 'Pro'} • 
                {proProfile?.subscription_status === 'active' ? (
                  <span className="text-orange-600 ml-1">Actif</span>
                ) : (
                  <span className="text-orange-600 ml-1">En attente</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={handleNewButtonClick}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                
                {showNewMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {getNewMenuItems().map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.type}
                            onClick={() => handleNewItem(item.type as any)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'equipment' && <EquipmentTab equipment={equipment} onRefresh={loadDashboardData} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={loadDashboardData} />}
        {activeTab === 'maintenance' && <MaintenanceTab interventions={interventions} onRefresh={loadDashboardData} />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'notifications' && <NotificationsTab notifications={notifications} />}
      </main>

      {/* Modal pour ajouter un nouvel élément */}
      {showModal && modalType && (
        <NewItemModal 
          type={modalType} 
          onClose={() => {
            setShowModal(false);
            setModalType(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setModalType(null);
            loadDashboardData();
          }}
        />
      )}

      {/* Overlay pour fermer le menu */}
      {showNewMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNewMenu(false)}
        />
      )}
    </div>
  );
}

// Composant Vue d'ensemble
function OverviewTab({ stats }: { stats: PortalStats | null }) {
  if (!stats) return <div>Chargement des statistiques...</div>;

  const statCards = [
    {
      title: 'Équipements Totaux',
      value: stats.totalEquipment,
      icon: Package,
      color: 'bg-orange-500',
      change: '+2 ce mois'
    },
    {
      title: 'Équipements Actifs',
      value: stats.activeEquipment,
      icon: CheckCircle,
      color: 'bg-orange-600',
      change: `${((stats.activeEquipment / stats.totalEquipment) * 100).toFixed(1)}%`
    },
    {
      title: 'Commandes en Attente',
      value: stats.pendingOrders,
      icon: FileText,
      color: 'bg-orange-400',
      change: 'À traiter'
    },
    {
      title: 'Interventions à Venir',
      value: stats.upcomingInterventions,
      icon: Wrench,
      color: 'bg-orange-700',
      change: 'Cette semaine'
    },
    {
      title: 'Notifications Non Lues',
      value: stats.unreadNotifications,
      icon: Bell,
      color: 'bg-orange-800',
      change: 'Nouvelles'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Vue d'ensemble</h2>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Graphiques et tableaux de bord */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance préventive</span>
              <span className="text-sm text-orange-600">Terminée</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nouvelle commande</span>
              <span className="text-sm text-orange-500">En attente</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Diagnostic équipement</span>
              <span className="text-sm text-orange-700">En cours</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alertes</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm text-gray-600">Maintenance due dans 3 jours</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-orange-700 mr-2" />
              <span className="text-sm text-gray-600">Garantie expirée - Équipement #123</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-sm text-gray-600">Diagnostic OK - Équipement #456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Équipements
function EquipmentTab({ equipment, onRefresh }: { equipment: ClientEquipment[], onRefresh: () => Promise<void> }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Équipements</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un équipement
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </button>
        </div>
      </div>

      {/* Liste des équipements */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Équipement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Heures
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prochaine Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.brand} {item.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      S/N: {item.serial_number}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'active' ? 'bg-orange-100 text-orange-800' :
                    item.status === 'maintenance' ? 'bg-orange-200 text-orange-900' :
                    'bg-orange-300 text-orange-900'
                  }`}>
                    {item.status === 'active' ? 'Actif' :
                     item.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.location || 'Non spécifié'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_hours} h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.next_maintenance ? new Date(item.next_maintenance).toLocaleDateString() : 'Non planifiée'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-orange-600 hover:text-orange-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-orange-500 hover:text-orange-700">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-orange-700 hover:text-orange-900">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant Commandes
function OrdersTab({ orders, onRefresh }: { orders: ClientOrder[], onRefresh: () => Promise<void> }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Commandes</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Commande
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.order_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'delivered' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'shipped' ? 'bg-orange-200 text-orange-900' :
                    order.status === 'confirmed' ? 'bg-orange-300 text-orange-900' :
                    'bg-orange-400 text-orange-900'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.total_amount ? `${order.total_amount} ${order.currency}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.order_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-orange-600 hover:text-orange-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant Maintenance
function MaintenanceTab({ interventions, onRefresh }: { interventions: MaintenanceIntervention[], onRefresh: () => Promise<void> }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Planifier une intervention
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interventions.map((intervention) => (
          <div key={intervention.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {intervention.intervention_type}
                </h3>
                <p className="text-sm text-gray-600">
                  {intervention.description}
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                intervention.status === 'completed' ? 'bg-orange-100 text-orange-800' :
                intervention.status === 'in_progress' ? 'bg-orange-200 text-orange-900' :
                intervention.status === 'scheduled' ? 'bg-orange-300 text-orange-900' :
                'bg-orange-400 text-orange-900'
              }`}>
                {intervention.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(intervention.scheduled_date).toLocaleDateString()}
              </div>
              {intervention.technician_name && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {intervention.technician_name}
                </div>
              )}
              {intervention.cost && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Coût: {intervention.cost}€</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
                                  <button className="text-orange-600 hover:text-orange-900 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </button>
              <button className="text-gray-600 hover:text-gray-900 text-sm">
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant Documents
function DocumentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Documents Techniques</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Uploader un document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Gestion des documents techniques, manuels, certificats...</p>
      </div>
    </div>
  );
}

// Composant Utilisateurs
function UsersTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Utilisateurs</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Inviter un utilisateur
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Gestion des utilisateurs du portail client...</p>
      </div>
    </div>
  );
}

// Composant Notifications
function NotificationsTab({ notifications }: { notifications: ClientNotification[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <button className="text-gray-600 hover:text-gray-900">
          Marquer tout comme lu
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${
            notification.priority === 'urgent' ? 'border-red-500' :
            notification.priority === 'high' ? 'border-yellow-500' :
            'border-blue-500'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.is_read && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Nouveau
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant Modal pour ajouter un nouvel élément
interface NewItemModalProps {
  type: 'equipment' | 'order' | 'maintenance' | 'user';
  onClose: () => void;
  onSuccess: () => void;
}

function NewItemModal({ type, onClose, onSuccess }: NewItemModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      switch (type) {
        case 'equipment':
          await addClientEquipment(formData);
          break;
        case 'order':
          await createClientOrder(formData);
          break;
        case 'maintenance':
          await createMaintenanceIntervention(formData);
          break;
        case 'user':
          await inviteClientUser(formData.email, formData.role);
          break;
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const getModalTitle = () => {
    switch (type) {
      case 'equipment': return 'Nouvel équipement';
      case 'order': return 'Nouvelle commande';
      case 'maintenance': return 'Intervention maintenance';
      case 'user': return 'Inviter utilisateur';
      default: return 'Nouvel élément';
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'equipment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de série *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'équipement *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('equipment_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="excavatrice">Excavatrice</option>
                <option value="pelle">Pelle hydraulique</option>
                <option value="chargeur">Chargeur</option>
                <option value="bulldozer">Bulldozer</option>
                <option value="camion">Camion</option>
                <option value="concasseur">Concasseur</option>
              </select>
            </div>
          </div>
        );

      case 'order':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de commande *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('order_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="purchase">Achat</option>
                <option value="rental">Location</option>
                <option value="maintenance">Maintenance</option>
                <option value="import">Import</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'intervention *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('intervention_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="preventive">Maintenance préventive</option>
                <option value="corrective">Maintenance corrective</option>
                <option value="emergency">Intervention d'urgence</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date prévue *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        );

      case 'user':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <option value="">Sélectionner un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="manager">Manager</option>
                <option value="technician">Technicien</option>
                <option value="viewer">Lecteur</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {renderForm()}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 