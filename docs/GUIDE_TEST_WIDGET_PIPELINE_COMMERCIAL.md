# Guide de Test - Widget Pipeline Commercial

## 🎯 Objectif
Vérifier que le widget "Pipeline Commercial" fonctionne correctement avec les services communs intégrés.

## 🚀 Prérequis
- Serveur de développement en cours d'exécution (`npm run dev`)
- Accès au dashboard vendeur

## 📋 Étapes de Test

### 1. Accès au Dashboard
1. Ouvrir le navigateur sur `http://localhost:5175/`
2. Naviguer vers le dashboard vendeur
3. Vérifier que le widget "Pipeline Commercial" s'affiche

### 2. Vérification de l'Affichage
✅ **Statistiques globales** : Total leads, valeur totale, valeur pondérée, taux de conversion
✅ **Actions rapides** : Panel avec 8 boutons d'action
✅ **Insights IA** : Recommandations automatiques selon les données
✅ **Filtres et tri** : Sélecteurs d'étape et de tri
✅ **Vues multiples** : Liste, Kanban, Timeline

### 3. Test des Actions Rapides
Cliquer sur chaque bouton d'action et vérifier :

#### ➕ Ajouter Lead
- ✅ Affiche une notification de succès
- ✅ Ajoute un nouveau lead au pipeline
- ✅ Envoie un email de notification

#### 📥 Exporter
- ✅ Affiche une notification de succès
- ✅ Télécharge un fichier Excel
- ✅ Inclut toutes les données du pipeline

#### 📤 Relances
- ✅ Affiche une notification de succès
- ✅ Envoie des emails de relance
- ✅ Limite à 5 relances maximum

#### 📅 Réunions
- ✅ Affiche une notification de succès
- ✅ Planifie des réunions avec prospects à forte valeur
- ✅ Envoie des emails de confirmation

#### 📄 Rapport
- ✅ Affiche une notification de succès
- ✅ Génère un rapport PDF
- ✅ Inclut statistiques et insights

#### 📧 Auto-Relance
- ✅ Affiche une notification de succès
- ✅ Configure des relances automatiques
- ✅ Notifie les leads bloqués

#### 📊 Analyse
- ✅ Affiche une notification de succès
- ✅ Génère une analyse de performance
- ✅ Envoie le rapport par email

#### 🧠 Optimisation IA
- ✅ Affiche une notification de succès
- ✅ Applique des optimisations automatiques
- ✅ Améliore les probabilités des leads

### 4. Test des Insights IA
✅ **Détection automatique** : Leads bloqués, opportunités, devis sans suivi
✅ **Actions contextuelles** : Boutons d'action selon le type d'insight
✅ **Priorités** : Couleurs selon l'importance (high/medium/low)
✅ **Recommandations** : Actions suggérées par l'IA

### 5. Test des Fonctionnalités Avancées
✅ **Gestion des étapes** : Prospection → Devis → Négociation → Conclu/Perdu
✅ **Calcul des probabilités** : Pondération automatique des valeurs
✅ **Système de priorités** : High/Medium/Low avec couleurs
✅ **Suivi des contacts** : Dernier contact et jours écoulés
✅ **Filtres dynamiques** : Par étape, valeur, probabilité, dernier contact
✅ **Tri intelligent** : Par valeur, probabilité, date de contact

### 6. Test des Services Communs
✅ **API Service** : Gestion des données de pipeline
✅ **Notification Service** : Affichage des notifications toast
✅ **Export Service** : Export Excel et PDF
✅ **Communication Service** : Envoi d'emails automatiques

## 🎉 Résultats Attendus

### ✅ Succès
- Widget s'affiche correctement avec toutes les sections
- Toutes les actions rapides fonctionnent
- Notifications s'affichent pour chaque action
- Insights IA se génèrent automatiquement
- Export et communication fonctionnent
- Services communs opérationnels

### ❌ Problèmes Possibles
- Widget ne s'affiche pas → Vérifier la configuration
- Actions ne fonctionnent pas → Vérifier les services
- Notifications ne s'affichent pas → Vérifier le composant toast
- Insights IA vides → Vérifier les données de test

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

### Insights IA vides
```javascript
// Vérifier les données de test
console.log('Données pipeline:', leadsData);
```

## 📊 Métriques de Performance
- **Temps de chargement** : < 2 secondes
- **Réactivité des actions** : < 500ms
- **Affichage des notifications** : < 100ms
- **Export des données** : < 1 seconde
- **Génération des insights** : < 200ms

## 🎯 Prochaines Étapes
Une fois ce widget validé, nous pourrons :
1. Connecter le widget "Stock & Revente"
2. Connecter le widget "Actions Commerciales Prioritaires"
3. Intégrer les vraies données Supabase
4. Optimiser les performances

## 📋 Actions Disponibles
- **Ajouter Lead** : Création de nouveaux prospects
- **Exporter** : Export Excel du pipeline complet
- **Relances** : Envoi d'emails de relance automatiques
- **Réunions** : Planification de réunions avec prospects
- **Rapport** : Génération de rapports PDF
- **Auto-Relance** : Configuration de relances automatiques
- **Analyse** : Analyse de performance détaillée
- **Optimisation IA** : Amélioration automatique des leads

---

**Status** : ✅ Prêt pour les tests utilisateur
**Version** : 1.0.0
**Dernière mise à jour** : $(date) 