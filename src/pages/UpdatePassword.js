import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';
export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    // Récupère le token depuis l'URL et initialise la session
    useEffect(() => {
        const hash = window.location.hash.split('?')[1];
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        if (access_token) {
            supabase.auth.setSession({
                access_token,
                refresh_token: access_token, // requis même si non utilisé ici
            }).then(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []);
    const handleUpdatePassword = async () => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setMessage('❌ Erreur : ' + error.message);
        }
        else {
            setMessage('✅ Mot de passe mis à jour avec succès.');
        }
    };
    if (loading)
        return _jsx("p", { className: "p-4", children: "Chargement..." });
    return (_jsxs("div", { className: "max-w-md mx-auto mt-10 p-4 border rounded shadow", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "D\u00E9finir un nouveau mot de passe" }), _jsx("input", { type: "password", placeholder: "Nouveau mot de passe", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "w-full p-2 border rounded mb-4" }), _jsx("button", { onClick: handleUpdatePassword, className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Valider" }), message && (_jsxs("div", { className: "mt-4 space-y-2", children: [_jsx("p", { className: "text-sm text-gray-700", children: message }), _jsx("button", { onClick: () => window.location.replace(window.location.origin + '/#connexion'), className: "mt-2 bg-blue-600 text-white px-4 py-2 rounded", children: "Se connecter" }), _jsx("button", { onClick: () => window.location.replace(window.location.origin + '/#'), className: "mt-2 bg-gray-300 text-gray-800 px-4 py-2 rounded", children: "Retour \u00E0 l\u2019accueil" })] }))] }));
}
