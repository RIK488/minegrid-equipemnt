# Guide de Test - Widget Stock & Revente

## 🎯 Objectif
Vérifier que le widget "Stock & Revente" fonctionne correctement avec les services communs intégrés.

## 🚀 Prérequis
- Serveur de développement en cours d'exécution (`npm run dev`)
- Accès au dashboard vendeur

## 📋 Étapes de Test

### 1. Accès au Dashboard
1. Ouvrir le navigateur sur `http://localhost:5175/`
2. Naviguer vers le dashboard vendeur
3. Vérifier que le widget "Stock & Revente" s'affiche

### 2. Vérification de l'Affichage
✅ **En-tête** : Titre "Plan d'action Stock & Revente"
✅ **Filtres** : Catégorie et ancienneté
✅ **Actions rapides** : Panel avec 8 boutons d'action
✅ **Liste des équipements** : Cartes avec métriques et conseils IA
✅ **Badges d'alerte** : "Visibilité faible" sur les équipements à risque

### 3. Test des Actions Rapides
Cliquer sur chaque bouton d'action et vérifier :

#### ➕ Ajouter
- ✅ Affiche une notification de succès
- ✅ Ajoute un nouvel équipement au stock
- ✅ Envoie un email de notification

#### 📥 Exporter
- ✅ Affiche une notification de succès
- ✅ Télécharge un fichier Excel
- ✅ Inclut toutes les données du stock

#### 📈 Booster
- ✅ Affiche une notification de succès
- ✅ Améliore le score de visibilité
- ✅ Envoie un email de promotion

#### ⚡ Offre Flash
- ✅ Affiche une notification de succès
- ✅ Crée une offre flash
- ✅ Envoie un email d'offre exceptionnelle

#### 📷 Photo
- ✅ Affiche une notification de succès
- ✅ Améliore le score de visibilité
- ✅ Simule l'ajout de photo

#### 📤 Promotion
- ✅ Affiche une notification de succès
- ✅ Envoie des emails de promotion
- ✅ Cible les équipements à faible visibilité

#### 📊 Analyse
- ✅ Affiche une notification de succès
- ✅ Génère une analyse de performance
- ✅ Envoie le rapport par email

#### 🧠 Optimiser
- ✅ Affiche une notification de succès
- ✅ Optimise automatiquement les prix
- ✅ Améliore les scores de visibilité

### 4. Test des Actions Individuelles
Pour chaque équipement, tester les boutons :

#### 📷 Ajouter photo
- ✅ Améliore le score de visibilité de l'équipement
- ✅ Affiche une notification de succès

#### 📈 Booster
- ✅ Améliore significativement le score de visibilité
- ✅ Supprime le badge d'alerte
- ✅ Envoie un email de promotion

#### ⚡ Créer offre flash
- ✅ Crée une offre flash pour l'équipement
- ✅ Envoie un email d'offre exceptionnelle

### 5. Test des Filtres
✅ **Filtre par catégorie** : Pelle, Bulldozer, Toutes
✅ **Filtre par ancienneté** : 30j+, 60j+, 90j+, Toutes
✅ **Combinaison des filtres** : Fonctionne correctement
✅ **Aucun résultat** : Message approprié affiché

### 6. Test des Métriques
✅ **Jours en stock** : Calcul correct
✅ **Vues** : Affichage correct
✅ **Clics** : Affichage correct
✅ **Contacts** : Affichage correct
✅ **Score de visibilité** : Calcul et affichage corrects

### 7. Test des Conseils IA
✅ **Génération automatique** : Conseils pertinents selon les données
✅ **Affichage** : Texte en italique avec icône 💡
✅ **Contexte** : Conseils adaptés à chaque équipement

### 8. Test des Services Communs
✅ **API Service** : Gestion des données de stock
✅ **Notification Service** : Affichage des notifications toast
✅ **Export Service** : Export Excel du stock
✅ **Communication Service** : Envoi d'emails automatiques

## 🎉 Résultats Attendus

### ✅ Succès
- Widget s'affiche correctement avec toutes les sections
- Toutes les actions rapides fonctionnent
- Notifications s'affichent pour chaque action
- Conseils IA se génèrent automatiquement
- Export et communication fonctionnent
- Services communs opérationnels
- Filtres fonctionnent correctement

### ❌ Problèmes Possibles
- Widget ne s'affiche pas → Vérifier la configuration
- Actions ne fonctionnent pas → Vérifier les services
- Notifications ne s'affichent pas → Vérifier le composant toast
- Conseils IA vides → Vérifier les données de test

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

### Conseils IA vides
```javascript
// Vérifier les données de test
console.log('Données stock:', equipments);
```

## 📊 Métriques de Performance
- **Temps de chargement** : < 2 secondes
- **Réactivité des actions** : < 500ms
- **Affichage des notifications** : < 100ms
- **Export des données** : < 1 seconde
- **Génération des conseils IA** : < 200ms

## 🎯 Prochaines Étapes
Une fois ce widget validé, nous pourrons :
1. Connecter le widget "Actions Commerciales Prioritaires"
2. Intégrer les vraies données Supabase
3. Optimiser les performances
4. Ajouter des fonctionnalités avancées

## 📋 Actions Disponibles
- **Ajouter** : Création de nouveaux équipements
- **Exporter** : Export Excel du stock complet
- **Booster** : Amélioration de la visibilité
- **Offre Flash** : Création d'offres exceptionnelles
- **Photo** : Ajout de photos pour améliorer la visibilité
- **Promotion** : Envoi de promotions ciblées
- **Analyse** : Analyse de performance détaillée
- **Optimiser** : Optimisation automatique des prix

## 🧠 Conseils IA
Le widget génère automatiquement des conseils basés sur :
- **Score de visibilité** : Conseils pour améliorer la visibilité
- **Jours en stock** : Suggestions pour liquider le stock
- **Métriques d'engagement** : Recommandations selon les vues/clics
- **Historique des contacts** : Conseils pour augmenter les contacts

---

**Status** : ✅ Prêt pour les tests utilisateur
**Version** : 1.0.0
**Dernière mise à jour** : $(date) 