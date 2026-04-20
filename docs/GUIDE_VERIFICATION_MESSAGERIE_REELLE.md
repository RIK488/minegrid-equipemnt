# 📧 Guide de Vérification - Messagerie Réellement Fonctionnelle

## 🎯 **Objectif**
Vérifier que les messages sont **réellement envoyés** et non pas seulement simulés.

## 🔍 **Points de Vérification**

### **1. Configuration SMTP Réelle**

#### **Vérifier dans Supabase Dashboard :**
1. Allez dans **Settings** > **API** > **SMTP Settings**
2. Vérifiez que les paramètres sont configurés :
   ```
   Host: smtp.gmail.com (ou votre fournisseur)
   Port: 587
   Username: votre-email@gmail.com
   Password: [mot de passe configuré]
   From: contact@minegrid-equipment.com
   ```
3. Cliquez sur **Test SMTP Connection**
4. ✅ **Résultat attendu :** "Connection successful"

#### **Si SMTP non configuré :**
- Les emails seront **simulés** (pas d'envoi réel)
- Vous verrez des logs de simulation dans la console

### **2. Test des Fonctions Edge**

#### **Test 1 : Fonction send-contact-email**
```javascript
// Dans la console du navigateur (F12)
const testEmail = {
  to: 'votre-email@example.com',
  from: 'contact@minegrid-equipment.com',
  subject: 'Test messagerie réelle',
  html: '<h1>Test</h1><p>Si vous recevez cet email, la messagerie fonctionne !</p>',
  machineId: 'test-123',
  messageId: 'test-456'
};

fetch('/functions/v1/send-contact-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testEmail)
})
.then(r => r.json())
.then(console.log);
```

#### **Test 2 : Fonction send-email**
```javascript
const testEmail2 = {
  to: 'votre-email@example.com',
  subject: 'Test send-email',
  html: '<h1>Test fonction send-email</h1>'
};

fetch('/functions/v1/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testEmail2)
})
.then(r => r.json())
.then(console.log);
```

### **3. Vérification des Logs**

#### **Dans Supabase Dashboard :**
1. Allez dans **Logs** > **Edge Functions**
2. Cherchez les logs de `send-contact-email` et `send-email`
3. Vérifiez les messages d'erreur ou de succès

#### **Dans la Console du Navigateur :**
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Envoyez un message via le formulaire de contact
4. Vérifiez les logs d'envoi

### **4. Test Manuel Complet**

#### **Étape 1 : Formulaire de Contact**
1. Allez sur `localhost:5173`
2. Naviguez vers une page de détail d'équipement
3. Remplissez le formulaire de contact :
   - Nom : Test Utilisateur
   - Email : **votre-vrai-email@example.com**
   - Téléphone : +33123456789
   - Message : "Test de messagerie réelle - vérification envoi"
4. Cliquez sur **Envoyer**

#### **Étape 2 : Vérifications**
1. **Console navigateur :** Vérifiez les logs d'envoi
2. **Supabase Logs :** Vérifiez les logs Edge Functions
3. **Boîte email :** Vérifiez si vous recevez l'email
4. **Base de données :** Vérifiez la table `messages`

### **5. Vérification Base de Données**

#### **Dans Supabase Table Editor :**
1. Allez dans **Table Editor** > **messages**
2. Vérifiez que le message est sauvegardé
3. Vérifiez le statut : `sent` ou `pending`
4. Vérifiez la date `sent_at` si présente

```sql
-- Requête pour vérifier les messages récents
SELECT 
  id,
  sender_name,
  sender_email,
  message,
  status,
  created_at,
  sent_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
```

### **6. Test de Réponse aux Messages**

#### **Dans le Portail Pro :**
1. Allez dans **Messages**
2. Sélectionnez un message
3. Cliquez sur **Répondre**
4. Remplissez la réponse
5. Cliquez sur **Envoyer la réponse**

#### **Vérifications :**
- Le message original est marqué comme `replied`
- Une nouvelle entrée est créée dans la table `messages`
- L'email de réponse est envoyé (si SMTP configuré)

### **7. Indicateurs de Fonctionnement Réel**

#### **✅ Messagerie Fonctionnelle :**
- ✅ Configuration SMTP complète
- ✅ Emails reçus dans la boîte de réception
- ✅ Logs Edge Functions sans erreur
- ✅ Statut `sent` dans la base de données
- ✅ Date `sent_at` renseignée

#### **⚠️ Messagerie Simulée :**
- ⚠️ Configuration SMTP manquante
- ⚠️ Logs "Email simulé" dans la console
- ⚠️ Pas d'emails reçus
- ⚠️ Statut `pending` dans la base de données
- ⚠️ Pas de date `sent_at`

### **8. Correction des Problèmes**

#### **Si les emails ne sont pas envoyés :**

1. **Vérifier la configuration SMTP :**
   ```bash
   # Dans Supabase Dashboard > Settings > API > SMTP
   # Configurer avec vos vraies informations SMTP
   ```

2. **Vérifier les Edge Functions :**
   ```bash
   # Dans Supabase Dashboard > Edge Functions
   # Vérifier que send-contact-email et send-email sont déployées
   ```

3. **Vérifier les variables d'environnement :**
   ```bash
   # Dans Supabase Dashboard > Settings > API
   # Vérifier que les variables SMTP sont définies
   ```

4. **Tester la connexion SMTP :**
   ```bash
   # Dans Supabase Dashboard > Settings > API > SMTP
   # Cliquer sur "Test SMTP Connection"
   ```

### **9. Script de Test Automatique**

Exécutez le script `test-messagerie-fonctionnelle.js` pour un test complet :

```bash
# Dans la console du navigateur
# Copier-coller le contenu du fichier test-messagerie-fonctionnelle.js
```

### **10. Résumé des Vérifications**

| Élément | Statut | Action |
|---------|--------|--------|
| Configuration SMTP | ✅/❌ | Configurer dans Supabase |
| Edge Functions | ✅/❌ | Déployer les fonctions |
| Base de données | ✅/❌ | Vérifier la table messages |
| Envoi d'emails | ✅/❌ | Tester avec vrai email |
| Réception d'emails | ✅/❌ | Vérifier boîte de réception |
| Réponses aux messages | ✅/❌ | Tester dans Portail Pro |

## 🎯 **Conclusion**

Pour que la messagerie soit **réellement fonctionnelle**, vous devez :

1. ✅ **Configurer SMTP** dans Supabase
2. ✅ **Déployer les Edge Functions**
3. ✅ **Tester avec un vrai email**
4. ✅ **Vérifier la réception**

Si tous ces points sont validés, la messagerie fonctionne réellement et les messages sont envoyés ! 