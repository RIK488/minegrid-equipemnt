import { REPAIRS_LIST_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import type { Repair } from './types';
import supabase from '../supabaseClient';

// 🔧 WIDGET "ÉTAT DES RÉPARATIONS"
export const getRepairsStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .select(REPAIRS_LIST_COLUMNS)
      .not('status', 'eq', 'Terminé')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((repair: Repair) => ({
      id: repair.id,
      equipment: repair.equipment_name,
      technician: repair.technician_name,
      status: repair.status,
      estimated: `${repair.estimated_duration}h`,
      problem: repair.problem_description,
      cost: repair.estimated_cost
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des réparations:', error);
    return [];
  }
};

export const updateRepairStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .update({ 
        status,
        completion_date: status === 'Terminé' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }
};

export const assignTechnicianToRepair = async (repairId: string, technicianId: string, technicianName: string) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .update({ 
        technician_id: technicianId,
        technician_name: technicianName
      })
      .eq('id', repairId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    throw error;
  }
};
