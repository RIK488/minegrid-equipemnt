import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Calculator, Info, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrencyStore } from '../stores/currencyStore';
const banks = [
    {
        id: 'bank-of-africa',
        name: 'Bank of Africa',
        logo: '/image/banks/bank-of-africa.png',
        description: 'Solutions de financement flexibles pour vos équipements',
        rates: {
            min: 4.5,
            max: 7.5
        },
        durations: {
            min: 12,
            max: 60
        }
    },
    {
        id: 'attijariwafa',
        name: 'Attijariwafa Bank',
        logo: '/image/banks/attijariwafa.png',
        description: 'Financement sur mesure pour les professionnels',
        rates: {
            min: 4.2,
            max: 7.2
        },
        durations: {
            min: 12,
            max: 72
        }
    },
    {
        id: 'saham',
        name: 'Saham Bank',
        logo: '/image/banks/saham.png',
        description: 'Solutions de leasing adaptées à vos besoins',
        rates: {
            min: 4.8,
            max: 7.8
        },
        durations: {
            min: 24,
            max: 84
        }
    }
];
export default function FinancingSimulator({ machinePrice, className = "" }) {
    const { currentCurrency, rates } = useCurrencyStore();
    const [selectedBank, setSelectedBank] = useState(null);
    const [amount, setAmount] = useState(machinePrice);
    const [downPayment, setDownPayment] = useState(Math.round(machinePrice * 0.2));
    const [duration, setDuration] = useState(36);
    const [simulation, setSimulation] = useState(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
    const carouselRef = useRef(null);
    // Convertir les montants en fonction de la devise sélectionnée
    const convertAmount = (amount) => {
        if (currentCurrency === 'EUR')
            return amount;
        return Math.round(amount * rates[currentCurrency]);
    };
    // Convertir les montants de la devise locale vers l'euro
    const convertToEUR = (amount) => {
        if (currentCurrency === 'EUR')
            return amount;
        return Math.round(amount / rates[currentCurrency]);
    };
    // Fonction pour calculer la mensualité
    const calculateMonthlyPayment = (totalAmount, rate, months) => {
        const monthlyRate = rate / 100 / 12;
        const payment = (totalAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        return Math.round(payment * 100) / 100;
    };
    // Formater les montants avec la devise appropriée
    const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currentCurrency,
            maximumFractionDigits: 0
        });
        const parts = formatter.formatToParts(amount);
        const currencyPart = parts.find(part => part.type === 'currency');
        const numberParts = parts.filter(part => part.type === 'integer' ||
            part.type === 'decimal' ||
            part.type === 'fraction' ||
            (part.type === 'group' && part.value === ' '));
        return (_jsxs("span", { className: "whitespace-nowrap", children: [numberParts.map(part => part.value).join(''), _jsx("span", { className: "text-xs ml-1 font-normal", children: currencyPart?.value })] }));
    };
    // Déterminer la taille de police en fonction du montant
    const getAmountClassName = (amount) => {
        if (amount >= 1000000)
            return 'text-base';
        if (amount >= 100000)
            return 'text-lg';
        return 'text-xl';
    };
    // Mettre à jour les montants quand la devise change
    useEffect(() => {
        const newAmount = convertAmount(machinePrice);
        setAmount(newAmount);
        setDownPayment(Math.round(newAmount * 0.2));
    }, [currentCurrency, rates, machinePrice]);
    // Auto-scroll du carrousel
    useEffect(() => {
        if (isAutoScrollPaused)
            return;
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
                if (carouselRef.current.scrollLeft >= maxScroll) {
                    carouselRef.current.scrollLeft = 0;
                }
                else {
                    carouselRef.current.scrollLeft += 1;
                }
            }
        }, 20);
        return () => clearInterval(interval);
    }, [isAutoScrollPaused]);
    // Calculer la simulation
    useEffect(() => {
        if (!selectedBank)
            return;
        // Convertir les montants en EUR pour le calcul
        const amountInEUR = convertToEUR(amount);
        const downPaymentInEUR = convertToEUR(downPayment);
        const loanAmount = amountInEUR - downPaymentInEUR;
        const monthlyRate = selectedBank?.rates.min || 0;
        const numberOfPayments = duration;
        if (loanAmount > 0 && numberOfPayments > 0) {
            const monthlyPaymentEUR = calculateMonthlyPayment(loanAmount, monthlyRate, numberOfPayments);
            const totalCostEUR = monthlyPaymentEUR * numberOfPayments + downPaymentInEUR;
            // Convertir les résultats dans la devise sélectionnée
            const monthlyPaymentLocal = convertAmount(monthlyPaymentEUR);
            const totalCostLocal = convertAmount(totalCostEUR);
            setSimulation({
                machinePrice: amount,
                downPayment,
                loanAmount: convertAmount(loanAmount),
                duration,
                interestRate: monthlyRate,
                monthlyPayment: Math.round(monthlyPaymentLocal),
                totalCost: Math.round(totalCostLocal),
                partner: selectedBank?.name || ''
            });
        }
    }, [amount, downPayment, duration, selectedBank, currentCurrency, rates]);
    // Gestionnaires d'événements pour le carrousel
    const handleBankClick = (bank) => {
        setSelectedBank(bank);
        setIsAutoScrollPaused(true);
        // Ajuster la durée en fonction des limites de la banque
        if (duration < bank.durations.min) {
            setDuration(bank.durations.min);
        }
        else if (duration > bank.durations.max) {
            setDuration(bank.durations.max);
        }
    };
    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = direction === 'left'
                ? carouselRef.current.scrollLeft - scrollAmount
                : carouselRef.current.scrollLeft + scrollAmount;
            carouselRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };
    const handleRequestFinancing = () => {
        setShowRequestForm(true);
    };
    return (_jsxs("div", { className: `bg-white rounded-lg shadow-md p-6 ${className}`, children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calculator, { className: "h-6 w-6 text-primary-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Simulateur de Financement" })] }) }), _jsxs("div", { className: "relative mb-6", children: [_jsx("div", { className: "absolute -top-8 right-0 flex items-center space-x-2", children: _jsx("button", { onClick: () => setIsAutoScrollPaused(!isAutoScrollPaused), className: "p-1 hover:bg-gray-100 rounded-full", title: isAutoScrollPaused ? "Reprendre le défilement" : "Mettre en pause", children: isAutoScrollPaused ? (_jsx(Play, { className: "h-4 w-4 text-gray-600" })) : (_jsx(Pause, { className: "h-4 w-4 text-gray-600" })) }) }), _jsx("button", { onClick: () => scrollCarousel('left'), className: "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md", children: _jsx(ChevronLeft, { className: "h-6 w-6 text-gray-600" }) }), _jsx("button", { onClick: () => scrollCarousel('right'), className: "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md", children: _jsx(ChevronRight, { className: "h-6 w-6 text-gray-600" }) }), _jsx("div", { ref: carouselRef, className: "flex overflow-x-hidden space-x-6 py-4 px-8", style: { scrollBehavior: 'auto' }, onMouseEnter: () => setIsAutoScrollPaused(true), onMouseLeave: () => setIsAutoScrollPaused(false), children: banks.map((bank) => (_jsx("div", { onClick: () => handleBankClick(bank), className: `flex-none w-64 p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${selectedBank?.id === bank.id
                                ? 'bg-primary-50 border-2 border-primary-300 shadow-lg'
                                : 'bg-white border border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`, children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-full h-32 flex items-center justify-center mb-4", children: _jsx("img", { src: bank.logo, alt: bank.name, className: "w-full h-full object-contain" }) }), _jsxs("div", { className: "w-full text-center", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-800 mb-2", children: bank.name }), _jsx("div", { className: "flex items-center justify-center space-x-3 text-sm", children: _jsxs("span", { className: "font-medium text-primary-600", children: ["Taux : ", bank.rates.min, "%"] }) })] })] }) }, bank.id))) })] }), selectedBank && (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("label", { className: "block text-xs font-medium text-gray-600", children: ["Montant total (", currentCurrency, ")"] }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(Number(e.target.value)), className: "w-full px-2 py-1 text-sm border rounded focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("label", { className: "block text-xs font-medium text-gray-600", children: ["Apport initial (", currentCurrency, ")"] }), _jsx("input", { type: "number", value: downPayment, onChange: (e) => setDownPayment(Number(e.target.value)), className: "w-full px-2 py-1 text-sm border rounded focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Dur\u00E9e (mois)" }), _jsx("input", { type: "range", min: selectedBank.durations.min, max: selectedBank.durations.max, value: duration, onChange: (e) => setDuration(Number(e.target.value)), className: "w-full" }), _jsxs("div", { className: "text-xs text-center", children: [duration, " mois"] })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "text-xs text-primary-600 mb-1", children: ["Taux : ", selectedBank.rates.min, "%"] }), _jsx("div", { className: "text-xs font-medium text-gray-600", children: "Mensualit\u00E9 estim\u00E9e" }), _jsx("div", { className: `font-bold text-primary-600 ${simulation ? getAmountClassName(simulation.monthlyPayment) : 'text-xl'}`, children: simulation ? formatCurrency(simulation.monthlyPayment) : formatCurrency(0) })] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsxs("div", { className: "text-xs text-gray-500 flex items-center", children: [_jsx(Info, { className: "h-3 w-3 mr-1" }), "Simulation indicative. Les conditions finales d\u00E9pendent de votre profil."] }), _jsx("button", { onClick: handleRequestFinancing, className: "px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors", children: "Demander" })] })] })), showRequestForm && (_jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "text-sm font-semibold mb-2", children: "Demande de financement" }), _jsxs("form", { className: "grid grid-cols-2 gap-4", children: [_jsx("input", { type: "text", placeholder: "Nom complet", className: "px-3 py-2 border rounded text-sm" }), _jsx("input", { type: "email", placeholder: "Email", className: "px-3 py-2 border rounded text-sm" }), _jsx("input", { type: "tel", placeholder: "T\u00E9l\u00E9phone", className: "px-3 py-2 border rounded text-sm" }), _jsx("button", { type: "submit", className: "bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm", children: "Envoyer la demande" })] })] }))] }));
}
