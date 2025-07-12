import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight, Star, Filter, ArrowDownAZ } from 'lucide-react';
// Données d'exemple - Dans une application réelle, ces données viendraient d'une API ou d'une base de données
const machines = {
    'chargeuses/compactes': [
        {
            id: '216B3',
            model: '216B3',
            image: 'https://images.unsplash.com/photo-1581094487326-5937e8490a87?auto=format&fit=crop&w=800&q=80',
            specs: {
                power: { value: 38, unit: 'kW' },
                operatingCapacity: 635,
                weight: 2581
            }
        },
        {
            id: '226B3',
            model: '226B3',
            image: 'https://images.unsplash.com/photo-1581094487326-5937e8490a87?auto=format&fit=crop&w=800&q=80',
            specs: {
                power: { value: 45.5, unit: 'kW' },
                operatingCapacity: 680,
                weight: 2641
            }
        },
        {
            id: '232D3',
            model: '232D3',
            image: 'https://images.unsplash.com/photo-1581094487326-5937e8490a87?auto=format&fit=crop&w=800&q=80',
            specs: {
                power: { value: 44.9, unit: 'kW' },
                operatingCapacity: 865,
                weight: 2955
            }
        },
        {
            id: '236D3',
            model: '236D3',
            image: 'https://images.unsplash.com/photo-1581094487326-5937e8490a87?auto=format&fit=crop&w=800&q=80',
            specs: {
                power: { value: 55.4, unit: 'kW' },
                operatingCapacity: 820,
                weight: 2979
            }
        }
    ]
};
const categoryDescriptions = {
    'chargeuses/compactes': 'Les chargeuses compactes rigides et les chargeuses à chaînes compactes proposent des améliorations axées sur les besoins des clients, associées à nos toutes dernières fonctionnalités et innovations à la pointe de l\'industrie.'
};
const categoryTitles = {
    'chargeuses/compactes': 'CHARGEUSES COMPACTES'
};
export default function SubcategoryPage({ subcategoryId }) {
    const subcategoryMachines = machines[subcategoryId] || [];
    const description = categoryDescriptions[subcategoryId] || '';
    const title = categoryTitles[subcategoryId] || subcategoryId;
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsx("nav", { className: "flex mb-8", "aria-label": "Fil d'Ariane", children: _jsxs("ol", { className: "flex items-center space-x-2", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "text-gray-500 hover:text-primary-600", children: "Accueil" }) }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400" }), _jsx("li", { children: _jsx("a", { href: "#machines", className: "text-gray-500 hover:text-primary-600", children: "Machines" }) }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400" }), _jsx("li", { children: _jsx("span", { className: "text-gray-900 font-medium", children: title }) })] }) }), _jsxs("div", { className: "flex flex-col lg:flex-row gap-8", children: [_jsx("div", { className: "lg:w-1/5 lg:-ml-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-sm p-4 space-y-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-base font-semibold text-gray-900 mb-3 flex items-center", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Filtres"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Puissance" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { type: "number", placeholder: "Min kW", className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md" }), _jsx("input", { type: "number", placeholder: "Max kW", className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Capacit\u00E9" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { type: "number", placeholder: "Min kg", className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md" }), _jsx("input", { type: "number", placeholder: "Max kg", className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u00C9tat" }), _jsxs("select", { className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { children: "Tous" }), _jsx("option", { children: "Neuf" }), _jsx("option", { children: "Occasion" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Disponibilit\u00E9" }), _jsxs("select", { className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { children: "Toutes" }), _jsx("option", { children: "En stock" }), _jsx("option", { children: "Sur commande" })] })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-base font-semibold text-gray-900 mb-3 flex items-center", children: [_jsx(ArrowDownAZ, { className: "h-4 w-4 mr-2" }), "Trier par"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "sort", className: "text-primary-600" }), _jsx("span", { className: "ml-2 text-sm", children: "Prix croissant" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "sort", className: "text-primary-600" }), _jsx("span", { className: "ml-2 text-sm", children: "Prix d\u00E9croissant" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "sort", className: "text-primary-600" }), _jsx("span", { className: "ml-2 text-sm", children: "Puissance" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "sort", className: "text-primary-600" }), _jsx("span", { className: "ml-2 text-sm", children: "Capacit\u00E9" })] })] })] })] }) }), _jsxs("div", { className: "lg:w-4/5", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: title }), _jsx("p", { className: "text-gray-600", children: description })] }), _jsx("div", { className: "bg-white rounded-lg shadow-sm mb-6 p-4", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("input", { type: "text", placeholder: "Rechercher un mod\u00E8le...", className: "flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" }), _jsxs("span", { className: "text-sm text-gray-600 self-center", children: [subcategoryMachines.length, " r\u00E9sultats"] })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: subcategoryMachines.map((machine) => (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: machine.image, alt: `${machine.model}`, className: "w-full h-48 object-cover" }), _jsx("div", { className: "absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm", children: "Nouveau" })] }), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: machine.model }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx(Star, { className: "h-4 w-4 text-yellow-400" }), _jsx(Star, { className: "h-4 w-4 text-yellow-400" }), _jsx(Star, { className: "h-4 w-4 text-yellow-400" }), _jsx(Star, { className: "h-4 w-4 text-yellow-400" }), _jsx(Star, { className: "h-4 w-4 text-yellow-400" }), _jsx("span", { className: "ml-1 text-sm text-gray-600", children: "(12 avis)" })] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Puissance brute" }), _jsxs("span", { className: "font-medium", children: [machine.specs.power.value, " ", machine.specs.power.unit] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Capacit\u00E9 nominale" }), _jsxs("span", { className: "font-medium", children: [machine.specs.operatingCapacity, " kg"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Poids en ordre de marche" }), _jsxs("span", { className: "font-medium", children: [machine.specs.weight, " kg"] })] })] }), _jsx("a", { href: `#machines/${machine.id}`, className: "block w-full bg-primary-600 text-white text-center px-4 py-2 rounded-md hover:bg-primary-700 transition-colors", children: "Explorer" })] })] }, machine.id))) })] })] })] }));
}
