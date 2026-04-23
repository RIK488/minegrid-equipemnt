import { useQuery } from '@tanstack/react-query';
import supabase from '../../utils/supabaseClient';
import { queryKeys } from './queryKeys';

async function fetchPublicMachineCount(): Promise<number> {
  const { count, error } = await supabase
    .from('machines')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.warn('[usePublicMachineCount]', error);
    return 0;
  }
  return count ?? 0;
}

/** Nombre total d'annonces machines visibles publiquement (COUNT léger). */
export function usePublicMachineCount() {
  return useQuery({
    queryKey: queryKeys.publicMachineCount.all,
    queryFn: fetchPublicMachineCount,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
