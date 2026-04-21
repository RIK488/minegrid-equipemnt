import React, { useState } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import { detectCurrencyFromBrowser } from '../hooks/useExchangeRates';
import type { Currency } from '../types';

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'MAD', label: 'Moroccan Dirham', symbol: 'MAD' },
  { value: 'XOF', label: 'West African CFA', symbol: 'CFA' },
  { value: 'XAF', label: 'Central African CFA', symbol: 'CFA' },
  { value: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { value: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { value: 'EGP', label: 'Egyptian Pound', symbol: 'E£' },
  { value: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
  { value: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' }
];

export default function CurrencySelector() {
  const { currentCurrency, setCurrency, setAutoCurrency, hasUserSelectedCurrency } = useCurrencyStore();
  const [detecting, setDetecting] = useState(false);

  const handleAutoDetect = async () => {
    setDetecting(true);
    try {
      useCurrencyStore.setState({ hasUserSelectedCurrency: false });
      const detected = await detectCurrencyFromBrowser();
      if (detected) {
        setAutoCurrency(detected);
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="ml-2 flex flex-col items-end">
      <div className="flex items-center gap-1">
        <select
          value={currentCurrency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Devise d'affichage"
        >
          {currencies.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.symbol}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="px-1.5 py-1 text-[11px] text-gray-600 hover:text-orange-600 border border-gray-300 rounded-md disabled:opacity-50"
          title="Détecter automatiquement selon votre position"
          aria-label="Détecter automatiquement la devise"
        >
          {detecting ? '…' : '🌐'}
        </button>
      </div>
      <span className="text-[10px] text-gray-500 mt-0.5">
        {hasUserSelectedCurrency ? 'Devise personnalisée' : 'Devise détectée automatiquement'}
      </span>
    </div>
  );
}
