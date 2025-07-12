import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Building2, Users, Package, Truck, Wrench, Calendar, FileText, CheckCircle, ArrowRight, Star, Shield, Zap, Globe, Smartphone, BarChart3, TrendingUp, Eye, Layout, PieChart, Activity, DollarSign, Clock, Target, Rocket } from 'lucide-react';
const metiers = [
    {
        id: 'vendeur',
        name: 'Vendeur d\'engins',
        icon: Package,
        description: 'Vente d\'équipements neufs et d\'occasion',
        modules: ['Gestion de stock', 'Fiches techniques auto', 'Statistiques de vente', 'Bons de commande'],
        widgets: [
            { id: 'sales-metrics', type: 'performance', title: 'Score de Performance Commerciale', description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA', icon: Target, dataSource: 'sales_performance' },
            { id: 'inventory-status', type: 'list', title: 'Plan d\'action stock & revente', description: 'Statut stock dormant, recommandations automatiques, actions rapides, et KPI', icon: Package, dataSource: 'inventory' },
            { id: 'sales-chart', type: 'chart', title: 'Évolution des ventes', description: 'Graphique des ventes sur 12 mois', icon: TrendingUp, dataSource: 'sales_history' },
            { id: 'leads-pipeline', type: 'list', title: 'Pipeline commercial', description: 'Prospects et opportunités', icon: Target, dataSource: 'leads' }
        ]
    },
    {
        id: 'loueur',
        name: 'Loueur d\'engins',
        icon: Calendar,
        description: 'Location d\'équipements avec planning',
        modules: ['Calendrier de réservation', 'Contrats automatisés', 'Suivi utilisation', 'Paiement en ligne'],
        widgets: [
            { id: 'rental-revenue', type: 'metric', title: 'Revenus de location', description: 'CA généré par les locations', icon: DollarSign, dataSource: 'rental_revenue' },
            { id: 'equipment-availability', type: 'chart', title: 'Disponibilité équipements', description: 'Taux d\'utilisation par équipement', icon: Activity, dataSource: 'equipment_usage' },
            { id: 'upcoming-rentals', type: 'calendar', title: 'Locations à venir', description: 'Planning des prochaines locations', icon: Calendar, dataSource: 'rentals' },
            { id: 'maintenance-schedule', type: 'list', title: 'Maintenance préventive', description: 'Interventions programmées', icon: Wrench, dataSource: 'maintenance' }
        ]
    },
    {
        id: 'mecanicien',
        name: 'Mécanicien / Atelier',
        icon: Wrench,
        description: 'Maintenance et réparation d\'équipements',
        modules: ['Planning interventions', 'Bons d\'intervention', 'Diagnostic IA', 'Suivi SAV'],
        widgets: [
            { id: 'interventions-today', type: 'metric', title: 'Interventions du jour', description: 'Nombre d\'interventions planifiées', icon: Clock, dataSource: 'daily_interventions' },
            { id: 'repair-status', type: 'list', title: 'État des réparations', description: 'Équipements en réparation', icon: Wrench, dataSource: 'repairs' },
            { id: 'parts-inventory', type: 'chart', title: 'Stock pièces détachées', description: 'Niveau de stock par catégorie', icon: Package, dataSource: 'parts' },
            { id: 'technician-workload', type: 'chart', title: 'Charge de travail', description: 'Répartition des tâches par technicien', icon: Users, dataSource: 'workload' }
        ]
    },
    {
        id: 'transporteur',
        name: 'Transporteur / Logistique',
        icon: Truck,
        description: 'Transport et livraison d\'équipements',
        modules: ['Simulateur coûts', 'Planification livraisons', 'Documents douaniers', 'Suivi GPS'],
        widgets: [
            { id: 'active-deliveries', type: 'metric', title: 'Livraisons en cours', description: 'Nombre de livraisons actives', icon: Truck, dataSource: 'active_deliveries' },
            { id: 'delivery-map', type: 'map', title: 'Carte des livraisons', description: 'Localisation des véhicules', icon: Globe, dataSource: 'gps_tracking' },
            { id: 'transport-costs', type: 'chart', title: 'Coûts de transport', description: 'Analyse des coûts par trajet', icon: DollarSign, dataSource: 'transport_costs' },
            { id: 'driver-schedule', type: 'calendar', title: 'Planning chauffeurs', description: 'Planning des équipes', icon: Calendar, dataSource: 'driver_schedule' }
        ]
    },
    {
        id: 'transitaire',
        name: 'Transitaire / Freight Forwarder',
        icon: Globe,
        description: 'Gestion des opérations douanières et logistiques internationales',
        modules: ['Gestion douane', 'Suivi conteneurs', 'Documents d\'import/export', 'Calcul coûts logistiques'],
        widgets: [
            { id: 'customs-clearance', type: 'metric', title: 'Déclarations en cours', description: 'Nombre de déclarations douanières', icon: FileText, dataSource: 'customs' },
            { id: 'container-tracking', type: 'map', title: 'Suivi conteneurs', description: 'Localisation des conteneurs', icon: Globe, dataSource: 'containers' },
            { id: 'import-export-stats', type: 'chart', title: 'Statistiques I/E', description: 'Volumes import/export', icon: BarChart3, dataSource: 'trade_stats' },
            { id: 'document-status', type: 'list', title: 'État des documents', description: 'Documents en attente de validation', icon: FileText, dataSource: 'documents' }
        ]
    },
    {
        id: 'logisticien',
        name: 'Logisticien / Supply Chain',
        icon: BarChart3,
        description: 'Optimisation de la chaîne logistique',
        modules: ['Planification stock', 'Optimisation routes', 'Gestion entrepôts', 'Analytics logistiques'],
        widgets: [
            { id: 'warehouse-occupancy', type: 'metric', title: 'Taux d\'occupation', description: 'Occupation des entrepôts', icon: Building2, dataSource: 'warehouse' },
            { id: 'route-optimization', type: 'map', title: 'Optimisation routes', description: 'Routes optimisées', icon: Truck, dataSource: 'routes' },
            { id: 'supply-chain-kpis', type: 'chart', title: 'KPIs Supply Chain', description: 'Indicateurs de performance', icon: Target, dataSource: 'kpis' },
            { id: 'inventory-alerts', type: 'list', title: 'Alertes stock', description: 'Produits en rupture ou excédent', icon: Package, dataSource: 'inventory_alerts' }
        ]
    },
    {
        id: 'prestataire',
        name: 'Prestataire multiservices',
        icon: Users,
        description: 'Services variés et sous-traitance',
        modules: ['Catalogue services', 'Système commandes', 'Réseau partenaires', 'Suivi interventions'],
        widgets: [
            { id: 'active-projects', type: 'metric', title: 'Projets actifs', description: 'Nombre de projets en cours', icon: Activity, dataSource: 'projects' },
            { id: 'service-catalog', type: 'list', title: 'Catalogue services', description: 'Services disponibles', icon: FileText, dataSource: 'services' },
            { id: 'revenue-by-service', type: 'chart', title: 'CA par service', description: 'Répartition du CA par service', icon: PieChart, dataSource: 'revenue' },
            { id: 'partner-network', type: 'list', title: 'Réseau partenaires', description: 'Partenaires actifs', icon: Users, dataSource: 'partners' }
        ]
    },
    {
        id: 'investisseur',
        name: 'Investisseur',
        icon: TrendingUp,
        description: 'Investissement et financement',
        modules: ['Analyse des opportunités', 'Évaluation des projets', 'Gestion des investissements', 'Suivi des rendements'],
        widgets: [
            { id: 'portfolio-value', type: 'metric', title: 'Valeur portefeuille', description: 'Valeur totale des investissements', icon: DollarSign, dataSource: 'portfolio' },
            { id: 'investment-opportunities', type: 'list', title: 'Opportunités', description: 'Projets d\'investissement', icon: Target, dataSource: 'opportunities' },
            { id: 'roi-analysis', type: 'chart', title: 'Analyse ROI', description: 'Retour sur investissement', icon: TrendingUp, dataSource: 'roi' },
            { id: 'risk-assessment', type: 'chart', title: 'Évaluation risques', description: 'Analyse des risques par projet', icon: Shield, dataSource: 'risk' }
        ]
    }
];
const commonServices = [
    {
        icon: Building2,
        title: 'Vitrine personnalisée',
        description: 'Page publique entreprise avec logo, description, services'
    },
    {
        icon: FileText,
        title: 'Publication rapide',
        description: 'Formulaire manuel ou import Excel avec OCR'
    },
    {
        icon: BarChart3,
        title: 'Générateur de devis PDF',
        description: 'Interface simple pour créer des devis professionnels'
    },
    {
        icon: Package,
        title: 'Espace documents',
        description: 'Stocker factures, contrats, fiches techniques'
    },
    {
        icon: Smartphone,
        title: 'Boîte de réception',
        description: 'Voir tous les messages/demandes client'
    },
    {
        icon: Globe,
        title: 'Tableau de bord',
        description: 'Vue synthétique : machines, vues, demandes, conversions'
    },
    {
        icon: Calendar,
        title: 'Planning pro',
        description: 'Gestion de planning : livraisons, rendez-vous, interventions'
    },
    {
        icon: Zap,
        title: 'Assistant IA',
        description: 'Génère fiches machine, réponses client, devis automatiques'
    }
];
export default function EnterpriseService() {
    const [formData, setFormData] = useState({
        companyName: '',
        siret: '',
        address: '',
        phone: '',
        email: '',
        contactPerson: '',
        employeeCount: '',
        mainActivity: '',
        selectedModules: [],
        budget: '',
        timeline: '',
        additionalInfo: '',
        dashboardConfig: {
            widgets: [],
            theme: 'light',
            layout: 'grid',
            refreshInterval: 30,
            notifications: true
        }
    });
    const [activeStep, setActiveStep] = useState(1);
    const [selectedMetier, setSelectedMetier] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleMetierSelect = (metierId) => {
        setSelectedMetier(metierId);
        const metier = metiers.find(m => m.id === metierId);
        if (metier) {
            handleInputChange('mainActivity', metier.name);
            // Initialiser les widgets par défaut pour ce métier
            const defaultWidgets = metier.widgets.map((widget, index) => ({
                ...widget,
                enabled: true,
                position: index,
                size: 'medium',
                type: widget.type,
                icon: widget.icon.name || 'DollarSign' // Sauvegarder le nom de l'icône
            }));
            handleInputChange('dashboardConfig', {
                ...formData.dashboardConfig,
                widgets: defaultWidgets
            });
        }
    };
    const handleWidgetToggle = (widgetId) => {
        const updatedWidgets = formData.dashboardConfig.widgets.map(widget => widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget);
        handleInputChange('dashboardConfig', {
            ...formData.dashboardConfig,
            widgets: updatedWidgets
        });
    };
    const handleWidgetSizeChange = (widgetId, size) => {
        const updatedWidgets = formData.dashboardConfig.widgets.map(widget => widget.id === widgetId ? { ...widget, size } : widget);
        handleInputChange('dashboardConfig', {
            ...formData.dashboardConfig,
            widgets: updatedWidgets
        });
    };
    const handleModuleToggle = (module) => {
        const currentModules = formData.selectedModules;
        if (currentModules.includes(module)) {
            handleInputChange('selectedModules', currentModules.filter(m => m !== module));
        }
        else {
            handleInputChange('selectedModules', [...currentModules, module]);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Collecter tous les widgets sélectionnés de tous les métiers
        const allSelectedWidgets = [];
        // Ajouter les widgets du métier principal
        if (selectedMetier) {
            const selectedMetierData = metiers.find(m => m.id === selectedMetier);
            if (selectedMetierData) {
                const enabledWidgets = formData.dashboardConfig.widgets.filter(w => w.enabled);
                allSelectedWidgets.push(...enabledWidgets);
            }
        }
        // Ajouter les widgets des modules supplémentaires sélectionnés
        formData.selectedModules.forEach(module => {
            // Trouver le métier qui contient ce module
            const metierWithModule = metiers.find(m => m.modules.includes(module));
            if (metierWithModule) {
                // Ajouter les widgets de ce métier s'ils ne sont pas déjà présents
                metierWithModule.widgets.forEach(widget => {
                    const existingWidget = allSelectedWidgets.find(w => w.id === widget.id);
                    if (!existingWidget) {
                        allSelectedWidgets.push({
                            ...widget,
                            enabled: true,
                            position: allSelectedWidgets.length,
                            size: 'medium',
                            type: widget.type,
                            icon: widget.icon.name || 'DollarSign'
                        });
                    }
                });
            }
        });
        // Créer la configuration finale avec tous les widgets
        const finalConfig = {
            ...formData,
            dashboardConfig: {
                ...formData.dashboardConfig,
                widgets: allSelectedWidgets
            },
            metier: selectedMetier,
            selectedModules: formData.selectedModules,
            createdAt: new Date().toISOString()
        };
        // Sauvegarder la configuration dans localStorage
        localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(finalConfig));
        console.log('Configuration tableau de bord complète:', finalConfig);
        console.log('Nombre de widgets sélectionnés:', allSelectedWidgets.length);
        // Rediriger vers le vrai tableau de bord entreprise
        window.location.hash = '#dashboard-entreprise';
    };
    const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));
    const selectedMetierData = metiers.find(m => m.id === selectedMetier);
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Configurateur Tableau de Bord Entreprise" }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "Cr\u00E9ez votre tableau de bord personnalis\u00E9 adapt\u00E9 \u00E0 votre m\u00E9tier et vos besoins sp\u00E9cifiques" })] }), _jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "flex items-center space-x-4", children: [1, 2, 3, 4].map((step) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-semibold ${activeStep >= step
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-200 text-gray-600'}`, children: step }), step < 4 && (_jsx("div", { className: `w-16 h-1 mx-2 ${activeStep > step ? 'bg-orange-600' : 'bg-gray-200'}` }))] }, step))) }) }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [activeStep === 1 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Services communs inclus" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: commonServices.map((service, index) => {
                                        const Icon = service.icon;
                                        return (_jsxs("div", { className: "text-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors", children: [_jsx(Icon, { className: "h-8 w-8 text-orange-600 mx-auto mb-3" }), _jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: service.title }), _jsx("p", { className: "text-sm text-gray-600", children: service.description })] }, index));
                                    }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "S\u00E9lectionnez votre m\u00E9tier principal" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: metiers.map((metier) => {
                                        const Icon = metier.icon;
                                        return (_jsxs("div", { onClick: () => handleMetierSelect(metier.id), className: `p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedMetier === metier.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-300'}`, children: [_jsx(Icon, { className: "h-12 w-12 text-orange-600 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: metier.name }), _jsx("p", { className: "text-gray-600 mb-4", children: metier.description }), _jsx("div", { className: "space-y-2", children: metier.modules.map((module, index) => (_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-orange-500 mr-2" }), module] }, index))) })] }, metier.id));
                                    }) }), _jsx("div", { className: "mt-8 flex justify-end", children: _jsxs("button", { onClick: nextStep, disabled: !selectedMetier, className: "px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center", children: ["Continuer", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] }) })] })), activeStep === 2 && selectedMetierData && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Configurez votre tableau de bord" }), _jsxs("p", { className: "text-gray-600 mb-6", children: ["S\u00E9lectionnez et personnalisez les widgets pour votre m\u00E9tier : ", selectedMetierData.name] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Widgets disponibles" }), _jsx("div", { className: "space-y-4", children: selectedMetierData.widgets.map((widget) => {
                                                        const Icon = widget.icon;
                                                        const isEnabled = formData.dashboardConfig.widgets.find(w => w.id === widget.id)?.enabled || false;
                                                        const currentSize = formData.dashboardConfig.widgets.find(w => w.id === widget.id)?.size || 'medium';
                                                        return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Icon, { className: "h-6 w-6 text-orange-600 mr-3" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: widget.title }), _jsx("p", { className: "text-sm text-gray-600", children: widget.description })] })] }), _jsx("label", { className: "flex items-center", children: _jsx("input", { type: "checkbox", checked: isEnabled, onChange: () => handleWidgetToggle(widget.id), className: "h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" }) })] }), isEnabled && (_jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Taille du widget" }), _jsx("div", { className: "flex space-x-2", children: ['small', 'medium', 'large'].map((size) => (_jsx("button", { onClick: () => handleWidgetSizeChange(widget.id, size), className: `px-3 py-1 text-xs rounded ${currentSize === size
                                                                                    ? 'bg-orange-600 text-white'
                                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: size === 'small' ? 'Petit' : size === 'medium' ? 'Moyen' : 'Grand' }, size))) })] }))] }, widget.id));
                                                    }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Pr\u00E9visualisation" }), _jsxs("button", { onClick: () => setPreviewMode(!previewMode), className: "flex items-center text-sm text-orange-600 hover:text-orange-700", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), previewMode ? 'Mode configuration' : 'Mode prévisualisation'] })] }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-4 min-h-[400px]", children: previewMode ? (_jsx("div", { className: "grid grid-cols-2 gap-4", children: formData.dashboardConfig.widgets
                                                            .filter(w => w.enabled)
                                                            .map((widget) => {
                                                            const Icon = widget.icon;
                                                            const sizeClass = widget.size === 'small' ? 'col-span-1' : widget.size === 'large' ? 'col-span-2' : 'col-span-1';
                                                            return (_jsxs("div", { className: `${sizeClass} bg-gray-50 rounded-lg p-3 border border-gray-200`, children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Icon, { className: "h-4 w-4 text-orange-600 mr-2" }), _jsx("h4", { className: "text-sm font-semibold text-gray-900", children: widget.title })] }), _jsx("div", { className: "text-xs text-gray-600", children: widget.size === 'small' ? 'Widget compact' :
                                                                            widget.size === 'medium' ? 'Widget standard' : 'Widget étendu' })] }, widget.id));
                                                        }) })) : (_jsxs("div", { className: "text-center text-gray-500 py-8", children: [_jsx(Layout, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "Pr\u00E9visualisez votre tableau de bord personnalis\u00E9" })] })) })] })] }), _jsxs("div", { className: "mt-8 flex justify-between", children: [_jsx("button", { onClick: prevStep, className: "px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "Retour" }), _jsxs("button", { onClick: nextStep, className: "px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center", children: ["Continuer", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })] })] })), activeStep === 3 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Modules suppl\u00E9mentaires" }), _jsx("p", { className: "text-gray-600 mb-6", children: "S\u00E9lectionnez les modules suppl\u00E9mentaires qui vous int\u00E9ressent. Chaque module ajoutera des widgets sp\u00E9cifiques \u00E0 votre tableau de bord :" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: metiers.map((metier) => metier.modules.map((module, index) => {
                                        const isSelected = formData.selectedModules.includes(module);
                                        return (_jsx("div", { className: `p-4 border-2 rounded-lg transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`, children: _jsxs("div", { className: "flex items-start", children: [_jsx("input", { type: "checkbox", id: `module-${metier.id}-${index}`, checked: isSelected, onChange: () => handleModuleToggle(module), className: "h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1" }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("label", { htmlFor: `module-${metier.id}-${index}`, className: "font-semibold text-gray-900 cursor-pointer", children: module }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["M\u00E9tier: ", metier.name] }), isSelected && (_jsxs("div", { className: "mt-3 pt-3 border-t border-orange-200", children: [_jsx("p", { className: "text-xs text-orange-700 font-medium mb-2", children: "Widgets ajout\u00E9s :" }), _jsx("div", { className: "space-y-1", children: metier.widgets.map((widget, widgetIndex) => (_jsxs("div", { className: "flex items-center text-xs text-orange-600", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), widget.title] }, widgetIndex))) })] }))] })] }) }, `${metier.id}-${index}`));
                                    })) }), formData.selectedModules.length > 0 && (_jsxs("div", { className: "mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-4", children: "Widgets suppl\u00E9mentaires qui seront ajout\u00E9s" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: formData.selectedModules.map(module => {
                                                const metierWithModule = metiers.find(m => m.modules.includes(module));
                                                if (metierWithModule) {
                                                    return metierWithModule.widgets.map((widget, widgetIndex) => (_jsxs("div", { className: "bg-white p-3 rounded border border-blue-200", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(widget.icon, { className: "h-4 w-4 text-blue-600 mr-2" }), _jsx("span", { className: "text-sm font-medium text-blue-900", children: widget.title })] }), _jsx("p", { className: "text-xs text-blue-700 mt-1", children: widget.description })] }, `${module}-${widgetIndex}`)));
                                                }
                                                return null;
                                            }) })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: prevStep, className: "px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "Retour" }), _jsxs("button", { onClick: nextStep, className: "px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center", children: ["Continuer", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })] })] })), activeStep === 4 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Votre tableau de bord personnalis\u00E9 est pr\u00EAt !" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "R\u00E9sum\u00E9 de votre configuration" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-orange-50 p-4 rounded-lg border border-orange-200", children: [_jsx("h4", { className: "font-semibold text-orange-900 mb-2", children: "M\u00E9tier s\u00E9lectionn\u00E9" }), _jsx("p", { className: "text-orange-800", children: selectedMetierData?.name })] }), _jsxs("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-semibold text-blue-900 mb-2", children: "Widgets du m\u00E9tier principal" }), _jsx("div", { className: "space-y-1", children: formData.dashboardConfig.widgets
                                                                        .filter(w => w.enabled)
                                                                        .map((widget) => (_jsxs("div", { className: "flex items-center text-sm text-blue-800", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2 text-blue-600" }), widget.title, " (", widget.size === 'small' ? 'Petit' : widget.size === 'medium' ? 'Moyen' : 'Grand', ")"] }, widget.id))) })] }), formData.selectedModules.length > 0 && (_jsxs("div", { className: "bg-green-50 p-4 rounded-lg border border-green-200", children: [_jsx("h4", { className: "font-semibold text-green-900 mb-2", children: "Modules suppl\u00E9mentaires" }), _jsx("div", { className: "space-y-1", children: formData.selectedModules.map((module, index) => (_jsxs("div", { className: "flex items-center text-sm text-green-800", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2 text-green-600" }), module] }, index))) })] })), _jsxs("div", { className: "bg-purple-50 p-4 rounded-lg border border-purple-200", children: [_jsx("h4", { className: "font-semibold text-purple-900 mb-2", children: "Total des widgets" }), _jsxs("div", { className: "text-2xl font-bold text-purple-800", children: [(() => {
                                                                            const mainWidgets = formData.dashboardConfig.widgets.filter(w => w.enabled).length;
                                                                            const additionalWidgets = formData.selectedModules.reduce((total, module) => {
                                                                                const metierWithModule = metiers.find(m => m.modules.includes(module));
                                                                                return total + (metierWithModule ? metierWithModule.widgets.length : 0);
                                                                            }, 0);
                                                                            return mainWidgets + additionalWidgets;
                                                                        })(), " widgets"] }), _jsx("p", { className: "text-sm text-purple-700 mt-1", children: "Votre tableau de bord sera compos\u00E9 de widgets m\u00E9triques, graphiques, listes et calendriers" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Aper\u00E7u de votre tableau de bord" }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-4 min-h-[400px]", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [formData.dashboardConfig.widgets
                                                                .filter(w => w.enabled)
                                                                .map((widget) => {
                                                                const Icon = widget.icon;
                                                                const sizeClass = widget.size === 'small' ? 'col-span-1' : widget.size === 'large' ? 'col-span-2' : 'col-span-1';
                                                                return (_jsxs("div", { className: `${sizeClass} bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 shadow-sm`, children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Icon, { className: "h-5 w-5 text-orange-600 mr-2" }), _jsx("h4", { className: "text-sm font-semibold text-orange-900", children: widget.title })] }), _jsx("div", { className: "text-xs text-orange-700 mb-2", children: widget.description }), _jsx("div", { className: "text-xs text-orange-600 bg-white px-2 py-1 rounded-full inline-block", children: widget.size === 'small' ? 'Widget compact' :
                                                                                widget.size === 'medium' ? 'Widget standard' : 'Widget étendu' })] }, widget.id));
                                                            }), formData.selectedModules.map(module => {
                                                                const metierWithModule = metiers.find(m => m.modules.includes(module));
                                                                if (metierWithModule) {
                                                                    return metierWithModule.widgets.map((widget, widgetIndex) => (_jsxs("div", { className: "col-span-1 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(widget.icon, { className: "h-5 w-5 text-green-600 mr-2" }), _jsx("h4", { className: "text-sm font-semibold text-green-900", children: widget.title })] }), _jsx("div", { className: "text-xs text-green-700 mb-2", children: widget.description }), _jsxs("div", { className: "text-xs text-green-600 bg-white px-2 py-1 rounded-full inline-block", children: ["Module: ", module] })] }, `${module}-${widgetIndex}`)));
                                                                }
                                                                return null;
                                                            })] }) })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("button", { onClick: prevStep, className: "px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "Retour" }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Votre tableau de bord sera g\u00E9n\u00E9r\u00E9 avec tous les widgets s\u00E9lectionn\u00E9s" }), _jsxs("button", { onClick: handleSubmit, className: "px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto", children: [_jsx(Rocket, { className: "h-5 w-5 mr-2" }), "G\u00E9n\u00E9rer mon tableau de bord"] })] }), _jsx("div", { className: "w-24" }), " "] })] }))] }), _jsx("div", { className: "mt-16 bg-white py-12", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-3xl font-bold text-center text-gray-900 mb-12", children: "Pourquoi choisir notre configurateur ?" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "text-center", children: [_jsx(Star, { className: "h-12 w-12 text-orange-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Tableau de bord sur mesure" }), _jsx("p", { className: "text-gray-600", children: "Adapt\u00E9 \u00E0 votre m\u00E9tier et vos processus sp\u00E9cifiques" })] }), _jsxs("div", { className: "text-center", children: [_jsx(Zap, { className: "h-12 w-12 text-orange-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Configuration intuitive" }), _jsx("p", { className: "text-gray-600", children: "Interface simple pour personnaliser vos widgets et m\u00E9triques" })] }), _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "h-12 w-12 text-orange-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Mise en place rapide" }), _jsx("p", { className: "text-gray-600", children: "Votre tableau de bord op\u00E9rationnel en quelques jours" })] })] })] }) })] }) }));
}
