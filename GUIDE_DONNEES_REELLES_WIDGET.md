# 🔄 Guide : Récupération des Données Réelles dans le Widget "Score de Performance Commerciale"

## 📊 **Mécanisme de Récupération des Données Réelles**

Le widget "Score de Performance Commerciale" a été modifié pour récupérer les **données réelles** de l'utilisateur connecté au lieu d'utiliser des données simulées.

### **1. Sources de Données Réelles**

Le widget se connecte aux tables Supabase suivantes :

#### **📈 Table `sales`**
- **Données récupérées** : Toutes les ventes du vendeur connecté pour le mois en cours
- **Filtres appliqués** :
  - `seller_id = user.id` (vendeur connecté)
  - `created_at >= début du mois`
  - `created_at <= maintenant`
- **Calculs** : Somme totale des ventes, comparaison avec le mois précédent

#### **👥 Table `prospects`**
- **Données récupérées** : Prospects actifs du vendeur
- **Filtres appliqués** :
  - `seller_id = user.id`
  - `status = 'active'`
- **Calculs** : Nombre de prospects actifs vs objectif

#### **🎯 Table `user_targets`**
- **Données récupérées** : Objectifs mensuels personnalisés de l'utilisateur
- **Filtres appliqués** :
  - `user_id = user.id`
  - `period = 'monthly'`
- **Objectifs** : Ventes, prospects, temps de réponse, croissance

#### **⏱️ Table `prospect_interactions`**
- **Données récupérées** : Temps de réponse aux prospects
- **Filtres appliqués** :
  - `seller_id = user.id`
  - `response_time IS NOT NULL`
  - `created_at >= début du mois`
- **Calculs** : Temps de réponse moyen

### **2. Calculs Automatiques**

#### **📊 Score Global**
```typescript
const globalScore = Math.round((salesScore + prospectsScore + responseScore + growthScore) / 4);
```

#### **💰 Score de Ventes**
```typescript
const salesScore = Math.min(100, Math.round((totalSales / salesTarget) * 100));
```

#### **👥 Score Prospects**
```typescript
const prospectsScore = Math.min(100, Math.round((activeProspects / prospectsTarget) * 100));
```

#### **⏱️ Score Réactivité**
```typescript
const responseScore = Math.min(100, Math.round((responseTarget / avgResponseTime) * 100));
```

#### **📈 Score Croissance**
```typescript
const growth = ((totalSales - lastMonthTotal) / lastMonthTotal) * 100;
const growthScore = Math.min(100, Math.round((growth / growthTarget) * 100));
```

### **3. Rang Anonymisé**

Le widget calcule le rang du vendeur parmi tous les vendeurs :
- Récupère toutes les ventes du mois
- Calcule le total par vendeur
- Trie par montant décroissant
- Détermine la position du vendeur connecté

### **4. Recommandations IA Dynamiques**

Les recommandations sont générées automatiquement selon les performances :

#### **🔥 Priorité Haute**
- Score de vente < 70% : "Augmenter les efforts de vente"
- Temps de réponse > objectif : "Améliorer le temps de réponse"

#### **⚡ Priorité Moyenne**
- Score prospects < 70% : "Développer le pipeline prospects"
- Croissance < objectif : "Stimuler la croissance des ventes"

### **5. Gestion des Erreurs**

En cas d'erreur de connexion ou de données manquantes :
- **Fallback** : Retourne des données par défaut
- **Logs** : Enregistre l'erreur dans la console
- **Interface** : Affiche un message d'erreur à l'utilisateur

### **6. Rafraîchissement Automatique**

Le widget se met à jour automatiquement :
- **Intervalle** : Selon la configuration du dashboard
- **Déclencheurs** : Changement de données, action utilisateur
- **Cache** : Optimisation des performances

## 🛠️ **Configuration Requise**

### **Tables Supabase Nécessaires**

```sql
-- Table des ventes
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id),
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prospects
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des objectifs utilisateur
CREATE TABLE user_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  period TEXT DEFAULT 'monthly',
  sales_target DECIMAL(12,2) DEFAULT 3000000,
  prospects_target INTEGER DEFAULT 10,
  response_time_target DECIMAL(4,2) DEFAULT 1.5,
  growth_target DECIMAL(5,2) DEFAULT 15.0
);

-- Table des interactions prospects
CREATE TABLE prospect_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id),
  response_time DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Permissions RLS (Row Level Security)**

```sql
-- Permissions pour les ventes
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (auth.uid() = seller_id);

-- Permissions pour les prospects
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prospects" ON prospects
  FOR SELECT USING (auth.uid() = seller_id);

-- Permissions pour les objectifs
ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own targets" ON user_targets
  FOR SELECT USING (auth.uid() = user_id);

-- Permissions pour les interactions
ALTER TABLE prospect_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interactions" ON prospect_interactions
  FOR SELECT USING (auth.uid() = seller_id);
```

## 🎯 **Avantages des Données Réelles**

### **✅ Précision**
- Données exactes de l'utilisateur
- Calculs en temps réel
- Historique authentique

### **✅ Personnalisation**
- Objectifs personnalisés
- Recommandations adaptées
- Rang réel parmi les pairs

### **✅ Motivation**
- Progression réelle visible
- Objectifs atteignables
- Feedback immédiat

### **✅ Analyse**
- Tendances réelles
- Comparaisons pertinentes
- Insights actionnables

## 🔧 **Dépannage**

### **Problèmes Courants**

1. **"Utilisateur non connecté"**
   - Vérifier l'authentification
   - Recharger la page

2. **"Données non disponibles"**
   - Vérifier les permissions RLS
   - Contrôler la structure des tables

3. **"Erreur de connexion"**
   - Vérifier la configuration Supabase
   - Contrôler les variables d'environnement

### **Logs de Débogage**

Le widget affiche des logs détaillés dans la console :
```javascript
[DEBUG] Données reçues de getSalesPerformanceScoreData(): {...}
```

## 📈 **Évolution Future**

### **Fonctionnalités Prévues**
- **Machine Learning** : Prédictions de vente
- **IA Avancée** : Recommandations plus sophistiquées
- **Intégrations** : CRM, outils de prospection
- **Analytics** : Rapports détaillés

### **Optimisations**
- **Cache intelligent** : Réduction des requêtes
- **Lazy loading** : Chargement progressif
- **WebSockets** : Mises à jour en temps réel 