import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCurrencyStore } from '../stores/currencyStore';
const currencySymbols = {
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
const currencyFormats = {
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
export default function Price({ amount, showOriginal = false, className = '' }) {
    const { currentCurrency, rates } = useCurrencyStore();
    const convertedAmount = amount * rates[currentCurrency];
    const formatPrice = (value, currency) => {
        const options = currencyFormats[currency] || { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        const formatted = new Intl.NumberFormat('fr-FR', options).format(value);
        if (options.style === 'currency') {
            return formatted;
        }
        return `${formatted} ${currencySymbols[currency]}`;
    };
    if (showOriginal && currentCurrency !== 'EUR') {
        return (_jsxs("div", { className: `flex flex-col ${className}`, children: [_jsx("span", { className: "text-lg font-bold", children: formatPrice(convertedAmount, currentCurrency) }), _jsx("span", { className: "text-sm text-gray-500", children: formatPrice(amount, 'EUR') })] }));
    }
    return (_jsx("span", { className: className, children: formatPrice(convertedAmount, currentCurrency) }));
}
