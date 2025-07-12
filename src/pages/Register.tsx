import React, { useState } from 'react';
import { registerUser } from '../utils/api';
interface RegisterProps {
  initialType: 'client' | 'seller';
}

export default function Register({ initialType }: RegisterProps) {
  const [formData, setFormData] = useState<{
    accountType: 'client' | 'seller';
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
  }>({
    accountType: initialType, // ← 👈 utilise la prop ici directement
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      alert('Erreur lors de l’inscription : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Inscription
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Prénom</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Nom</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Téléphone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Mot de passe</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Confirmation</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                value="client"
                checked={formData.accountType === 'client'}
                onChange={handleInputChange}
              />
              Client
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="accountType"
                value="seller"
                checked={formData.accountType === 'seller'}
                onChange={handleInputChange}
              />
              Revendeur
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700"
          >
            {loading ? 'Création en cours...' : 'Créer un compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
