import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  SortAsc, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Calendar,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Zap
} from 'lucide-react';

interface Lead {
  id: string;
  title: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  value: number;
  probability: number;
  nextAction: string;
  lastContact: string;
  assignedTo: string;
  stage: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface Props {
  data?: Lead[];
}

const SalesPipelineWidget: React.FC<Props> = ({ data = [] }) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'lastContact'>('value');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [leadsData, setLeadsData] = useState<Lead[]>(data);
  
  // États pour les fonctionnalités enrichies
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showConversionRates, setShowConversionRates] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [conversionRates, setConversionRates] = useState<any>({});

  // Mettre à jour les données quand les props changent
  useEffect(() => {
    setLeadsData(data);
  }, [data]);

  // Fonction utilitaire pour calculer les jours depuis le dernier contact
  function getDaysSinceLastContact(dateString: string) {
    const lastContact = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calculer les statistiques du pipeline
  const pipelineStats = React.useMemo(() => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const stats = {
      total: leadsData.length,
      totalValue: leadsData.reduce((sum, lead) => sum + (lead.value || 0), 0),
      weightedValue: leadsData.reduce((sum, lead) => sum + ((lead.value || 0) * (lead.probability || 0) / 100), 0),
      byStage: {} as Record<string, { count: number; value: number; weightedValue: number }>
    };

    stages.forEach(stage => {
      const stageLeads = leadsData.filter(lead => lead.stage === stage);
      stats.byStage[stage] = {
        count: stageLeads.length,
        value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
        weightedValue: stageLeads.reduce((sum, lead) => sum + ((lead.value || 0) * (lead.probability || 0) / 100), 0)
      };
    });

    return stats;
  }, [leadsData]);

  // Calculer les taux de conversion
  const calculateConversionRates = React.useMemo(() => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const rates: Record<string, number> = {};
    
    // Taux de conversion global
    const totalLeads = leadsData.length;
    const wonLeads = leadsData.filter(lead => lead.stage === 'Conclu').length;
    rates.global = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    
    // Taux par étape
    stages.forEach((stage, index) => {
      if (index < stages.length - 1) {
        const currentStageLeads = leadsData.filter(lead => lead.stage === stage).length;
        const nextStageLeads = leadsData.filter(lead => lead.stage === stages[index + 1]).length;
        rates[stage] = currentStageLeads > 0 ? (nextStageLeads / currentStageLeads) * 100 : 0;
      }
    });
    
    return rates;
  }, [leadsData]);

  // Générer les insights IA
  const generateAIInsights = React.useMemo(() => {
    const insights = [];
    
    // Analyser les blocages
    const stuckLeads = leadsData.filter(lead => {
      const daysSinceContact = getDaysSinceLastContact(lead.lastContact);
      return daysSinceContact > 7 && lead.stage !== 'Conclu' && lead.stage !== 'Perdu';
    });
    
    if (stuckLeads.length > 0) {
      insights.push({
        type: 'blockage',
        title: 'Leads bloqués détectés',
        description: `${stuckLeads.length} leads sans contact depuis plus de 7 jours`,
        priority: 'high',
        action: 'Relancer les prospects bloqués',
        leads: stuckLeads
      });
    }
    
    // Analyser les devis sans relance
    const quotesWithoutFollowUp = leadsData.filter(lead => 
      lead.stage === 'Devis' && getDaysSinceLastContact(lead.lastContact) > 3
    );
    
    if (quotesWithoutFollowUp.length > 0) {
      insights.push({
        type: 'quote',
        title: 'Devis sans relance',
        description: `${quotesWithoutFollowUp.length} devis envoyés sans suivi`,
        priority: 'medium',
        action: 'Programmer des relances automatiques',
        leads: quotesWithoutFollowUp
      });
    }
    
    // Analyser les opportunités à forte valeur
    const highValueLeads = leadsData.filter(lead => 
      lead.value > 500000 && lead.stage !== 'Conclu' && lead.stage !== 'Perdu'
    );
    
    if (highValueLeads.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Opportunités à forte valeur',
        description: `${highValueLeads.length} leads de plus de 500k MAD`,
        priority: 'high',
        action: 'Prioriser le suivi de ces prospects',
        leads: highValueLeads
      });
    }
    
    // Analyser les taux de conversion faibles
    const lowConversionStages = Object.entries(calculateConversionRates).filter(([stage, rate]) => 
      stage !== 'global' && (rate as number) < 20
    );
    
    if (lowConversionStages.length > 0) {
      insights.push({
        type: 'conversion',
        title: 'Taux de conversion faibles',
        description: `Étapes avec conversion < 20%: ${lowConversionStages.map(([stage]) => stage).join(', ')}`,
        priority: 'medium',
        action: 'Analyser et optimiser le processus de vente',
        stages: lowConversionStages
      });
    }
    
    return insights;
  }, [leadsData, calculateConversionRates]);

  // Trier les leads
  const sortedLeads = React.useMemo(() => {
    let sorted = [...leadsData];
    if (selectedStage) {
      sorted = sorted.filter(lead => lead.stage === selectedStage);
    }

    switch (sortBy) {
      case 'value':
        return sorted.sort((a, b) => (b.value || 0) - (a.value || 0));
      case 'probability':
        return sorted.sort((a, b) => (b.probability || 0) - (a.probability || 0));
      case 'lastContact':
        return sorted.sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
      default:
        return sorted;
    }
  }, [leadsData, selectedStage, sortBy]);

  const getStageColor = (stage: string) => {
    const colors = {
      'Prospection': 'bg-blue-100 text-blue-800',
      'Devis': 'bg-yellow-100 text-yellow-800',
      'Négociation': 'bg-purple-100 text-purple-800',
      'Conclu': 'bg-green-100 text-green-800',
      'Perdu': 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-orange-100 text-orange-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInsightColor = (type: string) => {
    const colors = {
      'blockage': 'border-red-200 bg-red-50',
      'quote': 'border-yellow-200 bg-yellow-50',
      'opportunity': 'border-green-200 bg-green-50',
      'conversion': 'border-purple-200 bg-purple-50'
    };
    return colors[type as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'blockage': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'quote': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'opportunity': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'conversion': return <Target className="w-4 h-4 text-purple-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleAIInsightAction = (insight: any) => {
    console.log('Action IA:', insight.action, insight);
    // Ici on pourrait implémenter les actions automatiques
  };

  const handleLeadAction = (lead: Lead, action: string) => {
    console.log('Action lead:', action, lead);
    // Ici on pourrait implémenter les actions sur les leads
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Commercial</h3>
            <p className="text-sm text-gray-600">Gestion des prospects et opportunités avec IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            <Brain className="w-4 h-4" />
            Insights IA
          </button>
          <button
            onClick={() => setShowConversionRates(!showConversionRates)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            Taux
          </button>
        </div>
      </div>

      {/* Statistiques Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Leads</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{pipelineStats.total}</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Valeur Totale</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(pipelineStats.totalValue)}</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Valeur Pondérée</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{formatCurrency(pipelineStats.weightedValue)}</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Taux Conversion</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{calculateConversionRates.global.toFixed(1)}%</div>
        </div>
      </div>

      {/* Pipeline par Étapes */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Pipeline par Étapes</h4>
        <div className="grid grid-cols-5 gap-2">
          {['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'].map((stage) => (
            <div key={stage} className="text-center">
              <div className={`p-3 rounded-lg ${getStageColor(stage)} mb-2`}>
                <div className="text-lg font-bold">{pipelineStats.byStage[stage]?.count || 0}</div>
                <div className="text-xs">{stage}</div>
              </div>
              <div className="text-xs text-gray-600">
                {formatCurrency(pipelineStats.byStage[stage]?.value || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights IA */}
      {generateAIInsights.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Insights IA
            </h4>
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1"
            >
              {showAIInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAIInsights ? 'Masquer' : 'Voir détails'}
            </button>
          </div>
          
          {showAIInsights && (
            <div className="space-y-3">
              {generateAIInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{insight.title}</h5>
                        <p className="text-xs mt-1">{insight.description}</p>
                        <p className="text-xs mt-2 font-medium">Action suggérée: {insight.action}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAIInsightAction(insight)}
                      className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Agir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtres et Tri */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedStage || ''}
            onChange={(e) => setSelectedStage(e.target.value || null)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">Toutes les étapes</option>
            {['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'].map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="value">Par valeur</option>
            <option value="probability">Par probabilité</option>
            <option value="lastContact">Par dernier contact</option>
          </select>
        </div>
      </div>

      {/* Liste des Leads */}
      <div className="space-y-3">
        {sortedLeads.map((lead) => (
          <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div>
                  <h5 className="font-semibold text-gray-900">{lead.title}</h5>
                  <p className="text-sm text-gray-600">{lead.company || 'Entreprise non spécifiée'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(lead.stage)}`}>
                  {lead.stage}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(lead.priority)}`}>
                  {lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div>
                <span className="text-xs text-gray-500">Valeur</span>
                <div className="font-semibold text-gray-900">{formatCurrency(lead.value)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Probabilité</span>
                <div className="font-semibold text-gray-900">{lead.probability}%</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Prochaine action</span>
                <div className="text-sm text-gray-700">{lead.nextAction}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Dernier contact</span>
                <div className="text-sm text-gray-700">{formatDate(lead.lastContact)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Responsable: {lead.assignedTo}</span>
                <span>•</span>
                <span>{getDaysSinceLastContact(lead.lastContact)} jours</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLeadAction(lead, 'view')}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Voir détails"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleLeadAction(lead, 'edit')}
                  className="p-1 text-gray-500 hover:text-green-600"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleLeadAction(lead, 'call')}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Appeler"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleLeadAction(lead, 'email')}
                  className="p-1 text-gray-500 hover:text-purple-600"
                  title="Envoyer email"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Rapides */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Actions Rapides</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors">
            Nouveau prospect
          </button>
          <button className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors">
            Relancer automatique
          </button>
          <button className="text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors">
            Exporter données
          </button>
          <button className="text-xs bg-orange-100 text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors">
            Rapport IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesPipelineWidget; 