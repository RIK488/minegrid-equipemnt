import { useQuery } from '@tanstack/react-query';
import { useCurrencyStore } from '../stores/currencyStore';
import { getExchangeRates as getLocalExchangeRates } from '../utils/exchangeRates';

// Taux de change par défaut en cas d'échec de l'API
const DEFAULT_RATES = {
  EUR: 1,
  USD: 1.1,
  MAD: 11,
  XOF: 655,
  XAF: 655,
  NGN: 1650,
  ZAR: 20,
  EGP: 33,
  KES: 150,
  GHS: 15
};

export function useExchangeRates() {
  const { setRates } = useCurrencyStore();
  
  return useQuery({
    queryKey: ['exchangeRates'],
    queryFn: async () => {
      try {
        // Essayer d'abord l'API Supabase
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/exchange_rates`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          const rates = await response.json();
          setRates(rates);
          return rates;
        }
        
        // Si l'API Supabase échoue, utiliser le service local
        console.warn(`API Supabase retourne ${response.status}, utilisation du service local`);
        const localRates = await getLocalExchangeRates();
        setRates(localRates);
        return localRates;
        
      } catch (error) {
        console.warn('Erreur lors de la récupération des taux de change, utilisation du service local:', error);
        
        try {
          // Utiliser le service local en cas d'erreur
          const localRates = await getLocalExchangeRates();
          setRates(localRates);
          return localRates;
        } catch (localError) {
          console.warn('Erreur avec le service local, utilisation des taux par défaut:', localError);
          // En dernier recours, utiliser les taux par défaut
          setRates(DEFAULT_RATES);
          return DEFAULT_RATES;
        }
      }
    },
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
    retry: 1, // Réduire le nombre de tentatives
    retryDelay: 5000, // Attendre 5 secondes entre les tentatives
    staleTime: 1000 * 60 * 30, // Considérer les données comme fraîches pendant 30 minutes
    gcTime: 1000 * 60 * 60, // Garder en cache pendant 1 heure
  });
}
