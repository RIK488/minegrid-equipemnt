import { useQuery } from '@tanstack/react-query';
import { fetchMachineSearchSuggestions, sanitizeSearchTerm } from '../../utils/machineSearchSuggest';
import { queryKeys } from './queryKeys';

export function useMachineSearchSuggest(debouncedTerm: string) {
  const q = sanitizeSearchTerm(debouncedTerm);
  const enabled = q.length >= 2;

  return useQuery({
    queryKey: queryKeys.machineSearchSuggest.byTerm(q),
    queryFn: () => fetchMachineSearchSuggestions(q),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}
