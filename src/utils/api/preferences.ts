import { USER_PREFERENCES_COLUMNS } from '../../constants/apiQueryFields';
import type { UserPreferences } from './types';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

// -------------------- PRÉFÉRENCES UTILISATEUR --------------------

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_preferences')
    .select(USER_PREFERENCES_COLUMNS)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserPreferences(preferencesData: Partial<UserPreferences>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferencesData,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

export async function updateNotificationSettings(settings: {
  email_notifications: Partial<UserPreferences['email_notifications']>;
  notification_frequency?: UserPreferences['notification_frequency'];
  notification_hours?: UserPreferences['notification_hours'];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const currentPrefs = await getUserPreferences();
  const defaultEmailNotifications = {
    views: true,
    messages: true,
    offers: true,
    expired: false,
    newsletter: false
  };

  const updatedPrefs = {
    ...currentPrefs,
    email_notifications: {
      ...defaultEmailNotifications,
      ...currentPrefs?.email_notifications,
      ...settings.email_notifications
    },
    notification_frequency: settings.notification_frequency || currentPrefs?.notification_frequency || 'immediate',
    notification_hours: settings.notification_hours || currentPrefs?.notification_hours || { start: '08:00', end: '20:00' },
    updated_at: new Date().toISOString()
  };

  return await updateUserPreferences(updatedPrefs);
}
