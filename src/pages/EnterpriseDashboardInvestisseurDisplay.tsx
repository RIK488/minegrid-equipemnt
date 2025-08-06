import React, { useEffect, useState } from 'react';
import { CheckCircle, Maximize2, Minimize2, X, Layout, Save } from 'lucide-react';
import { commonServices } from '../constants/commonServices';
import { DailyActionsPriorityWidget } from './DailyActionsWidgetFixed';
import { WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { InvestisseurWidgets } from './widgets/InvestisseurWidgets';
import { useRef } from 'react';
import WidgetRenderer from '../components/dashboard/WidgetRenderer';
import { listData } from '../constants/mockData';
import { NotificationContainer } from '../components/NotificationToast';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Mapping des liens pour chaque service commun (corrigé pour ramener au tableau de bord sauvegardé)
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

const WIDGETS_INVESTISSEUR_IDS = [
  'portfolio-value',
  'investment-opportunities',
  'roi-analysis',
  'risk-assessment',
  'opportunities'
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
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  return rows;
}

function generateLayoutFromPreview(widgets, widgetSizes) {
  const rows = computeGridRows(widgets, widgetSizes);
  const layout = [];
  rows.forEach((row, rowIndex) => {
    let x = 0;
    row.forEach(({ widget, width }) => {
      if (widget) {
        layout.push({
          i: widget.id,
          x,
          y: rowIndex,
          w: width / 4, // Convertir en unités de grille (12 colonnes)
          h: 2
        });
      }
      x += width / 4;
    });
  });
  return layout;
}

function generatePreviewLayout(widgets, widgetSizes) {
  const layout = [];
  let x = 0;
  let y = 0;
  let rowHeight = 2;

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

const EnterpriseDashboardInvestisseurDisplay: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [layout, setLayout] = useState<{ [key: string]: any[] }>({ lg: [] });
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [addStatus, setAddStatus] = useState<{ [key: string]: 'idle' | 'added' }>({});
  const addTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [showSizeMenu, setShowSizeMenu] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // 1. Chargement initial
  useEffect(() => {
    const saved = localStorage.getItem('enterpriseDashboardConfig_investisseur');
    let parsed = saved ? JSON.parse(saved) : null;
    let shouldUpdate = false;

    // Si pas de config ou config invalide, créer une nouvelle config complète avec tous les widgets
    if (!parsed || !parsed.widgets || !Array.isArray(parsed.widgets)) {
      // Charger tous les widgets par défaut
      const allWidgets = InvestisseurWidgets.widgets;
      const defaultLayout = allWidgets.map((widget, index) => ({
        i: widget.id,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 2,
        w: 4,
        h: 2
      }));
      
      parsed = {
        widgets: allWidgets,
        layout: { lg: defaultLayout },
        widgetSizes: {}
      };
      shouldUpdate = true;
      console.log('🆕 Configuration par défaut créée avec tous les widgets:', allWidgets.map(w => w.id));
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
      localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(parsed));
    }

    // Harmonisation des IDs : on utilise uniquement les IDs valides
    const validIds = [
      'portfolio-value',
      'investment-opportunities',
      'roi-analysis',
      'risk-assessment',
      'opportunities'
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

  // Effet de débogage pour vérifier la configuration
  useEffect(() => {
    if (config) {
      console.log('🔍 Configuration actuelle:', config);
      console.log('🔍 Widgets présents:', config.widgets?.map((w: any) => w.id));
      console.log('🔍 Layout:', config.layout?.lg?.map((l: any) => l.i));
      console.log('🔍 WidgetSizes:', config.widgetSizes);
      
      // Vérifier s'il manque des widgets
      const allWidgetIds = InvestisseurWidgets.widgets.map(w => w.id);
      const currentWidgetIds = config.widgets?.map((w: any) => w.id) || [];
      const missingWidgets = allWidgetIds.filter(id => !currentWidgetIds.includes(id));
      
      if (missingWidgets.length > 0) {
        console.log('⚠️ Widgets manquants:', missingWidgets);
        console.log('💡 Utilisez le bouton "Restaurer tous les widgets" pour les ajouter');
      } else {
        console.log('✅ Tous les widgets sont présents');
      }
      
      console.log('🔍 Configuration chargée avec succès');
    }
  }, [config]);

  // 2. Gestion du layout responsive
  const onLayoutChange = (newLayout: any[], allLayouts?: any) => {
    console.log('🔄 Layout changé:', newLayout);
    setLayout({ lg: newLayout });
    
    // Mettre à jour la config avec le nouveau layout
    if (config) {
      const updatedConfig = { ...config, layout: { lg: newLayout } };
      setConfig(updatedConfig);
      localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(updatedConfig));
    }
  };

  // 3. Gestion des tailles de widgets
  const handleToggleSize = (widgetId: string) => {
    setLayout(prevLayout => {
      const current = prevLayout.lg.find((l: any) => l.i === widgetId);
      if (!current) return prevLayout;
      
      // Cycle de tailles : 1/3 → 2/3 → 1/1 → 1/3
      let nextW, nextH;
      if (current.w <= 4) {
        nextW = 8; // 2/3
        nextH = 3;
      } else if (current.w <= 8) {
        nextW = 12; // 1/1
        nextH = 4;
      } else {
        nextW = 4; // 1/3
        nextH = 2;
      }
      
      const newLayout = prevLayout.lg.map((l: any) => 
        l.i === widgetId ? { ...l, w: nextW, h: nextH } : l
      );
      const updatedLayouts = { ...prevLayout, lg: newLayout };
      
      // Mise à jour de la config
      setConfig(prevConfig => {
        if (!prevConfig) return prevConfig;
        const newConfig = { ...prevConfig, layout: updatedLayouts };
        localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
        return newConfig;
      });
      
      return updatedLayouts;
    });
  };

  // Supprime un widget
  const handleRemoveWidget = (widgetId: string) => {
    console.log('Suppression du widget:', widgetId);
    
    // Sauvegarder la position actuelle du widget avant suppression
    const currentLayoutItem = layout.lg.find((l: any) => l.i === widgetId);
    if (currentLayoutItem) {
      // Créer ou mettre à jour le backup avec la position du widget supprimé
      const existingBackup = localStorage.getItem('enterpriseDashboardConfig_investisseur_backup');
      let backupConfig = existingBackup ? JSON.parse(existingBackup) : { layout: { lg: [] } };
      
      // Ajouter ou mettre à jour la position du widget dans le backup
      const existingIndex = backupConfig.layout.lg.findIndex((l: any) => l.i === widgetId);
      if (existingIndex >= 0) {
        backupConfig.layout.lg[existingIndex] = currentLayoutItem;
      } else {
        backupConfig.layout.lg.push(currentLayoutItem);
      }
      
      localStorage.setItem('enterpriseDashboardConfig_investisseur_backup', JSON.stringify(backupConfig));
      console.log('Position sauvegardée pour restauration:', currentLayoutItem);
    }
    
    const newWidgets = config.widgets.filter((w: any) => w.id !== widgetId);
    const newLayout = layout.lg.filter((l: any) => l.i !== widgetId);
    const updatedLayouts = { ...layout, lg: newLayout };
    const newConfig = { ...config, widgets: newWidgets, layout: updatedLayouts };
    setConfig(newConfig);
    setLayout(updatedLayouts);
    localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
  };

  // Ajoute un widget
  const handleAddWidget = (widgetId: string) => {
    console.log('Ajout du widget:', widgetId);
    const widgetToAdd = InvestisseurWidgets.widgets.find(w => w.id === widgetId);
    if (!widgetToAdd) {
      console.log('Widget non trouvé:', widgetId);
      return;
    }
    
    const newWidgets = [...config.widgets, widgetToAdd];
    
    // Vérifier s'il existe une position sauvegardée pour ce widget
    const savedLayout = localStorage.getItem('enterpriseDashboardConfig_investisseur_backup');
    let originalPosition = null;
    
    if (savedLayout) {
      try {
        const backupConfig = JSON.parse(savedLayout);
        const originalLayoutItem = backupConfig.layout?.lg?.find((l: any) => l.i === widgetId);
        if (originalLayoutItem) {
          originalPosition = originalLayoutItem;
          console.log('Position originale trouvée:', originalPosition);
        }
      } catch (error) {
        console.log('Erreur lors de la lecture du backup:', error);
      }
    }
    
    // Créer le nouveau layout
    let newLayout;
    if (originalPosition) {
      // Restaurer la position originale
      newLayout = [
        ...layout.lg,
        {
          i: widgetId,
          x: originalPosition.x,
          y: originalPosition.y,
          w: originalPosition.w,
          h: originalPosition.h
        }
      ];
      console.log('Position originale restaurée pour', widgetId);
    } else {
      // Positionner à la fin par défaut
      newLayout = [
        ...layout.lg,
        { i: widgetId, x: 0, y: layout.lg.length, w: 4, h: 2 }
      ];
      console.log('Position par défaut pour', widgetId);
    }
    
    const newConfig = { ...config, widgets: newWidgets, layout: { ...config.layout, lg: newLayout } };
    setConfig(newConfig);
    setLayout(newConfig.layout);
    localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
    
    setAddStatus(s => ({ ...s, [widgetId]: 'added' }));
    if (addTimeouts.current[widgetId]) clearTimeout(addTimeouts.current[widgetId]);
    addTimeouts.current[widgetId] = setTimeout(() => {
      setAddStatus(s => ({ ...s, [widgetId]: 'idle' }));
      
      // Nettoyer le backup pour ce widget après ajout réussi
      const existingBackup = localStorage.getItem('enterpriseDashboardConfig_investisseur_backup');
      if (existingBackup) {
        try {
          const backupConfig = JSON.parse(existingBackup);
          backupConfig.layout.lg = backupConfig.layout.lg.filter((l: any) => l.i !== widgetId);
          localStorage.setItem('enterpriseDashboardConfig_investisseur_backup', JSON.stringify(backupConfig));
          console.log('Backup nettoyé pour', widgetId);
        } catch (error) {
          console.log('Erreur lors du nettoyage du backup:', error);
        }
      }
    }, 1500);
  };

  // Fonction pour réafficher tous les widgets supprimés
  const handleRestoreAllWidgets = () => {
    // Liste complète des widgets métier
    const allWidgets = InvestisseurWidgets.widgets;
    // Widgets actuellement affichés
    const currentIds = config.widgets.map((w: any) => w.id);
    // Widgets manquants
    const missingWidgets = allWidgets.filter(w => !currentIds.includes(w.id));
    if (missingWidgets.length === 0) return; // Rien à faire

    console.log('🔧 Restauration des widgets manquants:', missingWidgets.map(w => w.id));

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
    localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
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
        localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
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
        localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
        return newConfig;
      });
      return updatedLayouts;
    });
  };

  // Fonction pour sauvegarder la configuration
  const handleSaveDashboard = () => {
    setSaveStatus('saving');
    
    // Sauvegarde la configuration actuelle
    const currentConfig = {
      ...config,
      layout: layout,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(currentConfig));
    
    // Simuler un délai de sauvegarde
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  // Rendu des services communs
  const renderCommonServices = () => (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {commonServices.map((service, idx) => {
          const Icon = service.icon;
          // Utiliser les liens originaux pour chaque service
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

  // Gestion des actions de widgets
  const handleWidgetAction = (action: string, data: any) => {
    console.log('Action widget:', action, data);
    // Implémenter les actions spécifiques ici
  };

  // Fonction utilitaire pour obtenir la largeur suivante
  const getNextWidgetWidth = (currentW: number) => {
    if (currentW < 5) return 7;
    if (currentW < 10) return 10;
    return 3;
  };

  // Fonction pour réinitialiser la taille d'un widget
  const handleResetWidgetSize = (widgetId: string) => {
    setLayout(prevLayout => {
      const newLayout = prevLayout.lg.map((l: any) => 
        l.i === widgetId ? { ...l, w: 4, h: 2 } : l
      );
      const updatedLayouts = { ...prevLayout, lg: newLayout };
      
      setConfig(prevConfig => {
        if (!prevConfig) return prevConfig;
        const newConfig = { ...prevConfig, layout: updatedLayouts };
        localStorage.setItem('enterpriseDashboardConfig_investisseur', JSON.stringify(newConfig));
        return newConfig;
      });
      
      return updatedLayouts;
    });
  };

  // Rendu des widgets
  const renderWidgets = () => {
    if (!config || !config.widgets || config.widgets.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Aucun widget configuré</div>
          <button
            onClick={handleRestoreAllWidgets}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Restaurer tous les widgets
          </button>
        </div>
      );
    }

    // Créer un mapping des widgets par ID pour un accès rapide
    const widgetsById = config.widgets.reduce((acc: any, widget: any) => {
      acc[widget.id] = widget;
      return acc;
    }, {});

    // Générer le layout ordonné
    const orderedLayouts = getOrderedAndCompleteLayout(config.widgets, layout, config.widgetSizes);

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
                  <h3 className="text-lg font-bold text-gray-900">{widget.title}</h3>
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
        
        {/* Barre d'actions avec bouton Sauvegarder */}
        <div className="flex justify-between items-center mb-4">
          {/* Bouton Sauvegarder sur le côté gauche */}
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              saveStatus === 'saving' 
                ? 'bg-orange-500 text-white cursor-not-allowed' 
                : saveStatus === 'saved'
                ? 'bg-orange-400 text-white'
                : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg'
            }`}
            onClick={handleSaveDashboard}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sauvegarde...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Sauvegardé !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </>
            )}
          </button>
          
          <button
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            onClick={() => setShowAddWidgetModal(true)}
          >
            + Ajouter des widgets
          </button>
        </div>

        {showAddWidgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Ajouter un widget investisseur</h2>
              <div className="mb-2 text-xs text-gray-500">
                Widgets disponibles: {InvestisseurWidgets.widgets.length} | 
                Widgets filtrés: {InvestisseurWidgets.widgets.filter(widget => WIDGETS_INVESTISSEUR_IDS.includes(widget.id)).length}
              </div>
              <ul>
                {InvestisseurWidgets.widgets
                  .filter(widget => WIDGETS_INVESTISSEUR_IDS.includes(widget.id))
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
                className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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

export default EnterpriseDashboardInvestisseurDisplay; 