import React from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
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
  const { currentCurrency, setCurrency, hasUserSelectedCurrency } = useCurrencyStore();

  return (
    <div className="ml-2 flex flex-col items-end">
      <select
        value={currentCurrency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {currencies.map((currency) => (
          <option key={currency.value} value={currency.value}>
            {currency.symbol}
          </option>
        ))}
      </select>
      <span className="text-[10px] text-gray-500 mt-0.5">
        {hasUserSelectedCurrency ? 'Devise personnalisée' : 'Devise détectée automatiquement'}
      </span>
    </div>
  );
}