import React from 'react';
import { DollarSign, Building2, TrendingUp, Calendar, MapPin, Wrench, Truck, Users, FileText, Bell, Target, BarChart3 } from 'lucide-react';

// Widgets pour le métier Loueur - Configuration complète
export const LoueurWidgets = {
  metier: 'Loueur',
  description: 'Location d\'équipements et matériels avec gestion complète',
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
    },
    {
      id: 'rental-pipeline',
      type: 'pipeline',
      title: 'Pipeline de location',
      description: 'Suivi des demandes de location par étape',
      icon: Users,
      dataSource: 'rental-pipeline',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: true
      }
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions prioritaires du jour',
      description: 'Tâches urgentes pour la gestion des locations',
      icon: Target,
      dataSource: 'daily-actions',
      features: {
        periodSelector: false,
        export: false,
        analytics: false,
        alerts: true,
        aiGenerated: true,
        dynamicContent: true
      }
    }
  ]
};

export default LoueurWidgets; 