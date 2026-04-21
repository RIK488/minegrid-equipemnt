import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../utils/api/types';
import { getUserProfile, updateUserProfile } from '../../utils/api/profile';
import { queryKeys } from './queryKeys';

/**
 * Profil de l'utilisateur connecte. Cache long (5 min) car change peu.
 */
export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.userProfile.me(),
    queryFn: getUserProfile,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserProfile>) => updateUserProfile(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.userProfile.all });
    },
  });
}
