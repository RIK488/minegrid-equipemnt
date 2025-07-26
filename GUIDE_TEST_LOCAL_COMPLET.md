# 🧪 Guide de Test Local Complet

## 📋 **Prérequis**

### 1. Variables d'environnement
Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Installation des dépendances
```bash
npm install
npm install dotenv  # Pour le script de test
```

## 🚀 **Étapes de Test**

### **Étape 1 : Test de Configuration**
```bash
node test-local-config.js
```

Ce script vérifie :
- ✅ Connexion à Supabase
- ✅ Récupération des annonces
- ✅ Récupération des messages
- ✅ Envoi de messages de test
- ✅ Fonction Edge (si configurée)

### **Étape 2 : Lancement de l'Application**
```bash
npm run dev
```

Ouvrez : http://localhost:5173

### **Étape 3 : Test de l'Interface**

#### **3.1 Connexion/Création de compte**
- Allez sur la page de connexion
- Créez un compte ou connectez-vous
- Vérifiez que vous êtes bien connecté

#### **3.2 Test des Annonces**
- Allez sur la page des machines
- Vérifiez que les annonces s'affichent
- Cliquez sur une annonce pour voir les détails

#### **3.3 Test d'Envoi de Message**
- Sur une page `MachineDetail`
- Remplissez le formulaire de contact
- Envoyez le message
- Vérifiez la confirmation

#### **3.4 Test de Réception**
- Allez dans **MessagesBoite** (`/#messages`)
- Vérifiez que le message apparaît
- Testez les actions (marquer comme lu, répondre)

#### **3.5 Test du Dashboard**
- Allez dans le **Dashboard** (`/#dashboard`)
- Vérifiez que le compteur de messages s'incrémente
- Testez le tableau de bord vendeur

## 📧 **Configuration Email (Optionnel)**

### **Option 1 : SMTP dans Supabase**
1. Allez dans **Supabase Dashboard** → **Settings** → **API**
2. Section **SMTP Settings**
3. Configurez avec vos identifiants

### **Option 2 : Service tiers (Recommandé)**

#### **Avec Resend (Gratuit)**
```bash
npm install resend
```

Dans votre fonction Edge :
```javascript
import { Resend } from 'resend';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'noreply@votre-domaine.com',
  to: email,
  subject: 'Nouveau message',
  html: content
});
```

#### **Avec SendGrid (Gratuit jusqu'à 100/jour)**
```bash
npm install @sendgrid/mail
```

## 🔍 **Points de Vérification**

### **✅ Fonctionnel**
- [ ] Connexion à Supabase
- [ ] Affichage des annonces
- [ ] Envoi de messages
- [ ] Sauvegarde en base
- [ ] Affichage dans MessagesBoite
- [ ] Compteur dans le dashboard

### **⚠️ À Configurer**
- [ ] Envoi d'emails réels (SMTP/service tiers)
- [ ] Notifications push
- [ ] Upload d'images

## 🐛 **Dépannage**

### **Erreur de Connexion Supabase**
```bash
# Vérifiez vos variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **Messages qui n'apparaissent pas**
1. Vérifiez les politiques RLS
2. Vérifiez que vous êtes connecté
3. Vérifiez les logs dans la console

### **Erreur 401/403**
1. Vérifiez que votre clé API est correcte
2. Vérifiez les politiques RLS dans Supabase
3. Vérifiez que l'utilisateur est authentifié

## 📊 **Logs Utiles**

### **Console Navigateur**
```javascript
// Vérifier la connexion
console.log('User:', await supabase.auth.getUser());

// Vérifier les messages
console.log('Messages:', await supabase.from('messages').select('*'));
```

### **Logs Supabase**
- Allez dans **Supabase Dashboard** → **Logs**
- Vérifiez les requêtes et erreurs

## 🎯 **Test Complet Réussi**

Quand tout fonctionne, vous devriez pouvoir :
1. ✅ Voir les annonces
2. ✅ Envoyer un message depuis MachineDetail
3. ✅ Voir le message dans MessagesBoite
4. ✅ Voir le compteur s'incrémenter dans le dashboard
5. ✅ Répondre aux messages
6. ✅ Marquer comme lu/non lu

## 🚀 **Prochaines Étapes**

Une fois que tout fonctionne en local :
1. Configurez l'envoi d'emails réels
2. Déployez sur Vercel/Netlify
3. Configurez les notifications
4. Optimisez les performances 