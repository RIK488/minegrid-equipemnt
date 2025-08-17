import React, { useState, useEffect } from 'react';
import { Plus, Package, Settings, FileText, Bell, User, LogOut, ChevronRight, Shield, Wallet, RefreshCw, Eye, MessageSquare, DollarSign, Camera, X } from 'lucide-react';
import { getSellerMachines, logoutUser, getDashboardStats, getWeeklyActivityData, getOffers } from '../utils/api';
import { supabaseClient as supabase } from '../utils/supabaseClient';

// Fonction utilitaire pour vérifier si une configuration valide existe
const hasValidConfiguration = () => {
    // Vérifier d'abord si la configuration a été explicitement validée
    const isConfigured = localStorage.getItem('enterpriseDashboardConfigured');
    if (isConfigured !== 'true') {
        console.log('🔍 Configuration non validée explicitement');
        return false;
    }
    
    const vendeurConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    const generalConfig = localStorage.getItem('enterpriseDashboardConfig');
    
    // Vérifier d'abord la configuration vendeur
    if (vendeurConfig && vendeurConfig !== 'null' && vendeurConfig !== 'undefined' && vendeurConfig !== '' && vendeurConfig !== '{}') {
        try {
            const config = JSON.parse(vendeurConfig);
            if (config && 
                config.widgets && 
                Array.isArray(config.widgets) && 
                config.widgets.length > 0 &&
                config.widgets.every(widget => widget && typeof widget === 'object' && widget.type && widget.title)) {
                console.log('✅ Configuration vendeur valide détectée');
                return true;
            }
        } catch (e) {
            console.log('❌ Erreur parsing vendeurConfig:', e);
        }
    }
    
    // Vérifier la configuration générale
    if (generalConfig && generalConfig !== 'null' && generalConfig !== 'undefined' && generalConfig !== '' && generalConfig !== '{}') {
        try {
            const config = JSON.parse(generalConfig);
            if (config && 
                config.dashboardConfig && 
                config.dashboardConfig.widgets && 
                Array.isArray(config.dashboardConfig.widgets) && 
                config.dashboardConfig.widgets.length > 0 &&
                config.dashboardConfig.widgets.every(widget => widget && typeof widget === 'object' && widget.type && widget.title)) {
                console.log('✅ Configuration générale valide détectée');
                return true;
            }
        } catch (e) {
            console.log('❌ Erreur parsing generalConfig:', e);
        }
    }
    
    console.log('❌ Aucune configuration valide détectée');
    return false;
};

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
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [selectedMessageForReply, setSelectedMessageForReply] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(() => {
        // Vérifier si l'abonnement a été explicitement résilié
        const subscriptionCancelled = localStorage.getItem('subscriptionCancelled');
        if (subscriptionCancelled === 'true') {
            return false;
        }
        
        // Vérifier s'il y a un abonnement temporaire dans localStorage
        const tempHasActive = localStorage.getItem('tempHasActiveSubscription');
        const tempSubscription = localStorage.getItem('tempSubscription');
        
        if (tempHasActive === 'true' && tempSubscription) {
            return true;
        }
        
        // Vérifier si l'utilisateur a déjà un abonnement enregistré
        const userSubscription = localStorage.getItem('userSubscription');
        if (userSubscription) {
            return true;
        }
        
        // Utiliser la fonction utilitaire pour vérifier la configuration
        const hasRealConfiguration = hasValidConfiguration();
        
        // Si l'utilisateur a une configuration réelle, il a un abonnement actif
        return hasRealConfiguration;
    });
    
    const [subscriptionType, setSubscriptionType] = useState(() => {
        // Vérifier si l'abonnement a été explicitement résilié
        const subscriptionCancelled = localStorage.getItem('subscriptionCancelled');
        if (subscriptionCancelled === 'true') {
            return 'aucun';
        }
        
        // Vérifier s'il y a un abonnement temporaire dans localStorage
        const tempSubscription = localStorage.getItem('tempSubscription');
        if (tempSubscription) {
            return tempSubscription;
        }
        
        // Vérifier si l'utilisateur a déjà un abonnement enregistré
        const userSubscription = localStorage.getItem('userSubscription');
        if (userSubscription) {
            return userSubscription;
        }
        
        // Utiliser la fonction utilitaire pour vérifier la configuration
        const hasRealConfiguration = hasValidConfiguration();
        
        // Si l'utilisateur a une configuration réelle, il a un abonnement entreprise
        return hasRealConfiguration ? 'entreprise' : 'aucun';
    });

    const [isFirstTimeEnterpriseDashboard, setIsFirstTimeEnterpriseDashboard] = useState(() => {
        // Vérifier si c'est la première fois qu'on accède au tableau de bord entreprise
        return !localStorage.getItem('enterpriseDashboardConfigured');
    });

    const [navigation, setNavigation] = useState([
        { name: 'Vue d\'ensemble', href: '#dashboard/overview', icon: Eye },
        { name: 'Mes annonces', href: '#dashboard/annonces', icon: Package },
        { name: 'Services', href: '#dashboard/services', icon: Shield },
        { name: 'Mon abonnement', href: '#dashboard/abonnement', icon: Wallet },
        { name: 'Notifications', href: '#dashboard/notifications', icon: Bell },
        { name: 'Paramètres', href: '#dashboard/settings', icon: Settings }
    ]);

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    useEffect(() => {
        loadMachines();
        loadDashboardData();
        loadUserData();
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        // Mettre à jour le nom de la navigation selon le type d'abonnement
        setNavigation(prev => prev.map(item => {
            if (item.name === 'Vue d\'ensemble' || item.name === 'Tableau de bord') {
                return {
                    ...item,
                    name: (!hasActiveSubscription || subscriptionType === 'gratuit') ? 'Vue d\'ensemble' : 'Tableau de bord'
                };
            }
            return item;
        }));
    }, [hasActiveSubscription, subscriptionType]);

    const loadMachines = async () => {
        try {
            setLoading(true);
            const machinesData = await getSellerMachines();
            setMachines(machinesData || []);
        } catch (error) {
            console.error('Erreur lors du chargement des machines:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardData = async () => {
        try {
            // Charger les données de base
            const [statsData, weeklyData, offersData] = await Promise.all([
                getDashboardStats(),
                getWeeklyActivityData(),
                getOffers()
            ]);
            setStats(statsData);
            setWeeklyData(weeklyData || []);
            setOffers(offersData || []);

            // Charger les messages depuis Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: messagesData, error } = await supabase
                    .from('messages')
                    .select(`
                        *,
                        machine:machines(name, brand, model, images)
                    `)
                    .eq('recipient_email', user.email)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Erreur lors du chargement des messages:', error);
                    setMessages([]);
                } else {
                    setMessages(messagesData || []);
                    console.log('📧 Messages chargés:', messagesData?.length || 0);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données du dashboard:', error);
        }
    };

    const loadUserData = async () => {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                setUserName(user.name || user.email || 'Utilisateur');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error);
        }
    };

    const handleHashChange = () => {
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(window.location.search);
        
        // Gérer les paramètres d'URL pour les réponses
        const replyMessageId = urlParams.get('reply');
        const tabParam = urlParams.get('tab');
        
        if (replyMessageId) {
            // Si on a un ID de message à répondre, charger le message et ouvrir le modal
            loadMessageForReply(replyMessageId);
        }
        
        if (tabParam === 'messages') {
            setActiveSection('messages');
        } else if (hash.includes('dashboard/')) {
            const section = hash.split('/')[1];
            setActiveSection(section);
        }
    };

    const loadMessageForReply = async (messageId) => {
        try {
            const { data: message, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    machine:machines(name, brand, model, images)
                `)
                .eq('id', messageId)
                .single();

            if (error) {
                console.error('Erreur chargement message pour réponse:', error);
                return;
            }

            if (message) {
                setSelectedMessageForReply(message);
                setActiveSection('messages');
                // Nettoyer l'URL
                const newUrl = window.location.pathname + '#dashboard/messages';
                window.history.replaceState({}, '', newUrl);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du message:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            window.location.href = '/';
        }
    };

    const handleCancelSubscription = () => {
        if (confirm('Êtes-vous sûr de vouloir résilier votre abonnement ?')) {
            setHasActiveSubscription(false);
            setSubscriptionType('aucun');
            
            // Nettoyer les données temporaires et l'abonnement enregistré du localStorage
            localStorage.removeItem('tempSubscription');
            localStorage.removeItem('tempHasActiveSubscription');
            localStorage.removeItem('enterpriseDashboardConfigured');
            localStorage.removeItem('userSubscription');
            
            // Marquer explicitement l'abonnement comme résilié
            localStorage.setItem('subscriptionCancelled', 'true');
            
            alert('Votre abonnement a été résilié avec succès ! Vous pouvez maintenant choisir un nouvel abonnement.');
        }
    };

    const resetEnterpriseDashboard = () => {
        if (confirm('Voulez-vous réinitialiser votre tableau de bord entreprise ? Cela vous permettra de le reconfigurer.')) {
            localStorage.removeItem('enterpriseDashboardConfigured');
            setIsFirstTimeEnterpriseDashboard(true);
            alert('Tableau de bord entreprise réinitialisé. Vous pouvez maintenant le reconfigurer.');
        }
    };

    const handleActivateSubscription = (type) => {
        setHasActiveSubscription(true);
        setSubscriptionType(type);
        
        // Enregistrer l'abonnement dans localStorage
        localStorage.setItem('userSubscription', type);
        
        // Supprimer le marqueur de résiliation
        localStorage.removeItem('subscriptionCancelled');
        
        alert(`Abonnement ${type} activé avec succès !`);
        // Rediriger vers la vue d'ensemble pour voir le tableau de bord complet
        setActiveSection('overview');
        window.location.hash = '#dashboard/overview';
    };

    const formatNumber = (num) => {
        return num ? num.toLocaleString() : '0';
    };

    const getBarWidth = (value, maxValue) => {
        if (!maxValue || maxValue === 0) return 0;
        return Math.min((value / maxValue) * 100, 100);
    };

    const markMessageAsRead = async (messageId) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ status: 'read' })
                .eq('id', messageId);

            if (error) {
                console.error('Erreur lors du marquage comme lu:', error);
                return;
            }

            // Mettre à jour l'état local
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === messageId ? { ...msg, status: 'read' } : msg
                )
            );

            console.log('✅ Message marqué comme lu');
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    const handleReplyToMessage = (message) => {
        setSelectedMessageForReply(message);
        setReplyText('');
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedMessageForReply) return;

        setIsSendingReply(true);
        try {
            // Obtenir l'utilisateur actuel
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('Utilisateur non connecté');
            }

            // 1. Sauvegarder la réponse dans la base de données
            const { data: replyData, error: replyError } = await supabase
                .from('messages')
                .insert({
                    sender_email: user.email, // L'utilisateur actuel
                    sender_name: user.user_metadata?.full_name || 'Utilisateur',
                    recipient_email: selectedMessageForReply.sender_email, // L'expéditeur original
                    subject: `Réponse - ${selectedMessageForReply.subject || 'Demande d\'information'}`,
                    message: replyText,
                    parent_message_id: selectedMessageForReply.id,
                    status: 'new'
                })
                .select()
                .single();

            if (replyError) throw replyError;

            // 2. Envoyer l'email de réponse via la fonction Edge
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
                body: {
                    to: selectedMessageForReply.sender_email,
                    from: 'contact@minegrid-equipment.com',
                    subject: `Réponse - ${selectedMessageForReply.subject || 'Demande d\'information'}`,
                    html: `
                        <h2>Réponse à votre demande</h2>
                        <p><strong>Message original :</strong></p>
                        <p>${selectedMessageForReply.message}</p>
                        <hr>
                        <p><strong>Notre réponse :</strong></p>
                        <p>${replyText.replace(/\n/g, '<br>')}</p>
                        <hr>
                        <p>Cordialement,<br>L'équipe Minegrid Équipement</p>
                    `,
                    machineId: selectedMessageForReply.machine_id || 'reply',
                    messageId: replyData.id
                }
            });

            // 3. Créer une notification interne
            const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                    user_email: selectedMessageForReply.sender_email,
                    title: 'Nouvelle réponse reçue',
                    message: `Vous avez reçu une réponse à votre message "${selectedMessageForReply.subject || 'Demande d\'information'}"`,
                    type: 'message_reply',
                    data: {
                        original_message_id: selectedMessageForReply.id,
                        reply_message_id: replyData.id,
                        sender_email: user.email,
                        sender_name: user.user_metadata?.full_name || 'Utilisateur'
                    },
                    read: false
                });

            // 4. Mettre à jour le statut du message original
            const { error: updateError } = await supabase
                .from('messages')
                .update({ status: 'replied' })
                .eq('id', selectedMessageForReply.id);

            // 5. Mettre à jour le statut de la réponse
            if (replyData.id) {
                const { error: replyUpdateError } = await supabase
                    .from('messages')
                    .update({ 
                        status: emailError ? 'failed' : 'sent',
                        sent_at: emailError ? null : new Date().toISOString(),
                        error_message: emailError ? emailError.message : null
                    })
                    .eq('id', replyData.id);
            }

            if (replyError) throw replyError;
            if (emailError) console.error('Erreur email:', emailError);
            if (notificationError) console.error('Erreur notification:', notificationError);
            if (updateError) console.error('Erreur mise à jour:', updateError);

            // Succès
            setReplyText('');
            setSelectedMessageForReply(null);
            loadDashboardData(); // Recharger les données
            
            // Afficher notification de succès
            if (emailError) {
                alert('Réponse sauvegardée mais erreur d\'envoi email. Le destinataire recevra une notification interne.');
            } else {
                alert('Réponse envoyée avec succès !');
            }

        } catch (error) {
            console.error('Erreur lors de l\'envoi de la réponse:', error);
            alert('Erreur lors de l\'envoi de la réponse');
        } finally {
            setIsSendingReply(false);
        }
    };

    const maxWeeklyViews = Math.max(...weeklyData, 1);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                            {(!hasActiveSubscription || subscriptionType === 'gratuit') ? 'Vue d\'ensemble' : 'Tableau de bord'}
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Bienvenue{userName ? `, ${userName}` : ''}
                        </p>
                        <nav className="flex mt-3" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2">
                                <li>
                                    <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                                        Accueil
                                    </a>
                                </li>
                                <ChevronRight className="h-4 w-4 text-orange-400" />
                                <li>
                                    <span className="text-gray-700 font-medium">
                                        {(!hasActiveSubscription || subscriptionType === 'gratuit') ? 'Vue d\'ensemble' : 'Tableau de bord'}
                                    </span>
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
                        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-orange-100">
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
                                                (activeSection === 'overview' && (item.name === 'Vue d\'ensemble' || item.name === 'Tableau de bord')) || 
                                                (activeSection === item.name.toLowerCase().replace(' ', '').replace('\'', ''))
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

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Vue d'ensemble */}
                        {activeSection === 'overview' && (
                            <div className="space-y-6">
                                {/* Statistiques */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
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

                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats ? formatNumber(stats.totalViews) : '0'}
                                                </p>
                                                <p className={`text-xs mt-1 ${stats?.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {stats?.weeklyGrowth >= 0 ? '+' : ''}{stats?.weeklyGrowth || 0}% cette semaine
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                                                <Eye className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveSection('messages')}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Messages reçus</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {messages.length}
                                                </p>
                                                <p className="text-xs text-orange-600 mt-1">
                                                    {messages.filter(m => m.status === 'new').length} nouveau{messages.filter(m => m.status === 'new').length > 1 ? 'x' : ''}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                                                <MessageSquare className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Offres reçues</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats ? formatNumber(stats.totalOffers) : '0'}
                                                </p>
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

                                {(!hasActiveSubscription || subscriptionType === 'gratuit') ? (
                                    // Vue simplifiée pour les abonnements gratuits
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Votre abonnement</h3>
                                            <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                                                Gratuit
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-700">Jusqu'à 3 images par annonce</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-700">Support par email</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-700">Statistiques de base</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-orange-200">
                                            <button
                                                onClick={() => setActiveSection('abonnement')}
                                                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                                            >
                                                Passer à un abonnement payant
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Vue complète pour les abonnements payants
                                    <>
                                        {/* Abonnement dynamique selon le type */}
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Votre abonnement</h3>
                                                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full capitalize">
                                                    {subscriptionType}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {subscriptionType === 'premium' && (
                                                    <>
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
                                                    </>
                                                )}
                                                {subscriptionType === 'pro' && (
                                                    <>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Visibilité maximale et positionnement prioritaire</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Jusqu'à 12 images par annonce</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Support prioritaire par téléphone, email et chat</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Analytics avancés et rapports personnalisés</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Tableau de bord professionnel</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Formation et accompagnement</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Badge 'Pro' exclusif</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Services de financement et logistique</span>
                                                        </div>
                                                    </>
                                                )}
                                                {subscriptionType === 'entreprise' && (
                                                    <>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Visibilité renforcée sur la page d'accueil</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Jusqu'à 15 images par annonce</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Support prioritaire 24/7</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Statistiques détaillées et analytics</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Tableau de bord entreprise personnalisé</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Gestion multi-utilisateurs</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">API d'intégration</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Analytics complets</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                            <span className="text-gray-700">Réseau partenarial intégré</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-orange-200">
                                                <p className="text-xs text-gray-600">Renouvellement automatique le 15 juillet 2024</p>
                                            </div>
                                        </div>

                                        {/* Activité récente et Annonces récentes */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Activité récente */}
                                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Vues cette semaine</span>
                                                        <span className="font-medium text-gray-900">
                                                            {weeklyData.reduce((sum, day) => sum + day.views, 0)}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {weekDays.map((day, index) => {
                                                            const dayData = weeklyData[index] || { views: 0 };
                                                            return (
                                                                <div key={day} className="flex items-center space-x-3">
                                                                    <span className="text-xs text-gray-500 w-8">{day}</span>
                                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${getBarWidth(dayData.views, maxWeeklyViews)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600 w-8 text-right">{dayData.views}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Annonces récentes */}
                                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Annonces récentes</h3>
                                                <div className="space-y-3">
                                                    {machines.slice(0, 3).map((machine) => (
                                                        <div key={machine.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                            <div className="h-8 w-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                                                                <Package className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{machine.title}</p>
                                                                <p className="text-xs text-gray-500">{machine.category}</p>
                                                            </div>
                                                            <span className="text-xs text-gray-400">{machine.created_at}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions rapides */}
                                        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <a
                                                    href="#vendre"
                                                    className="flex flex-col items-center p-4 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                                                >
                                                    <Plus className="h-6 w-6 text-orange-600 mb-2" />
                                                    <span className="text-sm font-medium text-gray-700">Nouvelle annonce</span>
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        // Récupérer le type d'abonnement actuel
                                                        const currentSubscription = localStorage.getItem('userSubscription') || subscriptionType;
                                                        
                                                        console.log('🔍 Type d\'abonnement actuel:', currentSubscription);

                                                        // Rediriger selon le type d'abonnement
                                                        switch (currentSubscription) {
                                                            case 'premium':
                                                                // Premium : accès au tableau de bord standard
                                                                setHasActiveSubscription(true);
                                                                setSubscriptionType('premium');
                                                                window.location.href = '/#dashboard/overview';
                                                                break;
                                                                
                                                            case 'pro':
                                                                // Pro : accès à l'espace pro
                                                                setHasActiveSubscription(true);
                                                                setSubscriptionType('pro');
                                                                window.location.href = '/#pro';
                                                                break;
                                                                
                                                            case 'entreprise':
                                                                // Entreprise : configuration ou accès au tableau de bord
                                                                setHasActiveSubscription(true);
                                                                setSubscriptionType('entreprise');
                                                                
                                                                // Nettoyer les configurations invalides pour forcer la configuration
                                                                const isConfigured = localStorage.getItem('enterpriseDashboardConfigured');
                                                                if (isConfigured !== 'true') {
                                                                    // Supprimer les configurations invalides
                                                                    localStorage.removeItem('enterpriseDashboardConfig_vendeur');
                                                                    localStorage.removeItem('enterpriseDashboardConfig');
                                                                    console.log('🧹 Nettoyage des configurations invalides');
                                                                }
                                                                
                                                                // Utiliser la fonction utilitaire pour vérifier la configuration
                                                                const hasRealConfiguration = hasValidConfiguration();
                                                                
                                                                console.log('🔍 Debug configuration entreprise:', {
                                                                    hasRealConfiguration,
                                                                    vendeurConfig: localStorage.getItem('enterpriseDashboardConfig_vendeur'),
                                                                    generalConfig: localStorage.getItem('enterpriseDashboardConfig'),
                                                                    isConfigured: localStorage.getItem('enterpriseDashboardConfigured')
                                                                });
                                                                
                                                                // Par défaut, rediriger vers la configuration
                                                                // Seulement si une configuration valide existe, aller au dashboard
                                                                if (hasRealConfiguration) {
                                                                    console.log('✅ Utilisateur entreprise existant - redirection vers dashboard');
                                                                    // L'utilisateur a déjà un tableau de bord configuré
                                                                    // Rediriger directement vers son tableau de bord
                                                                    window.location.href = '/#dashboard-entreprise-display';
                                                                } else {
                                                                    console.log('🚀 Nouvel utilisateur entreprise - redirection vers configuration');
                                                                    // Rediriger vers la configuration par défaut
                                                                    window.location.href = '/#dashboard-entreprise';
                                                                }
                                                                break;
                                                                
                                                            default:
                                                                // Par défaut, rediriger vers la configuration
                                                                console.log('🚀 Aucun abonnement détecté - redirection vers configuration');
                                                                window.location.href = '/#dashboard-entreprise';
                                                                break;
                                                        }
                                                    }}
                                                    className="flex flex-col items-center p-4 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                                                >
                                                    <Shield className="h-6 w-6 text-orange-600 mb-2" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Accéder à mon service
                                                    </span>
                                                </button>
                                                <a
                                                    href="#contact"
                                                    className="flex flex-col items-center p-4 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                                                >
                                                    <MessageSquare className="h-6 w-6 text-orange-600 mb-2" />
                                                    <span className="text-sm font-medium text-gray-700">Contacter le support</span>
                                                </a>
                                                



                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Page d'abonnement */}
                        {activeSection === 'abonnement' && (
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100">
                                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                    Mon abonnement
                                </h2>
                                
                                {hasActiveSubscription ? (
                                    <>
                                        <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                            <p className="mb-4 text-lg">
                                                Vous êtes actuellement sur l'offre{' '}
                                                <span className="text-orange-700 font-bold capitalize">{subscriptionType}</span>.
                                            </p>
                                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                                {subscriptionType === 'premium' && (
                                                    <>
                                                        <li>Jusqu'à 10 images par annonce</li>
                                                        <li>Visibilité renforcée sur la page d'accueil</li>
                                                        <li>Support prioritaire</li>
                                                        <li>Statistiques détaillées</li>
                                                    </>
                                                )}
                                                {subscriptionType === 'pro' && (
                                                    <>
                                                        <li>Jusqu'à 12 images par annonce</li>
                                                        <li>Visibilité maximale et positionnement prioritaire</li>
                                                        <li>Support prioritaire par téléphone, email et chat</li>
                                                        <li>Analytics avancés et rapports personnalisés</li>
                                                        <li>Tableau de bord professionnel</li>
                                                        <li>Formation et accompagnement</li>
                                                        <li>Badge 'Pro' exclusif</li>
                                                        <li>Services de financement et logistique</li>
                                                    </>
                                                )}
                                                {subscriptionType === 'entreprise' && (
                                                    <>
                                                        <li>Jusqu'à 15 images par annonce</li>
                                                        <li>Visibilité renforcée sur la page d'accueil</li>
                                                        <li>Support prioritaire 24/7</li>
                                                        <li>Statistiques détaillées et analytics</li>
                                                        <li>Accès au tableau de bord entreprise</li>
                                                        <li>Gestion multi-utilisateurs</li>
                                                        <li>API d'intégration</li>
                                                        <li>Analytics complets</li>
                                                        <li>Réseau partenarial intégré</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <h4 className="font-semibold text-green-800 mb-2">Statut de l'abonnement</h4>
                                                <p className="text-sm text-green-700">Actif jusqu'au 15 juillet 2024</p>
                                            </div>
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 mb-2">Prochain paiement</h4>
                                                <p className="text-sm text-blue-700">
                                                    15 juillet 2024 - 
                                                    {subscriptionType === 'premium' ? ' 49€/mois' : 
                                                     subscriptionType === 'pro' ? ' 149€/mois' : 
                                                     subscriptionType === 'entreprise' ? ' Sur devis' : ' 0€/mois'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                                            >
                                                Résilier mon abonnement
                                            </button>
                                            <button
                                                onClick={() => window.location.hash = '#contact'}
                                                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                                            >
                                                Contacter le support
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // Affichage des offres d'abonnement
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Offre Premium */}
                                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200 relative">
                                                <div className="text-center">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium</h3>
                                                    <div className="text-3xl font-bold text-orange-600 mb-4">49€<span className="text-lg text-gray-500">/mois</span></div>
                                                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                                                        <li>• Visibilité renforcée sur la page d'accueil</li>
                                                        <li>• Jusqu'à 10 images par annonce</li>
                                                        <li>• Support prioritaire</li>
                                                        <li>• Statistiques détaillées</li>
                                                    </ul>
                                                    <button
                                                        onClick={() => handleActivateSubscription('premium')}
                                                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                                                    >
                                                        Choisir Premium
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Offre Pro */}
                                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200 relative">
                                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                                        Populaire
                                                    </span>
                                                </div>
                                                <div className="text-center pt-8">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                                                    <div className="text-3xl font-bold text-orange-600 mb-4">149€<span className="text-lg text-gray-500">/mois</span></div>
                                                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                                                        <li>• Visibilité maximale et positionnement prioritaire</li>
                                                        <li>• Jusqu'à 12 images par annonce</li>
                                                        <li>• Support prioritaire par téléphone, email et chat</li>
                                                        <li>• Analytics avancés et rapports personnalisés</li>
                                                        <li>• Tableau de bord professionnel</li>
                                                        <li>• Formation et accompagnement</li>
                                                        <li>• Badge 'Pro' exclusif</li>
                                                        <li>• Services de financement et logistique</li>
                                                    </ul>
                                                    <button
                                                        onClick={() => handleActivateSubscription('pro')}
                                                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                                                    >
                                                        Choisir Pro
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Offre Entreprise */}
                                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200 relative">
                                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                                        Devis
                                                    </span>
                                                </div>
                                                <div className="text-center pt-8">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Entreprise</h3>
                                                    <div className="text-3xl font-bold text-orange-600 mb-4">Sur devis</div>
                                                    <div className="text-sm text-gray-500 mb-4">Appel conseiller</div>
                                                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                                                        <li>• Visibilité renforcée sur la page d'accueil</li>
                                                        <li>• Jusqu'à 15 images par annonce</li>
                                                        <li>• Support prioritaire 24/7</li>
                                                        <li>• Statistiques détaillées et analytics</li>
                                                        <li>• Tableau de bord entreprise personnalisé</li>
                                                        <li>• Gestion multi-utilisateurs</li>
                                                        <li>• API d'intégration</li>
                                                        <li>• Analytics complets</li>
                                                        <li>• Réseau partenarial intégré</li>
                                                    </ul>
                                                    <button
                                                        onClick={() => window.location.hash = '#contact'}
                                                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                                                    >
                                                        Contacter un conseiller
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Autres sections */}
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
                                        <a
                                            href="#vendre"
                                            className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline"
                                        >
                                            Nouvelle annonce
                                        </a>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                                    </div>
                                ) : machines.length > 0 ? (
                                    <div className="space-y-4">
                                        {machines.slice(0, 5).map((machine) => (
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
                                        ))}
                                    </div>
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
                        )}

                        {activeSection === 'services' && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                    Mes Services Entreprise
                                </h3>
                                <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                    <p className="text-gray-800 font-medium">
                                        Formule actuelle :{' '}
                                        <span className="text-orange-700 font-bold">Service Entreprise Pro</span>
                                    </p>
                                    <p className="text-sm text-orange-600 mt-1">Renouvellement automatique le 15 juillet 2024</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 border-b border-orange-200 pb-3 text-lg">
                                            Services Entreprise Actifs
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center p-4 bg-gradient-to-r from-green-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-green-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Annonces en vedette</h5>
                                                    <p className="text-sm text-orange-700">Affichage prioritaire et badge Entreprise</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-blue-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Médias enrichis</h5>
                                                    <p className="text-sm text-orange-700">Jusqu'à 15 images par annonce + vidéos et vues 360°</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-purple-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Tableau de bord personnalisé</h5>
                                                    <p className="text-sm text-orange-700">Analytics complets et métriques avancées</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-red-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-red-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Support prioritaire 24/7</h5>
                                                    <p className="text-sm text-orange-700">Assistance téléphonique, email et chat en direct</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-indigo-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">API d'intégration</h5>
                                                    <p className="text-sm text-orange-700">Connexion avec vos systèmes existants</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-yellow-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-yellow-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Gestion multi-utilisateurs</h5>
                                                    <p className="text-sm text-orange-700">Accès pour toute votre équipe</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 border-b border-orange-200 pb-3 text-lg">
                                            Services Premium
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-emerald-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Réseau partenarial</h5>
                                                    <p className="text-sm text-orange-700">Accès exclusif au réseau de partenaires</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-teal-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-teal-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Formation personnalisée</h5>
                                                    <p className="text-sm text-orange-700">Sessions de formation dédiées à votre équipe</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-cyan-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-cyan-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Services de financement</h5>
                                                    <p className="text-sm text-orange-700">Solutions de financement sur mesure</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 via-orange-100 to-orange-200 rounded-xl border border-orange-300 shadow-sm">
                                                <div className="w-4 h-4 bg-gradient-to-r from-pink-100 via-orange-200 to-orange-400 rounded-full mr-4 shadow-sm"></div>
                                                <div>
                                                    <h5 className="font-semibold text-orange-900">Logistique intégrée</h5>
                                                    <p className="text-sm text-orange-700">Services de transport et logistique</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'messages' && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                        Messages reçus
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-500">
                                            {messages.length} message{messages.length > 1 ? 's' : ''}
                                        </span>
                                        <button 
                                            onClick={loadDashboardData}
                                            className="text-sm text-orange-600 hover:text-orange-800 flex items-center space-x-1"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Actualiser</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {messages.length > 0 ? (
                                        messages.map((message, index) => (
                                            <div key={message.id || index} className={`flex items-start p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                                                message.status === 'new' 
                                                    ? 'bg-gradient-to-r from-blue-50 via-orange-100 to-orange-200 border-orange-300' 
                                                    : 'bg-gradient-to-r from-gray-50 via-orange-50 to-orange-100 border-gray-300'
                                            }`}>
                                                <div className="flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                                                        message.status === 'new' 
                                                            ? 'bg-gradient-to-br from-blue-100 via-orange-200 to-orange-400' 
                                                            : 'bg-gradient-to-br from-gray-100 via-orange-100 to-orange-300'
                                                    }`}>
                                                        <span className="text-orange-700 text-sm font-medium">💬</span>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-orange-900">
                                                                {message.sender_name || 'Prospect'}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {message.sender_email}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {message.status === 'new' && (
                                                                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                                                                    Nouveau
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-orange-600 bg-white px-2 py-1 rounded-full">
                                                                {new Date(message.created_at).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {message.subject && (
                                                        <p className="text-sm font-medium text-gray-800 mt-2">
                                                            {message.subject}
                                                        </p>
                                                    )}
                                                    
                                                    <p className="text-sm text-orange-700 mt-2">
                                                        {message.message?.length > 150 
                                                            ? `${message.message.substring(0, 150)}...` 
                                                            : message.message
                                                        }
                                                    </p>
                                                    
                                                    {message.machine && (
                                                        <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                                                            <p className="text-xs text-orange-600">
                                                                <strong>Équipement :</strong> {message.machine.name || `${message.machine.brand} ${message.machine.model}`}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center mt-3 space-x-2">
                                                        <button 
                                                            onClick={() => window.open(`/machine/${message.machine_id}`, '_blank')}
                                                            className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                                                        >
                                                            Voir l'équipement
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReplyToMessage(message)}
                                                            className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                                                        >
                                                            Répondre
                                                        </button>
                                                        {message.status === 'new' && (
                                                            <button 
                                                                onClick={() => markMessageAsRead(message.id)}
                                                                className="text-xs bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 transition-colors"
                                                            >
                                                                Marquer comme lu
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 text-6xl mb-4">💬</div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
                                            <p className="text-gray-500">Vous n'avez pas encore reçu de messages.</p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Les messages apparaîtront ici quand des utilisateurs vous contacteront via vos annonces.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                        Notifications
                                    </h3>
                                </div>
                                <div className="space-y-4">
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'settings' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
                                            <p className="text-gray-600 mt-1">Gérez vos préférences et votre compte</p>
                                        </div>
                                    </div>
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

                                <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                                    {activeSettingsTab === 'profil' && (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
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
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de réponse */}
            {selectedMessageForReply && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Répondre à {selectedMessageForReply.sender_name}
                                </h3>
                                <button
                                    onClick={() => setSelectedMessageForReply(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Message original */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Message original :</h4>
                                <p className="text-sm text-gray-700">{selectedMessageForReply.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    De : {selectedMessageForReply.sender_email} - {new Date(selectedMessageForReply.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>

                            {/* Formulaire de réponse */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Votre réponse :
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Tapez votre réponse ici..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                    rows={6}
                                />
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setSelectedMessageForReply(null)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isSendingReply}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyText.trim() || isSendingReply}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        !replyText.trim() || isSendingReply
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                >
                                    {isSendingReply ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Envoi...</span>
                                        </div>
                                    ) : (
                                        'Envoyer la réponse'
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
