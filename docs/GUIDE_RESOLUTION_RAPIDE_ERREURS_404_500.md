# 🚀 Guide de Résolution Rapide - Erreurs 404/500

## 🚨 **Problème Identifié**

D'après vos logs, vous avez plusieurs erreurs 404 et 500 :

### **Erreurs 404 (Tables manquantes) :**
- `machine_views` - Table pour enregistrer les vues des machines
- `messages` - Table pour les messages entre utilisateurs  
- `offers` - Table pour les offres d'achat
- `profiles` - Table pour les profils utilisateur

### **Erreurs 400 (Relations incorrectes) :**
- Problèmes de relations entre les tables
- Politiques RLS (Row Level Security) manquantes

## ⚡ **Solution Rapide (5 minutes)**

### **Option 1 : Script SQL Direct (Recommandé)**

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet : `gvbtydxkvuwrxawkxiyv`
   - Cliquer sur "SQL Editor" dans le menu de gauche

2. **Exécuter le Script**
   - Copier tout le contenu du fichier `fix-database-errors-sql-direct.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" (bouton bleu)

3. **Vérifier l'Exécution**
   - Vous devriez voir : `✅ Success. No rows returned`
   - Les requêtes de vérification en bas du script vous montreront les tables créées

### **Option 2 : Script JavaScript (Alternative)**

Si vous préférez utiliser un script JavaScript :

```bash
# Installer les dépendances si nécessaire
npm install @supabase/supabase-js

# Exécuter le script
node fix-database-errors-automatic.js
```

## 🎯 **Résultat Attendu**

Après l'exécution, vous devriez voir :

- ✅ **Plus d'erreurs 404** dans la console
- ✅ **Widgets fonctionnels** avec interface complète
- ✅ **Données en temps réel** ou valeurs par défaut intelligentes
- ✅ **Pipeline commercial** avec leads générés automatiquement

## 📊 **Tables Créées**

Le script crée automatiquement ces tables :

1. **`machine_views`** - Statistiques de vues de vos annonces
2. **`messages`** - Messages entre utilisateurs
3. **`offers`** - Offres d'achat
4. **`profiles`** - Profils utilisateur

## 🔍 **Vérification Post-Correction**

1. **Recharger l'application** dans votre navigateur
2. **Ouvrir la console développeur** (F12)
3. **Naviguer vers le dashboard** (`#dashboard-entreprise-display`)
4. **Vérifier qu'il n'y a plus d'erreurs 404/400**

## 🚨 **En Cas de Problème**

### **Si les erreurs persistent :**

1. **Vérifier les permissions** dans Supabase
   - Aller dans "Authentication" > "Policies"
   - Vérifier que les politiques RLS sont actives

2. **Vérifier la connexion**
   - Aller dans "Settings" > "API"
   - Vérifier que les clés API sont correctes

3. **Contacter le support** si nécessaire

## 📝 **Logs de Succès**

Après la correction, vous devriez voir dans la console :

```
✅ Composant SalesPerformanceScoreWidget monté
✅ Données réelles chargées: {score: 75, target: 85, ...}
✅ SalesEvolutionWidgetEnriched chargé
✅ Données réelles du stock chargées: {...}
✅ Données réelles du pipeline chargées: {...}
```

## 🔄 **Prochaines Étapes**

Une fois les erreurs corrigées :

1. **Tester tous les widgets** du dashboard
2. **Vérifier les fonctionnalités** de messagerie
3. **Tester les offres** d'achat
4. **Configurer les préférences** utilisateur

---

**💡 Conseil :** Gardez ce guide à portée de main pour les futures corrections de base de données. 