import supabase from './supabaseClient';
// =====================================================
// FONCTIONS API PRO CLIENTS
// =====================================================
// Récupérer le profil client pro
export async function getProClientProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            throw new Error('Utilisateur non connecté');
        const { data, error } = await supabase
            .from('pro_clients')
            .select('*')
            .eq('user_id', user.id)
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil pro:', error);
        return null;
    }
}
// Créer ou mettre à jour le profil client pro
export async function upsertProClientProfile(profile) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            throw new Error('Utilisateur non connecté');
        const { data, error } = await supabase
            .from('pro_clients')
            .upsert({
            user_id: user.id,
            ...profile
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de la sauvegarde du profil pro:', error);
        return null;
    }
}
// =====================================================
// FONCTIONS API ÉQUIPEMENTS CLIENTS
// =====================================================
// Récupérer tous les équipements d'un client
export async function getClientEquipment() {
    try {
        const { data, error } = await supabase
            .from('client_equipment')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des équipements:', error);
        return [];
    }
}
// Ajouter un nouvel équipement
export async function addClientEquipment(equipment) {
    try {
        const { data, error } = await supabase
            .from('client_equipment')
            .insert(equipment)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de l\'ajout de l\'équipement:', error);
        return null;
    }
}
// Mettre à jour un équipement
export async function updateClientEquipment(id, updates) {
    try {
        const { data, error } = await supabase
            .from('client_equipment')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de l\'équipement:', error);
        return null;
    }
}
// Récupérer un équipement par numéro de série ou QR code
export async function getEquipmentBySerialOrQR(identifier) {
    try {
        const { data, error } = await supabase
            .from('client_equipment')
            .select('*')
            .or(`serial_number.eq.${identifier},qr_code.eq.${identifier}`)
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de la recherche d\'équipement:', error);
        return null;
    }
}
// =====================================================
// FONCTIONS API COMMANDES
// =====================================================
// Récupérer toutes les commandes d'un client
export async function getClientOrders() {
    try {
        const { data, error } = await supabase
            .from('client_orders')
            .select('*')
            .order('order_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return [];
    }
}
// Créer une nouvelle commande
export async function createClientOrder(order) {
    try {
        const { data, error } = await supabase
            .from('client_orders')
            .insert(order)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        return null;
    }
}
// =====================================================
// FONCTIONS API DOCUMENTS TECHNIQUES
// =====================================================
// Récupérer tous les documents techniques
export async function getTechnicalDocuments() {
    try {
        const { data, error } = await supabase
            .from('technical_documents')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        return [];
    }
}
// Uploader un document technique
export async function uploadTechnicalDocument(file, document) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            throw new Error('Utilisateur non connecté');
        // Upload du fichier
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('technical-documents')
            .upload(`${user.id}/${fileName}`, file);
        if (uploadError)
            throw uploadError;
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
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de l\'upload du document:', error);
        return null;
    }
}
// =====================================================
// FONCTIONS API MAINTENANCE
// =====================================================
// Récupérer toutes les interventions de maintenance
export async function getMaintenanceInterventions() {
    try {
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
            .order('scheduled_date', { ascending: true });
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des interventions:', error);
        return [];
    }
}
// Créer une nouvelle intervention
export async function createMaintenanceIntervention(intervention) {
    try {
        const { data, error } = await supabase
            .from('maintenance_interventions')
            .insert(intervention)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'intervention:', error);
        return null;
    }
}
// =====================================================
// FONCTIONS API DIAGNOSTICS
// =====================================================
// Récupérer les diagnostics d'un équipement
export async function getEquipmentDiagnostics(equipmentId) {
    try {
        const { data, error } = await supabase
            .from('equipment_diagnostics')
            .select('*')
            .eq('equipment_id', equipmentId)
            .order('diagnostic_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des diagnostics:', error);
        return [];
    }
}
// Ajouter un nouveau diagnostic
export async function addEquipmentDiagnostic(diagnostic) {
    try {
        const { data, error } = await supabase
            .from('equipment_diagnostics')
            .insert(diagnostic)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        console.error('Erreur lors de l\'ajout du diagnostic:', error);
        return null;
    }
}
// =====================================================
// FONCTIONS API NOTIFICATIONS
// =====================================================
// Récupérer les notifications du client
export async function getClientNotifications() {
    try {
        const { data, error } = await supabase
            .from('client_notifications')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        return [];
    }
}
// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId) {
    try {
        const { error } = await supabase
            .from('client_notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
        return false;
    }
}
// =====================================================
// FONCTIONS API UTILISATEURS CLIENTS
// =====================================================
// Récupérer les utilisateurs d'un client
export async function getClientUsers() {
    try {
        const { data, error } = await supabase
            .from('client_users')
            .select('*')
            .eq('is_active', true);
        if (error)
            throw error;
        return data || [];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return [];
    }
}
// Inviter un nouvel utilisateur
export async function inviteClientUser(email, role) {
    try {
        // Créer l'utilisateur dans Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: 'temp-password-' + Math.random().toString(36).substring(7),
            email_confirm: true
        });
        if (authError)
            throw authError;
        if (!user)
            throw new Error('Utilisateur non créé');
        // Ajouter l'utilisateur au client
        const { error: clientError } = await supabase
            .from('client_users')
            .insert({
            user_id: user.id,
            role
        });
        if (clientError)
            throw clientError;
        return true;
    }
    catch (error) {
        console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
        return false;
    }
}
// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================
// Générer un QR code pour un équipement
export function generateQRCode(serialNumber) {
    return `MINE-${serialNumber}-${Date.now()}`;
}
// Vérifier si l'utilisateur a un abonnement Pro actif
export async function hasActiveProSubscription() {
    try {
        const profile = await getProClientProfile();
        return profile?.subscription_status === 'active';
    }
    catch (error) {
        return false;
    }
}
// Récupérer les statistiques du portail
export async function getPortalStats() {
    try {
        const [equipment, orders, interventions, notifications] = await Promise.all([
            getClientEquipment(),
            getClientOrders(),
            getMaintenanceInterventions(),
            getClientNotifications()
        ]);
        return {
            totalEquipment: equipment.length,
            activeEquipment: equipment.filter(e => e.status === 'active').length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            upcomingInterventions: interventions.filter(i => i.status === 'scheduled' && new Date(i.scheduled_date) > new Date()).length,
            unreadNotifications: notifications.filter(n => !n.is_read).length
        };
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return null;
    }
}
