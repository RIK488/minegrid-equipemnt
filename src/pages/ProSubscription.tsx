import React, { useState } from 'react';
import { Check, Building2, Users, Shield, Clock, FileText, Wrench, Activity, Briefcase } from 'lucide-react';
import { upsertProClientProfile } from '../utils/proApi';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  maxUsers: number;
  maxEquipment: number;
}

const plans: Plan[] = [
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
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    siret: '',
    address: '',
    phone: '',
    contactPerson: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        subscription_type: selectedPlan as 'pro' | 'premium' | 'enterprise',
        subscription_status: 'active',
        max_users: plans.find(p => p.id === selectedPlan)?.maxUsers || 5
      });

      if (profile) {
        // Rediriger vers le portail Pro
        window.location.hash = '#pro';
      }
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Building2 className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portail Pro Minegrid
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gérez vos équipements, commandes et maintenance en toute simplicité. 
            Accédez à un portail professionnel dédié aux acteurs du BTP et des mines.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-primary-500' : ''
              } ${selectedPlan === plan.id ? 'border-2 border-primary-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {plan.price}€
                  <span className="text-lg text-gray-500 font-normal">/{plan.period}</span>
                </div>
                <p className="text-gray-600">
                  Jusqu'à {plan.maxUsers} utilisateurs • {plan.maxEquipment} équipements
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? 'Plan sélectionné' : 'Sélectionner'}
              </button>
            </div>
          ))}
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Souscrire au plan {plans.find(p => p.id === selectedPlan)?.name}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact principal *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Récapitulatif de votre sélection</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Plan {plans.find(p => p.id === selectedPlan)?.name}
                </span>
                <span className="font-semibold text-gray-900">
                  {plans.find(p => p.id === selectedPlan)?.price}€/mois
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Traitement...' : 'Souscrire maintenant'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              En souscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </form>
        </div>

        {/* Fonctionnalités détaillées */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Fonctionnalités du portail Pro
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion d'équipements</h3>
              <p className="text-gray-600">
                Suivez vos machines par numéro de série et QR-codes
              </p>
            </div>

            <div className="text-center">
              <FileText className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents techniques</h3>
              <p className="text-gray-600">
                Accédez à tous vos manuels, certificats et garanties
              </p>
            </div>

            <div className="text-center">
              <Wrench className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance</h3>
              <p className="text-gray-600">
                Planifiez et suivez vos interventions de maintenance
              </p>
            </div>

            <div className="text-center">
              <Activity className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnostics</h3>
              <p className="text-gray-600">
                Surveillez l'état de vos équipements en temps réel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 