import { OFFER_LIST_COLUMNS } from '../../constants/apiQueryFields';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';
import { getCurrentUser } from './auth';

// -------------------- OFFRES --------------------

export async function getOffers() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  return supabaseCall(
    () =>
      supabase
        .from('offers')
        .select(OFFER_LIST_COLUMNS)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }),
    { label: 'getOffers', fallback: [] },
  );
}

export async function createOffer(offerData: {
  machine_id: string;
  seller_id: string;
  amount: number;
  message?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  return supabaseCall(
    () =>
      supabase.from('offers').insert([
        {
          buyer_id: user.id,
          ...offerData,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]),
    { label: 'createOffer', toastOnError: true, toastMessage: "Impossible de créer l'offre" },
  );
}

export async function updateOfferStatus(offerId: string, status: 'accepted' | 'rejected') {
  return supabaseCall(
    () => supabase.from('offers').update({ status }).eq('id', offerId),
    { label: 'updateOfferStatus', toastOnError: true },
  );
}
