import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Package, 
  FileText, 
  Wrench, 
  Users, 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Settings,
  Download,
  Share2,
  Star,
  BarChart3,
  Layers,
  Database,
  HardDrive,
  AlertTriangle,
  XCircle,
  ChevronDown,
  X,
  Check,
  Truck,
  MessageSquare,
  Archive,
  Save,
  Shield,
  Home
} from 'lucide-react';
import { 
  getProClientProfile, 
  getClientEquipment, 
  getClientOrders, 
  getMaintenanceInterventions, 
  getClientNotifications, 
  getPortalStats,
  getUserMachines,
  addClientEquipment,
  createClientOrder,
  createMaintenanceIntervention,
  inviteClientUser,
  getUserInvitations,
  cancelUserInvitation,
  type UserInvitation,
  upsertProClientProfile,
  markNotificationAsRead
} from '../utils/proApi';
import { 
  usePermissions, 
  canInviteUsers, 
  canManageEquipment, 
  canManageOrders, 
  canManageMaintenance,
  canManageDocuments,
  canSendMessages,
  canAccessSettings,
  canExportReports
} from '../utils/permissions';
import supabase from '../utils/supabaseClient';
import { TECHNICAL_DOCUMENT_COLUMNS } from '../constants/proClientQueryFields';
import type { 
  ProClient, 
  ClientEquipment, 
  ClientOrder, 
  MaintenanceIntervention, 
  ClientNotification 
} from '../utils/proApi';
import { fetchModelSpecsFull, summarizeSpecs } from '../services/autoSpecsService';
import { EquipmentTab } from "./pro/widgets/EquipmentTab";
import { OrdersTab } from "./pro/widgets/OrdersTab";
import { MessagesTab } from "./pro/widgets/MessagesTab";
import { DocumentsTab } from "./pro/widgets/DocumentsTab";
import { UsersTab } from "./pro/widgets/UsersTab";
import { MaintenanceTab } from "./pro/widgets/MaintenanceTab";
import { NewItemModal } from "./pro/widgets/NewItemModal";
import { NotificationsTab } from "./pro/widgets/NotificationsTab";
import { OverviewTab } from "./pro/widgets/OverviewTab";

import type { PortalStats } from './pro/types';

export default function ProDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [proProfile, setProProfile] = useState<ProClient | null>(null);
  const [equipment, setEquipment] = useState<ClientEquipment[]>([]);
  const [userMachines, setUserMachines] = useState<any[]>([]);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<MaintenanceIntervention[]>([]);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'equipment' | 'order' | 'maintenance' | 'user' | null>(null);
  
  // Gestion des permissions
  const { permissions, loading: permissionsLoading } = usePermissions();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Requête corrigée : tous les messages sont visibles pour tous les utilisateurs
      // (la colonne sellerid a été supprimée lors de la correction de la table)
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          machine:machines(name, brand, model, images)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement messages:', error);
        return [];
      }

      console.log('✅ Messages chargés:', messages?.length || 0);
      return messages || [];
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      return [];
    }
  };

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Chargement des données du dashboard...');
      
      const [
        profile,
        equipmentData,
        userMachinesData,
        ordersData,
        messagesData,
        interventionsData,
        notificationsData,
        statsData
      ] = await Promise.all([
        getProClientProfile(),
        getClientEquipment(),
        getUserMachines(),
        getClientOrders(),
        loadMessages(),
        getMaintenanceInterventions(),
        getClientNotifications(),
        getPortalStats()
      ]);

      console.log('📊 Données chargées:', { profile, equipmentData, userMachinesData, ordersData, messagesData, interventionsData, notificationsData, statsData });
      
      setProProfile(profile);
      setEquipment(equipmentData);
      setUserMachines(userMachinesData);
      setOrders(ordersData);
      setMessages(messagesData);
      setInterventions(interventionsData);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
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

  const getTabs = () => {
    const baseTabs = [
      { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    ];

    // Équipements - accessible à tous
    baseTabs.push({ id: 'equipment', label: 'Équipements', icon: Package });

    // Commandes - accessible à tous
    baseTabs.push({ id: 'orders', label: 'Commandes', icon: FileText });

    // Maintenance - accessible à tous
    baseTabs.push({ id: 'maintenance', label: 'Maintenance', icon: Wrench });

    // Documents - accessible à tous
    baseTabs.push({ id: 'documents', label: 'Documents', icon: Download });

    // Utilisateurs - seulement pour les administrateurs
    if (permissions?.isAdmin) {
      baseTabs.push({ id: 'users', label: 'Utilisateurs', icon: Users });
    }

    // Messages - accessible à tous (placé près des notifications)
    baseTabs.push({ id: 'messages', label: 'Messages', icon: MessageSquare });

    // Notifications - accessible à tous
    baseTabs.push({ id: 'notifications', label: 'Notifications', icon: Bell });



    return baseTabs;
  };

  const tabs = getTabs();

  console.log('🎯 Rendu du ProDashboard, loading:', loading, 'proProfile:', proProfile);
  
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
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Retourner à l'accueil</span>
              </button>
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
                  data-tab={tab.id}
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
        {activeTab === 'equipment' && <EquipmentTab equipment={equipment} userMachines={userMachines} onRefresh={loadDashboardData} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={loadDashboardData} />}
        {activeTab === 'messages' && <MessagesTab messages={messages} onRefresh={loadDashboardData} />}
        {activeTab === 'maintenance' && <MaintenanceTab interventions={interventions} equipment={equipment} onRefresh={loadDashboardData} />}
        {activeTab === 'documents' && <DocumentsTab onRefresh={loadDashboardData} />}
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


    </div>
  );
}

// Composant Vue d'ensemble
// Composant Équipements
// Composant Commandes
