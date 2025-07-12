import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Package, Settings, FileText, Bell, User, LogOut, ChevronRight, Shield, Wallet, RefreshCw, Eye, MessageSquare, DollarSign, Camera } from 'lucide-react';
import { getSellerMachines, logoutUser, getDashboardStats, getWeeklyActivityData, getMessages, getOffers, getUserProfile, updateUserProfile, getUserPreferences, updateUserPreferences, updateNotificationSettings, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getPremiumService, requestPremiumService, cancelPremiumService, getServiceHistory, getActiveSessions, revokeSession, changePassword, uploadProfilePicture, deleteUserAccount } from '../utils/api';
export default function Dashboard({ section = 'overview' }) {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [activeSection, setActiveSection] = useState(section);
    const [stats, setStats] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [messages, setMessages] = useState([]);
    const [offers, setOffers] = useState([]);
    const [activeSettingsTab, setActiveSettingsTab] = useState('profil');
    // Nouveaux états pour les fonctionnalités avancées
    const [userProfile, setUserProfile] = useState(null);
    const [userPreferences, setUserPreferences] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [premiumService, setPremiumService] = useState(null);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
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
        }
        catch (err) {
            console.error('❌ Erreur chargement machines :', err);
            console.error('❌ Type d\'erreur:', typeof err);
            console.error('❌ Message d\'erreur:', err instanceof Error ? err.message : String(err));
        }
        finally {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error);
        }
        finally {
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
                }
                else if (section === 'annonces') {
                    loadMachines();
                }
                else if (section === 'parametres') {
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
    const handleServiceRequest = (serviceName) => {
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
        const historyText = historyData.map(item => `${item.service} - ${item.date} (${item.status})`).join('\n');
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
    const handleViewAnnouncement = (announcementName) => {
        alert(`Redirection vers l'annonce "${announcementName}"...`);
        // Ici on pourrait rediriger vers la page de l'annonce
    };
    const handleMarkAsRead = (notificationType) => {
        alert(`Notification "${notificationType}" marquée comme lue !`);
    };
    const handleReplyToMessage = (contactName) => {
        alert(`Ouverture du formulaire de réponse pour ${contactName}...`);
        // Ici on pourrait ouvrir un formulaire de réponse
    };
    const handleViewOffer = (offerDetails) => {
        alert(`Affichage de l'offre : ${offerDetails}\n\nVous pouvez accepter, refuser ou négocier cette offre.`);
    };
    const handleRenewAnnouncement = (announcementName) => {
        const confirmed = window.confirm(`Voulez-vous renouveler l'annonce "${announcementName}" ?\n\nCela prolongera sa visibilité de 30 jours.`);
        if (confirmed) {
            alert(`Annonce "${announcementName}" renouvelée avec succès !\n\nElle sera visible jusqu'au ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
        }
    };
    const handleViewPremiumBenefits = () => {
        alert('Avantages Premium :\n\n• Visibilité renforcée sur la page d\'accueil\n• Plus d\'images par annonce (10 au lieu de 5)\n• Statistiques détaillées\n• Support prioritaire\n• Badge Premium sur vos annonces');
    };
    const handleMoreInfo = (infoType) => {
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
    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };
    // Fonction pour calculer le pourcentage de la barre de progression
    const getBarWidth = (value, maxValue) => {
        if (maxValue === 0)
            return 0;
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
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde du profil:', error);
            alert('Erreur lors de la sauvegarde du profil');
        }
        finally {
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
        }
        catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            alert('Erreur lors du changement de mot de passe: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
        }
        finally {
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
                notification_frequency: notificationSettings.frequency,
                notification_hours: {
                    start: notificationSettings.start_time,
                    end: notificationSettings.end_time
                }
            });
            await loadUserData();
            alert('Paramètres de notifications sauvegardés !');
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des notifications:', error);
            alert('Erreur lors de la sauvegarde des notifications');
        }
        finally {
            setIsSavingSettings(false);
        }
    };
    const handleSavePreferences = async () => {
        try {
            setIsSavingSettings(true);
            await updateUserPreferences(preferencesForm);
            await loadUserData();
            alert('Préférences sauvegardées !');
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences:', error);
            alert('Erreur lors de la sauvegarde des préférences');
        }
        finally {
            setIsSavingSettings(false);
        }
    };
    const handleUploadProfilePicture = async (file) => {
        try {
            setIsSavingSettings(true);
            await uploadProfilePicture(file);
            await loadUserData();
            alert('Photo de profil mise à jour !');
        }
        catch (error) {
            console.error('Erreur lors de l\'upload de la photo:', error);
            alert('Erreur lors de l\'upload de la photo');
        }
        finally {
            setIsSavingSettings(false);
        }
    };
    const handleRevokeSession = async (sessionId) => {
        if (confirm('Êtes-vous sûr de vouloir déconnecter cette session ?')) {
            try {
                await revokeSession(sessionId);
                await loadUserData();
                alert('Session déconnectée avec succès !');
            }
            catch (error) {
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
                }
                catch (error) {
                    console.error('Erreur lors de la suppression du compte:', error);
                    alert('Erreur lors de la suppression du compte');
                }
            }
        }
    };
    const handleRequestPremium = async (serviceType) => {
        try {
            await requestPremiumService(serviceType);
            await loadUserData();
            alert(`Service ${serviceType} activé avec succès !`);
        }
        catch (error) {
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
            }
            catch (error) {
                console.error('Erreur lors de l\'annulation du service premium:', error);
                alert('Erreur lors de l\'annulation du service premium');
            }
        }
    };
    const handleMarkNotificationAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            await loadUserData();
        }
        catch (error) {
            console.error('Erreur lors du marquage de notification:', error);
        }
    };
    const handleMarkAllNotificationsAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            await loadUserData();
        }
        catch (error) {
            console.error('Erreur lors du marquage de toutes les notifications:', error);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent", children: "Tableau de bord" }), _jsxs("p", { className: "text-gray-600 mt-2 text-lg", children: ["Bienvenue", userName ? `, ${userName}` : ''] }), _jsx("nav", { className: "flex mt-3", "aria-label": "Breadcrumb", children: _jsxs("ol", { className: "flex items-center space-x-2", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "text-orange-600 hover:text-orange-700 font-medium", children: "Accueil" }) }), _jsx(ChevronRight, { className: "h-4 w-4 text-orange-400" }), _jsx("li", { children: _jsx("span", { className: "text-gray-700 font-medium", children: "Tableau de bord" }) })] }) })] }), _jsxs("a", { href: "#vendre", className: "inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200", children: [_jsx(Plus, { className: "h-5 w-5 mr-2" }), "Nouvelle annonce"] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 space-y-6 border border-orange-100", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg", children: _jsx(User, { className: "h-7 w-7 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Vendeur connect\u00E9" }), _jsx("p", { className: "text-sm text-orange-600 font-medium", children: "Profil professionnel" })] })] }), _jsxs("nav", { className: "space-y-2", children: [navigation.map((item) => {
                                                const Icon = item.icon;
                                                return (_jsxs("a", { href: item.href, className: `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === item.name.toLowerCase()
                                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700'}`, children: [_jsx(Icon, { className: "h-5 w-5 mr-3" }), item.name] }, item.name));
                                            }), _jsxs("button", { onClick: handleLogout, className: "flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200", children: [_jsx(LogOut, { className: "h-5 w-5 mr-3" }), "D\u00E9connexion"] })] })] }) }), _jsxs("div", { className: "lg:col-span-3 space-y-6", children: [activeSection === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total des annonces" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: machines.length }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "+12% ce mois" })] }), _jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "h-6 w-6 text-white" }) })] }) }), _jsx("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Vues totales" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats ? formatNumber(stats.totalViews) : '0' }), _jsxs("p", { className: `text-xs mt-1 ${stats?.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [stats?.weeklyGrowth >= 0 ? '+' : '', stats?.weeklyGrowth || 0, "% cette semaine"] })] }), _jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: _jsx(Eye, { className: "h-6 w-6 text-white" }) })] }) }), _jsx("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Messages re\u00E7us" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats ? formatNumber(stats.totalMessages) : '0' }), _jsxs("p", { className: "text-xs text-orange-600 mt-1", children: [messages.filter(m => !m.is_read).length, " nouveau", messages.filter(m => !m.is_read).length > 1 ? 'x' : ''] })] }), _jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: _jsx(MessageSquare, { className: "h-6 w-6 text-white" }) })] }) }), _jsx("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Offres re\u00E7ues" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats ? formatNumber(stats.totalOffers) : '0' }), _jsxs("p", { className: "text-xs text-green-600 mt-1", children: [offers.filter(o => o.status === 'pending').length, " en attente"] })] }), _jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { className: "h-6 w-6 text-white" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Activit\u00E9 r\u00E9cente" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: "7 derniers jours" }), _jsx("button", { onClick: loadMachines, disabled: loading, className: "p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", title: "Actualiser", children: _jsx(RefreshCw, { className: `h-4 w-4 ${loading ? 'animate-spin' : ''}` }) })] })] }), _jsx("div", { className: "space-y-3", children: weekDays.map((day, index) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: day }), _jsx("div", { className: "flex-1 mx-4", children: _jsx("div", { className: "bg-orange-200 rounded-full h-2", children: _jsx("div", { className: "bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500", style: { width: `${getBarWidth(weeklyData[index] || 0, maxWeeklyViews)}%` } }) }) }), _jsx("span", { className: "text-gray-900 font-medium", children: weeklyData[index] || 0 })] }, day))) }), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Total des vues cette semaine" }), _jsxs("span", { className: "text-orange-600 font-semibold", children: [stats?.weeklyViews || 0, " vues"] })] }) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Annonces r\u00E9centes" }), _jsx("a", { href: "#dashboard/annonces", className: "text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline", children: "Voir tout" })] }), _jsx("div", { className: "space-y-4", children: loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Chargement..." })] })) : machines.length > 0 ? (machines.slice(0, 3).map((machine) => (_jsxs("div", { className: "flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors", children: [_jsx("div", { className: "h-10 w-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: machine.name }), _jsx("p", { className: "text-xs text-gray-500", children: machine.brand }), _jsxs("p", { className: "text-xs text-orange-600 font-medium", children: [machine.price, " \u20AC"] })] }), _jsx("a", { href: `#machines/${machine.id}`, className: "text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline", children: "Voir" })] }, machine.id)))) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3", children: _jsx(Package, { className: "h-6 w-6 text-gray-400" }) }), _jsx("p", { className: "text-sm text-gray-500 mb-3", children: "Aucune annonce publi\u00E9e" }), _jsxs("a", { href: "#vendre", className: "inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Publier une annonce"] })] })) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Votre abonnement" }), _jsx("span", { className: "px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full", children: "Premium" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center text-sm", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-3" }), _jsx("span", { className: "text-gray-700", children: "Visibilit\u00E9 renforc\u00E9e sur la page d'accueil" })] }), _jsxs("div", { className: "flex items-center text-sm", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-3" }), _jsx("span", { className: "text-gray-700", children: "Jusqu'\u00E0 10 images par annonce" })] }), _jsxs("div", { className: "flex items-center text-sm", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-3" }), _jsx("span", { className: "text-gray-700", children: "Support prioritaire" })] }), _jsxs("div", { className: "flex items-center text-sm", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full mr-3" }), _jsx("span", { className: "text-gray-700", children: "Statistiques d\u00E9taill\u00E9es" })] })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-orange-200", children: _jsx("p", { className: "text-xs text-gray-600", children: "Renouvellement automatique le 15 juillet 2024" }) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Actions rapides" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("a", { href: "#vendre", className: "flex items-center p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105", children: [_jsx(Plus, { className: "h-5 w-5 mr-3" }), _jsx("span", { className: "font-medium", children: "Nouvelle annonce" })] }), _jsxs("a", { href: "#dashboard/services", className: "flex items-center p-3 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors", children: [_jsx(Shield, { className: "h-5 w-5 mr-3" }), _jsx("span", { className: "font-medium", children: "Demander un service" })] }), _jsxs("a", { href: "#dashboard/notifications", className: "flex items-center p-3 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors", children: [_jsx(Bell, { className: "h-5 w-5 mr-3" }), _jsx("span", { className: "font-medium", children: "Voir les notifications" })] }), _jsxs("a", { href: "#contact", className: "flex items-center p-3 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors", children: [_jsx("span", { className: "text-lg mr-3", children: "\uD83D\uDCDE" }), _jsx("span", { className: "font-medium", children: "Contacter le support" })] })] })] })] })] })), activeSection === 'services' && (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent", children: "Mes Services Premium" }), _jsxs("div", { className: "mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200", children: [_jsxs("p", { className: "text-gray-800 font-medium", children: ["Formule actuelle : ", _jsx("span", { className: "text-orange-700 font-bold", children: "Service Premium Pro" })] }), _jsx("p", { className: "text-sm text-orange-600 mt-1", children: "Renouvellement automatique le 15 juillet 2024" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold text-gray-900 border-b border-orange-200 pb-3 text-lg", children: "Services Premium Actifs" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center p-4 bg-gradient-to-r from-green-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm", children: [_jsx("div", { className: "w-4 h-4 bg-gradient-to-r from-green-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-orange-900", children: "Annonces en vedette" }), _jsx("p", { className: "text-sm text-orange-700", children: "Affichage prioritaire et badge Premium" })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-gradient-to-r from-blue-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm", children: [_jsx("div", { className: "w-4 h-4 bg-gradient-to-r from-blue-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-orange-900", children: "M\u00E9dias enrichis" }), _jsx("p", { className: "text-sm text-orange-700", children: "Plus d'images, vid\u00E9os et vues 360\u00B0" })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-gradient-to-r from-purple-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm", children: [_jsx("div", { className: "w-4 h-4 bg-gradient-to-r from-purple-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-orange-900", children: "Description enrichie" }), _jsx("p", { className: "text-sm text-orange-700", children: "Mise en forme avanc\u00E9e et champs suppl\u00E9mentaires" })] })] }), _jsxs("div", { className: "flex items-center p-4 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm", children: [_jsx("div", { className: "w-4 h-4 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-orange-900", children: "Statistiques d\u00E9taill\u00E9es" }), _jsx("p", { className: "text-sm text-orange-700", children: "Suivi des visites et interactions" })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold text-gray-900 border-b border-orange-200 pb-3 text-lg", children: "Services Professionnels" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow", children: [_jsx("h5", { className: "font-semibold text-gray-900 text-lg", children: "Financement" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Solutions de financement pour vos \u00E9quipements" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-orange-600 font-medium", children: "Cr\u00E9dit-bail, Location longue dur\u00E9e" }), _jsx("button", { onClick: () => handleServiceRequest('Financement'), className: "text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline", children: "Demander" })] })] }), _jsxs("div", { className: "border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow", children: [_jsx("h5", { className: "font-semibold text-gray-900 text-lg", children: "Transport & Livraison" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Transport s\u00E9curis\u00E9 partout en Afrique" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-orange-600 font-medium", children: "Suivi en temps r\u00E9el, Assurance incluse" }), _jsx("button", { onClick: () => handleServiceRequest('Transport & Livraison'), className: "text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline", children: "Demander" })] })] }), _jsxs("div", { className: "border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow", children: [_jsx("h5", { className: "font-semibold text-gray-900 text-lg", children: "Maintenance & R\u00E9paration" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "\u00C9quipe technique qualifi\u00E9e" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-orange-600 font-medium", children: "Maintenance pr\u00E9ventive, R\u00E9parations d'urgence" }), _jsx("button", { onClick: () => handleServiceRequest('Maintenance & Réparation'), className: "text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline", children: "Demander" })] })] }), _jsxs("div", { className: "border border-orange-200 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow", children: [_jsx("h5", { className: "font-semibold text-gray-900 text-lg", children: "Formation & Certification" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Programmes de formation pour vos \u00E9quipes" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-orange-600 font-medium", children: "Formation th\u00E9orique et pratique" }), _jsx("button", { onClick: () => handleServiceRequest('Formation & Certification'), className: "text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline", children: "Demander" })] })] })] })] })] }), _jsx("div", { className: "mt-8 pt-6 border-t border-orange-200", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("button", { onClick: handleRequestService, className: "px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg", children: "Demander un service" }), _jsx("button", { onClick: () => window.location.hash = '#pro', className: "px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium", children: "S'abonner au service Pro" }), _jsx("button", { onClick: () => window.location.hash = hasEnterpriseConfig ? '#dashboard-entreprise' : '#entreprise', className: "px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium", children: hasEnterpriseConfig ? 'Accéder au tableau de bord entreprise' : 'Service Entreprise' }), _jsx("button", { onClick: handleViewAllServices, className: "px-6 py-3 border-2 border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition-all duration-200 font-medium", children: "Voir tous les services" }), _jsx("button", { onClick: handleServiceHistory, className: "px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium", children: "Historique des services" })] }) })] })), activeSection === 'annonces' && (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent", children: "Mes Annonces" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: loadMachines, disabled: loading, className: "p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", title: "Rafra\u00EEchir les annonces", children: _jsx(RefreshCw, { className: `h-4 w-4 ${loading ? 'animate-spin' : ''}` }) }), _jsx("a", { href: "#vendre", className: "text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline", children: "Nouvelle annonce" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u00C9quipement" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Prix" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Cat\u00E9gorie" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-6 py-4 text-center text-sm text-gray-500", children: "Chargement des annonces..." }) })) : machines.length > 0 ? (machines.map((machine) => (_jsxs("tr", { children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: machine.name }), _jsx("div", { className: "text-sm text-gray-500", children: machine.brand })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-900", children: [machine.price, " \u20AC"] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: machine.category }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: _jsx("a", { href: `#machines/${machine.id}`, className: "text-primary-600 hover:text-primary-900", children: "Voir" }) })] }, machine.id)))) : (_jsx("tr", { children: _jsxs("td", { colSpan: 4, className: "px-6 py-4 text-center text-sm text-gray-500", children: ["Aucune annonce publi\u00E9e pour le moment.", _jsx("br", {}), _jsx("a", { href: "#vendre", className: "text-primary-600 hover:text-primary-900 mt-2 inline-block", children: "Publier votre premi\u00E8re annonce" })] }) })) })] }) })] })), activeSection === 'abonnement' && (_jsxs("div", { className: "bg-white p-8 rounded-xl shadow-lg border border-orange-100", children: [_jsx("h2", { className: "text-2xl font-semibold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent", children: "Mon abonnement" }), _jsxs("div", { className: "mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200", children: [_jsxs("p", { className: "mb-4 text-lg", children: ["Vous \u00EAtes actuellement sur l'offre ", _jsx("span", { className: "text-orange-700 font-bold", children: "Premium" }), "."] }), _jsxs("ul", { className: "list-disc pl-6 text-gray-700 space-y-2", children: [_jsx("li", { children: "T\u00E9l\u00E9chargement jusqu'\u00E0 10 images par annonce" }), _jsx("li", { children: "Visibilit\u00E9 renforc\u00E9e sur la page d'accueil" }), _jsx("li", { children: "Support prioritaire" })] })] }), _jsx("button", { onClick: handleCancelSubscription, className: "mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium", children: "R\u00E9silier mon abonnement" })] })), activeSection === 'notifications' && (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent", children: "Notifications" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: handleMarkAllAsRead, className: "text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline", children: "Marquer tout comme lu" }), _jsx("button", { onClick: handleNotificationSettings, className: "text-sm text-gray-500 hover:text-orange-600 font-medium hover:underline", children: "Param\u00E8tres" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start p-5 bg-gradient-to-r from-blue-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-300 shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-orange-700 text-sm font-medium", children: "\uD83D\uDC41\uFE0F" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-900", children: "Nouvelle vue sur votre annonce" }), _jsx("span", { className: "text-xs text-orange-600 bg-white px-2 py-1 rounded-full", children: "Il y a 2 heures" })] }), _jsx("p", { className: "text-sm text-orange-700 mt-2", children: "Quelqu'un a consult\u00E9 votre annonce \"Pelle hydraulique CAT 320D\"" }), _jsxs("div", { className: "mt-3 flex items-center space-x-3", children: [_jsx("button", { onClick: () => handleViewAnnouncement("Pelle hydraulique CAT 320D"), className: "text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline", children: "Voir l'annonce" }), _jsx("button", { onClick: () => handleMarkAsRead("Nouvelle vue sur annonce"), className: "text-xs text-orange-400 hover:text-orange-600 font-medium", children: "Marquer comme lu" })] })] })] }), _jsxs("div", { className: "flex items-start p-5 bg-gradient-to-r from-green-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-green-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-orange-800 text-sm font-medium", children: "\uD83D\uDCAC" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-900", children: "Nouveau message de contact" }), _jsx("span", { className: "text-xs text-orange-700 bg-white px-2 py-1 rounded-full", children: "Il y a 4 heures" })] }), _jsx("p", { className: "text-sm text-orange-700 mt-2", children: "M. Diallo souhaite des informations sur votre \"Concasseur mobile\"" }), _jsxs("div", { className: "mt-3 flex items-center space-x-3", children: [_jsx("button", { onClick: () => handleReplyToMessage("M. Diallo"), className: "text-xs text-orange-700 hover:text-orange-800 font-semibold hover:underline", children: "R\u00E9pondre" }), _jsx("button", { onClick: () => handleMarkAsRead("Nouveau message de contact"), className: "text-xs text-orange-400 hover:text-orange-600 font-medium", children: "Marquer comme lu" })] })] })] }), _jsxs("div", { className: "flex items-start p-5 bg-gradient-to-r from-yellow-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-yellow-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-orange-900 text-sm font-medium", children: "\uD83D\uDCB0" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-900", children: "Nouvelle offre re\u00E7ue" }), _jsx("span", { className: "text-xs text-orange-800 bg-white px-2 py-1 rounded-full", children: "Il y a 1 jour" })] }), _jsx("p", { className: "text-sm text-orange-800 mt-2", children: "Offre de 45 000\u20AC pour votre \"Camion benne 6x4\" (prix demand\u00E9: 52 000\u20AC)" }), _jsxs("div", { className: "mt-3 flex items-center space-x-3", children: [_jsx("button", { onClick: () => handleViewOffer("Offre de 45 000€ pour Camion benne 6x4"), className: "text-xs text-orange-800 hover:text-orange-900 font-semibold hover:underline", children: "Voir l'offre" }), _jsx("button", { onClick: () => handleMarkAsRead("Nouvelle offre reçue"), className: "text-xs text-orange-400 hover:text-orange-600 font-medium", children: "Marquer comme lu" })] })] })] }), _jsxs("div", { className: "flex items-start p-5 bg-gradient-to-r from-red-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-600 shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-red-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-orange-50 text-sm font-medium", children: "\u23F0" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-900", children: "Annonce expir\u00E9e" }), _jsx("span", { className: "text-xs text-orange-900 bg-white px-2 py-1 rounded-full", children: "Il y a 2 jours" })] }), _jsx("p", { className: "text-sm text-orange-900 mt-2", children: "Votre annonce \"Excavatrice JCB 3CX\" a expir\u00E9. Renouvelez-la pour continuer \u00E0 recevoir des contacts." }), _jsxs("div", { className: "mt-3 flex items-center space-x-3", children: [_jsx("button", { onClick: () => handleRenewAnnouncement("Excavatrice JCB 3CX"), className: "text-xs text-orange-700 hover:text-orange-900 font-semibold hover:underline", children: "Renouveler" }), _jsx("button", { onClick: () => handleMarkAsRead("Annonce expirée"), className: "text-xs text-orange-400 hover:text-orange-600 font-medium", children: "Marquer comme lu" })] })] })] }), _jsxs("div", { className: "flex items-start p-5 bg-gradient-to-r from-purple-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-purple-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-orange-800 text-sm font-medium", children: "\u2B50" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-900", children: "Service Premium activ\u00E9" }), _jsx("span", { className: "text-xs text-orange-700 bg-white px-2 py-1 rounded-full", children: "Il y a 3 jours" })] }), _jsx("p", { className: "text-sm text-orange-800 mt-2", children: "Votre abonnement Premium a \u00E9t\u00E9 activ\u00E9. Vos annonces b\u00E9n\u00E9ficient maintenant d'une visibilit\u00E9 renforc\u00E9e." }), _jsxs("div", { className: "mt-3 flex items-center space-x-3", children: [_jsx("button", { onClick: handleViewPremiumBenefits, className: "text-xs text-orange-700 hover:text-orange-800 font-semibold hover:underline", children: "Voir les avantages" }), _jsx("button", { onClick: () => handleMarkAsRead("Service Premium activé"), className: "text-xs text-orange-400 hover:text-orange-600 font-medium", children: "Marquer comme lu" })] })] })] }), _jsxs("div", { className: "flex items-start p-5 bg-gradient-to-r from-gray-50 via-orange-100 to-orange-200 rounded-xl border-l-4 border-orange-300 shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-gray-100 via-orange-200 to-orange-400 rounded-full flex items-center justify-center shadow-md", children: _jsx("span", { className: "text-orange-700 text-sm font-medium", children: "\uD83D\uDD27" }) }) }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-orange-900", children: "Maintenance planifi\u00E9e" }), _jsx("span", { className: "text-xs text-orange-600 bg-white px-2 py-1 rounded-full", children: "Il y a 5 jours" })] }), _jsx("p", { className: "text-sm text-orange-700 mt-2", children: "Maintenance pr\u00E9vue le 20 janvier 2024 de 02h00 \u00E0 04h00. Le site sera temporairement indisponible." }), _jsxs("div", { className: "mt-3 flex items-center space-x-3", children: [_jsx("button", { onClick: () => handleMoreInfo("maintenance"), className: "text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline", children: "Plus d'infos" }), _jsx("button", { onClick: () => handleMarkAsRead("Maintenance planifiée"), className: "text-xs text-orange-400 hover:text-orange-600 font-medium", children: "Marquer comme lu" })] })] })] })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Affichage de 6 notifications sur 24" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50", children: "Pr\u00E9c\u00E9dent" }), _jsx("span", { className: "px-3 py-1 text-sm bg-primary-100 text-primary-600 rounded", children: "1" }), _jsx("button", { className: "px-3 py-1 text-sm text-gray-500 hover:text-gray-700", children: "2" }), _jsx("button", { className: "px-3 py-1 text-sm text-gray-500 hover:text-gray-700", children: "3" }), _jsx("button", { className: "px-3 py-1 text-sm text-gray-500 hover:text-gray-700", children: "Suivant" })] })] }) })] })), activeSection === 'settings' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Param\u00E8tres" }), _jsx("p", { className: "text-gray-600 mt-1", children: "G\u00E9rez vos pr\u00E9f\u00E9rences et votre compte" })] }), _jsx("div", { className: "flex items-center space-x-3", children: _jsx("button", { onClick: async () => {
                                                                    try {
                                                                        setIsSavingSettings(true);
                                                                        // Sauvegarder selon l'onglet actif
                                                                        if (activeSettingsTab === 'profil') {
                                                                            await handleSaveProfile();
                                                                        }
                                                                        else if (activeSettingsTab === 'notifications') {
                                                                            await handleSaveNotificationSettings();
                                                                        }
                                                                        else if (activeSettingsTab === 'preferences') {
                                                                            await handleSavePreferences();
                                                                        }
                                                                    }
                                                                    catch (error) {
                                                                        console.error('Erreur lors de la sauvegarde:', error);
                                                                    }
                                                                    finally {
                                                                        setIsSavingSettings(false);
                                                                    }
                                                                }, disabled: isSavingSettings, className: "px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed", children: isSavingSettings ? 'Sauvegarde...' : 'Sauvegarder' }) })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: ['profil', 'notifications', 'securite', 'preferences'].map((tab) => (_jsxs("button", { onClick: () => setActiveSettingsTab(tab), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeSettingsTab === tab
                                                                ? 'border-orange-500 text-orange-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [tab === 'profil' && 'Profil', tab === 'notifications' && 'Notifications', tab === 'securite' && 'Sécurité', tab === 'preferences' && 'Préférences'] }, tab))) }) })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border border-orange-100", children: [activeSettingsTab === 'profil' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Informations personnelles" }), _jsxs("div", { className: "flex items-center space-x-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "h-20 w-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg", children: _jsx(User, { className: "h-10 w-10 text-white" }) }), _jsx("button", { className: "absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full hover:bg-orange-600 transition-colors", children: _jsx(Camera, { className: "h-4 w-4" }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Photo de profil" }), _jsx("p", { className: "text-sm text-gray-500", children: "JPG, PNG ou GIF. Max 2MB." })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Pr\u00E9nom" }), _jsx("input", { type: "text", defaultValue: userName || '', className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Votre pr\u00E9nom" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nom" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Votre nom" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email" }), _jsx("input", { type: "email", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "votre@email.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "T\u00E9l\u00E9phone" }), _jsx("input", { type: "tel", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "+33 6 12 34 56 78" })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Informations entreprise" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nom de l'entreprise" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Nom de votre entreprise" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Site web" }), _jsx("input", { type: "url", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "https://www.votreentreprise.com" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Adresse" }), _jsx("textarea", { rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Adresse compl\u00E8te de votre entreprise" })] })] })] })] })), activeSettingsTab === 'notifications' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Pr\u00E9f\u00E9rences de notifications" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Notifications par email" }), _jsx("div", { className: "space-y-3", children: [
                                                                        { id: 'email_views', label: 'Nouvelles vues sur vos annonces', description: 'Recevez un email quand quelqu\'un consulte vos annonces' },
                                                                        { id: 'email_messages', label: 'Nouveaux messages', description: 'Recevez un email quand vous recevez un message' },
                                                                        { id: 'email_offers', label: 'Nouvelles offres', description: 'Recevez un email quand vous recevez une offre' },
                                                                        { id: 'email_expired', label: 'Annonces expirées', description: 'Recevez un rappel quand vos annonces expirent' },
                                                                        { id: 'email_newsletter', label: 'Newsletter', description: 'Recevez nos actualités et offres spéciales' }
                                                                    ].map((notification) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("label", { className: "font-medium text-gray-900", children: notification.label }), _jsx("p", { className: "text-sm text-gray-500", children: notification.description })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "sr-only peer", defaultChecked: ['email_views', 'email_messages', 'email_offers'].includes(notification.id) }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" })] })] }, notification.id))) })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Fr\u00E9quence des rappels" }), _jsx("div", { className: "space-y-3", children: [
                                                                        { value: 'immediate', label: 'Immédiat', description: 'Recevez les notifications dès qu\'elles arrivent' },
                                                                        { value: 'daily', label: 'Quotidien', description: 'Recevez un résumé quotidien' },
                                                                        { value: 'weekly', label: 'Hebdomadaire', description: 'Recevez un résumé hebdomadaire' }
                                                                    ].map((frequency) => (_jsxs("label", { className: "flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100", children: [_jsx("input", { type: "radio", name: "frequency", value: frequency.value, defaultChecked: frequency.value === 'immediate', className: "h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300" }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "font-medium text-gray-900", children: frequency.label }), _jsx("div", { className: "text-sm text-gray-500", children: frequency.description })] })] }, frequency.value))) })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Heures de r\u00E9ception" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "De" }), _jsx("input", { type: "time", defaultValue: "08:00", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u00C0" }), _jsx("input", { type: "time", defaultValue: "20:00", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" })] })] })] })] })), activeSettingsTab === 'securite' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "S\u00E9curit\u00E9 du compte" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Changer le mot de passe" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Mot de passe actuel" }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Votre mot de passe actuel" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nouveau mot de passe" }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Nouveau mot de passe" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirmer le nouveau mot de passe" }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", placeholder: "Confirmez le nouveau mot de passe" })] })] }), _jsx("button", { className: "px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors", children: "Changer le mot de passe" })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Authentification \u00E0 deux facteurs" }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "2FA activ\u00E9" }), _jsx("div", { className: "text-sm text-gray-500", children: "Prot\u00E9gez votre compte avec un code suppl\u00E9mentaire" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "sr-only peer", defaultChecked: true }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Sessions actives" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Session actuelle" }), _jsx("div", { className: "text-sm text-gray-500", children: "Chrome sur Windows \u2022 Il y a 2 heures" })] })] }), _jsx("span", { className: "text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full", children: "Actuelle" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 bg-gray-400 rounded-full" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Safari sur iPhone" }), _jsx("div", { className: "text-sm text-gray-500", children: "Il y a 1 jour" })] })] }), _jsx("button", { className: "text-xs text-red-600 hover:text-red-700 font-medium", children: "D\u00E9connecter" })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-red-600 mb-4", children: "Zone dangereuse" }), _jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-red-900", children: "Supprimer le compte" }), _jsx("div", { className: "text-sm text-red-700", children: "Cette action est irr\u00E9versible" })] }), _jsx("button", { className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: "Supprimer" })] }) })] })] })), activeSettingsTab === 'preferences' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Pr\u00E9f\u00E9rences g\u00E9n\u00E9rales" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Langue et r\u00E9gion" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Langue" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", children: [_jsx("option", { value: "fr", children: "Fran\u00E7ais" }), _jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "ar", children: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Devise" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", children: [_jsx("option", { value: "EUR", children: "EUR (\u20AC)" }), _jsx("option", { value: "USD", children: "USD ($)" }), _jsx("option", { value: "MAD", children: "MAD (\u062F.\u0645)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fuseau horaire" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", children: [_jsx("option", { value: "Europe/Paris", children: "Europe/Paris (UTC+1)" }), _jsx("option", { value: "UTC", children: "UTC (UTC+0)" }), _jsx("option", { value: "America/New_York", children: "America/New_York (UTC-5)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Format de date" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", children: [_jsx("option", { value: "DD/MM/YYYY", children: "DD/MM/YYYY" }), _jsx("option", { value: "MM/DD/YYYY", children: "MM/DD/YYYY" }), _jsx("option", { value: "YYYY-MM-DD", children: "YYYY-MM-DD" })] })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Interface" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Mode sombre" }), _jsx("div", { className: "text-sm text-gray-500", children: "Activer le th\u00E8me sombre" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Animations" }), _jsx("div", { className: "text-sm text-gray-500", children: "Activer les transitions et animations" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "sr-only peer", defaultChecked: true }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" })] })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-4", children: "Accessibilit\u00E9" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Taille de police" }), _jsxs("select", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500", children: [_jsx("option", { value: "small", children: "Petite" }), _jsx("option", { value: "medium", selected: true, children: "Moyenne" }), _jsx("option", { value: "large", children: "Grande" }), _jsx("option", { value: "xlarge", children: "Tr\u00E8s grande" })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: "Contraste \u00E9lev\u00E9" }), _jsx("div", { className: "text-sm text-gray-500", children: "Am\u00E9liorer la lisibilit\u00E9" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" })] })] })] })] })] }))] })] }))] })] })] }) }));
}
