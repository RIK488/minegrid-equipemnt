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
    } else {
      setLoading(false);
    }
  }, []);

  const handleUpdatePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage('❌ Erreur : ' + error.message);
    } else {
      setMessage('✅ Mot de passe mis à jour avec succès.');
    }
  };

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Définir un nouveau mot de passe</h2>

      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleUpdatePassword}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Valider
      </button>

      {message && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-700">{message}</p>

          <button
  onClick={() => window.location.replace(window.location.origin + '/#connexion')}
  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
>
  Se connecter
</button>

<button
  onClick={() => window.location.replace(window.location.origin + '/#')}
  className="mt-2 bg-gray-300 text-gray-800 px-4 py-2 rounded"
>
  Retour à l’accueil
</button>

        </div>
      )}
    </div>
  );
}
