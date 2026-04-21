import { useQuery } from '@tanstack/react-query';
import { getUserMachines } from '../../utils/proApi/machines';
import { queryKeys } from './queryKeys';

/**
 * Liste des annonces/equipements du vendeur connecte. Cache 2 min.
 * Accepte `enabled` pour ne pas fetcher tant que l'auth n'est pas prete.
 */
export function useUserMachines(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.userMachines.list(),
    queryFn: getUserMachines,
    enabled: options?.enabled ?? true,
  });
}
