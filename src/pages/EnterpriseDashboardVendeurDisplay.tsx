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
  'sales-metrics',
  'stock-status',
  'sales-evolution',
  'sales-pipeline',
  'daily-actions',
];

// Fonction utilitaire pour garantir un layout complet et ordonné
function getOrderedAndCompleteLayout(widgets, layout) {
  const widgetOrder = widgets.map((w: any) => w.id);
  const layoutById = Object.fromEntries((layout || []).map((l: any) => [l.i, l]));
  return widgetOrder.map((id: string, idx: number) => {
    if (layoutById[id]) return layoutById[id];
    // Génère une position/taille par défaut si manquante
    return {
      i: id,
      x: (idx * 4) % 12,
      y: Math.floor(idx / 3) * 2,
      w: 4,
      h: 2,
    };
  });
}

function getWidthFromSize(size) {
  if (size === '1/3') return 4;
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
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfig(parsed);
      setLayout(parsed.layout || { lg: [] });
    }
  }, []);

  // 2. Application stricte du layout et des widgets
  // On utilise EXCLUSIVEMENT le layout enregistré dans la config utilisateur
  const widgetsToDisplay = config?.widgets || [];
  const widgetsById = Object.fromEntries(widgetsToDisplay.map((w: any) => [w.id, w]));
  const orderedLayouts = getOrderedAndCompleteLayout(widgetsToDisplay, config?.layout?.lg);

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
    setLayout(updatedLayouts);
    if (config) {
      const newConfig = { ...config, layout: updatedLayouts };
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
      { i: widgetId, x: 0, y: layout.lg.length, w: 4, h: 2 }
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
      if (current.w < 8) nextW = 8;
      else if (current.w < 12) nextW = 12;
      else nextW = 4;
      const newLayout = prevLayout.lg.map((l: any) => l.i === widgetId ? { ...l, w: nextW } : l);
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
    // Cycle: 4 (1/3) -> 8 (2/3) -> 12 (plein écran) -> 4 ...
    if (currentW < 6) return 8;
    if (currentW < 10) return 12;
    return 4;
  };



  // Fonction pour réinitialiser la taille d'un widget
  const handleResetWidgetSize = (widgetId: string) => {
    const newLayout = layout.lg.map((l: any) => {
      if (l.i === widgetId) {
        return { ...l, w: 4 };
      }
      return l;
    });
    const updatedLayouts = { ...layout, lg: newLayout };
    setLayout(updatedLayouts);
    if (config) {
      const newConfig = { ...config, layout: updatedLayouts };
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
            <div key={widget.id} data-grid={l} className="bg-white border rounded-lg flex flex-col h-full group relative">
              {/* Boutons d'action en haut à droite */}
              <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-80 group-hover:opacity-100">
                <button
                  className="p-1 bg-white rounded-full shadow hover:bg-orange-100 transition-colors"
                  title="Changer la largeur"
                  onClick={() => handleCycleWidgetWidth(widget.id)}
                >
                  <Layout className="w-4 h-4 text-orange-600" />
                </button>
                <button
                  className="p-1 bg-white rounded-full shadow hover:bg-orange-100 transition-colors"
                  title="Agrandir/Réduire la hauteur"
                  onClick={() => handleCycleWidgetHeight(widget.id)}
                >
                  {l.h < 6 ? <Maximize2 className="w-4 h-4 text-orange-600" /> : <Minimize2 className="w-4 h-4 text-orange-600" />}
                </button>
                <button
                  className="p-1 bg-white rounded-full shadow hover:bg-blue-100 transition-colors"
                  title="Réinitialiser la taille"
                  onClick={() => handleResetWidgetSize(widget.id)}
                >
                  <Layout className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  className="p-1 bg-white rounded-full shadow hover:bg-red-100 transition-colors"
                  title="Supprimer"
                  onClick={() => handleRemoveWidget(widget.id)}
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <WidgetRenderer
                  widget={widget}
                  widgetSize="medium"
                  onAction={handleWidgetAction}
                />
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {renderCommonServices()}
        <button
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          onClick={() => setShowAddWidgetModal(true)}
        >
          + Ajouter des widgets
        </button>
        {/* Ajout direct du widget pipeline commercial */}
        <div className="mb-8">
          <SalesPipelineWidget data={{ leads: listData['sales-pipeline'] }} />
        </div>
        {showAddWidgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Ajouter un widget vendeur</h2>
              <ul>
                {VendeurWidgets.widgets
                  .filter(widget => WIDGETS_VENDEUR_IDS.includes(widget.id))
                  .map(widget => {
                    const isInstalled = config.widgets.some((cw: any) => cw.id === widget.id);
                    return (
                      <li key={widget.id} className="mb-2 flex justify-between items-center">
                        <span>{widget.title}</span>
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