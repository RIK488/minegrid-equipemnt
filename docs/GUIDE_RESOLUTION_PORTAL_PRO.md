# 🔧 GUIDE DE RÉSOLUTION - Portail Pro - Données qui n'apparaissent pas

## 🚨 **PROBLÈME IDENTIFIÉ**

Les données n'apparaissent pas dans le portail Pro. Voici les étapes de diagnostic et de résolution.

## 🔍 **DIAGNOSTIC ÉTAPE PAR ÉTAPE**

### **Étape 1 : Vérifier l'authentification**

1. **Ouvrir la console du navigateur** (F12)
2. **Copier-coller le script de diagnostic** :
```javascript
// Copier le contenu de diagnostic-portail-pro.js
```

3. **Vérifier les résultats** :
   - ✅ Utilisateur connecté
   - ❌ Utilisateur non connecté → **Se connecter d'abord**

### **Étape 2 : Vérifier les tables Supabase**

Le script de diagnostic vérifiera si les tables existent :
- `user_profiles`
- `pro_clients`
- `client_equipment`
- `client_orders`
- `maintenance_interventions`
- `client_notifications`

**Si les tables n'existent pas** → Exécuter le script SQL

### **Étape 3 : Créer les tables (si nécessaire)**

1. **Aller dans Supabase Dashboard**
2. **Ouvrir SQL Editor**
3. **Copier-coller le script** `create-pro-tables.sql`
4. **Exécuter le script**

### **Étape 4 : Vérifier les profils**

Le script vérifiera :
- **Profil utilisateur** dans `user_profiles`
- **Profil Pro** dans `pro_clients`

**Si les profils n'existent pas** → Ils seront créés automatiquement

## 🛠️ **SOLUTIONS RAPIDES**

### **Solution 1 : Recharger la page**
```
1. Aller sur #pro
2. Recharger la page (F5)
3. Vérifier la console pour les erreurs
```

### **Solution 2 : Vérifier la connexion Supabase**
```javascript
// Dans la console
console.log('Test Supabase:', supabase);
```

### **Solution 3 : Forcer la création des données**
```javascript
// Dans la console
localStorage.clear();
location.reload();
```

## 📋 **CHECKLIST DE VÉRIFICATION**

### **✅ Authentification**
- [ ] Utilisateur connecté
- [ ] Email affiché dans l'interface
- [ ] Pas d'erreur d'authentification

### **✅ Tables Supabase**
- [ ] Table `user_profiles` accessible
- [ ] Table `pro_clients` accessible
- [ ] Table `client_equipment` accessible
- [ ] Table `client_orders` accessible
- [ ] Table `maintenance_interventions` accessible
- [ ] Table `client_notifications` accessible

### **✅ Profils**
- [ ] Profil utilisateur existe
- [ ] Profil Pro existe ou se crée automatiquement
- [ ] Données de profil correctes

### **✅ Fonctions API**
- [ ] `getProClientProfile()` fonctionne
- [ ] `getClientEquipment()` fonctionne
- [ ] `getClientOrders()` fonctionne
- [ ] `getMaintenanceInterventions()` fonctionne
- [ ] `getClientNotifications()` fonctionne
- [ ] `getPortalStats()` fonctionne

### **✅ Interface**
- [ ] Page se charge sans erreur
- [ ] Loading spinner s'affiche puis disparaît
- [ ] Données s'affichent dans les onglets
- [ ] Statistiques se calculent

## 🚨 **ERREURS COURANTES ET SOLUTIONS**

### **Erreur : "Table does not exist"**
**Solution** : Exécuter le script `create-pro-tables.sql`

### **Erreur : "User not authenticated"**
**Solution** : Se connecter d'abord

### **Erreur : "RLS policy violation"**
**Solution** : Vérifier les politiques de sécurité dans Supabase

### **Erreur : "Function not found"**
**Solution** : Vérifier que `proApi.ts` est bien importé

### **Erreur : "Network error"**
**Solution** : Vérifier la connexion internet et les clés Supabase

## 🔧 **RÉPARATION MANUELLE**

### **Si les tables n'existent pas :**
1. Aller dans **Supabase Dashboard**
2. **SQL Editor** → **New Query**
3. Copier-coller `create-pro-tables.sql`
4. **Run** le script

### **Si les profils n'existent pas :**
1. Aller sur **#pro**
2. Les profils se créeront automatiquement
3. Vérifier la console pour les logs

### **Si les données de démonstration n'apparaissent pas :**
1. Vérifier que les fonctions API sont bien appelées
2. Vérifier les logs dans la console
3. Forcer le rechargement des données

## 📞 **SUPPORT AVANCÉ**

### **Logs à vérifier :**
```javascript
// Dans la console, chercher :
🔄 Récupération du profil Pro
✅ Profil Pro créé/récupéré
🔄 Récupération des équipements Pro
✅ Équipements de démonstration créés
```

### **Données de test :**
Si rien ne fonctionne, les données de démonstration devraient apparaître :
- **2 équipements** (CAT 320D, Volvo L120H)
- **2 commandes** (CMD-2024-001, CMD-2024-002)
- **2 interventions** (maintenance préventive, réparation)
- **2 notifications** (maintenance due, commande confirmée)

## 🎯 **RÉSULTAT ATTENDU**

Après résolution, le portail Pro devrait afficher :
- ✅ **Profil Pro** avec vos vraies données
- ✅ **Équipements** (réels ou démo)
- ✅ **Commandes** avec statuts
- ✅ **Interventions** de maintenance
- ✅ **Notifications** avec priorités
- ✅ **Statistiques** calculées en temps réel

## 🚀 **TEST FINAL**

1. **Aller sur** `#pro`
2. **Vérifier** que la page se charge
3. **Naviguer** entre les onglets
4. **Tester** l'ajout d'un équipement
5. **Vérifier** que les données persistent

**Le portail Pro devrait maintenant fonctionner parfaitement !** 🎉 