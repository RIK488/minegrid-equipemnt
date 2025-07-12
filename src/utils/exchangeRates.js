// Service local pour les taux de change
// Peut être utilisé en remplacement de l'API Supabase en cas de problème

const EXCHANGE_RATES = {
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

// Simuler un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getExchangeRates = async () => {
  // Simuler un délai de réseau
  await delay(100);
  
  // Retourner les taux de change
  return EXCHANGE_RATES;
};

export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  
  const rates = EXCHANGE_RATES;
  if (fromCurrency === 'EUR') {
    return rates[toCurrency] || 1;
  }
  
  if (toCurrency === 'EUR') {
    return 1 / (rates[fromCurrency] || 1);
  }
  
  // Conversion croisée
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return toRate / fromRate;
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};

// Fonction pour mettre à jour les taux (simulation)
export const updateExchangeRates = async (newRates) => {
  Object.assign(EXCHANGE_RATES, newRates);
  return EXCHANGE_RATES;
}; 