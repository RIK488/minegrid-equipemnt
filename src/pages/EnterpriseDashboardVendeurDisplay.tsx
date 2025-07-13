import React, { useEffect, useState } from 'react';
import { CheckCircle, Maximize2, Minimize2, X, Layout } from 'lucide-react';
import { commonServices } from '../constants/commonServices';
import SalesPerformanceScoreWidget from '../components/dashboard/widgets/SalesPerformanceScoreWidget';
import SalesPipelineWidget from '../components/dashboard/widgets/SalesPipelineWidget';
import { DailyActionsPriorityWidget } from './DailyActionsWidgetFixed';
import { WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { VendeurWidgets } from './widgets/VendeurWidgets';
import { useRef } from 'react';
import WidgetRenderer from '../components/dashboard/WidgetRenderer';
import { listData } from '../constants/mockData';
import { NotificationContainer } from '../components/NotificationToast';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Mapping des liens pour chaque service commun (à adapter selon tes routes)
const serviceLinks = [
  '/#vitrine',                // Vitrine personnalisée
  '/#publication',            // Publication rapide
  '/#devis',                  // Générateur de devis PDF
  '/#documents',              // Espace documents
  '/#messages',               // Boîte de réception
  '/#dashboard-entreprise-display', // Tableau de bord (corrigé)
  '/#planning',               // Planning pro (corrigé)
  '/#assistant-ia',           // Assistant IA (corrigé)
];

const WIDGETS_VENDEUR_IDS = [
  'sales-performance-score',
  'sales-evolution',
  'stock-status',
  'sales-pipeline',
  'daily-actions'
];

// Fonction utilitaire pour garantir un layout complet et ordonné
function getOrderedAndCompleteLayout(widgets, layout, widgetSizes) {
  // On recalcule TOUJOURS le layout avec les tailles à jour
  return generatePreviewLayout(widgets, widgetSizes);
}

// Conversion taille → largeur (12 colonnes)
function getWidthFromSize(size) {
  if (size === '1/3') return 4;
  if (size === '1/2') return 6;
  if (size === '2/3') return 8;
  if (size === '1/1') return 12;
  return 4; // défaut
}

function generateAutoFitLayout(widgets, widgetSizes) {
  const layout = [];
  let x = 0;
  let y = 0;
  let rowHeight = 4; // ou 2 selon ton besoin

  widgets.forEach((widget, idx) => {
    const w = getWidthFromSize(widgetSizes[widget.id] || '1/3');
    if (x + w > 12) {
      // Passe à la ligne suivante
      x = 0;
      y += rowHeight;
    }
    layout.push({
      i: widget.id,
      x,
      y,
      w,
      h: rowHeight
    });
    x += w;
  });

  return layout;
}

function computeGridRows(widgets, widgetSizes) {
  const rows = [];
  let currentRow = [];
  let currentWidth = 0;
  widgets.forEach(widget => {
    const size = widgetSizes?.[widget.id] || '1/3';
    let width = 4;
    if (size === '2/3') width = 8;
    if (size === '1/1') width = 12;
    if (currentWidth + width > 12) {
      if (currentWidth < 12) {
        currentRow.push(...Array(Math.floor((12 - currentWidth) / 4)).fill({ widget: null, width: 4 }));
      }
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }
    currentRow.push({ widget, width });
    currentWidth += width;
    if (currentWidth === 12) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }
  });
  if (currentRow.length > 0 && currentWidth < 12) {
    currentRow.push(...Array(Math.floor((12 - currentWidth) / 4)).fill({ widget: null, width: 4 }));
  }
  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
}

function generateLayoutFromPreview(widgets, widgetSizes) {
  const rows = computeGridRows(widgets, widgetSizes);
  const layout = [];
  let y = 0;
  rows.forEach(row => {
    let x = 0;
    row.forEach(({ widget, width }) => {
      layout.push({
        i: widget.id,
        x,
        y,
        w: width,
        h: 4 // ou la hauteur souhaitée
      });
      x += width;
    });
    y += 4; // ou la hauteur souhaitée
  });
  return layout;
}

// Fonction utilitaire pour générer le layout comme dans le configurateur, en respectant la taille 'size' de chaque widget
function generatePreviewLayout(widgets, widgetSizes) {
  const layout = [];
  let x = 0;
  let y = 0;
  let maxY = 0;
  widgets.forEach((widget, index) => {
    const size = widgetSizes?.[widget.id] || widget.size || '1/3';
    let w = getWidthFromSize(size);
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
}

const EnterpriseDashboardVendeurDisplay: React.FC = () => {
  // Suppression automatique de la config locale pour forcer la régénération
  // (Suppression du useEffect qui efface la config)
  const [config, setConfig] = useState<any>(null);
  const [layout, setLayout] = useState<{ [key: string]: any[] }>({ lg: [] });
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [addStatus, setAddStatus] = useState<{ [key: string]: 'idle' | 'added' }>({});
  const addTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [showSizeMenu, setShowSizeMenu] = useState<string | null>(null);

  // 1. Chargement initial
  useEffect(() => {
    const saved = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    let parsed = saved ? JSON.parse(saved) : null;
    let shouldUpdate = false;

    // Si pas de config ou config invalide, créer une nouvelle config complète
    if (!parsed || !parsed.widgets || !Array.isArray(parsed.widgets)) {
      parsed = {
        widgets: [],
        layout: { lg: [] },
        widgetSizes: {}
      };
      shouldUpdate = true;
    }

    // Garantir que le layout existe
    if (!parsed.layout) {
      parsed.layout = { lg: [] };
      shouldUpdate = true;
    }
    
    if (!parsed.layout.lg) {
      parsed.layout.lg = [];
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      console.log('💾 Sauvegarde de la config mise à jour');
      localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(parsed));
    }

    // Harmonisation des IDs : on utilise uniquement 'sales-performance-score' (plus de 'sales-metrics')
    const validIds = [
      'sales-performance-score',
      'sales-evolution',
      'stock-status',
      'sales-pipeline',
      'daily-actions'
    ];
    parsed.widgets = (parsed.widgets || []).filter(w => validIds.includes(w.id));
    parsed.layout.lg = (parsed.layout.lg || []).filter(l => validIds.includes(l.i));

    // Injection de la taille depuis widgetSizes si absente
    if (parsed.widgetSizes) {
      parsed.widgets = parsed.widgets.map(w => ({
        ...w,
        size: w.size || parsed.widgetSizes[w.id] || '1/3'
      }));
    }

    setConfig(parsed);
    setLayout(parsed.layout || { lg: [] });
  }, []);

  // Correction automatique du titre du widget pipeline commercial dans la config locale
  useEffect(() => {
    const saved = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    if (saved) {
      const parsed = JSON.parse(saved);
      let updated = false;
      if (parsed.widgets) {
        parsed.widgets = parsed.widgets.map(w => {
          if (w.id === 'stock-status' && w.title !== 'Pipeline Commercial') {
            updated = true;
            return { ...w, title: 'Pipeline Commercial' };
          }
          return w;
        });
      }
      if (updated) {
        localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(parsed));
        window.location.reload();
      }
    }
  }, []);

  // Effet de débogage pour vérifier la configuration
  useEffect(() => {
    if (config) {
      console.log('🔍 Configuration actuelle:', config);
      console.log('🔍 Widgets présents:', config.widgets?.map((w: any) => w.id));
      console.log('🔍 Layout:', config.layout?.lg?.map((l: any) => l.i));
      console.log('🔍 WidgetSizes:', config.widgetSizes);
      
      console.log('🔍 Configuration chargée avec succès');
    }
  }, [config]);

  // Effacement automatique de la config locale si elle ne correspond pas aux 5 widgets attendus
  useEffect(() => {
    const validIds = [
      'sales-performance-score',
      'sales-evolution',
      'stock-status',
      'sales-pipeline',
      'daily-actions'
    ];
    const saved = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    if (saved) {
      const parsed = JSON.parse(saved);
      const widgetIds = (parsed.widgets || []).map((w: any) => w.id);
      const isValid = validIds.every(id => widgetIds.includes(id)) && widgetIds.length === validIds.length;
      if (!isValid) {
        localStorage.removeItem('enterpriseDashboardConfig_vendeur');
        // Récupère le mapping des tailles depuis la config précédente si présent
        const previousWidgetSizes = parsed && parsed.widgetSizes ? parsed.widgetSizes : {};
        // Crée les widgets par défaut en injectant la taille si connue
        const defaultWidgets = [
          {
            id: 'sales-performance-score',
            type: 'performance',
            title: 'Score de Performance Commerciale',
            enabled: true,
            position: 0,
            size: previousWidgetSizes['sales-performance-score'] || '1/3'
          },
          {
            id: 'sales-evolution',
            type: 'chart',
            title: 'Évolution des ventes enrichie',
            enabled: true,
            position: 1,
            size: previousWidgetSizes['sales-evolution'] || '1/3'
          },
          {
            id: 'stock-status',
            type: 'list',
            title: 'Plan d\'action stock & revente',
            enabled: true,
            position: 2,
            size: previousWidgetSizes['stock-status'] || '1/3'
          },
          {
            id: 'sales-pipeline',
            type: 'list',
            title: 'Pipeline commercial',
            enabled: true,
            position: 3,
            size: previousWidgetSizes['sales-pipeline'] || '1/3'
          },
          {
            id: 'daily-actions',
            type: 'daily-actions',
            title: 'Actions Commerciales Prioritaires',
            enabled: true,
            position: 4,
            size: previousWidgetSizes['daily-actions'] || '1/3'
          }
        ];
        const defaultLayout = generatePreviewLayout(defaultWidgets, previousWidgetSizes);
        const newConfig = {
          widgets: defaultWidgets,
          layout: { lg: defaultLayout },
          widgetSizes: previousWidgetSizes,
          theme: 'light',
          refreshInterval: 30,
          notifications: true
        };
        localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
        setConfig(newConfig);
        setLayout({ lg: defaultLayout });
        return;
      }
    }
  }, []);

  // 2. Application stricte du layout et des widgets
  // On utilise EXCLUSIVEMENT le layout enregistré dans la config utilisateur
  const widgetsToDisplay = config?.widgets || [];
  const widgetsById = Object.fromEntries(widgetsToDisplay.map((w: any) => [w.id, w]));
  const orderedLayouts = config?.layout?.lg || [];

  // 3. À chaque action (drag, resize, suppression, ajout, changement de taille)
  const onLayoutChange = (newLayout: any[], allLayouts?: any) => {
    setLayout(prev => ({ ...prev, lg: newLayout }));
    setConfig(prev => {
      if (!prev) return prev;
      const newConfig = { ...prev, layout: { ...prev.layout, lg: newLayout } };
      localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  // Change la taille d'un widget (1/3, 2/3, 1/1)
  const handleToggleSize = (widgetId: string) => {
    const newLayout = layout.lg.map((l: any) => {
      if (l.i === widgetId) {
        const newW = getNextWidgetWidth(l.w);
        return { ...l, w: newW };
      }
      return l;
    });
    const updatedLayouts = { ...layout, lg: newLayout };
    
    // Mise à jour du widgetSizes dans la config
    const newSize = getNextWidgetWidth(layout.lg.find((l: any) => l.i === widgetId)?.w || 3) === 7 ? '2/3' : 
                   getNextWidgetWidth(layout.lg.find((l: any) => l.i === widgetId)?.w || 3) === 10 ? '1/1' : '1/3';
    
    setLayout(updatedLayouts);
    if (config) {
      const newWidgetSizes = { ...config.widgetSizes, [widgetId]: newSize };
      const newConfig = { ...config, layout: updatedLayouts, widgetSizes: newWidgetSizes };
      setConfig(newConfig);
      localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
    }
  };

  // Supprime un widget
  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = config.widgets.filter((w: any) => w.id !== widgetId);
    const newLayout = layout.lg.filter((l: any) => l.i !== widgetId);
    const updatedLayouts = { ...layout, lg: newLayout };
    const newConfig = { ...config, widgets: newWidgets, layout: updatedLayouts };
    setConfig(newConfig);
    setLayout(updatedLayouts);
    localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
  };

  const handleAddWidget = (widgetId: string) => {
    const widgetToAdd = VendeurWidgets.widgets.find(w => w.id === widgetId);
    if (!widgetToAdd) return;
    const newWidgets = [...config.widgets, widgetToAdd];
    // Positionne le widget à la fin, colonne 0, ligne suivante
    const newLayout = [
      ...layout.lg,
      { i: widgetId, x: 0, y: layout.lg.length, w: 4, h: widgetId === 'stock-status' ? 6 : 2 }
    ];
    const newConfig = { ...config, widgets: newWidgets, layout: { ...config.layout, lg: newLayout } };
    setConfig(newConfig);
    setLayout(newConfig.layout); // Update layout state
    localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
    setAddStatus(s => ({ ...s, [widgetId]: 'added' }));
    if (addTimeouts.current[widgetId]) clearTimeout(addTimeouts.current[widgetId]);
    addTimeouts.current[widgetId] = setTimeout(() => {
      setAddStatus(s => ({ ...s, [widgetId]: 'idle' }));
    }, 1500);
  };

  // Fonction pour réafficher tous les widgets supprimés
  const handleRestoreAllWidgets = () => {
    // Liste complète des widgets métier
    const allWidgets = VendeurWidgets.widgets;
    // Widgets actuellement affichés
    const currentIds = config.widgets.map((w: any) => w.id);
    // Widgets manquants
    const missingWidgets = allWidgets.filter(w => !currentIds.includes(w.id));
    if (missingWidgets.length === 0) return; // Rien à faire

    // Ajoute les widgets manquants à la fin
    const newWidgets = [...config.widgets, ...missingWidgets];
    // Ajoute chaque widget manquant à la fin du layout
    const newLayout = [
      ...layout.lg,
      ...missingWidgets.map((w, idx) => ({
        i: w.id,
        x: 0,
        y: layout.lg.length + idx,
        w: 4,
        h: 2
      }))
    ];
    const newConfig = { ...config, widgets: newWidgets, layout: { ...config.layout, lg: newLayout } };
    setConfig(newConfig);
    setLayout(newConfig.layout); // Update layout state
    localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
  };

  // Largeur (horizontal) : 1/3 → 2/3 → 1/1 → 1/3
  const handleCycleWidgetWidth = (widgetId: string) => {
    setLayout(prevLayout => {
      const current = prevLayout.lg.find((l: any) => l.i === widgetId);
      if (!current) return prevLayout;
      let nextW;
      if (current.w < 5) nextW = 7;
      else if (current.w < 10) nextW = 10;
      else nextW = 3;
      const newLayout = prevLayout.lg.map((l: any) => l.i === widgetId ? { ...l, w: nextW } : l);
      const updatedLayouts = { ...prevLayout, lg: newLayout };
      
      // Mise à jour du widgetSizes dans la config
      const newSize = nextW === 7 ? '2/3' : nextW === 10 ? '1/1' : '1/3';
      
      setConfig(prevConfig => {
        if (!prevConfig) return prevConfig;
        const newWidgetSizes = { ...prevConfig.widgetSizes, [widgetId]: newSize };
        const newConfig = { ...prevConfig, layout: updatedLayouts, widgetSizes: newWidgetSizes };
        localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
        return newConfig;
      });
      return updatedLayouts;
    });
  };
  // Hauteur (vertical) : 2 → 4 → 6 → 2
  const handleCycleWidgetHeight = (widgetId: string) => {
    setLayout(prevLayout => {
      const current = prevLayout.lg.find((l: any) => l.i === widgetId);
      if (!current) return prevLayout;
      let nextH;
      if (current.h < 4) nextH = 4;
      else if (current.h < 6) nextH = 6;
      else nextH = 2;
      const newLayout = prevLayout.lg.map((l: any) => l.i === widgetId ? { ...l, h: nextH } : l);
      const updatedLayouts = { ...prevLayout, lg: newLayout };
      setConfig(prevConfig => {
        if (!prevConfig) return prevConfig;
        const newConfig = { ...prevConfig, layout: updatedLayouts };
        localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
        return newConfig;
      });
      return updatedLayouts;
    });
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chargement du tableau de bord...</h1>
          <p className="text-gray-600">Aucune configuration trouvée.</p>
        </div>
      </div>
    );
  }

  // Services communs interactifs (boutons/onglets)
  const renderCommonServices = () => (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {commonServices.map((service, idx) => {
          const Icon = service.icon;
          const link = serviceLinks[idx] || '#';
          return (
            <a
              key={idx}
              href={link}
              className="flex flex-col items-center justify-center py-2 px-1 rounded transition hover:bg-orange-100 focus:bg-orange-200 cursor-pointer border border-orange-100 bg-orange-50"
              style={{ minWidth: 0, textDecoration: 'none' }}
            >
              <Icon className="h-6 w-6 text-orange-500 mb-1" />
              <span className="text-xs text-orange-800 text-center truncate">{service.title}</span>
            </a>
          );
        })}
      </div>
    </div>
  );

  // Fonction pour gérer les actions des widgets
  const handleWidgetAction = (action: string, data: any) => {
    console.log('Widget action:', action, data);
    // Gérer les actions des widgets ici
  };



  // Fonction pour alterner la taille du widget
  const getNextWidgetWidth = (currentW: number) => {
    // Cycle: 3 (1/3) -> 7 (2/3) -> 10 (plein écran) -> 3 ...
    if (currentW < 5) return 7;
    if (currentW < 10) return 10;
    return 3;
  };



  // Fonction pour réinitialiser la taille d'un widget
  const handleResetWidgetSize = (widgetId: string) => {
    const newLayout = layout.lg.map((l: any) => {
      if (l.i === widgetId) {
        return { ...l, w: 3 };
      }
      return l;
    });
    const updatedLayouts = { ...layout, lg: newLayout };
    setLayout(updatedLayouts);
    if (config) {
      const newWidgetSizes = { ...config.widgetSizes, [widgetId]: '1/3' };
      const newConfig = { ...config, layout: updatedLayouts, widgetSizes: newWidgetSizes };
      setConfig(newConfig);
      localStorage.setItem('enterpriseDashboardConfig_vendeur', JSON.stringify(newConfig));
    }
  };

  // Rendu dynamique des widgets métier en grille (react-grid-layout)
  const renderWidgets = () => {
    return (
      <ResponsiveGridLayout
        key={JSON.stringify(orderedLayouts.map(l => [l.i, l.w, l.h]))}
        className="layout"
        layouts={{ lg: orderedLayouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={90}
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
        useCSSTransforms={true}
        compactType="vertical"
        onLayoutChange={onLayoutChange}
      >
        {/* Affiche uniquement les widgets présents dans la config utilisateur, dans l'ordre voulu et avec les dimensions sauvegardées */}
        {orderedLayouts.map((l: any) => {
          const widget = widgetsById[l.i];
          if (!widget) return null;
          return (
            <div key={widget.id} data-grid={l} className="bg-orange-50 border border-orange-200 rounded-lg flex flex-col h-full group relative">
              <div className="h-full flex flex-col">
                {/* Header du widget */}
                <div className="flex justify-between items-center p-4 pb-2 border-b">
                  <h3 className="text-lg font-bold text-gray-900">{widget.id === 'stock-status' ? "Plan d’action Stock & Revente" : widget.title}</h3>
                  <div className="flex space-x-1">
                    <button
                      className="p-1 bg-white rounded-full shadow hover:bg-orange-100 transition-colors"
                      title="Agrandir/Réduire la hauteur"
                      onClick={() => handleCycleWidgetHeight(widget.id)}
                    >
                      {l.h < 6 ? <Maximize2 className="w-4 h-4 text-orange-600" /> : <Minimize2 className="w-4 h-4 text-orange-600" />}
                    </button>
                    <button
                      className="p-1 bg-white rounded-full shadow hover:bg-orange-100 transition-colors"
                      title="Réinitialiser la taille"
                      onClick={() => handleResetWidgetSize(widget.id)}
                    >
                      <Layout className="w-4 h-4 text-orange-600" />
                    </button>
                    <button
                      className="p-1 bg-white rounded-full shadow hover:bg-red-100 transition-colors"
                      title="Supprimer"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {/* Contenu scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-6" style={{ maxHeight: '100%' }}>
                  <WidgetRenderer
                    widget={widget}
                    widgetSize="medium"
                    onAction={handleWidgetAction}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NotificationContainer />
      <div className="max-w-6xl mx-auto">
        {renderCommonServices()}
        <button
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          onClick={() => setShowAddWidgetModal(true)}
        >
          + Ajouter des widgets
        </button>
        {showAddWidgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Ajouter un widget vendeur</h2>
              <div className="mb-2 text-xs text-gray-500">
                Widgets disponibles: {VendeurWidgets.widgets.length} | 
                Widgets filtrés: {VendeurWidgets.widgets.filter(widget => WIDGETS_VENDEUR_IDS.includes(widget.id)).length}
              </div>
              <ul>
                {VendeurWidgets.widgets
                  .filter(widget => WIDGETS_VENDEUR_IDS.includes(widget.id))
                  .map(widget => {
                    const isInstalled = config.widgets.some((cw: any) => cw.id === widget.id);
                    return (
                      <li key={widget.id} className="mb-2 flex justify-between items-center">
                        <span>{widget.title} ({widget.id})</span>
                        {isInstalled ? (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Installé</span>
                        ) : addStatus[widget.id] === 'added' ? (
                          <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Ajouté !</span>
                        ) : (
                          <button
                            className="ml-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                            onClick={() => handleAddWidget(widget.id)}
                            disabled={addStatus[widget.id] === 'added'}
                          >
                            Ajouter
                          </button>
                        )}
                      </li>
                    );
                  })}
              </ul>
              <button
                className="mt-4 px-4 py-2 bg-gray-300 rounded hoverouibg-gray-400"
                onClick={() => setShowAddWidgetModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
        {renderWidgets()}
      </div>
    </div>
  );
};

export default EnterpriseDashboardVendeurDisplay; 