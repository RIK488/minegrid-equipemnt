import { CLIENT_NOTIFICATION_COLUMNS } from '../../constants/proClientQueryFields';
import type { ClientNotification } from './types';
import supabase from '../supabaseClient';
import { getProClientProfile } from './profile';

// =====================================================
// FONCTIONS API NOTIFICATIONS
// =====================================================

// Récupérer les notifications du client
export async function getClientNotifications(): Promise<ClientNotification[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération des notifications Pro pour l\'utilisateur:', user.id);

    // Récupérer le profil Pro pour obtenir le client_id
    const proProfile = await getProClientProfile();
    if (!proProfile) {
      console.log('⚠️ Aucun profil Pro trouvé, création de notifications de démonstration...');
      
      // Créer des notifications de démonstration
      const demoNotifications: Partial<ClientNotification>[] = [
        {
          client_id: proProfile?.id || user.id,
          user_id: user.id,
          type: 'maintenance_due',
          title: 'Maintenance préventive programmée',
          message: 'La maintenance préventive de l\'équipement DEMO-001 est programmée pour le 15/01/2024',
          is_read: false,
          priority: 'normal',
          related_entity_type: 'equipment',
          related_entity_id: 'demo-equipment-1'
        },
        {
          client_id: proProfile?.id || user.id,
          user_id: user.id,
          type: 'order_update',
          title: 'Commande confirmée',
          message: 'Votre commande CMD-2024-001 a été confirmée et sera livrée le 20/01/2024',
          is_read: true,
          priority: 'low',
          related_entity_type: 'order',
          related_entity_id: 'cmd-2024-001'
        }
      ];

      const { data: newNotifications, error: createError } = await supabase
        .from('client_notifications')
        .insert(demoNotifications)
        .select();

      if (createError) throw createError;
      
      console.log('✅ Notifications de démonstration créées:', newNotifications);
      return newNotifications || [];
    }

    // Récupérer les notifications du client
    const { data, error } = await supabase
      .from('client_notifications')
      .select(CLIENT_NOTIFICATION_COLUMNS)
      .eq('client_id', proProfile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Notifications Pro récupérées:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications Pro:', error);
    return [];
  }
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    return false;
  }
}

// Créer une notification pour un client
export async function createClientNotification(
  notification: Partial<ClientNotification>
): Promise<ClientNotification | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Récupérer le profil Pro pour obtenir le client_id
    const proProfile = await getProClientProfile();
    if (!proProfile) {
      console.error('Aucun profil Pro trouvé');
      return null;
    }

    // Préparer la notification avec les valeurs par défaut
    const newNotification: Partial<ClientNotification> = {
      client_id: proProfile.id,
      user_id: user.id,
      is_read: false,
      priority: 'normal',
      ...notification
    };

    const { data, error } = await supabase
      .from('client_notifications')
      .insert([newNotification])
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Notification créée:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la notification:', error);
    return null;
  }
}

// Créer une notification de maintenance
export async function createMaintenanceNotification(
  equipmentId: string,
  equipmentName: string,
  maintenanceDate: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<ClientNotification | null> {
  return createClientNotification({
    type: 'maintenance_due',
    title: `Maintenance préventive - ${equipmentName}`,
    message: `La maintenance préventive de l'équipement ${equipmentName} est programmée pour le ${maintenanceDate}. Veuillez planifier l'intervention.`,
    priority,
    related_entity_type: 'equipment',
    related_entity_id: equipmentId
  });
}

// Créer une notification de commande
export async function createOrderNotification(
  orderId: string,
  orderNumber: string,
  status: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<ClientNotification | null> {
  return createClientNotification({
    type: 'order_update',
    title: `Commande ${orderNumber} - ${status}`,
    message: `Votre commande ${orderNumber} a été mise à jour avec le statut: ${status}.`,
    priority,
    related_entity_type: 'order',
    related_entity_id: orderId
  });
}

// Créer une notification d'alerte diagnostic
export async function createDiagnosticAlertNotification(
  equipmentId: string,
  equipmentName: string,
  alertMessage: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'high'
): Promise<ClientNotification | null> {
  return createClientNotification({
    type: 'diagnostic_alert',
    title: `Alerte diagnostic - ${equipmentName}`,
    message: `Le diagnostic automatique a détecté: ${alertMessage}`,
    priority,
    related_entity_type: 'equipment',
    related_entity_id: equipmentId
  });
}

// Créer une notification d'expiration de garantie
export async function createWarrantyExpiryNotification(
  equipmentId: string,
  equipmentName: string,
  expiryDate: string,
  daysUntilExpiry: number,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<ClientNotification | null> {
  const urgencyText = daysUntilExpiry <= 7 ? 'URGENT' : daysUntilExpiry <= 30 ? 'PROCHE' : 'INFORMATION';
  
  return createClientNotification({
    type: 'warranty_expiry',
    title: `Garantie ${urgencyText} - ${equipmentName}`,
    message: `La garantie de l'équipement ${equipmentName} expire le ${expiryDate} (dans ${daysUntilExpiry} jours).`,
    priority: daysUntilExpiry <= 7 ? 'urgent' : daysUntilExpiry <= 30 ? 'high' : priority,
    related_entity_type: 'equipment',
    related_entity_id: equipmentId
  });
}

// Supprimer une notification
export async function deleteClientNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return false;
  }
}

// Supprimer toutes les notifications lues
export async function deleteReadNotifications(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_notifications')
      .delete()
      .eq('is_read', true);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des notifications lues:', error);
    return false;
  }
}
