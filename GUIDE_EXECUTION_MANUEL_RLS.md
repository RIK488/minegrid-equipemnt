# 🔧 GUIDE D'EXÉCUTION MANUELLE : Correction des Politiques RLS

## 🎯 Objectif
Corriger manuellement les politiques RLS de Supabase pour permettre la modification d'équipements.

---

## ✅ PROCÉDURE ÉTAPE PAR ÉTAPE

### **ÉTAPE 1 : Accéder au Dashboard Supabase**

1. **Ouvrez** votre navigateur
2. **Allez sur** [https://supabase.com](https://supabase.com)
3. **Connectez-vous** à votre compte
4. **Sélectionnez** votre projet
5. **Cliquez sur** "SQL Editor" dans le menu de gauche

### **ÉTAPE 2 : Vérifier les Politiques Existantes**

**Copiez-collez** cette requête dans l'éditeur SQL :

```sql
-- Vérifier les politiques existantes pour client_equipment
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'client_equipment'
ORDER BY policyname;
```

**Cliquez sur "Run"** et notez les résultats.

**Résultat attendu actuel :**
```
schemaname | tablename | policyname | cmd
-----------+-----------+------------+--------
public     | client_equipment | Client users can view equipment | SELECT
```

**Problème :** Seule la politique SELECT existe, les politiques UPDATE, INSERT et DELETE sont manquantes.

### **ÉTAPE 3 : Créer la Politique INSERT**

**Copiez-collez** cette commande :

```sql
-- Politique pour permettre l'INSERT d'équipements
CREATE POLICY "Client users can insert equipment" ON client_equipment
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );
```

**Cliquez sur "Run"**

### **ÉTAPE 4 : Créer la Politique UPDATE**

**Copiez-collez** cette commande :

```sql
-- Politique pour permettre l'UPDATE d'équipements
CREATE POLICY "Client users can update equipment" ON client_equipment
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );
```

**Cliquez sur "Run"**

### **ÉTAPE 5 : Créer la Politique DELETE**

**Copiez-collez** cette commande :

```sql
-- Politique pour permettre le DELETE d'équipements
CREATE POLICY "Client users can delete equipment" ON client_equipment
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );
```

**Cliquez sur "Run"**

### **ÉTAPE 6 : Vérification Finale**

**Copiez-collez** à nouveau la requête de vérification :

```sql
-- Vérifier que toutes les politiques sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'client_equipment'
ORDER BY policyname;
```

**Résultat attendu final :**
```
schemaname | tablename | policyname | cmd
-----------+-----------+------------+--------
public     | client_equipment | Client users can view equipment | SELECT
public     | client_equipment | Client users can insert equipment | INSERT
public     | client_equipment | Client users can update equipment | UPDATE
public     | client_equipment | Client users can delete equipment | DELETE
```

---

## 🧪 TEST DE VALIDATION

### **ÉTAPE 7 : Tester la Modification d'Équipement**

1. **Ouvrez** votre application : `http://localhost:5173/#pro`
2. **Connectez-vous** si nécessaire
3. **Allez dans l'onglet "Équipements"**
4. **Cliquez sur l'icône ✏️** d'un équipement
5. **Modifiez** quelques champs (ex: localisation, heures)
6. **Cliquez sur "Mettre à jour"**

**Résultat attendu :**
- ✅ Message de succès : "Équipement [numéro] mis à jour avec succès"
- ✅ Modal se ferme automatiquement
- ✅ Données se rechargent
- ✅ Modifications visibles dans le tableau

---

## 🔍 DIAGNOSTIC DES ERREURS

### **Si vous obtenez une erreur lors de l'exécution des commandes SQL :**

#### **Erreur : "policy already exists"**
```
ERROR: policy "Client users can insert equipment" already exists
```
**Solution :** Cette politique existe déjà, passez à la suivante.

#### **Erreur : "relation does not exist"**
```
ERROR: relation "client_equipment" does not exist
```
**Solution :** La table n'existe pas, vérifiez le nom de la table.

#### **Erreur : "permission denied"**
```
ERROR: permission denied for table client_equipment
```
**Solution :** Vous n'avez pas les droits d'administration sur la base de données.

### **Si la modification ne fonctionne toujours pas après avoir créé les politiques :**

1. **Vérifiez la console du navigateur** (F12)
2. **Recherchez** les erreurs JavaScript
3. **Vérifiez** les erreurs réseau
4. **Vérifiez** les logs Supabase dans le dashboard

---

## 📊 CHECKLIST DE VALIDATION

### **Politiques RLS**
- [ ] Politique SELECT existe
- [ ] Politique INSERT créée
- [ ] Politique UPDATE créée
- [ ] Politique DELETE créée
- [ ] Toutes les politiques sont actives

### **Fonctionnalité de Modification**
- [ ] Modal d'édition s'ouvre
- [ ] Formulaire pré-rempli avec les données
- [ ] Modification des champs possible
- [ ] Bouton "Mettre à jour" fonctionne
- [ ] Message de succès s'affiche
- [ ] Modal se ferme automatiquement
- [ ] Données se rechargent
- [ ] Modifications visibles dans le tableau

---

## 🎯 RÉSULTATS ATTENDUS

### **Succès Complet :**
```
🔧 POLITIQUES RLS CORRIGÉES !
✅ Politique SELECT (lecture) - Existe déjà
✅ Politique INSERT (ajout) - Créée
✅ Politique UPDATE (modification) - Créée
✅ Politique DELETE (suppression) - Créée
✅ Modification d'équipement fonctionnelle
✅ Interface utilisateur responsive
✅ Messages de feedback appropriés
```

---

## 📝 NOTES TECHNIQUES

### **Sécurité des Politiques :**
- **Isolation** : Chaque utilisateur ne peut modifier que les équipements de son client
- **Authentification** : Vérification de l'utilisateur connecté via `auth.uid()`
- **Autorisation** : Vérification des permissions via la table `client_users`

### **Performance :**
- **Index** : Les requêtes utilisent les index existants
- **Cache** : Supabase met en cache les politiques
- **Optimisation** : Requêtes optimisées pour les performances

---

**🎯 CONCLUSION :** En suivant ces étapes, vous corrigerez les politiques RLS et la modification d'équipement fonctionnera parfaitement ! 