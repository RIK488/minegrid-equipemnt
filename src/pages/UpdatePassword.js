import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';
export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    // Récupère le token depuis l'URL et initialise la session
    useEffect(() => {
        // Supabase envoie les paramètres dans l'URL après le hash
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');

        console.log('🔍 Tokens reçus:', { access_token: !!access_token, refresh_token: !!refresh_token });

        if (access_token) {
            supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token || access_token,
            }).then(({ error }) => {
                if (error) {
                    console.error('❌ Erreur session:', error);
                    setMessage('❌ Erreur de session: ' + error.message);
                } else {
                    console.log('✅ Session initialisée avec succès');
                }
                setLoading(false);
            });
        } else {
            console.log('⚠️ Aucun token trouvé dans l\'URL');
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
