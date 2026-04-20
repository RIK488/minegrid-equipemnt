import { PRO_CLIENT_COLUMNS, USER_PROFILE_COLUMNS } from '../../constants/proClientQueryFields';
import type { ProClient } from './types';
import supabase from '../supabaseClient';

// =====================================================
// FONCTIONS API PRO CLIENTS
// =====================================================

// Récupérer le profil client pro
export async function getProClientProfile(): Promise<ProClient | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération du profil Pro pour l\'utilisateur:', user.id);

    // Récupérer le profil utilisateur de base
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select(USER_PROFILE_COLUMNS)
      .eq('id', user.id)
      .single();

    // Récupérer le profil Pro spécifique
    const { data: proProfile, error } = await supabase
      .from('pro_clients')
      .select(PRO_CLIENT_COLUMNS)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log('⚠️ Aucun profil Pro trouvé, création d\'un profil de base...');
      
      // Créer un profil Pro de base avec les données utilisateur
      const baseProProfile: Partial<ProClient> = {
        user_id: user.id,
        company_name: userProfile?.company || 'Entreprise',
        contact_person: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim(),
        phone: userProfile?.phone || '',
        address: userProfile?.address || '',
        subscription_type: 'pro',
        subscription_status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
        max_users: 5
      };

      const { data: newProfile, error: createError } = await supabase
        .from('pro_clients')
        .insert([baseProProfile])
        .select()
        .single();

      if (createError) throw createError;
      
      console.log('✅ Profil Pro créé:', newProfile);
      return newProfile;
    }

    console.log('✅ Profil Pro récupéré:', proProfile);
    return proProfile;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil Pro:', error);
    return null;
  }
}

// Créer ou mettre à jour le profil client pro
export async function upsertProClientProfile(profile: Partial<ProClient>): Promise<ProClient | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('pro_clients')
      .upsert({
        user_id: user.id,
        ...profile
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil pro:', error);
    return null;
  }
}
