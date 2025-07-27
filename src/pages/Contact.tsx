import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Building2, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    service: 'general'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'envoi du formulaire
    setSubmitted(true);
    
    // Temporairement : activer l'abonnement entreprise après envoi du message
    setTimeout(() => {
      setSubmitted(false);
      // Rediriger vers le dashboard avec l'abonnement entreprise activé
      window.location.href = '/#dashboard/overview';
      
      // Stocker temporairement l'abonnement entreprise dans localStorage
      localStorage.setItem('tempSubscription', 'entreprise');
      localStorage.setItem('tempHasActiveSubscription', 'true');
      
      // Afficher un message de confirmation
      alert('Message envoyé avec succès ! Accès temporaire à l\'abonnement Entreprise activé.');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos projets
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service concerné</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="general">Information générale</option>
                    <option value="sales">Ventes</option>
                    <option value="support">Support technique</option>
                    <option value="parts">Pièces détachées</option>
                    <option value="service">Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Envoyer le message
              </button>

              {/* Bouton temporaire pour valider la formule entreprise */}
              <div className="border-t pt-6 mt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">🔧 <strong>Fonctionnalité temporaire</strong></p>
                  <p className="text-xs text-gray-500">Validez directement l'abonnement Entreprise pour tester</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Activer directement l'abonnement entreprise
                    localStorage.setItem('userSubscription', 'entreprise');
                    localStorage.removeItem('subscriptionCancelled');
                    
                    // Rediriger vers le dashboard
                    window.location.href = '/#dashboard/overview';
                    
                    alert('✅ Abonnement Entreprise activé avec succès ! Vous pouvez maintenant accéder à votre tableau de bord.');
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg"
                >
                  🚀 Valider l'abonnement Entreprise
                </button>
              </div>

              {submitted && (
                <div className="bg-green-50 text-green-800 px-4 py-3 rounded-md">
                  Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nos Coordonnées</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-primary-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Siège Social</h3>
                  <p className="text-gray-600">
                  Q.I SIDI GHANEM 158, 1ER ETAGE BUREAU N 44<br />
                  40130 MARRAKECH<br />
                    Maroc
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Building2 className="h-6 w-6 text-primary-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Bureaux Régionaux</h3>
                  <p className="text-gray-600">
                    Dakar, Sénégal<br />
                    Abidjan, Côte d'Ivoire<br />
                    Douala, Cameroun
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Téléphone</h3>
                  <p className="text-gray-600">
                    Standard: +212 5XX-XXXXXX<br />
                    Support technique: +212 5XX-XXXXXX<br />
                    Service commercial: +212 5XX-XXXXXX
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-primary-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">
                    Information: contact@minegrid.equipement<br />
                    Support: support@minegrid.equipement<br />
                    Commercial: sales@minegrid.equipement
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-6 w-6 text-primary-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Heures d'ouverture</h3>
                  <p className="text-gray-600">
                    Lundi - Vendredi: 9h00 - 18h00<br />
                    Samedi: 9h00 - 13h00<br />
                    Dimanche: Fermé
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MessageSquare className="h-6 w-6 text-primary-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Support en ligne</h3>
                  <p className="text-gray-600">
                    Chat en direct disponible<br />
                    Lundi - Vendredi: 9h00 - 17h00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Support d'urgence 24/7</h3>
            <p className="text-gray-700 mb-4">
              Une urgence technique ? Notre équipe de support est disponible 24h/24 et 7j/7 pour les situations critiques.
            </p>
            <a
              href="tel:+212XXXXXXXX"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              <Phone className="h-5 w-5 mr-2" />
              Ligne d'urgence
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}