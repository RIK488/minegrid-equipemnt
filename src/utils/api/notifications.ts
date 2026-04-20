import { NOTIFICATION_APP_COLUMNS } from '../../constants/apiQueryFields';
import type { Notification } from './types';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

// -------------------- NOTIFICATIONS --------------------

export async function getNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_APP_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return data;
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
  return data;
}

export async function createNotification(notificationData: {
  type: Notification['type'];
  title: string;
  content: string;
  related_id?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: user.id,
      ...notificationData,
      is_read: false,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
}
