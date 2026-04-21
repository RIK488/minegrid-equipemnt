import { EQUIPMENT_DIAGNOSTICS_COLUMNS, MAINTENANCE_INTERVENTION_SELECT } from '../../constants/proClientQueryFields';
import type { EquipmentDiagnostic, MaintenanceIntervention } from './types';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';
import { logger } from '../logger';
import { getProClientProfile } from './profile';

// =====================================================
// FONCTIONS API MAINTENANCE
// =====================================================

// Récupérer toutes les interventions de maintenance
export async function getMaintenanceInterventions(): Promise<MaintenanceIntervention[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération des interventions de maintenance Pro pour l\'utilisateur:', user.id);

    // Récupérer le profil Pro pour obtenir le client_id
    const proProfile = await getProClientProfile();
    if (!proProfile) {
      console.log('⚠️ Aucun profil Pro trouvé, création d\'interventions de démonstration...');
      
      // Créer des interventions de démonstration
      const demoInterventions: Partial<MaintenanceIntervention>[] = [
        {
          client_id: proProfile?.id || user.id,
          equipment_id: 'demo-equipment-1',
          intervention_type: 'preventive',
          status: 'scheduled',
          priority: 'normal',
          description: 'Maintenance préventive annuelle',
          scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          technician_name: 'Ahmed Benali',
          cost: 2500,
          notes: 'Vérification générale et changement d\'huile'
        },
        {
          client_id: proProfile?.id || user.id,
          equipment_id: 'demo-equipment-2',
          intervention_type: 'corrective',
          status: 'in_progress',
          priority: 'high',
          description: 'Réparation système hydraulique',
          scheduled_date: new Date().toISOString(),
          actual_date: new Date().toISOString(),
          technician_name: 'Mohammed Tazi',
          cost: 8500,
          notes: 'Remplacement de la pompe hydraulique'
        }
      ];

      const { data: newInterventions, error: createError } = await supabase
        .from('maintenance_interventions')
        .insert(demoInterventions)
        .select();

      if (createError) throw createError;
      
      console.log('✅ Interventions de démonstration créées:', newInterventions);
      return newInterventions || [];
    }

    // Récupérer les interventions du client
    const { data, error } = await supabase
      .from('maintenance_interventions')
      .select(MAINTENANCE_INTERVENTION_SELECT)
      .eq('client_id', proProfile.id)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    
    console.log('✅ Interventions Pro récupérées:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des interventions Pro:', error);
    return [];
  }
}

// Créer une nouvelle intervention
export async function createMaintenanceIntervention(
  intervention: Partial<MaintenanceIntervention>
): Promise<MaintenanceIntervention | null> {
  try {
    return await supabaseCall<MaintenanceIntervention>(
      () => supabase.from('maintenance_interventions').insert(intervention).select().single(),
      { label: 'createMaintenanceIntervention' },
    );
  } catch (error) {
    logger.error('[createMaintenanceIntervention]', error);
    return null;
  }
}

// =====================================================
// FONCTIONS API DIAGNOSTICS
// =====================================================

// Récupérer les diagnostics d'un équipement
export async function getEquipmentDiagnostics(equipmentId: string): Promise<EquipmentDiagnostic[]> {
  return supabaseCall<EquipmentDiagnostic[]>(
    () =>
      supabase
        .from('equipment_diagnostics')
        .select(EQUIPMENT_DIAGNOSTICS_COLUMNS)
        .eq('equipment_id', equipmentId)
        .order('diagnostic_date', { ascending: false }),
    { label: 'getEquipmentDiagnostics', fallback: [] },
  );
}

// Ajouter un nouveau diagnostic
export async function addEquipmentDiagnostic(
  diagnostic: Partial<EquipmentDiagnostic>
): Promise<EquipmentDiagnostic | null> {
  try {
    return await supabaseCall<EquipmentDiagnostic>(
      () => supabase.from('equipment_diagnostics').insert(diagnostic).select().single(),
      { label: 'addEquipmentDiagnostic' },
    );
  } catch (error) {
    logger.error('[addEquipmentDiagnostic]', error);
    return null;
  }
}
