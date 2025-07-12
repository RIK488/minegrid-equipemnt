import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Star, Zap, Shield, Copy, CreditCard, Info } from 'lucide-react';
const boostOptions = [
    {
        id: 'boost-7',
        name: 'Boost 7 jours',
        description: 'Mise en avant pendant 7 jours',
        price: 29,
        duration: 7,
        features: [
            'Position prioritaire dans les résultats',
            'Badge "Boosté" visible',
            '+50% de visibilité',
            'Notifications push aux acheteurs'
        ]
    },
    {
        id: 'boost-30',
        name: 'Boost 30 jours',
        description: 'Mise en avant pendant 30 jours',
        price: 89,
        duration: 30,
        features: [
            'Position prioritaire dans les résultats',
            'Badge "Boosté" visible',
            '+100% de visibilité',
            'Notifications push aux acheteurs',
            'Emailing ciblé'
        ]
    },
    {
        id: 'highlight',
        name: 'Mise en avant Premium',
        description: 'Position en tête de liste',
        price: 149,
        duration: 14,
        features: [
            'Position en première page',
            'Badge "Mis en avant" doré',
            '+200% de visibilité',
            'Campagne emailing',
            'Support prioritaire'
        ]
    }
];
export default function PremiumServices({ machineId, machineName, currentPrice, isOwner, className = "" }) {
    const [selectedService, setSelectedService] = useState(null);
    const [showCertificationForm, setShowCertificationForm] = useState(false);
    const handleBoostPurchase = async (boostId) => {
        // TODO: Intégration Stripe
        console.log('Achat boost:', boostId);
    };
    const handleCertificationRequest = async () => {
        // TODO: Envoi vers n8n
        console.log('Demande certification pour:', machineId);
        setShowCertificationForm(false);
    };
    const handleCopyMachine = async () => {
        // TODO: Copier la machine
        console.log('Copier machine:', machineId);
    };
    if (!isOwner) {
        return (_jsxs("div", { className: `bg-white rounded-lg shadow p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Star, { className: "h-6 w-6 text-yellow-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Services Premium" })] }), _jsx("p", { className: "text-gray-500 text-sm", children: "Connectez-vous pour acc\u00E9der aux services premium" })] }));
    }
    return (_jsxs("div", { className: `bg-white rounded-lg shadow p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Star, { className: "h-6 w-6 text-yellow-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Services Premium" })] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Machine: ", machineName] })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("h4", { className: "text-md font-medium text-gray-700 mb-4 flex items-center", children: [_jsx(Zap, { className: "h-4 w-4 mr-2 text-yellow-600" }), "Booster votre annonce"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: boostOptions.map((option) => (_jsxs("div", { className: `border-2 rounded-lg p-4 cursor-pointer transition-colors ${selectedService === option.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'}`, onClick: () => setSelectedService(option.id), children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-gray-900", children: option.name }), _jsx("p", { className: "text-sm text-gray-600", children: option.description })] }), _jsxs("div", { className: "text-lg font-bold text-blue-600", children: [option.price, "\u20AC"] })] }), _jsx("ul", { className: "text-xs text-gray-600 space-y-1 mb-3", children: option.features.map((feature, index) => (_jsxs("li", { className: "flex items-center", children: [_jsx("div", { className: "w-1 h-1 bg-green-500 rounded-full mr-2" }), feature] }, index))) }), _jsxs("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        handleBoostPurchase(option.id);
                                    }, className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm", children: [_jsx(CreditCard, { className: "h-4 w-4 inline mr-1" }), "Acheter"] })] }, option.id))) })] }), _jsxs("div", { className: "mb-8", children: [_jsxs("h4", { className: "text-md font-medium text-gray-700 mb-4 flex items-center", children: [_jsx(Shield, { className: "h-4 w-4 mr-2 text-green-600" }), "Certification \"Machine Contr\u00F4l\u00E9e\""] }), _jsx("div", { className: "bg-green-50 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "flex items-start", children: [_jsx(Shield, { className: "h-5 w-5 text-green-600 mr-3 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-green-900 mb-1", children: "Badge de confiance" }), _jsx("p", { className: "text-sm text-green-700 mb-3", children: "Un expert partenaire inspecte votre machine et d\u00E9livre un certificat de conformit\u00E9. +20% de conversion en moyenne." }), _jsxs("div", { className: "text-sm text-green-600", children: [_jsx("strong", { children: "Prix:" }), " 199\u20AC \u2022 ", _jsx("strong", { children: "D\u00E9lai:" }), " 3-5 jours"] })] })] }) }), _jsxs("button", { onClick: () => setShowCertificationForm(true), className: "w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors", children: [_jsx(Shield, { className: "h-4 w-4 inline mr-2" }), "Demander une certification"] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("h4", { className: "text-md font-medium text-gray-700 mb-4 flex items-center", children: [_jsx(Copy, { className: "h-4 w-4 mr-2 text-purple-600" }), "Gestion rapide"] }), _jsxs("button", { onClick: handleCopyMachine, className: "w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors", children: [_jsx(Copy, { className: "h-4 w-4 inline mr-2" }), "Copier cette annonce"] })] }), _jsx("div", { className: "p-3 bg-blue-50 rounded-lg", children: _jsxs("div", { className: "flex items-start", children: [_jsx(Info, { className: "h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("p", { className: "font-medium", children: "Services premium" }), _jsx("p", { className: "text-xs mt-1", children: "Ces services am\u00E9liorent la visibilit\u00E9 et la cr\u00E9dibilit\u00E9 de votre annonce, augmentant vos chances de vente." })] })] }) }), showCertificationForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Demande de certification" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Un expert partenaire vous contactera sous 24h pour organiser l'inspection." }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: () => setShowCertificationForm(false), className: "flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50", children: "Annuler" }), _jsx("button", { onClick: handleCertificationRequest, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700", children: "Confirmer" })] })] }) }))] }));
}
