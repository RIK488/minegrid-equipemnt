import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Package, FileText, Wrench, Activity, Users, Bell, Plus, Search, Filter, Download, Eye, Edit, Trash, Calendar, AlertTriangle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { getProClientProfile, getClientEquipment, getClientOrders, getMaintenanceInterventions, getClientNotifications, getPortalStats, addClientEquipment, createClientOrder, createMaintenanceIntervention, inviteClientUser } from '../utils/proApi';
export default function ProDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [proProfile, setProProfile] = useState(null);
    const [equipment, setEquipment] = useState([]);
    const [orders, setOrders] = useState([]);
    const [interventions, setInterventions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewMenu, setShowNewMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    useEffect(() => {
        loadDashboardData();
    }, []);
    const loadDashboardData = async () => {
        try {
            const [profile, equipmentData, ordersData, interventionsData, notificationsData, statsData] = await Promise.all([
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
        }
        catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleNewButtonClick = () => {
        setShowNewMenu(!showNewMenu);
    };
    const handleNewItem = (type) => {
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
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Chargement du portail Pro..." })] }) }));
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center py-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900", children: ["Portail Pro - ", proProfile?.company_name || 'Minegrid'] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Abonnement ", proProfile?.subscription_type || 'Pro', " \u2022", proProfile?.subscription_status === 'active' ? (_jsx("span", { className: "text-orange-600 ml-1", children: "Actif" })) : (_jsx("span", { className: "text-orange-600 ml-1", children: "En attente" }))] })] }), _jsx("div", { className: "flex items-center space-x-4", children: _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: handleNewButtonClick, className: "bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Nouveau", _jsx(ChevronDown, { className: "h-4 w-4 ml-2" })] }), showNewMenu && (_jsx("div", { className: "absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50", children: _jsx("div", { className: "py-2", children: getNewMenuItems().map((item) => {
                                                    const Icon = item.icon;
                                                    return (_jsxs("button", { onClick: () => handleNewItem(item.type), className: "w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors", children: [_jsx(Icon, { className: "h-4 w-4 mr-3" }), item.label] }, item.type));
                                                }) }) }))] }) })] }) }) }), _jsx("nav", { className: "bg-white border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "h-4 w-4 mr-2" }), tab.label] }, tab.id));
                        }) }) }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'overview' && _jsx(OverviewTab, { stats: stats }), activeTab === 'equipment' && _jsx(EquipmentTab, { equipment: equipment, onRefresh: loadDashboardData }), activeTab === 'orders' && _jsx(OrdersTab, { orders: orders, onRefresh: loadDashboardData }), activeTab === 'maintenance' && _jsx(MaintenanceTab, { interventions: interventions, onRefresh: loadDashboardData }), activeTab === 'documents' && _jsx(DocumentsTab, {}), activeTab === 'users' && _jsx(UsersTab, {}), activeTab === 'notifications' && _jsx(NotificationsTab, { notifications: notifications })] }), showModal && modalType && (_jsx(NewItemModal, { type: modalType, onClose: () => {
                    setShowModal(false);
                    setModalType(null);
                }, onSuccess: () => {
                    setShowModal(false);
                    setModalType(null);
                    loadDashboardData();
                } })), showNewMenu && (_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setShowNewMenu(false) }))] }));
}
// Composant Vue d'ensemble
function OverviewTab({ stats }) {
    if (!stats)
        return _jsx("div", { children: "Chargement des statistiques..." });
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Vue d'ensemble" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6", children: statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `p-2 rounded-lg ${stat.color}`, children: _jsx(Icon, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: stat.title }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: stat.value })] })] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: stat.change })] }, index));
                }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Activit\u00E9 R\u00E9cente" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Maintenance pr\u00E9ventive" }), _jsx("span", { className: "text-sm text-orange-600", children: "Termin\u00E9e" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Nouvelle commande" }), _jsx("span", { className: "text-sm text-orange-500", children: "En attente" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Diagnostic \u00E9quipement" }), _jsx("span", { className: "text-sm text-orange-700", children: "En cours" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Alertes" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500 mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Maintenance due dans 3 jours" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(XCircle, { className: "h-4 w-4 text-orange-700 mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Garantie expir\u00E9e - \u00C9quipement #123" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-orange-600 mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "Diagnostic OK - \u00C9quipement #456" })] })] })] })] })] }));
}
// Composant Équipements
function EquipmentTab({ equipment, onRefresh }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u00C9quipements" }), _jsxs("button", { className: "bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Ajouter un \u00E9quipement"] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex space-x-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Rechercher un \u00E9quipement...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" })] }) }), _jsxs("button", { className: "flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Filtres"] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u00C9quipement" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Statut" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Localisation" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Heures" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Prochaine Maintenance" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: equipment.map((item) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: [item.brand, " ", item.model] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["S/N: ", item.serial_number] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active' ? 'bg-orange-100 text-orange-800' :
                                                item.status === 'maintenance' ? 'bg-orange-200 text-orange-900' :
                                                    'bg-orange-300 text-orange-900'}`, children: item.status === 'active' ? 'Actif' :
                                                item.status === 'maintenance' ? 'Maintenance' : 'Inactif' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: item.location || 'Non spécifié' }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [item.total_hours, " h"] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: item.next_maintenance ? new Date(item.next_maintenance).toLocaleDateString() : 'Non planifiée' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "text-orange-600 hover:text-orange-900", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx("button", { className: "text-orange-500 hover:text-orange-700", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx("button", { className: "text-orange-700 hover:text-orange-900", children: _jsx(Trash, { className: "h-4 w-4" }) })] }) })] }, item.id))) })] }) })] }));
}
// Composant Commandes
function OrdersTab({ orders, onRefresh }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Commandes" }), _jsxs("button", { className: "bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Nouvelle commande"] })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "N\u00B0 Commande" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Statut" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Montant" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: orders.map((order) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: order.order_number }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: order.order_type }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'delivered' ? 'bg-orange-100 text-orange-800' :
                                                order.status === 'shipped' ? 'bg-orange-200 text-orange-900' :
                                                    order.status === 'confirmed' ? 'bg-orange-300 text-orange-900' :
                                                        'bg-orange-400 text-orange-900'}`, children: order.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: order.total_amount ? `${order.total_amount} ${order.currency}` : 'N/A' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: new Date(order.order_date).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "text-primary-600 hover:text-primary-900", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx("button", { className: "text-gray-600 hover:text-gray-900", children: _jsx(Download, { className: "h-4 w-4" }) })] }) })] }, order.id))) })] }) })] }));
}
// Composant Maintenance
function MaintenanceTab({ interventions, onRefresh }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Maintenance" }), _jsxs("button", { className: "bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Planifier une intervention"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: interventions.map((intervention) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: intervention.intervention_type }), _jsx("p", { className: "text-sm text-gray-600", children: intervention.description })] }), _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${intervention.status === 'completed' ? 'bg-orange-100 text-orange-800' :
                                        intervention.status === 'in_progress' ? 'bg-orange-200 text-orange-900' :
                                            intervention.status === 'scheduled' ? 'bg-orange-300 text-orange-900' :
                                                'bg-orange-400 text-orange-900'}`, children: intervention.status })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), new Date(intervention.scheduled_date).toLocaleDateString()] }), intervention.technician_name && (_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), intervention.technician_name] })), intervention.cost && (_jsx("div", { className: "flex items-center text-sm text-gray-600", children: _jsxs("span", { className: "font-medium", children: ["Co\u00FBt: ", intervention.cost, "\u20AC"] }) }))] }), _jsxs("div", { className: "mt-4 flex space-x-2", children: [_jsxs("button", { className: "text-primary-600 hover:text-primary-900 text-sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Voir"] }), _jsxs("button", { className: "text-gray-600 hover:text-gray-900 text-sm", children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Modifier"] })] })] }, intervention.id))) })] }));
}
// Composant Documents
function DocumentsTab() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Documents Techniques" }), _jsxs("button", { className: "bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Uploader un document"] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsx("p", { className: "text-gray-600", children: "Gestion des documents techniques, manuels, certificats..." }) })] }));
}
// Composant Utilisateurs
function UsersTab() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Utilisateurs" }), _jsxs("button", { className: "bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Inviter un utilisateur"] })] }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsx("p", { className: "text-gray-600", children: "Gestion des utilisateurs du portail client..." }) })] }));
}
// Composant Notifications
function NotificationsTab({ notifications }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Notifications" }), _jsx("button", { className: "text-gray-600 hover:text-gray-900", children: "Marquer tout comme lu" })] }), _jsx("div", { className: "space-y-4", children: notifications.map((notification) => (_jsx("div", { className: `bg-white rounded-lg shadow p-4 border-l-4 ${notification.priority === 'urgent' ? 'border-red-500' :
                        notification.priority === 'high' ? 'border-yellow-500' :
                            'border-blue-500'}`, children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900", children: notification.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: notification.message }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: new Date(notification.created_at).toLocaleString() })] }), !notification.is_read && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800", children: "Nouveau" }))] }) }, notification.id))) })] }));
}
function NewItemModal({ type, onClose, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            console.error('Erreur lors de la création:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Num\u00E9ro de s\u00E9rie *" }), _jsx("input", { type: "text", required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('serial_number', e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Marque" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('brand', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Mod\u00E8le" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('model', e.target.value) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Type d'\u00E9quipement *" }), _jsxs("select", { required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('equipment_type', e.target.value), children: [_jsx("option", { value: "", children: "S\u00E9lectionner un type" }), _jsx("option", { value: "excavatrice", children: "Excavatrice" }), _jsx("option", { value: "pelle", children: "Pelle hydraulique" }), _jsx("option", { value: "chargeur", children: "Chargeur" }), _jsx("option", { value: "bulldozer", children: "Bulldozer" }), _jsx("option", { value: "camion", children: "Camion" }), _jsx("option", { value: "concasseur", children: "Concasseur" })] })] })] }));
            case 'order':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Type de commande *" }), _jsxs("select", { required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('order_type', e.target.value), children: [_jsx("option", { value: "", children: "S\u00E9lectionner un type" }), _jsx("option", { value: "purchase", children: "Achat" }), _jsx("option", { value: "rental", children: "Location" }), _jsx("option", { value: "maintenance", children: "Maintenance" }), _jsx("option", { value: "import", children: "Import" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Montant (\u20AC)" }), _jsx("input", { type: "number", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('total_amount', parseFloat(e.target.value)) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes" }), _jsx("textarea", { rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('notes', e.target.value) })] })] }));
            case 'maintenance':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Type d'intervention *" }), _jsxs("select", { required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('intervention_type', e.target.value), children: [_jsx("option", { value: "", children: "S\u00E9lectionner un type" }), _jsx("option", { value: "preventive", children: "Maintenance pr\u00E9ventive" }), _jsx("option", { value: "corrective", children: "Maintenance corrective" }), _jsx("option", { value: "emergency", children: "Intervention d'urgence" }), _jsx("option", { value: "inspection", children: "Inspection" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date pr\u00E9vue *" }), _jsx("input", { type: "date", required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('scheduled_date', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('description', e.target.value) })] })] }));
            case 'user':
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email *" }), _jsx("input", { type: "email", required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('email', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "R\u00F4le *" }), _jsxs("select", { required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent", onChange: (e) => handleInputChange('role', e.target.value), children: [_jsx("option", { value: "", children: "S\u00E9lectionner un r\u00F4le" }), _jsx("option", { value: "admin", children: "Administrateur" }), _jsx("option", { value: "manager", children: "Manager" }), _jsx("option", { value: "technician", children: "Technicien" }), _jsx("option", { value: "viewer", children: "Lecteur" })] })] })] }));
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: getModalTitle() }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XCircle, { className: "h-6 w-6" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [renderForm(), _jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Annuler" }), _jsx("button", { type: "submit", disabled: loading, className: "px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50", children: loading ? 'Création...' : 'Créer' })] })] })] }) }));
}
