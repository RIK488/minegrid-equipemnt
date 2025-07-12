import React from 'react';
import { FileText, Globe, BarChart3, FileText as FileText2 } from 'lucide-react';

// Widgets pour le métier Transitaire / Freight Forwarder
export const TransitaireWidgets = {
  metier: 'Transitaire / Freight Forwarder',
  description: 'Gestion des opérations douanières et logistiques internationales',
  widgets: [
    {
      id: 'customs-clearance',
      type: 'metric',
      title: 'Déclarations en cours',
      description: 'Nombre de déclarations douanières',
      icon: FileText,
      dataSource: 'customs',
      features: {
        periodSelector: false,
        export: true,
        analytics: false,
        alerts: true
      }
    },
    {
      id: 'container-tracking',
      type: 'map',
      title: 'Suivi conteneurs',
      description: 'Localisation des conteneurs',
      icon: Globe,
      dataSource: 'containers',
      features: {
        periodSelector: true,
        export: true,
        analytics: false,
        alerts: false
      }
    },
    {
      id: 'import-export-stats',
      type: 'chart',
      title: 'Statistiques I/E',
      description: 'Volumes import/export',
      icon: BarChart3,
      dataSource: 'trade_stats',
      features: {
        periodSelector: true,
        export: true,
        analytics: true,
        alerts: false
      }
    },
    {
      id: 'document-status',
      type: 'list',
      title: 'État des documents',
      description: 'Documents en attente de validation',
      icon: FileText2,
      dataSource: 'documents',
      features: {
        periodSelector: false,
        export: true,
        analytics: false,
        alerts: true
      }
    }
  ]
};

export default TransitaireWidgets; 