import { OFFER_LIST_COLUMNS } from '../../constants/apiQueryFields';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

// -------------------- OFFRES --------------------

export async function getOffers() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  try {
    const { data, error } = await supabase
      .from('offers')
      .select(OFFER_LIST_COLUMNS)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur getOffers:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Erreur getOffers:', error);
    return [];
  }
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
