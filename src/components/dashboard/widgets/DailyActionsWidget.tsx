import React, { useState } from 'react';
import { Clock, Phone, Mail, Calendar, Target, TrendingUp, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Widget, DailyAction } from '../../../constants/dashboardTypes';
import { formatDate, formatTime } from '../../../utils/dashboardUtils';

interface DailyActionsWidgetProps {
  widget: Widget;
  data: DailyAction[];
  widgetSize?: 'small' | 'medium' | 'large';
  onAction?: (action: string, item: DailyAction) => void;
}

const DailyActionsWidget: React.FC<DailyActionsWidgetProps> = ({ widget, data, widgetSize = 'medium', onAction }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAction, setSelectedAction] = useState<DailyAction | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showContactForm, setShowContactForm] = useState(false);

  // Fonction pour obtenir la taille adaptative
  const getAdaptiveSize = (type: 'text' | 'spacing' | 'grid') => {
    switch (widgetSize) {
      case 'small':
        return type === 'text' ? 'text-xs' : type === 'spacing' ? 'p-2' : 'grid-cols-1';
      case 'large':
        return type === 'text' ? 'text-lg' : type === 'spacing' ? 'p-6' : 'grid-cols-3';
      default:
        return type === 'text' ? 'text-sm' : type === 'spacing' ? 'p-4' : 'grid-cols-2';
    }
  };

  // Fonction pour obtenir l'icône de priorité
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Fonction pour filtrer les actions
  const getFilteredActions = () => {
    if (filter === 'all') return data;
    return data.filter(action => action.priority === filter);
  };

  // Fonction pour obtenir les statistiques
  const getStats = () => {
    const total = data.length;
    const high = data.filter(action => action.priority === 'high').length;
    const medium = data.filter(action => action.priority === 'medium').length;
    const low = data.filter(action => action.priority === 'low').length;
    const completed = data.filter(action => action.status === 'completed').length;
    const pending = data.filter(action => action.status === 'pending').length;

    return { total, high, medium, low, completed, pending };
  };

  // Fonction pour gérer les actions
  const handleAction = (action: string, item: DailyAction) => {
    if (onAction) {
      onAction(action, item);
    }
    
    switch (action) {
      case 'view':
        setSelectedAction(item);
        setShowDetails(true);
        break;
      case 'contact':
        setSelectedAction(item);
        setShowContactForm(true);
        break;
      case 'complete':
        // Logique de complétion
        break;
      case 'reschedule':
        // Logique de reprogrammation
        break;
      default:
        break;
    }
  };

  // Fonction pour rendre les actions
  const renderActions = () => {
    const filteredActions = getFilteredActions();
    const maxItems = widgetSize === 'small' ? 3 : widgetSize === 'large' ? 8 : 5;

    if (!filteredActions || filteredActions.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">Aucune action à afficher</div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredActions.slice(0, maxItems).map((action) => (
          <div
            key={action.id}
            className={`p-3 rounded-lg border ${getPriorityColor(action.priority)} hover:shadow-md cursor-pointer transition-all`}
            onClick={() => handleAction('view', action)}
          >
            <div className="flex items-start justify-between">
              {/* Icône de priorité */}
              <div className="mr-3 mt-1">
                {getPriorityIcon(action.priority)}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {action.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {action.estimatedTime}
                    </span>
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                      {action.impact}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {action.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(action.deadline)}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {action.impactDescription}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('contact', action);
                      }}
                      className="text-orange-600 hover:text-orange-700"
                      title="Contacter"
                    >
                      <Phone className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('complete', action);
                      }}
                      className="text-green-600 hover:text-green-700"
                      title="Marquer comme terminé"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bouton "Voir plus" */}
        {filteredActions.length > maxItems && (
          <div className="text-center pt-2">
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Voir toutes les {filteredActions.length} actions
            </button>
          </div>
        )}
      </div>
    );
  };

  // Fonction pour rendre les filtres
  const renderFilters = () => {
    const stats = getStats();

    return (
      <div className="flex space-x-1 mb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 text-xs rounded ${
            filter === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Toutes ({stats.total})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-2 py-1 text-xs rounded ${
            filter === 'high'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Haute ({stats.high})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-2 py-1 text-xs rounded ${
            filter === 'medium'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Moyenne ({stats.medium})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-2 py-1 text-xs rounded ${
            filter === 'low'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Basse ({stats.low})
        </button>
      </div>
    );
  };

  // Fonction pour rendre les statistiques
  const renderStats = () => {
    const stats = getStats();

    return (
      <div className={`grid ${getAdaptiveSize('grid')} gap-2 mb-3`}>
        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="font-semibold text-orange-600">{stats.completed}</div>
          <div className="text-xs text-orange-700">Terminées</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{stats.pending}</div>
          <div className="text-xs text-gray-600">En attente</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="font-semibold text-red-600">{stats.high}</div>
          <div className="text-xs text-red-700">Priorité haute</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Statistiques */}
      {renderStats()}

      {/* Filtres */}
      {renderFilters()}

      {/* Actions */}
      {renderActions()}

      {/* Modal de détails */}
      {showDetails && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Détails de l'action</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Action</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-start p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Titre:</span>
                    <span className="text-sm font-medium text-gray-900 max-w-xs text-right">
                      {selectedAction.title}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Description:</span>
                    <span className="text-sm font-medium text-gray-900 max-w-xs text-right">
                      {selectedAction.description}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Action à effectuer:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAction.action}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Impact:</span>
                    <span className="text-sm font-medium text-orange-600">
                      {selectedAction.impact} - {selectedAction.impactDescription}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Temps estimé:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAction.estimatedTime}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Échéance:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(selectedAction.deadline)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Nom:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAction.contact.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Entreprise:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAction.contact.company}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Téléphone:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAction.contact.phone}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAction.contact.email}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Dernier contact:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(selectedAction.contact.lastContact)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAction.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-900">{selectedAction.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAction('contact', selectedAction)}
                    className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors flex items-center justify-center"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contacter
                  </button>
                  <button 
                    onClick={() => handleAction('complete', selectedAction)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de contact */}
      {showContactForm && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Contacter {selectedAction.contact.name}</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {selectedAction.contact.name}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {selectedAction.contact.company}
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler {selectedAction.contact.phone}
                </button>
                
                <button className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer email
                </button>
                
                <button className="w-full flex items-center justify-center p-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier un rendez-vous
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyActionsWidget; 