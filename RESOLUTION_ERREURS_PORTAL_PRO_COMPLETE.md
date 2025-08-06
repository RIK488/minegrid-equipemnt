# 🔧 RÉSOLUTION COMPLÈTE DES ERREURS PORTAL PRO

## 🎯 PROBLÈME IDENTIFIÉ

**Symptômes :**
- Erreurs 404 pour toutes les tables Pro (`pro_clients`, `client_equipment`, etc.)
- Erreur 406 (Not Acceptable) pour `user_profiles`
- Erreur 500 (Internal Server Error) pour `ProDashboard.tsx`
- Messages "Profil Pro non trouvé"
- Erreur "Erreur lors de la planification de l'intervention"

**Cause :** Les tables Supabase nécessaires pour le portail Pro n'existent pas dans votre base de données.

---

## ✅ SOLUTION ÉTAPE PAR ÉTAPE

### **ÉTAPE 1 : Créer les Tables Supabase**

1. **Ouvrez votre Dashboard Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Connectez-vous à votre projet

2. **Ouvrez l'éditeur SQL**
   - Cliquez sur **"SQL Editor"** dans le menu de gauche
   - Cliquez sur **"New Query"**

3. **Exécutez le script de création**
   - Copiez tout le contenu du fichier `create-pro-portal-tables.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur **"Run"**

4. **Vérifiez que les tables ont été créées**
   - Allez dans **"Table Editor"**
   - Vous devriez voir ces nouvelles tables :
     - `pro_clients`
     - `client_equipment`
     - `client_orders`
     - `maintenance_interventions`
     - `client_notifications`
     - `technical_documents`
     - `equipment_diagnostics`
     - `client_users`

### **ÉTAPE 2 : Vérifier les Politiques RLS**

1. **Vérifiez les politiques de sécurité**
   - Dans **"Authentication"** → **"Policies"**
   - Vérifiez que chaque table a des politiques RLS actives

2. **Si les politiques manquent, exécutez à nouveau le script**
   - Le script inclut toutes les politiques nécessaires

### **ÉTAPE 3 : Tester la Configuration**

1. **Ouvrez la console de votre navigateur**
   - Appuyez sur `F12`
   - Allez dans l'onglet **"Console"**

2. **Exécutez le script de test**
   - Copiez le contenu de `test-pro-portal-tables.js`
   - Collez-le dans la console
   - Appuyez sur `Entrée`

3. **Vérifiez les résultats**
   - Vous devriez voir des messages ✅ pour chaque table
   - Si vous voyez des ❌, notez les erreurs

### **ÉTAPE 4 : Recharger le Portail Pro**

1. **Allez sur le portail Pro**
   - Naviguez vers `localhost:5173/#pro`

2. **Vérifiez que les erreurs ont disparu**
   - Plus d'erreurs 404 dans la console
   - Les données s'affichent correctement
   - Le bouton "Planifier une intervention" fonctionne

---

## 🔍 DIAGNOSTIC DÉTAILLÉ

### **Erreurs 404 - Tables Manquantes**
```
GET .../rest/v1/pro_clients?... 404 (Not Found)
GET .../rest/v1/client_equipment?... 404 (Not Found)
GET .../rest/v1/maintenance_interventions?... 404 (Not Found)
```

**Solution :** Exécuter `create-pro-portal-tables.sql`

### **Erreur 406 - user_profiles**
```
GET .../rest/v1/user_profiles?... 406 (Not Acceptable)
```

**Cause :** Problème de politique RLS ou de structure de table
**Solution :** Vérifier que la table `user_profiles` existe et a les bonnes politiques

### **Erreur 500 - ProDashboard.tsx**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

**Cause :** Erreur de syntaxe ou d'import dans le composant
**Solution :** Vérifier les imports et la syntaxe du fichier

### **Erreur "Profil Pro non trouvé"**
```
❌ Erreur lors de la récupération du profil Pro: {}
```

**Cause :** La table `pro_clients` n'existe pas ou l'utilisateur n'a pas de profil
**Solution :** Créer les tables et le profil Pro

---

## 🛠️ CORRECTIONS TECHNIQUES

### **1. Structure de la Table maintenance_interventions**

Le champ `equipment_id` doit être nullable pour permettre les interventions générales :

```sql
-- Correction automatique incluse dans le script
ALTER TABLE maintenance_interventions 
ALTER COLUMN equipment_id DROP NOT NULL;
```

### **2. Politiques RLS Correctes**

Chaque table doit avoir des politiques permettant à l'utilisateur connecté d'accéder à ses données :

```sql
-- Exemple pour pro_clients
CREATE POLICY "Users can view their own pro profile" ON pro_clients
  FOR SELECT USING (auth.uid() = user_id);
```

### **3. Index de Performance**

Les index sont créés automatiquement pour optimiser les requêtes :

```sql
CREATE INDEX IF NOT EXISTS idx_pro_clients_user_id ON pro_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_client_id ON client_equipment(client_id);
```

---

## 📋 CHECKLIST DE VALIDATION

### **✅ Tables Créées**
- [ ] `pro_clients`
- [ ] `client_equipment`
- [ ] `client_orders`
- [ ] `maintenance_interventions`
- [ ] `client_notifications`
- [ ] `technical_documents`
- [ ] `equipment_diagnostics`
- [ ] `client_users`

### **✅ Politiques RLS**
- [ ] RLS activé sur toutes les tables
- [ ] Politiques SELECT pour l'utilisateur connecté
- [ ] Politiques INSERT/UPDATE appropriées

### **✅ Fonctionnalités**
- [ ] Page du portail Pro se charge sans erreur
- [ ] Profil Pro se crée automatiquement
- [ ] Bouton "Ajouter un équipement" fonctionne
- [ ] Bouton "Planifier une intervention" fonctionne
- [ ] Données s'affichent dans tous les onglets
- [ ] Statistiques se calculent correctement

### **✅ Tests**
- [ ] Script de test s'exécute sans erreur
- [ ] Création d'intervention de maintenance réussie
- [ ] Profil Pro accessible et modifiable

---

## 🚨 ERREURS COURANTES ET SOLUTIONS

### **Erreur : "Permission denied"**
**Solution :** Vérifiez que vous êtes connecté et que les politiques RLS sont correctes

### **Erreur : "Table does not exist"**
**Solution :** Exécutez le script `create-pro-portal-tables.sql`

### **Erreur : "Function not found"**
**Solution :** Vérifiez que `proApi.ts` est bien importé dans `ProDashboard.tsx`

### **Erreur : "Network error"**
**Solution :** Vérifiez votre connexion internet et les clés Supabase

### **Erreur : "Invalid input syntax"**
**Solution :** Vérifiez que les types de données correspondent au schéma

---

## 🔄 PROCÉDURE DE RÉCUPÉRATION

### **Si tout échoue :**

1. **Sauvegardez vos données existantes**
2. **Supprimez toutes les tables Pro**
3. **Exécutez le script de création**
4. **Recréez les profils Pro**
5. **Testez chaque fonctionnalité**

### **Script de nettoyage (si nécessaire) :**

```sql
-- ATTENTION : Ceci supprime toutes les données Pro
DROP TABLE IF EXISTS client_notifications CASCADE;
DROP TABLE IF EXISTS equipment_diagnostics CASCADE;
DROP TABLE IF EXISTS technical_documents CASCADE;
DROP TABLE IF EXISTS maintenance_interventions CASCADE;
DROP TABLE IF EXISTS client_orders CASCADE;
DROP TABLE IF EXISTS client_equipment CASCADE;
DROP TABLE IF EXISTS client_users CASCADE;
DROP TABLE IF EXISTS pro_clients CASCADE;
```

---

## 📞 SUPPORT

Si vous rencontrez encore des problèmes après avoir suivi ce guide :

1. **Vérifiez les logs de la console**
2. **Exécutez le script de test**
3. **Notez les erreurs exactes**
4. **Vérifiez que toutes les étapes ont été suivies**

Le portail Pro devrait maintenant fonctionner parfaitement avec toutes ses fonctionnalités ! 