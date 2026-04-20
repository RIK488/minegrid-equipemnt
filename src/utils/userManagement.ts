import supabase from './supabaseClient';
import { USER_INVITATION_COLUMNS } from '../constants/proClientQueryFields';

export interface UserInvitation {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  password?: string;
}

// Créer un nouvel utilisateur avec compte Supabase Auth
export async function createUserAccount(userData: CreateUserData): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    // Vérifier que l'utilisateur actuel est admin
    const { data: currentUserRole } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!currentUserRole || currentUserRole.role !== 'admin') {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent créer des comptes.' };
    }

    // Générer un mot de passe temporaire si non fourni
    const tempPassword = userData.password || `temp-${Math.random().toString(36).substring(7)}`;

    // Créer l'utilisateur dans Supabase Auth
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role
      }
    });

    if (authError) {
      console.error('Erreur création utilisateur Auth:', authError);
      return { success: false, error: `Erreur lors de la création du compte: ${authError.message}` };
    }

    if (!newUser) {
      return { success: false, error: 'Erreur: Utilisateur non créé' };
    }

    // Ajouter l'utilisateur à la table client_users
    const { error: clientError } = await supabase
      .from('client_users')
      .insert({
        user_id: newUser.id,
        role: userData.role,
        permissions: JSON.stringify(getDefaultPermissions(userData.role))
      });

    if (clientError) {
      console.error('Erreur ajout utilisateur client:', clientError);
      // Supprimer l'utilisateur Auth si l'ajout client échoue
      await supabase.auth.admin.deleteUser(newUser.id);
      return { success: false, error: `Erreur lors de l'ajout de l'utilisateur: ${clientError.message}` };
    }

    // Envoyer un email de bienvenue avec les informations de connexion
    await sendWelcomeEmail(userData.email, userData.name, tempPassword);

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return { success: false, error: 'Erreur inattendue lors de la création du compte' };
  }
}

// Inviter un utilisateur (créer une invitation)
export async function inviteUser(email: string, name: string, role: 'admin' | 'manager' | 'technician' | 'viewer'): Promise<{ success: boolean; error?: string; invitationId?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    // Vérifier que l'utilisateur actuel est admin
    const { data: currentUserRole } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!currentUserRole || currentUserRole.role !== 'admin') {
      return { success: false, error: 'Permissions insuffisantes. Seuls les administrateurs peuvent inviter des utilisateurs.' };
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.some(u => u.email === email);
    
    if (userExists) {
      return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
    }

    // Créer l'invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        name,
        role,
        invited_by: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Erreur création invitation:', invitationError);
      return { success: false, error: `Erreur lors de la création de l'invitation: ${invitationError.message}` };
    }

    // Envoyer l'email d'invitation
    await sendInvitationEmail(email, name, role, invitation.id);

    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error('Erreur invitation utilisateur:', error);
    return { success: false, error: 'Erreur inattendue lors de l\'invitation' };
  }
}

// Récupérer toutes les invitations
export async function getUserInvitations(): Promise<UserInvitation[]> {
  try {
    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select(USER_INVITATION_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération invitations:', error);
      return [];
    }

    return invitations || [];
  } catch (error) {
    console.error('Erreur récupération invitations:', error);
    return [];
  }
}

// Annuler une invitation
export async function cancelInvitation(invitationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    if (error) {
      console.error('Erreur annulation invitation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur annulation invitation:', error);
    return false;
  }
}

// Accepter une invitation (créer le compte)
export async function acceptInvitation(invitationId: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('user_invitations')
      .select(USER_INVITATION_COLUMNS)
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      return { success: false, error: 'Invitation non trouvée' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: 'Cette invitation n\'est plus valide' };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'Cette invitation a expiré' };
    }

    // Créer l'utilisateur
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: {
        name: invitation.name,
        role: invitation.role
      }
    });

    if (authError) {
      return { success: false, error: `Erreur lors de la création du compte: ${authError.message}` };
    }

    // Ajouter à client_users
    const { error: clientError } = await supabase
      .from('client_users')
      .insert({
        user_id: newUser.id,
        role: invitation.role,
        permissions: JSON.stringify(getDefaultPermissions(invitation.role))
      });

    if (clientError) {
      // Nettoyer en cas d'erreur
      await supabase.auth.admin.deleteUser(newUser.id);
      return { success: false, error: `Erreur lors de l'ajout de l'utilisateur: ${clientError.message}` };
    }

    // Marquer l'invitation comme acceptée
    await supabase
      .from('user_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: newUser.id
      })
      .eq('id', invitationId);

    return { success: true };
  } catch (error) {
    console.error('Erreur acceptation invitation:', error);
    return { success: false, error: 'Erreur inattendue lors de l\'acceptation de l\'invitation' };
  }
}

// Récupérer les permissions par défaut selon le rôle
function getDefaultPermissions(role: string): any {
  const permissions = {
    admin: ['all'],
    manager: ['dashboard', 'equipment', 'orders', 'maintenance', 'documents', 'messages'],
    technician: ['dashboard', 'equipment', 'maintenance', 'documents', 'messages'],
    viewer: ['dashboard', 'equipment', 'orders', 'maintenance', 'documents']
  };
  
  return permissions[role as keyof typeof permissions] || permissions.viewer;
}

// Envoyer un email de bienvenue
async function sendWelcomeEmail(email: string, name: string, password: string): Promise<void> {
  try {
    // Ici vous pouvez intégrer votre service d'email
    // Pour l'instant, on log les informations
    console.log('📧 Email de bienvenue envoyé à:', email);
    console.log('Nom:', name);
    if (import.meta.env.DEV) console.log('Mot de passe temporaire généré (longueur:', password.length, ')');
    
    // TODO: Intégrer un service d'email réel (SendGrid, Mailgun, etc.)
  } catch (error) {
    console.error('Erreur envoi email bienvenue:', error);
  }
}

// Envoyer un email d'invitation
async function sendInvitationEmail(email: string, name: string, role: string, invitationId: string): Promise<void> {
  try {
    // Ici vous pouvez intégrer votre service d'email
    console.log('📧 Email d\'invitation envoyé à:', email);
    console.log('Nom:', name);
    console.log('Rôle:', role);
    console.log('ID invitation:', invitationId);
    
    // TODO: Intégrer un service d'email réel avec le lien d'invitation
  } catch (error) {
    console.error('Erreur envoi email invitation:', error);
  }
}
