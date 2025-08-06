import supabase from './supabaseClient';
// -------------------- AUTH --------------------
export async function registerUser(data) {
    const { email, password, ...metadata } = data;
    const { data: response, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    });
    if (error)
        throw error;
    return response;
}
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error)
        throw error;
    return data;
}
export async function logoutUser() {
    await supabase.auth.signOut();
}
export async function getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error)
        throw error;
    if (!session || !session.user)
        throw new Error("Session manquante !");
    return session.user;
}
// -------------------- MACHINES --------------------
export async function publishMachine(machineData, images) {
    const uploadedImageURLs = [];
    for (const file of images) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase
            .storage
            .from('machine-image')
            .upload(fileName, file);
        if (uploadError)
            throw uploadError;
        const { data: publicUrlData } = supabase
            .storage
            .from('machine-image')
            .getPublicUrl(fileName);
        uploadedImageURLs.push(fileName);
    }
    console.log("PAYLOAD ENVOYÉ :", {
        ...machineData,
        images: uploadedImageURLs
    });
    const { data, error } = await supabase
        .from('machines')
        .insert([{ ...machineData, images: uploadedImageURLs }]);
    if (error)
        throw error;
    return data;
}
export async function getSellerMachines() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('sellerid', user.id);
    if (error)
        throw error;
    return data;
}
// -------------------- STATISTIQUES --------------------
export async function recordMachineView(machineId) {
    const user = await getCurrentUser();
    const viewData = {
        machine_id: machineId,
        viewer_id: user?.id || null,
        ip_address: 'client-ip', // En production, récupérer l'IP réelle
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
    };
    const { error } = await supabase
        .from('machine_views')
        .insert([viewData]);
    if (error) {
        console.error('Erreur enregistrement vue:', error);
    }
}
export async function getDashboardStats() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    // Récupérer les IDs des machines du vendeur
    const { data: machines } = await supabase
        .from('machines')
        .select('id')
        .eq('sellerId', user.id);
    const machineIds = machines?.map(m => m.id) || [];
    if (machineIds.length === 0) {
        return {
            totalViews: 0,
            totalMessages: 0,
            totalOffers: 0,
            weeklyViews: 0,
            monthlyViews: 0,
            weeklyGrowth: 0,
            monthlyGrowth: 0
        };
    }
    // Calculer les dates
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    // Vues totales
    const { count: totalViews } = await supabase
        .from('machine_views')
        .select('*', { count: 'exact', head: true })
        .in('machine_id', machineIds);
    // Vues cette semaine
    const { count: weeklyViews } = await supabase
        .from('machine_views')
        .select('*', { count: 'exact', head: true })
        .in('machine_id', machineIds)
        .gte('created_at', weekAgo.toISOString());
    // Vues ce mois
    const { count: monthlyViews } = await supabase
        .from('machine_views')
        .select('*', { count: 'exact', head: true })
        .in('machine_id', machineIds)
        .gte('created_at', monthAgo.toISOString());
    // Vues semaine précédente (pour calculer la croissance)
    const { count: previousWeekViews } = await supabase
        .from('machine_views')
        .select('*', { count: 'exact', head: true })
        .in('machine_id', machineIds)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());
    // Vues mois précédent
    const { count: previousMonthViews } = await supabase
        .from('machine_views')
        .select('*', { count: 'exact', head: true })
        .in('machine_id', machineIds)
        .gte('created_at', twoMonthsAgo.toISOString())
        .lt('created_at', monthAgo.toISOString());
    // Messages reçus
    const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id);
    // Offres reçues
    const { count: totalOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id);
    // Calculer les pourcentages de croissance
    const weeklyGrowth = previousWeekViews && previousWeekViews > 0
        ? Math.round(((weeklyViews || 0) - previousWeekViews) / previousWeekViews * 100)
        : 0;
    const monthlyGrowth = previousMonthViews && previousMonthViews > 0
        ? Math.round(((monthlyViews || 0) - previousMonthViews) / previousMonthViews * 100)
        : 0;
    return {
        totalViews: totalViews || 0,
        totalMessages: totalMessages || 0,
        totalOffers: totalOffers || 0,
        weeklyViews: weeklyViews || 0,
        monthlyViews: monthlyViews || 0,
        weeklyGrowth,
        monthlyGrowth
    };
}
export async function getWeeklyActivityData() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data: machines } = await supabase
        .from('machines')
        .select('id')
        .eq('sellerid', user.id);
    const machineIds = machines?.map(m => m.id) || [];
    if (machineIds.length === 0) {
        return Array(7).fill(0);
    }
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: views } = await supabase
        .from('machine_views')
        .select('created_at')
        .in('machine_id', machineIds)
        .gte('created_at', weekAgo.toISOString());
    // Grouper par jour
    const dailyViews = Array(7).fill(0);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    views?.forEach(view => {
        const date = new Date(view.created_at);
        const dayIndex = date.getDay();
        dailyViews[dayIndex]++;
    });
    return dailyViews;
}
// -------------------- MESSAGES --------------------
export async function getMessages() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('messages')
        .select(`
      *,
      sender:profiles!messages_sender_id_fkey(firstname, lastname),
      receiver:profiles!messages_receiver_id_fkey(firstname, lastname)
    `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function sendMessage(messageData) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('messages')
        .insert([{
            sender_id: user.id,
            ...messageData,
            is_read: false,
            created_at: new Date().toISOString()
        }]);
    if (error)
        throw error;
    return data;
}
export async function markMessageAsRead(messageId) {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    if (error)
        throw error;
}
// -------------------- OFFRES --------------------
export async function getOffers() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('offers')
        .select(`
      *,
      buyer:profiles!offers_buyer_id_fkey(firstname, lastname),
      machine:machines(name, brand, model)
    `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function createOffer(offerData) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('offers')
        .insert([{
            buyer_id: user.id,
            ...offerData,
            status: 'pending',
            created_at: new Date().toISOString()
        }]);
    if (error)
        throw error;
    return data;
}
export async function updateOfferStatus(offerId, status) {
    const { data, error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', offerId);
    if (error)
        throw error;
    return data;
}
// -------------------- PROFIL UTILISATEUR --------------------
export async function getUserProfile() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error; // PGRST116 = no rows returned
    return data;
}
export async function updateUserProfile(profileData) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
    });
    if (error)
        throw error;
    return data;
}
export async function uploadProfilePicture(file) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const fileName = `profile_${user.id}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase
        .storage
        .from('profile-pictures')
        .upload(fileName, file);
    if (uploadError)
        throw uploadError;
    const { data: publicUrlData } = supabase
        .storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
    // Mettre à jour le profil avec la nouvelle photo
    await updateUserProfile({ profile_picture: fileName });
    return fileName;
}
export async function changePassword(currentPassword, newPassword) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    // Vérifier l'ancien mot de passe
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });
    if (signInError)
        throw new Error('Mot de passe actuel incorrect');
    // Changer le mot de passe
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });
    if (error)
        throw error;
    return { success: true };
}
// -------------------- PRÉFÉRENCES UTILISATEUR --------------------
export async function getUserPreferences() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data;
}
export async function updateUserPreferences(preferencesData) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
        user_id: user.id,
        ...preferencesData,
        updated_at: new Date().toISOString()
    });
    if (error)
        throw error;
    return data;
}
export async function updateNotificationSettings(settings) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const currentPrefs = await getUserPreferences();
    const defaultEmailNotifications = {
        views: true,
        messages: true,
        offers: true,
        expired: false,
        newsletter: false
    };
    const updatedPrefs = {
        ...currentPrefs,
        email_notifications: {
            ...defaultEmailNotifications,
            ...currentPrefs?.email_notifications,
            ...settings.email_notifications
        },
        notification_frequency: settings.notification_frequency || currentPrefs?.notification_frequency || 'immediate',
        notification_hours: settings.notification_hours || currentPrefs?.notification_hours || { start: '08:00', end: '20:00' },
        updated_at: new Date().toISOString()
    };
    return await updateUserPreferences(updatedPrefs);
}
// -------------------- NOTIFICATIONS --------------------
export async function getNotifications() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error)
        throw error;
    return data || [];
}
export async function markNotificationAsRead(notificationId) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    if (error)
        throw error;
    return data;
}
export async function markAllNotificationsAsRead() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    if (error)
        throw error;
    return data;
}
export async function createNotification(notificationData) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            user_id: user.id,
            ...notificationData,
            is_read: false,
            created_at: new Date().toISOString()
        }]);
    if (error)
        throw error;
    return data;
}
// -------------------- SERVICES PREMIUM --------------------
export async function getPremiumService() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('premium_services')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
    if (error && error.code !== 'PGRST116')
        throw error;
    return data;
}
export async function requestPremiumService(serviceType) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const serviceData = {
        user_id: user.id,
        service_type: serviceType,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        features: serviceType === 'premium'
            ? ['Annonces prioritaires', 'Statistiques avancées', 'Support prioritaire']
            : ['Tout du Premium', 'API personnalisée', 'Gestionnaire dédié', 'Formation incluse'],
        price: serviceType === 'premium' ? 99 : 299
    };
    const { data, error } = await supabase
        .from('premium_services')
        .insert([serviceData]);
    if (error)
        throw error;
    // Créer une notification
    await createNotification({
        type: 'premium',
        title: 'Service Premium activé',
        content: `Votre service ${serviceType} a été activé avec succès !`
    });
    return data;
}
export async function cancelPremiumService() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('premium_services')
        .update({
        status: 'cancelled',
        end_date: new Date().toISOString()
    })
        .eq('user_id', user.id)
        .eq('status', 'active');
    if (error)
        throw error;
    // Créer une notification
    await createNotification({
        type: 'premium',
        title: 'Service Premium annulé',
        content: 'Votre service premium a été annulé. Il restera actif jusqu\'à la fin de la période payée.'
    });
    return data;
}
export async function getServiceHistory() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('service_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
    if (error)
        throw error;
    return data || [];
}
export async function logServiceAction(action, description, serviceType) {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    const { data, error } = await supabase
        .from('service_history')
        .insert([{
            user_id: user.id,
            service_type: serviceType || 'general',
            action,
            description,
            created_at: new Date().toISOString()
        }]);
    if (error)
        throw error;
    return data;
}
// -------------------- SESSIONS ACTIVES --------------------
export async function getActiveSessions() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    // En production, vous auriez une table sessions
    // Pour l'instant, on simule avec des données
    return [
        {
            id: 'current',
            device: 'Chrome sur Windows',
            location: 'Paris, France',
            last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
            is_current: true
        },
        {
            id: 'mobile',
            device: 'Safari sur iPhone',
            location: 'Lyon, France',
            last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1j ago
            is_current: false
        }
    ];
}
export async function revokeSession(sessionId) {
    // En production, vous supprimeriez la session de la base de données
    console.log(`Session ${sessionId} révoquée`);
    return { success: true };
}
// -------------------- UTILITAIRES --------------------
export async function deleteUserAccount() {
    const user = await getCurrentUser();
    if (!user)
        throw new Error('Utilisateur non connecté');
    // Supprimer toutes les données utilisateur
    await supabase.from('user_profiles').delete().eq('id', user.id);
    await supabase.from('user_preferences').delete().eq('user_id', user.id);
    await supabase.from('notifications').delete().eq('user_id', user.id);
    await supabase.from('premium_services').delete().eq('user_id', user.id);
    await supabase.from('service_history').delete().eq('user_id', user.id);
    // Supprimer le compte Supabase
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error)
        throw error;
    return { success: true };
}
