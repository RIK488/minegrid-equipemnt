import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, markMessageAsRead, sendMessage } from '../../utils/api/messages';
import { queryKeys } from './queryKeys';

/**
 * Hook React Query pour la liste des messages de l'utilisateur connecte.
 * - Cache 2 min (staleTime hérité du QueryClient global)
 * - Desactive quand l'utilisateur n'est pas authentifie (enabled)
 * - Les mutations (sendMessage, markMessageAsRead) invalident la cache
 *   automatiquement pour forcer un refetch
 */
export function useMessages(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.messages.list(),
    queryFn: getMessages,
    enabled: options?.enabled ?? true,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}

export function useMarkMessageAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}
