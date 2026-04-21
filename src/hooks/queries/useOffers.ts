import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOffer, getOffers, updateOfferStatus } from '../../utils/api/offers';
import { queryKeys } from './queryKeys';

export function useOffers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.offers.list(),
    queryFn: getOffers,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.offers.all });
    },
  });
}

export function useUpdateOfferStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: 'accepted' | 'rejected' }) =>
      updateOfferStatus(offerId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.offers.all });
    },
  });
}
