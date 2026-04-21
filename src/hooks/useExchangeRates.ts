import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrencyStore } from '../stores/currencyStore';
import type { Currency } from '../types';
import { logger } from '../utils/logger';

// Exporte pour pouvoir reutiliser dans CurrencySelector (bouton "Auto").
export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  MA: 'MAD',
  US: 'USD', CA: 'USD',
  FR: 'EUR', BE: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR', LU: 'EUR', IE: 'EUR', GR: 'EUR', AT: 'EUR', FI: 'EUR',
  SN: 'XOF', CI: 'XOF', BF: 'XOF', BJ: 'XOF', TG: 'XOF', ML: 'XOF', NE: 'XOF', GW: 'XOF',
  CM: 'XAF', GA: 'XAF', TD: 'XAF', CF: 'XAF', CG: 'XAF', GQ: 'XAF',
  NG: 'NGN',
  ZA: 'ZAR',
  EG: 'EGP',
  KE: 'KES',
  GH: 'GHS',
};

/**
 * Tente de detecter le pays via plusieurs strategies (ordre de fiabilite) :
 *   1. ipapi.co (geolocation IP, tres precis mais depend d'un tiers)
 *   2. navigator.language (ex: 'fr-MA' -> 'MA', depend du systeme user)
 */
export async function detectCurrencyFromBrowser(): Promise<Currency | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout?.(4000) });
    if (res.ok) {
      const geo = await res.json();
      const countryCode = String(geo?.country_code || '').toUpperCase();
      const mapped = COUNTRY_TO_CURRENCY[countryCode];
      if (mapped) {
        logger.info(`[currency] detected ${mapped} from ipapi country=${countryCode}`);
        return mapped;
      }
      logger.info(`[currency] ipapi returned country=${countryCode} (no mapping)`);
    } else {
      logger.warn(`[currency] ipapi returned status ${res.status}`);
    }
  } catch (err) {
    logger.warn('[currency] ipapi fetch failed, falling back to navigator.language', err);
  }

  try {
    const locales = navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || ''];
    for (const loc of locales) {
      const region = loc.split('-')[1]?.toUpperCase();
      if (region && COUNTRY_TO_CURRENCY[region]) {
        const mapped = COUNTRY_TO_CURRENCY[region];
        logger.info(`[currency] detected ${mapped} from navigator.language locale=${loc}`);
        return mapped;
      }
    }
    logger.info('[currency] navigator.language no mapping', locales);
  } catch (err) {
    logger.warn('[currency] navigator.language fallback failed', err);
  }

  return null;
}

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
  const { setRates, hasUserSelectedCurrency, setAutoCurrency } = useCurrencyStore();
  const hasTriedGeoRef = useRef(false);

  useEffect(() => {
    if (hasUserSelectedCurrency || hasTriedGeoRef.current) return;
    hasTriedGeoRef.current = true;

    void (async () => {
      const detected = await detectCurrencyFromBrowser();
      if (detected) {
        setAutoCurrency(detected);
      }
    })();
  }, [hasUserSelectedCurrency, setAutoCurrency]);

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