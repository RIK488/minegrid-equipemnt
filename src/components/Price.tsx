import React from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import type { Currency } from '../types';

interface PriceProps {
  amount: number;
  showOriginal?: boolean;
  className?: string;
}

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  MAD: 'MAD',
  XOF: 'CFA',
  XAF: 'CFA',
  NGN: '₦',
  ZAR: 'R',
  EGP: 'E£',
  KES: 'KSh',
  GHS: 'GH₵'
};

const currencyFormats: Partial<Record<Currency, Intl.NumberFormatOptions>> = {
  EUR: { style: 'currency', currency: 'EUR' },
  USD: { style: 'currency', currency: 'USD' },
  MAD: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  XOF: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
  XAF: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
  NGN: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  ZAR: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EGP: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  KES: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  GHS: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
};

export default function Price({ amount, showOriginal = false, className = '' }: PriceProps) {
  const { currentCurrency, rates } = useCurrencyStore();
  
  const convertedAmount = amount * rates[currentCurrency];
  
  const formatPrice = (value: number, currency: Currency) => {
    const options = currencyFormats[currency] || { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const formatted = new Intl.NumberFormat('fr-FR', options).format(value);
    
    if (options.style === 'currency') {
      return formatted;
    }
    
    return `${formatted} ${currencySymbols[currency]}`;
  };

  if (showOriginal && currentCurrency !== 'EUR') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-lg font-bold">
          {formatPrice(convertedAmount, currentCurrency)}
        </span>
        <span className="text-sm text-gray-500">
          {formatPrice(amount, 'EUR')}
        </span>
      </div>
    );
  }

  return (
    <span className={className}>
      {formatPrice(convertedAmount, currentCurrency)}
    </span>
  );
}