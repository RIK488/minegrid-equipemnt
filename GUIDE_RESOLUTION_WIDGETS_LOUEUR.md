# 🚀 GUIDE DE RÉSOLUTION - Widgets Loueur d'Engins

## 🔍 **PROBLÈME IDENTIFIÉ**

Les widgets du métier "Loueur d'engins" n'apparaissent pas dans le tableau de bord car le système charge par défaut les widgets du métier "Vendeur".

### **Pages utilisées pour la configuration :**

1. **`DashboardConfigurator.tsx`** - Page de sélection et configuration des widgets par métier
2. **`EnterpriseDashboard.tsx`** - Tableau de bord principal qui affiche les widgets
3. **`LoueurWidgets.js`** - Configuration des widgets spécifiques au métier loueur

## 🛠️ **SOLUTIONS DISPONIBLES**

### **Solution 1 : Script de console (RAPIDE)**

1. **Ouvrir la console du navigateur** (F12)
2. **Copier-coller le script** depuis `activate-loueur-widgets.js`
3. **Recharger la page** (F5)

### **Solution 2 : Configuration manuelle**

1. **Aller sur la page de configuration** : `#entreprise`
2. **Sélectionner le métier** "Loueur d'engins"
3. **Configurer les widgets** souhaités
4. **Sauvegarder la configuration**

### **Solution 3 : Script automatique**

Exécuter le script `force-widget-loueur.js` pour forcer la configuration.

## 📋 **WIDGETS DISPONIBLES POUR LE MÉTIER LOUEUR**

| Position | ID | Type | Titre | Description |
|----------|----|------|-------|-------------|
| 0 | rental-revenue | metric | Revenus de location | Chiffre d'affaires des locations |
| 1 | equipment-availability | equipment | Disponibilité Équipements | État de disponibilité des équipements |
| 2 | equipment-usage | chart | Utilisation équipements | Taux d'utilisation des équipements |
| 3 | upcoming-rentals | calendar | Locations à venir | Planning des locations et réservations |
| 4 | preventive-maintenance | maintenance | Maintenance préventive | Planning des maintenances préventives |
| 5 | delivery-map | map | Carte des livraisons | Suivi GPS des livraisons en cours |
| 6 | rental-pipeline | pipeline | Pipeline de location | Suivi des demandes de location par étape |
| 7 | rental-contracts | list | Contrats de location | Gestion des contrats et documents |
| 8 | delivery-schedule | calendar | Planning des livraisons | Organisation des livraisons et retours |
| 9 | rental-analytics | chart | Analytics de location | KPIs et analyses détaillées |
| 10 | daily-actions | daily-actions | Actions prioritaires du jour | Tâches urgentes pour la gestion des locations |
| 11 | rental-notifications | notifications | Notifications de location | Alertes et notifications importantes |

## 🎯 **ÉTAPES DÉTAILLÉES**

### **Étape 1 : Vérifier la configuration actuelle**

```javascript
// Dans la console du navigateur
const config = localStorage.getItem('enterpriseDashboardConfig');
if (config) {
  const parsed = JSON.parse(config);
  console.log('Métier actuel:', parsed.metier);
  console.log('Widgets configurés:', parsed.dashboardConfig.widgets.length);
}
```

### **Étape 2 : Activer les widgets loueur**

```javascript
// Script à exécuter dans la console
const loueurConfig = {
  metier: 'loueur',
  dashboardConfig: {
    widgets: [
      { id: 'rental-revenue', type: 'metric', title: 'Revenus de location', enabled: true, position: 0 },
      { id: 'equipment-availability', type: 'equipment', title: 'Disponibilité Équipements', enabled: true, position: 1 },
      // ... autres widgets
    ],
    theme: 'light',
    layout: 'grid',
    refreshInterval: 30,
    notifications: true
  }
};

localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(loueurConfig));
```

### **Étape 3 : Recharger la page**

Après avoir exécuté le script, recharger la page (F5) pour voir les widgets loueur.

## 🔧 **CONFIGURATION AVANCÉE**

### **Layout personnalisé**

```javascript
// Layout optimisé pour les widgets loueur
layouts: {
  lg: [
    { i: 'rental-revenue', x: 0, y: 0, w: 3, h: 2 },
    { i: 'equipment-availability', x: 3, y: 0, w: 3, h: 2 },
    { i: 'equipment-usage', x: 6, y: 0, w: 6, h: 4 },
    // ... disposition des autres widgets
  ]
}
```

### **Données spécifiques au métier**

Les widgets loueur utilisent des données spécifiques :
- **Locations** : contrats, planning, revenus
- **Équipements** : disponibilité, utilisation, maintenance
- **Livraisons** : GPS, planning, statuts

## 🚨 **DÉPANNAGE**

### **Problème : Les widgets n'apparaissent toujours pas**

1. **Vérifier la console** pour les erreurs JavaScript
2. **Nettoyer le cache** : `localStorage.clear()`
3. **Recharger complètement** : Ctrl+Shift+R
4. **Vérifier la configuration** dans la console

### **Problème : Widgets vides ou sans données**

1. **Vérifier les données mockées** dans `LoueurWidgets.js`
2. **Tester avec des données de test**
3. **Vérifier les sources de données** (dataSource)

### **Problème : Layout incorrect**

1. **Réinitialiser le layout** dans la configuration
2. **Utiliser le layout par défaut** fourni
3. **Redimensionner manuellement** les widgets

## 📊 **VÉRIFICATION**

Après activation, vérifier que :

1. **Le métier affiché** est "Loueur" dans le header
2. **Les widgets apparaissent** avec les bons titres
3. **Les données s'affichent** correctement
4. **Le layout est correct** et responsive

## 🎯 **PROCHAINES ÉTAPES**

Une fois les widgets loueur activés :

1. **Personnaliser les widgets** selon vos besoins
2. **Configurer les données réelles** (remplacer les données mockées)
3. **Optimiser le layout** pour votre écran
4. **Sauvegarder la configuration** pour une utilisation future

## 📞 **SUPPORT**

Si les problèmes persistent :

1. **Vérifier les logs** dans la console du navigateur
2. **Tester avec le script de base** fourni
3. **Consulter la documentation** des widgets
4. **Contacter le support** avec les détails du problème 