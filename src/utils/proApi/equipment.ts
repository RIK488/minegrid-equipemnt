import { MACHINE_LIST_COLUMNS, SELLER_MACHINES_MAX_ROWS } from '../../constants/machineQueryFields';
import { CLIENT_EQUIPMENT_TABLE_COLUMNS, PRO_EQUIPMENT_DETAILS_COLUMNS } from '../../constants/proClientQueryFields';
import type { ClientEquipment } from './types';
import supabase from '../supabaseClient';
import { generateQRCode } from './misc';

// =====================================================
// FONCTIONS API ÉQUIPEMENTS CLIENTS
// =====================================================

// Récupérer tous les équipements d'un client (utilise la table machines + pro_equipment_details)
export async function getClientEquipment(): Promise<ClientEquipment[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération des équipements Pro pour l\'utilisateur:', user.id);

    // Récupérer les machines de l'utilisateur depuis la table machines
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select(MACHINE_LIST_COLUMNS)
      .eq('sellerid', user.id)
      .order('created_at', { ascending: false })
      .limit(SELLER_MACHINES_MAX_ROWS);

    if (machinesError) {
      console.error('❌ Erreur lors de la récupération des machines:', machinesError);
      return [];
    }

    // Récupérer les détails Pro pour ces machines
    const machineIds = machines?.map(m => m.id) || [];
    const { data: proDetails, error: proError } =
      machineIds.length > 0
        ? await supabase
            .from('pro_equipment_details')
            .select(PRO_EQUIPMENT_DETAILS_COLUMNS)
            .in('machine_id', machineIds)
            .eq('user_id', user.id)
        : { data: [], error: null };

    if (proError) {
      console.error('❌ Erreur lors de la récupération des détails Pro:', proError);
    }

    // Créer un map des détails Pro par machine_id
    const proDetailsMap = new Map();
    (proDetails || []).forEach(detail => {
      proDetailsMap.set(detail.machine_id, detail);
    });

    // Combiner les données machines et pro_equipment_details
    const equipmentData: ClientEquipment[] = (machines || []).map(machine => {
      const proDetail = proDetailsMap.get(machine.id);
      
              return {
          id: machine.id,
          client_id: machine.sellerid || user.id,
          serial_number: proDetail?.serial_number || machine.name || machine.id,
          qr_code: proDetail?.qr_code || generateQRCode(machine.name || machine.id),
          equipment_type: machine.category || 'Équipement',
          brand: machine.brand || '',
          model: machine.model || '',
          year: machine.year || new Date().getFullYear(),
          location: '', // Pas de colonne location dans machines
          status: 'active', // Pas de colonne status dans machines
          purchase_date: proDetail?.purchase_date || '',
          warranty_end: proDetail?.warranty_end || '',
          last_maintenance: proDetail?.last_maintenance || '',
          next_maintenance: proDetail?.next_maintenance || '',
          total_hours: proDetail?.total_hours || 0,
          fuel_consumption: proDetail?.fuel_consumption || 0,
          description: machine.description || '',
          notes: proDetail?.notes || '',
          price: machine.price || 0,
          images: machine.images || [],
          created_at: machine.created_at,
          updated_at: machine.created_at // Pas de colonne updated_at dans machines
        };
    });
    
    console.log('✅ Équipements Pro récupérés:', equipmentData.length);
    return equipmentData;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des équipements Pro:', error);
    return [];
  }
}

// Ajouter un nouvel équipement (utilise la table client_equipment)
export async function addClientEquipment(equipment: Partial<ClientEquipment>): Promise<ClientEquipment | null> {
  try {
    const { data, error } = await supabase
      .from('client_equipment')
      .insert(equipment)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'équipement:', error);
    return null;
  }
}

// Mettre à jour un équipement (utilise la table machines)
export async function updateClientEquipment(id: string, updates: Partial<ClientEquipment>): Promise<ClientEquipment | null> {
  try {
    // Convertir le format ClientEquipment vers le format machines
    const machineUpdates = {
      name: updates.serial_number,
      category: updates.equipment_type,
      brand: updates.brand,
      model: updates.model,
      year: updates.year,
      location: updates.location,
      status: updates.status,
      total_hours: updates.total_hours,
      fuel_consumption: updates.fuel_consumption,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('machines')
      .update(machineUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'équipement:', error);
    return null;
  }
}

// Récupérer un équipement par numéro de série ou QR code
export async function getEquipmentBySerialOrQR(identifier: string): Promise<ClientEquipment | null> {
  try {
    const { data, error } = await supabase
      .from('client_equipment')
      .select(CLIENT_EQUIPMENT_TABLE_COLUMNS)
      .or(`serial_number.eq.${identifier},qr_code.eq.${identifier}`)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'équipement:', error);
    return null;
  }
}
