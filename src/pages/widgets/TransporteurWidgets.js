import React from 'react';
import { Truck, Globe, DollarSign, Calendar } from 'lucide-react';

// Widgets pour le métier Transporteur / Logistique
export const TransporteurWidgets = {
  metier: 'Transporteur / Logistique',
  description: 'Transport et livraison d\'équipements',
  widgets: [
    {
      id: 'active-deliveries',
      type: 'metric',
      title: 'Livraisons en cours',
      description: 'Nombre de livraisons actives',
      icon: Truck,
      dataSource: 'active_deliveries',
      features: {
        periodSelector: false,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'delivery-map',
      type: 'map',
      title: 'Carte des livraisons',
      description: 'Localisation des véhicules',
      icon: Globe,
      dataSource: 'gps_tracking',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: false
      }
    },
    {
      id: 'transport-costs',
      type: 'chart',
      title: 'Coûts de transport',
      description: 'Analyse des coûts par trajet',
      icon: DollarSign,
      dataSource: 'transport_costs',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    },
    {
      id: 'driver-schedule',
      type: 'calendar',
      title: 'Planning chauffeurs',
      description: 'Planning des équipes',
      icon: Calendar,
      dataSource: 'driver_schedule',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: true
      }
    }
  ]
};

export default TransporteurWidgets; 