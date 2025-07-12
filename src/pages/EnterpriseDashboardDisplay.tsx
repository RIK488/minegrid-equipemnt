import React, { useEffect, useState } from 'react';
import { CheckCircle, Package } from 'lucide-react';
import { VendeurWidgets } from './widgets/VendeurWidgets';
import { DailyActionsPriorityWidget } from './DailyActionsWidgetFixed';
import { iconMap } from '../constants/iconMap';
import { commonServices } from '../constants/commonServices';

// On pourra ajouter d'autres imports de widgets métier ici si besoin

const EnterpriseDashboardDisplay: React.FC = () => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // On lit la config du localStorage (ici pour le métier vendeur)
    const saved = localStorage.getItem('enterpriseDashboardConfig_vendeur');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

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

  // Rendu des services communs (compact, comme dans le dashboard réel)
  const renderCommonServices = () => (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {commonServices.map((service, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center py-2 px-1 rounded"
            style={{ minWidth: 0 }}
          >
            <service.icon className="h-6 w-6 text-orange-500 mb-1" />
            <span className="text-xs text-orange-800 text-center truncate">{service.title}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu dynamique des widgets métier selon la config
  const renderWidgets = () => (
    <div className="space-y-4">
      {config.widgets.map((widget: any, idx: number) => {
        // Exemple : on peut router dynamiquement selon l'id ou le type
        if (widget.id === 'daily-actions') {
          return (
            <DailyActionsPriorityWidget 
              key={widget.id} 
              data={[]} // Données par défaut, le widget utilisera ses données internes
            />
          );
        }
        
        // Pour les autres widgets, on affiche un placeholder avec les infos du widget
        const widgetConfig = VendeurWidgets.widgets.find(w => w.id === widget.id);
        if (widgetConfig) {
          const Icon = widgetConfig.icon;
          return (
            <div key={widget.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Icon className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{widgetConfig.title}</h3>
                  <p className="text-sm text-gray-600">{widgetConfig.description}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Widget {widgetConfig.type} - {widgetConfig.category}
              </div>
            </div>
          );
        }
        
        // Widget non trouvé
        return (
          <div key={widget.id} className="bg-white border rounded-lg p-4">
            <div className="text-gray-500">
              Widget non configuré: {widget.id}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Services communs */}
        {renderCommonServices()}
        {/* Widgets métier */}
        {renderWidgets()}
      </div>
    </div>
  );
};

export default EnterpriseDashboardDisplay; 