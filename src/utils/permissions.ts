// Système de gestion des permissions pour l'espace Pro
import React from 'react';
import supabase from './supabaseClient';

export type UserRole = 'admin' | 'manager' | 'technician' | 'viewer';

export interface Permission {
  action: string;
  resource: string;
  allowed: boolean;
}

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
  isAdmin: boolean;
  isManager: boolean;
  isTechnician: boolean;
  isViewer: boolean;
}

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Gestion des utilisateurs
    { action: 'create', resource: 'users', allowed: true },
    { action: 'read', resource: 'users', allowed: true },
    { action: 'update', resource: 'users', allowed: true },
    { action: 'delete', resource: 'users', allowed: true },
    { action: 'invite', resource: 'users', allowed: true },
    
    // Équipements
    { action: 'create', resource: 'equipment', allowed: true },
    { action: 'read', resource: 'equipment', allowed: true },
    { action: 'update', resource: 'equipment', allowed: true },
    { action: 'delete', resource: 'equipment', allowed: true },
    
    // Commandes
    { action: 'create', resource: 'orders', allowed: true },
    { action: 'read', resource: 'orders', allowed: true },
    { action: 'update', resource: 'orders', allowed: true },
    { action: 'delete', resource: 'orders', allowed: true },
    
    // Maintenance
    { action: 'create', resource: 'maintenance', allowed: true },
    { action: 'read', resource: 'maintenance', allowed: true },
    { action: 'update', resource: 'maintenance', allowed: true },
    { action: 'delete', resource: 'maintenance', allowed: true },
    
    // Documents
    { action: 'create', resource: 'documents', allowed: true },
    { action: 'read', resource: 'documents', allowed: true },
    { action: 'update', resource: 'documents', allowed: true },
    { action: 'delete', resource: 'documents', allowed: true },
    
    // Messages
    { action: 'create', resource: 'messages', allowed: true },
    { action: 'read', resource: 'messages', allowed: true },
    { action: 'update', resource: 'messages', allowed: true },
    { action: 'delete', resource: 'messages', allowed: true },
    
    // Configuration
    { action: 'read', resource: 'settings', allowed: true },
    { action: 'update', resource: 'settings', allowed: true },
    
    // Rapports
    { action: 'read', resource: 'reports', allowed: true },
    { action: 'export', resource: 'reports', allowed: true },
  ],
  
  manager: [
    // Gestion des utilisateurs (lecture seule)
    { action: 'read', resource: 'users', allowed: true },
    { action: 'create', resource: 'users', allowed: false },
    { action: 'update', resource: 'users', allowed: false },
    { action: 'delete', resource: 'users', allowed: false },
    { action: 'invite', resource: 'users', allowed: false },
    
    // Équipements
    { action: 'create', resource: 'equipment', allowed: true },
    { action: 'read', resource: 'equipment', allowed: true },
    { action: 'update', resource: 'equipment', allowed: true },
    { action: 'delete', resource: 'equipment', allowed: false },
    
    // Commandes
    { action: 'create', resource: 'orders', allowed: true },
    { action: 'read', resource: 'orders', allowed: true },
    { action: 'update', resource: 'orders', allowed: true },
    { action: 'delete', resource: 'orders', allowed: false },
    
    // Maintenance
    { action: 'create', resource: 'maintenance', allowed: true },
    { action: 'read', resource: 'maintenance', allowed: true },
    { action: 'update', resource: 'maintenance', allowed: true },
    { action: 'delete', resource: 'maintenance', allowed: false },
    
    // Documents
    { action: 'create', resource: 'documents', allowed: true },
    { action: 'read', resource: 'documents', allowed: true },
    { action: 'update', resource: 'documents', allowed: true },
    { action: 'delete', resource: 'documents', allowed: false },
    
    // Messages
    { action: 'create', resource: 'messages', allowed: true },
    { action: 'read', resource: 'messages', allowed: true },
    { action: 'update', resource: 'messages', allowed: true },
    { action: 'delete', resource: 'messages', allowed: false },
    
    // Configuration (lecture seule)
    { action: 'read', resource: 'settings', allowed: true },
    { action: 'update', resource: 'settings', allowed: false },
    
    // Rapports
    { action: 'read', resource: 'reports', allowed: true },
    { action: 'export', resource: 'reports', allowed: false },
  ],
  
  technician: [
    // Gestion des utilisateurs (pas d'accès)
    { action: 'read', resource: 'users', allowed: false },
    { action: 'create', resource: 'users', allowed: false },
    { action: 'update', resource: 'users', allowed: false },
    { action: 'delete', resource: 'users', allowed: false },
    { action: 'invite', resource: 'users', allowed: false },
    
    // Équipements (lecture et diagnostic)
    { action: 'create', resource: 'equipment', allowed: false },
    { action: 'read', resource: 'equipment', allowed: true },
    { action: 'update', resource: 'equipment', allowed: false },
    { action: 'delete', resource: 'equipment', allowed: false },
    
    // Commandes (lecture seule)
    { action: 'create', resource: 'orders', allowed: false },
    { action: 'read', resource: 'orders', allowed: true },
    { action: 'update', resource: 'orders', allowed: false },
    { action: 'delete', resource: 'orders', allowed: false },
    
    // Maintenance (interventions)
    { action: 'create', resource: 'maintenance', allowed: true },
    { action: 'read', resource: 'maintenance', allowed: true },
    { action: 'update', resource: 'maintenance', allowed: true },
    { action: 'delete', resource: 'maintenance', allowed: false },
    
    // Documents (lecture)
    { action: 'create', resource: 'documents', allowed: false },
    { action: 'read', resource: 'documents', allowed: true },
    { action: 'update', resource: 'documents', allowed: false },
    { action: 'delete', resource: 'documents', allowed: false },
    
    // Messages (techniques)
    { action: 'create', resource: 'messages', allowed: true },
    { action: 'read', resource: 'messages', allowed: true },
    { action: 'update', resource: 'messages', allowed: false },
    { action: 'delete', resource: 'messages', allowed: false },
    
    // Configuration (pas d'accès)
    { action: 'read', resource: 'settings', allowed: false },
    { action: 'update', resource: 'settings', allowed: false },
    
    // Rapports (techniques)
    { action: 'read', resource: 'reports', allowed: true },
    { action: 'export', resource: 'reports', allowed: false },
  ],
  
  viewer: [
    // Gestion des utilisateurs (pas d'accès)
    { action: 'read', resource: 'users', allowed: false },
    { action: 'create', resource: 'users', allowed: false },
    { action: 'update', resource: 'users', allowed: false },
    { action: 'delete', resource: 'users', allowed: false },
    { action: 'invite', resource: 'users', allowed: false },
    
    // Équipements (lecture seule)
    { action: 'create', resource: 'equipment', allowed: false },
    { action: 'read', resource: 'equipment', allowed: true },
    { action: 'update', resource: 'equipment', allowed: false },
    { action: 'delete', resource: 'equipment', allowed: false },
    
    // Commandes (lecture seule)
    { action: 'create', resource: 'orders', allowed: false },
    { action: 'read', resource: 'orders', allowed: true },
    { action: 'update', resource: 'orders', allowed: false },
    { action: 'delete', resource: 'orders', allowed: false },
    
    // Maintenance (lecture seule)
    { action: 'create', resource: 'maintenance', allowed: false },
    { action: 'read', resource: 'maintenance', allowed: true },
    { action: 'update', resource: 'maintenance', allowed: false },
    { action: 'delete', resource: 'maintenance', allowed: false },
    
    // Documents (lecture seule)
    { action: 'create', resource: 'documents', allowed: false },
    { action: 'read', resource: 'documents', allowed: true },
    { action: 'update', resource: 'documents', allowed: false },
    { action: 'delete', resource: 'documents', allowed: false },
    
    // Messages (lecture seule)
    { action: 'create', resource: 'messages', allowed: false },
    { action: 'read', resource: 'messages', allowed: true },
    { action: 'update', resource: 'messages', allowed: false },
    { action: 'delete', resource: 'messages', allowed: false },
    
    // Configuration (pas d'accès)
    { action: 'read', resource: 'settings', allowed: false },
    { action: 'update', resource: 'settings', allowed: false },
    
    // Rapports (lecture basique)
    { action: 'read', resource: 'reports', allowed: true },
    { action: 'export', resource: 'reports', allowed: false },
  ],
};

// Récupérer le rôle de l'utilisateur connecté
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userRole } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return userRole?.role || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return null;
  }
}

// Récupérer les permissions complètes de l'utilisateur
export async function getUserPermissions(): Promise<UserPermissions | null> {
  try {
    const role = await getUserRole();
    if (!role) return null;

    const permissions = ROLE_PERMISSIONS[role] || [];
    
    return {
      role,
      permissions,
      isAdmin: role === 'admin',
      isManager: role === 'manager',
      isTechnician: role === 'technician',
      isViewer: role === 'viewer',
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    return null;
  }
}

// Vérifier si l'utilisateur peut effectuer une action
export async function canPerformAction(action: string, resource: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    if (!permissions) return false;

    const permission = permissions.permissions.find(
      p => p.action === action && p.resource === resource
    );

    return permission?.allowed || false;
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return false;
  }
}

// Vérifier si l'utilisateur est administrateur
export async function isAdmin(): Promise<boolean> {
  const permissions = await getUserPermissions();
  return permissions?.isAdmin || false;
}

// Vérifier si l'utilisateur peut inviter des utilisateurs
export async function canInviteUsers(): Promise<boolean> {
  return canPerformAction('invite', 'users');
}

// Vérifier si l'utilisateur peut gérer les équipements
export async function canManageEquipment(): Promise<boolean> {
  return canPerformAction('create', 'equipment');
}

// Vérifier si l'utilisateur peut gérer les commandes
export async function canManageOrders(): Promise<boolean> {
  return canPerformAction('create', 'orders');
}

// Vérifier si l'utilisateur peut gérer la maintenance
export async function canManageMaintenance(): Promise<boolean> {
  return canPerformAction('create', 'maintenance');
}

// Vérifier si l'utilisateur peut gérer les documents
export async function canManageDocuments(): Promise<boolean> {
  return canPerformAction('create', 'documents');
}

// Vérifier si l'utilisateur peut envoyer des messages
export async function canSendMessages(): Promise<boolean> {
  return canPerformAction('create', 'messages');
}

// Vérifier si l'utilisateur peut accéder aux paramètres
export async function canAccessSettings(): Promise<boolean> {
  return canPerformAction('read', 'settings');
}

// Vérifier si l'utilisateur peut exporter des rapports
export async function canExportReports(): Promise<boolean> {
  return canPerformAction('export', 'reports');
}

// Hook React pour utiliser les permissions
export function usePermissions() {
  const [permissions, setPermissions] = React.useState<UserPermissions | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadPermissions() {
      try {
        const userPermissions = await getUserPermissions();
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Erreur lors du chargement des permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, []);

  return { permissions, loading };
} 