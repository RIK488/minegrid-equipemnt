# 🔧 Dépannage - Widget "Actions prioritaires du jour"

## 🚨 **PROBLÈME IDENTIFIÉ**
Le widget "Actions prioritaires du jour" ne s'affiche pas dans le dashboard vendeur.

## 🎯 **SOLUTIONS À ESSAYER**

### **Solution 1 : Script de force (RECOMMANDÉ)**

1. **Ouvrir la console du navigateur** (F12)
2. **Copier et coller** le script `force-widget-actions-prioritaires.js`
3. **Appuyer sur Entrée**
4. **Attendre le rechargement automatique**

### **Solution 2 : Nettoyage manuel**

```javascript
// Dans la console du navigateur
console.log('🧹 Nettoyage manuel...');

// 1. Nettoyer le localStorage
localStorage.clear();
sessionStorage.clear();

// 2. Vérifier le rôle utilisateur
localStorage.setItem('userRole', 'vendeur');

// 3. Recharger la page
window.location.reload();
```

### **Solution 3 : Vérification de la configuration**

```javascript
// Vérifier la configuration actuelle
console.log('📋 Configuration actuelle :');
console.log('Role:', localStorage.getItem('userRole'));
console.log('Config:', localStorage.getItem('dashboardConfig'));

// Vérifier les widgets configurés
const config = JSON.parse(localStorage.getItem('dashboardConfig') || '{}');
console.log('Widgets:', config.widgets?.map(w => w.id));
```

## 🔍 **DIAGNOSTIC**

### **Vérifier les éléments suivants :**

1. **Rôle utilisateur** : Doit être 'vendeur'
2. **Configuration** : Doit inclure 'daily-priority-actions'
3. **Type de widget** : Doit être 'daily-priority'
4. **Position** : Doit être 0 (en haut)

### **Messages d'erreur à surveiller :**

```javascript
// Dans la console, chercher :
- "Widget daily-priority-actions détecté"
- "Widget type daily-priority détecté"
- "DailyPriorityActionsWidget data:"
```

## 🛠️ **CORRECTIONS TECHNIQUES**

### **Problème 1 : Widget non reconnu**
```javascript
// Vérifier que le composant est bien défini
if (typeof DailyPriorityActionsWidget === 'undefined') {
  console.error('❌ Composant DailyPriorityActionsWidget non trouvé');
}
```

### **Problème 2 : Données manquantes**
```javascript
// Vérifier les données
const data = getDailyActionsData('daily-priority-actions');
console.log('📊 Données du widget:', data);
```

### **Problème 3 : Type de widget incorrect**
```javascript
// Vérifier la configuration
const widget = {
  id: 'daily-priority-actions',
  type: 'daily-priority', // IMPORTANT : doit être 'daily-priority'
  title: 'Actions prioritaires du jour'
};
```

## 📊 **VÉRIFICATION FINALE**

### **Le widget doit afficher :**

1. **En-tête** : "Actions prioritaires du jour" avec dégradé bleu-violet
2. **Statistiques** : Actions en attente, répartition par priorité
3. **Filtres** : Toutes, Haute, Moyenne, Basse
4. **Actions** : Liste des actions avec détails
5. **Actions rapides** : 3 boutons colorés en bas

### **Actions rapides attendues :**
- 🔵 **Recommander via Email** (bleu)
- 🟣 **Mettre en avant (Premium)** (violet)
- 🔴 **Baisser le prix** (rouge)

## 🚀 **COMMANDES DE TEST**

### **Test 1 : Vérification de base**
```javascript
// Vérifier que le widget est configuré
const config = JSON.parse(localStorage.getItem('dashboardConfig') || '{}');
const widget = config.widgets?.find(w => w.id === 'daily-priority-actions');
console.log('Widget trouvé:', !!widget);
console.log('Type correct:', widget?.type === 'daily-priority');
```

### **Test 2 : Vérification des données**
```javascript
// Tester la fonction de données
try {
  const data = getDailyActionsData('daily-priority-actions');
  console.log('✅ Données récupérées:', data.length, 'actions');
} catch (error) {
  console.error('❌ Erreur données:', error);
}
```

### **Test 3 : Vérification du rendu**
```javascript
// Vérifier que le composant peut être rendu
const widgetElement = document.querySelector('[data-widget-id="daily-priority-actions"]');
console.log('Widget dans le DOM:', !!widgetElement);
```

## 📞 **SUPPORT**

### **Si le problème persiste :**

1. **Vérifier la console** pour les erreurs JavaScript
2. **Nettoyer le cache** du navigateur
3. **Tester en navigation privée**
4. **Vérifier la version** du navigateur

### **Logs à fournir :**
- Messages d'erreur de la console
- Configuration localStorage
- Type de navigateur et version
- Actions effectuées

---

## ✅ **RÉSULTAT ATTENDU**

Après application des solutions, le widget "Actions prioritaires du jour" doit s'afficher en haut du dashboard vendeur avec toutes ses fonctionnalités :

- ✅ En-tête attractif avec statistiques
- ✅ Liste d'actions prioritaires
- ✅ Filtres interactifs
- ✅ Actions rapides (Email, Premium, Prix)
- ✅ Gestion des actions (Terminer/Annuler)
- ✅ Contacts cliquables
- ✅ Métriques d'impact 