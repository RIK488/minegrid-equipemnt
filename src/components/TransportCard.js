import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Truck, MapPin, Clock } from 'lucide-react';
import { estimerTransport, formatCost, formatDelay } from '../utils/transport';
const mainDestinations = ['Abidjan', 'Dakar', 'Lagos', 'Accra'];
export default function TransportCard({ machineWeight, machineVolume, origin = 'Casablanca', className = "" }) {
    const getTransportCosts = () => {
        return mainDestinations.map(destination => {
            const cost = estimerTransport(origin, destination, machineWeight, machineVolume);
            return {
                destination,
                cost: cost?.cost || 0,
                days: cost?.days || 0
            };
        }).filter(item => item.cost > 0);
    };
    const transportCosts = getTransportCosts();
    if (transportCosts.length === 0) {
        return null;
    }
    // Déterminer si l'origine est européenne ou marocaine
    const isEuropeanOrigin = ['Marseille', 'Rotterdam', 'Hambourg', 'Anvers'].includes(origin);
    const originType = isEuropeanOrigin ? 'Europe' : 'Maroc';
    return (_jsxs("div", { className: `bg-white rounded-lg shadow p-4 ${className}`, children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Truck, { className: "h-5 w-5 text-blue-600 mr-2" }), _jsx("h3", { className: "text-sm font-semibold text-gray-900", children: "Transport International" })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-medium text-gray-700 mb-2 flex items-center", children: "\uD83C\uDF0D Destinations africaines" }), _jsx("div", { className: "space-y-2", children: transportCosts.map((item) => (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "h-3 w-3 text-gray-500 mr-1" }), _jsx("span", { className: "text-gray-700", children: item.destination })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `font-semibold ${isEuropeanOrigin ? 'text-green-600' : 'text-blue-600'}`, children: formatCost(item.cost) }), _jsxs("div", { className: "flex items-center text-xs text-gray-500", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), formatDelay(item.days)] })] })] }, item.destination))) })] }) }), _jsx("div", { className: "mt-3 pt-2 border-t border-gray-100", children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Depuis ", origin, " (", originType, ") \u2022 Estimation indicative"] }) })] }));
}
