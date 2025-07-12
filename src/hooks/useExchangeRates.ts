import { useQuery } from '@tanstack/react-query';
import { useCurrencyStore } from '../stores/currencyStore';

export function useExchangeRates() {
  const { setRates } = useCurrencyStore();

  return useQuery({
    queryKey: ['exchangeRates'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-rates`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const rates = await response.json();
      setRates(rates);
      return rates;
    },
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
    retry: 3
  });
}