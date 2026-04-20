

export const getPlanningData = (widgetId: string) => {
  const planning = {
    'weekly-schedule': {
      title: 'Planning Hebdomadaire',
      currentWeek: 'Semaine du 15-21 Janvier 2024',
      days: [
        {
          day: 'Lundi 15',
          tasks: [
            { id: '1', title: 'Maintenance pelle CAT', time: '08:00-12:00', status: 'completed', priority: 'high', technician: 'Mohammed Alami' },
            { id: '2', title: 'Livraison pièces', time: '14:00-16:00', status: 'in-progress', priority: 'medium', technician: 'Ahmed Benali' },
            { id: '3', title: 'Révision chargeur', time: '16:00-18:00', status: 'scheduled', priority: 'low', technician: 'Karim Mansouri' }
          ]
        },
        {
          day: 'Mardi 16',
          tasks: [
            { id: '4', title: 'Installation équipement', time: '09:00-17:00', status: 'scheduled', priority: 'high', technician: 'Mohammed Alami' },
            { id: '5', title: 'Formation sécurité', time: '10:00-12:00', status: 'scheduled', priority: 'medium', technician: 'Formateur externe' }
          ]
        },
        {
          day: 'Mercredi 17',
          tasks: [
            { id: '6', title: 'Réparation bulldozer', time: '08:00-16:00', status: 'scheduled', priority: 'high', technician: 'Ahmed Benali' },
            { id: '7', title: 'Contrôle qualité', time: '14:00-16:00', status: 'scheduled', priority: 'medium', technician: 'Karim Mansouri' }
          ]
        },
        {
          day: 'Jeudi 18',
          tasks: [
            { id: '8', title: 'Maintenance préventive', time: '08:00-12:00', status: 'scheduled', priority: 'medium', technician: 'Mohammed Alami' },
            { id: '9', title: 'Réunion équipe', time: '15:00-16:00', status: 'scheduled', priority: 'low', technician: 'Tous' }
          ]
        },
        {
          day: 'Vendredi 19',
          tasks: [
            { id: '10', title: 'Fin de projet', time: '08:00-17:00', status: 'scheduled', priority: 'high', technician: 'Équipe complète' }
          ]
        }
      ]
    },
    'monthly-overview': {
      title: 'Vue d\'Ensemble Mensuelle',
      currentMonth: 'Janvier 2024',
      categories: [
        {
          name: 'Maintenance',
          total: 45,
          completed: 32,
          inProgress: 8,
          scheduled: 5,
          color: 'blue'
        },
        {
          name: 'Réparations',
          total: 28,
          completed: 20,
          inProgress: 5,
          scheduled: 3,
          color: 'green'
        },
        {
          name: 'Installations',
          total: 15,
          completed: 12,
          inProgress: 2,
          scheduled: 1,
          color: 'orange'
        },
        {
          name: 'Formations',
          total: 8,
          completed: 6,
          inProgress: 1,
          scheduled: 1,
          color: 'purple'
        }
      ]
    }
  };

  return planning[widgetId as keyof typeof planning] || planning['weekly-schedule'];
};
