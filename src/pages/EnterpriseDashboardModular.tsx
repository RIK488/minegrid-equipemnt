import React, { useState, useEffect } from 'react';
import TopBar from '../components/dashboard/layout/TopBar';
import SidebarMenu from '../components/dashboard/layout/SidebarMenu';
import MainDashboardLayout from '../components/dashboard/layout/MainDashboardLayout';
import WidgetRenderer from '../components/dashboard/WidgetRenderer';
import { VendeurWidgets } from './widgets/VendeurWidgets';
import { iconMap } from '../constants/iconMap';
import { useAdaptiveWidget } from '../hooks/useAdaptiveWidget';
import supabase from '../utils/supabaseClient';
import { Maximize2, Minimize2, MoreVertical, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';

export default function EnterpriseDashboardModular() {
  // États principaux
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMetier, setSelectedMetier] = useState<string>('vendeur');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // États du dashboard
  const [dashboardConfig, setDashboardConfig] = useState<any>(null);
  const [layout, setLayout] = useState<any>({ lg: [] });
  const [dataVersion, setDataVersion] = useState(0);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // États des formulaires
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [showEditRentalForm, setShowEditRentalForm] = useState(false);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);

  // États des données
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  // Hooks personnalisés
  const { formatCurrency, formatNumber } = useAdaptiveWidget('normal');

  // Fonctions de gestion des widgets
  const handleRemoveWidget = (widgetId: string) => {
    if (!dashboardConfig) return;
    const newWidgets = dashboardConfig.widgets.filter((w: any) => w.id !== widgetId);
    setDashboardConfig({ ...dashboardConfig, widgets: newWidgets });

    // Remove from layouts
    const newLayouts = { ...layout };
    for (const key in newLayouts) {
        newLayouts[key] = newLayouts[key].filter((l: any) => l.i !== widgetId);
    }
    setLayout(newLayouts);

    // Persist changes
    const savedConfig = JSON.parse(localStorage.getItem(`enterpriseDashboardConfig_${selectedMetier}`) || '{}');
    savedConfig.dashboardConfig = { ...dashboardConfig, widgets: newWidgets };
    savedConfig.layouts = newLayouts;
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(savedConfig));
  };

  // Ajoute cette fonction utilitaire pour alterner la taille du widget
  const getNextWidgetWidth = (currentW: number) => {
    // Cycle: 4 (1/3) -> 8 (2/3) -> 12 (plein écran) -> 4 ...
    if (currentW < 6) return 8;
    if (currentW < 10) return 12;
    return 4;
  };

  const handleToggleSize = (widgetId: string) => {
    // Trouver le layout courant
    const newLayouts = { ...layout };
    if (!newLayouts.lg) return;
    newLayouts.lg = newLayouts.lg.map((l: any) => {
      if (l.i === widgetId) {
        const newW = getNextWidgetWidth(l.w);
        return { ...l, w: newW };
      }
      return l;
    });
    setLayout(newLayouts);
    // Persiste la nouvelle config
    const savedConfig = JSON.parse(localStorage.getItem(`enterpriseDashboardConfig_${selectedMetier}`) || '{}');
    savedConfig.layouts = newLayouts;
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(savedConfig));
    // Force le rafraîchissement
    setDataVersion(v => v + 1);
  };

  const handleResetWidgetSize = (widgetId: string) => {
    // Remet la taille du widget à la valeur par défaut (1/3)
    const newLayouts = { ...layout };
    if (!newLayouts.lg) return;
    newLayouts.lg = newLayouts.lg.map((l: any) => {
      if (l.i === widgetId) {
        return { ...l, w: 4 };
      }
      return l;
    });
    setLayout(newLayouts);
    const savedConfig = JSON.parse(localStorage.getItem(`enterpriseDashboardConfig_${selectedMetier}`) || '{}');
    savedConfig.layouts = newLayouts;
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(savedConfig));
    setDataVersion(v => v + 1);
  };

  const handleToggleVisibility = (widgetId: string) => {
    if (!dashboardConfig) return;
    const newWidgets = dashboardConfig.widgets.map((w: any) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setDashboardConfig({ ...dashboardConfig, widgets: newWidgets });
    // Persist changes
    const savedConfig = JSON.parse(localStorage.getItem(`enterpriseDashboardConfig_${selectedMetier}`) || '{}');
    savedConfig.dashboardConfig = { ...dashboardConfig, widgets: newWidgets };
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(savedConfig));
  };

  const handleShowDetails = (content: React.ReactNode) => {
    setModalContent(content);
  };

  // Fonctions de gestion des actions
  const handleMarkRepairComplete = (repairId: string) => {
    console.log('Mark repair complete:', repairId);
  };

  const handleAssignTechnician = (repairId: string, technicianId: string) => {
    console.log('Assign technician:', repairId, technicianId);
  };

  const handleCreateIntervention = (data: any) => {
    console.log('Create intervention:', data);
    setShowInterventionForm(false);
  };

  const handleCreateRental = (data: any) => {
    console.log('Create rental:', data);
    setShowRentalForm(false);
  };

  const handleUpdateRentalStatus = (rentalId: string, status: string) => {
    console.log('Update rental status:', rentalId, status);
  };

  const handleShowRentalDetails = (rental: any) => {
    setSelectedRental(rental);
    setShowRentalDetails(true);
  };

  const handleEditRental = (rental: any) => {
    setSelectedRental(rental);
    setShowEditRentalForm(true);
  };

  const handleCloseEditRental = () => {
    setShowEditRentalForm(false);
    setSelectedRental(null);
  };

  const handleCloseRentalDetails = () => {
    setShowRentalDetails(false);
    setSelectedRental(null);
  };

  const handleUpdateRental = (data: any) => {
    console.log('Update rental:', data);
    handleCloseEditRental();
  };

  // Fonctions de gestion du dashboard
  const handleAddWidgets = () => {
    window.location.hash = '#entreprise';
  };

  const handleLoadDashboard = () => {
    const savedConfig = localStorage.getItem(`enterpriseDashboardConfig_${selectedMetier}`);
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setSavedDashboards([config]);
    }
    setShowLoadModal(true);
  };

  const handleLoadSelectedDashboard = (index: number) => {
    const save = savedDashboards[index];
    if (save.dashboardConfig) {
      setDashboardConfig(save.dashboardConfig);
      if (save.layouts) {
        setLayout(save.layouts);
      }
      setSelectedMetier(save.metier || 'vendeur');
    }
    setShowLoadModal(false);
  };

  const refreshDashboardData = () => {
    setDataVersion(prev => prev + 1);
  };

  const saveDashboardConfig = () => {
    const config = {
      dashboardConfig,
      layouts: layout,
      metier: selectedMetier,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(config));
  };

  // Génération du layout
  const generateLayout = (widgets: any[]): any[] => {
    const sortedWidgets = widgets.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    return sortedWidgets.map((widget, index) => {
      if (index < 2) {
        return {
          i: widget.id,
          x: 0,
          y: index,
          w: 4,
          h: 2,
        };
      } else if (index < 4) {
        return {
          i: widget.id,
          x: 4,
          y: index - 2,
          w: 8,
          h: 2,
        };
      } else {
        const row = Math.floor((index - 4) / 3);
        const col = (index - 4) % 3;
        return {
          i: widget.id,
          x: col * 4,
          y: row + 2,
          w: 4,
          h: 2,
        };
      }
    });
  };

  // 1. Définir la configuration par métier
  const metierConfigs: Record<string, any> = {
    vendeur: {
      label: 'Vendeur',
      color: 'orange',
      widgets: [
        // IDs des widgets principaux du métier vendeur
        'sales-metrics',
        'sales-pipeline',
        'daily-actions',
        'sales-evolution',
        // ...
      ]
    },
    mecanicien: {
      label: 'Mécanicien',
      color: 'blue',
      widgets: [
        'maintenance-status',
        'interventions',
        'daily-actions',
        // ...
      ]
    },
    financier: {
      label: 'Financier',
      color: 'green',
      widgets: [
        'finance-metrics',
        'cashflow',
        'daily-actions',
        // ...
      ]
    },
    loueur: {
      label: 'Loueur',
      color: 'purple',
      widgets: [
        'rental-metrics',
        'rental-pipeline',
        'daily-actions',
        // ...
      ]
    }
  };

  // 2. Sélecteur de métier (sidebar ou topbar)
  // 3. Affichage du métier courant
  // 4. Charger dynamiquement la config et le layout selon le métier
  // (dans le useEffect ou lors du changement de selectedMetier)

  // Vérification de la session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Session utilisateur trouvée:', session);
          setIsAuthenticated(true);
        } else {
          console.error('❌ AUCUNE SESSION UTILISATEUR TROUVÉE. Veuillez vous connecter pour voir les données.');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setIsAuthenticated(false);
      } finally {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    // Charger la configuration du métier vendeur par défaut au démarrage
    const savedConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.dashboardConfig && config.dashboardConfig.widgets) {
        setDashboardConfig(config.dashboardConfig);
        if (config.layouts) {
          setLayout(config.layouts);
        } else {
          const defaultLayout = generateLayout(config.dashboardConfig.widgets);
          setLayout({ lg: defaultLayout });
        }
      }
      setSelectedMetier(config.metier || 'vendeur');
    } else {
      // Configuration par défaut pour vendeur
      const widgets = VendeurWidgets.widgets.map((widget, index) => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        description: widget.description,
        icon: iconMap[widget.icon.name] || iconMap.Target,
        enabled: true,
        dataSource: widget.dataSource,
        isCollapsed: false,
        position: index
      }));
      const defaultConfig = { widgets, theme: 'light', layout: 'grid', refreshInterval: 30, notifications: true };
      setDashboardConfig(defaultConfig);
      const defaultLayout = generateLayout(widgets);
      setLayout({ lg: defaultLayout });
      setSelectedMetier('vendeur');
    }
    setLoading(false);
  }, []);

  // Hook pour charger la config/layout du métier sélectionné
  useEffect(() => {
    // 1. Tenter de charger la config/layout depuis le localStorage
    const saved = localStorage.getItem(`enterpriseDashboardConfig_${selectedMetier}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dashboardConfig) setDashboardConfig(parsed.dashboardConfig);
      if (parsed.layouts) setLayout(parsed.layouts);
    } else {
      // 2. Sinon, charger la config par défaut du métier
      const defaultWidgets = metierConfigs[selectedMetier].widgets.map((id: string, idx: number) => ({
        id,
        enabled: true,
        position: idx
      }));
      setDashboardConfig({ widgets: defaultWidgets });
      setLayout({ lg: defaultWidgets.map((w: any, i: number) => ({ i: w.id, x: (i*4)%12, y: Math.floor(i/3)*2, w: 4, h: 4 })) });
    }
  }, [selectedMetier]);

  // Sauvegarde indépendante par métier
  const handleSaveDashboard = () => {
    const config = {
      dashboardConfig,
      layouts: layout,
      metier: selectedMetier,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`enterpriseDashboardConfig_${selectedMetier}`, JSON.stringify(config));
    setShowSaveModal(true);
    setTimeout(() => setShowSaveModal(false), 2000);
  };

  // Vérification de l'authentification
  if (!sessionChecked) {
    return <div className="p-8 text-center">Vérification de la session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Vous n'êtes pas connecté. Veuillez vous connecter pour accéder au tableau de bord.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopBar */}
      <TopBar
        currentTime={new Date()}
        userType={selectedMetier}
        onLogout={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          window.location.hash = '#connexion';
        }}
        onSidebarToggle={() => {}}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SidebarMenu */}
        <SidebarMenu
          collapsed={false}
          selectedUserType={selectedMetier}
          userTypes={['vendeur', 'mecanicien', 'financier', 'loueur']}
          onUserTypeChange={setSelectedMetier}
          onNavigation={() => {}}
        />

        {/* MainDashboardLayout */}
        <MainDashboardLayout>
          {/* 2. Sélecteur de métier (sidebar ou topbar) */}
          <div className="flex items-center gap-4 mb-6">
            {Object.entries(metierConfigs).map(([key, conf]) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${selectedMetier === key ? `bg-${conf.color}-600 text-white border-${conf.color}-700` : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                onClick={() => setSelectedMetier(key)}
              >
                {conf.label}
              </button>
            ))}
          </div>

          {/* 3. Affichage du métier courant */}
          <h2 className={`text-2xl font-bold mb-4 text-${metierConfigs[selectedMetier].color}-700`}>Tableau de bord {metierConfigs[selectedMetier].label}</h2>

          {dashboardConfig && dashboardConfig.widgets && dashboardConfig.widgets
            .filter((widget: any) => widget.enabled)
            .slice().sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
            .map((widget: any) => {
              const widgetLayout = layout?.lg?.find((l: any) => l.i === widget.id);
              const widgetWidth = widgetLayout?.w || 1;
              let widgetSize: 'small' | 'medium' | 'large' = 'medium';
              
              if (widgetWidth <= 2) {
                widgetSize = 'small';
              } else if (widgetWidth >= 4) {
                widgetSize = 'large';
              }
              
                return (
    <div key={widget.id} className="relative group">
                  {/* Bouton d'agrandissement/réduction en haut à droite du widget */}
                  <button
                    className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow hover:bg-orange-100 transition-colors opacity-80 group-hover:opacity-100"
                    title="Agrandir/Réduire"
                    onClick={() => handleToggleSize(widget.id)}
                  >
                    {widgetWidth < 12 ? <Maximize2 className="w-4 h-4 text-orange-600" /> : <Minimize2 className="w-4 h-4 text-orange-600" />}
                  </button>
                  {/* Menu contextuel (3 points) */}
                  <div className="absolute top-2 right-10 z-20">
                    <button
                      className="p-1 bg-white rounded-full shadow hover:bg-orange-100 transition-colors opacity-80 group-hover:opacity-100"
                      title="Options"
                      onClick={() => setOpenMenuId(openMenuId === widget.id ? null : widget.id)}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    {openMenuId === widget.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-30">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                          onClick={() => { handleToggleVisibility(widget.id); setOpenMenuId(null); }}
                        >
                          <EyeOff className="w-4 h-4 mr-2" /> Masquer
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                          onClick={() => { handleRemoveWidget(widget.id); setOpenMenuId(null); }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                          onClick={() => { handleResetWidgetSize(widget.id); setOpenMenuId(null); }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Réinitialiser la taille
                        </button>
                        {/* Actions rapides contextuelles selon le widget */}
                        {widget.id === 'sales-metrics' && (
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                            onClick={() => { /* Action rapide spécifique */ setOpenMenuId(null); }}
                          >
                            <Eye className="w-4 h-4 mr-2" /> Voir détails score
                          </button>
                        )}
                        {widget.id === 'sales-pipeline' && (
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                            onClick={() => { /* Action rapide spécifique */ setOpenMenuId(null); }}
                          >
                            <Eye className="w-4 h-4 mr-2" /> Voir pipeline
                          </button>
                        )}
                        {/* Ajouter d'autres actions rapides selon le widget ici */}
                      </div>
                    )}
                  </div>
                  <WidgetRenderer
                    widget={widget}
                    widgetSize={widgetSize}
                    onAction={(action, data) => {
                      console.log('Widget action:', action, data);
                      // Gérer les actions des widgets ici
                    }}
                  />
                </div>
              );
            })}
        </MainDashboardLayout>
      </main>

      {/* Modales */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {modalContent}
            </div>
          </div>
        </div>
      )}

      {/* Modale de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                Votre tableau de bord a été sauvegardé avec succès !
              </p>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de chargement */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Charger un tableau de bord</h3>
              {savedDashboards.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Aucune sauvegarde trouvée.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDashboards.map((save, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleLoadSelectedDashboard(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">Sauvegarde {index + 1}</h4>
                          <p className="text-sm text-gray-600">
                            Métier: {save.metier?.charAt(0).toUpperCase() + save.metier?.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Sauvegardé le: {new Date(save.savedAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            {save.dashboardConfig?.widgets?.filter((w: any) => w.enabled).length || 0} widgets
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {savedDashboards.length} sauvegarde{savedDashboards.length > 1 ? 's' : ''} disponible{savedDashboards.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 