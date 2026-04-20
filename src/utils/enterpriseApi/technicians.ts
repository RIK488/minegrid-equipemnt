import { TASK_LIST_COLUMNS, TECHNICIAN_FULL_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import type { Task, Technician } from './types';
import supabase from '../supabaseClient';

// 🔧 WIDGET "CHARGE DE TRAVAIL"
export const getTechniciansWorkload = async () => {
  try {
    const { data: technicians, error: techError } = await supabase
      .from('technicians')
      .select(TECHNICIAN_FULL_COLUMNS)
      .order('name', { ascending: true });

    if (techError) throw techError;

    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select(TASK_LIST_COLUMNS)
      .not('status', 'eq', 'Terminé');

    if (taskError) throw taskError;

    // Calculer la charge de travail pour chaque technicien
    const workloadData = technicians.map((tech: Technician) => {
      const techTasks = tasks.filter((task: Task) => task.technician_id === tech.id);
      const totalHours = techTasks.reduce((sum: number, task: Task) => sum + (task.estimated_hours || 0), 0);
      const workloadPercentage = (totalHours / tech.max_workload_hours) * 100;

      return {
        id: tech.id,
        name: tech.name,
        specialization: tech.specialization,
        current_hours: totalHours,
        max_hours: tech.max_workload_hours,
        workload_percentage: Math.min(workloadPercentage, 100),
        efficiency: tech.efficiency_rating,
        status: tech.availability_status,
        tasks_count: techTasks.length
      };
    });

    return workloadData;
  } catch (error) {
    console.error('Erreur lors du chargement de la charge de travail:', error);
    return [];
  }
};

export const getTechnicianTasks = async (technicianId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(TASK_LIST_COLUMNS)
      .eq('technician_id', technicianId)
      .not('status', 'eq', 'Terminé')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error);
    return [];
  }
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status,
        completed_date: status === 'Terminé' ? new Date().toISOString() : null
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    throw error;
  }
};

// 🔧 FONCTIONS UTILITAIRES
export const getTechnicians = async () => {
  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('id, name, specialization, availability_status')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des techniciens:', error);
    return [];
  }
};
