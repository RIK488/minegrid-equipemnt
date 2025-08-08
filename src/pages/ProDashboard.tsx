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
import type { 
  ProClient, 
  ClientEquipment, 
  ClientOrder, 
  MaintenanceIntervention, 
  ClientNotification 
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

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          machine:machines(name, brand, model, images)
        `)
        .eq('sellerid', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement messages:', error);
        return [];
      }

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
function EquipmentTab({ equipment, userMachines, onRefresh }: { equipment: ClientEquipment[], userMachines: any[], onRefresh: () => Promise<void> }) {
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showProEquipmentForm, setShowProEquipmentForm] = useState(false);
  const [proEquipmentForm, setProEquipmentForm] = useState({
    serial_number: '',
    equipment_type: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    location: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive' | 'sold',
    total_hours: 0,
    fuel_consumption: 0,
    create_public_announcement: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEquipment = () => {
    setShowAddEquipmentModal(true);
  };

  // États pour les modals et actions
  const [showViewEquipmentModal, setShowViewEquipmentModal] = useState(false);
  const [showEditEquipmentModal, setShowEditEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<ClientEquipment | null>(null);
  
  // États pour la gestion des images d'équipement
  const [selectedEquipmentImages, setSelectedEquipmentImages] = useState<File[]>([]);
  const [equipmentImagePreviewUrls, setEquipmentImagePreviewUrls] = useState<string[]>([]);
  const [editEquipmentForm, setEditEquipmentForm] = useState({
    serial_number: '',
    equipment_type: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    location: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive' | 'sold',
    total_hours: 0,
    fuel_consumption: 0,
    description: '',
    purchase_date: '',
    warranty_end: '',
    last_maintenance: '',
    next_maintenance: '',
    notes: '',
    price: 0,
    images: [] as string[]
  });

  // Fonctions de gestion des actions d'équipement
  const handleViewEquipment = (equipment: ClientEquipment) => {
    console.log('Voir équipement:', equipment);
    // Navigation vers la page de détail de la machine
    window.location.hash = `#machines/${equipment.id}`;
  };

  const handleEditEquipment = (equipment: ClientEquipment) => {
    console.log('Modifier équipement:', equipment);
    setSelectedEquipment(equipment);
    setEditEquipmentForm({
      serial_number: equipment.serial_number || '',
      equipment_type: equipment.equipment_type || '',
      brand: equipment.brand || '',
      model: equipment.model || '',
      year: equipment.year || new Date().getFullYear(),
      location: equipment.location || '',
      status: equipment.status || 'active',
      total_hours: equipment.total_hours || 0,
      fuel_consumption: equipment.fuel_consumption || 0,
      description: equipment.description || '',
      purchase_date: equipment.purchase_date || '',
      warranty_end: equipment.warranty_end || '',
      last_maintenance: equipment.last_maintenance || '',
      next_maintenance: equipment.next_maintenance || '',
      notes: equipment.notes || '',
      price: equipment.price || 0,
      images: equipment.images || []
    });
    // Réinitialiser les états d'images
    setSelectedEquipmentImages([]);
    setEquipmentImagePreviewUrls([]);
    setShowEditEquipmentModal(true);
  };

  const handleDeleteEquipment = async (equipment: ClientEquipment) => {
    console.log('Supprimer équipement:', equipment);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'équipement ${equipment.serial_number} ?`)) {
      try {
        const { error } = await supabase
          .from('machines')
          .delete()
          .eq('id', equipment.id);

        if (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'équipement');
        } else {
          console.log('✅ Équipement supprimé avec succès');
          alert(`Équipement ${equipment.serial_number} supprimé avec succès`);
          // Recharger les données
          onRefresh();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'équipement');
      }
    }
  };

  const handleUpdateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      let updatedImages = [...editEquipmentForm.images];

      // Upload des nouvelles images si elles existent
      if (selectedEquipmentImages.length > 0) {
        console.log('📸 Upload de', selectedEquipmentImages.length, 'nouvelles images...');
        
        for (const file of selectedEquipmentImages) {
          try {
            // Générer un nom de fichier unique
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `equipment-images/${fileName}`;

            // Upload vers Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, file);

            if (uploadError) {
              console.error('Erreur upload image:', uploadError);
              continue;
            }

            // Obtenir l'URL publique
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);

            if (publicUrl) {
              updatedImages.push(publicUrl);
              console.log('✅ Image uploadée:', publicUrl);
            }
          } catch (imageError) {
            console.error('Erreur lors de l\'upload d\'une image:', imageError);
          }
        }
      }

      // 1. Mettre à jour les données publiques dans machines (marque, type, description, prix, images)
      const { error } = await supabase
        .from('machines')
        .update({
          brand: editEquipmentForm.brand,
          category: editEquipmentForm.equipment_type,
          description: editEquipmentForm.description,
          price: editEquipmentForm.price,
          images: updatedImages
        })
        .eq('id', selectedEquipment.id);

      if (error) {
        console.error('Erreur lors de la mise à jour machines:', error);
        alert('Erreur lors de la mise à jour de l\'équipement');
        return;
      }

      // 2. Mettre à jour les détails Pro séparément (numéro de série, heures, etc.)
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { error: proError } = await supabase
          .from('pro_equipment_details')
          .upsert({
            machine_id: selectedEquipment.id,
            user_id: user.id,
            serial_number: editEquipmentForm.serial_number,
            total_hours: editEquipmentForm.total_hours,
            fuel_consumption: editEquipmentForm.fuel_consumption,
            purchase_date: editEquipmentForm.purchase_date || null,
            warranty_end: editEquipmentForm.warranty_end || null,
            last_maintenance: editEquipmentForm.last_maintenance || null,
            next_maintenance: editEquipmentForm.next_maintenance || null,
            notes: editEquipmentForm.notes || null
          });

        if (proError) {
          console.error('Erreur lors de la mise à jour pro_equipment_details:', proError);
          alert('Erreur lors de la mise à jour des détails Pro');
          return;
        }
      }

      console.log('✅ Équipement mis à jour avec succès');
      alert(`Équipement ${editEquipmentForm.serial_number} mis à jour avec succès`);
      setShowEditEquipmentModal(false);
      setSelectedEquipment(null);
      // Réinitialiser les états d'images
      setSelectedEquipmentImages([]);
      setEquipmentImagePreviewUrls([]);
      // Recharger les données
      onRefresh();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de l\'équipement');
    }
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditEquipmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonctions pour gérer les images d'équipement
  const handleEquipmentImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedEquipmentImages(prev => [...prev, ...newFiles]);
      
      // Créer les URLs de prévisualisation
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setEquipmentImagePreviewUrls(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeEquipmentImage = (index: number) => {
    setSelectedEquipmentImages(prev => prev.filter((_, i) => i !== index));
    setEquipmentImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingEquipmentImage = (index: number) => {
    setEditEquipmentForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // États pour les modals d'annonces
  const [showViewAnnouncementModal, setShowViewAnnouncementModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [editAnnouncementForm, setEditAnnouncementForm] = useState({
    name: '',
    category: '',
    price: 0,
    location: '',
    description: '',
    images: [] as string[]
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Fonctions de gestion des actions d'annonces
  const handleViewAnnouncement = (announcement: any) => {
    console.log('Voir annonce:', announcement);
    // Navigation vers la page de détail de la machine
    window.location.hash = `#machines/${announcement.id}`;
  };

  const handleEditAnnouncement = (announcement: any) => {
    console.log('Modifier annonce:', announcement);
    setSelectedAnnouncement(announcement);
    setEditAnnouncementForm({
      name: announcement.name || '',
      category: announcement.category || '',
      price: announcement.price || 0,
      location: announcement.location || '',
      description: announcement.description || '',
      images: announcement.images || []
    });
    setShowEditAnnouncementModal(true);
  };

  const handleShareAnnouncement = (announcement: any) => {
    console.log('Partager annonce:', announcement);
    if (navigator.share) {
      navigator.share({
        title: announcement.name,
        text: `Découvrez cet équipement: ${announcement.name}`,
        url: window.location.href
      });
    } else {
      // Fallback : copier le lien dans le presse-papiers
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Lien copié dans le presse-papiers !');
      }).catch(() => {
        alert(`Partager l'annonce: ${announcement.name}`);
      });
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;

    try {
      // Ici vous pouvez implémenter la mise à jour en base de données
      // Pour l'instant, on simule la mise à jour
      console.log('✅ Annonce mise à jour:', editAnnouncementForm);
      alert(`Annonce ${editAnnouncementForm.name} mise à jour avec succès`);
      setShowEditAnnouncementModal(false);
      setSelectedAnnouncement(null);
      // Recharger les données
      onRefresh();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de l\'annonce');
    }
  };

  const handleAnnouncementInputChange = (field: string, value: any) => {
    setEditAnnouncementForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonctions pour gérer les images
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedImages(prev => [...prev, ...newFiles]);
      
      // Créer les URLs de prévisualisation
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviewUrls(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setEditAnnouncementForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleProEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Récupérer le profil Pro pour obtenir le client_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const proProfile = await getProClientProfile();
      if (!proProfile) throw new Error('Profil Pro non trouvé');

      // Préparer les données de l'équipement
      const equipmentData = {
        ...proEquipmentForm,
        client_id: proProfile.id,
        qr_code: `MINE-${proEquipmentForm.serial_number}-${Date.now()}`,
        purchase_date: new Date().toISOString(),
        warranty_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Ajouter l'équipement Pro (toujours interne)
      const newEquipment = await addClientEquipment(equipmentData);
      
      if (newEquipment) {
        console.log('✅ Équipement Pro ajouté:', newEquipment);
        
        // Si l'utilisateur veut créer une annonce publique
        if (proEquipmentForm.create_public_announcement) {
          try {
            // Créer une annonce publique basée sur l'équipement Pro
            const announcementData = {
              name: `${proEquipmentForm.brand} ${proEquipmentForm.model}`,
              category: proEquipmentForm.equipment_type,
              brand: proEquipmentForm.brand,
              model: proEquipmentForm.model,
              year: proEquipmentForm.year,
              location: proEquipmentForm.location,
              price: 0, // Prix à définir par l'utilisateur
              description: `Équipement ${proEquipmentForm.brand} ${proEquipmentForm.model} - ${proEquipmentForm.year}`,
              sellerid: proProfile.id,
              status: 'active'
            };

            const { data: announcement, error: announcementError } = await supabase
              .from('machines')
              .insert(announcementData)
              .select()
              .single();

            if (announcementError) {
              console.error('Erreur création annonce:', announcementError);
              alert('Équipement Pro ajouté, mais erreur lors de la création de l\'annonce publique');
            } else {
              console.log('✅ Annonce publique créée:', announcement);
              alert('Équipement Pro ajouté et annonce publique créée avec succès !');
            }
          } catch (error) {
            console.error('Erreur création annonce:', error);
            alert('Équipement Pro ajouté, mais erreur lors de la création de l\'annonce publique');
          }
        } else {
          alert('Équipement Pro ajouté avec succès ! (interne uniquement)');
        }
        
        setShowProEquipmentForm(false);
        setShowAddEquipmentModal(false);
        setProEquipmentForm({
          serial_number: '',
          equipment_type: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          location: '',
          status: 'active',
          total_hours: 0,
          fuel_consumption: 0,
          create_public_announcement: false
        });
        
        // Recharger les données
        await onRefresh();
        
        // Notification de succès (vous pouvez implémenter un système de notification)
        alert('Équipement Pro ajouté avec succès !');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'équipement Pro:', error);
      alert('Erreur lors de l\'ajout de l\'équipement Pro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProEquipmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Équipements</h2>
        <button 
          onClick={handleAddEquipment}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
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

      {/* Section Équipements Pro */}
      {equipment.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2 text-orange-600" />
              Équipements Pro ({equipment.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">Équipements gérés dans le portail Pro</p>
          </div>
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
                      <button 
                        onClick={() => handleViewEquipment(item)}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditEquipment(item)}
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEquipment(item)}
                        className="text-orange-700 hover:text-orange-900 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section Annonces d'Équipements */}
      {userMachines.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-blue-600" />
              Mes Annonces d'Équipements ({userMachines.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">Équipements publiés sur la plateforme</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de Publication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {machine.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {machine.brand} {machine.model} ({machine.year})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {machine.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {machine.price?.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {machine.location || 'Non spécifié'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(machine.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewAnnouncement(machine)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Voir annonce"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditAnnouncement(machine)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Modifier annonce"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleShareAnnouncement(machine)}
                        className="text-blue-700 hover:text-blue-900 transition-colors"
                        title="Partager"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message si aucun équipement */}
      {equipment.length === 0 && userMachines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Aucun équipement disponible
          </div>
          <p className="text-gray-400">
            Vous n'avez pas encore d'équipements Pro ou d'annonces publiées
          </p>
        </div>
      )}

      {/* Modal d'ajout d'équipement */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Ajouter un équipement</h3>
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Choix du type d'équipement */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Type d'équipement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => window.location.hash = '#publication'}
                    className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <HardDrive className="h-8 w-8 text-orange-600 mr-3" />
                      <div>
                        <h5 className="font-semibold text-gray-900">Annonce d'équipement</h5>
                        <p className="text-sm text-gray-600">Publier une annonce sur la plateforme</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAddEquipmentModal(false);
                      setShowProEquipmentForm(true);
                    }}
                    className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h5 className="font-semibold text-gray-900">Équipement Pro</h5>
                        <p className="text-sm text-gray-600">Ajouter un équipement géré dans le portail Pro</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Informations */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Différence entre les types :</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Annonce :</strong> Équipement à vendre/louer sur la plateforme</li>
                  <li>• <strong>Équipement Pro :</strong> Équipement géré avec suivi maintenance, diagnostics, etc.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire Équipement Pro */}
      {showProEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Ajouter un Équipement Pro</h3>
              <button
                onClick={() => setShowProEquipmentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleProEquipmentSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de série *
                  </label>
                  <input
                    type="text"
                    value={proEquipmentForm.serial_number}
                    onChange={(e) => handleInputChange('serial_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'équipement *
                  </label>
                  <select
                    value={proEquipmentForm.equipment_type}
                    onChange={(e) => handleInputChange('equipment_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Pelle hydraulique">Pelle hydraulique</option>
                    <option value="Chargeur frontal">Chargeur frontal</option>
                    <option value="Bulldozer">Bulldozer</option>
                    <option value="Excavatrice">Excavatrice</option>
                    <option value="Grue">Grue</option>
                    <option value="Camion">Camion</option>
                    <option value="Foreuse">Foreuse</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={proEquipmentForm.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="ex: CAT, Volvo, Komatsu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={proEquipmentForm.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="ex: 320D, L120H"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={proEquipmentForm.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={proEquipmentForm.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'maintenance' | 'inactive' | 'sold')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="maintenance">En maintenance</option>
                    <option value="inactive">Inactif</option>
                    <option value="sold">Vendu</option>
                  </select>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={proEquipmentForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="ex: Site principal, Zone d'extraction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures totales
                  </label>
                  <input
                    type="number"
                    value={proEquipmentForm.total_hours}
                    onChange={(e) => handleInputChange('total_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consommation carburant (L/h)
                  </label>
                  <input
                    type="number"
                    value={proEquipmentForm.fuel_consumption}
                    onChange={(e) => handleInputChange('fuel_consumption', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Option de création d'annonce publique */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="create_public_announcement"
                    checked={proEquipmentForm.create_public_announcement}
                    onChange={(e) => handleInputChange('create_public_announcement', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="create_public_announcement" className="ml-2 text-sm text-gray-700">
                    Créer également une annonce publique pour cet équipement
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Si coché, une annonce sera créée dans "Mes Annonces" avec les informations de base. 
                  Vous pourrez ensuite la modifier pour ajouter le prix et les images.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProEquipmentForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ajout en cours...
                    </>
                  ) : (
                    'Ajouter l\'équipement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de vue détaillée d'équipement */}
      {showViewEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Détails de l'équipement</h3>
              <button
                onClick={() => setShowViewEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Numéro de série</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.serial_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type d'équipement</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.equipment_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Marque</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.brand || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Modèle</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.model || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Statut et localisation</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEquipment.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedEquipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        selectedEquipment.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEquipment.status === 'active' ? 'Actif' :
                         selectedEquipment.status === 'maintenance' ? 'En maintenance' :
                         selectedEquipment.status === 'inactive' ? 'Inactif' : 'Vendu'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Localisation</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.location || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Année</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.year || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Heures totales</label>
                      <p className="text-sm text-gray-900">{selectedEquipment.total_hours || 0} heures</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewEquipmentModal(false);
                    handleEditEquipment(selectedEquipment);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setShowViewEquipmentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'équipement */}
      {showEditEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Modifier l'équipement</h3>
              <button
                onClick={() => setShowEditEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Numéro de série */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de série *
                  </label>
                  <input
                    type="text"
                    value={editEquipmentForm.serial_number}
                    onChange={(e) => handleEditInputChange('serial_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Type d'équipement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'équipement *
                  </label>
                  <input
                    type="text"
                    value={editEquipmentForm.equipment_type}
                    onChange={(e) => handleEditInputChange('equipment_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Marque */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={editEquipmentForm.brand}
                    onChange={(e) => handleEditInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Modèle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={editEquipmentForm.model}
                    onChange={(e) => handleEditInputChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={editEquipmentForm.year}
                    onChange={(e) => handleEditInputChange('year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Localisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={editEquipmentForm.location}
                    onChange={(e) => handleEditInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={editEquipmentForm.status}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Actif</option>
                    <option value="maintenance">En maintenance</option>
                    <option value="inactive">Inactif</option>
                    <option value="sold">Vendu</option>
                  </select>
                </div>

                {/* Heures totales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures totales
                  </label>
                  <input
                    type="number"
                    value={editEquipmentForm.total_hours}
                    onChange={(e) => handleEditInputChange('total_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Consommation de carburant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consommation carburant (L/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editEquipmentForm.fuel_consumption}
                    onChange={(e) => handleEditInputChange('fuel_consumption', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editEquipmentForm.price}
                    onChange={(e) => handleEditInputChange('price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Images de l'équipement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images de l'équipement
                </label>
                
                {/* Images existantes */}
                {editEquipmentForm.images.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Images existantes</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editEquipmentForm.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingEquipmentImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer cette image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nouvelles images */}
                {equipmentImagePreviewUrls.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Nouvelles images</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {equipmentImagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Nouvelle image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeEquipmentImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer cette image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton d'ajout d'images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEquipmentImageSelect}
                    className="hidden"
                    id="equipment-image-upload"
                  />
                  <label
                    htmlFor="equipment-image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Cliquez pour ajouter des images
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG, GIF jusqu'à 5MB par image
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditEquipmentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de vue détaillée d'annonce */}
      {showViewAnnouncementModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Détails de l'annonce</h3>
              <button
                onClick={() => setShowViewAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nom de l'équipement</label>
                      <p className="text-sm text-gray-900">{selectedAnnouncement.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Catégorie</label>
                      <p className="text-sm text-gray-900">{selectedAnnouncement.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Prix</label>
                      <p className="text-sm text-gray-900 font-semibold">{selectedAnnouncement.price} MAD</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Localisation</label>
                      <p className="text-sm text-gray-900">{selectedAnnouncement.location || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Détails supplémentaires</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date de publication</label>
                      <p className="text-sm text-gray-900">{selectedAnnouncement.publication_date || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vues</label>
                      <p className="text-sm text-gray-900">{selectedAnnouncement.views || 0} vues</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Images de l'équipement</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedAnnouncement.images.map((image: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedAnnouncement.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedAnnouncement.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewAnnouncementModal(false);
                    handleEditAnnouncement(selectedAnnouncement);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleShareAnnouncement(selectedAnnouncement)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Partager
                </button>
                <button
                  onClick={() => setShowViewAnnouncementModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'annonce */}
      {showEditAnnouncementModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Modifier l'annonce</h3>
              <button
                onClick={() => setShowEditAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom de l'équipement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'équipement *
                  </label>
                  <input
                    type="text"
                    value={editAnnouncementForm.name}
                    onChange={(e) => handleAnnouncementInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={editAnnouncementForm.category}
                    onChange={(e) => handleAnnouncementInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Terrassement">Terrassement</option>
                    <option value="Maintenance & Levage">Maintenance & Levage</option>
                    <option value="Voirie">Voirie</option>
                    <option value="Transport">Transport</option>
                    <option value="Pelle hydraulique">Pelle hydraulique</option>
                  </select>
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (MAD) *
                  </label>
                  <input
                    type="number"
                    value={editAnnouncementForm.price}
                    onChange={(e) => handleAnnouncementInputChange('price', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>

                {/* Localisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={editAnnouncementForm.location}
                    onChange={(e) => handleAnnouncementInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Casablanca, Maroc"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editAnnouncementForm.description}
                  onChange={(e) => handleAnnouncementInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description détaillée de l'équipement..."
                />
              </div>

              {/* Gestion des images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images de l'équipement
                </label>
                
                {/* Images existantes */}
                {editAnnouncementForm.images.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Images existantes</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editAnnouncementForm.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer cette image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nouvelles images */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Nouvelles images</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Nouvelle image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer cette image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton d'ajout d'images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Cliquez pour ajouter des images
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG, GIF jusqu'à 5MB par image
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditAnnouncementModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Commandes
function OrdersTab({ orders, onRefresh }: { orders: ClientOrder[], onRefresh: () => Promise<void> }) {
  // États pour les modals et actions
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ClientOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // États pour les commandes entrantes (offres d'achat)
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [showIncomingOrderModal, setShowIncomingOrderModal] = useState(false);
  const [selectedIncomingOrder, setSelectedIncomingOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'internal' | 'incoming'>('incoming');

  // État pour le formulaire de nouvelle commande
  const [newOrderForm, setNewOrderForm] = useState({
    order_type: 'purchase' as 'purchase' | 'rental' | 'maintenance' | 'import',
    total_amount: 0,
    currency: 'MAD',
    expected_delivery: '',
    notes: ''
  });

  // État pour le formulaire d'édition
  const [editOrderForm, setEditOrderForm] = useState({
    order_type: 'purchase' as 'purchase' | 'rental' | 'maintenance' | 'import',
    status: 'pending' as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
    total_amount: 0,
    currency: 'MAD',
    expected_delivery: '',
    actual_delivery: '',
    notes: ''
  });

  // Charger les commandes entrantes au montage
  useEffect(() => {
    loadIncomingOrders();
  }, []);

  const loadIncomingOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les offres reçues par le vendeur
      const { data: offers, error } = await supabase
        .from('offers')
        .select(`
          *,
          buyer:profiles!offers_buyer_id_fkey(firstname, lastname, email, phone, company),
          machine:machines(name, brand, model, category, price, images)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des commandes entrantes:', error);
        return;
      }

      setIncomingOrders(offers || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes entrantes:', error);
    }
  };

  // Fonctions de gestion des actions
  const handleAddOrder = () => {
    setShowAddOrderModal(true);
  };

  // Fonctions pour les commandes entrantes
  const handleViewIncomingOrder = (order: any) => {
    console.log('Voir commande entrante:', order);
    setSelectedIncomingOrder(order);
    setShowIncomingOrderModal(true);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (error) {
        console.error('Erreur lors de l\'acceptation:', error);
        alert('Erreur lors de l\'acceptation de l\'offre');
        return;
      }

      console.log('✅ Offre acceptée avec succès');
      alert('Offre acceptée avec succès !');
      loadIncomingOrders(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      alert('Erreur lors de l\'acceptation de l\'offre');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'rejected' })
        .eq('id', offerId);

      if (error) {
        console.error('Erreur lors du refus:', error);
        alert('Erreur lors du refus de l\'offre');
        return;
      }

      console.log('✅ Offre refusée avec succès');
      alert('Offre refusée avec succès !');
      loadIncomingOrders(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      alert('Erreur lors du refus de l\'offre');
    }
  };

  const handleSendInvoice = async (offerId: string) => {
    // TODO: Implémenter l'envoi de facture
    alert('Fonctionnalité d\'envoi de facture à implémenter');
  };

  const handleMarkShipped = async (offerId: string) => {
    // TODO: Implémenter le marquage comme expédié
    alert('Fonctionnalité de marquage expédié à implémenter');
  };

  const handleViewOrder = (order: ClientOrder) => {
    console.log('Voir commande:', order);
    setSelectedOrder(order);
    setShowViewOrderModal(true);
  };

  const handleEditOrder = (order: ClientOrder) => {
    console.log('Modifier commande:', order);
    setSelectedOrder(order);
    setEditOrderForm({
      order_type: order.order_type,
      status: order.status,
      total_amount: order.total_amount || 0,
      currency: order.currency,
      expected_delivery: order.expected_delivery ? new Date(order.expected_delivery).toISOString().split('T')[0] : '',
      actual_delivery: order.actual_delivery ? new Date(order.actual_delivery).toISOString().split('T')[0] : '',
      notes: order.notes || ''
    });
    setShowEditOrderModal(true);
  };

  const handleDeleteOrder = async (order: ClientOrder) => {
    console.log('Supprimer commande:', order);
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${order.order_number} ?`)) {
      try {
        const { error } = await supabase
          .from('client_orders')
          .delete()
          .eq('id', order.id);

        if (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de la commande');
        } else {
          console.log('✅ Commande supprimée avec succès');
          alert(`Commande ${order.order_number} supprimée avec succès`);
          onRefresh();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la commande');
      }
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Récupérer le profil Pro pour obtenir le client_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const proProfile = await getProClientProfile();
      if (!proProfile) throw new Error('Profil Pro non trouvé');

      // Générer un numéro de commande unique
      const orderNumber = `CMD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

      // Préparer les données de la commande
      const orderData = {
        client_id: proProfile.id,
        order_number: orderNumber,
        order_type: newOrderForm.order_type,
        status: 'pending' as 'pending',
        total_amount: newOrderForm.total_amount,
        currency: newOrderForm.currency,
        order_date: new Date().toISOString(),
        expected_delivery: newOrderForm.expected_delivery || null,
        notes: newOrderForm.notes || null
      };

      // Créer la commande
      const newOrder = await createClientOrder(orderData);
      
      if (newOrder) {
        console.log('✅ Commande créée:', newOrder);
        setShowAddOrderModal(false);
        setNewOrderForm({
          order_type: 'purchase',
          total_amount: 0,
          currency: 'MAD',
          expected_delivery: '',
          notes: ''
        });
        
        // Recharger les données
        await onRefresh();
        
        alert('Commande créée avec succès !');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      alert('Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('client_orders')
        .update({
          order_type: editOrderForm.order_type,
          status: editOrderForm.status,
          total_amount: editOrderForm.total_amount,
          currency: editOrderForm.currency,
          expected_delivery: editOrderForm.expected_delivery || null,
          actual_delivery: editOrderForm.actual_delivery || null,
          notes: editOrderForm.notes || null
        })
        .eq('id', selectedOrder.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour de la commande');
        return;
      }

      console.log('✅ Commande mise à jour avec succès');
      alert(`Commande ${selectedOrder.order_number} mise à jour avec succès`);
      setShowEditOrderModal(false);
      setSelectedOrder(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la commande');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setNewOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filtrage des commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.order_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir l'icône du type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '🛒';
      case 'rental': return '📋';
      case 'maintenance': return '🔧';
      case 'import': return '📦';
      default: return '📄';
    }
  };

  // Fonction pour obtenir la couleur du statut des offres
  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le texte du statut des offres
  const getOfferStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  // Filtrage des commandes entrantes
  const filteredIncomingOrders = incomingOrders.filter(order => {
    const matchesSearch = order.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Commandes</h2>
        <button 
          onClick={handleAddOrder}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'incoming'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📥 Commandes Entrantes
            {incomingOrders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                {incomingOrders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internal'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Commandes Internes
          </button>
        </nav>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              placeholder={activeTab === 'incoming' ? "Machine, acheteur, message..." : "N° commande, notes..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              {activeTab === 'incoming' ? (
                <>
                  <option value="pending">En attente</option>
                  <option value="accepted">Acceptée</option>
                  <option value="rejected">Refusée</option>
                  <option value="expired">Expirée</option>
                </>
              ) : (
                <>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </>
              )}
            </select>
          </div>
          {activeTab === 'internal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tous les types</option>
                <option value="purchase">Achat</option>
                <option value="rental">Location</option>
                <option value="maintenance">Maintenance</option>
                <option value="import">Import</option>
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Contenu conditionnel selon l'onglet actif */}
      {activeTab === 'incoming' ? (
        /* Tableau des commandes entrantes */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acheteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
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
              {filteredIncomingOrders.length > 0 ? (
                filteredIncomingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {order.machine?.images?.[0] && (
                          <img 
                            src={order.machine.images[0]} 
                            alt={order.machine.name}
                            className="w-8 h-8 rounded-md mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{order.machine?.name || 'Machine inconnue'}</div>
                          <div className="text-gray-500 text-xs">{order.machine?.brand} {order.machine?.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.buyer?.firstname} {order.buyer?.lastname}</div>
                        <div className="text-gray-500 text-xs">{order.buyer?.company || 'Particulier'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{order.amount?.toLocaleString()} MAD</div>
                      <div className="text-gray-500 text-xs">Prix: {order.machine?.price?.toLocaleString()} MAD</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOfferStatusColor(order.status)}`}>
                        {getOfferStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewIncomingOrder(order)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAcceptOffer(order.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Accepter"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleRejectOffer(order.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Refuser"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {order.status === 'accepted' && (
                          <>
                            <button 
                              onClick={() => handleSendInvoice(order.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Envoyer facture"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleMarkShipped(order.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Marquer expédié"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {incomingOrders.length === 0 ? 'Aucune commande entrante trouvée' : 'Aucune commande ne correspond aux filtres'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tableau des commandes internes */
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{getTypeIcon(order.order_type)}</span>
                        <span className="capitalize">{order.order_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? 'En attente' :
                         order.status === 'confirmed' ? 'Confirmée' :
                         order.status === 'shipped' ? 'Expédiée' :
                         order.status === 'delivered' ? 'Livrée' :
                         order.status === 'cancelled' ? 'Annulée' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.total_amount ? `${order.total_amount.toLocaleString()} ${order.currency}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.order_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {orders.length === 0 ? 'Aucune commande trouvée' : 'Aucune commande ne correspond aux filtres'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de création de commande */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Nouvelle commande</h3>
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de commande *
                </label>
                <select
                  value={newOrderForm.order_type}
                  onChange={(e) => handleInputChange('order_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="purchase">Achat</option>
                  <option value="rental">Location</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="import">Import</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newOrderForm.total_amount}
                  onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison prévue
                </label>
                <input
                  type="date"
                  value={newOrderForm.expected_delivery}
                  onChange={(e) => handleInputChange('expected_delivery', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newOrderForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Description de la commande..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Création...' : 'Créer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détail de commande */}
      {showViewOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Détails de la commande</h3>
              <button
                onClick={() => setShowViewOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Numéro de commande</dt>
                      <dd className="text-sm text-gray-900">{selectedOrder.order_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900 capitalize">{selectedOrder.order_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Statut</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status === 'pending' ? 'En attente' :
                           selectedOrder.status === 'confirmed' ? 'Confirmée' :
                           selectedOrder.status === 'shipped' ? 'Expédiée' :
                           selectedOrder.status === 'delivered' ? 'Livrée' :
                           selectedOrder.status === 'cancelled' ? 'Annulée' : selectedOrder.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Montant</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedOrder.total_amount ? `${selectedOrder.total_amount.toLocaleString()} ${selectedOrder.currency}` : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Dates</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date de commande</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedOrder.order_date).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Livraison prévue</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedOrder.expected_delivery ? new Date(selectedOrder.expected_delivery).toLocaleDateString('fr-FR') : 'Non définie'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Livraison effective</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedOrder.actual_delivery ? new Date(selectedOrder.actual_delivery).toLocaleDateString('fr-FR') : 'Non livrée'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewOrderModal(false);
                    handleEditOrder(selectedOrder);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setShowViewOrderModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de commande */}
      {showEditOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Modifier la commande</h3>
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de commande
                </label>
                <select
                  value={editOrderForm.order_type}
                  onChange={(e) => handleEditInputChange('order_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="purchase">Achat</option>
                  <option value="rental">Location</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="import">Import</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={editOrderForm.status}
                  onChange={(e) => handleEditInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editOrderForm.total_amount}
                  onChange={(e) => handleEditInputChange('total_amount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison prévue
                </label>
                <input
                  type="date"
                  value={editOrderForm.expected_delivery}
                  onChange={(e) => handleEditInputChange('expected_delivery', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de livraison effective
                </label>
                <input
                  type="date"
                  value={editOrderForm.actual_delivery}
                  onChange={(e) => handleEditInputChange('actual_delivery', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editOrderForm.notes}
                  onChange={(e) => handleEditInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Notes sur la commande..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditOrderModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détail des commandes entrantes */}
      {showIncomingOrderModal && selectedIncomingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Détails de la commande entrante</h3>
              <button
                onClick={() => setShowIncomingOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations de la machine */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Machine concernée</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    {selectedIncomingOrder.machine?.images?.[0] && (
                      <img 
                        src={selectedIncomingOrder.machine.images[0]} 
                        alt={selectedIncomingOrder.machine.name}
                        className="w-16 h-16 rounded-lg mr-4 object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-lg">{selectedIncomingOrder.machine?.name || 'Machine inconnue'}</div>
                      <div className="text-gray-600">{selectedIncomingOrder.machine?.brand} {selectedIncomingOrder.machine?.model}</div>
                      <div className="text-gray-500 text-sm">{selectedIncomingOrder.machine?.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedIncomingOrder.machine?.price?.toLocaleString()} MAD
                    </div>
                    <div className="text-gray-500">Prix de vente</div>
                  </div>
                </div>
              </div>

              {/* Informations de l'acheteur */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informations de l'acheteur</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">{selectedIncomingOrder.buyer?.firstname} {selectedIncomingOrder.buyer?.lastname}</div>
                    <div className="text-gray-600">{selectedIncomingOrder.buyer?.company || 'Particulier'}</div>
                    <div className="text-gray-500 text-sm">{selectedIncomingOrder.buyer?.email}</div>
                    <div className="text-gray-500 text-sm">{selectedIncomingOrder.buyer?.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedIncomingOrder.amount?.toLocaleString()} MAD
                    </div>
                    <div className="text-gray-500">Offre proposée</div>
                    <div className="text-sm text-gray-500">
                      {selectedIncomingOrder.amount > selectedIncomingOrder.machine?.price ? '✅ Au-dessus du prix' : 
                       selectedIncomingOrder.amount < selectedIncomingOrder.machine?.price ? '⚠️ En dessous du prix' : 
                       '💰 Prix égal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de l'offre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Détails de l'offre</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Statut</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOfferStatusColor(selectedIncomingOrder.status)}`}>
                          {getOfferStatusText(selectedIncomingOrder.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date de l'offre</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedIncomingOrder.created_at).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Différence de prix</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedIncomingOrder.amount && selectedIncomingOrder.machine?.price ? 
                          `${(selectedIncomingOrder.amount - selectedIncomingOrder.machine.price).toLocaleString()} MAD` : 
                          'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Message de l'acheteur</h4>
                  {selectedIncomingOrder.message ? (
                    <div className="bg-white border border-gray-200 p-3 rounded-md">
                      <p className="text-sm text-gray-700">{selectedIncomingOrder.message}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-sm text-gray-500 italic">Aucun message</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedIncomingOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptOffer(selectedIncomingOrder.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accepter l'offre
                      </button>
                      <button
                        onClick={() => handleRejectOffer(selectedIncomingOrder.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Refuser l'offre
                      </button>
                    </>
                  )}
                  {selectedIncomingOrder.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => handleSendInvoice(selectedIncomingOrder.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Envoyer facture
                      </button>
                      <button
                        onClick={() => handleMarkShipped(selectedIncomingOrder.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Marquer expédié
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowIncomingOrderModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Maintenance
function MaintenanceTab({ interventions, equipment, onRefresh }: { interventions: MaintenanceIntervention[], equipment: any[], onRefresh: () => Promise<void> }) {
  const [showAddInterventionModal, setShowAddInterventionModal] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    equipment_id: '',
    intervention_type: 'preventive' as 'preventive' | 'corrective' | 'emergency' | 'inspection',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    duration_hours: 8,
    technician_name: '',
    cost: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIntervention = () => {
    setShowAddInterventionModal(true);
  };

  const handleInterventionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Récupérer le profil Pro pour obtenir le client_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const proProfile = await getProClientProfile();
      if (!proProfile) throw new Error('Profil Pro non trouvé');

          // Préparer les données de l'intervention
    const interventionData = {
      ...interventionForm,
      client_id: proProfile.id,
      status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
      equipment_id: null // Champ optionnel pour les interventions générales
    };

      // Créer l'intervention
      const newIntervention = await createMaintenanceIntervention(interventionData);
      
      if (newIntervention) {
        console.log('✅ Intervention de maintenance créée:', newIntervention);
        setShowAddInterventionModal(false);
        setInterventionForm({
          equipment_id: '',
          intervention_type: 'preventive',
          priority: 'normal',
          description: '',
          scheduled_date: new Date().toISOString().split('T')[0],
          duration_hours: 8,
          technician_name: '',
          cost: 0
        });
        
        // Recharger les données
        await onRefresh();
        
        // Notification de succès
        alert('Intervention de maintenance planifiée avec succès !');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'intervention:', error);
      alert('Erreur lors de la planification de l\'intervention');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setInterventionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance</h2>
        <button 
          onClick={handleAddIntervention}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Planifier une intervention
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interventions.map((intervention) => {
          // Trouver l'équipement correspondant
          const relatedEquipment = equipment.find(eq => eq.id === intervention.equipment_id);
          
          return (
            <div key={intervention.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {intervention.intervention_type}
                  </h3>
                  {relatedEquipment && (
                    <p className="text-sm font-medium text-orange-600 mb-1">
                      🏗️ {relatedEquipment.name} - {relatedEquipment.brand} {relatedEquipment.model}
                    </p>
                  )}
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
        );
        })}
      </div>

      {/* Message si aucune intervention */}
      {interventions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Aucune intervention de maintenance
          </div>
          <p className="text-gray-400">
            Planifiez votre première intervention de maintenance
          </p>
        </div>
      )}

      {/* Modal d'ajout d'intervention */}
      {showAddInterventionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Planifier une Intervention</h3>
              <button
                onClick={() => setShowAddInterventionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleInterventionSubmit} className="space-y-6">
              {/* Sélection de l'équipement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement concerné *
                </label>
                <select
                  value={interventionForm.equipment_id}
                  onChange={(e) => handleInputChange('equipment_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} - {eq.brand} {eq.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'intervention *
                  </label>
                  <select
                    value={interventionForm.intervention_type}
                    onChange={(e) => handleInputChange('intervention_type', e.target.value as 'preventive' | 'corrective' | 'emergency' | 'inspection')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="preventive">Préventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="emergency">Urgence</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={interventionForm.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Faible</option>
                    <option value="normal">Normale</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date programmée *
                  </label>
                  <input
                    type="date"
                    value={interventionForm.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    value={interventionForm.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'intervention *
                </label>
                <textarea
                  value={interventionForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                  placeholder="Décrivez l'intervention à effectuer..."
                  required
                />
              </div>

              {/* Informations techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technicien responsable
                  </label>
                  <input
                    type="text"
                    value={interventionForm.technician_name}
                    onChange={(e) => handleInputChange('technician_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nom du technicien"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coût estimé (€)
                  </label>
                  <input
                    type="number"
                    value={interventionForm.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddInterventionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Planification en cours...
                    </>
                  ) : (
                    'Planifier l\'intervention'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Documents
function DocumentsTab({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentData, setDocumentData] = useState({
    title: '',
    document_type: 'manual',
    is_public: false
  });

  const { permissions } = usePermissions();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('technical_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des documents:', error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !documentData.title) {
      alert('Veuillez sélectionner un fichier et saisir un titre');
      return;
    }

    try {
      setUploading(true);

      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert('Erreur: Utilisateur non connecté');
        return;
      }

      // Upload du fichier vers Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        alert('Erreur lors de l\'upload du fichier: ' + uploadError.message);
        return;
      }

      // Créer l'entrée dans la base de données
      const { error: dbError } = await supabase
        .from('technical_documents')
        .insert({
          title: documentData.title,
          document_type: documentData.document_type,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          is_public: documentData.is_public,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Erreur lors de la création du document:', dbError);
        alert('Erreur lors de la création du document: ' + dbError.message);
        return;
      }

      // Succès
      alert('Document ajouté avec succès !');
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentData({ title: '', document_type: 'manual', is_public: false });
      await loadDocuments();
      await onRefresh();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error } = await supabase
        .from('technical_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
      } else {
        await loadDocuments();
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      // Vérifier si le bucket existe et essayer le téléchargement
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) {
        // Si le bucket n'existe pas ou erreur, afficher les infos du document
        console.log('Bucket Storage non configuré, affichage des informations:', error);
        alert(`📄 Informations du document "${doc.title}"\n\n` +
              `📁 Fichier: ${doc.file_path}\n` +
              `📏 Taille: ${Math.round(doc.file_size / 1024)} KB\n` +
              `📋 Type: ${doc.mime_type}\n\n` +
              `ℹ️  Pour télécharger le fichier réel, configurez le bucket Storage "documents" dans Supabase.`);
        return;
      }

      // Téléchargement réussi - créer le lien de téléchargement
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Téléchargement réussi:', doc.title);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement: ' + (error as Error).message);
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return '📖';
      case 'certificate': return '📜';
      case 'warranty': return '🛡️';
      case 'invoice': return '🧾';
      case 'maintenance_report': return '🔧';
      default: return '📄';
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'manual': return 'Manuel';
      case 'certificate': return 'Certificat';
      case 'warranty': return 'Garantie';
      case 'invoice': return 'Facture';
      case 'maintenance_report': return 'Rapport maintenance';
      default: return 'Document';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Chargement des documents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Ajouter un document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Aucun document disponible pour le moment.</p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ajouter votre premier document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibilité
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
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getDocumentTypeIcon(doc.document_type)}</span>
                        <span className="text-sm text-gray-900">{getDocumentTypeText(doc.document_type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.is_public ? 'Public' : 'Privé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {(permissions?.isAdmin || permissions?.isManager) && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Ajouter un document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du document *
                </label>
                <input
                  type="text"
                  value={documentData.title}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Titre du document"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de document
                </label>
                <select
                  value={documentData.document_type}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="manual">Manuel</option>
                  <option value="certificate">Certificat</option>
                  <option value="warranty">Garantie</option>
                  <option value="invoice">Facture</option>
                  <option value="maintenance_report">Rapport maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={documentData.is_public}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Document public</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !documentData.title}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upload...
                    </>
                  ) : (
                    'Uploader'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Utilisateurs
function UsersTab() {
  // Vérifier les permissions
  const { permissions } = usePermissions();

  // Si l'utilisateur n'est pas admin, afficher un message d'accès refusé
  if (!permissions?.isAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Accès refusé</h3>
              <p className="text-red-700 mt-1">
                Vous n'avez pas les permissions nécessaires pour accéder à cette section.
                Seuls les administrateurs peuvent gérer les utilisateurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({ email: '', role: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Charger les invitations au montage du composant
  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const invitationsData = await getUserInvitations();
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');

    try {
      const success = await inviteClientUser(inviteFormData.email, inviteFormData.role);
      if (success) {
        setInviteSuccess(true);
        setInviteFormData({ email: '', role: '' });
        // Recharger les invitations après une nouvelle invitation
        await loadInvitations();
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(false);
        }, 2000);
      } else {
        setInviteError('Erreur lors de l\'invitation. Veuillez réessayer.');
      }
    } catch (error) {
      setInviteError('Erreur lors de l\'invitation. Veuillez réessayer.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) return;

    try {
      const success = await cancelUserInvitation(invitationId);
      if (success) {
        await loadInvitations(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInviteFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'expired': return 'Expirée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'technician': return 'Technicien';
      case 'viewer': return 'Lecteur';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Utilisateurs</h2>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Inviter un utilisateur
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des utilisateurs</h3>
          <p className="text-gray-600">Invitez des utilisateurs à accéder à l'espace Pro avec différents niveaux de permissions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-orange-900">Administrateur</h4>
            </div>
            <p className="text-sm text-orange-700 mb-2">Accès complet à toutes les fonctionnalités</p>
            <ul className="text-xs text-orange-600 space-y-1">
              <li>• Gestion complète des utilisateurs</li>
              <li>• Accès à tous les modules</li>
              <li>• Configuration du compte</li>
              <li>• Rapports et analytics</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-orange-900">Manager</h4>
            </div>
            <p className="text-sm text-orange-700 mb-2">Gestion opérationnelle</p>
            <ul className="text-xs text-orange-600 space-y-1">
              <li>• Gestion des équipements</li>
              <li>• Suivi des commandes</li>
              <li>• Planification maintenance</li>
              <li>• Gestion des documents</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-orange-900">Technicien</h4>
            </div>
            <p className="text-sm text-orange-700 mb-2">Interventions techniques</p>
            <ul className="text-xs text-orange-600 space-y-1">
              <li>• Interventions de maintenance</li>
              <li>• Diagnostic équipements</li>
              <li>• Rapports techniques</li>
              <li>• Consultation documents</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-orange-900">Lecteur</h4>
            </div>
            <p className="text-sm text-orange-700 mb-2">Consultation uniquement</p>
            <ul className="text-xs text-orange-600 space-y-1">
              <li>• Consultation équipements</li>
              <li>• Lecture des documents</li>
              <li>• Suivi des commandes</li>
              <li>• Pas de modifications</li>
            </ul>
          </div>
        </div>

        {/* Liste des invitations */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invitations envoyées</h3>
          
          {loadingInvitations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-2 text-gray-600">Chargement des invitations...</span>
            </div>
          ) : invitations.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucune invitation envoyée</p>
              <p className="text-sm text-gray-500 mt-1">Les invitations que vous envoyez apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{invitation.email}</p>
                          <p className="text-sm text-gray-600">
                            Rôle: {getRoleText(invitation.role)} • 
                            Invitée le {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invitation.status)}`}>
                            {getStatusText(invitation.status)}
                          </span>
                          {invitation.status === 'pending' && (
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                      {invitation.status === 'pending' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Expire le {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Inviter un utilisateur</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteFormData.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="utilisateur@entreprise.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle *
                  </label>
                  <select
                    required
                    value={inviteFormData.role}
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

                {inviteError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{inviteError}</p>
                  </div>
                )}

                {inviteSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-600">Utilisateur invité avec succès !</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {inviteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Invitation...
                    </>
                  ) : (
                    'Inviter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Notifications
function NotificationsTab({ notifications }: { notifications: ClientNotification[] }) {
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<ClientNotification | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Vérifier les permissions
  const { permissions } = usePermissions();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setLoading(true);
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        // Recharger les données du dashboard pour mettre à jour les notifications
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      alert('Erreur lors du marquage de la notification');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      // Marquer toutes les notifications non lues comme lues
      const promises = unreadNotifications.map(n => markNotificationAsRead(n.id));
      await Promise.all(promises);
      
      // Recharger les données du dashboard
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      alert('Erreur lors du marquage des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (notification: ClientNotification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  const handleNavigateToEntity = (notification: ClientNotification) => {
    if (!notification.related_entity_type || !notification.related_entity_id) {
      alert('Aucune entité liée à cette notification');
      return;
    }

    // Marquer comme lu avant la navigation
    handleMarkAsRead(notification.id);

    // Naviguer vers l'entité liée
    switch (notification.related_entity_type) {
      case 'equipment':
        // Aller vers l'onglet équipements
        const equipmentTab = document.querySelector('[data-tab="equipment"]') as HTMLElement;
        if (equipmentTab) {
          equipmentTab.click();
        }
        break;
      case 'order':
        // Aller vers l'onglet commandes
        const ordersTab = document.querySelector('[data-tab="orders"]') as HTMLElement;
        if (ordersTab) {
          ordersTab.click();
        }
        break;
      case 'maintenance':
        // Aller vers l'onglet maintenance
        const maintenanceTab = document.querySelector('[data-tab="maintenance"]') as HTMLElement;
        if (maintenanceTab) {
          maintenanceTab.click();
        }
        break;
      default:
        alert('Type d\'entité non reconnu');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟡';
      case 'normal':
        return '🔵';
      case 'low':
        return '⚪';
      default:
        return '🔵';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance_due':
        return '🔧';
      case 'order_update':
        return '📦';
      case 'diagnostic_alert':
        return '⚠️';
      case 'warranty_expiry':
        return '🛡️';
      default:
        return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Marquage...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Marquer tout comme lu</span>
              </>
            )}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${
              notification.priority === 'urgent' ? 'border-red-500' :
              notification.priority === 'high' ? 'border-yellow-500' :
              notification.priority === 'normal' ? 'border-blue-500' :
              'border-gray-300'
            } hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getTypeIcon(notification.type)}</span>
                    <span className="text-sm">{getPriorityIcon(notification.priority)}</span>
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                      title="Marquer comme lu"
                    >
                      <span className="text-sm">✓</span>
                    </button>
                  )}
                  {notification.related_entity_type && (
                    <button
                      onClick={() => handleNavigateToEntity(notification)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors disabled:opacity-50"
                      title="Voir les détails"
                    >
                      <span className="text-sm">👁️</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(notification)}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Voir les détails"
                  >
                    <span className="text-sm">ℹ️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la notification</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900 mt-1">
                  {getTypeIcon(selectedNotification.type)} {selectedNotification.type.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Priorité</label>
                <p className="text-sm text-gray-900 mt-1">
                  {getPriorityIcon(selectedNotification.priority)} {selectedNotification.priority}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <p className="text-sm text-gray-900 mt-1">{selectedNotification.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 mt-1">{selectedNotification.message}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de création</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedNotification.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              
              {selectedNotification.related_entity_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entité liée</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedNotification.related_entity_type} - {selectedNotification.related_entity_id}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedNotification.is_read ? '✅ Lu' : '🆕 Non lu'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              {selectedNotification.related_entity_type && (
                <button
                  onClick={() => {
                    handleNavigateToEntity(selectedNotification);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Voir l'entité
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Messages
function MessagesTab({ messages, onRefresh }: { messages: any[], onRefresh: () => Promise<void> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  

  
  // Vérifier les permissions
  const { permissions } = usePermissions();

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setShowViewMessageModal(true);
  };

  const handleReplyToMessage = (message: any) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
    setReplyText('');
  };

  const handleArchiveMessageModal = (message: any) => {
    setSelectedMessage(message);
    setShowArchiveModal(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    setReplyLoading(true);
    try {
      // Créer la réponse
      const { error: replyError } = await supabase
        .from('messages')
        .insert({
          subject: `Re: ${selectedMessage.subject}`,
          content: replyText,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: selectedMessage.sender_id,
          parent_message_id: selectedMessage.id,
          status: 'sent'
        });

      if (replyError) {
        console.error('Erreur envoi réponse:', replyError);
        return;
      }

      // Marquer le message original comme répondu
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'replied' })
        .eq('id', selectedMessage.id);

      if (updateError) {
        console.error('Erreur mise à jour statut:', updateError);
      }

      setShowReplyModal(false);
      setReplyText('');
      setSelectedMessage(null);
      await onRefresh();
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur marquage lu:', error);
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Erreur suppression message:', error);
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur suppression message:', error);
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      setArchiveLoading(true);
      const { error } = await supabase
        .from('messages')
        .update({ status: 'archived' })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur archivage message:', error);
      } else {
        await onRefresh();
        setShowArchiveModal(false);
      }
    } catch (error) {
      console.error('Erreur archivage message:', error);
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleArchiveSelectedMessages = async () => {
    const selectedMessages = filteredMessages.filter(msg => msg.selected);
    if (selectedMessages.length === 0) return;

    try {
      setArchiveLoading(true);
      const messageIds = selectedMessages.map(msg => msg.id);
      
      const { error } = await supabase
        .from('messages')
        .update({ status: 'archived' })
        .in('id', messageIds);

      if (error) {
        console.error('Erreur archivage messages:', error);
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur archivage messages:', error);
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleDeleteSelectedMessages = async () => {
    const selectedMessages = filteredMessages.filter(msg => msg.selected);
    if (selectedMessages.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedMessages.length} message(s) ?`)) return;

    try {
      const messageIds = selectedMessages.map(msg => msg.id);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', messageIds);

      if (error) {
        console.error('Erreur suppression messages:', error);
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur suppression messages:', error);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'read': return 'Lu';
      case 'replied': return 'Répondu';
      case 'sent': return 'Envoyé';
      case 'archived': return 'Archivé';
      default: return 'Inconnu';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
            <option value="sent">Envoyés</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
        

      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <input
                      type="checkbox"
                      onChange={(e) => {
                        // Fonctionnalité de sélection multiple non implémentée pour l'instant
                        console.log('Sélection multiple:', e.target.checked);
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expéditeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
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
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={(e) => {
                        // Fonctionnalité de sélection individuelle non implémentée pour l'instant
                        console.log('Sélection message:', message.id, e.target.checked);
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {message.sender_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.sender_email}
                      </div>
                      {message.sender_phone && (
                        <div className="text-sm text-gray-500">
                          {message.sender_phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {message.machine ? (
                      <div className="flex items-center">
                        {message.machine.images && message.machine.images[0] && (
                          <img
                            src={message.machine.images[0]}
                            alt={message.machine.name}
                            className="h-8 w-8 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {message.machine.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {message.machine.brand} {message.machine.model}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Équipement supprimé</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {message.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {getStatusText(message.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                          <div className="flex space-x-1">
                        {/* Onglet Voir */}
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-t-lg border border-orange-200 hover:bg-orange-200 transition-colors"
                          title="Voir le message"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {/* Onglet Répondre */}
                        <button
                          onClick={() => handleReplyToMessage(message)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-t-lg border border-orange-200 hover:bg-orange-200 transition-colors"
                          title="Répondre au message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        
                        {/* Onglet Archiver */}
                        <button
                          onClick={() => handleArchiveMessageModal(message)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-t-lg border border-orange-200 hover:bg-orange-200 transition-colors"
                          title="Archiver le message"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        
                        {/* Onglet Supprimer */}
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-t-lg border border-orange-200 hover:bg-orange-200 transition-colors"
                          title="Supprimer le message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de visualisation du message */}
      {showViewMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Détails du message</h2>
              <button
                onClick={() => setShowViewMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  De : {selectedMessage.sender_name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Email : {selectedMessage.sender_email}
                </p>
                {selectedMessage.sender_phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    Téléphone : {selectedMessage.sender_phone}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Date : {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>

              {selectedMessage.machine && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Équipement concerné</h4>
                  <div className="flex items-center">
                    {selectedMessage.machine.images && selectedMessage.machine.images[0] && (
                      <img
                        src={selectedMessage.machine.images[0]}
                        alt={selectedMessage.machine.name}
                        className="h-12 w-12 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedMessage.machine.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedMessage.machine.brand} {selectedMessage.machine.model}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowViewMessageModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              {(permissions?.isAdmin || permissions?.isManager || permissions?.isTechnician) && (
                <button
                  onClick={() => {
                    setShowViewMessageModal(false);
                    handleReplyToMessage(selectedMessage);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Répondre
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de réponse */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Répondre au message</h2>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Répondre à : {selectedMessage.sender_name}
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Message original : {selectedMessage.message.substring(0, 100)}...
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse *
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tapez votre réponse..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={replyLoading || !replyText.trim()}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {replyLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    'Envoyer la réponse'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'archivage */}
      {showArchiveModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Archiver le message</h2>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <Archive className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Confirmer l'archivage</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Êtes-vous sûr de vouloir archiver ce message ? Il sera déplacé dans les archives.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 font-medium">Message :</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedMessage.message.substring(0, 150)}...
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleArchiveMessage(selectedMessage.id)}
                  disabled={archiveLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {archiveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Archivage...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal pour ajouter un nouvel élément
interface NewItemModalProps {
  type: 'equipment' | 'order' | 'maintenance' | 'user' | 'document';
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
      case 'document': return 'Nouveau document';
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

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du document *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de document *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('document_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="manual">Manuel</option>
                <option value="specification">Spécification</option>
                <option value="contract">Contrat</option>
                <option value="invoice">Facture</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier *
              </label>
              <input
                type="file"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('file', e.target.files?.[0])}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                Document public
              </label>
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


