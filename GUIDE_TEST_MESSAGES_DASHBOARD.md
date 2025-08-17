# 📧 GUIDE : TEST DES MESSAGES DANS LE DASHBOARD

## 🎯 **OBJECTIF**

Vérifier que les messages envoyés par d'autres utilisateurs s'affichent correctement dans le dashboard de l'utilisateur connecté.

## 🔧 **MODIFICATIONS APPORTÉES**

### 1. **Chargement des messages depuis Supabase**
- Suppression de la dépendance à `getMessages()` de l'API
- Chargement direct depuis la table `messages` de Supabase
- Filtrage par `recipient_email` de l'utilisateur connecté

### 2. **Interface améliorée**
- Affichage du statut (nouveau/lu)
- Informations sur l'équipement concerné
- Boutons d'action (Voir l'équipement, Répondre, Marquer comme lu)
- Actualisation en temps réel

### 3. **Fonctionnalités ajoutées**
- Marquage comme lu/non lu
- Redirection vers l'équipement
- Redirection vers la réponse

## 🧪 **TESTS À EFFECTUER**

### Test 1 : Vérification de l'affichage
1. **Connectez-vous** à l'application
2. **Allez sur le dashboard** (`localhost:5175/#dashboard/overview`)
3. **Cliquez sur la carte "Messages reçus"**
4. **Vérifiez** que les messages s'affichent

### Test 2 : Test via console
1. **Ouvrez la console** (F12)
2. **Collez le script** `test-messages-dashboard.js`
3. **Exécutez** : `runCompleteTest()`

### Test 3 : Création d'un message de test
1. **Dans la console**, exécutez :
```javascript
const user = await testMessages.testUserConnection();
if (user) {
    await testMessages.createTestMessage(user);
}
```

## 📋 **RÉSULTATS ATTENDUS**

### ✅ **Si tout fonctionne**
- Les messages apparaissent dans la liste
- Le compteur de messages est correct
- Les boutons d'action fonctionnent
- Le marquage comme lu fonctionne

### ❌ **Si problème**
- Messages vides : Vérifier la connexion utilisateur
- Erreurs console : Vérifier les permissions Supabase
- Interface cassée : Vérifier les imports

## 🔍 **DIAGNOSTIC DES PROBLÈMES**

### Problème : Aucun message affiché
**Vérifications :**
1. Utilisateur connecté ?
2. Messages en base de données ?
3. Permissions RLS correctes ?

**Solution :**
```javascript
// Dans la console
const user = await testMessages.testUserConnection();
const messages = await testMessages.loadUserMessages(user);
console.log('Messages trouvés:', messages.length);
```

### Problème : Erreurs de permissions
**Vérifications :**
1. RLS activé sur la table `messages`
2. Politique de sélection correcte
3. Utilisateur authentifié

**Solution :**
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

### Problème : Interface ne se charge pas
**Vérifications :**
1. Imports corrects dans Dashboard.jsx
2. Supabase client configuré
3. Pas d'erreurs JavaScript

**Solution :**
```javascript
// Vérifier la configuration Supabase
console.log('Supabase config:', supabase.supabaseUrl);
```

## 🎯 **FONCTIONNALITÉS DISPONIBLES**

### 📧 **Affichage des messages**
- Nom de l'expéditeur
- Email de l'expéditeur
- Sujet du message
- Contenu (tronqué si trop long)
- Date de réception
- Statut (nouveau/lu)

### 🔘 **Actions disponibles**
- **Voir l'équipement** : Ouvre la page de l'équipement
- **Répondre** : Redirige vers ProDashboard pour répondre
- **Marquer comme lu** : Change le statut du message

### 📊 **Indicateurs visuels**
- Messages nouveaux : Fond coloré + badge "Nouveau"
- Messages lus : Fond grisé
- Compteur de messages non lus

## 🚀 **PROCHAINES ÉTAPES**

1. **Tester** l'affichage des messages
2. **Vérifier** les fonctionnalités d'action
3. **Tester** le marquage comme lu
4. **Vérifier** la redirection vers les réponses

## 📝 **NOTES IMPORTANTES**

- Les messages sont filtrés par `recipient_email`
- L'ordre est chronologique (plus récent en premier)
- Les messages incluent les informations de l'équipement
- Le système fonctionne sans SMTP

---

**🎉 Votre dashboard affiche maintenant tous les messages reçus d'autres utilisateurs !** 