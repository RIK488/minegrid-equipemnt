import { ListItem } from '../../types/dashboardTypes';

// Données pour les listes
export const listData: { [key: string]: ListItem[] } = {
  'stock-status': [
    {
      id: 1,
      title: 'CAT 320D - Stock dormant',
      description: 'En stock depuis 45 jours - Recommandation: promotion -15%',
      status: 'Action requise',
      priority: 'high',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'JCB 3CX - Stock faible',
      description: 'Seulement 2 unités restantes - Recommandation: réapprovisionnement',
      status: 'Surveillance',
      priority: 'medium',
      timestamp: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Komatsu PC200 - Stock optimal',
      description: '5 unités en stock - Niveau optimal maintenu',
      status: 'Normal',
      priority: 'low',
      timestamp: '2024-01-22T16:45:00Z'
    }
  ],
  'sales-pipeline': [
    {
      id: '1',
      title: 'Excavatrice CAT 320',
      status: 'Qualifié',
      priority: 'high',
      value: 850000,
      probability: 85,
      nextAction: 'Envoi devis détaillé',
      lastContact: '2024-01-20',
      assignedTo: 'Ahmed Benali',
      stage: 'Devis',
      company: 'Entreprise BTP Maroc',
      email: 'contact@btp-maroc.ma',
      phone: '+212 5 22 34 56 78'
    },
    {
      id: '2',
      title: 'Chargeuse JCB 3CX',
      status: 'En négociation',
      priority: 'high',
      value: 420000,
      probability: 70,
      nextAction: 'Réunion technique',
      lastContact: '2024-01-19',
      assignedTo: 'Fatima Zahra',
      stage: 'Négociation',
      company: 'Construction Atlas',
      email: 'achat@atlas-construction.ma',
      phone: '+212 5 24 12 34 56'
    },
    {
      id: '3',
      title: 'Bulldozer Komatsu D65',
      status: 'Prospection',
      priority: 'medium',
      value: 1200000,
      probability: 40,
      nextAction: 'Premier contact',
      lastContact: '2024-01-15',
      assignedTo: 'Karim Alami',
      stage: 'Prospection',
      company: 'Mines du Sud',
      email: 'direction@mines-sud.ma',
      phone: '+212 5 28 98 76 54'
    },
    {
      id: '4',
      title: 'Pelle mécanique Volvo EC220',
      status: 'Conclu',
      priority: 'low',
      value: 680000,
      probability: 100,
      nextAction: 'Livraison prévue',
      lastContact: '2024-01-18',
      assignedTo: 'Ahmed Benali',
      stage: 'Conclu',
      company: 'Travaux Publics Plus',
      email: 'commande@tpp.ma',
      phone: '+212 5 26 45 67 89'
    },
    {
      id: '5',
      title: 'Camion benne Mercedes',
      status: 'Perdu',
      priority: 'low',
      value: 280000,
      probability: 0,
      nextAction: 'Archiver le dossier',
      lastContact: '2024-01-10',
      assignedTo: 'Fatima Zahra',
      stage: 'Perdu',
      company: 'Transport Express',
      email: 'info@transport-express.ma',
      phone: '+212 5 22 11 22 33'
    },
    {
      id: '6',
      title: 'Groupe électrogène Perkins',
      status: 'Qualifié',
      priority: 'medium',
      value: 180000,
      probability: 60,
      nextAction: 'Démonstration produit',
      lastContact: '2024-01-16',
      assignedTo: 'Karim Alami',
      stage: 'Devis',
      company: 'Énergie Solutions',
      email: 'technique@energie-solutions.ma',
      phone: '+212 5 25 67 89 01'
    },
    {
      id: '7',
      title: 'Compresseur d\'air Atlas Copco',
      status: 'En négociation',
      priority: 'high',
      value: 320000,
      probability: 75,
      nextAction: 'Négociation prix',
      lastContact: '2024-01-17',
      assignedTo: 'Ahmed Benali',
      stage: 'Négociation',
      company: 'Industries Modernes',
      email: 'achats@industries-modernes.ma',
      phone: '+212 5 23 45 67 89'
    },
    {
      id: '8',
      title: 'Bétonnière mobile',
      status: 'Prospection',
      priority: 'medium',
      value: 95000,
      probability: 30,
      nextAction: 'Présentation catalogue',
      lastContact: '2024-01-12',
      assignedTo: 'Fatima Zahra',
      stage: 'Prospection',
      company: 'Béton Pro',
      email: 'contact@beton-pro.ma',
      phone: '+212 5 27 89 01 23'
    }
  ],
  'equipment-catalog': [
    {
      id: 1,
      title: 'CAT 320D - Pelle hydraulique',
      description: 'Année: 2022, Heures: 1,200h, Prix: 850,000 MAD',
      status: 'Disponible',
      priority: 'high',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'JCB 3CX - Chargeuse-pelleteuse',
      description: 'Année: 2021, Heures: 2,500h, Prix: 420,000 MAD',
      status: 'Réservé',
      priority: 'medium',
      timestamp: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Komatsu PC200 - Pelle mécanique',
      description: 'Année: 2020, Heures: 3,800h, Prix: 680,000 MAD',
      status: 'En maintenance',
      priority: 'low',
      timestamp: '2024-01-22T16:45:00Z'
    },
    {
      id: 4,
      title: 'CAT 950GC - Chargeur sur pneus',
      description: 'Année: 2023, Heures: 800h, Prix: 1,200,000 MAD',
      status: 'Disponible',
      priority: 'high',
      timestamp: '2024-01-22T12:00:00Z'
    }
  ],
  'customer-leads': [
    {
      id: 1,
      title: 'Mines du Sud SA - Ahmed Benali',
      description: 'Score: 85% - Intérêt: CAT 950GC - Dernier contact: 2 jours',
      status: 'Chaud',
      priority: 'high',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'Bati Plus Construction - Karim Mansouri',
      description: 'Score: 65% - Intérêt: JCB 3CX - Dernier contact: 5 jours',
      status: 'Tiède',
      priority: 'medium',
      timestamp: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Carrière Agadir - Hassan Tazi',
      description: 'Score: 45% - Intérêt: Komatsu PC200 - Dernier contact: 1 semaine',
      status: 'Froid',
      priority: 'low',
      timestamp: '2024-01-22T16:45:00Z'
    },
    {
      id: 4,
      title: 'Construction Atlas - Fatima Zahra',
      description: 'Score: 75% - Intérêt: CAT 320D - Dernier contact: 1 jour',
      status: 'Chaud',
      priority: 'high',
      timestamp: '2024-01-22T09:00:00Z'
    }
  ],
  'quotes-management': [
    {
      id: 1,
      title: 'Devis CAT 950GC - Mines du Sud SA',
      description: 'Montant: 1,200,000 MAD - Statut: En attente - Envoyé: 3 jours',
      status: 'En attente',
      priority: 'high',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'Devis JCB 3CX - Bati Plus Construction',
      description: 'Montant: 420,000 MAD - Statut: Relancé - Envoyé: 5 jours',
      status: 'Relancé',
      priority: 'medium',
      timestamp: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Devis Komatsu PC200 - Carrière Agadir',
      description: 'Montant: 680,000 MAD - Statut: Accepté - Envoyé: 1 semaine',
      status: 'Accepté',
      priority: 'low',
      timestamp: '2024-01-22T16:45:00Z'
    },
    {
      id: 4,
      title: 'Devis CAT 320D - Construction Atlas',
      description: 'Montant: 850,000 MAD - Statut: En attente - Envoyé: 1 jour',
      status: 'En attente',
      priority: 'high',
      timestamp: '2024-01-22T09:00:00Z'
    }
  ],
  'after-sales-service': [
    {
      id: 1,
      title: 'Maintenance CAT 320D - Mines du Sud SA',
      description: 'Type: Préventive - Date: 25/01/2024 - Technicien: Ahmed',
      status: 'Programmée',
      priority: 'medium',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'Réparation JCB 3CX - Bati Plus Construction',
      description: 'Type: Corrective - Date: 23/01/2024 - Technicien: Karim',
      status: 'En cours',
      priority: 'high',
      timestamp: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Inspection Komatsu PC200 - Carrière Agadir',
      description: 'Type: Inspection - Date: 28/01/2024 - Technicien: Hassan',
      status: 'Terminée',
      priority: 'low',
      timestamp: '2024-01-22T16:45:00Z'
    }
  ],
  'repair-status': [
    {
      id: 1,
      title: 'CAT 320D - Réparation moteur',
      description: 'Problème de démarrage à froid',
      status: 'En cours',
      priority: 'high',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'JCB 3CX - Changement filtre',
      description: 'Maintenance préventive programmée',
      status: 'Terminé',
      priority: 'medium',
      timestamp: '2024-01-22T14:15:00Z'
    },
    {
      id: 3,
      title: 'Komatsu PC200 - Diagnostic électronique',
      description: 'Codes d\'erreur à analyser',
      status: 'En attente',
      priority: 'high',
      timestamp: '2024-01-22T16:45:00Z'
    }
  ],
  'spare-parts-stock': [
    {
      id: 1,
      title: 'Filtre à air CAT',
      description: 'Référence: CAT-123456',
      status: 'En stock',
      priority: 'low',
      timestamp: '2024-01-22T09:00:00Z'
    },
    {
      id: 2,
      title: 'Huile moteur 15W40',
      description: 'Stock faible - 5L restants',
      status: 'Rupture',
      priority: 'high',
      timestamp: '2024-01-22T11:30:00Z'
    },
    {
      id: 3,
      title: 'Plaquettes de frein JCB',
      description: 'Référence: JCB-789012',
      status: 'En stock',
      priority: 'medium',
      timestamp: '2024-01-22T13:20:00Z'
    }
  ],
  'gps-tracking': [
    {
      id: 1,
      title: 'CAT 330D - Livraison Casablanca',
      description: 'En route vers le chantier',
      status: 'En route',
      priority: 'high',
      timestamp: '2024-01-22T08:00:00Z'
    },
    {
      id: 2,
      title: 'JCB 4CX - Retour chantier',
      description: 'Retour vers l\'entrepôt',
      status: 'Arrivé',
      priority: 'medium',
      timestamp: '2024-01-22T17:30:00Z'
    },
    {
      id: 3,
      title: 'Komatsu PC200 - Transport Rabat',
      description: 'En transit vers Rabat',
      status: 'En transit',
      priority: 'high',
      timestamp: '2024-01-22T12:15:00Z'
    }
  ],
  'documents': [
    {
      id: 1,
      title: 'Devis CAT 950GC',
      description: 'Mines du Sud SA',
      status: 'En attente',
      priority: 'high',
      timestamp: '2024-01-22T10:30:00Z'
    },
    {
      id: 2,
      title: 'Facture location JCB',
      description: 'Bati Plus Construction',
      status: 'Payée',
      priority: 'low',
      timestamp: '2024-01-22T14:45:00Z'
    },
    {
      id: 3,
      title: 'Contrat maintenance',
      description: 'Carrière Agadir SA',
      status: 'En cours',
      priority: 'medium',
      timestamp: '2024-01-22T16:20:00Z'
    }
  ],
  'stock-alerts': [
    {
      id: 1,
      title: 'CAT 320D - Stock faible',
      description: 'Plus que 2 unités disponibles',
      status: 'Alerte',
      priority: 'high',
      timestamp: '2024-01-22T09:15:00Z'
    },
    {
      id: 2,
      title: 'JCB 3CX - Nouvelle arrivée',
      description: '3 unités reçues',
      status: 'Info',
      priority: 'medium',
      timestamp: '2024-01-22T11:00:00Z'
    },
    {
      id: 3,
      title: 'Komatsu PC200 - Maintenance prévue',
      description: 'Maintenance 500h dans 3 jours',
      status: 'Rappel',
      priority: 'medium',
      timestamp: '2024-01-22T15:30:00Z'
    }
  ],
  'leads-pipeline': [
    {
      id: 1,
      title: 'Ahmed Benali - Prospect chaud',
      description: 'Construction Benali SARL',
      status: 'Qualifié',
      priority: 'high',
      timestamp: '2024-01-22T10:00:00Z'
    },
    {
      id: 2,
      title: 'Fatima Zahra - Devis en cours',
      description: 'Mines du Sud SA',
      status: 'En négociation',
      priority: 'medium',
      timestamp: '2024-01-22T13:45:00Z'
    },
    {
      id: 3,
      title: 'Karim Mansouri - Appel d\'offres',
      description: 'Autoroutes du Maroc',
      status: 'Prospection',
      priority: 'high',
      timestamp: '2024-01-22T16:00:00Z'
    }
  ]
};
