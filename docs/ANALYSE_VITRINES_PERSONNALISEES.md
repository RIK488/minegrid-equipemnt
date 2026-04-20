# Analyse des Vitrines Personnalisées et Services en Commun

## Vue d'ensemble

Le tableau de bord d'entreprise (`EnterpriseDashboard.tsx`) implémente un système de vitrines personnalisées basé sur des widgets configurables, avec des services en commun partagés entre différents métiers du secteur minier et de la construction.

## Architecture des Vitrines Personnalisées

### 1. Structure des Widgets

```typescript
interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'calendar' | 'map' | 'equipment' | 'maintenance';
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  dataSource: string;
  isCollapsed?: boolean;
}
```

### 2. Configuration du Dashboard

```typescript
interface DashboardConfig {
  widgets: Widget[];
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'list' | 'compact';
  refreshInterval: number;
  notifications: boolean;
}
```

### 3. Layout Responsive

```typescript
interface WidgetLayout {
  i: string; // id du widget
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}
```

## Métiers Supportés et Vitrines Spécifiques

### 1. Vendeur d'Engins 🏗️

**Widgets Spécifiques :**
- **Métriques de Vente** : Chiffre d'affaires, nombre de ventes, croissance
- **Inventaire** : Statut des équipements en stock
- **Historique des Ventes** : Évolution mensuelle
- **Pipeline Commercial** : Leads et opportunités

**Données Mockées :**
```javascript
sales: { revenue: 125000, count: 23, growth: 12.5 },
inventory: [
  { name: 'Pelle hydraulique CAT 320D', status: 'En rupture', priority: 'high' },
  { name: 'Concasseur mobile', status: 'Stock faible', priority: 'medium' }
],
leads: [
  { name: 'M. Diallo', company: 'Construction SA', value: 25000, stage: 'Qualification' }
]
```

### 2. Loueur d'Engins 🚜

**Widgets Spécifiques :**
- **Revenus de Location** : CA location, nombre de locations
- **Utilisation des Équipements** : Taux d'utilisation par équipement
- **Calendrier des Locations** : Planning des locations
- **Maintenance Préventive** : Planning des interventions

**Données Mockées :**
```javascript
rental_revenue: { revenue: 85000, count: 15, growth: 8.2 },
equipment_usage: [
  { name: 'Pelle hydraulique', usage: 85, status: 'En location' },
  { name: 'Chargeur', usage: 72, status: 'Disponible' }
],
rentals: [
  { date: '2024-01-15', equipment: 'Pelle hydraulique', client: 'Construction SA', duration: '2 semaines' }
]
```

### 3. Mécanicien/Atelier 🔧

**Widgets Spécifiques :**
- **Interventions du Jour** : Nombre d'interventions terminées/en attente
- **État des Réparations** : Statut des réparations en cours
- **Stock Pièces Détachées** : Gestion des stocks
- **Charge de Travail** : Répartition des tâches par technicien

**Services API :**
```typescript
// APIs POUR LES WIDGETS MÉCANICIEN
export async function getDailyInterventions()
export const getRepairsStatus = async ()
export const updateRepairStatus = async (id: string, status: string)
export const assignTechnicianToRepair = async (repairId: string, technicianId: string, technicianName: string)
export const getInventoryStatus = async ()
export const getTechniciansWorkload = async ()
```

### 4. Transporteur/Logistique 🚛

**Widgets Spécifiques :**
- **Livraisons Actives** : Nombre de livraisons en cours
- **Suivi GPS** : Localisation des véhicules
- **Coûts de Transport** : Analyse des coûts par route
- **Planning des Chauffeurs** : Emploi du temps

**Données Mockées :**
```javascript
active_deliveries: { count: 12, in_transit: 8, delivered: 4 },
gps_tracking: [
  { vehicle: 'Camion 01', location: 'Bamako', status: 'En route', eta: '2h' }
],
transport_costs: [
  { route: 'Bamako - Ouagadougou', cost: 2500, distance: 850, efficiency: 85 }
]
```

### 5. Transitaire 📋

**Widgets Spécifiques :**
- **Déclarations en Douane** : Statut des déclarations
- **Suivi des Conteneurs** : Localisation et statut
- **Statistiques Commerce** : Import/Export
- **Gestion Documentaire** : Certificats, factures, connaissements

**Données Mockées :**
```javascript
customs: { declarations: 8, approved: 6, pending: 2 },
containers: [
  { id: 'CONT001', location: 'Port d\'Abidjan', status: 'En transit', eta: '3 jours' }
],
documents: [
  { type: 'Certificat d\'origine', status: 'En attente', priority: 'high' }
]
```

### 6. Logisticien 📦

**Widgets Spécifiques :**
- **Occupation Entrepôt** : Taux d'occupation des entrepôts
- **Optimisation des Routes** : Efficacité des routes
- **KPIs Logistiques** : Délais, taux de service, coûts
- **Alertes Inventaire** : Gestion des stocks

**Données Mockées :**
```javascript
warehouse: { occupancy: 78, available: 22, total: 100 },
routes: [
  { route: 'Route A', optimization: 92, savings: 15 }
],
kpis: [
  { metric: 'Délai de livraison', value: 2.3, target: 2.0, status: 'warning' }
]
```

### 7. Prestataire Multiservices 🎯

**Widgets Spécifiques :**
- **Projets Actifs** : Gestion des projets en cours
- **Services Disponibles** : Catalogue des services
- **Répartition des Revenus** : CA par service
- **Partenaires** : Gestion des partenariats

**Données Mockées :**
```javascript
projects: { active: 12, completed: 8, pending: 3 },
services: [
  { name: 'Maintenance préventive', status: 'Disponible', demand: 'Élevée' }
],
revenue: [
  { service: 'Maintenance', revenue: 45000, percentage: 40 }
]
```

### 8. Investisseur 💰

**Widgets Spécifiques :**
- **Valeur du Portefeuille** : Valeur totale et croissance
- **Opportunités** : Projets d'investissement
- **Analyse ROI** : Retour sur investissement
- **Tendances Marché** : Évolution des secteurs

**Données Mockées :**
```javascript
portfolio: { value: 2500000, growth: 8.5, risk: 'Modéré' },
opportunities: [
  { name: 'Projet minier Mali', value: 500000, roi: 15, risk: 'Élevé' }
],
roi_data: [
  { month: 'Jan', roi: 12.5 },
  { month: 'Fév', roi: 14.2 }
]
```

## Services en Commun Partagés

### 1. Services de Données Universels

#### Fonctions de Récupération de Données
```typescript
// Métriques
const getMetricData = (widgetId: string) => {
  const metricData = {
    'sales-metrics': { value: '2.4M MAD', change: '+12%', trend: 'up' },
    'rental-revenue': { value: '850K MAD', change: '+8%', trend: 'up' },
    'daily-interventions': { value: '15', change: '+3', trend: 'up' },
    'active-deliveries': { value: '8', change: '-2', trend: 'down' }
  };
  return metricData[widgetId] || { value: '0', change: '0%', trend: 'neutral' };
};

// Listes
const getListData = (widgetId: string): any[] => {
  const listData = {
    'inventory-status': [...],
    'repair-status': [...],
    'gps-tracking': [...],
    'documents': [...]
  };
  return listData[widgetId] || [];
};

// Graphiques
const getChartData = (widgetId: string) => {
  const chartData = {
    'sales-evolution': [...],
    'equipment-usage': [...],
    'spare-parts-stock': [...],
    'transport-costs': [...]
  };
  return chartData[widgetId] || [];
};

// Calendriers
const getCalendarData = (widgetId: string) => {
  const calendarData = {
    'upcoming-rentals': [...],
    'driver-schedule': [...],
    'intervention-schedule': [...]
  };
  return calendarData[widgetId] || [];
};
```

### 2. Services de Gestion des Formulaires

#### Formulaires Universels
```typescript
// Formulaire d'Intervention
const InterventionForm = ({ onClose, onSubmit, equipment, technicians }) => {
  // Gestion des interventions de maintenance
};

// Formulaire de Location
const RentalForm = ({ onClose, onSubmit, equipment }) => {
  // Gestion des locations d'équipements
};

// Formulaire d'Édition de Location
const EditRentalForm = ({ rental, onClose, onSubmit, equipment }) => {
  // Modification des locations existantes
};
```

### 3. Services de Gestion des Modales

#### Modales Universelles
```typescript
// Modale Générique
const Modal = ({ title, children, onClose }) => {
  // Interface modale réutilisable
};

// Modale de Détails de Location
const RentalDetailsModal = ({ rental, onClose }) => {
  // Affichage détaillé des locations
};
```

### 4. Services de Formatage et Utilitaires

#### Fonctions de Formatage
```typescript
// Formatage des devises
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount);
};

// Formatage des dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

// Formatage des pourcentages
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};
```

### 5. Services de Gestion des États

#### Gestion des États du Dashboard
```typescript
// Sauvegarde de la configuration
const saveDashboardConfig = () => {
  // Sauvegarde de la configuration personnalisée
};

// Génération du layout
const generateLayout = (widgets: Widget[]): WidgetLayout[] => {
  // Génération automatique du layout
};

// Gestion des changements de layout
const onLayoutChange = (layout: WidgetLayout[], allLayouts: { [key: string]: WidgetLayout[] }) => {
  // Mise à jour du layout en temps réel
};
```

## Widgets Spécialisés par Métier

### 1. Widgets de Métriques (MetricWidget)
- **Vendeur** : Chiffre d'affaires, nombre de ventes
- **Loueur** : Revenus de location, taux d'occupation
- **Mécanicien** : Interventions du jour, réparations en cours
- **Transporteur** : Livraisons actives, véhicules en route
- **Transitaire** : Déclarations en douane, conteneurs
- **Logisticien** : Occupation entrepôt, KPIs logistiques
- **Prestataire** : Projets actifs, revenus par service
- **Investisseur** : Valeur portefeuille, ROI

### 2. Widgets de Graphiques (ChartWidget)
- **Vendeur** : Évolution des ventes, pipeline commercial
- **Loueur** : Utilisation des équipements, revenus par période
- **Mécanicien** : Répartition des interventions, stock pièces
- **Transporteur** : Coûts de transport, efficacité des routes
- **Transitaire** : Statistiques import/export, tendances
- **Logisticien** : KPIs logistiques, optimisation routes
- **Prestataire** : Répartition des revenus, projets
- **Investisseur** : Analyse ROI, tendances marché

### 3. Widgets de Listes (ListWidget)
- **Vendeur** : Inventaire, leads, opportunités
- **Loueur** : Équipements disponibles, locations en cours
- **Mécanicien** : Réparations, stock pièces, techniciens
- **Transporteur** : Véhicules, chauffeurs, routes
- **Transitaire** : Conteneurs, documents, déclarations
- **Logisticien** : Alertes inventaire, routes optimisées
- **Prestataire** : Services, partenaires, projets
- **Investisseur** : Opportunités, risques, portefeuille

### 4. Widgets de Calendrier (CalendarWidget)
- **Vendeur** : Rendez-vous clients, événements commerciaux
- **Loueur** : Planning des locations, maintenance
- **Mécanicien** : Interventions programmées, réparations
- **Transporteur** : Planning des livraisons, chauffeurs
- **Transitaire** : Échéances douanières, arrivées conteneurs
- **Logisticien** : Planning entrepôt, optimisations
- **Prestataire** : Projets, réunions partenaires
- **Investisseur** : Échéances investissements, réunions

### 5. Widgets Spécialisés

#### EquipmentAvailabilityWidget
- **Fonctionnalités** : Statut des équipements, taux d'utilisation, localisation
- **Métiers** : Loueur, Mécanicien, Logisticien

#### PreventiveMaintenanceWidget
- **Fonctionnalités** : Planning maintenance, priorités, urgences
- **Métiers** : Mécanicien, Loueur

#### SalesPipelineWidget
- **Fonctionnalités** : Gestion des leads, étapes de vente, actions
- **Métiers** : Vendeur, Prestataire

#### InventoryStatusWidget
- **Fonctionnalités** : Gestion des stocks, alertes, commandes
- **Métiers** : Mécanicien, Logisticien, Vendeur

#### SalesEvolutionWidget
- **Fonctionnalités** : Évolution des ventes, tendances, comparaisons
- **Métiers** : Vendeur, Prestataire

## Système de Données Mockées

### Structure des Données par Métier

#### Vendeur d'Engins
```javascript
{
  sales: { revenue: 125000, count: 23, growth: 12.5 },
  inventory: [
    { name: 'Pelle hydraulique CAT 320D', status: 'En rupture', priority: 'high' }
  ],
  sales_history: [45, 52, 38, 67, 58, 72, 89, 76, 65, 82, 91, 78],
  leads: [
    { name: 'M. Diallo', company: 'Construction SA', value: 25000, stage: 'Qualification' }
  ]
}
```

#### Loueur d'Engins
```javascript
{
  rental_revenue: { revenue: 85000, count: 15, growth: 8.2 },
  equipment_usage: [
    { name: 'Pelle hydraulique', usage: 85, status: 'En location' }
  ],
  rentals: [
    { date: '2024-01-15', equipment: 'Pelle hydraulique', client: 'Construction SA', duration: '2 semaines' }
  ],
  maintenance: [
    { equipment: 'Pelle hydraulique', date: '2024-01-25', type: 'Révision générale' }
  ]
}
```

#### Mécanicien/Atelier
```javascript
{
  daily_interventions: { count: 8, completed: 5, pending: 3 },
  repairs: [
    { equipment: 'Pelle hydraulique CAT', status: 'En cours', technician: 'M. Diarra', estimated: '2 jours' }
  ],
  parts: [
    { category: 'Moteurs', stock: 45, min: 20, status: 'OK' }
  ],
  workload: [
    { technician: 'M. Diarra', tasks: 5, completed: 3, efficiency: 85 }
  ]
}
```

## Fonctionnalités Avancées

### 1. Gestion des Actions en Temps Réel
- **Marquer une réparation comme terminée**
- **Assigner un technicien à une réparation**
- **Créer une nouvelle intervention**
- **Créer une nouvelle location**
- **Mettre à jour le statut d'une location**
- **Afficher les détails d'une location**
- **Modifier une location existante**

### 2. Système de Notifications
- **Alertes de stock faible**
- **Notifications de maintenance préventive**
- **Alertes de livraison**
- **Notifications de statut de réparation**

### 3. Personnalisation Avancée
- **Thèmes (clair/sombre/auto)**
- **Layouts (grille/liste/compact)**
- **Intervalle de rafraîchissement**
- **Widgets redimensionnables et déplaçables**

### 4. Intégration API
- **Supabase pour la persistance**
- **APIs métier spécifiques**
- **Gestion des erreurs**
- **Cache des données**

## Conclusion

Le système de vitrines personnalisées offre une solution complète et flexible pour différents métiers du secteur minier et de la construction. Les services en commun permettent une réutilisation optimale du code tout en maintenant la spécificité de chaque métier. L'architecture modulaire facilite l'ajout de nouveaux widgets et métiers.

**Points Forts :**
- Architecture modulaire et extensible
- Services en commun bien structurés
- Interface utilisateur intuitive et responsive
- Données mockées réalistes
- Gestion d'état robuste
- Intégration API complète

**Améliorations Possibles :**
- Ajout de nouveaux métiers
- Widgets de cartographie avancés
- Système de rapports automatisés
- Intégration de l'IA pour les prédictions
- Synchronisation temps réel multi-utilisateurs 