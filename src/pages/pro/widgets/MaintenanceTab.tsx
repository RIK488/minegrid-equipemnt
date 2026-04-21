import React, { useState } from 'react';
import supabase from '../../../utils/supabaseClient';
import { createMaintenanceIntervention, getProClientProfile } from '../../../utils/proApi';
import type { MaintenanceIntervention } from '../../../utils/proApi';
import {
  Calendar,
  Edit,
  Eye,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { toast } from '../../../utils/toast';
export function MaintenanceTab({ interventions, equipment, onRefresh }: { interventions: MaintenanceIntervention[], equipment: any[], onRefresh: () => Promise<void> }) {
  const [showAddInterventionModal, setShowAddInterventionModal] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    equipment_id: '',
    intervention_type: 'preventive' as 'preventive' | 'corrective' | 'emergency' | 'inspection',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    duration_hours: 8,
    technician_name: '',
    cost: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIntervention = () => {
    setShowAddInterventionModal(true);
  };

  const handleInterventionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Récupérer le profil Pro pour obtenir le client_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const proProfile = await getProClientProfile();
      if (!proProfile) throw new Error('Profil Pro non trouvé');

          // Préparer les données de l'intervention
    const interventionData = {
      ...interventionForm,
      client_id: proProfile.id,
      status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
      equipment_id: null // Champ optionnel pour les interventions générales
    };

      // Créer l'intervention
      const newIntervention = await createMaintenanceIntervention(interventionData);
      
      if (newIntervention) {
        console.log('✅ Intervention de maintenance créée:', newIntervention);
        setShowAddInterventionModal(false);
        setInterventionForm({
          equipment_id: '',
          intervention_type: 'preventive',
          priority: 'normal',
          description: '',
          scheduled_date: new Date().toISOString().split('T')[0],
          duration_hours: 8,
          technician_name: '',
          cost: 0
        });
        
        // Recharger les données
        await onRefresh();
        
        // Notification de succès
        toast('Intervention de maintenance planifiée avec succès !');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'intervention:', error);
      toast('Erreur lors de la planification de l\'intervention');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setInterventionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance</h2>
        <button 
          onClick={handleAddIntervention}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Planifier une intervention
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interventions.map((intervention) => {
          // Trouver l'équipement correspondant
          const relatedEquipment = equipment.find(eq => eq.id === intervention.equipment_id);
          
          return (
            <div key={intervention.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {intervention.intervention_type}
                  </h3>
                  {relatedEquipment && (
                    <p className="text-sm font-medium text-orange-600 mb-1">
                      🏗️ {relatedEquipment.name} - {relatedEquipment.brand} {relatedEquipment.model}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {intervention.description}
                  </p>
                </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                intervention.status === 'completed' ? 'bg-orange-100 text-orange-800' :
                intervention.status === 'in_progress' ? 'bg-orange-200 text-orange-900' :
                intervention.status === 'scheduled' ? 'bg-orange-300 text-orange-900' :
                'bg-orange-400 text-orange-900'
              }`}>
                {intervention.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(intervention.scheduled_date).toLocaleDateString()}
              </div>
              {intervention.technician_name && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {intervention.technician_name}
                </div>
              )}
              {intervention.cost && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Coût: {intervention.cost}€</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="text-orange-600 hover:text-orange-900 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </button>
              <button className="text-gray-600 hover:text-gray-900 text-sm">
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </button>
            </div>
          </div>
        );
        })}
      </div>

      {/* Message si aucune intervention */}
      {interventions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Aucune intervention de maintenance
          </div>
          <p className="text-gray-400">
            Planifiez votre première intervention de maintenance
          </p>
        </div>
      )}

      {/* Modal d'ajout d'intervention */}
      {showAddInterventionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Planifier une Intervention</h3>
              <button
                onClick={() => setShowAddInterventionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleInterventionSubmit} className="space-y-6">
              {/* Sélection de l'équipement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement concerné *
                </label>
                <select
                  value={interventionForm.equipment_id}
                  onChange={(e) => handleInputChange('equipment_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} - {eq.brand} {eq.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'intervention *
                  </label>
                  <select
                    value={interventionForm.intervention_type}
                    onChange={(e) => handleInputChange('intervention_type', e.target.value as 'preventive' | 'corrective' | 'emergency' | 'inspection')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="preventive">Préventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="emergency">Urgence</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={interventionForm.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Faible</option>
                    <option value="normal">Normale</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date programmée *
                  </label>
                  <input
                    type="date"
                    value={interventionForm.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    value={interventionForm.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'intervention *
                </label>
                <textarea
                  value={interventionForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                  placeholder="Décrivez l'intervention à effectuer..."
                  required
                />
              </div>

              {/* Informations techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technicien responsable
                  </label>
                  <input
                    type="text"
                    value={interventionForm.technician_name}
                    onChange={(e) => handleInputChange('technician_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nom du technicien"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coût estimé (€)
                  </label>
                  <input
                    type="number"
                    value={interventionForm.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddInterventionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Planification en cours...
                    </>
                  ) : (
                    'Planifier l\'intervention'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
