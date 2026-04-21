import { CLIENT_USER_COLUMNS, USER_INVITATION_COLUMNS } from '../../constants/proClientQueryFields';
import type { ClientUser, UserInvitation } from './types';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';
import { logger } from '../logger';

// =====================================================
// FONCTIONS API UTILISATEURS CLIENTS
// =====================================================

// Récupérer les utilisateurs d'un client
export async function getClientUsers(): Promise<ClientUser[]> {
  return supabaseCall<ClientUser[]>(
    () => supabase.from('client_users').select(CLIENT_USER_COLUMNS).eq('is_active', true),
    { label: 'getClientUsers', fallback: [] },
  );
}

// Inviter un nouvel utilisateur à l'espace Pro
export async function inviteClientUser(email: string, role: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    logger.error('[inviteClientUser] utilisateur non connecte');
    return false;
  }

  // Vérifier que l'utilisateur actuel est un admin de l'espace Pro
  const currentUserRole = await supabaseCall<{ role: string } | null>(
    () =>
      supabase
        .from('client_users')
        .select('role')
        .eq('user_id', user.id)
        .single(),
    { label: 'inviteClientUser.getCurrentRole', fallback: null },
  );

  if (!currentUserRole || currentUserRole.role !== 'admin') {
    logger.error('[inviteClientUser] permissions insuffisantes');
    return false;
  }

  try {
    await supabaseCall(
      () =>
        supabase
          .from('user_invitations')
          .insert({
            email,
            role,
            invited_by: user.id,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single(),
      { label: 'inviteClientUser.insert' },
    );
    logger.info('[inviteClientUser] invitation creee', { email, role });
    return true;
  } catch (error) {
    logger.error('[inviteClientUser] echec', error);
    return false;
  }
}

// Récupérer les invitations d'utilisateurs de l'espace Pro
export async function getUserInvitations(): Promise<UserInvitation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    logger.error('[getUserInvitations] utilisateur non connecte');
    return [];
  }

  return supabaseCall<UserInvitation[]>(
    () =>
      supabase
        .from('user_invitations')
        .select(USER_INVITATION_COLUMNS)
        .order('created_at', { ascending: false }),
    { label: 'getUserInvitations', fallback: [] },
  );
}

// Annuler une invitation
export async function cancelUserInvitation(invitationId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    logger.error('[cancelUserInvitation] utilisateur non connecte');
    return false;
  }

  try {
    await supabaseCall(
      () => supabase.from('user_invitations').update({ status: 'cancelled' }).eq('id', invitationId),
      { label: 'cancelUserInvitation' },
    );
    return true;
  } catch {
    return false;
  }
}
