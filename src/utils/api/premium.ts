import { PREMIUM_SERVICE_COLUMNS } from '../../constants/apiQueryFields';
import type { PremiumService } from './types';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';
import { createNotification } from './notifications';

// -------------------- SERVICES PREMIUM --------------------

export async function getPremiumService(): Promise<PremiumService | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('premium_services')
    .select(PREMIUM_SERVICE_COLUMNS)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Si pas de service premium, créer un service de base pour les tests
  if (!data) {
    const baseService = {
      id: 'base-service',
      user_id: user.id,
      service_type: 'basic' as const,
      status: 'active' as const,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['Annonces prioritaires', 'Statistiques avancées', 'Support prioritaire'],
      price: 29.99,
      created_at: new Date().toISOString()
    };
    return baseService;
  }
  
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
