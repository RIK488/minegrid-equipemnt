# 🚀 GUIDE D'ACTIVATION - Widgets Loueur d'Engins

## 🎯 **PROBLÈME IDENTIFIÉ**

Lors du rechargement de la page, les widgets qui apparaissent sont ceux du métier **Vendeur** au lieu de ceux du métier **Loueur d'engins**.

### **🔍 CAUSE RACINE :**
Le problème vient d'une **incompatibilité entre les clés localStorage** :
- **DashboardConfigurator** sauvegarde avec : `enterpriseDashboardConfig_${metier}`
- **EnterpriseDashboard** cherche avec : `enterpriseDashboardConfig` (sans suffixe)

## 🔧 **SOLUTION RAPIDE**

### **Étape 1 : Test de Diagnostic**
1. **F12** → Onglet "Console"
2. **Copiez-collez** le script de test :

```javascript
// Script de test d'existence des widgets Loueur
console.log('🔍 TEST D\'EXISTENCE DES WIDGETS LOUEUR');

const expectedLoueurWidgets = [
  { id: 'rental-revenue', title: 'Revenus de location' },
  { id: 'equipment-availability', title: 'Disponibilité Équipements' },
  { id: 'upcoming-rentals', title: 'Locations à venir' },
  { id: 'rental-pipeline', title: 'Pipeline de location' },
  { id: 'daily-actions', title: 'Actions prioritaires du jour' }
];

console.log('✅ Widgets attendus pour le métier Loueur:');
expectedLoueurWidgets.forEach((widget, index) => {
  console.log(`   ${index + 1}. ${widget.title} (${widget.id})`);
});

const currentConfig = localStorage.getItem('enterpriseDashboardConfig');
const selectedMetier = localStorage.getItem('selectedMetier');

console.log('📊 ÉTAT ACTUEL:');
console.log(`   Configuration: ${currentConfig ? '✅' : '❌'}`);
console.log(`   Métier sélectionné: ${selectedMetier || 'Aucun'}`);

if (currentConfig) {
  try {
    const parsed = JSON.parse(currentConfig);
    console.log(`   Métier configuré: ${parsed.metier}`);
    console.log(`   Widgets configurés: ${parsed.widgets?.length || 0}`);
  } catch (e) {
    console.log('   Erreur parsing:', e.message);
  }
}
```

### **Étape 2 : Script de Forçage (VERSION 2)**

Si le test montre que les widgets Vendeur sont chargés, utilisez ce script :

```javascript
// Script pour forcer le chargement des widgets Loueur d'engins - VERSION 2
console.log('🚀 FORÇAGE DES WIDGETS LOUEUR D\'ENGINS - VERSION 2');

// 1. Nettoyer toutes les configurations existantes
console.log('🗑️ Nettoyage des configurations existantes...');
const allKeys = Object.keys(localStorage);
const dashboardKeys = allKeys.filter(key => 
  key.includes('dashboard') || 
  key.includes('widget') || 
  key.includes('config') || 
  key.includes('enterprise') ||
  key.includes('vendeur') ||
  key.includes('metier') ||
  key.includes('selected')
);

dashboardKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('   ✅ Supprimé:', key);
});

// 2. Configuration forcée pour le métier Loueur
const loueurConfig = {
  version: '2.0.0',
  metier: 'loueur',
  widgets: [
    {
      id: 'rental-revenue',
      type: 'metric',
      title: 'Revenus de location',
      description: 'Chiffre d\'affaires des locations',
      icon: { name: 'DollarSign' },
      dataSource: 'rental-revenue',
      enabled: true,
      isCollapsed: false,
      position: 0
    },
    {
      id: 'equipment-availability',
      type: 'equipment',
      title: 'Disponibilité Équipements',
      description: 'État de disponibilité des équipements',
      icon: { name: 'Building2' },
      dataSource: 'equipment-availability',
      enabled: true,
      isCollapsed: false,
      position: 1
    },
    {
      id: 'upcoming-rentals',
      type: 'calendar',
      title: 'Locations à venir',
      description: 'Planning des locations et réservations',
      icon: { name: 'Calendar' },
      dataSource: 'upcoming-rentals',
      enabled: true,
      isCollapsed: false,
      position: 2
    },
    {
      id: 'rental-pipeline',
      type: 'pipeline',
      title: 'Pipeline de location',
      description: 'Suivi des demandes de location par étape',
      icon: { name: 'Users' },
      dataSource: 'rental-pipeline',
      enabled: true,
      isCollapsed: false,
      position: 3
    },
    {
      id: 'daily-actions',
      type: 'daily-actions',
      title: 'Actions prioritaires du jour',
      description: 'Tâches urgentes pour la gestion des locations',
      icon: { name: 'Target' },
      dataSource: 'daily-actions',
      enabled: true,
      isCollapsed: false,
      position: 4
    }
  ],
  layout: {
    lg: [
      { i: 'rental-revenue', x: 0, y: 0, w: 3, h: 2 },
      { i: 'equipment-availability', x: 3, y: 0, w: 3, h: 2 },
      { i: 'upcoming-rentals', x: 6, y: 0, w: 6, h: 4 },
      { i: 'rental-pipeline', x: 0, y: 2, w: 6, h: 4 },
      { i: 'daily-actions', x: 6, y: 4, w: 6, h: 2 }
    ]
  },
  theme: 'light',
  refreshInterval: 30,
  notifications: true,
  createdAt: new Date().toISOString(),
  forceInjection: true
};

// 3. Sauvegarder la configuration avec TOUTES les clés possibles
console.log('💾 Sauvegarde de la configuration Loueur...');

// Clé principale (celle que cherche EnterpriseDashboard.tsx)
localStorage.setItem('enterpriseDashboardConfig', JSON.stringify(loueurConfig));

// Clé spécifique au métier (celle que sauvegarde DashboardConfigurator)
localStorage.setItem('enterpriseDashboardConfig_loueur', JSON.stringify(loueurConfig));

// Clés de sélection
localStorage.setItem('selectedMetier', 'loueur');
localStorage.setItem('enterpriseDashboardConfigured', 'true');

// Configuration de fallback
localStorage.setItem('dashboardConfig', JSON.stringify(loueurConfig));

console.log('✅ Configuration Loueur sauvegardée avec succès !');
console.log('📊 Widgets configurés:', loueurConfig.widgets.length);

// 4. Vérification
console.log('🔍 Vérification des clés sauvegardées:');
console.log('   enterpriseDashboardConfig:', localStorage.getItem('enterpriseDashboardConfig') ? '✅' : '❌');
console.log('   enterpriseDashboardConfig_loueur:', localStorage.getItem('enterpriseDashboardConfig_loueur') ? '✅' : '❌');
console.log('   selectedMetier:', localStorage.getItem('selectedMetier'));
console.log('   enterpriseDashboardConfigured:', localStorage.getItem('enterpriseDashboardConfigured'));

console.log('🔄 Rechargez la page pour voir les widgets Loueur !');
```

### **Étape 3 : Recharger la Page**
1. **Appuyez sur F5** pour recharger la page
2. **Allez sur** `http://localhost:5176/#entreprise`
3. **Vérifiez** que les widgets Loueur apparaissent

## 📊 **WIDGETS LOUEUR D'ENGINS (5 widgets)**

| # | Widget | Type | Description |
|---|--------|------|-------------|
| 1 | **Revenus de location** | `metric` | Chiffre d'affaires des locations |
| 2 | **Disponibilité Équipements** | `equipment` | État de disponibilité des équipements |
| 3 | **Locations à venir** | `calendar` | Planning des locations et réservations |
| 4 | **Pipeline de location** | `pipeline` | Suivi des demandes de location par étape |
| 5 | **Actions prioritaires du jour** | `daily-actions` | Tâches urgentes pour la gestion des locations |

## 🔍 **VÉRIFICATION**

Après exécution du script, vous devriez voir dans la console :

```
🚀 FORÇAGE DES WIDGETS LOUEUR D'ENGINS - VERSION 2
🗑️ Nettoyage des configurations existantes...
   ✅ Supprimé: enterpriseDashboardConfig
   ✅ Supprimé: selectedMetier
💾 Sauvegarde de la configuration Loueur...
✅ Configuration Loueur sauvegardée avec succès !
📊 Widgets configurés: 5
🔍 Vérification des clés sauvegardées:
   enterpriseDashboardConfig: ✅
   enterpriseDashboardConfig_loueur: ✅
   selectedMetier: loueur
   enterpriseDashboardConfigured: true
🔄 Rechargez la page pour voir les widgets Loueur !
```

## 🚨 **DÉPANNAGE**

### **Problème : Les widgets Vendeur apparaissent toujours**

1. **Vérifiez** que le script s'est bien exécuté dans la console
2. **Videz le cache** : Ctrl+Shift+R (rechargement forcé)
3. **Vérifiez** que `localStorage.getItem('selectedMetier')` retourne `'loueur'`
4. **Utilisez** le script de test pour diagnostiquer

### **Problème : Erreur dans la console**

1. **Vérifiez** que vous êtes sur la bonne page (`http://localhost:5176/`)
2. **Fermez et rouvrez** les outils de développement
3. **Réessayez** le script

### **Problème : Configuration persistante**

Le problème vient de l'incompatibilité des clés localStorage. Le script VERSION 2 corrige cela en sauvegardant avec toutes les clés possibles.

## 🎯 **RÉSULTAT ATTENDU**

Après rechargement, vous devriez voir :
- **Header** : "Loueur d'engins" au lieu de "Vendeur"
- **Widgets** : Les 5 widgets spécifiques au métier Loueur
- **Fonctionnalités** : Gestion des locations, équipements, planning, etc.

## 📞 **SUPPORT**

Si les problèmes persistent :
1. **Vérifiez** les logs dans la console
2. **Testez** avec le script de diagnostic
3. **Consultez** la documentation des widgets
4. **Contactez** le support avec les détails du problème 