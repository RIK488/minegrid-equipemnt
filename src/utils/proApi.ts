import supabase from './supabaseClient';

// =====================================================
// TYPES POUR LE SERVICE PRO
// =====================================================

export interface ProClient {
  id: string;
  user_id: string;
  company_name: string;
  siret?: string;
  address?: string;
  phone?: string;
  contact_person?: string;
  subscription_type: 'pro' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended';
  subscription_start: string;
  subscription_end?: string;
  max_users: number;
  created_at: string;
  updated_at: string;
}

export interface ClientEquipment {
  id: string;
  client_id: string;
  serial_number: string;
  qr_code: string;
  equipment_type: string;
  brand?: string;
  model?: string;
  year?: number;
  location?: string;
  status: 'active' | 'maintenance' | 'inactive' | 'sold';
  purchase_date?: string;
  warranty_end?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  total_hours: number;
  fuel_consumption?: number;
  description?: string;
  notes?: string;
  price?: number;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientOrder {
  id: string;
  client_id: string;
  order_number: string;
  order_type: 'purchase' | 'rental' | 'maintenance' | 'import';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount?: number;
  currency: string;
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicalDocument {
  id: string;
  client_id: string;
  equipment_id?: string;
  document_type: 'manual' | 'certificate' | 'warranty' | 'invoice' | 'maintenance_report';
  title: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  is_public: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceIntervention {
  id: string;
  client_id: string;
  equipment_id: string;
  intervention_type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  description?: string;
  scheduled_date: string;
  actual_date?: string;
  duration_hours?: number;
  technician_name?: string;
  cost?: number;
  parts_used?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentDiagnostic {
  id: string;
  equipment_id: string;
  diagnostic_date: string;
  diagnostic_type?: string;
  status?: 'good' | 'warning' | 'critical' | 'failed';
  readings?: any;
  recommendations?: string;
  next_diagnostic_date?: string;
  created_at: string;
}

export interface ClientUser {
  id: string;
  client_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  permissions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientNotification {
  id: string;
  client_id: string;
  user_id: string;
  type: 'maintenance_due' | 'order_update' | 'diagnostic_alert' | 'warranty_expiry';
  title: string;
  message: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

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
      .select('*')
      .eq('id', user.id)
      .single();

    // Récupérer le profil Pro spécifique
    const { data: proProfile, error } = await supabase
      .from('pro_clients')
      .select('*')
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
      .select('*')
      .eq('sellerid', user.id)
      .order('created_at', { ascending: false });

    if (machinesError) {
      console.error('❌ Erreur lors de la récupération des machines:', machinesError);
      return [];
    }

    // Récupérer les détails Pro pour ces machines
    const machineIds = machines?.map(m => m.id) || [];
    const { data: proDetails, error: proError } = await supabase
      .from('pro_equipment_details')
      .select('*')
      .in('machine_id', machineIds)
      .eq('user_id', user.id);

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
      .select('*')
      .or(`serial_number.eq.${identifier},qr_code.eq.${identifier}`)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'équipement:', error);
    return null;
  }
}

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
      .select('*')
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

// =====================================================
// FONCTIONS API DOCUMENTS TECHNIQUES
// =====================================================

// Récupérer tous les documents techniques
export async function getTechnicalDocuments(): Promise<TechnicalDocument[]> {
  try {
    const { data, error } = await supabase
      .from('technical_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return [];
  }
}

// Uploader un document technique
export async function uploadTechnicalDocument(
  file: File, 
  document: Partial<TechnicalDocument>
): Promise<TechnicalDocument | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Upload du fichier
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('technical-documents')
      .upload(`${user.id}/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Créer l'entrée dans la base de données
    const { data, error } = await supabase
      .from('technical_documents')
      .insert({
        ...document,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    return null;
  }
}

// =====================================================
// FONCTIONS API MAINTENANCE
// =====================================================

// Récupérer toutes les interventions de maintenance
export async function getMaintenanceInterventions(): Promise<MaintenanceIntervention[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Récupération des interventions de maintenance Pro pour l\'utilisateur:', user.id);

    // Récupérer le profil Pro pour obtenir le client_id
    const proProfile = await getProClientProfile();
    if (!proProfile) {
      console.log('⚠️ Aucun profil Pro trouvé, création d\'interventions de démonstration...');
      
      // Créer des interventions de démonstration
      const demoInterventions: Partial<MaintenanceIntervention>[] = [
        {
          client_id: proProfile?.id || user.id,
          equipment_id: 'demo-equipment-1',
          intervention_type: 'preventive',
          status: 'scheduled',
          priority: 'normal',
          description: 'Maintenance préventive annuelle',
          scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          technician_name: 'Ahmed Benali',
          cost: 2500,
          notes: 'Vérification générale et changement d\'huile'
        },
        {
          client_id: proProfile?.id || user.id,
          equipment_id: 'demo-equipment-2',
          intervention_type: 'corrective',
          status: 'in_progress',
          priority: 'high',
          description: 'Réparation système hydraulique',
          scheduled_date: new Date().toISOString(),
          actual_date: new Date().toISOString(),
          technician_name: 'Mohammed Tazi',
          cost: 8500,
          notes: 'Remplacement de la pompe hydraulique'
        }
      ];

      const { data: newInterventions, error: createError } = await supabase
        .from('maintenance_interventions')
        .insert(demoInterventions)
        .select();

      if (createError) throw createError;
      
      console.log('✅ Interventions de démonstration créées:', newInterventions);
      return newInterventions || [];
    }

    // Récupérer les interventions du client
    const { data, error } = await supabase
      .from('maintenance_interventions')
      .select(`
        *,
        client_equipment (
          serial_number,
          equipment_type,
          brand,
          model
        )
      `)
      .eq('client_id', proProfile.id)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    
    console.log('✅ Interventions Pro récupérées:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des interventions Pro:', error);
    return [];
  }
}

// Créer une nouvelle intervention
export async function createMaintenanceIntervention(
  intervention: Partial<MaintenanceIntervention>
): Promise<MaintenanceIntervention | null> {
  try {
    const { data, error } = await supabase
      .from('maintenance_interventions')
      .insert(intervention)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    return null;
  }
}

// =====================================================
// FONCTIONS API DIAGNOSTICS
// =====================================================

// Récupérer les diagnostics d'un équipement
export async function getEquipmentDiagnostics(equipmentId: string): Promise<EquipmentDiagnostic[]> {
  try {
    const { data, error } = await supabase
      .from('equipment_diagnostics')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('diagnostic_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des diagnostics:', error);
    return [];
  }
}

// Ajouter un nouveau diagnostic
export async function addEquipmentDiagnostic(
  diagnostic: Partial<EquipmentDiagnostic>
): Promise<EquipmentDiagnostic | null> {
  try {
    const { data, error } = await supabase
      .from('equipment_diagnostics')
      .insert(diagnostic)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du diagnostic:', error);
    return null;
  }
}

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
      .select('*')
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

// =====================================================
// FONCTIONS API UTILISATEURS CLIENTS
// =====================================================

// Récupérer les utilisateurs d'un client
export async function getClientUsers(): Promise<ClientUser[]> {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
}

// Inviter un nouvel utilisateur
export async function inviteClientUser(email: string, role: string): Promise<boolean> {
  try {
    // Créer l'utilisateur dans Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'temp-password-' + Math.random().toString(36).substring(7),
      email_confirm: true
    });

    if (authError) throw authError;
    if (!user) throw new Error('Utilisateur non créé');

    // Ajouter l'utilisateur au client
    const { error: clientError } = await supabase
      .from('client_users')
      .insert({
        user_id: user.id,
        role
      });

    if (clientError) throw clientError;

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
    return false;
  }
}

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
      .select('*')
      .eq('sellerid', user.id)
      .order('created_at', { ascending: false });

    if (machinesError) {
      console.error('❌ Erreur lors de la récupération des machines:', machinesError);
      return [];
    }

    // Récupérer les détails Pro pour ces machines (pour tous les utilisateurs)
    const machineIds = machines?.map(m => m.id) || [];
    const { data: proDetails, error: proError } = await supabase
      .from('pro_equipment_details')
      .select('*')
      .in('machine_id', machineIds);

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
      .select('*')
      .order('created_at', { ascending: false });

    if (machinesError) {
      console.error('❌ Erreur lors de la récupération des machines:', machinesError);
      return [];
    }

    // Récupérer tous les détails Pro
    const { data: proDetails, error: proError } = await supabase
      .from('pro_equipment_details')
      .select('*');

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

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

// Générer un QR code pour un équipement
export function generateQRCode(serialNumber: string): string {
  return `MINE-${serialNumber}-${Date.now()}`;
}

// Vérifier si l'utilisateur a un abonnement Pro actif
export async function hasActiveProSubscription(): Promise<boolean> {
  try {
    const profile = await getProClientProfile();
    return profile?.subscription_status === 'active';
  } catch (error) {
    return false;
  }
}

// Récupérer les statistiques du portail
export async function getPortalStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    console.log('🔄 Calcul des statistiques Pro pour l\'utilisateur:', user.id);

    const [equipment, userMachines, orders, interventions, notifications] = await Promise.all([
      getClientEquipment(),
      getUserMachines(),
      getClientOrders(),
      getMaintenanceInterventions(),
      getClientNotifications()
    ]);

    // Calculer des statistiques avancées avec données réelles
    const totalEquipment = equipment.length + userMachines.length;
    const activeEquipment = equipment.filter(e => e.status === 'active').length + userMachines.length;
    const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const upcomingInterventions = interventions.filter(i => 
      i.status === 'scheduled' && new Date(i.scheduled_date) > new Date()
    ).length;
    const inProgressInterventions = interventions.filter(i => i.status === 'in_progress').length;
    const unreadNotifications = notifications.filter(n => !n.is_read).length;
    const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.is_read).length;

    // Calculer le taux d'utilisation des équipements
    const totalHours = equipment.reduce((sum, e) => sum + e.total_hours, 0);
    const averageHours = totalEquipment > 0 ? Math.round(totalHours / totalEquipment) : 0;

    // Calculer le montant total des commandes
    const totalOrderAmount = orders
      .filter(o => o.total_amount)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Calculer le coût total des interventions
    const totalInterventionCost = interventions
      .filter(i => i.cost)
      .reduce((sum, i) => sum + (i.cost || 0), 0);

    // Calculer les équipements ajoutés ce mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const equipmentThisMonth = equipment.filter(e => new Date(e.created_at) >= monthStart).length;
    const machinesThisMonth = userMachines.filter(m => new Date(m.created_at) >= monthStart).length;
    const totalThisMonth = equipmentThisMonth + machinesThisMonth;

    const stats = {
      totalEquipment,
      activeEquipment,
      maintenanceEquipment,
      pendingOrders,
      confirmedOrders,
      upcomingInterventions,
      inProgressInterventions,
      unreadNotifications,
      urgentNotifications,
      averageHours,
      totalOrderAmount,
      totalInterventionCost,
      equipmentUtilizationRate: totalEquipment > 0 ? Math.round((activeEquipment / totalEquipment) * 100) : 0,
      equipmentThisMonth: totalThisMonth,
      userMachines: userMachines.length,
      proEquipment: equipment.length
    };

    console.log('✅ Statistiques Pro calculées avec données réelles:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques Pro:', error);
    return {
      totalEquipment: 0,
      activeEquipment: 0,
      maintenanceEquipment: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      upcomingInterventions: 0,
      inProgressInterventions: 0,
      unreadNotifications: 0,
      urgentNotifications: 0,
      averageHours: 0,
      totalOrderAmount: 0,
      totalInterventionCost: 0,
      equipmentUtilizationRate: 0,
      equipmentThisMonth: 0,
      userMachines: 0,
      proEquipment: 0
    };
  }
} 