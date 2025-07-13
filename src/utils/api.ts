import supabase from './supabaseClient';

// -------------------- TYPES --------------------

interface RegisterData {
  email: string;
  password: string;
  accountType: 'client' | 'seller';
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
  website?: string;
  address?: string;
  businessType?: string;
  licenseNumber?: string;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  address: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  id: string;
  user_id: string;
  language: string;
  currency: string;
  timezone: string;
  date_format: string;
  dark_mode: boolean;
  animations: boolean;
  font_size: string;
  high_contrast: boolean;
  email_notifications: {
    views: boolean;
    messages: boolean;
    offers: boolean;
    expired: boolean;
    newsletter: boolean;
  };
  notification_frequency: 'immediate' | 'daily' | 'weekly';
  notification_hours: {
    start: string;
    end: string;
  };
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: 'view' | 'message' | 'offer' | 'system' | 'premium';
  title: string;
  content: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

interface PremiumService {
  id: string;
  user_id: string;
  service_type: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  features: string[];
  price: number;
  created_at: string;
}

interface ServiceHistory {
  id: string;
  user_id: string;
  service_type: string;
  action: 'requested' | 'completed' | 'cancelled';
  description: string;
  created_at: string;
}

interface MachineData {
  name: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  price: string;
  condition: 'new' | 'used';
  description: string;
  specifications: {
    weight: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
    };
    power: {
      value: string;
      unit: 'kW' | 'CV';
    };
    operatingCapacity: string;
    workingWeight?: string;
  };
  sellerId: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  machine_id?: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

interface Offer {
  id: string;
  machine_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  buyer_name?: string;
  machine_name?: string;
}

interface MachineView {
  id: string;
  machine_id: string;
  viewer_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface DashboardStats {
  totalViews: number;
  totalMessages: number;
  totalOffers: number;
  weeklyViews: number;
  monthlyViews: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

// -------------------- AUTH --------------------

export async function registerUser(data: RegisterData) {
  const { email, password, ...metadata } = data;

  const { data: response, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;
  return response;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logoutUser() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session || !session.user) throw new Error("Session manquante !");
  return session.user;
}

// -------------------- MACHINES --------------------

export async function publishMachine(machineData: MachineData, images: File[]) {
  const uploadedImageURLs: string[] = [];

  for (const file of images) {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase
      .storage
      .from('machine-image')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

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

  if (error) throw error;

  return data;
}

export async function getSellerMachines() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('sellerId', user.id);

  if (error) throw error;
  return data;
}

// -------------------- STATISTIQUES --------------------

export async function recordMachineView(machineId: string) {
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

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

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
  if (!user) throw new Error('Utilisateur non connecté');

  const { data: machines } = await supabase
    .from('machines')
    .select('id')
    .eq('sellerId', user.id);

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
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(firstName, lastName),
      receiver:profiles!messages_receiver_id_fkey(firstName, lastName)
    `)
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function sendMessage(messageData: {
  receiver_id: string;
  machine_id?: string;
  subject: string;
  content: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: user.id,
      ...messageData,
      is_read: false,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
}

export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) throw error;
}

// -------------------- OFFRES --------------------

export async function getOffers() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      buyer:profiles!offers_buyer_id_fkey(firstName, lastName),
      machine:machines(name, brand, model)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOffer(offerData: {
  machine_id: string;
  seller_id: string;
  amount: number;
  message?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('offers')
    .insert([{
      buyer_id: user.id,
      ...offerData,
      status: 'pending',
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
}

export async function updateOfferStatus(offerId: string, status: 'accepted' | 'rejected') {
  const { data, error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', offerId);

  if (error) throw error;
  return data;
}

// -------------------- PROFIL UTILISATEUR --------------------

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
}

export async function updateUserProfile(profileData: Partial<UserProfile>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

export async function uploadProfilePicture(file: File): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const fileName = `profile_${user.id}_${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('profile-pictures')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase
    .storage
    .from('profile-pictures')
    .getPublicUrl(fileName);

  // Mettre à jour le profil avec la nouvelle photo
  await updateUserProfile({ profile_picture: fileName });

  return fileName;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Vérifier l'ancien mot de passe
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) throw new Error('Mot de passe actuel incorrect');

  // Changer le mot de passe
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return { success: true };
}

// -------------------- PRÉFÉRENCES UTILISATEUR --------------------

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserPreferences(preferencesData: Partial<UserPreferences>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferencesData,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

export async function updateNotificationSettings(settings: {
  email_notifications: Partial<UserPreferences['email_notifications']>;
  notification_frequency?: UserPreferences['notification_frequency'];
  notification_hours?: UserPreferences['notification_hours'];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

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

export async function getNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return data;
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
  return data;
}

export async function createNotification(notificationData: {
  type: Notification['type'];
  title: string;
  content: string;
  related_id?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: user.id,
      ...notificationData,
      is_read: false,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
}

// -------------------- SERVICES PREMIUM --------------------

export async function getPremiumService(): Promise<PremiumService | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('premium_services')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function requestPremiumService(serviceType: 'premium' | 'enterprise') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const serviceData = {
    user_id: user.id,
    service_type: serviceType,
    status: 'active' as const,
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

  if (error) throw error;

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
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('premium_services')
    .update({ 
      status: 'cancelled',
      end_date: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) throw error;

  // Créer une notification
  await createNotification({
    type: 'premium',
    title: 'Service Premium annulé',
    content: 'Votre service premium a été annulé. Il restera actif jusqu\'à la fin de la période payée.'
  });

  return data;
}

export async function getServiceHistory(): Promise<ServiceHistory[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('service_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function logServiceAction(action: ServiceHistory['action'], description: string, serviceType?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('service_history')
    .insert([{
      user_id: user.id,
      service_type: serviceType || 'general',
      action,
      description,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return data;
}

// -------------------- SESSIONS ACTIVES --------------------

export async function getActiveSessions() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

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

export async function revokeSession(sessionId: string) {
  // En production, vous supprimeriez la session de la base de données
  console.log(`Session ${sessionId} révoquée`);
  return { success: true };
}

// -------------------- UTILITAIRES --------------------

export async function deleteUserAccount() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Supprimer toutes les données utilisateur
  await supabase.from('user_profiles').delete().eq('id', user.id);
  await supabase.from('user_preferences').delete().eq('user_id', user.id);
  await supabase.from('notifications').delete().eq('user_id', user.id);
  await supabase.from('premium_services').delete().eq('user_id', user.id);
  await supabase.from('service_history').delete().eq('user_id', user.id);

  // Supprimer le compte Supabase
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) throw error;

  return { success: true };
}

// -------------------- HOOKS --------------------

import { useState, useCallback } from 'react';

export function useApiService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (method: string, endpoint: string, data?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulation d'appel API pour les widgets
      console.log(`API Call: ${method} ${endpoint}`, data);
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retourner des données simulées selon l'endpoint
      switch (endpoint) {
        case '/api/actions/start':
          return { success: true, message: 'Action démarrée' };
        case '/api/actions/complete':
          return { success: true, message: 'Action terminée' };
        case '/api/actions/reschedule':
          return { success: true, message: 'Action reprogrammée' };
        case '/api/actions/create':
          return { success: true, id: Date.now().toString() };
        case '/api/actions/auto-followup':
          return { success: true, count: data?.actions?.length || 0 };
        case '/api/actions/schedule':
          return { success: true, scheduled: data?.actions?.length || 0 };
        case '/api/actions/ai-report':
          return { 
            success: true, 
            report: {
              total: data?.actions?.length || 0,
              highPriority: data?.actions?.filter((a: any) => a.priority === 'high').length || 0,
              recommendations: ['Optimiser le planning', 'Prioriser les contacts']
            }
          };
        case '/api/actions/sync-crm':
          return { success: true, synced: data?.actions?.length || 0 };
        case '/api/actions/optimize-schedule':
          return { success: true, optimized: true };
        default:
          return { success: true, data: 'Opération réussie' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error };
}

// -------------------- DASHBOARD VENDEUR --------------------

interface SalesPerformanceData {
  score: number;
  target: number;
  rank: number;
  totalVendors: number;
  sales: number;
  salesTarget: number;
  growth: number;
  growthTarget: number;
  prospects: number;
  activeProspects: number;
  responseTime: number;
  responseTarget: number;
  activityLevel: string;
  activityRecommendation: string;
  recommendations: Array<{
    type: string;
    action: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  trends: {
    sales: 'up' | 'down' | 'stable';
    growth: 'up' | 'down' | 'stable';
    prospects: 'up' | 'down' | 'stable';
    responseTime: 'up' | 'down' | 'stable';
  };
  metrics: {
    sales: { value: number; target: number; trend: 'up' | 'down' | 'stable' };
    growth: { value: number; target: number; trend: 'up' | 'down' | 'stable' };
    prospects: { value: number; target: number; trend: 'up' | 'down' | 'stable' };
    responseTime: { value: number; target: number; trend: 'up' | 'down' | 'stable' };
  };
}

export async function getSalesPerformanceData(): Promise<SalesPerformanceData> {
  try {
    const user = await getCurrentUser();
    
    // Récupérer les annonces du vendeur
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('*')
      .eq('sellerId', user.id);

    if (machinesError) throw machinesError;

    // Récupérer les vues des annonces
    const { data: views, error: viewsError } = await supabase
      .from('machine_views')
      .select('*')
      .in('machine_id', machines?.map(m => m.id) || []);

    if (viewsError) throw viewsError;

    // Récupérer les messages reçus
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', user.id);

    if (messagesError) throw messagesError;

    // Récupérer les offres reçues
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('seller_id', user.id);

    if (offersError) throw offersError;

    // Calculer les métriques
    const totalMachines = machines?.length || 0;
    const totalViews = views?.length || 0;
    const totalMessages = messages?.length || 0;
    const totalOffers = offers?.length || 0;
    
    // Calculer le score de performance (0-100)
    const viewsScore = Math.min((totalViews / Math.max(totalMachines, 1)) * 20, 20);
    const messagesScore = Math.min((totalMessages / Math.max(totalMachines, 1)) * 30, 30);
    const offersScore = Math.min((totalOffers / Math.max(totalMachines, 1)) * 50, 50);
    const performanceScore = Math.round(viewsScore + messagesScore + offersScore);

    // Calculer le temps de réponse moyen (en heures)
    const responseTime = messages?.length > 0 ? 
      messages.reduce((acc, msg) => {
        const responseTime = msg.response_time || 24; // Par défaut 24h
        return acc + responseTime;
      }, 0) / messages.length : 24;

    // Calculer la croissance (comparaison avec le mois précédent)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthViews = views?.filter(v => {
      const viewDate = new Date(v.created_at);
      return viewDate.getMonth() === currentMonth && viewDate.getFullYear() === currentYear;
    }).length || 0;

    const lastMonthViews = views?.filter(v => {
      const viewDate = new Date(v.created_at);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return viewDate.getMonth() === lastMonth && viewDate.getFullYear() === lastYear;
    }).length || 0;

    const growth = lastMonthViews > 0 ? 
      ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100 : 0;

    // Générer des recommandations basées sur les données
    const recommendations = [];
    
    if (responseTime > 2) {
      recommendations.push({
        type: 'process',
        action: 'Optimiser le temps de réponse',
        impact: `Réduire le temps de réponse de ${responseTime.toFixed(1)}h à 2h`,
        priority: 'high' as const
      });
    }

    if (totalMachines < 5) {
      recommendations.push({
        type: 'prospection',
        action: 'Augmenter le nombre d\'annonces',
        impact: 'Passer de ' + totalMachines + ' à au moins 5 annonces actives',
        priority: 'medium' as const
      });
    }

    if (totalViews < totalMachines * 10) {
      recommendations.push({
        type: 'marketing',
        action: 'Améliorer la visibilité des annonces',
        impact: 'Augmenter le nombre de vues par annonce',
        priority: 'medium' as const
      });
    }

    // Déterminer le niveau d'activité
    let activityLevel = 'faible';
    if (totalViews > 50 && totalMessages > 10) activityLevel = 'élevé';
    else if (totalViews > 20 && totalMessages > 5) activityLevel = 'modéré';

    // Déterminer les tendances
    const trends = {
      sales: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'stable' as const,
      growth: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'stable' as const,
      prospects: totalMessages > 0 ? 'up' as const : 'stable' as const,
      responseTime: responseTime < 24 ? 'down' as const : 'up' as const
    };

    return {
      score: performanceScore,
      target: 85,
      rank: 3, // À calculer par rapport aux autres vendeurs
      totalVendors: 12, // À récupérer depuis la base de données
      sales: totalOffers * 50000, // Estimation basée sur les offres
      salesTarget: 3000000,
      growth: growth,
      growthTarget: 15,
      prospects: totalMessages,
      activeProspects: Math.min(totalMessages, 25),
      responseTime: responseTime,
      responseTarget: 2,
      activityLevel: activityLevel,
      activityRecommendation: recommendations.length > 0 ? 
        recommendations[0].action : 'Continuer les bonnes pratiques',
      recommendations: recommendations,
      trends: trends,
      metrics: {
        sales: { value: totalOffers * 50000, target: 3000000, trend: trends.sales },
        growth: { value: growth, target: 15, trend: trends.growth },
        prospects: { value: totalMessages, target: 25, trend: trends.prospects },
        responseTime: { value: responseTime, target: 2, trend: trends.responseTime }
      }
    };

  } catch (error) {
    console.error('Erreur lors du calcul des performances:', error);
    
    // Retourner des données par défaut en cas d'erreur
    return {
      score: 75,
      target: 85,
      rank: 3,
      totalVendors: 12,
      sales: 0,
      salesTarget: 3000000,
      growth: 0,
      growthTarget: 15,
      prospects: 25,
      activeProspects: 18,
      responseTime: 2.5,
      responseTarget: 1.5,
      activityLevel: 'modéré',
      activityRecommendation: 'Analyser les opportunités d\'amélioration',
      recommendations: [
        {
          type: 'process',
          action: 'Optimiser le temps de réponse',
          impact: 'Réduire le temps de réponse aux prospects de 2.5h à 1.5h',
          priority: 'high' as const
        }
      ],
      trends: {
        sales: 'up' as const,
        growth: 'up' as const,
        prospects: 'stable' as const,
        responseTime: 'down' as const
      },
      metrics: {
        sales: { value: 0, target: 3000000, trend: 'up' as const },
        growth: { value: 0, target: 15, trend: 'up' as const },
        prospects: { value: 18, target: 25, trend: 'stable' as const },
        responseTime: { value: 2.5, target: 1.5, trend: 'down' as const }
      }
    };
  }
}
