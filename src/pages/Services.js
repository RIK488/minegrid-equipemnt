import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Truck, PenTool as Tools, Shield, Clock, Wrench, BookOpen, HeartHandshake, HardHat, Wallet } from 'lucide-react';
const serviceGroups = {
    financement: ['financement', 'location-horaire'],
    maintenance: ['maintenance-réparation', 'installation-configuration'],
    formation: ['formation-certification', 'conseil-expertise'],
    support: ['garantie-assurance', 'securite-conformite', 'transport-livraison']
};
const services = [
    {
        id: 'financement',
        icon: Wallet,
        title: 'Financement',
        description: 'Solutions de financement pour l’acquisition de vos équipements',
        details: [
            'Crédit-bail et leasing',
            'Financement à taux préférentiel',
            'Partenariats bancaires',
            'Accompagnement personnalisé'
        ]
    },
    {
        id: 'transport-livraison',
        icon: Truck,
        title: 'Transport & Livraison',
        description: 'Service de transport sécurisé et livraison rapide partout en Afrique',
        details: [
            'Transport international et domestique',
            'Suivi en temps réel',
            'Assurance transport incluse',
            'Documentation douanière complète'
        ]
    },
    {
        id: 'maintenance-réparation',
        icon: Tools,
        title: 'Maintenance & Réparation',
        description: 'Équipe technique qualifiée pour l\'entretien et la réparation de vos équipements',
        details: [
            'Maintenance préventive',
            'Réparations d\'urgence',
            'Diagnostics avancés',
            'Pièces d\'origine garanties'
        ]
    },
    {
        id: 'garantie-assurance',
        icon: Shield,
        title: 'Garantie & Assurance',
        description: 'Protection complète de vos investissements avec nos garanties étendues',
        details: [
            'Garantie constructeur',
            'Extensions de garantie',
            'Assurance tous risques',
            'Support juridique'
        ]
    },
    {
        id: 'location-horaire',
        icon: Clock,
        title: 'Location Horaire',
        description: 'Solutions de location flexibles adaptées à vos besoins temporaires',
        details: [
            'Location courte durée',
            'Location longue durée',
            'Options d\'achat',
            'Maintenance incluse'
        ]
    },
    {
        id: 'installation-configuration',
        icon: Wrench,
        title: 'Installation & Configuration',
        description: 'Service complet d\'installation et de mise en service de vos équipements',
        details: [
            'Installation sur site',
            'Configuration personnalisée',
            'Formation initiale',
            'Tests de performance'
        ]
    },
    {
        id: 'formation-certification',
        icon: BookOpen,
        title: 'Formation & Certification',
        description: 'Programmes de formation pour vos opérateurs et techniciens',
        details: [
            'Formation théorique',
            'Formation pratique',
            'Certification officielle',
            'Mise à niveau régulière'
        ]
    },
    {
        id: 'conseil-expertise',
        icon: HeartHandshake,
        title: 'Conseil & Expertise',
        description: 'Accompagnement personnalisé pour optimiser vos opérations',
        details: [
            'Audit technique',
            'Optimisation des coûts',
            'Études de faisabilité',
            'Recommandations stratégiques'
        ]
    },
    {
        id: 'sécurité-conformité',
        icon: HardHat,
        title: 'Sécurité & Conformité',
        description: 'Services de mise en conformité et audit de sécurité',
        details: [
            'Inspections régulières',
            'Mise aux normes',
            'Documentation technique',
            'Protocoles de sécurité'
        ]
    }
];
export default function Services({ service }) {
    const [selectedService, setSelectedService] = React.useState(null);
    const filteredServices = service && serviceGroups[service]
        ? services.filter((s) => serviceGroups[service].includes(s.id))
        : services;
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Nos Services" }), _jsx("p", { className: "text-xl max-w-3xl mx-auto", children: "Une gamme compl\u00E8te de services professionnels pour r\u00E9pondre \u00E0 tous vos besoins en \u00E9quipements miniers et de construction" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: filteredServices.map((srv, index) => {
                    const Icon = srv.icon;
                    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md transition-all duration-300 cursor-pointer hover:shadow-lg", onClick: () => setSelectedService(selectedService === index ? null : index), children: [_jsx(Icon, { className: "h-12 w-12 mb-4 mx-auto" }), _jsx("h3", { className: "text-xl font-semibold mb-2 text-center", children: srv.title }), _jsx("p", { className: "text-center mb-4", children: srv.description }), _jsxs("div", { className: `overflow-hidden transition-all duration-300 ${selectedService === index ? 'max-h-96' : 'max-h-0'}`, children: [_jsx("ul", { className: "mt-4 space-y-2", children: srv.details.map((detail, idx) => (_jsxs("li", { className: "flex items-center", children: [_jsx("div", { className: "w-2 h-2 bg-gray-300 rounded-full mr-2" }), detail] }, idx))) }), _jsx("button", { className: "mt-6 w-full bg-orange-100 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors text-orange-700 font-medium", children: "En savoir plus" })] })] }, index));
                }) }), _jsx("div", { className: "mt-16 bg-white rounded-xl p-8", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Service Sur Mesure" }), _jsx("p", { className: "mb-6", children: "Vous avez des besoins sp\u00E9cifiques ? Notre \u00E9quipe d'experts est l\u00E0 pour cr\u00E9er une solution adapt\u00E9e \u00E0 vos exigences particuli\u00E8res." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx("a", { href: "#contact", className: "inline-block bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors", children: "Nous Contacter" }), _jsx("a", { href: "tel:+212XXXXXXXX", className: "inline-block bg-gray-100 px-8 py-3 rounded-md hover:bg-gray-200 transition-colors", children: "Appeler Maintenant" })] })] }) }), _jsxs("div", { className: "mt-16 grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Pourquoi Nous Choisir ?" }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "Service garanti 100%"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(Clock, { className: "h-5 w-5 mr-2" }), "Disponibilit\u00E9 24/7"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(Tools, { className: "h-5 w-5 mr-2" }), "Experts certifi\u00E9s"] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Zone de Couverture" }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center", children: [_jsx(Truck, { className: "h-5 w-5 mr-2" }), "Afrique de l'Ouest"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(Truck, { className: "h-5 w-5 mr-2" }), "Afrique Centrale"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(Truck, { className: "h-5 w-5 mr-2" }), "Afrique du Nord"] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "Certifications" }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "ISO 9001:2015"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "ISO 14001:2015"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "OHSAS 18001"] })] })] })] })] }));
}
