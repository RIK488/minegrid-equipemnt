import { CLIENT_EQUIPMENT_TABLE_COLUMNS, CLIENT_ORDER_COLUMNS, MAINTENANCE_INTERVENTION_FLAT_COLUMNS, PRO_CLIENT_COLUMNS, TECHNICAL_DOCUMENT_COLUMNS, USER_SETTINGS_COLUMNS } from '../../constants/proClientQueryFields';
import type { UserSettings } from './types';
import supabase from '../supabaseClient';

// =====================================================
// FONCTIONS DE CONFIGURATION
// =====================================================

export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select(USER_SETTINGS_COLUMNS)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return null;
    }

    if (!data) {
      // Créer des paramètres par défaut
      const defaultSettings: Partial<UserSettings> = {
        user_id: user.id,
        notifications: {
          email: true,
          push: true,
          maintenance: true,
          orders: true,
          security: true
        },
        security: {
          twoFactor: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAttempts: 5
        }
      };

      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création des paramètres par défaut:', createError);
        return null;
      }

      return newSettings;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return null;
  }
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return null;
  }
}

export async function exportUserData(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Récupérer toutes les données de l'utilisateur
    const [
      profileResult,
      equipmentResult,
      ordersResult,
      interventionsResult,
      documentsResult
    ] = await Promise.all([
      supabase
        .from('pro_clients')
        .select(PRO_CLIENT_COLUMNS)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('client_equipment')
        .select(CLIENT_EQUIPMENT_TABLE_COLUMNS)
        .eq('client_id', user.id),
      supabase
        .from('client_orders')
        .select(CLIENT_ORDER_COLUMNS)
        .eq('client_id', user.id),
      supabase
        .from('maintenance_interventions')
        .select(MAINTENANCE_INTERVENTION_FLAT_COLUMNS)
        .eq('client_id', user.id),
      supabase
        .from('technical_documents')
        .select(TECHNICAL_DOCUMENT_COLUMNS)
        .eq('client_id', user.id)
    ]);

    const exportData = {
      profile: profileResult.data,
      equipment: equipmentResult.data,
      orders: ordersResult.data,
      interventions: interventionsResult.data,
      documents: documentsResult.data,
      exportDate: new Date().toISOString()
    };

    // Créer un fichier JSON téléchargeable
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error);
    return null;
  }
}

export async function deleteUserAccount(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Supprimer toutes les données de l'utilisateur
    const tables = [
      'pro_clients',
      'client_equipment',
      'client_orders',
      'maintenance_interventions',
      'technical_documents',
      'client_notifications',
      'client_users',
      'user_settings'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error(`Erreur lors de la suppression de ${table}:`, error);
      }
    }

    // Supprimer le compte utilisateur
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Erreur lors de la suppression du compte:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return false;
  }
}
