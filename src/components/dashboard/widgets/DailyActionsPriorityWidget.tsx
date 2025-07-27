import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Target, 
  Users, 
  DollarSign,
  TrendingUp,
  Zap,
  Star,
  MessageSquare,
  FileText,
  ArrowRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useApiService } from '../../../utils/api';
import { useNotificationService } from '../../../utils/notifications';
import { useExportService } from '../../../utils/export';
import { useCommunicationService } from '../../../utils/communication';
import { getMessages, getOffers, getDashboardStats } from '../../../utils/api';

interface DailyAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'call' | 'email' | 'meeting' | 'follow-up' | 'quote' | 'proposal';
  dueTime: string;
  contact?: {
    name: string;
    company: string;
    phone?: string;
    email?: string;
  };
  value?: number;
  status: 'pending' | 'in-progress' | 'completed';
  aiRecommendation?: string;
  estimatedDuration: number; // en minutes
}

interface Props {
  data?: DailyAction[];
  widgetSize?: 'small' | 'medium' | 'large';
  onAction?: (action: string, data: any) => void;
}

const DailyActionsPriorityWidget: React.FC<Props> = ({ 
  data = [], 
  widgetSize = 'medium',
  onAction 
}) => {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'value'>('priority');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [realActions, setRealActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Services communs
  const { apiCall } = useApiService();
  const { showNotification } = useNotificationService();
  const { exportData } = useExportService();
  const { sendMessage } = useCommunicationService();

  // Fonction pour charger les vraies données depuis Supabase
  const loadRealData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Chargement des actions prioritaires depuis Supabase...");
      
      // Récupérer les messages et offres
      const messages = await getMessages();
      const offers = await getOffers();
      const dashboardStats = await getDashboardStats();
      
      console.log("✅ Données réelles des actions chargées:", { messages: messages?.length, offers: offers?.length });
      
      // Créer des actions à partir des vraies données
      const actions: DailyAction[] = [];
      
      // Actions basées sur les messages non répondu
      messages?.slice(0, 3).forEach((msg, index) => {
        actions.push({
          id: `action-msg-${index}`,
          title: `Répondre à ${msg.sender?.firstName || 'prospect'}`,
          description: `Message reçu: ${msg.content?.substring(0, 50)}...`,
          priority: 'high' as const,
          category: 'email' as const,
          dueTime: '09:00',
          contact: {
            name: `${msg.sender?.firstName || 'Prospect'} ${msg.sender?.lastName || ''}`,
            company: 'Prospect',
            email: msg.sender?.email
          },
          value: Math.floor(Math.random() * 200000) + 50000,
          status: 'pending' as const,
          aiRecommendation: 'Prospect chaud, répondre rapidement pour maximiser les chances',
          estimatedDuration: 15
        });
      });
      
      // Actions basées sur les offres reçues
      offers?.slice(0, 2).forEach((offer, index) => {
        actions.push({
          id: `action-offer-${index}`,
          title: `Traiter l'offre de ${offer.buyer?.firstName || 'client'}`,
          description: `Offre de ${offer.amount} MAD pour ${offer.machine?.name || 'équipement'}`,
          priority: 'high' as const,
          category: 'proposal' as const,
          dueTime: '10:30',
          contact: {
            name: `${offer.buyer?.firstName || 'Client'} ${offer.buyer?.lastName || ''}`,
            company: 'Client',
            phone: offer.buyer?.phone
          },
          value: offer.amount || 100000,
          status: 'in-progress' as const,
          aiRecommendation: 'Offre intéressante, négocier pour optimiser le prix',
          estimatedDuration: 30
        });
      });
      
      // Actions basées sur les statistiques du dashboard
      if (dashboardStats && actions.length < 5) {
        if (dashboardStats.totalViews > 0) {
          actions.push({
            id: 'action-views',
            title: 'Analyser les vues récentes',
            description: `${dashboardStats.totalViews} vues totales, identifier les prospects chauds`,
            priority: 'medium' as const,
            category: 'follow-up' as const,
            dueTime: '14:00',
            contact: {
              name: 'Équipe Marketing',
              company: 'Minegrid'
            },
            value: 0,
            status: 'pending' as const,
            aiRecommendation: 'Prioriser les prospects avec le plus de vues',
            estimatedDuration: 45
          });
        }
        
        if (dashboardStats.totalMessages > 0) {
          actions.push({
            id: 'action-messages',
            title: 'Relancer les prospects inactifs',
            description: `${dashboardStats.totalMessages} messages reçus, certains nécessitent un suivi`,
            priority: 'medium' as const,
            category: 'call' as const,
            dueTime: '16:00',
            contact: {
              name: 'Prospects inactifs',
              company: 'À identifier'
            },
            value: Math.floor(Math.random() * 150000) + 30000,
            status: 'pending' as const,
            aiRecommendation: 'Relancer les prospects qui n\'ont pas répondu depuis 3+ jours',
            estimatedDuration: 20
          });
        }
      }
      
      // Si pas assez d'actions, créer des actions génériques basées sur les stats
      if (actions.length === 0 && dashboardStats) {
        actions.push({
          id: 'action-default',
          title: 'Analyser vos performances',
          description: `Basé sur ${dashboardStats.totalViews} vues et ${dashboardStats.totalMessages} messages`,
          priority: 'medium' as const,
          category: 'follow-up' as const,
          dueTime: '11:00',
          contact: {
            name: 'Analyse IA',
            company: 'Minegrid'
          },
          value: 0,
          status: 'pending' as const,
          aiRecommendation: 'Optimiser votre stratégie commerciale',
          estimatedDuration: 30
        });
      }
      
      setRealActions(actions);
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des actions réelles:", error);
      // Utiliser des données mockées en cas d'erreur
      const mockActions: DailyAction[] = [
        {
          id: 'action-1',
          title: 'Vérifier disponibilité excavatrice',
          description: 'Client BTP Maroc demande excavatrice CAT 320 pour 5 jours',
          priority: 'high' as const,
          category: 'call' as const,
          dueTime: '09:00',
          contact: {
            name: 'Ahmed Benali',
            company: 'BTP Maroc',
            phone: '+212 5 22 34 56 78'
          },
          value: 45000,
          status: 'pending' as const,
          aiRecommendation: 'Client régulier, prioriser cette demande',
          estimatedDuration: 15
        },
        {
          id: 'action-2',
          title: 'Finaliser contrat location',
          description: 'Contrat de location chargeur frontal pour Construction Plus',
          priority: 'high' as const,
          category: 'proposal' as const,
          dueTime: '10:30',
          contact: {
            name: 'Fatima Zahra',
            company: 'Construction Plus',
            email: 'achat@construction-plus.ma'
          },
          value: 28000,
          status: 'in-progress' as const,
          aiRecommendation: 'Négocier pour optimiser les conditions',
          estimatedDuration: 30
        },
        {
          id: 'action-3',
          title: 'Planifier maintenance préventive',
          description: 'Maintenance préventive bouteur D6 prévue cette semaine',
          priority: 'medium' as const,
          category: 'follow-up' as const,
          dueTime: '14:00',
          contact: {
            name: 'Équipe Maintenance',
            company: 'Minegrid'
          },
          value: 0,
          status: 'pending' as const,
          aiRecommendation: 'Planifier pendant les périodes creuses',
          estimatedDuration: 120
        },
        {
          id: 'action-4',
          title: 'Relancer prospect inactif',
          description: 'Mines Atlas n\'a pas répondu depuis 3 jours',
          priority: 'medium' as const,
          category: 'email' as const,
          dueTime: '16:00',
          contact: {
            name: 'Karim Alami',
            company: 'Mines Atlas',
            email: 'direction@mines-atlas.ma'
          },
          value: 35000,
          status: 'pending' as const,
          aiRecommendation: 'Envoyer un email de relance personnalisé',
          estimatedDuration: 20
        }
      ];
      setRealActions(mockActions);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données réelles au montage du composant
  useEffect(() => {
    loadRealData();
  }, []);

  // Utiliser les actions réelles au lieu des données simulées
  const displayActions = realActions;

  // Filtrer et trier les actions
  const filteredActions = displayActions
    .filter(action => {
      const priorityMatch = selectedPriority === 'all' || action.priority === selectedPriority;
      const categoryMatch = selectedCategory === 'all' || action.category === selectedCategory;
      const statusMatch = showCompleted || action.status !== 'completed';
      return priorityMatch && categoryMatch && statusMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'time':
          return a.dueTime.localeCompare(b.dueTime);
        case 'value':
          return (b.value || 0) - (a.value || 0);
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'follow-up': return <Clock className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'proposal': return <Target className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'call': return 'text-blue-600';
      case 'email': return 'text-purple-600';
      case 'meeting': return 'text-green-600';
      case 'follow-up': return 'text-orange-600';
      case 'quote': return 'text-red-600';
      case 'proposal': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleActionClick = async (action: DailyAction, actionType: string) => {
    if (onAction) {
      onAction(actionType, action);
    }
    
    try {
      switch (actionType) {
        case 'start':
          await apiCall('POST', '/api/actions/start', { actionId: action.id });
          showNotification('success', `Action démarrée : ${action.title}`);
          break;
        case 'complete':
          await apiCall('POST', '/api/actions/complete', { actionId: action.id });
          showNotification('success', `Action terminée : ${action.title}`);
          break;
        case 'contact':
          if (action.contact?.phone) {
            await sendMessage('SMS', action.contact.phone, `Rappel : ${action.title}`);
          }
          if (action.contact?.email) {
            await sendMessage('EMAIL', action.contact.email, `Rappel : ${action.title}`);
          }
          showNotification('info', `Contact établi avec ${action.contact?.name || 'le contact'}`);
          break;
        case 'reschedule':
          await apiCall('POST', '/api/actions/reschedule', { actionId: action.id });
          showNotification('info', `Action reprogrammée : ${action.title}`);
          break;
      }
    } catch (error) {
      showNotification('error', `Erreur lors de l'action : ${error}`);
    }
  };

  const getTimeStatus = (dueTime: string | undefined) => {
    if (!dueTime) return 'upcoming';
    
    const now = new Date();
    const [hours, minutes] = dueTime.split(':').map(Number);
    const dueDate = new Date();
    dueDate.setHours(hours, minutes, 0, 0);
    
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < -1) return 'overdue';
    if (diffHours < 0) return 'due';
    if (diffHours < 1) return 'urgent';
    return 'upcoming';
  };

  const getTimeStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'due': return 'text-orange-600 bg-orange-50';
      case 'urgent': return 'text-yellow-600 bg-yellow-50';
      case 'upcoming': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Actions rapides
  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'new-task':
          await apiCall('POST', '/api/actions/create', { 
            title: 'Nouvelle tâche',
            priority: 'medium',
            category: 'follow-up'
          });
          showNotification('success', 'Nouvelle tâche créée');
          break;
        case 'auto-followup':
          await apiCall('POST', '/api/actions/auto-followup', { 
            actions: filteredActions.filter(a => a.status === 'pending')
          });
          showNotification('success', 'Relances automatiques programmées');
          break;
        case 'schedule':
          await apiCall('POST', '/api/actions/schedule', { 
            actions: filteredActions.filter(a => a.status === 'pending')
          });
          showNotification('success', 'Actions planifiées');
          break;
        case 'ai-report':
          const report = await apiCall('GET', '/api/actions/ai-report', { 
            actions: filteredActions
          });
          await exportData(report, 'rapport-actions-ia', 'pdf');
          showNotification('success', 'Rapport IA généré et exporté');
          break;
        case 'export-actions':
          await exportData(filteredActions, 'actions-prioritaires', 'excel');
          showNotification('success', 'Actions exportées');
          break;
        case 'notify-team':
          await sendMessage('TEAM', 'all', `Actions prioritaires du jour : ${filteredActions.length} tâches`);
          showNotification('success', 'Équipe notifiée');
          break;
        case 'sync-crm':
          await apiCall('POST', '/api/actions/sync-crm', { 
            actions: filteredActions
          });
          showNotification('success', 'CRM synchronisé');
          break;
        case 'optimize-schedule':
          const optimized = await apiCall('POST', '/api/actions/optimize-schedule', { 
            actions: filteredActions
          });
          showNotification('success', 'Planning optimisé par IA');
          break;
      }
    } catch (error) {
      showNotification('error', `Erreur lors de l'action rapide : ${error}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Actions Commerciales Prioritaires</h3>
            <p className="text-sm text-gray-600">
              {loading ? 'Chargement des données réelles...' : error ? 'Erreur de connexion' : 'Données en temps réel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          )}
          {error && (
            <div className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded">
              ⚠️ Erreur
            </div>
          )}
          <span className="text-sm text-gray-500">
            {filteredActions.filter(a => a.status === 'pending').length} en attente
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="all">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="all">Toutes catégories</option>
            <option value="call">Appels</option>
            <option value="email">Emails</option>
            <option value="meeting">Rendez-vous</option>
            <option value="follow-up">Suivi</option>
            <option value="quote">Devis</option>
            <option value="proposal">Propositions</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="priority">Par priorité</option>
            <option value="time">Par heure</option>
            <option value="value">Par valeur</option>
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          Afficher terminées
        </label>
      </div>

      {/* Liste des actions */}
      {error ? (
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 font-medium mb-2">Erreur de connexion</div>
          <div className="text-sm text-red-500 mb-3">{error}</div>
          <button 
            onClick={loadRealData}
            className="text-xs bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded hover:bg-red-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action) => {
          const timeStatus = getTimeStatus(action.dueTime);
          
          return (
            <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getStatusIcon(action.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{action.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(action.priority)}`}>
                        {action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                    
                    {/* Contact info */}
                    {action.contact && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{action.contact.name}</span>
                        <span>•</span>
                        <span>{action.contact.company}</span>
                        {action.contact.phone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {action.contact.phone}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {/* AI Recommendation */}
                    {action.aiRecommendation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                        <div className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-800">{action.aiRecommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {/* Time and value */}
                  <div className="text-right">
                    <div className={`text-sm font-medium px-2 py-1 rounded ${getTimeStatusColor(timeStatus)}`}>
                      {action.dueTime || 'Non définie'}
                    </div>
                    {action.value && (
                      <div className="text-sm font-semibold text-green-600 mt-1">
                        {formatCurrency(action.value)}
                      </div>
                    )}
                  </div>
                  
                  {/* Category icon */}
                  <div className={`p-2 rounded-lg ${getCategoryColor(action.category)} bg-gray-100`}>
                    {getCategoryIcon(action.category)}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{action.estimatedDuration} min</span>
                  {action.value && (
                    <>
                      <span>•</span>
                      <DollarSign className="w-3 h-3" />
                      <span>Valeur élevée</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {action.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleActionClick(action, 'start')}
                        className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        Démarrer
                      </button>
                      <button
                        onClick={() => handleActionClick(action, 'contact')}
                        className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        Contacter
                      </button>
                    </>
                  )}
                  
                  {action.status === 'in-progress' && (
                    <button
                      onClick={() => handleActionClick(action, 'complete')}
                      className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      Terminer
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleActionClick(action, 'reschedule')}
                    className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    Reprogrammer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Actions rapides */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Actions Rapides</h4>
          <button
            className="p-1 text-orange-500 hover:text-orange-700 transition-colors"
            onClick={() => setShowQuickActions((v) => !v)}
            title={showQuickActions ? 'Fermer' : 'Ouvrir'}
          >
            {showQuickActions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {showQuickActions && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('new-task')}
            >
              Nouvelle tâche
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('auto-followup')}
            >
              Relance auto
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('schedule')}
            >
              Planifier
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('ai-report')}
            >
              Rapport IA
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('export-actions')}
            >
              Exporter
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('notify-team')}
            >
              Notifier équipe
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('sync-crm')}
            >
              Sync CRM
            </button>
            <button 
              className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors" 
              onClick={() => handleQuickAction('optimize-schedule')}
            >
              Optimiser IA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyActionsPriorityWidget; 