import { CLIENT_USER_COLUMNS, USER_INVITATION_COLUMNS } from '../../constants/proClientQueryFields';
import type { ClientUser, UserInvitation } from './types';
import supabase from '../supabaseClient';

// =====================================================
// FONCTIONS API UTILISATEURS CLIENTS
// =====================================================

// Récupérer les utilisateurs d'un client
export async function getClientUsers(): Promise<ClientUser[]> {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select(CLIENT_USER_COLUMNS)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
}

// Inviter un nouvel utilisateur à l'espace Pro
export async function inviteClientUser(email: string, role: string): Promise<boolean> {
  try {
    // Vérifier que l'utilisateur actuel a les permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Utilisateur non connecté');
      return false;
    }

    // Vérifier que l'utilisateur actuel est un admin de l'espace Pro
    const { data: currentUserRole } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!currentUserRole || currentUserRole.role !== 'admin') {
      console.error('Permissions insuffisantes pour inviter un utilisateur à l\'espace Pro');
      return false;
    }

    // Créer une invitation dans la table invitations
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Erreur lors de la création de l\'invitation:', invitationError);
      return false;
    }

    // Envoyer un email d'invitation (optionnel - peut être implémenté plus tard)
    console.log('Invitation créée pour:', email, 'avec le rôle:', role);

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
    return false;
  }
}

// Récupérer les invitations d'utilisateurs de l'espace Pro
export async function getUserInvitations(): Promise<UserInvitation[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Utilisateur non connecté');
      return [];
    }

    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select(USER_INVITATION_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des invitations de l\'espace Pro:', error);
      return [];
    }

    return invitations || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations de l\'espace Pro:', error);
    return [];
  }
}

// Annuler une invitation
export async function cancelUserInvitation(invitationId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Utilisateur non connecté');
      return false;
    }

    const { error } = await supabase
      .from('user_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    if (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'invitation:', error);
    return false;
  }
}
