# 📊 Guide de Fonctionnement - Widgets Dashboard Vendeur

## 🎯 Vue d'ensemble

Votre dashboard vendeur utilise maintenant des **données réelles** provenant de vos annonces, messages, vues et offres pour calculer les métriques de performance.

## 🔧 Comment fonctionnent les widgets

### 1. 🏆 **Score de Performance Commerciale**

#### **Métriques calculées :**
- **Score global** : 0-100 (basé sur vues, messages, offres)
- **Classement** : Position parmi les vendeurs
- **Ventes estimées** : Basées sur les offres reçues
- **Croissance** : Comparaison mois actuel vs mois précédent
- **Prospects actifs** : Nombre de messages reçus
- **Temps de réponse** : Moyenne des temps de réponse

#### **Sources de données :**
```sql
-- Vos annonces
SELECT * FROM machines WHERE sellerId = 'votre_id'

-- Vues de vos annonces
SELECT * FROM machine_views WHERE machine_id IN (vos_machines_ids)

-- Messages reçus
SELECT * FROM messages WHERE receiver_id = 'votre_id'

-- Offres reçues
SELECT * FROM offers WHERE seller_id = 'votre_id'
```

#### **Calcul du score :**
```
Score = (Vues par annonce × 20) + (Messages par annonce × 30) + (Offres par annonce × 50)
```

### 2. 📈 **Évolution des Ventes**

#### **Données affichées :**
- Graphique d'évolution des vues
- Comparaison mensuelle
- Tendances de croissance
- Actions rapides connectées

#### **Fonctionnalités :**
- Export des données
- Notifications automatiques
- Recommandations IA
- Communication intégrée

### 3. 🎯 **Pipeline Commercial**

#### **Leads affichés :**
- Annonces avec statuts (Prospection, Qualifié, Négociation, Conclu)
- Valeur estimée de chaque lead
- Probabilité de conversion
- Prochaines actions à effectuer

#### **Actions disponibles :**
- Ajouter un nouveau lead
- Exporter le pipeline
- Envoyer des relances
- Planifier des réunions
- Générer des rapports

### 4. 📦 **Stock & Revente**

#### **Données affichées :**
- État de vos annonces
- Niveau de stock
- Opportunités de revente
- Actions prioritaires

#### **Fonctionnalités :**
- Gestion des stocks
- Planification des reventes
- Optimisation des prix
- Suivi des performances

### 5. ⚡ **Actions Commerciales Prioritaires**

#### **Tâches affichées :**
- Actions à effectuer aujourd'hui
- Priorités (Haute, Moyenne, Basse)
- Contacts à relancer
- Rendez-vous à programmer

#### **Actions rapides :**
- Nouvelle tâche
- Relance automatique
- Planification
- Rapport IA

## 🔗 **Connexion aux données réelles**

### **Fonction API créée :**
```typescript
export async function getSalesPerformanceData(): Promise<SalesPerformanceData>
```

### **Métriques calculées automatiquement :**

1. **Nombre d'annonces actives**
2. **Total des vues reçues**
3. **Messages reçus**
4. **Offres reçues**
5. **Temps de réponse moyen**
6. **Croissance mensuelle**
7. **Score de performance**

### **Recommandations IA générées :**
- Optimisation du temps de réponse
- Augmentation du nombre d'annonces
- Amélioration de la visibilité
- Actions prioritaires

## 📊 **Exemple de données réelles**

### **Si vous avez :**
- 3 annonces actives
- 45 vues totales
- 8 messages reçus
- 2 offres reçues

### **Votre score sera :**
```
Vues par annonce : 45 ÷ 3 = 15 → Score : 15 × 20 = 300 (max 20)
Messages par annonce : 8 ÷ 3 = 2.7 → Score : 2.7 × 30 = 81 (max 30)
Offres par annonce : 2 ÷ 3 = 0.7 → Score : 0.7 × 50 = 35 (max 50)

Score total : 20 + 30 + 35 = 85/100
```

## 🚀 **Actions disponibles sur chaque widget**

### **Actions rapides (8 boutons par widget) :**
1. **Nouvelle action** : Créer une nouvelle tâche/lead
2. **Relance auto** : Relance automatique des prospects
3. **Planifier** : Planifier des rendez-vous
4. **Rapport IA** : Générer des rapports intelligents
5. **Exporter** : Exporter les données
6. **Analyser** : Analyse approfondie
7. **Optimiser** : Optimisation IA
8. **Communiquer** : Envoi de messages

### **Actions individuelles :**
- **Démarrer** : Commencer une action
- **Terminer** : Finaliser une action
- **Contacter** : Envoyer SMS/Email
- **Reprogrammer** : Reprogrammer une action

## 🔄 **Mise à jour automatique**

### **Fréquence de mise à jour :**
- **Données en temps réel** : Vues, messages, offres
- **Calculs quotidiens** : Scores, classements
- **Analyses hebdomadaires** : Tendances, recommandations

### **Notifications automatiques :**
- Nouveaux messages
- Nouvelles offres
- Objectifs atteints
- Actions prioritaires

## 📱 **Interface utilisateur**

### **Responsive design :**
- **Desktop** : Affichage complet avec toutes les fonctionnalités
- **Tablet** : Interface adaptée avec actions principales
- **Mobile** : Version simplifiée avec actions essentielles

### **Thème orange :**
- Couleurs cohérentes avec votre charte graphique
- Boutons et icônes en orange
- Effets de survol harmonisés

## 🎯 **Prochaines étapes**

### **Améliorations prévues :**
1. **Intégration complète** avec vos données d'annonces
2. **Calculs avancés** de ROI et conversion
3. **Prédictions IA** de ventes futures
4. **Automatisation** des actions commerciales
5. **Intégration CRM** pour un suivi complet

### **Fonctionnalités à venir :**
- **Chatbot IA** pour l'assistance commerciale
- **Géolocalisation** des prospects
- **Analyse concurrentielle** en temps réel
- **Optimisation automatique** des prix

## 💡 **Conseils d'utilisation**

### **Pour optimiser votre score :**
1. **Répondez rapidement** aux messages (objectif : < 2h)
2. **Maintenez 5+ annonces** actives
3. **Améliorez la qualité** de vos annonces
4. **Suivez les recommandations** IA
5. **Utilisez les actions rapides** quotidiennement

### **Pour maximiser vos ventes :**
1. **Surveillez le pipeline** commercial
2. **Relancez les prospects** régulièrement
3. **Analysez les tendances** de vues
4. **Optimisez vos prix** selon les recommandations
5. **Planifiez vos actions** prioritaires

---

**Votre dashboard est maintenant connecté à vos vraies données et vous donne une vue complète de votre performance commerciale ! 🎉** 