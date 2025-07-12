import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Check, Building2, FileText, Wrench, Activity, Briefcase } from 'lucide-react';
import { upsertProClientProfile } from '../utils/proApi';
const plans = [
    {
        id: 'pro',
        name: 'Pro',
        price: 99,
        period: 'mois',
        maxUsers: 5,
        maxEquipment: 50,
        features: [
            'Portail utilisateur complet',
            'Gestion des équipements',
            'Suivi des commandes',
            'Documents techniques',
            'Maintenance préventive',
            'Notifications en temps réel',
            'Support email'
        ]
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 199,
        period: 'mois',
        maxUsers: 15,
        maxEquipment: 200,
        popular: true,
        features: [
            'Tout du plan Pro',
            'Gestion multi-sites',
            'Diagnostics avancés',
            'API personnalisée',
            'Support téléphonique',
            'Formation personnalisée',
            'Rapports avancés'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499,
        period: 'mois',
        maxUsers: 50,
        maxEquipment: 1000,
        features: [
            'Tout du plan Premium',
            'Déploiement sur site',
            'Intégration personnalisée',
            'Support dédié 24/7',
            'Formation complète',
            'SLA garanti',
            'Consulting inclus'
        ]
    }
];
export default function ProSubscription() {
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        siret: '',
        address: '',
        phone: '',
        contactPerson: '',
        email: ''
    });
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Ici, vous pouvez ajouter la logique de paiement (Stripe, etc.)
            const profile = await upsertProClientProfile({
                company_name: formData.companyName,
                siret: formData.siret,
                address: formData.address,
                phone: formData.phone,
                contact_person: formData.contactPerson,
                subscription_type: selectedPlan,
                subscription_status: 'active',
                max_users: plans.find(p => p.id === selectedPlan)?.maxUsers || 5
            });
            if (profile) {
                // Rediriger vers le portail Pro
                window.location.hash = '#pro';
            }
        }
        catch (error) {
            console.error('Erreur lors de la souscription:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-12", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx(Building2, { className: "h-16 w-16 text-primary-600 mx-auto mb-4" }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Portail Pro Minegrid" }), _jsx("p", { className: "text-xl text-gray-600 max-w-3xl mx-auto", children: "G\u00E9rez vos \u00E9quipements, commandes et maintenance en toute simplicit\u00E9. Acc\u00E9dez \u00E0 un portail professionnel d\u00E9di\u00E9 aux acteurs du BTP et des mines." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-12", children: plans.map((plan) => (_jsxs("div", { className: `relative bg-white rounded-lg shadow-lg p-8 ${plan.popular ? 'ring-2 ring-primary-500' : ''} ${selectedPlan === plan.id ? 'border-2 border-primary-500' : ''}`, children: [plan.popular && (_jsx("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2", children: _jsx("span", { className: "bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold", children: "Le plus populaire" }) })), _jsxs("div", { className: "text-center mb-6", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: plan.name }), _jsxs("div", { className: "text-4xl font-bold text-primary-600 mb-2", children: [plan.price, "\u20AC", _jsxs("span", { className: "text-lg text-gray-500 font-normal", children: ["/", plan.period] })] }), _jsxs("p", { className: "text-gray-600", children: ["Jusqu'\u00E0 ", plan.maxUsers, " utilisateurs \u2022 ", plan.maxEquipment, " \u00E9quipements"] })] }), _jsx("ul", { className: "space-y-3 mb-8", children: plan.features.map((feature, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx(Check, { className: "h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-gray-700", children: feature })] }, index))) }), _jsx("button", { onClick: () => setSelectedPlan(plan.id), className: `w-full py-3 px-4 rounded-lg font-semibold transition-colors ${selectedPlan === plan.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: selectedPlan === plan.id ? 'Plan sélectionné' : 'Sélectionner' })] }, plan.id))) }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 mb-6 text-center", children: ["Souscrire au plan ", plans.find(p => p.id === selectedPlan)?.name] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nom de l'entreprise *" }), _jsx("input", { type: "text", name: "companyName", value: formData.companyName, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "SIRET" }), _jsx("input", { type: "text", name: "siret", value: formData.siret, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "T\u00E9l\u00E9phone *" }), _jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contact principal *" }), _jsx("input", { type: "text", name: "contactPerson", value: formData.contactPerson, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Adresse" }), _jsx("textarea", { name: "address", value: formData.address, onChange: handleInputChange, rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "R\u00E9capitulatif de votre s\u00E9lection" }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-600", children: ["Plan ", plans.find(p => p.id === selectedPlan)?.name] }), _jsxs("span", { className: "font-semibold text-gray-900", children: [plans.find(p => p.id === selectedPlan)?.price, "\u20AC/mois"] })] })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? 'Traitement...' : 'Souscrire maintenant' }), _jsx("p", { className: "text-sm text-gray-500 text-center", children: "En souscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialit\u00E9." })] })] }), _jsxs("div", { className: "mt-16", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-12", children: "Fonctionnalit\u00E9s du portail Pro" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: [_jsxs("div", { className: "text-center", children: [_jsx(Briefcase, { className: "h-12 w-12 text-primary-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Gestion d'\u00E9quipements" }), _jsx("p", { className: "text-gray-600", children: "Suivez vos machines par num\u00E9ro de s\u00E9rie et QR-codes" })] }), _jsxs("div", { className: "text-center", children: [_jsx(FileText, { className: "h-12 w-12 text-primary-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Documents techniques" }), _jsx("p", { className: "text-gray-600", children: "Acc\u00E9dez \u00E0 tous vos manuels, certificats et garanties" })] }), _jsxs("div", { className: "text-center", children: [_jsx(Wrench, { className: "h-12 w-12 text-primary-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Maintenance" }), _jsx("p", { className: "text-gray-600", children: "Planifiez et suivez vos interventions de maintenance" })] }), _jsxs("div", { className: "text-center", children: [_jsx(Activity, { className: "h-12 w-12 text-primary-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Diagnostics" }), _jsx("p", { className: "text-gray-600", children: "Surveillez l'\u00E9tat de vos \u00E9quipements en temps r\u00E9el" })] })] })] })] }) }));
}
