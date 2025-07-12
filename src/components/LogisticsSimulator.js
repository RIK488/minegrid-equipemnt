import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Info, Calculator, Globe } from 'lucide-react';
import { estimerTransport, getDestinationsFromOrigin, formatDelay, getDestinationsByContinent, getOriginsByContinent } from '../utils/transport';
import { useCurrencyStore } from '../stores/currencyStore';
import Price from './Price';
export default function LogisticsSimulator({ machineWeight, machineVolume, machineValue, className = "", isPremium = false }) {
    const [selectedOrigin, setSelectedOrigin] = useState('Casablanca');
    const [selectedDestination, setSelectedDestination] = useState('Abidjan');
    const [selectedOriginContinent, setSelectedOriginContinent] = useState('Maroc');
    const [transportCost, setTransportCost] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [availableDestinationsForOrigin, setAvailableDestinationsForOrigin] = useState([]);
    // 🔄 Récupération de la devise sélectionnée
    const { currentCurrency, rates } = useCurrencyStore();
    const destinationsByContinent = getDestinationsByContinent();
    const originsByContinent = getOriginsByContinent();
    // Correction : bornage des valeurs et avertissement
    let validWeight = machineWeight;
    let validVolume = machineVolume;
    let validValue = machineValue || 50000; // Valeur par défaut si non fournie
    let showWarning = false;
    if (typeof validWeight !== 'number' || isNaN(validWeight) || validWeight < 1 || validWeight > 40) {
        validWeight = 25;
        showWarning = true;
    }
    if (typeof validVolume !== 'number' || isNaN(validVolume) || validVolume < 1 || validVolume > 100) {
        validVolume = 100;
        showWarning = true;
    }
    if (typeof validValue !== 'number' || isNaN(validValue) || validValue < 10000 || validValue > 500000) {
        validValue = 50000;
        showWarning = true;
    }
    // Mettre à jour les destinations disponibles quand l'origine change
    useEffect(() => {
        const destinations = getDestinationsFromOrigin(selectedOrigin);
        setAvailableDestinationsForOrigin(destinations);
        // Si la destination actuelle n'est pas disponible, prendre la première
        if (!destinations.includes(selectedDestination) && destinations.length > 0) {
            setSelectedDestination(destinations[0]);
        }
    }, [selectedOrigin, selectedDestination]);
    // Calculer le coût de transport quand les paramètres changent
    useEffect(() => {
        const cost = estimerTransport(selectedOrigin, selectedDestination, validWeight, validVolume, validValue);
        setTransportCost(cost);
    }, [selectedOrigin, selectedDestination, validWeight, validVolume, validValue]);
    // Recalculer l'affichage quand la devise change
    useEffect(() => {
        // Le transportCost ne change pas, mais l'affichage doit être mis à jour
        // car formatCostInCurrency utilise currentCurrency et rates
    }, [currentCurrency, rates]);
    // Affichage du détail des coûts pour premium
    useEffect(() => {
        if (isPremium)
            setShowDetails(true);
    }, [isPremium]);
    const handleOriginContinentChange = (continent) => {
        setSelectedOriginContinent(continent);
        const continentOrigins = originsByContinent[continent] || [];
        if (continentOrigins.length > 0) {
            setSelectedOrigin(continentOrigins[0]);
        }
    };
    const handleOriginChange = (origin) => {
        setSelectedOrigin(origin);
    };
    const handleDestinationChange = (destination) => {
        setSelectedDestination(destination);
    };
    if (!transportCost) {
        return (_jsxs("div", { className: `bg-white rounded-lg shadow p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Truck, { className: "h-6 w-6 text-blue-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Simulateur de transport International" })] }), _jsx("p", { className: "text-gray-500", children: "Route de transport non disponible" })] }));
    }
    return (_jsxs("div", { className: `bg-white rounded-lg shadow p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Truck, { className: "h-6 w-6 text-blue-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Simulateur de transport International" })] }), !isPremium && (_jsxs("button", { onClick: () => setShowDetails(!showDetails), className: "text-blue-600 hover:text-blue-800 text-sm flex items-center", children: [_jsx(Info, { className: "h-4 w-4 mr-1" }), showDetails ? 'Masquer' : 'Voir', " d\u00E9tails"] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Globe, { className: "h-4 w-4 inline mr-1" }), "R\u00E9gion de d\u00E9part"] }), _jsxs("select", { value: selectedOriginContinent, onChange: (e) => handleOriginContinentChange(e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "Maroc", children: "\uD83C\uDDF2\uD83C\uDDE6 Maroc" }), _jsx("option", { value: "Europe", children: "\uD83C\uDDEA\uD83C\uDDFA Europe" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "h-4 w-4 inline mr-1" }), "Port de d\u00E9part"] }), _jsx("select", { value: selectedOrigin, onChange: (e) => handleOriginChange(e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: originsByContinent[selectedOriginContinent]?.map(origin => (_jsx("option", { value: origin, children: origin }, origin))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "h-4 w-4 inline mr-1" }), "Destination"] }), _jsx("select", { value: selectedDestination, onChange: (e) => handleDestinationChange(e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: availableDestinationsForOrigin.map(destination => (_jsx("option", { value: destination, children: destination }, destination))) })] })] }), (machineWeight || machineVolume || machineValue) && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Caract\u00E9ristiques de la machine" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [machineWeight && (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-gray-600", children: "Poids:" }), _jsxs("span", { className: "ml-2 font-medium", children: [machineWeight, " tonnes"] })] })), machineVolume && (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-gray-600", children: "Volume:" }), _jsxs("span", { className: "ml-2 font-medium", children: [machineVolume, " m\u00B3"] })] })), machineValue && (_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-gray-600", children: "Valeur:" }), _jsx("span", { className: "ml-2 font-medium", children: _jsx(Price, { amount: machineValue }) })] }))] }), showWarning && (_jsx("div", { className: "mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs", children: "Valeur de poids, volume ou prix absente ou incoh\u00E9rente : estimation standard appliqu\u00E9e (25 tonnes, 100 m\u00B3, 50 000 \u20AC)" }))] })), _jsx("div", { className: `rounded-lg p-6 mb-4 ${selectedOriginContinent === 'Maroc' ? 'bg-blue-50' : 'bg-green-50'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h4", { className: `text-lg font-semibold ${selectedOriginContinent === 'Maroc' ? 'text-blue-900' : 'text-green-900'}`, children: ["Livraison vers ", selectedDestination] }), _jsxs("p", { className: `${selectedOriginContinent === 'Maroc' ? 'text-blue-700' : 'text-green-700'}`, children: ["Depuis ", selectedOrigin, " \u2022 ", selectedOriginContinent] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-2xl font-bold ${selectedOriginContinent === 'Maroc' ? 'text-blue-900' : 'text-green-900'}`, children: _jsx(Price, { amount: transportCost.cost }) }), _jsxs("div", { className: `text-sm flex items-center ${selectedOriginContinent === 'Maroc' ? 'text-blue-600' : 'text-green-600'}`, children: [_jsx(Clock, { className: "h-4 w-4 mr-1" }), formatDelay(transportCost.days)] })] })] }) }), showDetails && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "D\u00E9tail des co\u00FBts principaux" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-green-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx(Truck, { className: "h-4 w-4 text-green-600 mr-1" }), _jsx("span", { className: "text-xs font-medium text-green-700", children: "Transport maritime" })] }), _jsx("div", { className: "text-lg font-semibold text-green-900", children: _jsx(Price, { amount: transportCost.details.shipping }) }), machineVolume && (_jsxs("div", { className: "text-xs text-green-600 mt-1", children: [machineVolume, " m\u00B3 \u2022 Tarif ", machineVolume >= 3 ? 'volume' : 'base'] }))] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx(Calculator, { className: "h-4 w-4 text-orange-600 mr-1" }), _jsx("span", { className: "text-xs font-medium text-orange-700", children: "Douane & Taxes" })] }), _jsx("div", { className: "text-lg font-semibold text-orange-900", children: _jsx(Price, { amount: transportCost.details.customs }) }), machineValue && (_jsxs("div", { className: "text-xs text-orange-600 mt-1", children: ["Bas\u00E9 sur ", _jsx(Price, { amount: machineValue })] }))] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx(Truck, { className: "h-4 w-4 text-blue-600 mr-1" }), _jsx("span", { className: "text-xs font-medium text-blue-700", children: "Transport terrestre" })] }), _jsx("div", { className: "text-lg font-semibold text-blue-900", children: _jsx(Price, { amount: transportCost.details.inland }) }), _jsx("div", { className: "text-xs text-blue-600 mt-1", children: selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou'
                                            ? 'Destination intérieure'
                                            : 'Port de destination' }), machineWeight && (_jsxs("div", { className: "text-xs text-blue-500 mt-1", children: [machineWeight, " tonnes \u2022 ", getWeightCategoryText(machineWeight)] }))] })] }), machineVolume && (_jsxs("div", { className: "mt-4 p-3 bg-gray-50 rounded-lg", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-2", children: "D\u00E9tails du transport maritime" }), _jsxs("div", { className: "text-xs text-gray-600 space-y-1", children: [_jsxs("div", { children: ["\u2022 Volume: ", machineVolume, " m\u00B3"] }), _jsx("div", { children: "\u2022 Type: Break-bulk / Ro-Ro (pas conteneur standard)" }), _jsxs("div", { children: ["\u2022 Tarif: ", machineVolume >= 3 ? 'Volume (≥3m³)' : 'Base (1m³)'] }), _jsx("div", { children: "\u2022 Frais portuaires: ~170 \u20AC (break-bulk)" }), _jsxs("div", { children: ["\u2022 Assurance: ~", _jsx(Price, { amount: Math.round((machineValue || 50000) * 0.01 * 0.85) }), " (1% CIF)"] }), _jsx("div", { children: "\u2022 Conversion USD\u2192EUR: 0.85" })] })] })), machineWeight && (_jsxs("div", { className: "mt-4 p-3 bg-gray-50 rounded-lg", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-2", children: "D\u00E9tails du transport terrestre" }), _jsxs("div", { className: "text-xs text-gray-600 space-y-1", children: [_jsxs("div", { children: ["\u2022 Poids: ", machineWeight, " tonnes"] }), _jsxs("div", { children: ["\u2022 Cat\u00E9gorie: ", getWeightCategoryText(machineWeight)] }), _jsxs("div", { children: ["\u2022 R\u00E9gion: ", getInlandRegionText(selectedOrigin)] }), _jsxs("div", { children: ["\u2022 Distance: ~", getInlandDistance(selectedDestination), " km"] }), _jsxs("div", { children: ["\u2022 Tarif: ~", _jsx(Price, { amount: getInlandRate(machineWeight, selectedOrigin) }), "/km"] }), (machineWeight >= 50 || selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou') && (_jsxs("div", { className: "text-orange-600 font-medium", children: ["\u2022 Suppl\u00E9ments: ", machineWeight >= 50 ? 'Convoi exceptionnel' : '', machineWeight >= 50 && (selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou') ? ' + ' : '', (selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou') ? 'Destination intérieure' : ''] }))] })] }))] })), _jsx("div", { className: "mt-4 p-3 bg-yellow-50 rounded-lg", children: _jsxs("div", { className: "flex items-start", children: [_jsx(Info, { className: "h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-yellow-800", children: [_jsx("p", { className: "font-medium", children: "Estimation indicative" }), _jsx("p", { className: "text-xs mt-1", children: "Les co\u00FBts incluent le transport maritime (tarifs Nile Cargo Carrier), les frais de douane selon les taux officiels, et le transport terrestre (porte-char avec chauffeur). Les prix peuvent varier selon les conditions du march\u00E9." })] })] }) })] }));
}
// Fonctions utilitaires pour l'affichage
function getWeightCategory(poids) {
    if (poids < 6)
        return 'light';
    if (poids < 25)
        return 'medium';
    if (poids < 35)
        return 'heavy';
    if (poids < 50)
        return 'extra';
    return 'exceptional';
}
function getWeightCategoryText(poids) {
    if (poids < 6)
        return 'Mini-engin (<6T)';
    if (poids < 25)
        return 'Pelle standard (18-24T)';
    if (poids < 35)
        return 'Chargeuse (25-30T)';
    if (poids < 50)
        return 'Concasseur (30-50T)';
    return 'Convoi exceptionnel (>50T)';
}
function getInlandRegionText(origin) {
    if (['Marseille', 'Rotterdam', 'Anvers', 'Hambourg'].includes(origin))
        return 'Europe';
    if (['Casablanca', 'Tanger', 'Agadir'].includes(origin))
        return 'Maroc';
    return 'Afrique de l\'Ouest';
}
function getInlandDistance(destination) {
    const distances = {
        'Abidjan': 50, 'Dakar': 30, 'Cotonou': 40, 'Lagos': 60,
        'Accra': 45, 'Douala': 35, 'Bamako': 1200, 'Ouagadougou': 1100
    };
    return distances[destination] || 50;
}
function getInlandRate(poids, origin) {
    const region = getInlandRegionText(origin);
    const category = getWeightCategory(poids);
    const rates = {
        'Europe': { 'light': 2.50, 'medium': 3.20, 'heavy': 3.50, 'extra': 4.50, 'exceptional': 8.00 },
        'Maroc': { 'light': 1.80, 'medium': 2.30, 'heavy': 2.60, 'extra': 3.20, 'exceptional': 6.00 },
        'Afrique de l\'Ouest': { 'light': 2.00, 'medium': 2.80, 'heavy': 3.20, 'extra': 4.00, 'exceptional': 7.00 }
    };
    return rates[region]?.[category] || 3.00;
}
