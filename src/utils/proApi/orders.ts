import { CLIENT_ORDER_COLUMNS } from '../../constants/proClientQueryFields';
import type { ClientOrder } from './types';
import supabase from '../supabaseClient';
import { getProClientProfile } from './profile';

// =====================================================
// FONCTIONS API COMMANDES
// =====================================================

// Récupérer toutes les commandes d'un client
export async function getClientOrders(): Promise<ClientOrder[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération des commandes Pro pour l\'utilisateur:', user.id);

    // Récupérer le profil Pro pour obtenir le client_id
    const proProfile = await getProClientProfile();
    if (!proProfile) {
      console.log('⚠️ Aucun profil Pro trouvé, création de commandes de démonstration...');
      
      // Créer des commandes de démonstration
      const demoOrders: Partial<ClientOrder>[] = [
        {
          client_id: proProfile?.id || user.id,
          order_number: 'CMD-2024-001',
          order_type: 'purchase',
          status: 'confirmed',
          total_amount: 125000,
          currency: 'MAD',
          order_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expected_delivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Commande de pièces de rechange'
        },
        {
          client_id: proProfile?.id || user.id,
          order_number: 'CMD-2024-002',
          order_type: 'maintenance',
          status: 'pending',
          total_amount: 8500,
          currency: 'MAD',
          order_date: new Date().toISOString(),
          expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Maintenance préventive'
        }
      ];

      const { data: newOrders, error: createError } = await supabase
        .from('client_orders')
        .insert(demoOrders)
        .select();

      if (createError) throw createError;
      
      console.log('✅ Commandes de démonstration créées:', newOrders);
      return newOrders || [];
    }

    // Récupérer les commandes du client
    const { data, error } = await supabase
      .from('client_orders')
      .select(CLIENT_ORDER_COLUMNS)
      .eq('client_id', proProfile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Commandes Pro récupérées:', data?.length || 0);
        return data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes Pro:', error);
    return [];
  }
}

// Créer une nouvelle commande
export async function createClientOrder(order: Partial<ClientOrder>): Promise<ClientOrder | null> {
  try {
    const { data, error } = await supabase
      .from('client_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return null;
  }
}
