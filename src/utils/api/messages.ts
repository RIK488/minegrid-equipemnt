import { MESSAGE_LIST_COLUMNS } from '../../constants/apiQueryFields';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';
import { getCurrentUser } from './auth';

// -------------------- MESSAGES --------------------

export async function getMessages() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  return supabaseCall(
    () =>
      supabase
        .from('messages')
        .select(MESSAGE_LIST_COLUMNS)
        .or(`receiver_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false }),
    { label: 'getMessages', fallback: [] },
  );
}

export async function sendMessage(messageData: {
  receiver_id: string;
  machine_id?: string;
  subject: string;
  content: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  return supabaseCall(
    () =>
      supabase.from('messages').insert([
        {
          sender_id: user.id,
          ...messageData,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]),
    { label: 'sendMessage', toastOnError: true, toastMessage: "Impossible d'envoyer le message" },
  );
}

export async function markMessageAsRead(messageId: string) {
  await supabaseCall(
    () => supabase.from('messages').update({ is_read: true }).eq('id', messageId),
    { label: 'markMessageAsRead' },
  );
}
