import React, { useState } from 'react';

// Widget Actions Commerciales Prioritaires - Version corrigée
export const DailyActionsPriorityWidget = ({ data, widgetSize = 'normal' }: { data: any[]; widgetSize?: 'small' | 'normal' | 'large' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  // Données par défaut si aucune donnée n'est fournie
  const defaultActions = [
    {
      id: 1,
      title: 'Relancer Ahmed Benali - Prospect chaud',
      description: 'A consulté votre CAT 320D 3 fois cette semaine. Prêt à acheter.',
      priority: 'high',
      category: 'prospection',
      impact: '+85%',
      impactDescription: 'Probabilité de conversion',
      estimatedTime: '15 min',
      status: 'pending',
      contact: {
        name: 'Ahmed Benali',
        phone: '+212 6 12 34 56 78',
        email: 'ahmed.benali@construction.ma',
        company: 'Construction Benali SARL',
        lastContact: '2024-01-20'
      },
      action: 'Appel de suivi + envoi devis personnalisé',
      notes: 'Intéressé par financement leasing. Budget 450k MAD.',
      deadline: '2024-01-25'
    },
    {
      id: 2,
      title: 'Finaliser devis CAT 950GC - Mines du Sud',
      description: 'Devis en cours depuis 5 jours. Client impatient.',
      priority: 'high',
      category: 'devis',
      impact: '+70%',
      impactDescription: 'Chance de vente',
      estimatedTime: '30 min',
      status: 'pending',
      contact: {
        name: 'Fatima Zahra',
        phone: '+212 6 98 76 54 32',
        email: 'f.zahra@minesdusud.ma',
        company: 'Mines du Sud SA',
        lastContact: '2024-01-18'
      },
      action: 'Finaliser devis + appel de présentation',
      notes: 'Demande spécifique: godet de 1.2m³, chenilles larges.',
      deadline: '2024-01-23'
    },
    {
      id: 3,
      title: 'Appel de relance - 12 prospects inactifs',
      description: 'Prospects qui n\'ont pas été contactés depuis 7+ jours.',
      priority: 'medium',
      category: 'relance',
      impact: '+25%',
      impactDescription: 'Taux de réactivation',
      estimatedTime: '45 min',
      status: 'pending',
      contact: {
        name: 'Liste de 12 prospects',
        phone: 'Voir détails',
        email: 'campagne@minegrid.ma',
        company: 'Diverses entreprises',
        lastContact: '2024-01-15'
      },
      action: 'Campagne d\'appels + emails personnalisés',
      notes: 'Focus sur 3 prospects prioritaires restants.',
      deadline: '2024-01-26'
    }
  ];

  // Utiliser les données passées en props ou les données par défaut
  const actions = data && data.length > 0 ? data : defaultActions;

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

  const handleMarkAsDone = (action: any) => {
    alert(`✅ Action marquée comme terminée : ${action.title}`);
    console.log(`[API] Action terminée: ${action.id} - ${action.title}`);
  };

  const handlePostpone = (action: any) => {
    alert(`⏰ Action reportée : ${action.title}`);
    console.log(`[API] Action reportée: ${action.id} - ${action.title}`);
  };

  const handleCall = (phone: string) => {
    if (phone && phone !== 'N/A' && phone !== 'Voir détails') {
      window.open(`tel:${phone}`, '_blank');
    } else {
      alert('Numéro de téléphone non disponible');
    }
  };

  const handleEmail = (email: string) => {
    if (email && email !== 'N/A') {
      window.open(`mailto:${email}`, '_blank');
    } else {
      alert('Email non disponible');
    }
  };

  const handleWhatsApp = (phone: string) => {
    if (phone && phone !== 'N/A' && phone !== 'Voir détails') {
      const cleanPhone = phone.replace(/\s/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      alert('Numéro WhatsApp non disponible');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actions Commerciales Prioritaires</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tâches urgentes du jour triées par impact/priorité</p>
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
        {actions.map((action) => (
          <div
            key={action.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            onClick={() => handleActionClick(action)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">📋</div>
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Impact: {action.impact} {action.impactDescription}
                  </div>
                  
                  {/* Contact rapide */}
                  {action.contact && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500">Contact:</span>
                      <span className="font-medium">{action.contact.name}</span>
                      {action.contact.phone && action.contact.phone !== 'N/A' && action.contact.phone !== 'Voir détails' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(action.contact.phone);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          📞
                        </button>
                      )}
                      {action.contact.email && action.contact.email !== 'N/A' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmail(action.contact.email);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          📧
                        </button>
                      )}
                      {action.contact.phone && action.contact.phone !== 'N/A' && action.contact.phone !== 'Voir détails' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(action.contact.phone);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          💬
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsDone(action);
                  }}
                >
                  ✅ Fait
                </button>
                <button
                  className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full hover:bg-orange-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostpone(action);
                  }}
                >
                  ⏰ Reporter
                </button>
              </div>
            </div>
          </div>
        ))}
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
                  <span className="text-2xl">📋</span>
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
                  <div className="font-medium text-gray-900 dark:text-white">{selectedAction.impact} {selectedAction.impactDescription}</div>
                </div>
              </div>

              {selectedAction.contact && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Contact :
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div><strong>{selectedAction.contact.name}</strong></div>
                    <div>{selectedAction.contact.company}</div>
                    <div>{selectedAction.contact.phone}</div>
                    <div>{selectedAction.contact.email}</div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleMarkAsDone(selectedAction)}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ✅ Marquer comme fait
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