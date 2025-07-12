import React from 'react';
import { DollarSign, Building2, TrendingUp, Calendar } from 'lucide-react';

// Widgets pour le métier Loueur
export const LoueurWidgets = {
  metier: 'Loueur',
  description: 'Location d\'équipements et matériels',
  widgets: [
    {
      id: 'rental-revenue',
      type: 'metric',
      title: 'Revenus de location',
      description: 'Chiffre d\'affaires des locations',
      icon: DollarSign,
      dataSource: 'rental-revenue',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    },
    {
      id: 'equipment-availability',
      type: 'equipment',
      title: 'Disponibilité Équipements',
      description: 'État de disponibilité des équipements',
      icon: Building2,
      dataSource: 'equipment-availability',
      features: {
        periodSelector: false,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'equipment-usage',
      type: 'chart',
      title: 'Utilisation équipements',
      description: 'Taux d\'utilisation des équipements',
      icon: TrendingUp,
      dataSource: 'equipment-usage',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      description: 'Planning des locations et réservations',
      icon: Calendar,
      dataSource: 'upcoming-rentals',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: true
      }
    }
  ]
};

export default LoueurWidgets; 