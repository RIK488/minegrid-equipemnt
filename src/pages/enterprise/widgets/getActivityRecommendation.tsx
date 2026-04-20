

export const getActivityRecommendation = (level: string) => {
  switch (level) {
    case 'élevé':
      return 'Maintenir ce rythme et optimiser les processus';
    case 'modéré':
      return 'Augmenter les relances prospects et améliorer la conversion';
    case 'faible':
      return 'Intensifier les actions commerciales et la prospection';
    default:
      return 'Analyser les opportunités d\'amélioration';
  }
};
