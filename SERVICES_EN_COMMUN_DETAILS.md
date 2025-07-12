# Services en Commun - Détails Techniques

## Vue d'ensemble des Services Partagés

Le système de vitrines personnalisées utilise un ensemble de services en commun qui sont partagés entre tous les métiers, permettant une réutilisation optimale du code et une maintenance simplifiée.

## 1. Services de Gestion des Données

### 1.1 Fonctions de Récupération de Données

#### `getMetricData(widgetId: string)`
**Description :** Récupère les données métriques pour les widgets de type "metric"

**Utilisation par métier :**
```typescript
// Vendeur d'Engins
'sales-metrics': { value: '2.4M MAD', change: '+12%', trend: 'up' }

// Loueur d'Engins  
'rental-revenue': { value: '850K MAD', change: '+8%', trend: 'up' }

// Mécanicien/Atelier
'daily-interventions': { value: '15', change: '+3', trend: 'up' }

// Transporteur/Logistique
'active-deliveries': { value: '8', change: '-2', trend: 'down' }

// Transitaire
'custom-declarations': { value: '24', change: '+5', trend: 'up' }

// Logisticien
'warehouse-occupancy': { value: '78%', change: '+3%', trend: 'up' }

// Prestataire Multiservices
'active-projects': { value: '12', change: '+2', trend: 'up' }

// Investisseur
'portfolio-value': { value: '15.2M MAD', change: '+18%', trend: 'up' }
```

#### `getListData(widgetId: string): any[]`
**Description :** Récupère les données de liste pour les widgets de type "list"

**Types de données supportés :**
- `inventory-status` : Statut des stocks
- `repair-status` : État des réparations
- `gps-tracking` : Suivi GPS des véhicules
- `documents` : Gestion documentaire
- `stock-alerts` : Alertes de stock

#### `getChartData(widgetId: string)`
**Description :** Récupère les données pour les graphiques

**Types de graphiques supportés :**
- `sales-evolution` : Évolution des ventes
- `equipment-usage` : Utilisation des équipements
- `spare-parts-stock` : Stock de pièces détachées
- `transport-costs` : Coûts de transport
- `import-export-stats` : Statistiques import/export
- `supply-chain-kpis` : KPIs de la chaîne logistique
- `service-revenue` : Revenus par service
- `roi-analysis` : Analyse ROI

#### `getCalendarData(widgetId: string)`
**Description :** Récupère les données de calendrier

**Types de calendriers :**
- `upcoming-rentals` : Locations à venir
- `driver-schedule` : Planning des chauffeurs
- `intervention-schedule` : Planning des interventions

#### `getMapData(widgetId: string)`
**Description :** Récupère les données de cartographie

**Types de cartes :**
- `delivery-map` : Carte des livraisons
- `container-tracking` : Suivi des conteneurs
- `route-optimization` : Optimisation des routes

#### `getMaintenanceData(widgetId: string)`
**Description :** Récupère les données de maintenance préventive

**Données incluses :**
- Équipements concernés
- Dates programmées
- Priorités et urgences
- Techniciens assignés

### 1.2 Services de Données Spécialisés

#### `getEquipmentAvailabilityData(widgetId: string)`
**Description :** Données de disponibilité des équipements

**Utilisé par :** Loueur, Mécanicien, Logisticien

**Données retournées :**
```typescript
{
  id: string;
  equipmentFullName: string;
  status: 'Disponible' | 'En location' | 'Maintenance';
  statusColor: string;
  usageRate: number;
  year: number;
  condition: string;
  brand: string;
  model: string;
}
```

## 2. Services de Gestion des Formulaires

### 2.1 Formulaires Universels

#### `InterventionForm`
**Description :** Formulaire de création d'intervention de maintenance

**Props :**
```typescript
{
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipment: any[];
  technicians: any[];
}
```

**Champs inclus :**
- Nom de l'intervention
- Équipement concerné
- Technicien assigné
- Description
- Durée estimée
- Date programmée
- Priorité

#### `RentalForm`
**Description :** Formulaire de création de location

**Props :**
```typescript
{
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipment: any[];
}
```

**Champs inclus :**
- Équipement à louer
- Client
- Date de début
- Date de fin
- Prix total
- Conditions spéciales

#### `EditRentalForm`
**Description :** Formulaire de modification de location

**Props :**
```typescript
{
  rental: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  equipment: any[];
}
```

**Fonctionnalités :**
- Modification des dates
- Changement de prix
- Mise à jour du statut
- Modification des conditions

### 2.2 Gestion des Actions

#### Actions sur les Réparations
```typescript
// Marquer une réparation comme terminée
const handleMarkRepairComplete = async (repairId: string) => {
  await updateRepairStatus(repairId, 'Terminé');
  refreshDashboardData();
};

// Assigner un technicien
const handleAssignTechnician = async (repairId: string, technicianId: string, technicianName: string) => {
  await assignTechnicianToRepair(repairId, technicianId, technicianName);
  refreshDashboardData();
};
```

#### Actions sur les Locations
```typescript
// Créer une nouvelle location
const handleCreateRental = async (formData: any) => {
  await createRental(formData);
  refreshDashboardData();
};

// Mettre à jour le statut
const handleUpdateRentalStatus = async (rentalId: string, status: string) => {
  await updateRentalStatus(rentalId, status);
  refreshDashboardData();
};

// Modifier une location
const handleUpdateRental = async (formData: any) => {
  await updateRental(selectedRental.id, formData);
  refreshDashboardData();
};
```

## 3. Services de Gestion des Modales

### 3.1 Modale Générique

#### `Modal`
**Description :** Composant modale réutilisable

**Props :**
```typescript
{
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}
```

**Utilisation :**
```typescript
<Modal title="Nouvelle Intervention" onClose={() => setShowInterventionForm(false)}>
  <InterventionForm 
    onClose={() => setShowInterventionForm(false)} 
    onSubmit={handleCreateIntervention} 
    equipment={equipment} 
    technicians={technicians} 
  />
</Modal>
```

### 3.2 Modales Spécialisées

#### `RentalDetailsModal`
**Description :** Affichage détaillé d'une location

**Fonctionnalités :**
- Informations complètes de la location
- Statut en temps réel
- Historique des modifications
- Actions disponibles

#### `InventoryDetailsModal`
**Description :** Détails d'un article en stock

**Informations affichées :**
- Stock actuel vs minimum
- Fournisseur et contact
- Dernière commande
- Prochaine livraison
- Coût unitaire

## 4. Services de Formatage et Utilitaires

### 4.1 Fonctions de Formatage

#### `formatCurrency(amount: number)`
**Description :** Formatage des montants en MAD

**Utilisation :**
```typescript
formatCurrency(1250000) // "1 250 000,00 MAD"
```

#### `formatDate(dateString: string)`
**Description :** Formatage des dates en français

**Utilisation :**
```typescript
formatDate('2024-01-15') // "15/01/2024"
```

#### `formatPercentage(value: number)`
**Description :** Formatage des pourcentages

**Utilisation :**
```typescript
formatPercentage(12.5) // "12.5%"
```

### 4.2 Fonctions Utilitaires

#### `getStatusColor(status: string)`
**Description :** Retourne la couleur appropriée pour un statut

**Statuts supportés :**
- `'Terminé'` → `'green'`
- `'En cours'` → `'orange'`
- `'En attente'` → `'yellow'`
- `'Annulé'` → `'red'`

#### `getPriorityColor(priority: string)`
**Description :** Retourne la couleur pour une priorité

**Priorités supportées :**
- `'Haute'` → `'red'`
- `'Moyenne'` → `'orange'`
- `'Basse'` → `'green'`

## 5. Services de Gestion des États

### 5.1 Configuration du Dashboard

#### `saveDashboardConfig()`
**Description :** Sauvegarde la configuration personnalisée

**Données sauvegardées :**
- Liste des widgets activés
- Position et taille des widgets
- Thème sélectionné
- Layout choisi
- Intervalle de rafraîchissement

#### `generateLayout(widgets: Widget[]): WidgetLayout[]`
**Description :** Génère automatiquement le layout des widgets

**Algorithme :**
- Répartition en grille 12 colonnes
- Taille adaptative selon le type de widget
- Positionnement automatique

#### `onLayoutChange(layout: WidgetLayout[], allLayouts: { [key: string]: WidgetLayout[] })`
**Description :** Gère les changements de layout en temps réel

**Fonctionnalités :**
- Sauvegarde automatique des positions
- Adaptation responsive
- Persistance des préférences

### 5.2 Gestion des Données

#### `refreshDashboardData()`
**Description :** Rafraîchit toutes les données du dashboard

**Actions :**
- Rechargement des métriques
- Mise à jour des listes
- Actualisation des graphiques
- Synchronisation avec l'API

#### `loadReferenceData()`
**Description :** Charge les données de référence

**Données chargées :**
- Liste des équipements
- Liste des techniciens
- Configuration des widgets
- Préférences utilisateur

## 6. Services de Gestion des Widgets

### 6.1 Actions sur les Widgets

#### `handleRemoveWidget(widgetId: string)`
**Description :** Supprime un widget du dashboard

#### `handleToggleSize(widgetId: string)`
**Description :** Change la taille d'un widget

#### `handleToggleVisibility(widgetId: string)`
**Description :** Masque/affiche un widget

#### `handleShowDetails(content: React.ReactNode)`
**Description :** Affiche les détails dans une modale

### 6.2 Gestion des Données des Widgets

#### `renderWidgetContent(widget: any)`
**Description :** Rend le contenu approprié selon le type de widget

**Types supportés :**
- `metric` → `MetricWidget`
- `chart` → `ChartWidget`
- `list` → `ListWidget`
- `calendar` → `CalendarWidget`
- `map` → `MapWidget`
- `equipment` → `EquipmentAvailabilityWidget`
- `maintenance` → `PreventiveMaintenanceWidget`

## 7. Services d'Intégration API

### 7.1 APIs Métier

#### APIs Mécanicien
```typescript
export async function getDailyInterventions()
export const getRepairsStatus = async ()
export const updateRepairStatus = async (id: string, status: string)
export const assignTechnicianToRepair = async (repairId: string, technicianId: string, technicianName: string)
export const getInventoryStatus = async ()
export const getTechniciansWorkload = async ()
export const getMechanicStats = async ()
export async function createIntervention(interventionData: any)
```

#### APIs Location
```typescript
export async function getRentalRevenue()
export async function getEquipmentAvailability()
export async function getUpcomingRentals()
export async function createRental(rentalData: any)
export async function updateRentalStatus(rentalId: string, status: string)
export async function updateRental(rentalId: string, rentalData: any)
```

#### APIs Maintenance
```typescript
export async function getPreventiveMaintenance()
export async function createMaintenanceIntervention(interventionData: any)
export async function updateInterventionStatus(interventionId: string, status: string)
export async function updateMaintenanceIntervention(interventionId: string, interventionData: any)
export async function deleteMaintenanceIntervention(interventionId: string)
```

### 7.2 Gestion des Erreurs

#### Gestion Centralisée des Erreurs
```typescript
try {
  const data = await apiCall();
  return data;
} catch (error) {
  console.error('Erreur lors de l\'appel API:', error);
  // Retourner des données par défaut ou gérer l'erreur
  return fallbackData;
}
```

## 8. Services de Personnalisation

### 8.1 Thèmes

#### Support des Thèmes
- `light` : Thème clair
- `dark` : Thème sombre
- `auto` : Thème automatique selon les préférences système

#### Application des Thèmes
```typescript
const themeClasses = {
  light: 'bg-white text-gray-900',
  dark: 'bg-gray-900 text-white',
  auto: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
};
```

### 8.2 Layouts

#### Types de Layouts
- `grid` : Layout en grille responsive
- `list` : Layout en liste verticale
- `compact` : Layout compact optimisé

#### Responsive Design
```typescript
const breakpoints = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0};
const cols = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2};
```

## 9. Services de Performance

### 9.1 Optimisation des Données

#### Cache des Données
- Mise en cache des données fréquemment utilisées
- Invalidation intelligente du cache
- Synchronisation avec l'API

#### Chargement Lazy
- Chargement des widgets à la demande
- Optimisation des images et icônes
- Réduction du bundle initial

### 9.2 Monitoring

#### Métriques de Performance
- Temps de chargement des widgets
- Utilisation mémoire
- Nombre d'appels API
- Erreurs et exceptions

## 10. Services de Sécurité

### 10.1 Authentification

#### Vérification de Session
```typescript
const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  setIsAuthenticated(!!session);
  setSessionChecked(true);
};
```

#### Protection des Routes
- Vérification de l'authentification
- Gestion des permissions
- Redirection automatique

### 10.2 Validation des Données

#### Validation des Formulaires
- Validation côté client
- Sanitisation des entrées
- Protection contre les injections

## Conclusion

Les services en commun constituent la base solide du système de vitrines personnalisées. Ils offrent :

**Avantages :**
- Réutilisation maximale du code
- Maintenance simplifiée
- Cohérence de l'interface utilisateur
- Performance optimisée
- Sécurité renforcée

**Architecture :**
- Modulaire et extensible
- Bien documentée
- Facilement testable
- Intégration API robuste

Cette architecture permet d'ajouter facilement de nouveaux métiers et widgets tout en maintenant la qualité et la cohérence du système. 