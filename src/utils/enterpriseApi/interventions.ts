import { INTERVENTION_URGENT_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import supabase from '../supabaseClient';

// =====================================================
// APIs POUR LES WIDGETS MÉCANICIEN
// =====================================================

// 🔧 WIDGET "INTERVENTIONS DU JOUR"
export async function getDailyInterventions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('interventions')
    .select('status')
    .gte('intervention_date', today.toISOString())
    .lt('intervention_date', tomorrow.toISOString());

  if (error) {
    console.error('Erreur lors de la récupération des interventions du jour:', error);
    return null;
  }

  const completed = data.filter(i => i.status === 'Terminé').length;
  const pending = data.filter(i => i.status !== 'Terminé').length;
  
  return [
    { name: 'Terminé', value: completed },
    { name: 'En attente', value: pending },
  ];
}

export async function getInterventionsByStatus(status: 'Terminé' | 'En attente' | 'En cours') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('interventions')
    .select(`
      id,
      description,
      status,
      priority,
      intervention_date,
      equipment:machines ( name ),
      technician:technicians ( name )
    `)
    .eq('status', status)
    .gte('intervention_date', today.toISOString())
    .lt('intervention_date', tomorrow.toISOString());

  if (error) {
    console.error(`Erreur lors de la récupération des interventions (${status}):`, error);
    return [];
  }

  return data;
}

export async function createIntervention(interventionData: {
  equipment_id: string;
  description: string;
  technician_id?: string;
  intervention_date: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

  const { data, error } = await supabase
    .from('interventions')
    .insert([
      {
        ...interventionData,
        status: 'En attente',
        created_by: userData.user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    throw error;
  }
  return data;
}

export const getUrgentInterventions = async () => {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select(INTERVENTION_URGENT_COLUMNS)
      .eq('priority', 'Urgente')
      .not('status', 'eq', 'Terminé')
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des interventions urgentes:', error);
    return [];
  }
};

// 📋 WIDGET "MAINTENANCE PRÉVENTIVE" - AMÉLIORÉ
export async function getPreventiveMaintenance() {
  try {
    console.log('[DEBUG] Début de getPreventiveMaintenance()');
    
    // Récupérer toutes les interventions avec plus d'informations
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .select(`
        id,
        description,
        intervention_date,
        priority,
        status,
        estimated_duration,
        equipment_id,
        technician_id,
        created_at
      `)
      .gte('intervention_date', new Date().toISOString())
      .order('intervention_date', { ascending: true })
      .limit(20);

    console.log('[DEBUG] Interventions récupérées:', interventions?.length || 0);
    if (interventionsError) {
      console.error('[DEBUG] Erreur interventions:', interventionsError);
      throw interventionsError;
    }

    // Récupérer les informations des équipements
    const equipmentIds = [...new Set(interventions?.map(i => i.equipment_id).filter(Boolean))];
    let equipmentData: any = {};
    
    if (equipmentIds.length > 0) {
      const { data: equipment, error: equipmentError } = await supabase
        .from('machines')
        .select('id, name, brand, model')
        .in('id', equipmentIds);
      
      if (!equipmentError && equipment) {
        equipment.forEach(eq => {
          equipmentData[eq.id] = eq;
        });
      }
    }

    // Récupérer les informations des techniciens
    const technicianIds = [...new Set(interventions?.map(i => i.technician_id).filter(Boolean))];
    let technicianData: any = {};
    
    if (technicianIds.length > 0) {
      const { data: technicians, error: technicianError } = await supabase
        .from('technicians')
        .select('id, name, specialization')
        .in('id', technicianIds);
      
      if (!technicianError && technicians) {
        technicians.forEach(tech => {
          technicianData[tech.id] = tech;
        });
      }
    }

    // Enrichir les données des interventions
    const enrichedInterventions = interventions?.map(intervention => {
      const interventionDate = new Date(intervention.intervention_date);
      const now = new Date();
      
      // Calculer le temps restant
      const timeUntil = interventionDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
      const hoursUntil = Math.ceil(timeUntil / (1000 * 60 * 60));
      
      // Déterminer l'urgence
      let urgency = 'normal';
      if (daysUntil < 0) urgency = 'overdue';
      else if (daysUntil === 0 && hoursUntil <= 2) urgency = 'urgent';
      else if (daysUntil <= 1) urgency = 'high';
      else if (daysUntil <= 3) urgency = 'medium';
      
      // Récupérer les données des relations
      const equipment = equipmentData[intervention.equipment_id];
      const technician = technicianData[intervention.technician_id];
      
      return {
        ...intervention,
        daysUntil,
        hoursUntil,
        urgency,
        equipmentName: equipment ? `${equipment.brand || ''} ${equipment.model || equipment.name}`.trim() : 'Équipement non spécifié',
        technicianName: technician?.name || 'Non assigné',
        technicianSpecialization: technician?.specialization || '',
        isOverdue: daysUntil < 0,
        isToday: daysUntil === 0,
        isThisWeek: daysUntil <= 7
      };
    }) || [];

    // Calculer les statistiques
    const total = enrichedInterventions.length;
    const today = enrichedInterventions.filter(i => i.isToday).length;
    const thisWeek = enrichedInterventions.filter(i => i.isThisWeek).length;
    const overdue = enrichedInterventions.filter(i => i.isOverdue).length;
    const byPriority = {
      haute: enrichedInterventions.filter(i => i.priority === 'Haute').length,
      moyenne: enrichedInterventions.filter(i => i.priority === 'Moyenne').length,
      basse: enrichedInterventions.filter(i => i.priority === 'Basse').length
    };
    const byStatus = {
      'En attente': enrichedInterventions.filter(i => i.status === 'En attente').length,
      'En cours': enrichedInterventions.filter(i => i.status === 'En cours').length,
      'Terminé': enrichedInterventions.filter(i => i.status === 'Terminé').length,
      'Annulé': enrichedInterventions.filter(i => i.status === 'Annulé').length
    };

    const result = {
      interventions: enrichedInterventions,
      stats: {
        total,
        today,
        thisWeek,
        overdue,
        byPriority,
        byStatus
      }
    };

    console.log('[DEBUG] Résultat final getPreventiveMaintenance:', {
      total,
      today,
      thisWeek,
      overdue,
      byPriority,
      byStatus
    });

    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération de la maintenance préventive:", error);
    return {
      interventions: [],
      stats: {
        total: 0,
        today: 0,
        thisWeek: 0,
        overdue: 0,
        byPriority: { haute: 0, moyenne: 0, basse: 0 },
        byStatus: { 'En attente': 0, 'En cours': 0, 'Terminé': 0, 'Annulé': 0 }
      }
    };
  }
}

// ➕ CRÉER UNE NOUVELLE INTERVENTION
export async function createMaintenanceIntervention(interventionData: {
  equipment_id: string;
  description: string;
  intervention_date: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
  estimated_duration?: number;
  technician_id?: string;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

  try {
    const { data, error } = await supabase
      .from('interventions')
      .insert([{ 
        ...interventionData,
        status: 'En attente',
        created_by: userData.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de l'intervention:", error);
    throw error;
  }
}

// 🔄 METTRE À JOUR LE STATUT D'UNE INTERVENTION
export async function updateInterventionStatus(interventionId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .update({ status: status })
      .eq('id', interventionId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
}

// ✏️ MODIFIER UNE INTERVENTION
export async function updateMaintenanceIntervention(interventionId: string, interventionData: {
  description?: string;
  intervention_date?: string;
  priority?: 'Basse' | 'Moyenne' | 'Haute';
  estimated_duration?: number;
  technician_id?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .update(interventionData)
      .eq('id', interventionId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la modification de l'intervention:", error);
    throw error;
  }
}

// 🗑️ SUPPRIMER UNE INTERVENTION
export async function deleteMaintenanceIntervention(interventionId: string) {
  try {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', interventionId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'intervention:", error);
    throw error;
  }
}
