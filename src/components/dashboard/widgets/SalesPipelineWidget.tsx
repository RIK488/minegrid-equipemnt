import React, { useState, useEffect } from 'react';
import {
  Plus, ChevronUp, ChevronDown, Brain, AlertTriangle, FileText, Star, TrendingUp, Info, X
} from 'lucide-react';

// Composant spécialisé pour le Pipeline Commercial (version avancée)
// Correction : data doit être de type { leads: any[] }
const SalesPipelineWidget = ({ data }: { data: { leads: any[] } }) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'lastContact'>('value');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  // Correction : initialiser leadsData une seule fois
  const [leadsData, setLeadsData] = useState<any[]>(data.leads || []);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showConversionRates, setShowConversionRates] = useState(false);

  function getDaysSinceLastContact(dateString: string) {
    const lastContact = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

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

  const calculateConversionRates = React.useMemo(() => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const rates: Record<string, number> = {};
    const totalLeads = leadsData.length;
    const wonLeads = leadsData.filter(lead => lead.stage === 'Conclu').length;
    rates.global = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    stages.forEach((stage, index) => {
      if (index < stages.length - 1) {
        const currentStageLeads = leadsData.filter(lead => lead.stage === stage).length;
        const nextStageLeads = leadsData.filter(lead => lead.stage === stages[index + 1]).length;
        rates[stage] = currentStageLeads > 0 ? (nextStageLeads / currentStageLeads) * 100 : 0;
      }
    });
    return rates;
  }, [leadsData]);

  const generateAIInsights = React.useMemo(() => {
    const insights = [];
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
      'Prospection': 'bg-orange-100 text-orange-800',
      'Devis': 'bg-orange-200 text-orange-900',
      'Négociation': 'bg-orange-400 text-white',
      'Conclu': 'bg-green-500 text-white',
      'Perdu': 'bg-red-500 text-white'
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

  // Fonctions de gestion des événements
  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const getNextActionForStage = (stage: string) => {
    const actions = {
      'Prospection': 'Premier contact',
      'Devis': 'Envoi du devis',
      'Négociation': 'Négociation en cours',
      'Conclu': 'Vente finalisée',
      'Perdu': 'Vente perdue'
    };
    return actions[stage as keyof typeof actions] || 'Action à définir';
  };

  const handleNextStage = (lead: any) => {
    const stages = ['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'];
    const currentIndex = stages.indexOf(lead.stage);

    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];

      // Mettre à jour les données localement
      const updatedLeads = leadsData.map(l => {
        if (l.id === lead.id) {
          return {
            ...l,
            stage: nextStage,
            lastContact: new Date().toISOString().split('T')[0],
            probability: Math.min(l.probability + 20, 100),
            nextAction: getNextActionForStage(nextStage)
          };
        }
        return l;
      });

      setLeadsData(updatedLeads);

      // Mettre à jour le lead sélectionné si c'est le même
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead({
          ...selectedLead,
          stage: nextStage,
          lastContact: new Date().toISOString().split('T')[0],
          probability: Math.min(selectedLead.probability + 20, 100),
          nextAction: getNextActionForStage(nextStage)
        });
      }

      // Notification de succès
      const stageNames = {
        'Devis': 'Devis',
        'Négociation': 'Négociation',
        'Conclu': 'Vente conclue',
        'Perdu': 'Vente perdue'
      };
      alert(`✅ Lead passé à l'étape: ${stageNames[nextStage as keyof typeof stageNames] || nextStage}`);
    }
  };

  const handleEditLead = (lead: any) => {
    setEditForm({
      id: lead.id,
      title: lead.title,
      stage: lead.stage,
      value: lead.value,
      probability: lead.probability,
      nextAction: lead.nextAction,
      assignedTo: lead.assignedTo,
      notes: lead.notes || ''
    });
    setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    const updatedLeads = leadsData.map(l => {
      if (l.id === editForm.id) {
        return { ...l, ...editForm };
      }
      return l;
    });
    setLeadsData(updatedLeads);
    setShowEditForm(false);
    setEditForm({});
    alert('✅ Lead modifié avec succès');
  };

  const handleAddNote = () => {
    const note = prompt('Ajouter une note:');
    if (note && selectedLead) {
      const updatedLeads = leadsData.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            notes: l.notes ? `${l.notes}\n${new Date().toLocaleDateString()}: ${note}` : `${new Date().toLocaleDateString()}: ${note}`
          };
        }
        return l;
      });
      setLeadsData(updatedLeads);
      setSelectedLead({
        ...selectedLead,
        notes: selectedLead.notes ? `${selectedLead.notes}\n${new Date().toLocaleDateString()}: ${note}` : `${new Date().toLocaleDateString()}: ${note}`
      });
      alert('✅ Note ajoutée avec succès');
    }
  };

  const handleScheduleCall = () => {
    const date = prompt('Date du rendez-vous (YYYY-MM-DD):');
    const time = prompt('Heure du rendez-vous (HH:MM):');
    if (date && time && selectedLead) {
      // Ajouter le rendez-vous au lead
      const appointment = `Rendez-vous programmé: ${date} à ${time}`;
      const updatedLeads = leadsData.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            nextAction: appointment,
            lastContact: date
          };
        }
        return l;
      });

      setLeadsData(updatedLeads);

      // Mettre à jour le lead sélectionné
      setSelectedLead({
        ...selectedLead,
        nextAction: appointment,
        lastContact: date
      });

      alert('✅ Rendez-vous programmé avec succès');
    }
  };

  const handleAddNewLead = () => {
    const newLead = {
      id: `lead-${Date.now()}`,
      title: prompt('Nom du prospect:') || 'Nouveau prospect',
      stage: 'Prospection',
      priority: 'medium',
      value: parseInt(prompt('Valeur estimée (MAD):') || '0'),
      probability: 10,
      nextAction: 'Premier contact',
      assignedTo: prompt('Assigné à:') || 'Commercial',
      lastContact: new Date().toISOString().split('T')[0],
      notes: ''
    };

    if (newLead.title !== 'Nouveau prospect') {
      setLeadsData([...leadsData, newLead]);
      alert('✅ Nouveau lead ajouté avec succès');
    }
  };

  const handleAIInsightAction = (insight: any) => {
    switch (insight.type) {
      case 'blockage':
        alert(`🔄 Relance automatique programmée pour ${insight.leads.length} leads bloqués`);
        break;
      case 'quote':
        alert(`📧 Relances automatiques programmées pour ${insight.leads.length} devis`);
        break;
      case 'opportunity':
        alert(`⭐ Priorité élevée accordée à ${insight.leads.length} opportunités à forte valeur`);
        break;
      case 'conversion':
        alert(`📊 Analyse des taux de conversion lancée pour optimiser le processus`);
        break;
    }
  };

  const handleViewKanban = () => {
    setViewMode('kanban');
  };

  const handleViewTimeline = () => {
    setViewMode('timeline');
  };

  const handleViewList = () => {
    setViewMode('list');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'blockage': return <AlertTriangle className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'opportunity': return <Star className="w-4 h-4" />;
      case 'conversion': return <TrendingUp className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'blockage': return 'text-red-600 bg-red-50 border-red-200';
      case 'quote': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'opportunity': return 'text-green-600 bg-green-50 border-green-200';
      case 'conversion': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-orange-900">Pipeline Commercial</h3>
        <div className="flex items-center gap-2">
          {/* Boutons de vue */}
          <div className="flex bg-orange-100 rounded-lg p-1">
            <button
              onClick={handleViewList}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-orange-700 hover:bg-orange-200'
              }`}
            >
              Liste
            </button>
            <button
              onClick={handleViewKanban}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-orange-700 hover:bg-orange-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={handleViewTimeline}
              className={`px-5 py-2 rounded-t-lg text-sm font-semibold transition-all duration-200
                ${viewMode === 'timeline'
                  ? 'bg-orange-600 text-white shadow-md border-b-4 border-orange-700'
                  : 'text-orange-700 bg-orange-100 hover:bg-orange-200 border-b-4 border-transparent'}
              `}
            >
              Timeline
            </button>
          </div>
          
          <button
            onClick={handleAddNewLead}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Lead
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{pipelineStats.total}</div>
          <div className="text-xs text-orange-600">Total Leads</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{formatCurrency(pipelineStats.totalValue)}</div>
          <div className="text-xs text-orange-600">Valeur Totale</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{formatCurrency(pipelineStats.weightedValue)}</div>
          <div className="text-xs text-orange-600">Valeur Pondérée</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{Math.round(calculateConversionRates.global)}%</div>
          <div className="text-xs text-orange-600">Taux Conversion</div>
        </div>
      </div>

      {/* Insights IA */}
      {generateAIInsights.length > 0 && (
        <div className="bg-white rounded-lg border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Insights IA
            </h4>
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="text-orange-600 hover:text-orange-700"
            >
              {showAIInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {showAIInsights && (
            <div className="space-y-2">
              {generateAIInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h5 className="font-medium text-sm">{insight.title}</h5>
                        <p className="text-xs opacity-80">{insight.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAIInsightAction(insight)}
                      className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
                    >
                      {insight.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtres et tri */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-orange-200 p-3">
        <div className="flex items-center gap-4">
          <select
            value={selectedStage || ''}
            onChange={(e) => setSelectedStage(e.target.value || null)}
            className="text-sm border border-orange-200 rounded px-2 py-1"
          >
            <option value="">Toutes les étapes</option>
            <option value="Prospection">Prospection</option>
            <option value="Devis">Devis</option>
            <option value="Négociation">Négociation</option>
            <option value="Conclu">Conclu</option>
            <option value="Perdu">Perdu</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-orange-200 rounded px-2 py-1"
          >
            <option value="value">Trier par valeur</option>
            <option value="probability">Trier par probabilité</option>
            <option value="lastContact">Trier par dernier contact</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConversionRates(!showConversionRates)}
            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
          >
            Taux de conversion
          </button>
        </div>
      </div>

      {/* Taux de conversion par étape */}
      {showConversionRates && (
        <div className="bg-white rounded-lg border border-orange-200 p-4">
          <h4 className="text-sm font-semibold text-orange-900 mb-3">Taux de conversion par étape</h4>
          <div className="grid grid-cols-5 gap-3">
            {['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'].map((stage) => (
              <div key={stage} className="text-center">
                <div className="text-lg font-bold text-orange-700">
                  {Math.round(calculateConversionRates[stage] || 0)}%
                </div>
                <div className="text-xs text-orange-600">{stage}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenu selon le mode de vue */}
      {viewMode === 'list' && (
        <>
          {/* Liste des leads */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedLeads.map((lead) => (
              <div key={lead.id} className="bg-white border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{lead.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(lead.stage)}`}>
                        {lead.stage}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>
                        {lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-700">{formatCurrency(lead.value)}</div>
                    <div className="text-sm text-orange-600">{lead.probability}% de probabilité</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-orange-700">Prochaine action:</span>
                    <div className="font-medium text-gray-900">{lead.nextAction}</div>
                  </div>
                  <div>
                    <span className="text-orange-700">Assigné à:</span>
                    <div className="font-medium text-gray-900">{lead.assignedTo}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-100">
                  <div className="text-xs text-orange-600">
                    Dernier contact: {formatDate(lead.lastContact)}
                    <span className="ml-2 text-orange-600">
                      ({getDaysSinceLastContact(lead.lastContact)} jours)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(lead)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Voir détails
                    </button>
                    <button
                      onClick={() => handleNextStage(lead)}
                      disabled={lead.stage === 'Conclu' || lead.stage === 'Perdu'}
                      className={`text-xs px-2 py-1 rounded ${
                        lead.stage === 'Conclu' || lead.stage === 'Perdu'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'Lead finalisé' : 'Passer à l\'étape suivante'}
                    >
                      {lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'Finalisé' : 'Suivant'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedLeads.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Aucun lead trouvé pour cette étape
            </div>
          )}
        </>
      )}

      {/* Vue Kanban */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-5 gap-4 max-h-96 overflow-y-auto">
          {['Prospection', 'Devis', 'Négociation', 'Conclu', 'Perdu'].map((stage) => {
            const stageLeads = leadsData.filter(lead => lead.stage === stage);
            return (
              <div key={stage} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold px-2 py-1 rounded-full ${getStageColor(stage)}`}>
                    {stage}
                  </h4>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <div key={lead.id} className="bg-white rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(lead)}>
                      <h5 className="font-semibold text-sm text-gray-900 mb-1">{lead.title}</h5>
                      <div className="text-lg font-bold text-orange-700 mb-1">{formatCurrency(lead.value)}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>
                          {lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                        <span className="text-orange-600">{lead.probability}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {getDaysSinceLastContact(lead.lastContact)} jours
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vue Timeline */}
      {viewMode === 'timeline' && (
        <div className="relative max-h-96 overflow-y-auto">
          {/* Ligne verticale de la timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-orange-200 rounded-full" style={{ zIndex: 0 }}></div>
          <div className="space-y-8 pl-16 pr-2">
            {sortedLeads.map((lead, index) => (
              <div key={lead.id} className="relative flex items-start group">
                {/* Dot sur la timeline */}
                <div className="absolute -left-8 top-2 w-5 h-5 flex items-center justify-center z-10">
                  <div className={`w-4 h-4 rounded-full border-2 ${getStageColor(lead.stage)} border-white shadow`}></div>
                </div>
                {/* Contenu du lead */}
                <div className="flex-1 bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-semibold text-gray-900 text-base">{lead.title}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(lead.stage)}`}>{lead.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-orange-700">{formatCurrency(lead.value)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>{lead.priority === 'high' ? 'Haute' : lead.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>
                    <span className="text-xs text-orange-600">{lead.probability}%</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-orange-700">Prochaine action :</span> {lead.nextAction}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-orange-700">Assigné à :</span> {lead.assignedTo}
                  </div>
                  <div className="text-xs text-orange-600 mb-2">
                    Dernier contact : {formatDate(lead.lastContact)} ({getDaysSinceLastContact(lead.lastContact)} jours)
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleViewDetails(lead)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => handleNextStage(lead)}
                      disabled={lead.stage === 'Conclu' || lead.stage === 'Perdu'}
                      className={`text-xs px-2 py-1 rounded ${
                        lead.stage === 'Conclu' || lead.stage === 'Perdu'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'Lead finalisé' : 'Passer à l\'étape suivante'}
                    >
                      {lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'Finalisé' : 'Suivant'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sortedLeads.length === 0 && (
              <div className="text-center text-gray-500 py-8">Aucun lead trouvé pour cette étape</div>
            )}
          </div>
        </div>
      )}

      {/* Modal de détails du lead */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedLead.title}</h3>
              <button
                onClick={() => setShowLeadDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Informations générales</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-orange-700">Étape:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStageColor(selectedLead.stage)}`}>
                      {selectedLead.stage}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-700">Valeur:</span>
                    <span className="ml-2 font-semibold">{formatCurrency(selectedLead.value)}</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Probabilité:</span>
                    <span className="ml-2">{selectedLead.probability}%</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Priorité:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedLead.priority)}`}>
                      {selectedLead.priority === 'high' ? 'Haute' : selectedLead.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Suivi</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-orange-700">Prochaine action:</span>
                    <div className="font-medium">{selectedLead.nextAction}</div>
                  </div>
                  <div>
                    <span className="text-orange-700">Assigné à:</span>
                    <div className="font-medium">{selectedLead.assignedTo}</div>
                  </div>
                  <div>
                    <span className="text-orange-700">Dernier contact:</span>
                    <div className="font-medium">{formatDate(selectedLead.lastContact)} ({getDaysSinceLastContact(selectedLead.lastContact)} jours)</div>
                  </div>
                </div>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Notes</h5>
                <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                  {selectedLead.notes}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Actions</h5>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleEditLead(selectedLead)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Ajouter une note
                </button>
                <button
                  onClick={handleScheduleCall}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Programmer un appel
                </button>
                <button
                  onClick={() => handleNextStage(selectedLead)}
                  disabled={selectedLead.stage === 'Conclu' || selectedLead.stage === 'Perdu'}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    selectedLead.stage === 'Conclu' || selectedLead.stage === 'Perdu'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {selectedLead.stage === 'Conclu' || selectedLead.stage === 'Perdu' ? 'Déjà finalisé' : 'Passer à l\'étape suivante'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le lead</h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du prospect</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étape</label>
                <select
                  value={editForm.stage}
                  onChange={(e) => setEditForm({...editForm, stage: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Prospection">Prospection</option>
                  <option value="Devis">Devis</option>
                  <option value="Négociation">Négociation</option>
                  <option value="Conclu">Conclu</option>
                  <option value="Perdu">Perdu</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur (MAD)</label>
                <input
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm({...editForm, value: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probabilité (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.probability}
                  onChange={(e) => setEditForm({...editForm, probability: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
                <input
                  type="text"
                  value={editForm.nextAction}
                  onChange={(e) => setEditForm({...editForm, nextAction: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                <input
                  type="text"
                  value={editForm.assignedTo}
                  onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipelineWidget; 