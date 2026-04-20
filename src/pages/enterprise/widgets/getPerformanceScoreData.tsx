

export const getPerformanceScoreData = () => {
  return {
    score: 68,
    target: 85,
    rank: 3, // Rang parmi les vendeurs (anonymisé)
    totalVendors: 12,
    sales: 2400000,
    salesTarget: 3000000,
    growth: 12,
    growthTarget: 15,
    prospects: 8,
    activeProspects: 6,
    responseTime: 2.5, // heures
    responseTarget: 1.5,
    recommendations: [
      {
        type: 'prospect',
        action: 'Relancer vos 2 prospects inactifs',
        impact: '+8 points',
        priority: 'high'
      },
      {
        type: 'annonce',
        action: 'Améliorer 1 annonce avec photos HD',
        impact: '+5 points',
        priority: 'medium'
      },
      {
        type: 'formation',
        action: 'Suivre le module "Techniques de négociation"',
        impact: '+4 points',
        priority: 'low'
      }
    ],
    trends: {
      sales: 'up',
      growth: 'up',
      prospects: 'stable',
      responseTime: 'down'
    }
  };
};
