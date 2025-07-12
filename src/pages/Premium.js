import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Shield, Video, FileText, BarChart as ChartBar, Bell, HeadphonesIcon, Check, Info } from 'lucide-react';
const premiumPlans = [
    {
        id: 'basic',
        name: 'Basic',
        price: 29.99,
        duration: 30,
        features: ['featured', 'enhanced-media']
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 49.99,
        duration: 30,
        features: ['featured', 'enhanced-media', 'rich-description', 'statistics']
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99.99,
        duration: 30,
        features: ['featured', 'enhanced-media', 'rich-description', 'statistics', 'notifications', 'support']
    }
];
const features = {
    featured: {
        name: 'Annonces en vedette',
        description: 'Affichage prioritaire et badge Premium',
        icon: Shield
    },
    'enhanced-media': {
        name: 'Médias enrichis',
        description: 'Plus d\'images, vidéos et vues 360°',
        icon: Video
    },
    'rich-description': {
        name: 'Description enrichie',
        description: 'Mise en forme avancée et champs supplémentaires',
        icon: FileText
    },
    statistics: {
        name: 'Statistiques détaillées',
        description: 'Suivi des visites et interactions',
        icon: ChartBar
    },
    notifications: {
        name: 'Notifications temps réel',
        description: 'Alertes instantanées sur les interactions',
        icon: Bell
    },
    support: {
        name: 'Support prioritaire',
        description: 'Assistance dédiée 24/7',
        icon: HeadphonesIcon
    }
};
export default function Premium() {
    const [selectedPlan, setSelectedPlan] = React.useState('pro');
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Offres Premium" }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "Boostez la visibilit\u00E9 de vos annonces et b\u00E9n\u00E9ficiez de fonctionnalit\u00E9s exclusives" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-12", children: premiumPlans.map((plan) => (_jsx("div", { className: `bg-white rounded-lg shadow-lg overflow-hidden ${selectedPlan === plan.id ? 'ring-2 ring-primary-500' : ''}`, children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: plan.name }), _jsxs("div", { className: "flex items-baseline mb-4", children: [_jsxs("span", { className: "text-4xl font-bold text-primary-600", children: [plan.price, "\u20AC"] }), _jsx("span", { className: "text-gray-500 ml-2", children: "/ mois" })] }), _jsx("ul", { className: "space-y-3 mb-6", children: plan.features.map((feature) => {
                                    const FeatureIcon = features[feature].icon;
                                    return (_jsxs("li", { className: "flex items-start", children: [_jsx(Check, { className: "h-5 w-5 text-primary-600 mr-2 mt-0.5" }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: features[feature].name }), _jsx("p", { className: "text-sm text-gray-500", children: features[feature].description })] })] }, feature));
                                }) }), _jsx("button", { onClick: () => setSelectedPlan(plan.id), className: `w-full py-3 px-4 rounded-md font-semibold ${selectedPlan === plan.id
                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`, children: "S\u00E9lectionner" })] }) }, plan.id))) }), selectedPlan && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Choisir un moyen de paiement" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Carte bancaire" }), _jsx("div", { id: "card-element", className: "p-4 border rounded-md" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Autres moyens de paiement" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { className: "w-full flex items-center justify-between p-4 border rounded-md hover:bg-gray-50", children: [_jsx("span", { children: "Mobile Money" }), _jsx(Info, { className: "h-5 w-5 text-gray-400" })] }), _jsxs("button", { className: "w-full flex items-center justify-between p-4 border rounded-md hover:bg-gray-50", children: [_jsx("span", { children: "Virement bancaire" }), _jsx(Info, { className: "h-5 w-5 text-gray-400" })] }), _jsxs("button", { className: "w-full flex items-center justify-between p-4 border rounded-md hover:bg-gray-50", children: [_jsx("span", { children: "PayPal" }), _jsx(Info, { className: "h-5 w-5 text-gray-400" })] })] })] })] }), _jsx("div", { className: "mt-8 flex justify-end", children: _jsx("button", { className: "bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700", children: "Proc\u00E9der au paiement" }) })] }))] }));
}
