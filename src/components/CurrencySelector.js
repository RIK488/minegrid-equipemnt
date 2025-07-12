import { jsx as _jsx } from "react/jsx-runtime";
import { useCurrencyStore } from '../stores/currencyStore';
const currencies = [
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
    const { currentCurrency, setCurrency } = useCurrencyStore();
    return (_jsx("select", { value: currentCurrency, onChange: (e) => setCurrency(e.target.value), className: "ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500", children: currencies.map((currency) => (_jsx("option", { value: currency.value, children: currency.symbol }, currency.value))) }));
}
