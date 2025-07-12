import React from 'react';
import {
  BarChart3, TrendingUp, Package, Users, DollarSign, FileText, Wrench, AlertTriangle, Calendar, Target
} from 'lucide-react';

// Données simulées pour le dashboard vendeur
const mockData = {
  performance: {
    score: 78,
    target: 85,
    rank: 3,
    totalVendors: 12,
    sales: 2144000,
    salesTarget: 2500000,
    growth: 12.5,
    growthTarget: 15,
    prospects: 45,
    activeProspects: 12,
    responseTime: 2.1,
    responseTarget: 1.5,
    recommendations: [
      { action: 'Relancer 2 prospects inactifs', impact: '+8%', priority: 'high' },
      { action: 'Optimiser 1 annonce', impact: '+3%', priority: 'medium' },
      { action: 'Contacter 3 nouveaux leads', impact: '+5%', priority: 'medium' }
    ],
    trends: {
      sales: 'up',
      growth: 'up',
      prospects: 'stable',
      responseTime: 'down'
    }
  },
  salesHistory: [
    { month: 'Jan', value: 125000 },
    { month: 'Fév', value: 145000 },
    { month: 'Mar', value: 138000 },
    { month: 'Avr', value: 162000 },
    { month: 'Mai', value: 178000 },
    { month: 'Juin', value: 195000 },
    { month: 'Juil', value: 182000 },
    { month: 'Août', value: 168000 },
    { month: 'Sep', value: 185000 },
    { month: 'Oct', value: 203000 },
    { month: 'Nov', value: 218000 },
    { month: 'Déc', value: 245000 }
  ],
  stock: [
    { name: 'CAT 320D', status: 'Stock dormant', priority: 'high' },
    { name: 'JCB 3CX', status: 'Stock faible', priority: 'medium' },
    { name: 'Komatsu PC200', status: 'Stock optimal', priority: 'low' }
  ],
  leads: [
    { name: 'Mines du Sud SA', info: 'Intérêt pour CAT 950GC', score: 85, status: 'En cours' },
    { name: 'Bati Plus Construction', info: 'Devis JCB 3CX envoyé', score: 65, status: 'En attente' },
    { name: 'Carrière Agadir', info: 'Premier contact', score: 45, status: 'Nouveau' }
  ],
  actions: [
    { title: 'Relancer Ahmed Benali', impact: '+85%', priority: 'high', date: '25/01/2024' },
    { title: 'Préparer présentation technique', impact: '+90%', priority: 'high', date: '27/01/2024' },
    { title: 'Mise à jour catalogue produits', impact: '+15%', priority: 'low', date: '28/01/2024' }
  ],
  kpis: {
    ca: 2144000,
    ventes: 19,
    croissance: 12.5,
    ticket: 128947
  },
  catalog: [
    { name: 'CAT 320D', status: 'Disponible', prix: 850000 },
    { name: 'JCB 3CX', status: 'Réservé', prix: 420000 },
    { name: 'Komatsu PC200', status: 'Disponible', prix: 680000 }
  ],
  quotes: [
    { title: 'Devis CAT 320D', status: 'En attente', montant: 850000 },
    { title: 'Devis JCB 3CX', status: 'Relancé', montant: 420000 },
    { title: 'Devis Komatsu PC200', status: 'Accepté', montant: 680000 }
  ],
  afterSales: [
    { title: 'Maintenance CAT 320D', status: 'Programmée', date: '30/01/2024' },
    { title: 'Réparation JCB 3CX', status: 'En cours', date: '28/01/2024' },
    { title: 'Contrôle Komatsu PC200', status: 'Terminée', date: '20/01/2024' }
  ],
  marketTrends: [
    { name: 'Pelles hydrauliques', value: 1250000, trend: 'up' },
    { name: 'Chargeuses-pelleteuses', value: 450000, trend: 'stable' },
    { name: 'Pelles mécaniques', value: 680000, trend: 'down' }
  ],
  analytics: [
    { label: 'CA Total', value: 2144000, trend: 12.5 },
    { label: 'Ventes', value: 19, trend: 8.2 },
    { label: 'Ticket moyen', value: 128947, trend: 4.1 },
    { label: 'Taux conversion', value: 68, trend: -2.3 }
  ]
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-orange-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const VendeurDashboardLegacy = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Score de Performance Commerciale */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center"><Target className="h-6 w-6 mr-2 text-orange-600" />Score de Performance Commerciale</h2>
          <span className="text-sm text-gray-500">Rang {mockData.performance.rank}/{mockData.performance.totalVendors}</span>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-orange-600">{mockData.performance.score}</div>
            <div className="text-sm text-gray-500 mb-2">/ 100</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="h-2 rounded-full bg-orange-500" style={{ width: `${mockData.performance.score}%` }}></div>
            </div>
            <div className="text-xs text-gray-500">Objectif: {mockData.performance.target}/100</div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Ventes</div>
              <div className="text-lg font-semibold text-gray-900">{mockData.performance.sales} MAD</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Croissance</div>
              <div className="text-lg font-semibold text-gray-900">+{mockData.performance.growth}%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Prospects actifs</div>
              <div className="text-lg font-semibold text-gray-900">{mockData.performance.activeProspects}/{mockData.performance.prospects}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Réactivité</div>
              <div className="text-lg font-semibold text-gray-900">{mockData.performance.responseTime}h</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />Recommandations IA</h4>
          <div className="flex flex-wrap gap-3">
            {mockData.performance.recommendations.map((rec, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium bg-orange-50 ${getPriorityColor(rec.priority)}`}>{rec.action} <span className="ml-1 text-gray-400">({rec.impact})</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* Historique des ventes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><BarChart3 className="h-6 w-6 mr-2 text-green-600" />Évolution des ventes</h2>
        <div className="flex space-x-2 mb-2">
          {mockData.salesHistory.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-orange-500 mb-1"></div>
              <div className="text-xs text-gray-500">{item.month}</div>
              <div className="text-sm font-semibold text-gray-900">{item.value} MAD</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statut du stock */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><Package className="h-6 w-6 mr-2 text-blue-600" />Statut du stock</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {mockData.stock.map((item, i) => (
            <div key={i} className="flex-1 border rounded-lg p-4 flex flex-col items-center">
              <div className={`text-lg font-bold ${getPriorityColor(item.priority)}`}>{item.name}</div>
              <div className="text-sm text-gray-500 mb-2">{item.status}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>{item.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline commercial / Prospects */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><Users className="h-6 w-6 mr-2 text-indigo-600" />Pipeline commercial</h2>
        <div className="space-y-2">
          {mockData.leads.map((lead, i) => (
            <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{lead.name}</div>
                <div className="text-xs text-gray-500">{lead.info}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600">Score: {lead.score}%</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{lead.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions commerciales prioritaires */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><AlertTriangle className="h-6 w-6 mr-2 text-red-600" />Actions commerciales prioritaires</h2>
        <div className="space-y-2">
          {mockData.actions.map((action, i) => (
            <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{action.title}</div>
                <div className="text-xs text-gray-500">Impact: {action.impact}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(action.priority)}`}>{action.priority}</span>
              <span className="text-xs text-gray-400 ml-2">{action.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><DollarSign className="h-6 w-6 mr-2 text-green-600" />KPIs Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500">CA du mois</div>
            <div className="text-lg font-bold text-gray-900">{mockData.kpis.ca} MAD</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500">Ventes</div>
            <div className="text-lg font-bold text-gray-900">{mockData.kpis.ventes}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500">Croissance</div>
            <div className="text-lg font-bold text-gray-900">+{mockData.kpis.croissance}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500">Ticket moyen</div>
            <div className="text-lg font-bold text-gray-900">{mockData.kpis.ticket} MAD</div>
          </div>
        </div>
      </div>

      {/* Catalogue équipements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><Package className="h-6 w-6 mr-2 text-blue-600" />Catalogue équipements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockData.catalog.map((item, i) => (
            <div key={i} className="border rounded-lg p-4 flex flex-col items-center">
              <div className="font-bold text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500 mb-2">{item.status}</div>
              <div className="text-lg font-semibold text-green-600">{item.prix} MAD</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gestion des devis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><FileText className="h-6 w-6 mr-2 text-indigo-600" />Gestion des devis</h2>
        <div className="space-y-2">
          {mockData.quotes.map((quote, i) => (
            <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{quote.title}</div>
                <div className="text-xs text-gray-500">Montant: {quote.montant} MAD</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{quote.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Service après-vente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><Wrench className="h-6 w-6 mr-2 text-teal-600" />Service après-vente</h2>
        <div className="space-y-2">
          {mockData.afterSales.map((item, i) => (
            <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500">{item.date}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tendances du marché */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><TrendingUp className="h-6 w-6 mr-2 text-green-600" />Tendances du marché</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockData.marketTrends.map((item, i) => (
            <div key={i} className="border rounded-lg p-4 flex flex-col items-center">
              <div className="font-bold text-gray-900">{item.name}</div>
              <div className="text-lg font-semibold text-green-600">{item.value} MAD</div>
              <span className={`text-xs px-2 py-1 rounded-full ${item.trend === 'up' ? 'bg-green-100 text-green-600' : item.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{item.trend}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics avancées */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold flex items-center mb-4"><BarChart3 className="h-6 w-6 mr-2 text-purple-600" />Analytics commerciales avancées</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockData.analytics.map((item, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="text-lg font-bold text-gray-900">{item.value}</div>
              <div className={`text-xs ${item.trend > 0 ? 'text-green-600' : item.trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>{item.trend > 0 ? '+' : ''}{item.trend}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendeurDashboardLegacy; 