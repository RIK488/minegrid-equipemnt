import { MESSAGE_LIST_COLUMNS } from '../../constants/apiQueryFields';
import supabase from '../supabaseClient';
import { getCurrentUser } from './auth';

// -------------------- MESSAGES --------------------

export async function getMessages() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  try {
    const { data, error } = await supabase
      .from('messages')
      .select(MESSAGE_LIST_COLUMNS)
      .or(`receiver_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur getMessages:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Erreur getMessages:', error);
    return [];
  }
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
