# 📧 Guide Configuration Supabase SMTP

## 🎯 **Pourquoi Supabase SMTP ?**

Vous avez raison ! Supabase a un système SMTP intégré qui est plus simple à utiliser que Resend. Voici comment le configurer :

## 🔧 **Configuration dans Supabase Dashboard**

### **Étape 1 : Accéder aux paramètres SMTP**
1. Allez dans votre **Supabase Dashboard**
2. Cliquez sur **Settings** (⚙️)
3. Cliquez sur **API**
4. Descendez jusqu'à **SMTP Settings**

### **Étape 2 : Configurer SMTP**

#### **Option A : Gmail SMTP (Recommandé)**
```
Host: smtp.gmail.com
Port: 587
Username: votre-email@gmail.com
Password: votre-mot-de-passe-app
Encryption: STARTTLS
```

#### **Option B : Outlook/Hotmail**
```
Host: smtp-mail.outlook.com
Port: 587
Username: votre-email@outlook.com
Password: votre-mot-de-passe
Encryption: STARTTLS
```

#### **Option C : Autre fournisseur**
Utilisez les paramètres de votre fournisseur d'email.

### **Étape 3 : Tester la configuration**
1. Cliquez sur **Test SMTP Connection**
2. Vérifiez que le test réussit
3. Sauvegardez la configuration

## 🚀 **Configuration de la Fonction Edge**

### **Étape 1 : Variables d'environnement**
Dans votre fonction Edge `send-email`, les variables sont automatiquement disponibles :
- `SUPABASE_URL` : URL de votre projet
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service

### **Étape 2 : Déployer la fonction**
```bash
# Si vous avez Supabase CLI
supabase functions deploy send-email

# Ou via l'éditeur web Supabase
# 1. Allez dans Functions
# 2. Créez la fonction send-email
# 3. Copiez le code du fichier index.ts
```

## 🧪 **Test de la Configuration**

### **Test 1 : Vérifier la configuration SMTP**
```javascript
// Dans la console du navigateur
const testEmail = {
  to: 'test@example.com',
  subject: 'Test Supabase SMTP',
  html: '<h1>Test</h1><p>Email de test via Supabase SMTP</p>'
};

const response = await fetch('/functions/v1/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testEmail)
});

console.log(await response.json());
```

### **Test 2 : Test depuis MachineDetail**
1. Allez sur une page MachineDetail
2. Remplissez le formulaire de contact
3. Envoyez le message
4. Vérifiez que l'email est reçu

## 🔍 **Dépannage**

### **Erreur "SMTP not configured"**
- Vérifiez que SMTP est configuré dans Supabase Dashboard
- Vérifiez les paramètres (host, port, credentials)

### **Erreur "Authentication failed"**
- Vérifiez le nom d'utilisateur et mot de passe
- Pour Gmail, utilisez un "mot de passe d'application"

### **Erreur "Connection timeout"**
- Vérifiez le host et le port
- Vérifiez votre connexion internet
- Vérifiez les paramètres de pare-feu

## 📋 **Configuration Gmail (Détaillée)**

### **1. Activer l'authentification à 2 facteurs**
1. Allez dans **Paramètres Google**
2. **Sécurité** → **Authentification à 2 facteurs**
3. Activez-la

### **2. Créer un mot de passe d'application**
1. **Sécurité** → **Mots de passe d'application**
2. Sélectionnez **Mail**
3. Copiez le mot de passe généré

### **3. Configurer dans Supabase**
```
Host: smtp.gmail.com
Port: 587
Username: votre-email@gmail.com
Password: [mot-de-passe-d-application]
Encryption: STARTTLS
```

## ✅ **Avantages de Supabase SMTP**

1. **Intégré** : Pas besoin de service tiers
2. **Simple** : Configuration dans le dashboard
3. **Sécurisé** : Utilise les clés Supabase
4. **Gratuit** : Inclus dans votre plan Supabase

## 🎯 **Résultat Final**

Une fois configuré :
- ✅ Les emails sont envoyés via Supabase SMTP
- ✅ Pas besoin de Resend ou autre service
- ✅ Configuration centralisée dans Supabase
- ✅ Logs disponibles dans Supabase Dashboard

## 🚀 **Prochaines Étapes**

1. **Configurez SMTP** dans Supabase Dashboard
2. **Déployez la fonction** `send-email`
3. **Testez l'envoi** depuis MachineDetail
4. **Vérifiez les logs** dans Supabase

**C'est tout ! Plus simple que Resend et intégré à votre stack existante.** 🎉 