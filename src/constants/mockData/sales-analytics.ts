

// Données pour les analytics commerciales
export const salesAnalyticsData = [
  // Métriques principales
  { label: 'CA Total', value: 2450000, type: 'currency', trend: 12.5 },
  { label: 'Ventes', value: 19, type: 'number', trend: 8.2 },
  { label: 'Ticket moyen', value: 128947, type: 'currency', trend: 4.1 },
  { label: 'Taux conversion', value: 68, type: 'percentage', trend: -2.3 },
  
  // Indicateurs détaillés
  { name: 'Prospects actifs', description: 'Prospects en cours de négociation', value: 45, type: 'number', trend: 15.2, status: 'good' },
  { name: 'Devis en attente', description: 'Devis envoyés sans réponse', value: 12, type: 'number', trend: -8.5, status: 'warning' },
  { name: 'Temps de réponse', description: 'Délai moyen de réponse client', value: 2.3, type: 'number', trend: -12.1, status: 'good' }
];
