import { MACHINES_CATALOG_MAX_ROWS, MACHINE_LIST_COLUMNS, SELLER_MACHINES_MAX_ROWS } from '../../constants/machineQueryFields';
import { PRO_EQUIPMENT_DETAILS_COLUMNS } from '../../constants/proClientQueryFields';
import supabase from '../supabaseClient';

// =====================================================
// FONCTIONS API ANNONCES UTILISATEUR
// =====================================================

// Récupérer les annonces d'équipements de l'utilisateur (avec détails Pro)
export async function getUserMachines(): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération des annonces d\'équipements pour l\'utilisateur:', user.id);

    // Récupérer les machines
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

    // Récupérer les détails Pro pour ces machines (pour tous les utilisateurs)
    const machineIds = machines?.map(m => m.id) || [];
    const { data: proDetails, error: proError } =
      machineIds.length > 0
        ? await supabase
            .from('pro_equipment_details')
            .select(PRO_EQUIPMENT_DETAILS_COLUMNS)
            .in('machine_id', machineIds)
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
    const machinesWithDetails = (machines || []).map(machine => {
      const proDetail = proDetailsMap.get(machine.id);
      
      return {
        ...machine,
        total_hours: proDetail?.total_hours || 0,
        fuel_consumption: proDetail?.fuel_consumption || 0,
        serial_number: proDetail?.serial_number || machine.name,
        purchase_date: proDetail?.purchase_date || null,
        warranty_end: proDetail?.warranty_end || null,
        last_maintenance: proDetail?.last_maintenance || null,
        next_maintenance: proDetail?.next_maintenance || null,
        notes: proDetail?.notes || null
      };
    });

    console.log('✅ Annonces d\'équipements récupérées:', machinesWithDetails.length);
    return machinesWithDetails;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des annonces:', error);
    return [];
  }
}

// =====================================================
// FONCTIONS GÉNÉRIQUES POUR TOUS LES UTILISATEURS
// =====================================================

// Récupérer toutes les machines avec leurs détails Pro (pour tous les utilisateurs)
export async function getAllMachinesWithDetails(): Promise<any[]> {
  try {
    console.log('🔄 Récupération de toutes les machines avec détails Pro');

    // Récupérer toutes les machines
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select(MACHINE_LIST_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(MACHINES_CATALOG_MAX_ROWS);

    if (machinesError) {
      console.error('❌ Erreur lors de la récupération des machines:', machinesError);
      return [];
    }

    // Récupérer tous les détails Pro
    const { data: proDetails, error: proError } = await supabase
      .from('pro_equipment_details')
      .select(PRO_EQUIPMENT_DETAILS_COLUMNS)
      .limit(MACHINES_CATALOG_MAX_ROWS);

    if (proError) {
      console.error('❌ Erreur lors de la récupération des détails Pro:', proError);
    }

    // Créer un map des détails Pro par machine_id
    const proDetailsMap = new Map();
    (proDetails || []).forEach(detail => {
      proDetailsMap.set(detail.machine_id, detail);
    });

    // Combiner les données machines et pro_equipment_details
    const machinesWithDetails = (machines || []).map(machine => {
      const proDetail = proDetailsMap.get(machine.id);
      
      return {
        ...machine,
        total_hours: proDetail?.total_hours || 0,
        fuel_consumption: proDetail?.fuel_consumption || 0,
        serial_number: proDetail?.serial_number || machine.name,
        purchase_date: proDetail?.purchase_date || null,
        warranty_end: proDetail?.warranty_end || null,
        last_maintenance: proDetail?.last_maintenance || null,
        next_maintenance: proDetail?.next_maintenance || null,
        notes: proDetail?.notes || null
      };
    });

    console.log('✅ Toutes les machines récupérées:', machinesWithDetails.length);
    return machinesWithDetails;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de toutes les machines:', error);
    return [];
  }
}
