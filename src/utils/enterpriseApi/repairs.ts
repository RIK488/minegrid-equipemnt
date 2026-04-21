import { REPAIRS_LIST_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import type { Repair } from './types';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';

// WIDGET "ETAT DES REPARATIONS"
export const getRepairsStatus = async () => {
  const data = await supabaseCall<Repair[]>(
    () =>
      supabase
        .from('repairs')
        .select(REPAIRS_LIST_COLUMNS)
        .not('status', 'eq', 'Terminé')
        .order('created_at', { ascending: false }),
    { label: 'getRepairsStatus', fallback: [] },
  );

  return data.map((repair) => ({
    id: repair.id,
    equipment: repair.equipment_name,
    technician: repair.technician_name,
    status: repair.status,
    estimated: `${repair.estimated_duration}h`,
    problem: repair.problem_description,
    cost: repair.estimated_cost,
  }));
};

export const updateRepairStatus = async (id: string, status: string) => {
  return supabaseCall(
    () =>
      supabase
        .from('repairs')
        .update({
          status,
          completion_date: status === 'Terminé' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single(),
    { label: 'updateRepairStatus', toastOnError: true },
  );
};

export const assignTechnicianToRepair = async (
  repairId: string,
  technicianId: string,
  technicianName: string,
) => {
  return supabaseCall(
    () =>
      supabase
        .from('repairs')
        .update({ technician_id: technicianId, technician_name: technicianName })
        .eq('id', repairId)
        .select()
        .single(),
    { label: 'assignTechnicianToRepair', toastOnError: true },
  );
};
