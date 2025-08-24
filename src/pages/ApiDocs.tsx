import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Shield, 
  Zap, 
  Database, 
  Globe,
  ArrowLeft,
  BookOpen,
  Key,
  Lock,
  Users,
  BarChart3,
  Package,
  MessageSquare
} from 'lucide-react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: string[];
  response?: string;
  example?: string;
}

const ApiDocs: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const endpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/api/machines',
      description: 'Récupérer la liste des équipements',
      parameters: ['limit', 'offset', 'category', 'brand'],
      response: 'Liste paginée des équipements',
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.minegrid-equipment.com/api/machines'
    },
    {
      method: 'GET',
      path: '/api/machines/{id}',
      description: 'Récupérer les détails d\'un équipement',
      parameters: ['id'],
      response: 'Détails complets de l\'équipement',
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.minegrid-equipment.com/api/machines/123'
    },
    {
      method: 'POST',
      path: '/api/machines',
      description: 'Créer un nouvel équipement',
      parameters: ['name', 'brand', 'model', 'year', 'price'],
      response: 'Équipement créé avec ID',
      example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"name":"Excavatrice","brand":"Komatsu","model":"PC200"}\' https://api.minegrid-equipment.com/api/machines'
    },
    {
      method: 'GET',
      path: '/api/orders',
      description: 'Récupérer les commandes',
      parameters: ['status', 'date_from', 'date_to'],
      response: 'Liste des commandes',
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.minegrid-equipment.com/api/orders?status=pending'
    },
    {
      method: 'POST',
      path: '/api/orders',
      description: 'Créer une nouvelle commande',
      parameters: ['machine_id', 'quantity', 'delivery_address'],
      response: 'Commande créée avec ID',
      example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"machine_id":"123","quantity":1}\' https://api.minegrid-equipment.com/api/orders'
    },
    {
      method: 'GET',
      path: '/api/analytics/sales',
      description: 'Récupérer les analytics de vente',
      parameters: ['period', 'group_by'],
      response: 'Données d\'analytics',
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.minegrid-equipment.com/api/analytics/sales?period=monthly'
    }
  ];

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  // Fonction pour le défilement fluide vers les sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
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
                Documentation API
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">API d'intégration Minegrid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-2">
                <button 
                  onClick={() => scrollToSection('authentication')}
                  className="block text-sm text-orange-600 hover:text-orange-800 text-left w-full"
                >
                  Authentification
                </button>
                <button 
                  onClick={() => scrollToSection('endpoints')}
                  className="block text-sm text-orange-600 hover:text-orange-800 text-left w-full"
                >
                  Endpoints
                </button>
                <button 
                  onClick={() => scrollToSection('examples')}
                  className="block text-sm text-orange-600 hover:text-orange-800 text-left w-full"
                >
                  Exemples
                </button>
                <button 
                  onClick={() => scrollToSection('sdk')}
                  className="block text-sm text-orange-600 hover:text-orange-800 text-left w-full"
                >
                  SDK & Bibliothèques
                </button>
                <button 
                  onClick={() => scrollToSection('support')}
                  className="block text-sm text-orange-600 hover:text-orange-800 text-left w-full"
                >
                  Support
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section Authentification */}
            <div id="authentication" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Authentification</h2>
              </div>
              <p className="text-gray-600 mb-4">
                L'API Minegrid utilise l'authentification par token Bearer. Vous devez inclure votre clé API dans l'en-tête Authorization de chaque requête.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Exemple d'en-tête :</span>
                  <button 
                    onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                    className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors"
                  >
                    {copiedEndpoint === 'auth' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <code className="text-sm text-gray-800">Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">🔑 Obtenir votre clé API</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Pour obtenir votre clé API, contactez notre équipe technique via le support prioritaire.
                </p>
                <button 
                  onClick={() => window.open('#contact', '_blank')}
                  className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Demander une clé API
                </button>
              </div>
            </div>

            {/* Section Endpoints */}
            <div id="endpoints" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Endpoints API</h2>
              </div>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(endpoint.example || '', `endpoint-${index}`)}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {copiedEndpoint === `endpoint-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <p className="text-gray-600 mb-3">{endpoint.description}</p>
                    {endpoint.parameters && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-700">Paramètres :</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {endpoint.parameters.map((param, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {param}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {endpoint.example && (
                      <div className="bg-gray-50 rounded p-3">
                        <code className="text-xs text-gray-800 break-all">{endpoint.example}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section Exemples */}
            <div id="examples" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Code className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Exemples d'intégration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">JavaScript/Node.js</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.minegrid-equipment.com',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

// Récupérer les équipements
const machines = await api.get('/api/machines');

// Créer une commande
const order = await api.post('/api/orders', {
  machine_id: '123',
  quantity: 1
});`}
                  </pre>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Python</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

# Récupérer les équipements
response = requests.get(
    'https://api.minegrid-equipment.com/api/machines',
    headers=headers
)

# Créer une commande
order_data = {
    'machine_id': '123',
    'quantity': 1
}
response = requests.post(
    'https://api.minegrid-equipment.com/api/orders',
    json=order_data,
    headers=headers
)`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Section SDK */}
            <div id="sdk" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Package className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">SDK & Bibliothèques</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <h3 className="font-medium text-gray-900 mb-2">npm</h3>
                  <code className="text-sm text-gray-600">npm install minegrid-api</code>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🐍</div>
                  <h3 className="font-medium text-gray-900 mb-2">pip</h3>
                  <code className="text-sm text-gray-600">pip install minegrid-api</code>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
                  <a href="#" className="text-sm text-orange-600 hover:text-orange-800">Voir la documentation complète</a>
                </div>
              </div>
            </div>

            {/* Section Support */}
            <div id="support" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <MessageSquare className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Support API</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">💬 Support technique</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Notre équipe technique est disponible 24/7 pour vous aider avec l'intégration de l'API.
                  </p>
                  <button 
                    onClick={() => window.open('#contact', '_blank')}
                    className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Contacter le support
                  </button>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">📊 Monitoring</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Surveillez l'utilisation de votre API et consultez les métriques de performance.
                  </p>
                  <button 
                    onClick={() => window.open('#dashboard', '_blank')}
                    className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Voir les métriques
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs; 