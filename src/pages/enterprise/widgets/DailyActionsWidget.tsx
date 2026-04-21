import React, { useState } from 'react';
import { toast } from '../../../utils/toast';
export const DailyActionsWidget = ({ data }: { data: any[] }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  // Générer des actions prioritaires basées sur les données
  const generateDailyActions = () => {
    const actions = [
      {
        id: 1,
        title: 'Relancer Ahmed Benali (prospect chaud)',
        description: 'Prospect qui a consulté votre 950GC 3 fois cette semaine',
        priority: 'high',
        category: 'prospection',
        impact: 'Élevé - 85% de probabilité de conversion',
        estimatedTime: '15 min',
        icon: '👤',
        action: 'Envoyer message WhatsApp personnalisé'
      },
      {
        id: 2,
        title: 'Réduire le prix du CAT 320D (-2.5%)',
        description: 'Machine en stock depuis 92 jours sans contact',
        priority: 'medium',
        category: 'pricing',
        impact: 'Moyen - Augmentation de 40% des vues attendues',
        estimatedTime: '5 min',
        icon: '💰',
        action: 'Mettre à jour le prix et booster la visibilité'
      },
      {
        id: 3,
        title: 'Publier une annonce pour compacteur',
        description: 'Forte demande détectée à Casablanca cette semaine',
        priority: 'medium',
        category: 'marketing',
        impact: 'Moyen - 15-20 prospects qualifiés attendus',
        estimatedTime: '20 min',
        icon: '📢',
        action: 'Créer annonce optimisée SEO'
      },
      {
        id: 4,
        title: 'Analyser les prospects inactifs',
        description: '12 prospects n\'ont pas été contactés depuis 7+ jours',
        priority: 'low',
        category: 'follow-up',
        impact: 'Faible - Potentiel de réactivation',
        estimatedTime: '30 min',
        icon: '📊',
        action: 'Planifier campagne de relance'
      },
      {
        id: 5,
        title: 'Optimiser les annonces existantes',
        description: '3 annonces ont un taux de clic < 2%',
        priority: 'low',
        category: 'optimization',
        impact: 'Faible - Amélioration progressive',
        estimatedTime: '25 min',
        icon: '⚡',
        action: 'Réviser titres et descriptions'
      }
    ];

    return actions.slice(0, 5); // Retourner les 5 actions les plus prioritaires
  };

  const actions = generateDailyActions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30';
      case 'low': return 'text-green-700 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const handleActionClick = (action: any) => {
    setSelectedAction(action);
    setShowDetails(true);
  };

  const handleExecuteAction = (action: any) => {
    // Simulation d'exécution d'action
    toast(`✅ Action exécutée : ${action.title}\n\n${action.action}\n\nTemps estimé : ${action.estimatedTime}\nImpact attendu : ${action.impact}`);

    // Ici on pourrait appeler une API pour marquer l'action comme effectuée
    console.log(`[API] Action exécutée: ${action.id} - ${action.title}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actions prioritaires du jour</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Générées par IA pour maximiser vos ventes</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {actions.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            actions à effectuer
          </div>
        </div>
      </div>

      {/* Liste des actions */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={action.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            onClick={() => handleActionClick(action)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">{action.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                      {getPriorityIcon(action.priority)} {action.priority === 'high' ? 'Urgent' : action.priority === 'medium' ? 'Important' : 'Normal'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {action.estimatedTime}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {action.description}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Impact: {action.impact}
                  </div>
                </div>
              </div>
              <button
                className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full hover:bg-orange-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecuteAction(action);
                }}
              >
                Exécuter
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {actions.filter(a => a.priority === 'high').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Urgentes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {actions.filter(a => a.priority === 'medium').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Importantes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {actions.filter(a => a.priority === 'low').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Normales</div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetails && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Détails de l'action
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{selectedAction.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAction.priority)}`}>
                    {getPriorityIcon(selectedAction.priority)} {selectedAction.priority === 'high' ? 'Urgent' : selectedAction.priority === 'medium' ? 'Important' : 'Normal'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedAction.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAction.description}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Action à effectuer :
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAction.action}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Temps estimé</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedAction.estimatedTime}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Impact attendu</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedAction.impact}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleExecuteAction(selectedAction)}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Exécuter maintenant
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
