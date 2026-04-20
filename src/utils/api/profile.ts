import { USER_PROFILE_API_COLUMNS } from '../../constants/apiQueryFields';
import type { UserProfile } from './types';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

// -------------------- PROFIL UTILISATEUR --------------------

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_profiles')
    .select(USER_PROFILE_API_COLUMNS)
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
}

export async function updateUserProfile(profileData: Partial<UserProfile>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

export async function uploadProfilePicture(file: File): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const fileName = `profile_${user.id}_${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('profile-pictures')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase
    .storage
    .from('profile-pictures')
    .getPublicUrl(fileName);

  // Mettre à jour le profil avec la nouvelle photo
  await updateUserProfile({ profile_picture: fileName });

  return fileName;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Vérifier l'ancien mot de passe
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) throw new Error('Mot de passe actuel incorrect');

  // Changer le mot de passe
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return { success: true };
}

// -------------------- UTILITAIRES --------------------

export async function deleteUserAccount() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Supprimer toutes les données utilisateur
  await supabase.from('user_profiles').delete().eq('id', user.id);
  await supabase.from('user_preferences').delete().eq('user_id', user.id);
  await supabase.from('notifications').delete().eq('user_id', user.id);
  await supabase.from('premium_services').delete().eq('user_id', user.id);
  await supabase.from('service_history').delete().eq('user_id', user.id);

  // Supprimer le compte Supabase
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) throw error;

  return { success: true };
}
