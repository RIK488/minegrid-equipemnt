import React from 'react';
import { DollarSign, Shield, FileText, Users, TrendingUp, Calendar, Target, Building2 } from 'lucide-react';

// Widgets pour le métier Courtier en crédit et assurances
export const CourtierWidgets = {
  metier: 'Courtier',
  description: 'Courtage en crédit et assurances',
  widgets: [
    {
      id: 'credit-applications',
      type: 'list',
      title: 'Demandes de crédit',
      description: 'Suivi des demandes de crédit en cours',
      icon: FileText,
      dataSource: 'credit_applications',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'insurance-policies',
      type: 'list',
      title: 'Polices d\'assurance',
      description: 'Gestion des polices d\'assurance clients',
      icon: Shield,
      dataSource: 'insurance_policies',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'commission-tracking',
      type: 'metric',
      title: 'Suivi des commissions',
      description: 'Commissions générées par produit',
      icon: DollarSign,
      dataSource: 'commissions',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    },
    {
      id: 'client-portfolio',
      type: 'list',
      title: 'Portefeuille clients',
      description: 'Base de données clients et prospects',
      icon: Users,
      dataSource: 'clients',
      features: {
        periodSelector: false,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'performance-analytics',
      type: 'chart',
      title: 'Analytics de performance',
      description: 'Analyse des performances commerciales',
      icon: TrendingUp,
      dataSource: 'performance',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    }
  ]
};

export default CourtierWidgets; 