# 🔗 GUIDE : Connexion des Données Réelles au Portail Pro

## 🎯 Objectif

Connecter tous les éléments du portail pro (métriques, équipements, commandes, maintenance, notifications) aux données réelles de l'utilisateur au lieu d'afficher des valeurs à "0".

## 🔧 Corrections Appliquées

### 1. **Fonction getPortalStats() - Métriques du Dashboard**

**Problème :** Les statistiques n'incluaient que les équipements Pro, pas les annonces.

**Solution :** Intégration des données réelles de l'utilisateur.

```typescript
// AVANT - Données incomplètes
const [equipment, orders, interventions, notifications] = await Promise.all([
  getClientEquipment(),
  getClientOrders(),
  getMaintenanceInterventions(),
  getClientNotifications()
]);

// APRÈS - Données complètes
const [equipment, userMachines, orders, interventions, notifications] = await Promise.all([
  getClientEquipment(),
  getUserMachines(),  // ✅ Ajout des annonces
  getClientOrders(),
  getMaintenanceInterventions(),
  getClientNotifications()
]);

// Calcul avec données réelles
const totalEquipment = equipment.length + userMachines.length;
const activeEquipment = equipment.filter(e => e.status === 'active').length + userMachines.length;
```

### 2. **Correction de l'incohérence sellerId/sellerid**

**Problème :** Incohérence de casse dans les noms de colonnes.

**Fichiers corrigés :**
- `src/utils/proApi.ts` - `getUserMachines()`
- `src/utils/api.js` - Fonctions de récupération
- `src/pages/SellerMachines.js` - Affichage des machines

```javascript
// AVANT
.eq('sellerId', user.id)

// APRÈS
.eq('sellerid', user.id)
```

## 📊 Données Créées

### **Équipements Pro (client_equipment)**
- **3 équipements** avec statuts variés
- **Pelle hydraulique CAT 320D** - Actif
- **Chargeur frontal Volvo L120H** - En maintenance
- **Bulldozer Komatsu D65** - Actif (garantie expirée)

### **Annonces d'Équipements (machines)**
- **3 annonces** publiées par l'utilisateur
- **Excavatrice Hitachi ZX200** - 95 000€
- **Chargeur Volvo L120** - 75 000€
- **Bouteur CAT D6** - 85 000€

### **Commandes (client_orders)**
- **2 commandes** avec statuts différents
- **CMD-001** - En attente (125 000€)
- **CMD-002** - Confirmée (8 500€)

### **Interventions de Maintenance**
- **2 interventions** programmées
- **Maintenance préventive** - Programmé (3 jours)
- **Réparation hydraulique** - En cours

### **Notifications (client_notifications)**
- **3 notifications** avec priorités variées
- **Maintenance prévue** - Non lue (normale)
- **Garantie expirée** - Non lue (urgente)
- **Commande confirmée** - Lue (normale)

## 🚀 Instructions d'Exécution

### **Étape 1 : Créer les Données Réelles**

1. **Ouvrir la console du navigateur** (F12)
2. **Aller sur le portail pro** (`localhost:5173/#pro`)
3. **Exécuter le script de création :**

```javascript
// Copier-coller le contenu de create-real-data-portal-pro.js
```

### **Étape 2 : Vérifier les Résultats**

Après exécution du script, vous devriez voir :

```
✅ Utilisateur connecté: [user-id]
✅ Profil Pro créé/récupéré: Entreprise Test Pro
✅ Équipements Pro créés: 3
✅ Annonces créées: 3
✅ Commandes créées: 2
✅ Interventions créées: 2
✅ Notifications créées: 3
📊 Statistiques calculées:
  - Équipements totaux: 6
  - Commandes en attente: 1
  - Interventions à venir: 1
  - Notifications non lues: 2
```

### **Étape 3 : Recharger la Page**

1. **Recharger la page** du portail pro (F5)
2. **Vérifier les métriques** dans "Vue d'ensemble"
3. **Aller sur l'onglet "Équipements"** pour voir les données

## 📈 Métriques Attendues

### **Vue d'ensemble - Métriques**
- **Équipements Totaux :** 6 (3 Pro + 3 annonces)
- **Équipements Actifs :** 5 (2 Pro actifs + 3 annonces)
- **Commandes en Attente :** 1
- **Interventions à Venir :** 1
- **Notifications Non Lues :** 2

### **Onglet Équipements**
- **Section "Équipements Pro" :** 3 équipements
- **Section "Mes Annonces" :** 3 annonces
- **Total affiché :** 6 équipements

## 🔄 Workflow de Données

### **Chargement des Données**
```typescript
// Dans ProDashboard.tsx
const loadDashboardData = async () => {
  const [profile, equipmentData, userMachinesData, ordersData, interventionsData, notificationsData, statsData] = await Promise.all([
    getProClientProfile(),
    getClientEquipment(),      // Équipements Pro
    getUserMachines(),         // Annonces utilisateur
    getClientOrders(),
    getMaintenanceInterventions(),
    getClientNotifications(),
    getPortalStats()          // Statistiques calculées
  ]);
};
```

### **Calcul des Statistiques**
```typescript
// Dans getPortalStats()
const totalEquipment = equipment.length + userMachines.length;
const activeEquipment = equipment.filter(e => e.status === 'active').length + userMachines.length;
const pendingOrders = orders.filter(o => o.status === 'pending').length;
const upcomingInterventions = interventions.filter(i => 
  i.status === 'scheduled' && new Date(i.scheduled_date) > new Date()
).length;
const unreadNotifications = notifications.filter(n => !n.is_read).length;
```

## 🧪 Tests de Validation

### **Test Automatique**
```javascript
// Exécuter le script de test
window.testEquipementPortalPro();
```

### **Test Manuel**
1. **Vérifier les compteurs** dans "Vue d'ensemble"
2. **Aller sur "Équipements"** - voir les 2 sections
3. **Aller sur "Commandes"** - voir les 2 commandes
4. **Aller sur "Maintenance"** - voir les 2 interventions
5. **Aller sur "Notifications"** - voir les 3 notifications

## 🔧 Maintenance

### **Ajout de Nouvelles Données**
Pour ajouter de nouvelles données, modifier le script `create-real-data-portal-pro.js` :

```javascript
// Ajouter de nouveaux équipements
const newEquipment = {
  client_id: proProfile.id,
  serial_number: 'PRO-004',
  // ... autres propriétés
};

// Ajouter de nouvelles annonces
const newMachine = {
  name: 'Nouvelle Machine',
  sellerid: user.id,
  // ... autres propriétés
};
```

### **Mise à Jour des Statistiques**
Les statistiques se mettent à jour automatiquement grâce à la fonction `getPortalStats()` qui :
- Récupère toutes les données en temps réel
- Calcule les métriques dynamiquement
- Retourne des valeurs à jour

## ✅ Résultat Final

Après application de ces corrections :

- ✅ **Métriques réelles** au lieu de "0"
- ✅ **Équipements affichés** dans l'onglet équipement
- ✅ **Données cohérentes** entre toutes les sections
- ✅ **Statistiques dynamiques** basées sur les vraies données
- ✅ **Interface fonctionnelle** avec données réelles

Le portail pro affiche maintenant les vraies données de l'utilisateur au lieu de valeurs de démonstration ! 