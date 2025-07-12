const SalesPipelineWidget = ({ data }: { data: any[] }) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'lastContact'>('value');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [leadsData, setLeadsData] = useState<any[]>(data);

  // Mettre à jour les données quand les props changent
  React.useEffect(() => {
    setLeadsData(data);
  }, [data]);

  // Calculer les statistiques du pipeline
  const pipelineStats = React.useMemo(() => {
    const stages = ['Prospection', 'Qualification', 'Proposition', 'Négociation', 'Clôturé'];
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
      'Prospection': 'bg-orange-100 text-orange-800',
      'Qualification': 'bg-orange-200 text-orange-900',
      'Proposition': 'bg-orange-300 text-orange-900',
      'Négociation': 'bg-orange-400 text-white',
      'Clôturé': 'bg-orange-500 text-white'
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

  const getDaysSinceLastContact = (dateString: string) => {
    const lastContact = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleNextStage = (lead: any) => {
    const stages = ['Prospection', 'Qualification', 'Proposition', 'Négociation', 'Clôturé'];
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
      
      alert(`✅ Lead "${lead.title}" passé avec succès à l'étape: ${nextStage}`);
      console.log(`[API] Mise à jour du lead ${lead.id}: ${lead.stage} → ${nextStage}`);
      
    } else {
      alert('⚠️ Ce lead est déjà à la dernière étape (Clôturé) !');
    }
  };

  const getNextActionForStage = (stage: string) => {
    const actions = {
      'Qualification': 'Planifier un appel de qualification',
      'Proposition': 'Préparer la proposition commerciale',
      'Négociation': 'Programmer une réunion de négociation',
      'Clôturé': 'Finaliser la documentation'
    };
    return actions[stage as keyof typeof actions] || 'Définir la prochaine action';
  };

  const handleEditLead = (lead: any) => {
    setEditForm({
      id: lead.id,
      title: lead.title,
      stage: lead.stage,
      priority: lead.priority,
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
        return {
          ...l,
          ...editForm,
          lastContact: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });
    
    setLeadsData(updatedLeads);
    
    if (selectedLead && selectedLead.id === editForm.id) {
      setSelectedLead({
        ...selectedLead,
        ...editForm,
        lastContact: new Date().toISOString().split('T')[0]
      });
    }
    
    alert('✅ Modifications sauvegardées avec succès');
    setShowEditForm(false);
    setEditForm({});
    console.log('[API] Sauvegarde des modifications:', editForm);
  };

  const handleAddNote = () => {
    const note = prompt('Ajouter une note:');
    if (note && selectedLead) {
      const updatedLeads = leadsData.map(l => {
        if (l.id === selectedLead.id) {
          return {
            ...l,
            notes: l.notes ? `${l.notes}\n${new Date().toLocaleString('fr-FR')}: ${note}` : `${new Date().toLocaleString('fr-FR')}: ${note}`
          };
        }
        return l;
      });
      
      setLeadsData(updatedLeads);
      setSelectedLead({
        ...selectedLead,
        notes: selectedLead.notes ? `${selectedLead.notes}\n${new Date().toLocaleString('fr-FR')}: ${note}` : `${new Date().toLocaleString('fr-FR')}: ${note}`
      });
      
      alert('✅ Note ajoutée avec succès');
      console.log(`[API] Note ajoutée au lead ${selectedLead.id}:`, note);
    }
  };

  const handleScheduleCall = () => {
    const date = prompt('Date du rendez-vous (YYYY-MM-DD):');
    const time = prompt('Heure du rendez-vous (HH:MM):');
    if (date && time && selectedLead) {
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
      setSelectedLead({
        ...selectedLead,
        nextAction: appointment,
        lastContact: date
      });
      
      alert('✅ Rendez-vous programmé avec succès');
      console.log(`[API] Rendez-vous programmé pour le lead ${selectedLead.id}: ${date} à ${time}`);
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
      console.log('[API] Nouveau lead créé:', newLead);
    }
  };

  return (
    <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-orange-900">Pipeline Commercial</h3>
        <button 
          onClick={handleAddNewLead}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Lead
        </button>
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
          <div className="text-2xl font-bold text-orange-700">
            {pipelineStats.total > 0 ? Math.round((pipelineStats.weightedValue / pipelineStats.totalValue) * 100) : 0}%
          </div>
          <div className="text-xs text-orange-600">Taux Conversion</div>
        </div>
      </div>

      {/* Pipeline par étapes */}
      <div className="bg-orange-100 rounded-lg p-4 border border-orange-200">
        <h4 className="text-sm font-semibold text-orange-900 mb-3">Pipeline par Étapes</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(pipelineStats.byStage).map(([stage, stats]) => (
            <div key={stage} className="text-center">
              <div className={`text-xs px-2 py-1 rounded-full ${getStageColor(stage)} mb-1`}>
                {stage}
              </div>
              <div className="text-lg font-bold text-orange-900">{stats.count}</div>
              <div className="text-xs text-orange-700">{formatCurrency(stats.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedStage || ''}
          onChange={(e) => setSelectedStage(e.target.value || null)}
          className="px-3 py-2 border border-orange-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Toutes les étapes</option>
          <option value="Prospection">Prospection</option>
          <option value="Qualification">Qualification</option>
          <option value="Proposition">Proposition</option>
          <option value="Négociation">Négociation</option>
          <option value="Clôturé">Clôturé</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'value' | 'probability' | 'lastContact')}
          className="px-3 py-2 border border-orange-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="value">Trier par valeur</option>
          <option value="probability">Trier par probabilité</option>
          <option value="lastContact">Trier par dernier contact</option>
        </select>
      </div>

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
                  disabled={lead.stage === 'Clôturé'}
                  className={`text-xs px-2 py-1 rounded ${
                    lead.stage === 'Clôturé' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={lead.stage === 'Clôturé' ? 'Lead déjà clôturé' : 'Passer à l\'étape suivante'}
                >
                  {lead.stage === 'Clôturé' ? 'Clôturé' : 'Suivant'}
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

      {/* Modal de détails du lead */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Détails du Lead</h3>
              <button 
                onClick={() => setShowLeadDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{selectedLead.title}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStageColor(selectedLead.stage)}`}>
                        {selectedLead.stage}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedLead.priority)}`}>
                        {selectedLead.priority === 'high' ? 'Haute' : selectedLead.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Valeur:</span>
                      <div className="text-xl font-bold text-green-600">{formatCurrency(selectedLead.value)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Probabilité:</span>
                      <div className="text-lg font-semibold">{selectedLead.probability}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Assigné à:</span>
                    <div className="font-medium">{selectedLead.assignedTo}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Prochaine action:</span>
                    <div className="font-medium">{selectedLead.nextAction}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dernier contact:</span>
                    <div className="font-medium">{formatDate(selectedLead.lastContact)}</div>
                    <div className="text-sm text-orange-600">
                      Il y a {getDaysSinceLastContact(selectedLead.lastContact)} jours
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="border-t pt-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">Notes</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.notes}</pre>
                  </div>
                </div>
              )}

              {/* Actions */}
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
                    disabled={selectedLead.stage === 'Clôturé'}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selectedLead.stage === 'Clôturé'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {selectedLead.stage === 'Clôturé' ? 'Déjà clôturé' : 'Passer à l\'étape suivante'}
                  </button>
                </div>
              </div>

              {/* Historique des contacts */}
              <div className="border-t pt-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Historique des contacts</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Appel téléphonique</div>
                      <div className="text-sm text-gray-600">Contact établi, intérêt confirmé</div>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(selectedLead.lastContact)}</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Email de présentation</div>
                      <div className="text-sm text-gray-600">Envoi du catalogue produits</div>
                    </div>
                    <div className="text-xs text-gray-500">2024-01-15</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">Premier contact</div>
                      <div className="text-sm text-gray-600">Lead généré via site web</div>
                    </div>
                    <div className="text-xs text-gray-500">2024-01-10</div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Modifier le Lead</h3>
              <button 
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étape</label>
                <select
                  value={editForm.stage || ''}
                  onChange={(e) => setEditForm({...editForm, stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Prospection">Prospection</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Proposition">Proposition</option>
                  <option value="Négociation">Négociation</option>
                  <option value="Clôturé">Clôturé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={editForm.priority || ''}
                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur (MAD)</label>
                <input
                  type="number"
                  value={editForm.value || ''}
                  onChange={(e) => setEditForm({...editForm, value: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probabilité (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.probability || ''}
                  onChange={(e) => setEditForm({...editForm, probability: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
                <input
                  type="text"
                  value={editForm.nextAction || ''}
                  onChange={(e) => setEditForm({...editForm, nextAction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                <input
                  type="text"
                  value={editForm.assignedTo || ''}
                  onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t">
              <button 
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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