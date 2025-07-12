// Copie fidèle du dashboard vendeur depuis le backup, structure complète, sidebar, header, widgets, helpers, hooks, styles, etc.
import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  Users, Package, Calendar, FileText, DollarSign, Wrench, BarChart3, TrendingUp, Mail, Globe, Zap, Plus, Save, Download, RefreshCw, User, Settings, Bell, X, Check, Layout, Info, Target, Brain, Lightbulb, Award, Percent, ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, AlertTriangle, Star, Maximize2, Minimize, MoreVertical, Square, Minus
} from 'lucide-react';
import { VendeurWidgets } from './widgets/VendeurWidgets';
import supabase from '../utils/supabaseClient';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Helpers d'origine (exemples)
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number) {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-orange-100';
  return 'bg-red-100';
}

function getScoreBarColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}

// Données mock pour le score de performance
const performanceData = {
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
};

// Données mock pour l'historique des ventes
const salesHistoryData = [
  { month: 'Jan', sales: 125000, units: 8, growth: 5.2, target: 120000, previousYear: 118000 },
  { month: 'Fév', sales: 145000, units: 10, growth: 12.4, target: 130000, previousYear: 129000 },
  { month: 'Mar', sales: 138000, units: 9, growth: -4.8, target: 140000, previousYear: 145000 },
  { month: 'Avr', sales: 162000, units: 11, growth: 17.4, target: 150000, previousYear: 138000 },
  { month: 'Mai', sales: 178000, units: 12, growth: 9.9, target: 160000, previousYear: 162000 },
  { month: 'Juin', sales: 195000, units: 13, growth: 9.6, target: 170000, previousYear: 178000 },
  { month: 'Juil', sales: 182000, units: 12, growth: -6.7, target: 180000, previousYear: 195000 },
  { month: 'Août', sales: 168000, units: 11, growth: -7.7, target: 175000, previousYear: 182000 },
  { month: 'Sep', sales: 185000, units: 12, growth: 10.1, target: 180000, previousYear: 168000 },
  { month: 'Oct', sales: 203000, units: 14, growth: 9.7, target: 190000, previousYear: 185000 },
  { month: 'Nov', sales: 218000, units: 15, growth: 7.4, target: 200000, previousYear: 203000 },
  { month: 'Déc', sales: 245000, units: 17, growth: 12.4, target: 220000, previousYear: 218000 }
];

// Données mock pour le statut du stock
const stockData = {
  totalProducts: 156,
  lowStock: 8,
  outOfStock: 3,
  overstocked: 5,
  totalValue: 2840000,
  alerts: [
    { product: 'Pelle hydraulique CAT 320', status: 'critical', quantity: 0, threshold: 2, value: 450000 },
    { product: 'Chargeur frontal JCB 3CX', status: 'warning', quantity: 1, threshold: 3, value: 280000 },
    { product: 'Excavatrice Komatsu PC200', status: 'warning', quantity: 2, threshold: 4, value: 320000 },
    { product: 'Bulldozer CAT D6', status: 'critical', quantity: 0, threshold: 1, value: 380000 },
    { product: 'Camion benne Volvo FMX', status: 'warning', quantity: 1, threshold: 2, value: 220000 }
  ],
  recommendations: [
    { action: 'Commander 2 pelles CAT 320', urgency: 'high', impact: '450k MAD', deadline: '3 jours' },
    { action: 'Réapprovisionner chargeurs JCB', urgency: 'medium', impact: '280k MAD', deadline: '1 semaine' },
    { action: 'Optimiser stock excavatrices', urgency: 'low', impact: '320k MAD', deadline: '2 semaines' }
  ],
  categories: [
    { name: 'Excavatrices', total: 24, low: 3, out: 1, value: 680000 },
    { name: 'Chargeurs', total: 18, low: 2, out: 1, value: 420000 },
    { name: 'Bulldozers', total: 12, low: 1, out: 1, value: 380000 },
    { name: 'Camions', total: 32, low: 2, out: 0, value: 720000 }
  ]
};

// Données mock pour le pipeline/leads
const pipelineData = {
  totalLeads: 67,
  activeLeads: 23,
  qualifiedLeads: 12,
  conversionRate: 18.2,
  totalValue: 1850000,
  stages: [
    { name: 'Prospection', count: 15, value: 450000, color: 'bg-gray-500' },
    { name: 'Qualification', count: 12, value: 380000, color: 'bg-blue-500' },
    { name: 'Proposition', count: 8, value: 520000, color: 'bg-orange-500' },
    { name: 'Négociation', count: 5, value: 320000, color: 'bg-purple-500' },
    { name: 'Fermeture', count: 3, value: 180000, color: 'bg-green-500' }
  ],
  recentLeads: [
    { name: 'Entreprise ABC Construction', stage: 'Qualification', value: 85000, lastContact: '2 jours', priority: 'high' },
    { name: 'Société XYZ Mining', stage: 'Proposition', value: 120000, lastContact: '1 jour', priority: 'high' },
    { name: 'Groupe DEF Infrastructure', stage: 'Négociation', value: 95000, lastContact: '3 jours', priority: 'medium' },
    { name: 'Compagnie GHI Transport', stage: 'Prospection', value: 65000, lastContact: '5 jours', priority: 'medium' },
    { name: 'Entreprise JKL BTP', stage: 'Qualification', value: 78000, lastContact: '1 semaine', priority: 'low' }
  ],
  activities: [
    { type: 'appel', lead: 'ABC Construction', date: 'Aujourd\'hui', status: 'planifié' },
    { type: 'email', lead: 'XYZ Mining', date: 'Hier', status: 'envoyé' },
    { type: 'réunion', lead: 'DEF Infrastructure', date: 'Demain', status: 'confirmé' },
    { type: 'devis', lead: 'GHI Transport', date: 'Cette semaine', status: 'en cours' }
  ],
  metrics: {
    avgResponseTime: 2.1,
    avgDealSize: 85000,
    winRate: 28.5,
    salesCycle: 45
  }
};

// Données mock pour les actions commerciales prioritaires
const actionsData = {
  totalActions: 15,
  completedActions: 8,
  pendingActions: 7,
  urgentActions: 3,
  actions: [
    { 
      id: 1, 
      title: 'Relancer prospect ABC Construction', 
      type: 'appel', 
      priority: 'urgent', 
      deadline: 'Aujourd\'hui', 
      lead: 'ABC Construction', 
      value: 85000, 
      status: 'pending',
      description: 'Appeler pour finaliser la proposition commerciale',
      impact: 'high'
    },
    { 
      id: 2, 
      title: 'Préparer devis pour XYZ Mining', 
      type: 'devis', 
      priority: 'high', 
      deadline: 'Demain', 
      lead: 'XYZ Mining', 
      value: 120000, 
      status: 'in_progress',
      description: 'Créer devis détaillé pour pelle hydraulique',
      impact: 'high'
    },
    { 
      id: 3, 
      title: 'Réunion avec DEF Infrastructure', 
      type: 'réunion', 
      priority: 'high', 
      deadline: 'Cette semaine', 
      lead: 'DEF Infrastructure', 
      value: 95000, 
      status: 'scheduled',
      description: 'Présentation technique et commerciale',
      impact: 'medium'
    },
    { 
      id: 4, 
      title: 'Suivi email GHI Transport', 
      type: 'email', 
      priority: 'medium', 
      deadline: '3 jours', 
      lead: 'GHI Transport', 
      value: 65000, 
      status: 'pending',
      description: 'Envoyer catalogue et tarifs',
      impact: 'medium'
    },
    { 
      id: 5, 
      title: 'Qualification JKL BTP', 
      type: 'qualification', 
      priority: 'medium', 
      deadline: '1 semaine', 
      lead: 'JKL BTP', 
      value: 78000, 
      status: 'pending',
      description: 'Analyser besoins et budget',
      impact: 'low'
    }
  ],
  categories: [
    { name: 'Appels', count: 4, completed: 2, color: 'bg-blue-500' },
    { name: 'Devis', count: 3, completed: 1, color: 'bg-green-500' },
    { name: 'Réunions', count: 2, completed: 1, color: 'bg-purple-500' },
    { name: 'Emails', count: 3, completed: 2, color: 'bg-orange-500' },
    { name: 'Qualification', count: 3, completed: 2, color: 'bg-red-500' }
  ],
  performance: {
    completionRate: 53.3,
    avgResponseTime: 1.8,
    conversionRate: 22.5,
    avgDealValue: 92000
  }
};

// Composant principal restauré
const VendeurDashboardRestored = () => {
  // Hooks d'origine (état, effets, etc.)
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showMultiChart, setShowMultiChart] = useState(false);

  // Fonctions utilitaires pour le graphique
  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'sales': return item.sales;
      case 'units': return item.units;
      case 'growth': return item.growth;
      default: return item.sales;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'sales': return 'Chiffre d\'affaires (MAD)';
      case 'units': return 'Nombre d\'unités vendues';
      case 'growth': return 'Taux de croissance (%)';
      default: return 'Chiffre d\'affaires (MAD)';
    }
  };

  const getMetricColor = (value: number) => {
    if (selectedMetric === 'growth') {
      return value >= 0 ? '#10b981' : '#ef4444';
    }
    return '#3b82f6';
  };

  const formatNumber = (num: number) => {
    if (selectedMetric === 'units') return num.toString();
    if (selectedMetric === 'growth') return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
    return formatCurrency(num);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(selectedMonth === month ? null : month);
  };

  // Calculs des statistiques
  const stats = {
    bestMonthIndex: salesHistoryData.reduce((best, current, index) => 
      getMetricValue(current) > getMetricValue(salesHistoryData[best]) ? index : best, 0),
    worstMonthIndex: salesHistoryData.reduce((worst, current, index) => 
      getMetricValue(current) < getMetricValue(salesHistoryData[worst]) ? index : worst, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
      {/* Header et sidebar fidèles à l'original */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow">
        <h1 className="text-2xl font-bold">Tableau de Bord Entreprise</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Settings className="h-6 w-6" />
          </button>
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>
      
      <aside className="fixed left-0 top-0 h-full w-56 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col py-6 px-4">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Services en commun</h2>
          <div className="space-y-2">
            <a href="#vitrine" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">
              <Globe className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm">Vitrine</span>
            </a>
            <a href="#publication" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">
              <FileText className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm">Publication</span>
            </a>
            <a href="#devis" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">
              <DollarSign className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm">Devis</span>
            </a>
            <a href="#messages" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">
              <Mail className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm">Messages</span>
            </a>
            <a href="#planning" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">
              <Calendar className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm">Planning</span>
            </a>
            <a href="#assistant-ia" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800">
              <Zap className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm">Assistant IA</span>
            </a>
          </div>
        </div>
      </aside>
      
      <main className="ml-56 px-8 py-8">
        {/* Filtres période */}
        <div className="flex space-x-2 mb-6">
          {['Semaine', 'Mois', 'Trimestre'].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 rounded-full font-medium ${selectedPeriod === period.toLowerCase() ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSelectedPeriod(period.toLowerCase())}
            >
              {period}
            </button>
          ))}
        </div>
        
        {/* Grille des widgets vendeurs fidèles à l'original */}
        <div className="grid grid-cols-3 gap-6">
          {/* Score de performance commerciale - WIDGET RESTAURÉ */}
          <section className="col-span-1 bg-white dark:bg-neutral-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Score de Performance Commerciale</h2>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Objectif: {performanceData.target}%</span>
              </div>
            </div>
            
            {/* Jauge circulaire principale */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Cercle de fond */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-neutral-700"
                  />
                  {/* Cercle de progression */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - performanceData.score / 100)}`}
                    className={`${getScoreColor(performanceData.score)} transition-all duration-1000`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(performanceData.score)}`}>
                      {performanceData.score}%
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rang et statistiques */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rang</span>
                <span className="font-semibold">{performanceData.rank}/{performanceData.totalVendors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CA du mois</span>
                <span className="font-semibold">{formatCurrency(performanceData.sales)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Croissance</span>
                <span className={`font-semibold ${performanceData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performanceData.growth >= 0 ? '+' : ''}{performanceData.growth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prospects actifs</span>
                <span className="font-semibold">{performanceData.activeProspects}/{performanceData.prospects}</span>
              </div>
            </div>
            
            {/* Barre de progression vers l'objectif */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progression vers l'objectif</span>
                <span>{Math.round((performanceData.score / performanceData.target) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${getScoreBarColor(performanceData.score)}`}
                  style={{ width: `${Math.min((performanceData.score / performanceData.target) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Recommandations IA */}
            <div className="space-y-3">
              <div className="flex items-center mb-3">
                <Brain className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-semibold">Recommandations IA</span>
              </div>
              {performanceData.recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium">{rec.action}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority === 'high' ? 'Haute' : rec.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                  <div className="text-xs text-orange-600 font-semibold">
                    Impact: {rec.impact}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Historique des ventes - WIDGET RESTAURÉ */}
          <section className="col-span-2 bg-white dark:bg-neutral-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Historique des ventes</h2>
              <div className="flex items-center space-x-4">
                {/* Sélecteur de métrique */}
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700"
                >
                  <option value="sales">Chiffre d'affaires</option>
                  <option value="units">Unités vendues</option>
                  <option value="growth">Croissance</option>
                </select>
                
                {/* Toggle multi-courbes */}
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showMultiChart}
                    onChange={(e) => setShowMultiChart(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Multi-courbes</span>
                </label>
              </div>
            </div>
            
            {/* Graphique en barres */}
            <div className="mb-6">
              <div className="h-48 flex items-end justify-between gap-1">
                {salesHistoryData.map((item, index) => {
                  const value = getMetricValue(item);
                  const maxValue = Math.max(...salesHistoryData.map(getMetricValue));
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  const color = getMetricColor(value);
                  const isSelected = selectedMonth === item.month;

                  return (
                    <div 
                      key={index} 
                      className={`flex-1 flex flex-col items-center cursor-pointer transition-all ${
                        isSelected ? 'transform scale-105' : 'hover:scale-102'
                      }`}
                      onClick={() => handleMonthClick(item.month)}
                    >
                      <div
                        className={`w-full rounded-t transition-all duration-300 cursor-pointer ${
                          isSelected ? 'ring-2 ring-orange-400' : ''
                        }`}
                        style={{
                          height: `${height}%`,
                          backgroundColor: color,
                          minHeight: '4px'
                        }}
                        title={`${item.month}: ${formatNumber(value)}`}
                      />
                      <div className={`text-xs mt-1 transform rotate-45 origin-left font-medium ${
                        isSelected ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {item.month}
                      </div>
                      {isSelected && (
                        <div className="text-xs text-orange-600 font-bold mt-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Analyse des performances */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Meilleur mois</h5>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {salesHistoryData[stats.bestMonthIndex].month}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  {formatNumber(getMetricValue(salesHistoryData[stats.bestMonthIndex]))}
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h5 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Mois le plus faible</h5>
                <div className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                  {salesHistoryData[stats.worstMonthIndex].month}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  {formatNumber(getMetricValue(salesHistoryData[stats.worstMonthIndex]))}
                </div>
              </div>
            </div>
            
            {/* Tableau détaillé */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Détail mensuel</h5>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Mois</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">CA</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Unités</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Croissance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-600">
                    {salesHistoryData.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 dark:hover:bg-neutral-600 cursor-pointer transition-colors ${
                          selectedMonth === item.month ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400' : ''
                        }`}
                        onClick={() => handleMonthClick(item.month)}
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {item.month}
                          {selectedMonth === item.month && (
                            <span className="ml-2 text-orange-600"><Check className="w-3 h-3" /></span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 text-right">
                          {formatCurrency(item.sales)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 text-right">
                          {item.units}
                        </td>
                        <td className={`px-4 py-2 text-sm text-right font-medium ${
                          item.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          
          {/* Statut du stock - WIDGET RESTAURÉ */}
          <section className="col-span-1 bg-white dark:bg-neutral-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Statut du stock</h2>
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">{stockData.totalProducts} produits</span>
              </div>
            </div>
            
            {/* Indicateurs de statut */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{stockData.outOfStock}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Rupture</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stockData.lowStock}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Faible</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{stockData.totalProducts - stockData.lowStock - stockData.outOfStock}</div>
                <div className="text-xs text-green-700 dark:text-green-300">OK</div>
              </div>
            </div>
            
            {/* Valeur totale du stock */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stockData.totalValue)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Valeur totale du stock</div>
              </div>
            </div>
            
            {/* Alertes critiques */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Alertes critiques</h4>
              {stockData.alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.status === 'critical' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.product}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {alert.status === 'critical' ? 'Critique' : 'Attention'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Stock: {alert.quantity} (seuil: {alert.threshold})
                  </div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    Valeur: {formatCurrency(alert.value)}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Pipeline commercial */}
          <section className="col-span-2 bg-white dark:bg-neutral-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Pipeline Commercial</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{pipelineData.totalLeads} leads</span>
                <span className="text-sm text-green-600">{pipelineData.conversionRate}% conversion</span>
              </div>
            </div>
            
            {/* Étapes du pipeline */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {pipelineData.stages.map((stage, index) => (
                <div key={index} className="text-center">
                  <div className={`w-full h-2 rounded-full mb-2 ${stage.color}`}></div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.name}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{stage.count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(stage.value)}</div>
                </div>
              ))}
            </div>
            
            {/* Leads récents */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Leads récents</h4>
              {pipelineData.recentLeads.map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{lead.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(lead.value)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Dernier contact: {lead.lastContact}</div>
                  </div>
                  <div className={`ml-2 w-2 h-2 rounded-full ${
                    lead.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Actions prioritaires - WIDGET RESTAURÉ */}
          <section className="col-span-1 bg-white dark:bg-neutral-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Actions commerciales prioritaires</h2>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">{actionsData.totalActions} actions</span>
              </div>
            </div>
            
            {/* Métriques principales */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{actionsData.completedActions}</div>
                <div className="text-xs text-green-700 dark:text-green-300">Terminées</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{actionsData.pendingActions}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300">En attente</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{actionsData.urgentActions}</div>
                <div className="text-xs text-red-700 dark:text-red-300">Urgentes</div>
              </div>
            </div>
            
            {/* Taux de completion */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {actionsData.performance.completionRate}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Taux de completion</div>
              </div>
            </div>
            
            {/* Actions prioritaires */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Actions prioritaires</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {actionsData.actions.map((action) => (
                  <div key={action.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-orange-800 dark:text-orange-200">{action.title}</div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">{action.description}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        action.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        action.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {action.priority === 'urgent' ? 'Urgent' : action.priority === 'high' ? 'Haute' : 'Moyenne'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-orange-600 dark:text-orange-400">
                      <span>{action.lead}</span>
                      <span>{formatCurrency(action.value)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-orange-500 dark:text-orange-300">Échéance: {action.deadline}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        action.status === 'completed' ? 'bg-green-100 text-green-700' :
                        action.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        action.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {action.status === 'completed' ? 'Terminé' : 
                         action.status === 'in_progress' ? 'En cours' :
                         action.status === 'scheduled' ? 'Planifié' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Répartition par type */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Répartition par type</h3>
              <div className="space-y-2">
                {actionsData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-neutral-700 rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.completed}/{category.count}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {Math.round((category.completed / category.count) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Métriques de performance */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Métriques de performance</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700 rounded">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{actionsData.performance.avgResponseTime}h</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Temps réponse</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700 rounded">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{actionsData.performance.conversionRate}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Taux conversion</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700 rounded">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(actionsData.performance.avgDealValue)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Deal moyen</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700 rounded">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{actionsData.performance.completionRate}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Completion</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default VendeurDashboardRestored; 