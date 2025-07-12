import { useState } from 'react';
import supabase from '../utils/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password', // adapte selon ton port
    });

    if (error) {
      setMessage('❌ Erreur : ' + error.message);
    } else {
      setMessage('✅ Un email de réinitialisation a été envoyé.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mot de passe oublié</h2>
        <p className="text-sm text-gray-600 mb-6">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleReset}
          disabled={loading || !email}
          className={`w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
        </button>
        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
