import React, { useState } from 'react';
import { registerUser } from '../utils/api';
import { Crown, Star, Building, Check } from 'lucide-react';
import supabase from '../utils/supabaseClient';

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
    subscription: 'gratuit' | 'premium' | 'pro' | 'enterprise';
  }>({
    accountType: initialType,
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    subscription: 'gratuit',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubscriptionSelect = (subscription: 'gratuit' | 'premium' | 'pro' | 'enterprise') => {
    setFormData(prev => ({ ...prev, subscription }));
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
      
      // Créer automatiquement l'abonnement sélectionné
      if (formData.subscription !== 'gratuit') {
        await createSubscription(user.id, formData.subscription);
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('selectedSubscription', formData.subscription);
      window.location.hash = '#dashboard';
    } catch (err: any) {
      alert('Erreur lors de l\'inscription : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (userId: string, subscriptionType: string) => {
    try {
      const { error } = await supabase
        .from('pro_clients')
        .insert({
          user_id: userId,
          company_name: `${formData.firstName} ${formData.lastName}`,
          subscription_type: subscriptionType,
          subscription_status: 'active',
          subscription_start: new Date().toISOString().split('T')[0],
          max_users: subscriptionType === 'enterprise' ? 10 : 5
        });

      if (error) {
        console.error('Erreur création abonnement:', error);
      } else {
        console.log('✅ Abonnement créé:', subscriptionType);
      }
    } catch (error) {
      console.error('Erreur création abonnement:', error);
    }
  };

  const subscriptionPlans = [
    {
      id: 'gratuit',
      name: 'Gratuit',
      icon: <Star className="h-6 w-6" />,
      price: '0€',
      features: [
        'Publier des annonces',
        'Gestion basique',
        'Support communautaire',
        'Jusqu\'à 3 images par annonce'
      ],
      color: 'border-gray-300 bg-gray-50'
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Crown className="h-6 w-6" />,
      price: '29€/mois',
      features: [
        'Visibilité renforcée',
        'Jusqu\'à 10 images par annonce',
        'Support prioritaire',
        'Statistiques détaillées',
        'Badge Premium'
      ],
      color: 'border-purple-300 bg-purple-50'
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: <Building className="h-6 w-6" />,
      price: '79€/mois',
      features: [
        'Dashboard Pro personnalisé',
        'Support dédié',
        'Statistiques complètes',
        'Outils de gestion commerciale',
        'Gestion des contacts clients'
      ],
      color: 'border-blue-300 bg-blue-50'
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      icon: <Crown className="h-6 w-6" />,
      price: '199€/mois',
      features: [
        'Dashboard personnalisable',
        'Gestion multi-utilisateurs',
        'Support 24/7',
        'API dédiée',
        'Workflows automatisés',
        'Box IA + LLM dédié'
      ],
      color: 'border-orange-300 bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
          Créer votre compte
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire d'inscription */}
          <div className="bg-white shadow-md rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Informations personnelles</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
            </form>
          </div>

          {/* Sélection d'abonnement */}
          <div className="bg-white shadow-md rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Choisissez votre abonnement</h3>
            <div className="space-y-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.subscription === plan.id
                      ? `${plan.color} border-2 border-primary-500`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSubscriptionSelect(plan.id as any)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {plan.icon}
                      <div>
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <p className="text-2xl font-bold text-primary-600">{plan.price}</p>
                      </div>
                    </div>
                    {formData.subscription === plan.id && (
                      <Check className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-semibold"
            >
              {loading ? 'Création en cours...' : `Créer mon compte ${formData.subscription !== 'gratuit' ? `(${subscriptionPlans.find(p => p.id === formData.subscription)?.price})` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
