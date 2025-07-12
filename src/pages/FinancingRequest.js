import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import FinancingSimulator from '../components/FinancingSimulator';
import { Info, Upload, FileText, User, Banknote, FileCheck2, FileSignature, FileSpreadsheet, FileInput, ShieldCheck, ClipboardEdit, X } from 'lucide-react';
// Simuler récupération de l'utilisateur connecté
const mockUser = {
    company: 'Ma Société SARL',
    email: 'contact@masociete.com',
    manager: 'Jean Dupont',
};
const requiredDocs = [
    { key: 'kbis', label: "Extrait Kbis ou registre de commerce", icon: _jsx(FileText, { className: "h-5 w-5 text-primary-600" }) },
    { key: 'statuts', label: "Statuts de la société", icon: _jsx(FileSignature, { className: "h-5 w-5 text-primary-600" }) },
    { key: 'cni', label: "Carte d'identité du gérant", icon: _jsx(User, { className: "h-5 w-5 text-primary-600" }) },
    { key: 'rib', label: "RIB professionnel", icon: _jsx(Banknote, { className: "h-5 w-5 text-primary-600" }) },
    { key: 'bilan', label: "Dernier bilan ou synthèse activité", icon: _jsx(FileSpreadsheet, { className: "h-5 w-5 text-primary-600" }) },
    { key: 'devis', label: "Devis ou facture pro forma de l'engin", icon: _jsx(FileCheck2, { className: "h-5 w-5 text-primary-600" }) },
    { key: 'fiche', label: "Fiche technique du matériel", icon: _jsx(FileInput, { className: "h-5 w-5 text-primary-600" }) },
];
export default function FinancingRequest() {
    const [uploadedDocs, setUploadedDocs] = useState({});
    const [apport, setApport] = useState('');
    const [note, setNote] = useState('');
    const [machinePrice, setMachinePrice] = useState(50000);
    const [success, setSuccess] = useState(false);
    // Simuler sécurité utilisateur connecté
    const user = mockUser; // Remplacer par useAuth() ou contexte réel
    if (!user) {
        window.location.href = '/login';
        return null;
    }
    const handleFileChange = (key, file) => {
        setUploadedDocs((prev) => ({ ...prev, [key]: file }));
    };
    const handleRemoveFile = (key) => {
        setUploadedDocs((prev) => ({ ...prev, [key]: null }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Envoyer les données et fichiers à l'API/n8n
        setSuccess(true);
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto py-10 px-4", children: [_jsx("h1", { className: "text-3xl font-bold mb-8 text-gray-900", children: "Demander un financement" }), _jsx("div", { className: "mb-10", children: _jsx(FinancingSimulator, { machinePrice: machinePrice }) }), _jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-2xl shadow-xl p-8 space-y-8", children: [_jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center text-gray-800", children: [_jsx(ShieldCheck, { className: "h-6 w-6 text-green-600 mr-2" }), "Accord de principe \u2014 Dossier simplifi\u00E9"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Soci\u00E9t\u00E9" }), _jsx("input", { type: "text", value: user.company, disabled: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: user.email, disabled: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "G\u00E9rant" }), _jsx("input", { type: "text", value: user.manager, disabled: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Apport disponible (\u20AC)" }), _jsx("input", { type: "number", value: apport, onChange: e => setApport(e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Note explicative (utilit\u00E9, chantiers vis\u00E9s...)" }), _jsx("textarea", { value: note, onChange: e => setNote(e.target.value), rows: 3, className: "w-full rounded-md border border-gray-300 px-3 py-2", placeholder: "Ex : Achat pour chantier X, client Y..." })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-gray-900 mb-2 flex items-center", children: [_jsx(ClipboardEdit, { className: "h-5 w-5 text-primary-600 mr-2" }), "Documents \u00E0 fournir"] }), _jsx("ul", { className: "space-y-3", children: requiredDocs.map(doc => (_jsxs("li", { className: "flex items-center gap-3 bg-primary-50 rounded-lg px-3 py-2", children: [doc.icon, _jsx("span", { className: "flex-1 text-gray-700", children: doc.label }), uploadedDocs[doc.key] ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-green-700 text-xs font-medium", children: uploadedDocs[doc.key]?.name }), _jsx("button", { type: "button", onClick: () => handleRemoveFile(doc.key), className: "text-red-500 hover:text-red-700", children: _jsx(X, { className: "h-4 w-4" }) })] })) : (_jsxs("label", { className: "inline-block cursor-pointer bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-md border border-primary-200 text-xs font-medium transition-colors", children: [_jsx(Upload, { className: "h-4 w-4 inline mr-1" }), "T\u00E9l\u00E9charger", _jsx("input", { type: "file", className: "hidden", onChange: e => handleFileChange(doc.key, e.target.files?.[0] || null) })] }))] }, doc.key))) })] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-700 shadow-md transition-colors", children: "Envoyer la demande" }), success && (_jsx("div", { className: "mt-4 p-3 bg-green-50 text-green-800 rounded-lg border border-green-200", children: "Votre demande a bien \u00E9t\u00E9 envoy\u00E9e. Un conseiller vous contactera sous 24h." })), _jsxs("div", { className: "mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start", children: [_jsx(Info, { className: "h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-yellow-800", children: [_jsx("p", { className: "font-medium", children: "Dossier simplifi\u00E9" }), _jsx("p", { className: "text-xs mt-1", children: "Fournissez au moins les documents principaux pour acc\u00E9l\u00E9rer l'accord de principe. Les pi\u00E8ces compl\u00E9mentaires pourront \u00EAtre demand\u00E9es plus tard." })] })] })] })] }));
}
