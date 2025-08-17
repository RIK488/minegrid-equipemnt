# 📧 GUIDE : SYSTÈME DE NOTIFICATIONS INTERNES

## 🎯 **OBJECTIF**

Permettre aux utilisateurs de recevoir des notifications de messages **directement dans l'application** sans dépendre d'emails externes.

## 🔧 **COMPOSANTS CRÉÉS**

### 1. **Table `notifications`**
- Stocke les notifications internes
- Chaque utilisateur voit ses propres notifications
- Notifications en temps réel

### 2. **Edge Function modifiée**
- Suppression de la dépendance SMTP
- Utilisation de Resend (service email gratuit) en option
- Fallback vers notifications internes

### 3. **Composant `NotificationCenter`**
- Interface utilisateur pour les notifications
- Compteur de notifications non lues
- Marquage comme lu/non lu

## 🚀 **ÉTAPES D'INSTALLATION**

### Étape 1 : Créer la table notifications
```bash
# Dans le terminal Supabase ou via l'interface
node execute-notifications-table.js
```

### Étape 2 : Déployer l'Edge Function modifiée
```bash
# Dans le dossier supabase/functions/send-contact-email
supabase functions deploy send-contact-email
```

### Étape 3 : Intégrer le composant NotificationCenter
Ajouter dans vos pages principales :
```tsx
import NotificationCenter from '../components/NotificationCenter';

// Dans votre composant
<NotificationCenter userEmail={user.email} />
```

## 🧪 **TEST DU SYSTÈME**

### Test 1 : Envoi de message depuis MachineDetail
1. Allez sur une page de détail d'équipement
2. Remplissez le formulaire de contact
3. Envoyez le message
4. **Résultat attendu** : 
   - Message sauvegardé en base
   - Notification créée pour le destinataire
   - Email envoyé (si Resend configuré) ou simulé

### Test 2 : Réponse depuis ProDashboard
1. Connectez-vous en tant que vendeur
2. Allez dans l'onglet Messages
3. Répondez à un message
4. **Résultat attendu** :
   - Réponse sauvegardée en base
   - Notification créée pour l'expéditeur original
   - Email de réponse envoyé

### Test 3 : Réception de notification
1. Connectez-vous avec l'email destinataire
2. Vérifiez l'icône de notification (cloche)
3. Cliquez pour voir les notifications
4. **Résultat attendu** :
   - Notification visible avec le message
   - Possibilité de marquer comme lu

## 📋 **AVANTAGES DE CETTE SOLUTION**

### ✅ **Pour tous les utilisateurs**
- Fonctionne sans configuration SMTP
- Notifications instantanées dans l'app
- Pas de dépendance externe

### ✅ **Fallback robuste**
- Si email échoue → notification interne
- Si notification échoue → message en base
- Toujours une trace de la communication

### ✅ **Expérience utilisateur**
- Notifications en temps réel
- Interface intuitive
- Historique des messages

## 🔄 **FLUX DE MESSAGERIE COMPLET**

```
1. Utilisateur A envoie message → MachineDetail
   ↓
2. Message sauvegardé en base
   ↓
3. Notification créée pour Utilisateur B
   ↓
4. Email envoyé (si configuré) OU simulé
   ↓
5. Utilisateur B voit notification dans l'app
   ↓
6. Utilisateur B répond depuis ProDashboard
   ↓
7. Réponse sauvegardée + notification pour Utilisateur A
   ↓
8. Email de réponse envoyé (si configuré)
```

## 🛠 **CONFIGURATION OPTIONNELLE : RESEND**

Pour de vrais emails (optionnel) :

1. Créer un compte sur [resend.com](https://resend.com)
2. Obtenir une clé API gratuite
3. Ajouter dans Supabase :
   ```
   RESEND_API_KEY=votre_clé_api
   ```

## 🎯 **RÉSULTAT FINAL**

- ✅ **Messages fonctionnels pour tous les utilisateurs**
- ✅ **Pas de configuration SMTP requise**
- ✅ **Notifications en temps réel**
- ✅ **Fallback robuste**
- ✅ **Expérience utilisateur optimale**

## 🚨 **EN CAS DE PROBLÈME**

### Problème : Notifications ne s'affichent pas
**Solution** : Vérifier que la table `notifications` est créée et que le composant `NotificationCenter` est intégré.

### Problème : Messages ne sont pas envoyés
**Solution** : Vérifier les logs de l'Edge Function dans Supabase.

### Problème : Erreurs de base de données
**Solution** : Exécuter `execute-notifications-table.js` pour recréer la table.

---

**🎉 Votre système de messagerie fonctionne maintenant pour tous les utilisateurs sans SMTP !** 