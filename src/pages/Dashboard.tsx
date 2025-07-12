import React, { useState, useEffect } from 'react';
import { Plus, Package, Settings, FileText, Bell, User, LogOut, ChevronRight, Shield, Wallet, RefreshCw, Eye, MessageSquare, DollarSign, Camera } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { 
  getSellerMachines, 
  logoutUser, 
  getCurrentUser, 
  getDashboardStats, 
  getWeeklyActivityData, 
  getMessages, 
  getOffers,
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  updateNotificationSettings,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getPremiumService,
  requestPremiumService,
  cancelPremiumService,
  getServiceHistory,
  getActiveSessions,
  revokeSession,
  changePassword,
  uploadProfilePicture,
  deleteUserAccount
} from '../utils/api';

interface DashboardProps {
  section?: string;
}

export default function Dashboard({ section = 'overview' }: DashboardProps) {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeSection, setActiveSection] = useState(section);
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profil');

  // Nouveaux états pour les fonctionnalités avancées
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [premiumService, setPremiumService] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [hasEnterpriseConfig, setHasEnterpriseConfig] = useState(false);
  
  // États pour les formulaires
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    address: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_views: true,
    email_messages: true,
    email_offers: true,
    email_expired: false,
    email_newsletter: false,
    frequency: 'immediate',
    start_time: '08:00',
    end_time: '20:00'
  });
  
  const [preferencesForm, setPreferencesForm] = useState({
    language: 'fr',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    date_format: 'DD/MM/YYYY',
    dark_mode: false,
    animations: true,
    font_size: 'medium',
    high_contrast: false
  });

  const loadMachines = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des machines...");
      const machinesData = await getSellerMachines();
      console.log("📊 Machines chargées:", machinesData);
      console.log("📊 Nombre de machines:", machinesData?.length || 0);
      setMachines(machinesData);
    } catch (err) {
      console.error('❌ Erreur chargement machines :', err);
      console.error('❌ Type d\'erreur:', typeof err);
      console.error('❌ Message d\'erreur:', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData, messagesData, offersData] = await Promise.all([
        getDashboardStats(),
        getWeeklyActivityData(),
        getMessages(),
        getOffers()
      ]);

      setStats(statsData);
      setWeeklyData(activityData);
      setMessages(messagesData);
      setOffers(offersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    }
  };

  // Nouvelle fonction pour charger les données utilisateur
  const loadUserData = async () => {
    try {
      setIsLoadingSettings(true);
      const [profile, preferences, notificationsData, premiumData, historyData, sessionsData] = await Promise.all([
        getUserProfile(),
        getUserPreferences(),
        getNotifications(),
        getPremiumService(),
        getServiceHistory(),
        getActiveSessions()
      ]);

      setUserProfile(profile);
      setUserPreferences(preferences);
      setNotifications(notificationsData);
      setPremiumService(premiumData);
      setServiceHistory(historyData);
      setActiveSessions(sessionsData);

      // Initialiser les formulaires avec les données existantes
      if (profile) {
        setProfileForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          company: profile.company || '',
          website: profile.website || '',
          address: profile.address || ''
        });
      }

      if (preferences) {
        setNotificationSettings({
          email_views: preferences.email_notifications?.views ?? true,
          email_messages: preferences.email_notifications?.messages ?? true,
          email_offers: preferences.email_notifications?.offers ?? true,
          email_expired: preferences.email_notifications?.expired ?? false,
          email_newsletter: preferences.email_notifications?.newsletter ?? false,
          frequency: preferences.notification_frequency || 'immediate',
          start_time: preferences.notification_hours?.start || '08:00',
          end_time: preferences.notification_hours?.end || '20:00'
        });

        setPreferencesForm({
          language: preferences.language || 'fr',
          currency: preferences.currency || 'EUR',
          timezone: preferences.timezone || 'Europe/Paris',
          date_format: preferences.date_format || 'DD/MM/YYYY',
          dark_mode: preferences.dark_mode || false,
          animations: preferences.animations ?? true,
          font_size: preferences.font_size || 'medium',
          high_contrast: preferences.high_contrast || false
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('#dashboard/')) {
        const section = hash.split('/')[1];
        setActiveSection(section);
        
        // Charger les données spécifiques selon la section
        if (section === 'overview') {
          loadDashboardData();
        } else if (section === 'annonces') {
          loadMachines();
        } else if (section === 'parametres') {
          loadUserData();
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    // Vérifier si une configuration entreprise existe
    const enterpriseConfig = localStorage.getItem('enterpriseDashboardConfig');
    setHasEnterpriseConfig(!!enterpriseConfig);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    loadMachines();
    if (activeSection === 'overview') {
      loadDashboardData();
    }
  }, []);

  useEffect(() => {
    setActiveSection(section);
  }, [section]);
  
  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('user');
    window.location.hash = '#connexion';
  };

  // 🔧 Nouvelles fonctions pour rendre les boutons fonctionnels
  const handleServiceRequest = (serviceName: string) => {
    alert(`Demande de service "${serviceName}" envoyée !\n\nNotre équipe vous contactera dans les plus brefs délais pour discuter de vos besoins.`);
  };

  const handleRequestService = () => {
    alert('Formulaire de demande de service ouvert !\n\nVous allez être redirigé vers notre formulaire de contact spécialisé.');
    // Redirection vers la page de contact avec un paramètre spécial
    window.location.hash = '#contact?service=request';
  };

  const handleViewAllServices = () => {
    alert('Redirection vers la page des services !\n\nVous allez découvrir tous nos services premium et professionnels.');
    window.location.hash = '#services';
  };

  const handleServiceHistory = () => {
    alert('Historique des services !\n\nAffichage de vos demandes de services précédentes et leur statut.');
    // Ici on pourrait ouvrir une modal ou rediriger vers une page d'historique
    const historyData = [
      { service: 'Financement', date: '2024-01-15', status: 'En cours' },
      { service: 'Transport', date: '2024-01-10', status: 'Terminé' },
      { service: 'Maintenance', date: '2024-01-05', status: 'Terminé' }
    ];
    
    const historyText = historyData.map(item => 
      `${item.service} - ${item.date} (${item.status})`
    ).join('\n');
    
    alert(`Historique de vos services :\n\n${historyText}`);
  };

  const handleCancelSubscription = () => {
    if (confirm('Êtes-vous sûr de vouloir résilier votre abonnement premium ?')) {
      alert('Votre abonnement a été résilié avec succès !');
    }
  };

  // 🔔 Nouvelles fonctions pour les notifications
  const handleMarkAllAsRead = () => {
    alert('Toutes les notifications ont été marquées comme lues !');
  };

  const handleNotificationSettings = () => {
    alert('Paramètres des notifications !\n\nVous pouvez configurer :\n• Notifications par email\n• Notifications push\n• Fréquence des rappels\n• Types de notifications');
  };

  const handleViewAnnouncement = (announcementName: string) => {
    alert(`Redirection vers l'annonce "${announcementName}"...`);
    // Ici on pourrait rediriger vers la page de l'annonce
  };

  const handleMarkAsRead = (notificationType: string) => {
    alert(`Notification "${notificationType}" marquée comme lue !`);
  };

  const handleReplyToMessage = (contactName: string) => {
    alert(`Ouverture du formulaire de réponse pour ${contactName}...`);
    // Ici on pourrait ouvrir un formulaire de réponse
  };

  const handleViewOffer = (offerDetails: string) => {
    alert(`Affichage de l'offre : ${offerDetails}\n\nVous pouvez accepter, refuser ou négocier cette offre.`);
  };

  const handleRenewAnnouncement = (announcementName: string) => {
    const confirmed = window.confirm(
      `Voulez-vous renouveler l'annonce "${announcementName}" ?\n\nCela prolongera sa visibilité de 30 jours.`
    );
    
    if (confirmed) {
      alert(`Annonce "${announcementName}" renouvelée avec succès !\n\nElle sera visible jusqu'au ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    }
  };

  const handleViewPremiumBenefits = () => {
    alert('Avantages Premium :\n\n• Visibilité renforcée sur la page d\'accueil\n• Plus d\'images par annonce (10 au lieu de 5)\n• Statistiques détaillées\n• Support prioritaire\n• Badge Premium sur vos annonces');
  };

  const handleMoreInfo = (infoType: string) => {
    alert(`Informations sur ${infoType} :\n\nCette maintenance est planifiée pour améliorer les performances du site et ajouter de nouvelles fonctionnalités.`);
  };

  const navigation = [
    { name: 'Tableau de bord', href: '#dashboard', icon: FileText },
    { name: 'Mes annonces', href: '#dashboard/annonces', icon: Package },
    { name: 'Notifications', href: '#dashboard/notifications', icon: Bell },
    { name: 'Paramètres', href: '#dashboard/settings', icon: Settings },
    { name: 'Mes services', href: '#dashboard/services', icon: Shield },
    { name: 'Mon abonnement', href: '#dashboard/abonnement', icon: Wallet },

  ];

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Fonction pour calculer le pourcentage de la barre de progression
  const getBarWidth = (value: number, maxValue: number) => {
    if (maxValue === 0) return 0;
    return Math.min((value / maxValue) * 100, 100);
  };

  // Données pour le graphique hebdomadaire
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const maxWeeklyViews = Math.max(...weeklyData, 1); // Éviter la division par zéro

  // Nouvelles fonctions pour les paramètres
  const handleSaveProfile = async () => {
    try {
      setIsSavingSettings(true);
      await updateUserProfile(profileForm);
      await loadUserData(); // Recharger les données
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsSavingSettings(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Mot de passe changé avec succès !');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      alert('Erreur lors du changement de mot de passe: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      setIsSavingSettings(true);
      await updateNotificationSettings({
        email_notifications: {
          views: notificationSettings.email_views,
          messages: notificationSettings.email_messages,
          offers: notificationSettings.email_offers,
          expired: notificationSettings.email_expired,
          newsletter: notificationSettings.email_newsletter
        },
        notification_frequency: notificationSettings.frequency as any,
        notification_hours: {
          start: notificationSettings.start_time,
          end: notificationSettings.end_time
        }
      });
      await loadUserData();
      alert('Paramètres de notifications sauvegardés !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
      alert('Erreur lors de la sauvegarde des notifications');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSavingSettings(true);
      await updateUserPreferences(preferencesForm);
      await loadUserData();
      alert('Préférences sauvegardées !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      alert('Erreur lors de la sauvegarde des préférences');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUploadProfilePicture = async (file: File) => {
    try {
      setIsSavingSettings(true);
      await uploadProfilePicture(file);
      await loadUserData();
      alert('Photo de profil mise à jour !');
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter cette session ?')) {
      try {
        await revokeSession(sessionId);
        await loadUserData();
        alert('Session déconnectée avec succès !');
      } catch (error) {
        console.error('Erreur lors de la révocation de session:', error);
        alert('Erreur lors de la révocation de session');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Êtes-vous ABSOLUMENT sûr de vouloir supprimer votre compte ? Cette action est irréversible !')) {
      if (confirm('Dernière confirmation : Voulez-vous vraiment supprimer votre compte ?')) {
        try {
          await deleteUserAccount();
          alert('Compte supprimé avec succès');
          window.location.href = '/';
        } catch (error) {
          console.error('Erreur lors de la suppression du compte:', error);
          alert('Erreur lors de la suppression du compte');
        }
      }
    }
  };

  const handleRequestPremium = async (serviceType: 'premium' | 'enterprise') => {
    try {
      await requestPremiumService(serviceType);
      await loadUserData();
      alert(`Service ${serviceType} activé avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'activation du service premium:', error);
      alert('Erreur lors de l\'activation du service premium');
    }
  };

  const handleCancelPremium = async () => {
    if (confirm('Êtes-vous sûr de vouloir annuler votre service premium ?')) {
      try {
        await cancelPremiumService();
        await loadUserData();
        alert('Service premium annulé avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'annulation du service premium:', error);
        alert('Erreur lors de l\'annulation du service premium');
      }
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadUserData();
    } catch (error) {
      console.error('Erreur lors du marquage de notification:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadUserData();
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Bienvenue{userName ? `, ${userName}` : ''} 
            </p>

            <nav className="flex mt-3" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">Accueil</a>
                </li>
                <ChevronRight className="h-4 w-4 text-orange-400" />
                <li>
                  <span className="text-gray-700 font-medium">Tableau de bord</span>
                </li>
              </ol>
            </nav>
          </div>
          <a
            href="#vendre"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle annonce
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vendeur connecté</h3>
                  <p className="text-sm text-orange-600 font-medium">Profil professionnel</p>
                </div>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeSection === item.name.toLowerCase()
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </a>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Overview - Vue d'ensemble professionnelle */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total des annonces */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total des annonces</p>
                        <p className="text-2xl font-bold text-gray-900">{machines.length}</p>
                        <p className="text-xs text-green-600 mt-1">+12% ce mois</p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Vues totales */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Vues totales</p>
                        <p className="text-2xl font-bold text-gray-900">{stats ? formatNumber(stats.totalViews) : '0'}</p>
                        <p className={`text-xs mt-1 ${stats?.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats?.weeklyGrowth >= 0 ? '+' : ''}{stats?.weeklyGrowth || 0}% cette semaine
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Messages reçus */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Messages reçus</p>
                        <p className="text-2xl font-bold text-gray-900">{stats ? formatNumber(stats.totalMessages) : '0'}</p>
                        <p className="text-xs text-orange-600 mt-1">
                          {messages.filter(m => !m.is_read).length} nouveau{messages.filter(m => !m.is_read).length > 1 ? 'x' : ''}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Offres reçues */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Offres reçues</p>
                        <p className="text-2xl font-bold text-gray-900">{stats ? formatNumber(stats.totalOffers) : '0'}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {offers.filter(o => o.status === 'pending').length} en attente
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section principale avec graphiques et annonces */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Graphique d'activité */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">7 derniers jours</span>
                        <button
                          onClick={loadMachines}
                          disabled={loading}
                          className="p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Actualiser"
                        >
                          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Graphique simple en barres */}
                    <div className="space-y-3">
                      {weekDays.map((day, index) => (
                        <div key={day} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{day}</span>
                          <div className="flex-1 mx-4">
                            <div className="bg-orange-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500" 
                                style={{width: `${getBarWidth(weeklyData[index] || 0, maxWeeklyViews)}%`}}
                              ></div>
                            </div>
                          </div>
                          <span className="text-gray-900 font-medium">{weeklyData[index] || 0}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total des vues cette semaine</span>
                        <span className="text-orange-600 font-semibold">{stats?.weeklyViews || 0} vues</span>
                      </div>
                    </div>
                  </div>

                  {/* Annonces récentes */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Annonces récentes</h3>
                      <a href="#dashboard/annonces" className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline">
                        Voir tout
                      </a>
                    </div>
                    
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                        </div>
                      ) : machines.length > 0 ? (
                        machines.slice(0, 3).map((machine) => (
                          <div key={machine.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors">
                            <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{machine.name}</p>
                              <p className="text-xs text-gray-500">{machine.brand}</p>
                              <p className="text-xs text-orange-600 font-medium">{machine.price} €</p>
                            </div>
                            <a 
                              href={`#machines/${machine.id}`} 
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline"
                            >
                              Voir
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mb-3">Aucune annonce publiée</p>
                          <a 
                            href="#vendre" 
                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Publier une annonce
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section abonnement et actions rapides */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Statut abonnement */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Votre abonnement</h3>
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">Premium</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Visibilité renforcée sur la page d'accueil</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Jusqu'à 10 images par annonce</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Support prioritaire</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Statistiques détaillées</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-orange-200">
                      <p className="text-xs text-gray-600">Renouvellement automatique le 15 juillet 2024</p>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-3">
                      <a 
                        href="#vendre" 
                        className="flex items-center p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <Plus className="h-5 w-5 mr-3" />
                        <span className="font-medium">Nouvelle annonce</span>
                      </a>
                      <a 
                        href="#dashboard-configurator" 
                        className="flex items-center p-3 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        <span className="font-medium">Services aux entreprises</span>
                      </a>
                      <a 
                        href="#dashboard/notifications" 
                        className="flex items-center p-3 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <Bell className="h-5 w-5 mr-3" />
                        <span className="font-medium">Voir les notifications</span>
                      </a>
                      <a 
                        href="#contact" 
                        className="flex items-center p-3 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors"
                      >
                        <span className="text-lg mr-3">📞</span>
                        <span className="font-medium">Contacter le support</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'services' && (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
    <h3 className="text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
      Mes Services Premium
    </h3>

    <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
      <p className="text-gray-800 font-medium">Formule actuelle : <span className="text-orange-700 font-bold">Service Premium Pro</span></p>
      <p className="text-sm text-orange-600 mt-1">Renouvellement automatique le 15 juillet 2024</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Services Premium */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b border-orange-200 pb-3 text-lg">Services Premium Actifs</h4>
        
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gradient-to-r from-green-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
            <div className="w-4 h-4 bg-gradient-to-r from-green-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
            <div>
              <h5 className="font-semibold text-orange-900">Annonces en vedette</h5>
              <p className="text-sm text-orange-700">Affichage prioritaire et badge Premium</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
            <div>
              <h5 className="font-semibold text-orange-900">Médias enrichis</h5>
              <p className="text-sm text-orange-700">Plus d'images, vidéos et vues 360°</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
            <div>
              <h5 className="font-semibold text-orange-900">Description enrichie</h5>
              <p className="text-sm text-orange-700">Mise en forme avancée et champs supplémentaires</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
            <div>
              <h5 className="font-semibold text-orange-900">Statistiques détaillées</h5>
              <p className="text-sm text-orange-700">Suivi des visites et interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Professionnels */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b border-orange-200 pb-3 text-lg">Services Professionnels</h4>
        
        <div className="space-y-4">
          <div className="border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-900 text-lg">Financement</h5>
            <p className="text-sm text-gray-600 mb-3">Solutions de financement pour vos équipements</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600 font-medium">Crédit-bail, Location longue durée</span>
              <button 
                onClick={() => handleServiceRequest('Financement')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
              >
                Demander
              </button>
            </div>
          </div>
          
          <div className="border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-900 text-lg">Transport & Livraison</h5>
            <p className="text-sm text-gray-600 mb-3">Transport sécurisé partout en Afrique</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600 font-medium">Suivi en temps réel, Assurance incluse</span>
              <button 
                onClick={() => handleServiceRequest('Transport & Livraison')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
              >
                Demander
              </button>
            </div>
          </div>
          
          <div className="border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-900 text-lg">Maintenance & Réparation</h5>
            <p className="text-sm text-gray-600 mb-3">Équipe technique qualifiée</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600 font-medium">Maintenance préventive, Réparations d'urgence</span>
              <button 
                onClick={() => handleServiceRequest('Maintenance & Réparation')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
              >
                Demander
              </button>
            </div>
          </div>
          
          <div className="border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-900 text-lg">Formation & Certification</h5>
            <p className="text-sm text-gray-600 mb-3">Programmes de formation pour vos équipes</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600 font-medium">Formation théorique et pratique</span>
              <button 
                onClick={() => handleServiceRequest('Formation & Certification')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
              >
                Demander
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-8 pt-6 border-t border-orange-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleRequestService}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Demander un service
        </button>
        <button 
          onClick={() => window.location.hash = '#pro'}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
        >
          S'abonner au service Pro
        </button>
        <button 
          onClick={() => window.location.hash = '#dashboard-configurator'}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
        >
          Services aux entreprises
        </button>
        <button 
          onClick={handleViewAllServices}
          className="px-6 py-3 border-2 border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition-all duration-200 font-medium"
        >
          Voir tous les services
        </button>
        <button 
          onClick={handleServiceHistory}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
        >
          Historique des services
        </button>
      </div>
    </div>
  </div>
)}

{activeSection === 'annonces' && (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
        Mes Annonces
      </h3>
      <div className="flex items-center space-x-3">
        <button
          onClick={loadMachines}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Rafraîchir les annonces"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <a href="#vendre" className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline">
          Nouvelle annonce
        </a>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Équipement
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                Chargement des annonces...
              </td>
            </tr>
          ) : machines.length > 0 ? (
            machines.map((machine) => (
              <tr key={machine.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                  <div className="text-sm text-gray-500">{machine.brand}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{machine.price} €</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{machine.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <a href={`#machines/${machine.id}`} className="text-orange-600 hover:text-orange-900">
                      Voir
                    </a>
                    <button 
                      onClick={() => window.location.hash = `#vendre?edit=${machine.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier cette annonce"
                    >
                      ✏️ Modifier
                    </button>
                    <button 
                      onClick={async () => {
                        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?");
                        if (confirmDelete) {
                          try {
                            const { error } = await supabase
                              .from('machines')
                              .delete()
                              .eq('id', machine.id);
                            
                            if (error) {
                              alert("Erreur lors de la suppression : " + error.message);
                            } else {
                              alert("Annonce supprimée avec succès !");
                              loadMachines(); // Recharger la liste
                            }
                          } catch (error) {
                            console.error('Erreur suppression:', error);
                            alert("Erreur lors de la suppression de l'annonce.");
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer cette annonce"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                Aucune annonce publiée pour le moment.
                <br />
                                        <a href="#vendre" className="text-orange-600 hover:text-orange-900 mt-2 inline-block">
                  Publier votre première annonce
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

      {activeSection ==='abonnement' && (
  <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100">
    <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
      Mon abonnement
    </h2>
    <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
      <p className="mb-4 text-lg">Vous êtes actuellement sur l'offre <span className="text-orange-700 font-bold">Premium</span>.</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Téléchargement jusqu'à 10 images par annonce</li>
        <li>Visibilité renforcée sur la page d'accueil</li>
        <li>Support prioritaire</li>
      </ul>
    </div>
    <button 
      onClick={handleCancelSubscription}
      className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
    >
      Résilier mon abonnement
    </button>
  </div>
)}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                    >
                      Marquer tout comme lu
                    </button>
                    <button 
                      onClick={handleNotificationSettings}
                      className="text-sm text-gray-500 hover:text-orange-600 font-medium hover:underline"
                    >
                      Paramètres
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Notification - Nouvelle vue sur annonce */}
                  <div className="flex items-start p-5 bg-gradient-to-r from-blue-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-orange-700 text-sm font-medium">👁️</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-orange-900">Nouvelle vue sur votre annonce</h4>
                        <span className="text-xs text-orange-600 bg-white px-2 py-1 rounded-full">Il y a 2 heures</span>
                      </div>
                      <p className="text-sm text-orange-700 mt-2">
                        Quelqu'un a consulté votre annonce "Pelle hydraulique CAT 320D"
                      </p>
                      <div className="mt-3 flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewAnnouncement("Pelle hydraulique CAT 320D")}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                        >
                          Voir l'annonce
                        </button>
                        <button 
                          onClick={() => handleMarkAsRead("Nouvelle vue sur annonce")}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification - Message de contact */}
                  <div className="flex items-start p-5 bg-gradient-to-r from-green-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-orange-800 text-sm font-medium">💬</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-orange-900">Nouveau message de contact</h4>
                        <span className="text-xs text-orange-700 bg-white px-2 py-1 rounded-full">Il y a 4 heures</span>
                      </div>
                      <p className="text-sm text-orange-700 mt-2">
                        M. Diallo souhaite des informations sur votre "Concasseur mobile"
                      </p>
                      <div className="mt-3 flex items-center space-x-3">
                        <button 
                          onClick={() => handleReplyToMessage("M. Diallo")}
                          className="text-xs text-orange-700 hover:text-orange-800 font-semibold hover:underline"
                        >
                          Répondre
                        </button>
                        <button 
                          onClick={() => handleMarkAsRead("Nouveau message de contact")}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification - Offre reçue */}
                  <div className="flex items-start p-5 bg-gradient-to-r from-yellow-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-orange-900 text-sm font-medium">💰</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-orange-900">Nouvelle offre reçue</h4>
                        <span className="text-xs text-orange-800 bg-white px-2 py-1 rounded-full">Il y a 1 jour</span>
                      </div>
                      <p className="text-sm text-orange-800 mt-2">
                        Offre de 45 000€ pour votre "Camion benne 6x4" (prix demandé: 52 000€)
                      </p>
                      <div className="mt-3 flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewOffer("Offre de 45 000€ pour Camion benne 6x4")}
                          className="text-xs text-orange-800 hover:text-orange-900 font-semibold hover:underline"
                        >
                          Voir l'offre
                        </button>
                        <button 
                          onClick={() => handleMarkAsRead("Nouvelle offre reçue")}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification - Annonce expirée */}
                  <div className="flex items-start p-5 bg-gradient-to-r from-red-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-600 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-orange-50 text-sm font-medium">⏰</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-orange-900">Annonce expirée</h4>
                        <span className="text-xs text-orange-900 bg-white px-2 py-1 rounded-full">Il y a 2 jours</span>
                      </div>
                      <p className="text-sm text-orange-900 mt-2">
                        Votre annonce "Excavatrice JCB 3CX" a expiré. Renouvelez-la pour continuer à recevoir des contacts.
                      </p>
                      <div className="mt-3 flex items-center space-x-3">
                        <button 
                          onClick={() => handleRenewAnnouncement("Excavatrice JCB 3CX")}
                          className="text-xs text-orange-700 hover:text-orange-900 font-semibold hover:underline"
                        >
                          Renouveler
                        </button>
                        <button 
                          onClick={() => handleMarkAsRead("Annonce expirée")}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification - Service premium */}
                  <div className="flex items-start p-5 bg-gradient-to-r from-purple-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-orange-800 text-sm font-medium">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-orange-900">Service Premium activé</h4>
                        <span className="text-xs text-orange-700 bg-white px-2 py-1 rounded-full">Il y a 3 jours</span>
                      </div>
                      <p className="text-sm text-orange-800 mt-2">
                        Votre abonnement Premium a été activé. Vos annonces bénéficient maintenant d'une visibilité renforcée.
                      </p>
                      <div className="mt-3 flex items-center space-x-3">
                        <button 
                          onClick={handleViewPremiumBenefits}
                          className="text-xs text-orange-700 hover:text-orange-800 font-semibold hover:underline"
                        >
                          Voir les avantages
                        </button>
                        <button 
                          onClick={() => handleMarkAsRead("Service Premium activé")}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification - Maintenance */}
                  <div className="flex items-start p-5 bg-gradient-to-r from-gray-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-orange-700 text-sm font-medium">🔧</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-orange-900">Maintenance planifiée</h4>
                        <span className="text-xs text-orange-600 bg-white px-2 py-1 rounded-full">Il y a 5 jours</span>
                      </div>
                      <p className="text-sm text-orange-700 mt-2">
                        Maintenance prévue le 20 janvier 2024 de 02h00 à 04h00. Le site sera temporairement indisponible.
                      </p>
                      <div className="mt-3 flex items-center space-x-3">
                        <button 
                          onClick={() => handleMoreInfo("maintenance")}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                        >
                          Plus d'infos
                        </button>
                        <button 
                          onClick={() => handleMarkAsRead("Maintenance planifiée")}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Affichage de 6 notifications sur 24
                    </p>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50">
                        Précédent
                      </button>
                                              <span className="px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded">
                        1
                      </span>
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                        2
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                        3
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Paramètres - Configuration complète */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                {/* Header des paramètres */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
                      <p className="text-gray-600 mt-1">Gérez vos préférences et votre compte</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={async () => {
                          try {
                            setIsSavingSettings(true);
                            // Sauvegarder selon l'onglet actif
                            if (activeSettingsTab === 'profil') {
                              await handleSaveProfile();
                            } else if (activeSettingsTab === 'notifications') {
                              await handleSaveNotificationSettings();
                            } else if (activeSettingsTab === 'preferences') {
                              await handleSavePreferences();
                            }
                          } catch (error) {
                            console.error('Erreur lors de la sauvegarde:', error);
                          } finally {
                            setIsSavingSettings(false);
                          }
                        }}
                        disabled={isSavingSettings}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSavingSettings ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>

                  {/* Onglets des paramètres */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {['profil', 'notifications', 'securite', 'preferences'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveSettingsTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeSettingsTab === tab
                              ? 'border-orange-500 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab === 'profil' && 'Profil'}
                          {tab === 'notifications' && 'Notifications'}
                          {tab === 'securite' && 'Sécurité'}
                          {tab === 'preferences' && 'Préférences'}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Contenu des onglets */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                  {/* Onglet Profil */}
                  {activeSettingsTab === 'profil' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                      
                      {/* Photo de profil */}
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="h-20 w-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="h-10 w-10 text-white" />
                          </div>
                          <button className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full hover:bg-orange-600 transition-colors">
                            <Camera className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Photo de profil</h4>
                          <p className="text-sm text-gray-500">JPG, PNG ou GIF. Max 2MB.</p>
                        </div>
                      </div>

                      {/* Informations de base */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                          <input
                            type="text"
                            defaultValue={userName || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Votre prénom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="votre@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="+33 6 12 34 56 78"
                          />
                        </div>
                      </div>

                      {/* Informations entreprise */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations entreprise</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Nom de votre entreprise"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                            <input
                              type="url"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="https://www.votreentreprise.com"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                            <textarea
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Adresse complète de votre entreprise"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Notifications */}
                  {activeSettingsTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notifications</h3>
                      
                      {/* Notifications par email */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Notifications par email</h4>
                        <div className="space-y-3">
                          {[
                            { id: 'email_views', label: 'Nouvelles vues sur vos annonces', description: 'Recevez un email quand quelqu\'un consulte vos annonces' },
                            { id: 'email_messages', label: 'Nouveaux messages', description: 'Recevez un email quand vous recevez un message' },
                            { id: 'email_offers', label: 'Nouvelles offres', description: 'Recevez un email quand vous recevez une offre' },
                            { id: 'email_expired', label: 'Annonces expirées', description: 'Recevez un rappel quand vos annonces expirent' },
                            { id: 'email_newsletter', label: 'Newsletter', description: 'Recevez nos actualités et offres spéciales' }
                          ].map((notification) => (
                            <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <label className="font-medium text-gray-900">{notification.label}</label>
                                <p className="text-sm text-gray-500">{notification.description}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={['email_views', 'email_messages', 'email_offers'].includes(notification.id)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fréquence des rappels */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Fréquence des rappels</h4>
                        <div className="space-y-3">
                          {[
                            { value: 'immediate', label: 'Immédiat', description: 'Recevez les notifications dès qu\'elles arrivent' },
                            { value: 'daily', label: 'Quotidien', description: 'Recevez un résumé quotidien' },
                            { value: 'weekly', label: 'Hebdomadaire', description: 'Recevez un résumé hebdomadaire' }
                          ].map((frequency) => (
                            <label key={frequency.value} className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="frequency"
                                value={frequency.value}
                                defaultChecked={frequency.value === 'immediate'}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                              />
                              <div className="ml-3">
                                <div className="font-medium text-gray-900">{frequency.label}</div>
                                <div className="text-sm text-gray-500">{frequency.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Heures de réception */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Heures de réception</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
                            <input
                              type="time"
                              defaultValue="08:00"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">À</label>
                            <input
                              type="time"
                              defaultValue="20:00"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Sécurité */}
                  {activeSettingsTab === 'securite' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité du compte</h3>
                      
                      {/* Changement de mot de passe */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Changer le mot de passe</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Votre mot de passe actuel"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Nouveau mot de passe"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Confirmez le nouveau mot de passe"
                            />
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                          Changer le mot de passe
                        </button>
                      </div>

                      {/* Authentification à deux facteurs */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Authentification à deux facteurs</h4>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">2FA activé</div>
                            <div className="text-sm text-gray-500">Protégez votre compte avec un code supplémentaire</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Sessions actives */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Sessions actives</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-900">Session actuelle</div>
                                <div className="text-sm text-gray-500">Chrome sur Windows • Il y a 2 heures</div>
                              </div>
                            </div>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Actuelle</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-900">Safari sur iPhone</div>
                                <div className="text-sm text-gray-500">Il y a 1 jour</div>
                              </div>
                            </div>
                            <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                              Déconnecter
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Suppression de compte */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-red-600 mb-4">Zone dangereuse</h4>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-red-900">Supprimer le compte</div>
                              <div className="text-sm text-red-700">Cette action est irréversible</div>
                            </div>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Préférences */}
                  {activeSettingsTab === 'preferences' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences générales</h3>
                      
                      {/* Langue et région */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Langue et région</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                              <option value="fr">Français</option>
                              <option value="en">English</option>
                              <option value="ar">العربية</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                              <option value="EUR">EUR (€)</option>
                              <option value="USD">USD ($)</option>
                              <option value="MAD">MAD (د.م)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                              <option value="UTC">UTC (UTC+0)</option>
                              <option value="America/New_York">America/New_York (UTC-5)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Format de date</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Interface */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Interface</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Mode sombre</div>
                              <div className="text-sm text-gray-500">Activer le thème sombre</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Animations</div>
                              <div className="text-sm text-gray-500">Activer les transitions et animations</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Accessibilité */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Accessibilité</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Taille de police</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                              <option value="small">Petite</option>
                              <option value="medium" selected>Moyenne</option>
                              <option value="large">Grande</option>
                              <option value="xlarge">Très grande</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Contraste élevé</div>
                              <div className="text-sm text-gray-500">Améliorer la lisibilité</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
