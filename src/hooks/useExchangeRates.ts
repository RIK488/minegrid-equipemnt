import { useQuery } from '@tanstack/react-query';
import { useCurrencyStore } from '../stores/currencyStore';
import type { Currency } from '../types';

// Taux de change fixes en cas d'erreur de l'API
const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1.0000,
  USD: 1.0850,
  MAD: 10.8500,
  XOF: 655.96,
  XAF: 655.96,
  NGN: 1590.35,
  ZAR: 20.65,
  EGP: 33.72,
  KES: 158.48,
  GHS: 13.89
};

export function useExchangeRates() {
  const { setRates } = useCurrencyStore();

  return useQuery({
    queryKey: ['exchangeRates'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/exchange_rates`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        if (!response.ok) {
          console.warn('⚠️ Erreur 401 sur exchange_rates, utilisation des taux fixes');
          // En cas d'erreur, utiliser les taux fixes
          setRates(FALLBACK_RATES);
          return FALLBACK_RATES;
        }

        const ratesArray = await response.json();
        // Convertir le format array en Record<Currency, number>
        const ratesRecord: Record<Currency, number> = {} as Record<Currency, number>;
        ratesArray.forEach((rate: any) => {
          if (rate.currency && rate.rate) {
            ratesRecord[rate.currency as Currency] = rate.rate;
          }
        });
        
        setRates(ratesRecord);
        return ratesRecord;
      } catch (error) {
        console.warn('⚠️ Erreur réseau sur exchange_rates, utilisation des taux fixes:', error);
        // En cas d'erreur réseau, utiliser les taux fixes
        setRates(FALLBACK_RATES);
        return FALLBACK_RATES;
      }
    },
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
    retry: 1, // Réduire les tentatives pour éviter les erreurs répétées
    staleTime: 1000 * 60 * 30 // Considérer les données comme fraîches pendant 30 minutes
  });
}