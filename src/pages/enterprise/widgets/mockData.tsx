

export const mockData = {
  // Vendeur d'engins
  sales: { revenue: 125000, count: 23, growth: 12.5 },
  inventory: [
    { name: 'Pelle hydraulique CAT 320D', status: 'En rupture', priority: 'high' },
    { name: 'Concasseur mobile', status: 'Stock faible', priority: 'medium' },
    { name: 'Chargeur frontal', status: 'Disponible', priority: 'low' }
  ],
  sales_history: [45, 52, 38, 67, 58, 72, 89, 76, 65, 82, 91, 78],
  leads: [
    { name: 'M. Diallo', company: 'Construction SA', value: 25000, stage: 'Qualification' },
    { name: 'Mme Traoré', company: 'Mines du Mali', value: 45000, stage: 'Proposition' },
    { name: 'M. Koné', company: 'BTP Côte d\'Ivoire', value: 18000, stage: 'Négociation' }
  ],

  // Loueur d'engins
  rental_revenue: { revenue: 85000, count: 15, growth: 8.2 },
  equipment_usage: [
    { name: 'Pelle hydraulique', usage: 85, status: 'En location' },
    { name: 'Chargeur', usage: 72, status: 'Disponible' },
    { name: 'Bulldozer', usage: 93, status: 'En location' }
  ],
  rentals: [
    { date: '2024-01-15', equipment: 'Pelle hydraulique', client: 'Construction SA', duration: '2 semaines' },
    { date: '2024-01-18', equipment: 'Bulldozer', client: 'Mines du Mali', duration: '1 mois' },
    { date: '2024-01-20', equipment: 'Chargeur', client: 'BTP Côte d\'Ivoire', duration: '3 semaines' }
  ],
  maintenance: [
    { equipment: 'Pelle hydraulique', date: '2024-01-25', type: 'Révision générale' },
    { equipment: 'Bulldozer', date: '2024-01-30', type: 'Changement filtre' }
  ],

  // Mécanicien/Atelier
  daily_interventions: { count: 8, completed: 5, pending: 3 },
  repairs: [
    { equipment: 'Pelle hydraulique CAT', status: 'En cours', technician: 'M. Diarra', estimated: '2 jours' },
    { equipment: 'Concasseur mobile', status: 'En attente', technician: 'M. Keita', estimated: '1 jour' },
    { equipment: 'Chargeur frontal', status: 'Terminé', technician: 'M. Koné', estimated: 'Terminé' }
  ],
  parts: [
    { category: 'Moteurs', stock: 45, min: 20, status: 'OK' },
    { category: 'Hydraulique', stock: 12, min: 15, status: 'Faible' },
    { category: 'Électronique', stock: 28, min: 10, status: 'OK' }
  ],
  workload: [
    { technician: 'M. Diarra', tasks: 5, completed: 3, efficiency: 85 },
    { technician: 'M. Keita', tasks: 4, completed: 2, efficiency: 78 },
    { technician: 'M. Koné', tasks: 6, completed: 5, efficiency: 92 }
  ],

  // Transporteur/Logistique
  active_deliveries: { count: 12, in_transit: 8, delivered: 4 },
  gps_tracking: [
    { vehicle: 'Camion 01', location: 'Bamako', status: 'En route', eta: '2h' },
    { vehicle: 'Camion 02', location: 'Ouagadougou', status: 'Livraison', eta: '30min' },
    { vehicle: 'Camion 03', location: 'Abidjan', status: 'Retour', eta: '4h' }
  ],
  transport_costs: [
    { route: 'Bamako - Ouagadougou', cost: 2500, distance: 850, efficiency: 85 },
    { route: 'Ouagadougou - Abidjan', cost: 3200, distance: 1100, efficiency: 78 },
    { route: 'Abidjan - Bamako', cost: 2800, distance: 950, efficiency: 82 }
  ],
  driver_schedule: [
    { driver: 'M. Diallo', route: 'Bamako - Ouagadougou', start: '08:00', end: '18:00' },
    { driver: 'M. Traoré', route: 'Ouagadougou - Abidjan', start: '06:00', end: '16:00' },
    { driver: 'M. Koné', route: 'Abidjan - Bamako', start: '07:00', end: '17:00' }
  ],

  // Transitaire
  customs: { declarations: 8, approved: 6, pending: 2 },
  containers: [
    { id: 'CONT001', location: 'Port d\'Abidjan', status: 'En transit', eta: '3 jours' },
    { id: 'CONT002', location: 'Port de Dakar', status: 'En douane', eta: '1 jour' },
    { id: 'CONT003', location: 'Port de Lomé', status: 'Livré', eta: 'Terminé' }
  ],
  trade_stats: [
    { month: 'Jan', import: 45, export: 38 },
    { month: 'Fév', import: 52, export: 42 },
    { month: 'Mar', import: 38, export: 35 }
  ],
  documents: [
    { type: 'Certificat d\'origine', status: 'En attente', priority: 'high' },
    { type: 'Facture commerciale', status: 'Validé', priority: 'medium' },
    { type: 'Connaissement', status: 'En cours', priority: 'high' }
  ],

  // Logisticien
  warehouse: { occupancy: 78, available: 22, total: 100 },
  routes: [
    { route: 'Route A', optimization: 92, savings: 15 },
    { route: 'Route B', optimization: 85, savings: 12 },
    { route: 'Route C', optimization: 88, savings: 18 }
  ],
  kpis: [
    { metric: 'Délai de livraison', value: 2.3, target: 2.0, status: 'warning' },
    { metric: 'Taux de service', value: 96.5, target: 95.0, status: 'good' },
    { metric: 'Coût logistique', value: 8.2, target: 8.0, status: 'warning' }
  ],
  inventory_alerts: [
    { product: 'Pièces moteur', status: 'Rupture', action: 'Commander' },
    { product: 'Filtres hydrauliques', status: 'Stock faible', action: 'Réapprovisionner' },
    { product: 'Huiles moteur', status: 'Excédent', action: 'Promotion' }
  ],

  // Prestataire multiservices
  projects: { active: 12, completed: 8, pending: 3 },
  services: [
    { name: 'Maintenance préventive', status: 'Disponible', demand: 'Élevée' },
    { name: 'Formation technique', status: 'Disponible', demand: 'Moyenne' },
    { name: 'Consultation', status: 'Disponible', demand: 'Élevée' }
  ],
  revenue: [
    { service: 'Maintenance', revenue: 45000, percentage: 40 },
    { service: 'Formation', revenue: 28000, percentage: 25 },
    { service: 'Consultation', revenue: 38000, percentage: 35 }
  ],
  partners: [
    { name: 'ConstructPro', status: 'Actif', projects: 5 },
    { name: 'MineTech', status: 'Actif', projects: 3 },
    { name: 'LogiSolutions', status: 'En attente', projects: 1 }
  ],
  project_timeline: [
    { project: 'Projet A', start: '2024-01-01', end: '2024-03-31', progress: 75 },
    { project: 'Projet B', start: '2024-02-01', end: '2024-05-31', progress: 45 },
    { project: 'Projet C', start: '2024-03-01', end: '2024-06-30', progress: 25 }
  ],

  // Investisseur
  portfolio: { value: 2500000, growth: 8.5, risk: 'Modéré' },
  opportunities: [
    { name: 'Projet minier Mali', value: 500000, roi: 15, risk: 'Élevé' },
    { name: 'Infrastructure Côte d\'Ivoire', value: 300000, roi: 12, risk: 'Modéré' },
    { name: 'Énergie renouvelable Sénégal', value: 200000, roi: 18, risk: 'Élevé' }
  ],
  roi: [
    { project: 'Projet A', roi: 15.2, duration: '2 ans' },
    { project: 'Projet B', roi: 12.8, duration: '3 ans' },
    { project: 'Projet C', roi: 18.5, duration: '1.5 ans' }
  ],
  roi_data: [
    { month: 'Jan', roi: 12.5 },
    { month: 'Fév', roi: 14.2 },
    { month: 'Mar', roi: 13.8 },
    { month: 'Avr', roi: 15.1 },
    { month: 'Mai', roi: 16.3 },
    { month: 'Juin', roi: 15.7 }
  ],
  market_trends: [
    { sector: 'Mines', trend: 'Hausse', change: 8.5 },
    { sector: 'Construction', trend: 'Stable', change: 2.1 },
    { sector: 'Énergie', trend: 'Hausse', change: 12.3 },
    { sector: 'Transport', trend: 'Baisse', change: -3.2 }
  ],
  risk: [
    { project: 'Projet minier', risk: 'Élevé', mitigation: 'Diversification' },
    { project: 'Infrastructure', risk: 'Modéré', mitigation: 'Assurance' },
    { project: 'Énergie', risk: 'Élevé', mitigation: 'Partage de risques' }
  ],
  interventions: [
    { id: 1, name: 'Révision 500h', equipment: 'Bouteur CAT D9', status: 'Terminé' },
    { id: 2, name: 'Changer filtre à huile', equipment: 'Pelle Komatsu PC200', status: 'Terminé' },
    { id: 3, name: 'Réparation circuit hydraulique', equipment: 'Grue mobile Liebherr', status: 'En attente' },
    { id: 4, name: 'Maintenance préventive', equipment: 'Niveleuse John Deere', status: 'En attente' },
    { id: 5, name: 'Changement de pneus', equipment: 'Chargeuse Volvo L150', status: 'En attente' },
  ],
};
