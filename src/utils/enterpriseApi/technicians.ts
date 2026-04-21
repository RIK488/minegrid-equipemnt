import { TASK_LIST_COLUMNS, TECHNICIAN_FULL_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import type { Task, Technician } from './types';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';

// WIDGET "CHARGE DE TRAVAIL"
export const getTechniciansWorkload = async () => {
  const [technicians, tasks] = await Promise.all([
    supabaseCall<Technician[]>(
      () =>
        supabase
          .from('technicians')
          .select(TECHNICIAN_FULL_COLUMNS)
          .order('name', { ascending: true }),
      { label: 'getTechniciansWorkload.technicians', fallback: [] },
    ),
    supabaseCall<Task[]>(
      () => supabase.from('tasks').select(TASK_LIST_COLUMNS).not('status', 'eq', 'Terminé'),
      { label: 'getTechniciansWorkload.tasks', fallback: [] },
    ),
  ]);

  return technicians.map((tech) => {
    const techTasks = tasks.filter((task) => task.technician_id === tech.id);
    const totalHours = techTasks.reduce(
      (sum, task) => sum + (task.estimated_hours || 0),
      0,
    );
    const workloadPercentage = tech.max_workload_hours
      ? (totalHours / tech.max_workload_hours) * 100
      : 0;

    return {
      id: tech.id,
      name: tech.name,
      specialization: tech.specialization,
      current_hours: totalHours,
      max_hours: tech.max_workload_hours,
      workload_percentage: Math.min(workloadPercentage, 100),
      efficiency: tech.efficiency_rating,
      status: tech.availability_status,
      tasks_count: techTasks.length,
    };
  });
};

export const getTechnicianTasks = async (technicianId: string) => {
  return supabaseCall(
    () =>
      supabase
        .from('tasks')
        .select(TASK_LIST_COLUMNS)
        .eq('technician_id', technicianId)
        .not('status', 'eq', 'Terminé')
        .order('due_date', { ascending: true }),
    { label: 'getTechnicianTasks', fallback: [] },
  );
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  return supabaseCall(
    () =>
      supabase
        .from('tasks')
        .update({
          status,
          completed_date: status === 'Terminé' ? new Date().toISOString() : null,
        })
        .eq('id', taskId)
        .select()
        .single(),
    { label: 'updateTaskStatus', toastOnError: true },
  );
};

// FONCTIONS UTILITAIRES
export const getTechnicians = async () => {
  return supabaseCall(
    () =>
      supabase
        .from('technicians')
        .select('id, name, specialization, availability_status')
        .order('name', { ascending: true }),
    { label: 'getTechnicians', fallback: [] },
  );
};
