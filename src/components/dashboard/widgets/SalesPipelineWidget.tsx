import React, { useState, useEffect } from 'react';
import {
  Plus, ChevronUp, ChevronDown, Brain, AlertTriangle, FileText, Star, TrendingUp, Info, X,
  Phone, Mail, Calendar, Download, Send, Target, Users, TrendingDown, ChevronRight
} from 'lucide-react';
import { apiService, notificationService, exportService, communicationService } from '../../../services';

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
  const [showQuickActions, setShowQuickActions] = useState(true);

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
        handleRelanceAutomatique();
        break;
      case 'quote':
        handleSendFollowup();
        break;
      case 'opportunity':
        handleScheduleMeeting();
        break;
      case 'conversion':
        handleAnalysePerformance();
        break;
    }
  };

  // Actions rapides connectées aux services communs
  const handleQuickAction = async (action: string, data?: any) => {
    try {
      switch (action) {
        case 'add-lead':
          await handleAddLead();
          break;
        case 'export-pipeline':
          await handleExportPipeline();
          break;
        case 'send-followup':
          await handleSendFollowup();
          break;
        case 'schedule-meeting':
          await handleScheduleMeeting();
          break;
        case 'generate-report':
          await handleGenerateReport();
          break;
        case 'relance-automatique':
          await handleRelanceAutomatique();
          break;
        case 'analyse-performance':
          await handleAnalysePerformance();
          break;
        case 'optimisation-ia':
          await handleOptimisationIA();
          break;
        default:
          notificationService.warning('Action non reconnue', `L'action "${action}" n'est pas encore implémentée`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'action rapide:', error);
      notificationService.error('Erreur', 'Une erreur est survenue lors de l\'exécution de l\'action');
    }
  };

  const handleAddLead = async () => {
    try {
      notificationService.info('Ajout de lead', 'Ouverture du formulaire d\'ajout...');
      
      // Simulation d'ajout de lead
      const newLead = {
        id: Date.now().toString(),
        title: 'Nouveau prospect',
        stage: 'Prospection',
        value: 0,
        probability: 10,
        priority: 'medium',
        nextAction: 'Premier contact',
        assignedTo: 'Vendeur',
        lastContact: new Date().toISOString(),
        notes: ''
      };
      
      setLeadsData([...leadsData, newLead]);
      
      // Envoi d'email de notification
      await communicationService.sendEmail({
        to: 'vendeur@minegrid.com',
        subject: 'Nouveau lead ajouté',
        body: `Un nouveau lead "${newLead.title}" a été ajouté au pipeline.`
      });
      
      notificationService.success('Lead ajouté', 'Le nouveau lead a été ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lead:', error);
      notificationService.error('Erreur', 'Impossible d\'ajouter le lead');
    }
  };

  const handleExportPipeline = async () => {
    try {
      notificationService.info('Export en cours', 'Préparation de l\'export du pipeline...');
      
      const exportData = {
        filename: `pipeline-commercial-${new Date().toISOString().split('T')[0]}.xlsx`,
        data: leadsData.map(lead => ({
          'Nom du prospect': lead.title,
          'Étape': lead.stage,
          'Valeur (MAD)': lead.value,
          'Probabilité (%)': lead.probability,
          'Priorité': lead.priority,
          'Prochaine action': lead.nextAction,
          'Assigné à': lead.assignedTo,
          'Dernier contact': formatDate(lead.lastContact),
          'Notes': lead.notes || ''
        })),
        sheets: [
          {
            name: 'Pipeline',
            data: leadsData.map(lead => ({
              'Nom du prospect': lead.title,
              'Étape': lead.stage,
              'Valeur (MAD)': lead.value,
              'Probabilité (%)': lead.probability,
              'Priorité': lead.priority,
              'Prochaine action': lead.nextAction,
              'Assigné à': lead.assignedTo,
              'Dernier contact': formatDate(lead.lastContact),
              'Notes': lead.notes || ''
            }))
          },
          {
            name: 'Statistiques',
            data: [
              {
                'Métrique': 'Total Leads',
                'Valeur': pipelineStats.total
              },
              {
                'Métrique': 'Valeur Totale',
                'Valeur': formatCurrency(pipelineStats.totalValue)
              },
              {
                'Métrique': 'Valeur Pondérée',
                'Valeur': formatCurrency(pipelineStats.weightedValue)
              },
              {
                'Métrique': 'Taux de Conversion Global',
                'Valeur': `${Math.round(calculateConversionRates.global)}%`
              }
            ]
          }
        ]
      };
      
      await exportService.exportPipeline(leadsData, { format: 'excel', filename: exportData.filename });
      notificationService.success('Export réussi', 'Le pipeline a été exporté en Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      notificationService.error('Erreur d\'export', 'Impossible d\'exporter le pipeline');
    }
  };

  const handleSendFollowup = async () => {
    try {
      notificationService.info('Envoi en cours', 'Préparation des relances...');
      
      const leadsToFollowUp = leadsData.filter(lead => 
        getDaysSinceLastContact(lead.lastContact) > 3 && 
        lead.stage !== 'Conclu' && 
        lead.stage !== 'Perdu'
      );
      
      if (leadsToFollowUp.length === 0) {
        notificationService.info('Aucune relance', 'Tous les leads sont à jour');
        return;
      }
      
      // Envoi d'emails de relance
      for (const lead of leadsToFollowUp.slice(0, 5)) { // Limiter à 5 relances
        await communicationService.sendEmail({
          to: 'prospect@example.com', // Remplacer par le vrai email
          subject: `Relance - ${lead.title}`,
          body: `Bonjour,\n\nNous vous recontactons concernant votre projet ${lead.title}.\n\nCordialement,\nL'équipe Minegrid`
        });
      }
      
      notificationService.success('Relances envoyées', `${leadsToFollowUp.length} relances ont été envoyées`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des relances:', error);
      notificationService.error('Erreur', 'Impossible d\'envoyer les relances');
    }
  };

  const handleScheduleMeeting = async () => {
    try {
      notificationService.info('Planification', 'Ouverture du calendrier...');
      
      const highValueLeads = leadsData.filter(lead => 
        lead.value > 100000 && 
        lead.stage !== 'Conclu' && 
        lead.stage !== 'Perdu'
      );
      
      if (highValueLeads.length === 0) {
        notificationService.info('Aucun prospect', 'Aucun prospect à forte valeur à contacter');
        return;
      }
      
      // Simulation de planification de réunion
      const meetingData = {
        title: `Réunion - ${highValueLeads[0].title}`,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        duration: 60,
        attendees: ['vendeur@minegrid.com', 'prospect@example.com']
      };
      
      await communicationService.sendEmail({
        to: 'prospect@example.com',
        subject: 'Planification de réunion',
        body: `Bonjour,\n\nNous vous proposons une réunion le ${meetingData.date.toLocaleDateString('fr-FR')} à 14h00.\n\nCordialement,\nL'équipe Minegrid`
      });
      
      notificationService.success('Réunion planifiée', 'La réunion a été planifiée et confirmée');
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      notificationService.error('Erreur', 'Impossible de planifier la réunion');
    }
  };

  const handleGenerateReport = async () => {
    try {
      notificationService.info('Génération', 'Création du rapport de performance...');
      
      const reportData = {
        filename: `rapport-pipeline-${new Date().toISOString().split('T')[0]}.pdf`,
        title: 'Rapport Pipeline Commercial',
        data: {
          stats: pipelineStats,
          conversionRates: calculateConversionRates,
          insights: generateAIInsights,
          topLeads: sortedLeads.slice(0, 5)
        }
      };
      
      await exportService.exportPipeline(leadsData, { format: 'pdf', filename: reportData.filename });
      notificationService.success('Rapport généré', 'Le rapport de performance a été créé');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      notificationService.error('Erreur', 'Impossible de générer le rapport');
    }
  };

  const handleRelanceAutomatique = async () => {
    try {
      notificationService.info('Configuration', 'Mise en place des relances automatiques...');
      
      const stuckLeads = leadsData.filter(lead => 
        getDaysSinceLastContact(lead.lastContact) > 7 && 
        lead.stage !== 'Conclu' && 
        lead.stage !== 'Perdu'
      );
      
      if (stuckLeads.length === 0) {
        notificationService.info('Aucune action', 'Aucun lead bloqué détecté');
        return;
      }
      
      // Configuration des relances automatiques
      for (const lead of stuckLeads) {
        await communicationService.sendEmail({
          to: 'vendeur@minegrid.com',
          subject: `Relance automatique - ${lead.title}`,
          body: `Le lead "${lead.title}" n'a pas été contacté depuis ${getDaysSinceLastContact(lead.lastContact)} jours.`
        });
      }
      
      notificationService.success('Relances configurées', `${stuckLeads.length} relances automatiques ont été configurées`);
    } catch (error) {
      console.error('Erreur lors de la configuration des relances:', error);
      notificationService.error('Erreur', 'Impossible de configurer les relances automatiques');
    }
  };

  const handleAnalysePerformance = async () => {
    try {
      notificationService.info('Analyse', 'Analyse des performances en cours...');
      
      const analysis = {
        totalLeads: pipelineStats.total,
        conversionRate: calculateConversionRates.global,
        averageValue: pipelineStats.totalValue / pipelineStats.total,
        stageBreakdown: Object.entries(pipelineStats.byStage).map(([stage, data]) => ({
          stage,
          count: data.count,
          value: data.value,
          conversionRate: calculateConversionRates[stage] || 0
        }))
      };
      
      // Envoi du rapport d'analyse
      await communicationService.sendEmail({
        to: 'manager@minegrid.com',
        subject: 'Analyse de performance - Pipeline Commercial',
        body: `Rapport d'analyse:\n\n- Total leads: ${analysis.totalLeads}\n- Taux de conversion: ${analysis.conversionRate}%\n- Valeur moyenne: ${formatCurrency(analysis.averageValue)}\n\nAnalyse complète en pièce jointe.`
      });
      
      notificationService.success('Analyse terminée', 'Le rapport d\'analyse a été envoyé');
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      notificationService.error('Erreur', 'Impossible de générer l\'analyse de performance');
    }
  };

  const handleOptimisationIA = async () => {
    try {
      notificationService.info('Optimisation IA', 'Analyse et optimisation en cours...');
      
      const optimizations = generateAIInsights.map(insight => ({
        type: insight.type,
        title: insight.title,
        recommendation: insight.action,
        impact: insight.priority
      }));
      
      // Simulation d'optimisation IA
      const optimizedLeads = leadsData.map(lead => {
        if (lead.probability < 30 && lead.value > 50000) {
          return {
            ...lead,
            probability: Math.min(lead.probability + 10, 100),
            nextAction: 'Relance prioritaire'
          };
        }
        return lead;
      });
      
      setLeadsData(optimizedLeads);
      
      notificationService.success('Optimisation terminée', `${optimizations.length} recommandations d'optimisation appliquées`);
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      notificationService.error('Erreur', 'Impossible d\'appliquer l\'optimisation IA');
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
                  : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'
              }`}
            >
              Liste
            </button>
            <button
              onClick={handleViewKanban}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'
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
          <div className="text-base font-medium text-orange-700">{pipelineStats.total}</div>
          <div className="text-xs text-orange-600">Total Leads</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-base font-medium text-orange-700">{formatCurrency(pipelineStats.totalValue)}</div>
          <div className="text-xs text-orange-600">Valeur Totale</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-base font-medium text-orange-700">{formatCurrency(pipelineStats.weightedValue)}</div>
          <div className="text-xs text-orange-600">Valeur Pondérée</div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div className="text-base font-medium text-orange-700">{Math.round(calculateConversionRates.global)}%</div>
          <div className="text-xs text-orange-600">Taux Conversion</div>
        </div>
      </div>

      {/* Actions rapides connectées aux services communs */}
      <div className="bg-white rounded-lg border border-orange-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Actions Rapides
          </h4>
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
              onClick={() => handleQuickAction('add-lead')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Plus className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Ajouter Lead</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('export-pipeline')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Download className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Exporter</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('send-followup')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Send className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Relances</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('schedule-meeting')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Calendar className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Réunions</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('generate-report')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <FileText className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Rapport</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('relance-automatique')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Mail className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Auto-Relance</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('analyse-performance')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <TrendingUp className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Analyse</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('optimisation-ia')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Brain className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Optimisation IA</span>
            </button>
          </div>
        )}
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
              {showAIInsights ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                      className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
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
                      className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                    >
                      Voir détails
                    </button>
                    <button
                      onClick={() => handleNextStage(lead)}
                      disabled={lead.stage === 'Conclu' || lead.stage === 'Perdu'}
                      className={`text-xs px-2 py-1 rounded ${lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'}`}
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
                      <div className="text-[10px] font-normal text-orange-700 mb-1">{formatCurrency(lead.value)}</div>
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
                      className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => handleNextStage(lead)}
                      disabled={lead.stage === 'Conclu' || lead.stage === 'Perdu'}
                      className={`text-xs px-2 py-1 rounded ${lead.stage === 'Conclu' || lead.stage === 'Perdu' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'}`}
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
                  className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded-lg hover:bg-orange-200 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded-lg hover:bg-orange-200 text-sm"
                >
                  Ajouter une note
                </button>
                <button
                  onClick={handleScheduleCall}
                  className="px-4 py-2 bg-orange-100 text-orange-800 border border-orange-300 rounded-lg hover:bg-orange-200 text-sm"
                >
                  Programmer un appel
                </button>
                <button
                  onClick={() => handleNextStage(selectedLead)}
                  disabled={selectedLead.stage === 'Conclu' || selectedLead.stage === 'Perdu'}
                  className={`px-4 py-2 rounded-lg text-sm ${selectedLead.stage === 'Conclu' || selectedLead.stage === 'Perdu' ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'}`}
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