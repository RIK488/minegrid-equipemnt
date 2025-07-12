# 🚢 MODULE 2 — Simulateur Logistique International

## 📋 Vue d'ensemble

Le module de simulateur logistique permet d'estimer les coûts de transport de machines vers les principales destinations africaines depuis les ports marocains et européens.

## 🎯 Fonctionnalités

### ✅ Implémentées
- **Table de coûts complète** : 7 ports de départ (3 marocains + 4 européens) → 8 destinations africaines
- **Calcul intelligent** : Ajustement selon poids et volume de la machine
- **Interface utilisateur** : Composants React avec design moderne
- **Intégration** : Affichage dans les fiches machines
- **Détail des coûts** : Transport maritime + Douane + Transport terrestre
- **Sélection par région** : Maroc et Europe comme ports de départ

### 🚀 Fonctionnalités avancées
- **Simulateur complet** : `LogisticsSimulator.tsx` avec sélecteurs par région
- **Carte rapide** : `TransportCard.tsx` pour affichage compact
- **Calculs dynamiques** : Ajustement automatique selon caractéristiques machine
- **Interface colorée** : Couleurs différentes pour Maroc (bleu) et Europe (vert)

## 📊 Structure des données

### Ports de départ
#### 🇲🇦 Ports marocains
- **Casablanca** : Port principal du Maroc
- **Tanger** : Port méditerranéen
- **Agadir** : Port atlantique sud

#### 🇪🇺 Ports européens
- **Marseille** (France) : Port méditerranéen
- **Rotterdam** (Pays-Bas) : Port principal européen
- **Hambourg** (Allemagne) : Port de la mer du Nord
- **Anvers** (Belgique) : Port de la mer du Nord

### Destinations africaines
- **Abidjan** (Côte d'Ivoire)
- **Dakar** (Sénégal)
- **Cotonou** (Bénin)
- **Lagos** (Nigeria)
- **Accra** (Ghana)
- **Douala** (Cameroun)
- **Bamako** (Mali)
- **Ouagadougou** (Burkina Faso)

### Structure des coûts
```typescript
interface TransportCost {
  cost: number;        // Coût total en euros
  days: number;        // Délai en jours
  details: {
    shipping: number;  // Transport maritime
    customs: number;   // Frais de douane
    inland: number;    // Transport terrestre
  };
}
```

## 🔧 Utilisation technique

### Import du module
```typescript
import { estimerTransport, formatCost, formatDelay, getOriginsByContinent } from '../utils/transport';
```

### Calcul de base
```typescript
const cost = estimerTransport('Casablanca', 'Abidjan');
// Retourne: { cost: 850, days: 15, details: {...} }

const cost = estimerTransport('Marseille', 'Abidjan');
// Retourne: { cost: 1200, days: 18, details: {...} }
```

### Calcul avec poids/volume
```typescript
const cost = estimerTransport('Casablanca', 'Abidjan', 25, 120);
// Ajuste automatiquement selon le poids (25 tonnes) et volume (120 m³)
```

### Composants React
```typescript
// Simulateur complet
<LogisticsSimulator 
  machineWeight={20} 
  machineVolume={100} 
/>

// Carte compacte
<TransportCard 
  machineWeight={20} 
  machineVolume={100} 
  origin="Casablanca"
/>
```

## 📈 Exemples de coûts

### Casablanca → Destinations principales
| Destination | Coût base | Délai | Transport | Douane | Terrestre | Région |
|-------------|-----------|-------|-----------|--------|-----------|--------|
| Abidjan     | 850 €     | 15j   | 600 €     | 150 €  | 100 €     | 🇲🇦 Maroc |
| Dakar       | 760 €     | 12j   | 500 €     | 120 €  | 140 €     | 🇲🇦 Maroc |
| Lagos       | 980 €     | 20j   | 700 €     | 180 €  | 100 €     | 🇲🇦 Maroc |
| Accra       | 890 €     | 16j   | 620 €     | 160 €  | 110 €     | 🇲🇦 Maroc |

### Marseille → Destinations principales
| Destination | Coût base | Délai | Transport | Douane | Terrestre | Région |
|-------------|-----------|-------|-----------|--------|-----------|--------|
| Abidjan     | 1200 €    | 18j   | 850 €     | 200 €  | 150 €     | 🇪🇺 Europe |
| Dakar       | 1100 €    | 15j   | 750 €     | 180 €  | 170 €     | 🇪🇺 Europe |
| Lagos       | 1300 €    | 22j   | 950 €     | 230 €  | 120 €     | 🇪🇺 Europe |
| Accra       | 1220 €    | 19j   | 870 €     | 210 €  | 140 €     | 🇪🇺 Europe |

### Comparaison des coûts par région de départ
| Région | Coût moyen | Délai moyen | Avantage |
|--------|------------|-------------|----------|
| **Maroc** | 870€ | 16 jours | Plus proche, coûts réduits |
| **Europe** | 1280€ | 20 jours | Infrastructure développée |

### Ajustements selon poids
- **Base** : 20 tonnes
- **Facteur** : 0.5x à 2.0x selon poids
- **Exemple** : 40 tonnes = 1.5x le coût de base

## 🎨 Interface utilisateur

### Simulateur complet (`LogisticsSimulator.tsx`)
- ✅ Sélecteurs de région de départ, port de départ et destination
- ✅ Affichage des caractéristiques de la machine
- ✅ Résultat principal avec coût et délai
- ✅ Détail des coûts (maritime, douane, terrestre)
- ✅ Couleurs différentes par région (bleu pour Maroc, vert pour Europe)
- ✅ Note d'information sur l'estimation

### Carte rapide (`TransportCard.tsx`)
- ✅ Affichage compact des 4 destinations principales
- ✅ Coût et délai pour chaque destination
- ✅ Design minimaliste et informatif
- ✅ Couleurs différenciées selon la région de départ

## 🔄 Intégration dans l'application

### Dans `MachineDetail.tsx`
1. **Carte rapide** : Affichée dans la sidebar avec les infos vendeur
2. **Simulateur complet** : Affiché dans la section spécifications techniques

### Données utilisées
- **Poids** : `machineData.specifications.weight` (converti kg → tonnes)
- **Volume** : Calculé à partir des dimensions si disponibles
- **Port par défaut** : Casablanca

## 🚀 Améliorations futures

### Fonctionnalités à ajouter
- [ ] **Plus de ports** : Ajouter d'autres ports africains et européens
- [ ] **Devises locales** : Affichage en XOF, XAF, NGN, etc.
- [ ] **Saisonnalité** : Variation des coûts selon la période
- [ ] **Options de transport** : Maritime, aérien, terrestre
- [ ] **Calcul de devis** : Génération de devis détaillés
- [ ] **Historique des prix** : Évolution des coûts
- [ ] **Notifications** : Alertes sur les variations de prix
- [ ] **Routes terrestres** : Transport par camion vers l'Europe

### Optimisations techniques
- [ ] **Cache des calculs** : Mémorisation des résultats
- [ ] **API externe** : Intégration de vraies données de fret
- [ ] **Calculs en temps réel** : Mise à jour automatique
- [ ] **Export PDF** : Génération de devis imprimables

## 📝 Notes importantes

### Limitations actuelles
- **Estimation indicative** : Les coûts sont basés sur des moyennes
- **Période de validité** : Les prix peuvent varier rapidement
- **Conditions spéciales** : Non incluses (urgence, surcharge, etc.)

### Recommandations
- **Mise à jour régulière** : Actualiser les coûts trimestriellement
- **Validation** : Vérifier les prix auprès des transporteurs
- **Flexibilité** : Prévoir des marges de variation

## 🎯 Résultat final

Le module 2 est **entièrement fonctionnel** et permet aux utilisateurs de :

1. **Voir rapidement** les coûts de transport depuis le Maroc et l'Europe vers l'Afrique
2. **Simuler différents scénarios** avec le simulateur complet
3. **Prendre des décisions éclairées** sur les coûts logistiques
4. **Comparer les ports de départ** selon leurs besoins
5. **Choisir par région** pour faciliter la navigation

L'intégration est **seamless** dans l'interface existante et améliore significativement l'expérience utilisateur pour les acheteurs internationaux. 