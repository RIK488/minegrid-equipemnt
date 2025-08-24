import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  Users, 
  Shield, 
  Zap, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  Video,
  Headphones,
  BarChart3
} from 'lucide-react';

interface SupportChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  availability: string;
  responseTime: string;
  contactInfo: string;
  isAvailable: boolean;
}

const PrioritySupport: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const supportChannels: SupportChannel[] = [
    {
      id: 'phone',
      name: 'Support Téléphonique',
      description: 'Appel direct avec un expert technique',
      icon: <Phone className="h-6 w-6" />,
      availability: '24h/24 - 7j/7',
      responseTime: 'Immédiat',
      contactInfo: '+212 5 22 34 56 78',
      isAvailable: true
    },
    {
      id: 'chat',
      name: 'Chat en Direct',
      description: 'Conversation en temps réel avec notre équipe',
      icon: <MessageSquare className="h-6 w-6" />,
      availability: '24h/24 - 7j/7',
      responseTime: '< 2 minutes',
      contactInfo: 'Chat intégré sur la page',
      isAvailable: true
    },
    {
      id: 'email',
      name: 'Email Prioritaire',
      description: 'Support par email avec priorité maximale',
      icon: <Mail className="h-6 w-6" />,
      availability: '24h/24 - 7j/7',
      responseTime: '< 30 minutes',
      contactInfo: 'support@minegrid-equipment.com',
      isAvailable: true
    },
    {
      id: 'video',
      name: 'Support Vidéo',
      description: 'Appel vidéo avec partage d\'écran',
      icon: <Video className="h-6 w-6" />,
      availability: '9h-18h (Lun-Ven)',
      responseTime: '< 15 minutes',
      contactInfo: 'Réservation en ligne',
      isAvailable: true
    }
  ];

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    if (channelId === 'chat') {
      // Ouvrir le chat widget
      const chatButton = document.querySelector('[data-chat-widget]') as HTMLElement;
      if (chatButton) {
        chatButton.click();
      }
    } else if (channelId === 'email') {
      setShowContactForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a 
                href="#dashboard/services"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                Support Prioritaire 24/7
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">Service Entreprise Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bannière de statut */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">Support Disponible</h2>
              <p className="text-green-700">Notre équipe technique est disponible 24h/24 pour vous assister</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canaux de support */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Headphones className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Canaux de Support</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportChannels.map((channel) => (
                  <div 
                    key={channel.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedChannel === channel.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                    onClick={() => handleChannelSelect(channel.id)}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-lg mr-3 ${
                        channel.isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {channel.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-600">{channel.description}</p>
                      </div>
                      {channel.isAvailable && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Disponibilité :</span>
                        <span className="font-medium text-gray-900">{channel.availability}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Temps de réponse :</span>
                        <span className="font-medium text-orange-600">{channel.responseTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Contact :</span>
                        <span className="font-medium text-gray-900">{channel.contactInfo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire de contact */}
            {showContactForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Envoyer un message prioritaire</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sujet <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Décrivez brièvement votre problème"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Détaillez votre demande..."
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut du service */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Statut du Service</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Disponibilité :</span>
                  <span className="text-sm font-medium text-green-600">Opérationnel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps de réponse :</span>
                  <span className="text-sm font-medium text-orange-600">&lt; 2 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Experts disponibles :</span>
                  <span className="text-sm font-medium text-green-600">12</span>
                </div>
              </div>
            </div>

            {/* FAQ Rapide */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Questions Fréquentes</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900 mb-1">Comment obtenir une clé API ?</h4>
                  <p className="text-gray-600">Contactez-nous via le chat ou par téléphone pour demander votre clé API personnalisée.</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900 mb-1">Problème de connexion ?</h4>
                  <p className="text-gray-600">Vérifiez vos identifiants et contactez-nous si le problème persiste.</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900 mb-1">Intégration technique ?</h4>
                  <p className="text-gray-600">Notre équipe peut vous accompagner dans l'intégration de nos services.</p>
                </div>
              </div>
            </div>

            {/* Ressources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ressources</h3>
              <div className="space-y-2">
                <a href="#api-docs" className="flex items-center text-sm text-orange-600 hover:text-orange-800">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentation API
                </a>
                <a href="#dashboard" className="flex items-center text-sm text-orange-600 hover:text-orange-800">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Tableau de bord
                </a>
                <a href="#contact" className="flex items-center text-sm text-orange-600 hover:text-orange-800">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact général
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrioritySupport; 