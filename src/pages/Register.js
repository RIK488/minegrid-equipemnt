import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { registerUser } from '../utils/api';
export default function Register({ initialType }) {
    const [formData, setFormData] = useState({
        accountType: initialType, // ← 👈 utilise la prop ici directement
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }
        try {
            setLoading(true);
            const { user } = await registerUser(formData);
            localStorage.setItem('user', JSON.stringify(user));
            window.location.hash = '#dashboard';
        }
        catch (err) {
            alert('Erreur lors de l’inscription : ' + err.message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md mx-auto bg-white shadow-md rounded-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-gray-900 text-center", children: "Inscription" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Pr\u00E9nom" }), _jsx("input", { name: "firstName", type: "text", value: formData.firstName, onChange: handleInputChange, className: "w-full border rounded px-3 py-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Nom" }), _jsx("input", { name: "lastName", type: "text", value: formData.lastName, onChange: handleInputChange, className: "w-full border rounded px-3 py-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700", children: "T\u00E9l\u00E9phone" }), _jsx("input", { name: "phone", type: "tel", value: formData.phone, onChange: handleInputChange, className: "w-full border rounded px-3 py-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Email" }), _jsx("input", { name: "email", type: "email", value: formData.email, onChange: handleInputChange, className: "w-full border rounded px-3 py-2", required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Mot de passe" }), _jsx("input", { name: "password", type: "password", value: formData.password, onChange: handleInputChange, className: "w-full border rounded px-3 py-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Confirmation" }), _jsx("input", { name: "confirmPassword", type: "password", value: formData.confirmPassword, onChange: handleInputChange, className: "w-full border rounded px-3 py-2", required: true })] })] }), _jsxs("div", { className: "flex gap-4 mt-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "accountType", value: "client", checked: formData.accountType === 'client', onChange: handleInputChange }), "Client"] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "accountType", value: "seller", checked: formData.accountType === 'seller', onChange: handleInputChange }), "Revendeur"] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700", children: loading ? 'Création en cours...' : 'Créer un compte' })] })] }) }));
}
