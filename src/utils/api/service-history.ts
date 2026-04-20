import { SERVICE_HISTORY_COLUMNS } from '../../constants/apiQueryFields';
import type { ServiceHistory } from './types';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

export async function getServiceHistory(): Promise<ServiceHistory[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('service_history')
    .select(SERVICE_HISTORY_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function logServiceAction(action: ServiceHistory['action'], description: string, serviceType?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('service_history')
    .insert([{
      user_id: user.id,
      service_type: serviceType || 'general',
      action,
      description,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
}
