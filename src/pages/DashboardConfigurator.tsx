import React, { useState } from 'react';
import { 
  Building2, Users, Package, Truck, Wrench, Calendar, FileText, 
  CheckCircle, ArrowRight, Star, Shield, Zap, Globe, Smartphone, 
  BarChart3, TrendingUp, Eye, Layout, PieChart, Activity, 
  DollarSign, Clock, Target, Rocket, ArrowLeft, Settings, 
  BarChart, LineChart, PieChart as PieChartIcon, MapPin, 
  AlertTriangle, Plus, Minus, Maximize2, Minimize2
} from 'lucide-react';
import { WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const ResponsiveGridLayout = WidthProvider(Responsive);

// Configuration des métiers avec leurs widgets
const metiers = [
  {
    id: 'vendeur',
    name: "Vendeur d'engins",
    icon: Package,
    description: "Vente d'équipements neufs et d'occasion",
    features: [
      'Gestion de stock',
      'Fiches techniques auto',
      'Statistiques de vente',
      'Bons de commande',
    ],
    widgets: [
      {
        id: 'sales-metrics',
        title: 'Score de Performance Commerciale',
        icon: Target,
        description: 'Score global sur 100, comparaison avec objectif, rang anonymisé, recommandations IA et suivi de la performance commerciale.',
        type: 'metric',
        dataSource: 'sales_performance',
        features: [
          'Score sur 100',
          'Comparaison avec objectif',
          'Classement anonymisé',
          'Recommandations IA personnalisées',
          'Suivi de la progression mensuelle'
        ]
      },
      {
        id: 'inventory-status',
        title: "Plan d'action stock & revente",
        icon: Package,
        description: 'Statut du stock dormant, recommandations automatiques, actions rapides, alertes sur les invendus et planification des actions de revente.',
        type: 'list',
        dataSource: 'inventory',
        features: [
          'Détection du stock dormant',
          'Alertes sur les invendus',
          'Recommandations automatiques de revente',
          'Actions rapides (publier, relancer, archiver)',
          'KPI stock et taux de rotation'
        ]
      },
      {
        id: 'sales-evolution',
        title: 'Évolution des ventes',
        icon: TrendingUp,
        description: 'Graphique des ventes sur 12 mois, analyse des tendances, prévisions, export des données et comparaison avec l’année précédente.',
        type: 'chart',
        dataSource: 'sales_history',
        features: [
          'Graphique dynamique sur 12 mois',
          'Analyse des tendances',
          'Prévisions automatiques',
          'Export des données',
          'Comparaison année précédente'
        ]
      },
      {
        id: 'leads-pipeline',
        title: 'Pipeline commercial',
        icon: BarChart3,
        description: 'Suivi des prospects et opportunités à chaque étape du cycle de vente. Statistiques, taux de conversion, alertes IA, relances et priorisation.',
        type: 'pipeline',
        dataSource: 'leads',
        features: [
          'Statistiques par étape (prospection, devis, négociation, conclu, perdu)',
          'Taux de conversion global et par étape',
          'Détection IA des blocages et opportunités',
          'Relances automatiques et actions rapides',
          'Vue liste, kanban, timeline',
          'Tri et filtrage avancés'
        ]
      },
      {
        id: 'daily-actions',
        title: 'Actions Commerciales Prioritaires',
        icon: Calendar,
        description: 'Liste des actions du jour triées par impact/priorité, contacts rapides, relances, rappels et planification des tâches commerciales.',
        type: 'daily-actions',
        dataSource: 'daily_actions',
        features: [
          'Actions urgentes et prioritaires',
          'Contacts rapides (téléphone, email)',
          'Relances automatiques',
          'Rappels et notifications',
          'Planification des tâches commerciales'
        ]
      },
    ],
  },
  {
    id: 'loueur',
    name: "Loueur d'engins",
    icon: Calendar,
    description: "Location d'équipements avec planning",
    features: [
      'Calendrier de réservation',
      'Contrats automatisés',
      'Suivi utilisation',
      'Paiement en ligne',
    ],
    widgets: [
      { id: 'calendar', title: 'Calendrier', icon: Calendar, description: 'Gestion des réservations', type: 'calendar', dataSource: 'bookings' },
      { id: 'contracts', title: 'Contrats', icon: FileText, description: 'Contrats automatisés', type: 'list', dataSource: 'contracts' },
    ],
  },
  {
    id: 'mecanicien',
    name: 'Mécanicien / Atelier',
    icon: Wrench,
    description: 'Maintenance et réparation d’équipements',
    features: [
      'Planning interventions',
      'Bons d’intervention',
      'Diagnostic IA',
      'Suivi SAV',
    ],
    widgets: [
      { id: 'planning', title: 'Planning interventions', icon: Calendar, description: 'Planification des interventions', type: 'calendar', dataSource: 'interventions' },
      { id: 'diagnostic', title: 'Diagnostic IA', icon: Zap, description: 'Diagnostic assisté par IA', type: 'metric', dataSource: 'diagnostic' },
    ],
  },
  {
    id: 'transporteur',
    name: 'Transporteur / Logistique',
    icon: Truck,
    description: 'Transport et livraison d’équipements',
    features: [
      'Simulateur coûts',
      'Planification livraisons',
      'Documents douaniers',
      'Suivi GPS',
    ],
    widgets: [
      { id: 'simulator', title: 'Simulateur coûts', icon: DollarSign, description: 'Simulation des coûts de transport', type: 'metric', dataSource: 'costs' },
      { id: 'gps', title: 'Suivi GPS', icon: MapPin, description: 'Localisation en temps réel', type: 'map', dataSource: 'gps' },
    ],
  },
  {
    id: 'transitaire',
    name: 'Transitaire / Freight Forwarder',
    icon: Globe,
    description: 'Gestion des opérations douanières et logistiques internationales',
    features: [
      'Gestion douane',
      'Suivi conteneurs',
      'Documents d’import/export',
      'Calcul coûts logistiques',
    ],
    widgets: [
      { id: 'customs', title: 'Gestion douane', icon: Shield, description: 'Gestion des formalités douanières', type: 'list', dataSource: 'customs' },
      { id: 'containers', title: 'Suivi conteneurs', icon: Truck, description: 'Suivi des conteneurs', type: 'metric', dataSource: 'containers' },
    ],
  },
  {
    id: 'logisticien',
    name: 'Logisticien / Supply Chain',
    icon: BarChart3,
    description: 'Optimisation de la chaîne logistique',
    features: [
      'Planification stock',
      'Optimisation routes',
      'Gestion entrepôts',
      'Analytics logistiques',
    ],
    widgets: [
      { id: 'stock-planning', title: 'Planification stock', icon: Package, description: 'Planification des stocks', type: 'list', dataSource: 'stock' },
      { id: 'analytics', title: 'Analytics logistiques', icon: BarChart3, description: 'Analyse logistique', type: 'chart', dataSource: 'analytics' },
    ],
  },
  {
    id: 'multiservices',
    name: 'Prestataire multiservices',
    icon: Users,
    description: 'Services variés et sous-traitance',
    features: [
      'Catalogue services',
      'Système commandes',
      'Réseau partenaires',
      'Suivi interventions',
    ],
    widgets: [
      { id: 'catalog', title: 'Catalogue services', icon: FileText, description: 'Catalogue des services proposés', type: 'list', dataSource: 'catalog' },
      { id: 'partners', title: 'Réseau partenaires', icon: Users, description: 'Gestion des partenaires', type: 'list', dataSource: 'partners' },
    ],
  },
  {
    id: 'investisseur',
    name: 'Investisseur',
    icon: DollarSign,
    description: 'Investissement et financement',
    features: [
      'Analyse des opportunités',
      'Évaluation des projets',
      'Gestion des investissements',
      'Suivi des rendements',
    ],
    widgets: [
      { id: 'opportunities', title: 'Analyse des opportunités', icon: Star, description: 'Analyse des opportunités d’investissement', type: 'metric', dataSource: 'opportunities' },
      { id: 'returns', title: 'Suivi des rendements', icon: TrendingUp, description: 'Suivi des rendements financiers', type: 'chart', dataSource: 'returns' },
    ],
  },
];

// Services communs inclus
const commonServices = [
  {
    icon: Building2,
    title: 'Vitrine personnalisée',
    description: 'Site web sur mesure pour votre entreprise'
  },
  {
    icon: FileText,
    title: 'Publication rapide',
    description: 'Création et publication d\'annonces simplifiée'
  },
  {
    icon: DollarSign,
    title: 'Générateur de devis',
    description: 'Création automatique de devis PDF'
  },
  {
    icon: FileText,
    title: 'Espace documents',
    description: 'Gestion centralisée de vos documents'
  },
  {
    icon: Smartphone,
    title: 'Boîte de réception',
    description: 'Messages et notifications centralisés'
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord',
    description: 'Vue synthétique de vos activités'
  },
  {
    icon: Calendar,
    title: 'Planning pro',
    description: 'Gestion de planning et rendez-vous'
  },
  {
    icon: Zap,
    title: 'Assistant IA',
    description: 'Génération automatique de contenu'
  }
];

// Fonction pour générer un layout compact automatiquement
function generateCompactLayout(selectedWidgets, widgetSizes) {
  const layout = [];
  let x = 0;
  let y = 0;
  let rowHeight = 2;
  selectedWidgets.forEach((id, idx) => {
    let w = 4;
    const size = widgetSizes[id] || '1/3';
    if (size === '1/2') w = 6;
    if (size === '2/3') w = 8;
    if (size === '1/1') w = 12;
    if (x + w > 12) {
      x = 0;
      y += rowHeight;
    }
    layout.push({ i: id, x, y, w, h: rowHeight, minH: rowHeight, maxH: rowHeight });
    x += w;
  });
  return layout;
}

const DashboardConfigurator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedMetier, setSelectedMetier] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  // Remplacer les tailles par défaut
  const WIDGET_WIDTHS = [
    { label: '1/3', value: '1/3', w: 4 },
    { label: '1/2', value: '1/2', w: 6 },
    { label: '2/3', value: '2/3', w: 8 },
    { label: '1/1', value: '1/1', w: 12 },
  ];
  const [widgetSizes, setWidgetSizes] = useState<{[key: string]: '1/3' | '1/2' | '2/3' | '1/1'}>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const selectedMetierData = metiers.find(m => m.id === selectedMetier);

  const handleMetierSelect = (metierId: string) => {
    setSelectedMetier(metierId);
    const metier = metiers.find(m => m.id === metierId);
    if (metier) {
      const defaultWidgets = metier.widgets.map(w => w.id);
      setSelectedWidgets(defaultWidgets);
      const defaultSizes: {[key: string]: '1/3' | '1/2' | '2/3' | '1/1'} = {};
      metier.widgets.forEach((widget, index) => {
        defaultSizes[widget.id] = '1/3';
      });
      setWidgetSizes(defaultSizes);
    }
  };

  const handleWidgetToggle = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  // Adapter la gestion du changement de taille
  const handleWidgetSizeChange = (widgetId: string, size: '1/3' | '1/2' | '2/3' | '1/1') => {
    setWidgetSizes(prev => ({ ...prev, [widgetId]: size }));
  };

  // Adapter le layout pour utiliser la largeur choisie
  const generateLayout = () => {
    const enabledWidgets = selectedMetierData?.widgets.filter(w => selectedWidgets.includes(w.id)) || [];
    const layout: any[] = [];
    let x = 0;
    let y = 0;
    let maxY = 0;
    enabledWidgets.forEach((widget, index) => {
      const size = widgetSizes[widget.id] || '1/3';
      let w = 4;
      if (size === '1/2') w = 6;
      if (size === '2/3') w = 8;
      if (size === '1/1') w = 12;
      if (x + w > 12) {
        x = 0;
        y = maxY;
      }
      layout.push({
        i: widget.id,
        x,
        y,
        w,
        h: 4,
      });
      x += w;
      maxY = Math.max(maxY, y + 4);
    });
    return layout;
  };

  const handleGenerateDashboard = () => {
    const layout = generateLayout();
    const enabledWidgets = selectedMetierData?.widgets.filter(w => selectedWidgets.includes(w.id)) || [];
    
    const config = {
      metier: selectedMetier,
      widgets: enabledWidgets.map(widget => ({
        ...widget,
        enabled: true,
        size: widgetSizes[widget.id] || 'medium',
        position: layout.find(l => l.i === widget.id)?.position || 0
      })),
      layout: {
        lg: layout
      },
      theme: 'light',
      refreshInterval: 30,
      notifications: true,
      createdAt: new Date().toISOString()
    };

    // Sauvegarder la configuration
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(config));
    
    // Rediriger vers le tableau de bord
    window.location.hash = '#dashboard-entreprise-display';
  };

  const handleSaveConfig = () => {
    const layout = generateCompactLayout(selectedWidgets, widgetSizes);
    const enabledWidgets = selectedMetierData?.widgets.filter(w => selectedWidgets.includes(w.id)) || [];
    const config = {
      metier: selectedMetier,
      widgets: enabledWidgets.map(widget => ({
        ...widget,
        enabled: true,
        size: widgetSizes[widget.id] || '1/3',
        position: layout.find(l => l.i === widget.id)?.position || 0
      })),
      layout: {
        lg: layout
      },
      theme: 'light',
      refreshInterval: 30,
      notifications: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(config));
    setSaveMessage('Configuration sauvegardée !');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  // Adapter la logique de navigation
  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Configurateur Tableau de Bord Entreprise
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Créez votre tableau de bord personnalisé adapté à votre métier et vos besoins spécifiques
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  activeStep >= step 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    activeStep > step ? 'bg-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu des étapes */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Étape 1: Sélection du métier */}
          {activeStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Services communs inclus
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {commonServices.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                      <Icon className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  );
                })}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sélectionnez votre métier principal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metiers.map((metier) => {
                  const Icon = metier.icon;
                  return (
                    <div
                      key={metier.id}
                      onClick={() => handleMetierSelect(metier.id)}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMetier === metier.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Icon className="h-12 w-12 text-orange-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{metier.name}</h3>
                      <p className="text-gray-600 mb-4">{metier.description}</p>
                      <div className="space-y-2">
                        {metier.widgets.map((widget, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-orange-500 mr-2" />
                            {widget.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!selectedMetier}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Configuration des widgets */}
          {activeStep === 2 && selectedMetierData && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Configurez votre tableau de bord
              </h2>
              <p className="text-gray-600 mb-6">
                Sélectionnez et personnalisez les widgets pour votre métier : {selectedMetierData.name}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Widgets disponibles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Widgets disponibles</h3>
                  <div className="space-y-4">
                    {selectedMetierData.widgets.map((widget) => {
                      const Icon = widget.icon;
                      const isEnabled = selectedWidgets.includes(widget.id);
                      const currentSize = widgetSizes[widget.id] || '1/3';
                      
                      return (
                        <div key={widget.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Icon className="h-6 w-6 text-orange-600 mr-3" />
                              <div>
                                <h4 className="font-semibold text-gray-900">{widget.title}</h4>
                                <p className="text-sm text-gray-600">{widget.description}</p>
                              </div>
                            </div>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => handleWidgetToggle(widget.id)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              />
                            </label>
                          </div>
                          
                          {isEnabled && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Taille du widget
                              </label>
                              {/* Choix de la largeur */}
                              <div className="flex space-x-2">
                                {WIDGET_WIDTHS.map(({ label, value }) => (
                                  <button
                                    key={value}
                                    onClick={() => handleWidgetSizeChange(widget.id, value as any)}
                                    className={`px-3 py-1 text-xs rounded ${
                                      (widgetSizes[widget.id] || '1/3') === value
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview interactive */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Prévisualisation</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedWidgets.length} widget{selectedWidgets.length > 1 ? 's' : ''} sélectionné{selectedWidgets.length > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center text-sm text-orange-600 hover:text-orange-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {previewMode ? 'Vue simple' : 'Vue détaillée'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-2 min-h-[250px] max-w-[500px] mx-auto">
                    <ResponsiveGridLayout
                      className="layout"
                      layouts={{ lg: generateCompactLayout(selectedWidgets, widgetSizes) }}
                      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                      cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                      rowHeight={60}
                      isDraggable={true}
                      isResizable={false}
                      margin={[16, 16]}
                      useCSSTransforms={true}
                      compactType="vertical"
                      onLayoutChange={(layout) => {
                        // Met à jour l'ordre et la taille des widgets
                        const newWidgetSizes = { ...widgetSizes };
                        layout.forEach(l => {
                          if (l.w === 4) newWidgetSizes[l.i] = '1/3';
                          else if (l.w === 6) newWidgetSizes[l.i] = '1/2';
                          else if (l.w === 8) newWidgetSizes[l.i] = '2/3';
                          else if (l.w === 12) newWidgetSizes[l.i] = '1/1';
                        });
                        setWidgetSizes(newWidgetSizes);
                        // Réordonne les widgets selon la grille
                        setSelectedWidgets(layout.map(l => l.i));
                      }}
                    >
                      {selectedWidgets.map((id) => {
                        const widget = selectedMetierData.widgets.find(w => w.id === id);
                        if (!widget) return null;
                        const Icon = widget.icon;
                        const size = widgetSizes[id] || '1/3';
                        return (
                          <div key={id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 border border-orange-200 shadow-sm flex flex-col">
                            <div className="flex items-center mb-2">
                              <Icon className="h-4 w-4 text-orange-600 mr-1" />
                              <h4 className="text-xs font-semibold text-orange-900">{widget.title}</h4>
                            </div>
                            <div className="text-xs text-orange-700 mb-1">{widget.description}</div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-orange-600 bg-white px-1 py-0.5 rounded-full">
                                {size === '1/3' ? '1/3' : size === '1/2' ? '1/2' : size === '2/3' ? '2/3' : '1/1'}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-1">
                              <div className={`h-1 rounded-full ${
                                size === '1/3' ? 'w-6 bg-orange-300' : 
                                size === '1/2' ? 'w-10 bg-orange-400' : 
                                size === '2/3' ? 'w-16 bg-orange-500' : 
                                'w-20 bg-orange-600'
                              }`}></div>
                              <span className="text-xs text-orange-600">
                                {size === '1/3' ? 'Compact' : size === '1/2' ? 'Standard' : size === '2/3' ? 'Étendu' : 'Complet'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </ResponsiveGridLayout>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Finalisation */}
          {activeStep === 3 && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Votre tableau de bord personnalisé est prêt !</h2>
                <button
                  onClick={handleSaveConfig}
                  className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                >
                  Sauvegarder la configuration
                </button>
                {saveMessage && (
                  <span className="ml-4 text-green-600 text-sm font-semibold">{saveMessage}</span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Résumé sobre à gauche */}
                <div>
                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Métier sélectionné</h3>
                    <div className="text-gray-700">{selectedMetierData?.name}</div>
                  </div>
                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Widgets du métier principal</h3>
                    <ul className="space-y-1">
                      {selectedMetierData?.widgets
                        .filter(w => selectedWidgets.includes(w.id))
                        .map((widget) => (
                          <li key={widget.id} className="flex items-center text-sm text-gray-800">
                            <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                            {widget.title} ({widgetSizes[widget.id] === '1/3' ? '1/3' : 
                                            widgetSizes[widget.id] === '1/2' ? '1/2' : 
                                            widgetSizes[widget.id] === '2/3' ? '2/3' : '1/1'})
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Total des widgets</h3>
                    <div className="text-lg font-bold text-orange-700">{selectedWidgets.length} widgets</div>
                  </div>
                  <div className="mt-4 text-gray-700 text-sm">
                    Votre tableau de bord sera généré avec tous les widgets sélectionnés.<br />
                    Il sera composé de widgets métriques, graphiques, listes et calendriers.
                  </div>
                </div>
                {/* Preview dynamique à droite (identique à l'étape 2) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu de votre tableau de bord</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-2 min-h-[250px] max-w-[500px] mx-auto">
                    <ResponsiveGridLayout
                      className="layout"
                      layouts={{ lg: generateCompactLayout(selectedWidgets, widgetSizes) }}
                      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                      cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                      rowHeight={60}
                      isDraggable={false}
                      isResizable={false}
                      margin={[16, 16]}
                      useCSSTransforms={true}
                      compactType="vertical"
                    >
                      {selectedWidgets.map((id) => {
                        const widget = selectedMetierData.widgets.find(w => w.id === id);
                        if (!widget) return null;
                        const Icon = widget.icon;
                        const size = widgetSizes[id] || '1/3';
                        return (
                          <div key={id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-2 border border-orange-200 shadow-sm flex flex-col">
                            <div className="flex items-center mb-2">
                              <Icon className="h-4 w-4 text-orange-600 mr-1" />
                              <h4 className="text-xs font-semibold text-orange-900">{widget.title}</h4>
                            </div>
                            <div className="text-xs text-orange-700 mb-1">{widget.description}</div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-orange-600 bg-white px-1 py-0.5 rounded-full">
                                {size === '1/3' ? '1/3' : size === '1/2' ? '1/2' : size === '2/3' ? '2/3' : '1/1'}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-1">
                              <div className={`h-1 rounded-full ${
                                size === '1/3' ? 'w-6 bg-orange-300' : 
                                size === '1/2' ? 'w-10 bg-orange-400' : 
                                size === '2/3' ? 'w-16 bg-orange-500' : 
                                'w-20 bg-orange-600'
                              }`}></div>
                              <span className="text-xs text-orange-600">
                                {size === '1/3' ? 'Compact' : size === '1/2' ? 'Standard' : size === '2/3' ? 'Étendu' : 'Complet'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </ResponsiveGridLayout>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleGenerateDashboard}
                  className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Générer mon tableau de bord
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section avantages */}
        <div className="mt-16 bg-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Pourquoi choisir notre configurateur ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Star className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tableau de bord sur mesure</h3>
                <p className="text-gray-600">Adapté à votre métier et vos processus spécifiques</p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration intuitive</h3>
                <p className="text-gray-600">Interface simple pour personnaliser vos widgets et métriques</p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mise en place rapide</h3>
                <p className="text-gray-600">Votre tableau de bord opérationnel en quelques minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardConfigurator; 