import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteClientNotification,
  deleteReadNotifications,
  getClientNotifications,
  markNotificationAsRead,
} from '../../utils/proApi/notifications';
import { queryKeys } from './queryKeys';

/**
 * Notifications Pro du client connecte. Refetch quand la fenetre retrouve
 * le focus (les notifs ont interet a etre fraiches).
 */
export function useClientNotifications(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.clientNotifications.list(),
    queryFn: getClientNotifications,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientNotifications.all });
    },
  });
}

export function useDeleteClientNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClientNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientNotifications.all });
    },
  });
}

export function useDeleteReadNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReadNotifications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientNotifications.all });
    },
  });
}
