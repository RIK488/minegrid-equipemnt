

// Données pour les performances
export const performanceData = {
  'sales-performance': {
    score: 85,
    metrics: {
      sales: 75,
      efficiency: 82,
      customerSatisfaction: 88
    },
    trends: [
      { period: 'Jan', change: 12, direction: 'up' },
      { period: 'Fév', change: 8, direction: 'up' },
      { period: 'Mar', change: 15, direction: 'up' },
      { period: 'Avr', change: 5, direction: 'down' },
      { period: 'Mai', change: 18, direction: 'up' },
      { period: 'Juin', change: 22, direction: 'up' }
    ],
    recommendations: [
      'Augmenter les appels de suivi de 20%',
      'Optimiser les devis pour réduire le délai de réponse',
      'Former l\'équipe sur les nouveaux produits CAT'
    ],
    alerts: [
      {
        type: 'warning',
        message: 'Octobre 2024: +3.3% vs objectif mais -4.0% vs secteur',
        timestamp: '2024-10-31T18:00:00Z'
      }
    ]
  },
  'sales-performance-score': {
    score: 85,
    target: 90,
    rank: 3,
    totalVendors: 12,
    activityLevel: 'Élevé',
    priority: 'medium',
    sales: 2400000,
    growth: 12.5,
    growthTarget: 15,
    prospects: 45,
    prospectsTarget: 50,
    responsiveness: 92,
    responsivenessTarget: 90,
    trends: {
      sales: 'up',
      growth: 'up',
      prospects: 'stable',
      responsiveness: 'up'
    },
    recommendations: [
      'Augmenter le taux de conversion des prospects de 15%',
      'Optimiser le temps de réponse client',
      'Diversifier les canaux de prospection',
      'Renforcer la formation commerciale'
    ]
  }
};
