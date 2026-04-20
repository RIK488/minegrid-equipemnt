# Guide de Test - Widget Évolution des Ventes

## 🎯 Objectif
Vérifier que le widget "Évolution des Ventes" fonctionne correctement avec les services communs intégrés.

## 🚀 Prérequis
- Serveur de développement en cours d'exécution (`npm run dev`)
- Accès au dashboard vendeur

## 📋 Étapes de Test

### 1. Accès au Dashboard
1. Ouvrir le navigateur sur `http://localhost:5175/`
2. Naviguer vers le dashboard vendeur
3. Vérifier que le widget "Évolution des Ventes" s'affiche

### 2. Vérification de l'Affichage
✅ **Graphique en ligne** : Doit afficher 6 mois de données
✅ **Métriques clés** : Ventes actuelles, objectifs, année précédente
✅ **Indicateurs visuels** : Couleurs selon la performance
✅ **Filtres** : Sélecteur de métrique (Ventes/Objectifs/Année précédente)

### 3. Test des Actions Rapides
Cliquer sur chaque bouton d'action et vérifier :

#### 📢 Publier Promotion
- ✅ Affiche une notification de succès
- ✅ Ouvre une modal de confirmation
- ✅ Envoie un email de promotion

#### ➕ Ajouter Équipement
- ✅ Affiche une notification de succès
- ✅ Ouvre une modal d'ajout
- ✅ Redirige vers la page d'ajout

#### ✏️ Corriger ce Mois
- ✅ Affiche une notification de succès
- ✅ Ouvre une modal de correction
- ✅ Permet de modifier les données

#### 🧠 Prévision IA
- ✅ Affiche une notification de succès
- ✅ Génère des prévisions
- ✅ Affiche les recommandations IA

#### 📊 Exporter Données
- ✅ Affiche une notification de succès
- ✅ Télécharge un fichier Excel
- ✅ Inclut toutes les données du graphique

### 4. Test des Notifications
✅ **Notifications automatiques** : S'affichent selon les performances
✅ **Notifications d'action** : S'affichent lors des clics sur les boutons
✅ **Style toast** : Notifications en bas à droite
✅ **Auto-dismiss** : Disparition automatique après 5 secondes

### 5. Test des Données
✅ **Données par défaut** : 6 mois de données de test
✅ **Calculs corrects** : Performance, objectifs, comparaisons
✅ **Graphique interactif** : Tooltips au survol
✅ **Responsive** : S'adapte à différentes tailles d'écran

### 6. Test des Services Communs
✅ **API Service** : Gestion des données
✅ **Notification Service** : Affichage des notifications
✅ **Export Service** : Téléchargement des fichiers
✅ **Communication Service** : Envoi d'emails

## 🎉 Résultats Attendus

### ✅ Succès
- Widget s'affiche correctement
- Toutes les actions fonctionnent
- Notifications s'affichent
- Données sont cohérentes
- Services communs opérationnels

### ❌ Problèmes Possibles
- Widget ne s'affiche pas → Vérifier la configuration
- Actions ne fonctionnent pas → Vérifier les services
- Notifications ne s'affichent pas → Vérifier le composant toast
- Données incorrectes → Vérifier les données par défaut

## 🔧 Dépannage

### Widget ne s'affiche pas
```javascript
// Vérifier dans la console du navigateur
console.log('Widget config:', localStorage.getItem('enterpriseDashboardConfig_vendeur'));
```

### Actions ne fonctionnent pas
```javascript
// Vérifier les services dans la console
console.log('Services disponibles:', window.commonServices);
```

### Notifications ne s'affichent pas
```javascript
// Vérifier le composant toast
console.log('Toast container:', document.querySelector('.toast-container'));
```

## 📊 Métriques de Performance
- **Temps de chargement** : < 2 secondes
- **Réactivité des actions** : < 500ms
- **Affichage des notifications** : < 100ms
- **Export des données** : < 1 seconde

## 🎯 Prochaines Étapes
Une fois ce widget validé, nous pourrons :
1. Connecter le widget "Pipeline Commercial"
2. Connecter le widget "Stock & Revente"
3. Connecter le widget "Actions Commerciales Prioritaires"
4. Intégrer les vraies données Supabase

---

**Status** : ✅ Prêt pour les tests utilisateur
**Version** : 1.0.0
**Dernière mise à jour** : $(date) 