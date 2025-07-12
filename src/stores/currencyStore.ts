import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '../types';

interface CurrencyState {
  currentCurrency: Currency;
  rates: Record<Currency, number>;
  setCurrency: (currency: Currency) => void;
  setRates: (rates: Record<Currency, number>) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currentCurrency: 'EUR',
      rates: {
        EUR: 1,
        USD: 1.09,
        MAD: 11.02,
        XOF: 655.96,
        XAF: 655.96,
        NGN: 1590.35,
        ZAR: 20.65,
        EGP: 33.72,
        KES: 158.48,
        GHS: 13.89
      },
      setCurrency: (currency) => set({ currentCurrency: currency }),
      setRates: (rates) => set({ rates })
    }),
    {
      name: 'currency-store'
    }
  )
);