# 🔧 Résolution des Erreurs 404/500 - Widget Performance Commerciale

## 🚨 **Problème Identifié**

Les erreurs 404 dans les logs indiquent que les tables de base de données nécessaires au widget "Score de Performance Commerciale" n'existent pas encore dans Supabase.

### **Erreurs Observées :**
```
Failed to load resource: the server responded with a status of 404 ()
- /rest/v1/sales
- /rest/v1/prospects  
- /rest/v1/user_targets
- /rest/v1/prospect_interactions
- /rest/v1/profiles
```

## 🛠️ **Solution : Création des Tables Manquantes**

### **Étape 1 : Exécuter le Script SQL**

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet
   - Aller dans "SQL Editor"

2. **Exécuter le Script**
   - Copier le contenu du fichier `create-sales-tables.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" pour exécuter

### **Étape 2 : Vérifier la Création**

Après l'exécution, vérifier que les tables suivantes ont été créées :

```sql
-- Vérifier l'existence des tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'sales', 'prospects', 'user_targets', 'prospect_interactions');
```

### **Étape 3 : Vérifier les Politiques RLS**

```sql
-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'sales', 'prospects', 'user_targets', 'prospect_interactions');
```

## 📊 **Tables Créées**

### **1. Table `profiles`**
- Stocke les informations des utilisateurs
- Rôle par défaut : 'vendeur'
- Créée automatiquement lors de l'inscription

### **2. Table `sales`**
- Enregistre toutes les ventes des vendeurs
- Montant, devise, description, client
- Statut : pending, completed, cancelled

### **3. Table `prospects`**
- Gère le pipeline commercial
- Étapes : prospection, qualification, proposition, négociation, clôture
- Probabilité de conversion (0-100%)

### **4. Table `user_targets`**
- Objectifs personnalisés par utilisateur
- Périodes : weekly, monthly, quarterly, yearly
- Objectifs de vente, prospects, temps de réponse, croissance

### **5. Table `prospect_interactions`**
- Suivi des interactions avec les prospects
- Temps de réponse en heures
- Types : contact, meeting, proposal, follow_up

## 🔄 **Fonctionnalités Automatiques**

### **Trigger d'Inscription**
- Crée automatiquement un profil lors de l'inscription
- Définit le rôle 'vendeur' par défaut
- Crée des objectifs mensuels par défaut

### **Données de Test**
- Insère 5 vendeurs de test
- Crée quelques ventes et prospects de test
- Permet de tester le widget immédiatement

## 🎯 **Résultat Attendu**

Après l'exécution du script :

1. **Erreurs 404 résolues** : Les requêtes vers les tables fonctionnent
2. **Widget fonctionnel** : Affichage des données réelles ou par défaut
3. **Rang calculé** : Position parmi tous les vendeurs du site
4. **Recommandations IA** : Basées sur les performances réelles

## 🔍 **Vérification du Fonctionnement**

### **Test 1 : Vérifier les Données**
```sql
-- Vérifier les vendeurs
SELECT COUNT(*) as total_vendeurs FROM profiles WHERE role = 'vendeur';

-- Vérifier les ventes
SELECT COUNT(*) as total_ventes FROM sales;

-- Vérifier les prospects
SELECT COUNT(*) as total_prospects FROM prospects;
```

### **Test 2 : Tester le Widget**
1. Recharger la page du dashboard
2. Vérifier que le widget "Score de Performance Commerciale" s'affiche
3. Contrôler que les erreurs 404 ont disparu des logs
4. Vérifier l'affichage du rang (ex: "3/5 vendeurs")

## 🚀 **Prochaines Étapes**

### **Pour l'Utilisateur**
1. **Ajouter des données réelles** :
   - Créer des prospects via l'interface
   - Enregistrer des ventes
   - Définir des objectifs personnalisés

2. **Optimiser la performance** :
   - Suivre les recommandations du widget
   - Améliorer le temps de réponse
   - Développer le pipeline prospects

### **Pour le Développeur**
1. **Surveiller les logs** pour détecter d'autres erreurs
2. **Optimiser les requêtes** si nécessaire
3. **Ajouter des fonctionnalités** comme l'export des données

## 📝 **Notes Importantes**

- **Sécurité** : Toutes les tables ont des politiques RLS activées
- **Performance** : Index créés pour optimiser les requêtes
- **Compatibilité** : Script compatible avec les versions récentes de Supabase
- **Données de test** : Peuvent être supprimées en production

## 🆘 **En Cas de Problème**

Si les erreurs persistent après l'exécution du script :

1. **Vérifier les permissions** Supabase
2. **Contrôler les logs** de l'éditeur SQL
3. **Tester les requêtes** individuellement
4. **Contacter le support** si nécessaire

---

**✅ Le widget devrait maintenant fonctionner correctement avec un rang réaliste et des données en temps réel !** 