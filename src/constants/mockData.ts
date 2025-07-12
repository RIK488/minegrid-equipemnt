// Données de test pour les widgets du dashboard
import { DailyAction, ListItem, ChartData } from '../types/dashboardTypes';

// Données pour les métriques
export const metricData = {
  'sales-metrics': {
    revenue: 245000,
    count: 19,
    growth: 12.5,
    averageTicket: 12895
  },
  'monthly-sales': {
    revenue: 245000,
    count: 19,
    growth: 12.5,
    averageTicket: 12895
  },
  'rental-revenue': {
    revenue: 125000,
    count: 8,
    growth: 8.2,
    averageTicket: 15625
  },
  'daily-interventions': {
    completed: 12,
    pending: 5,
    total: 17
  },
  'active-deliveries': {
    in_transit: 8,
    delivered: 15,
    pending: 3,
    total: 26
  },
  'customs': {
    declarations: 15,
    approved: 12,
    pending: 3,
    total: 15
  },
  'warehouse': {
    occupancy: 78,
    available: 22,
    total: 100
  },
  'projects': {
    active: 12,
    completed: 8,
    pending: 3,
    total: 23
  },
  'portfolio': {
    value: 2500000,
    growth: 5.8,
    risk: 'Faible'
  }
};

// Données pour les graphiques
export const chartData: { [key: string]: ChartData[] } = {
  'sales-evolution': [
    { name: 'Jan', value: 125000, CA: 125000, Ventes: 8, Prévision: 120000 },
    { name: 'Fév', value: 145000, CA: 145000, Ventes: 10, Prévision: 140000 },
    { name: 'Mar', value: 138000, CA: 138000, Ventes: 9, Prévision: 135000 },
    { name: 'Avr', value: 162000, CA: 162000, Ventes: 12, Prévision: 150000 },
    { name: 'Mai', value: 178000, CA: 178000, Ventes: 13, Prévision: 165000 },
    { name: 'Juin', value: 195000, CA: 195000, Ventes: 15, Prévision: 180000 },
    { name: 'Juil', value: 182000, CA: 182000, Ventes: 14, Prévision: 175000 },
    { name: 'Août', value: 168000, CA: 168000, Ventes: 12, Prévision: 170000 },
    { name: 'Sep', value: 185000, CA: 185000, Ventes: 14, Prévision: 180000 },
    { name: 'Oct', value: 203000, CA: 203000, Ventes: 16, Prévision: 195000 },
    { name: 'Nov', value: 218000, CA: 218000, Ventes: 17, Prévision: 210000 },
    { name: 'Déc', value: 245000, CA: 245000, Ventes: 19, Prévision: 230000 }
  ],
  'equipment-usage': [
    { name: 'CAT 320D', value: 85 },
    { name: 'JCB 3CX', value: 72 },
    { name: 'Komatsu PC200', value: 68 },
    { name: 'CAT 950GC', value: 45 },
    { name: 'JCB 4CX', value: 38 }
  ],
  'transport-costs': [
    { name: 'Jan', value: 15000 },
    { name: 'Fév', value: 18000 },
    { name: 'Mar', value: 16500 },
    { name: 'Avr', value: 22000 },
    { name: 'Mai', value: 19500 },
    { name: 'Juin', value: 25000 }
  ],
  'import-export-stats': [
    { name: 'Import', value: 45 },
    { name: 'Export', value: 32 }
  ],
  'supply-chain-kpis': [
    { name: 'Délai livraison', value: 3.2 },
    { name: 'Taux service', value: 95 },
    { name: 'Coût stockage', value: 12500 }
  ],
  'service-revenue': [
    { name: 'Maintenance', value: 45000 },
    { name: 'Réparation', value: 32000 },
    { name: 'Inspection', value: 18000 },
    { name: 'Formation', value: 12000 }
  ],
  'roi-analysis': [
    { name: 'CAT 320D', value: 18.5 },
    { name: 'JCB 3CX', value: 22.3 },
    { name: 'Komatsu PC200', value: 15.8 },
    { name: 'CAT 950GC', value: 25.1 }
  ],
  'market-trends': [
    { name: 'Pelles hydrauliques', value: 1250000, trend: 'up' },
    { name: 'Chargeuses-pelleteuses', value: 450000, trend: 'stable' },
    { name: 'Pelles mécaniques', value: 680000, trend: 'down' },
    { name: 'Chargeurs sur pneus', value: 1200000, trend: 'up' },
    { name: 'Bulldozers', value: 950000, trend: 'up' }
  ],
  'sales-analytics': [
    { name: 'Jan', value: 1250000, target: 1200000 },
    { name: 'Fév', value: 1450000, target: 1400000 },
    { name: 'Mar', value: 1380000, target: 1350000 },
    { name: 'Avr', value: 1620000, target: 1500000 },
    { name: 'Mai', value: 1780000, target: 1650000 },
    { name: 'Juin', value: 1950000, target: 1800000 }
  ]
};

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

// Données pour les actions quotidiennes
export const dailyActionsData: DailyAction[] = [
  {
    id: 1,
    title: 'Relancer Ahmed Benali - Prospect chaud',
    description: 'A consulté votre CAT 320D 3 fois cette semaine. Prêt à acheter.',
    priority: 'high',
    category: 'prospection',
    impact: '+85%',
    impactDescription: 'Probabilité de conversion',
    estimatedTime: '15 min',
    status: 'pending',
    contact: {
      name: 'Ahmed Benali',
      phone: '+212 6 12 34 56 78',
      email: 'ahmed.benali@construction.ma',
      company: 'Construction Benali SARL',
      lastContact: '2024-01-20'
    },
    action: 'Appel de suivi + envoi devis personnalisé',
    notes: 'Intéressé par financement leasing. Budget 450k MAD.',
    deadline: '2024-01-25'
  },
  {
    id: 2,
    title: 'Finaliser devis CAT 950GC - Mines du Sud',
    description: 'Devis en cours depuis 5 jours. Client impatient.',
    priority: 'high',
    category: 'devis',
    impact: '+70%',
    impactDescription: 'Chance de vente',
    estimatedTime: '30 min',
    status: 'pending',
    contact: {
      name: 'Fatima Zahra',
      phone: '+212 6 98 76 54 32',
      email: 'f.zahra@minesdusud.ma',
      company: 'Mines du Sud SA',
      lastContact: '2024-01-18'
    },
    action: 'Finaliser devis + appel de présentation',
    notes: 'Demande spécifique: godet de 1.2m³, chenilles larges.',
    deadline: '2024-01-23'
  },
  {
    id: 3,
    title: 'Appel de relance - 12 prospects inactifs',
    description: 'Prospects qui n\'ont pas été contactés depuis 7+ jours.',
    priority: 'medium',
    category: 'relance',
    impact: '+25%',
    impactDescription: 'Taux de réactivation',
    estimatedTime: '45 min',
    status: 'pending',
    contact: {
      name: 'Liste de 12 prospects',
      phone: 'Voir détails',
      email: 'campagne@minegrid.ma',
      company: 'Diverses entreprises',
      lastContact: '2024-01-15'
    },
    action: 'Campagne d\'appels + emails personnalisés',
    notes: 'Focus sur 3 prospects prioritaires restants.',
    deadline: '2024-01-26'
  },
  {
    id: 4,
    title: 'Réduire prix CAT 320D - Stock ancien',
    description: 'Machine en stock depuis 92 jours. Prix à ajuster.',
    priority: 'medium',
    category: 'pricing',
    impact: '+40%',
    impactDescription: 'Augmentation vues',
    estimatedTime: '10 min',
    status: 'pending',
    contact: {
      name: 'Équipe marketing',
      phone: 'N/A',
      email: 'marketing@minegrid.ma',
      company: 'Minegrid Équipement',
      lastContact: '2024-01-22'
    },
    action: 'Réduction de 2.5% + boost visibilité',
    notes: 'Prix actuel: 380k MAD → Nouveau: 370.5k MAD',
    deadline: '2024-01-24'
  },
  {
    id: 5,
    title: 'Publier annonce compacteur - Forte demande',
    description: 'Forte demande détectée à Casablanca cette semaine.',
    priority: 'medium',
    category: 'marketing',
    impact: '+60%',
    impactDescription: 'Prospects qualifiés',
    estimatedTime: '25 min',
    status: 'pending',
    contact: {
      name: 'Équipe technique',
      phone: 'N/A',
      email: 'tech@minegrid.ma',
      company: 'Minegrid Équipement',
      lastContact: '2024-01-22'
    },
    action: 'Créer annonce optimisée SEO + photos',
    notes: 'Mots-clés: compacteur, Casablanca, location, vente.',
    deadline: '2024-01-25'
  },
  {
    id: 6,
    title: 'Suivi paiement - Location CAT 330D',
    description: 'Paiement en retard de 3 jours. Client à contacter.',
    priority: 'high',
    category: 'finance',
    impact: '+95%',
    impactDescription: 'Récupération paiement',
    estimatedTime: '20 min',
    status: 'pending',
    contact: {
      name: 'Mohammed Alami',
      phone: '+212 6 11 22 33 44',
      email: 'm.alami@batiplus.ma',
      company: 'Bati Plus Construction',
      lastContact: '2024-01-19'
    },
    action: 'Appel de relance + envoi rappel',
    notes: 'Montant: 15k MAD. Raison: problème bancaire.',
    deadline: '2024-01-23'
  },
  {
    id: 7,
    title: 'Préparer présentation JCB - Projet autoroute',
    description: 'Appel d\'offres autoroute Tanger-Casablanca. Présentation technique requise.',
    priority: 'high',
    category: 'appel_offres',
    impact: '+90%',
    impactDescription: 'Chance de sélection',
    estimatedTime: '60 min',
    status: 'pending',
    contact: {
      name: 'Karim Mansouri',
      phone: '+212 6 55 66 77 88',
      email: 'k.mansouri@autoroutes.ma',
      company: 'Autoroutes du Maroc',
      lastContact: '2024-01-21'
    },
    action: 'Préparer présentation technique + fiches produits',
    notes: 'Projet de 2.5M MAD. Focus sur JCB 3CX et 4CX.',
    deadline: '2024-01-27'
  },
  {
    id: 8,
    title: 'Relance devis Komatsu - Carrière Agadir',
    description: 'Devis envoyé il y a 4 jours. Aucune réponse du client.',
    priority: 'medium',
    category: 'relance',
    impact: '+35%',
    impactDescription: 'Probabilité de réponse',
    estimatedTime: '20 min',
    status: 'pending',
    contact: {
      name: 'Hassan Tazi',
      phone: '+212 6 44 55 66 77',
      email: 'h.tazi@carriereagadir.ma',
      company: 'Carrière Agadir SA',
      lastContact: '2024-01-17'
    },
    action: 'Appel de relance + envoi rappel par email',
    notes: 'Devis Komatsu PC200-8. Montant: 680k MAD.',
    deadline: '2024-01-24'
  },
  {
    id: 9,
    title: 'Mise à jour catalogue produits',
    description: 'Nouveaux modèles CAT et JCB à ajouter au catalogue.',
    priority: 'low',
    category: 'marketing',
    impact: '+15%',
    impactDescription: 'Amélioration visibilité',
    estimatedTime: '40 min',
    status: 'pending',
    contact: {
      name: 'Équipe marketing',
      phone: 'N/A',
      email: 'marketing@minegrid.ma',
      company: 'Minegrid Équipement',
      lastContact: '2024-01-22'
    },
    action: 'Ajouter 5 nouveaux modèles + photos HD',
    notes: 'CAT 320D2, JCB 3CX, Komatsu PC200-8, etc.',
    deadline: '2024-01-28'
  }
];

// Données pour l'inventaire
export const inventoryData = {
  'equipment-availability': [
    {
      id: '1',
      name: 'CAT 320D',
      status: 'available',
      location: 'Casablanca',
      lastUpdate: '2024-01-22T15:30:00Z',
      nextMaintenance: '2024-01-25'
    },
    {
      id: '2',
      name: 'JCB 3CX',
      status: 'rented',
      location: 'Rabat',
      lastUpdate: '2024-01-22T14:15:00Z',
      returnDate: '2024-01-30'
    },
    {
      id: '3',
      name: 'Komatsu PC200',
      status: 'maintenance',
      location: 'Casablanca',
      lastUpdate: '2024-01-22T16:45:00Z',
      nextMaintenance: '2024-01-28'
    },
    {
      id: '4',
      name: 'CAT 950GC',
      status: 'available',
      location: 'Marrakech',
      lastUpdate: '2024-01-22T12:00:00Z',
      nextMaintenance: '2024-02-05'
    },
    {
      id: '5',
      name: 'JCB 4CX',
      status: 'rented',
      location: 'Agadir',
      lastUpdate: '2024-01-22T13:30:00Z',
      returnDate: '2024-02-02'
    }
  ]
};

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

// Données pour les analytics commerciales
export const salesAnalyticsData = [
  // Métriques principales
  { label: 'CA Total', value: 2450000, type: 'currency', trend: 12.5 },
  { label: 'Ventes', value: 19, type: 'number', trend: 8.2 },
  { label: 'Ticket moyen', value: 128947, type: 'currency', trend: 4.1 },
  { label: 'Taux conversion', value: 68, type: 'percentage', trend: -2.3 },
  
  // Indicateurs détaillés
  { name: 'Prospects actifs', description: 'Prospects en cours de négociation', value: 45, type: 'number', trend: 15.2, status: 'good' },
  { name: 'Devis en attente', description: 'Devis envoyés sans réponse', value: 12, type: 'number', trend: -8.5, status: 'warning' },
  { name: 'Temps de réponse', description: 'Délai moyen de réponse client', value: 2.3, type: 'number', trend: -12.1, status: 'good' }
];

// Fonction pour obtenir les données selon le type de widget
export const getWidgetData = (widgetId: string, dataSource?: string) => {
  // Métriques
  if (metricData[widgetId as keyof typeof metricData]) {
    return metricData[widgetId as keyof typeof metricData];
  }

  // Graphiques
  if (chartData[widgetId]) {
    return chartData[widgetId];
  }

  // Listes
  if (listData[widgetId]) {
    // Cas spécial : stock-status utilise les données du pipeline commercial
    if (widgetId === 'stock-status') {
      return listData['sales-pipeline'];
    }
    return listData[widgetId];
  }

  // Actions quotidiennes
  if (widgetId === 'daily-actions' || dataSource === 'daily-actions') {
    return dailyActionsData;
  }

  // Inventaire
  if (inventoryData[widgetId as keyof typeof inventoryData]) {
    return inventoryData[widgetId as keyof typeof inventoryData];
  }

  // Performances
  if (performanceData[widgetId as keyof typeof performanceData]) {
    return performanceData[widgetId as keyof typeof performanceData];
  }

  // Analytics commerciales
  if (widgetId === 'sales-analytics' || dataSource === 'sales-analytics') {
    return salesAnalyticsData;
  }

  // Fallback
  return null;
}; 