import React, { useState, useEffect } from 'react';
import { Plus, Package, Settings, FileText, Bell, User, LogOut, ChevronRight, Shield, Wallet, RefreshCw, Eye, MessageSquare, DollarSign, Camera } from 'lucide-react';
import { getSellerMachines, logoutUser, getDashboardStats, getWeeklyActivityData, getMessages, getOffers } from '../utils/api';

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

    const navigation = [
        { name: 'Vue d\'ensemble', href: '#dashboard/overview', icon: Eye },
        { name: 'Mes annonces', href: '#dashboard/annonces', icon: Package },
        { name: 'Services', href: '#dashboard/services', icon: Shield },
        { name: 'Mon abonnement', href: '#dashboard/abonnement', icon: Wallet },
        { name: 'Notifications', href: '#dashboard/notifications', icon: Bell },
        { name: 'Paramètres', href: '#dashboard/settings', icon: Settings }
    ];

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    useEffect(() => {
        loadMachines();
        loadDashboardData();
        loadUserData();
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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
            const [statsData, weeklyData, messagesData, offersData] = await Promise.all([
                getDashboardStats(),
                getWeeklyActivityData(),
                getMessages(),
                getOffers()
            ]);
            setStats(statsData);
            setWeeklyData(weeklyData || []);
            setMessages(messagesData || []);
            setOffers(offersData || []);
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
        if (hash.includes('dashboard/')) {
            const section = hash.split('/')[1];
            setActiveSection(section);
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
        if (confirm('Êtes-vous sûr de vouloir résilier votre abonnement entreprise ?')) {
            alert('Votre abonnement entreprise a été résilié avec succès !');
        }
    };

    const formatNumber = (num) => {
        return num ? num.toLocaleString() : '0';
    };

    const getBarWidth = (value, maxValue) => {
        if (!maxValue || maxValue === 0) return 0;
        return Math.min((value / maxValue) * 100, 100);
    };

    const maxWeeklyViews = Math.max(...weeklyData, 1);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
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
                                    <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                                        Accueil
                                    </a>
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

                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Messages reçus</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {stats ? formatNumber(stats.totalMessages) : '0'}
                                                </p>
                                                <p className="text-xs text-orange-600 mt-1">
                                                    {messages.filter(m => !m.is_read).length} nouveau{messages.filter(m => !m.is_read).length > 1 ? 'x' : ''}
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

                                {/* Abonnement Entreprise */}
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Votre abonnement</h3>
                                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                            Entreprise
                                        </span>
                                    </div>
                                    <div className="space-y-3">
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
                                            <span className="text-gray-700">Accès au tableau de bord entreprise</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-orange-200">
                                        <p className="text-xs text-gray-600">Renouvellement automatique le 15 juillet 2024</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Page d'abonnement */}
                        {activeSection === 'abonnement' && (
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100">
                                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                    Mon abonnement
                                </h2>
                                
                                <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                    <p className="mb-4 text-lg">
                                        Vous êtes actuellement sur l'offre{' '}
                                        <span className="text-orange-700 font-bold">Entreprise</span>.
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                        <li>Téléchargement jusqu'à 15 images par annonce</li>
                                        <li>Visibilité renforcée sur la page d'accueil</li>
                                        <li>Support prioritaire 24/7</li>
                                        <li>Statistiques détaillées et analytics</li>
                                        <li>Accès au tableau de bord entreprise</li>
                                        <li>Gestion multi-utilisateurs</li>
                                        <li>API d'intégration</li>
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h4 className="font-semibold text-green-800 mb-2">Statut de l'abonnement</h4>
                                        <p className="text-sm text-green-700">Actif jusqu'au 15 juillet 2024</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Prochain paiement</h4>
                                        <p className="text-sm text-blue-700">15 juillet 2024 - 299€/mois</p>
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
                                        </div>
                                    </div>
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
        </div>
    );
}
