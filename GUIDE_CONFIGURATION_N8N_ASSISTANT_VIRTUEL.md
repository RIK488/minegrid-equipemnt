# 🚀 Guide de Configuration n8n - Assistant Virtuel Minegrid

## 📋 Prérequis

### 1. **Accès à n8n**
- Instance n8n hébergée (cloud ou serveur)
- URL : `https://n8n.srv786179.hstgr.cloud`
- Compte administrateur

### 2. **Configuration du Workflow**

## 🔧 Étapes de Configuration

### **Étape 1 : Créer le Workflow**

1. **Connectez-vous à n8n**
   - Allez sur `https://n8n.srv786179.hstgr.cloud`
   - Connectez-vous avec vos identifiants

2. **Créer un nouveau workflow**
   - Cliquez sur "New Workflow"
   - Nommez-le "Assistant Virtuel Minegrid"

### **Étape 2 : Configurer le Webhook Trigger**

1. **Ajouter un nœud Webhook**
   - Glissez-déposez "Webhook" depuis la palette
   - Configurez les paramètres :
     ```
     HTTP Method: POST
     Path: assistant_virtuel
     Response Mode: Respond to Webhook
     ```

2. **Configuration CORS**
   - Dans les options du webhook :
     ```
     CORS: Enabled
     Origin: *
     Methods: GET,POST,PUT,DELETE,OPTIONS
     ```

### **Étape 3 : Ajouter le Nœud de Traitement**

1. **Nœud "Code" - Traiter le Message**
   ```javascript
   // Extraction du message de la requête
   const message = $input.first().json.message;
   
   // Log pour debug
   console.log('Message reçu:', message);
   
   // Validation du message
   if (!message || typeof message !== 'string') {
     throw new Error('Message invalide ou manquant');
   }
   
   // Préparation de la réponse
   const response = {
     message: message,
     timestamp: new Date().toISOString(),
     processed: true
   };
   
   return response;
   ```

### **Étape 4 : Ajouter la Logique de l'Assistant**

1. **Nœud "Code" - Logique Assistant**
   ```javascript
   // Logique de l'assistant virtuel
   const message = $input.first().json.message.toLowerCase();
   
   // Réponses prédéfinies
   const responses = {
     // Salutations
     'bonjour': 'Bonjour ! Je suis l\'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?',
     'salut': 'Salut ! Comment puis-je vous aider aujourd\'hui ?',
     'hello': 'Hello ! Bienvenue chez Minegrid Équipement. Que recherchez-vous ?',
     
     // Informations sur l'entreprise
     'qui êtes-vous': 'Minegrid Équipement est une plateforme spécialisée dans la vente et location d\'équipements miniers et de construction en Afrique.',
     'minegrid': 'Minegrid Équipement est votre partenaire de confiance pour tous vos besoins en équipements industriels.',
     
     // Équipements
     'équipements': 'Nous proposons une large gamme d\'équipements : excavatrices, bulldozers, chargeurs, camions, etc.',
     'machines': 'Nos machines incluent des équipements de construction, miniers et agricoles de qualité professionnelle.',
     
     // Services
     'services': 'Nos services incluent : vente, location, maintenance, formation et support technique.',
     'maintenance': 'Nous proposons des services de maintenance préventive et curative pour tous nos équipements.',
     
     // Contact
     'contact': 'Vous pouvez nous contacter par téléphone, email ou via notre formulaire en ligne.',
     'téléphone': 'Notre numéro de téléphone est disponible sur notre site web.',
     'email': 'Vous pouvez nous envoyer un email via le formulaire de contact sur notre site.',
     
     // Localisation
     'où': 'Minegrid Équipement opère principalement en Afrique de l\'Ouest.',
     'localisation': 'Nous sommes présents dans plusieurs pays d\'Afrique de l\'Ouest.',
     
     // Prix
     'prix': 'Nos prix varient selon l\'équipement et les conditions. Contactez-nous pour un devis personnalisé.',
     'devis': 'Pour obtenir un devis, contactez-nous avec les détails de vos besoins.',
     
     // Aide générale
     'aide': 'Je peux vous aider avec : informations sur nos équipements, services, contact, devis, etc.',
     'help': 'Je peux vous aider avec : informations sur nos équipements, services, contact, devis, etc.'
   };
   
   // Recherche de la réponse appropriée
   let response = 'Je ne comprends pas votre demande. Pouvez-vous reformuler ou me poser une question sur nos équipements, services ou contact ?';
   
   for (const [keyword, reply] of Object.entries(responses)) {
     if (message.includes(keyword)) {
       response = reply;
       break;
     }
   }
   
   // Si c'est une question sur les équipements spécifiques
   if (message.includes('excavatrice') || message.includes('bulldozer') || message.includes('chargeur')) {
     response = 'Nous avons ces équipements en stock. Pouvez-vous me donner plus de détails sur vos besoins (capacité, utilisation, budget) ?';
   }
   
   // Si c'est une demande de devis
   if (message.includes('devis') || message.includes('prix') || message.includes('coût')) {
     response = 'Pour un devis précis, j\'ai besoin de plus d\'informations : type d\'équipement, durée d\'utilisation, localisation. Pouvez-vous me donner ces détails ?';
   }
   
   return {
     response: response,
     originalMessage: message,
     timestamp: new Date().toISOString()
   };
   ```

### **Étape 5 : Configurer la Réponse HTTP**

1. **Nœud "Respond to Webhook"**
   - Configurez les paramètres :
     ```
     Respond With: JSON
     Response Body: {{ $json }}
     Headers: Content-Type: application/json
     ```

## 🔗 Connexions du Workflow

```
Webhook Trigger → Traiter le Message → Logique Assistant → Réponse HTTP
```

## ✅ Activation du Workflow

1. **Sauvegarder le workflow**
2. **Activer le workflow** (bouton "Active" en haut à droite)
3. **Copier l'URL du webhook** générée

## 🧪 Test du Workflow

### **Test avec curl :**
```bash
curl -X POST "https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel" \
  -H "Content-Type: application/json" \
  -d '{"message":"bonjour"}'
```

### **Réponse attendue :**
```json
{
  "response": "Bonjour ! Je suis l'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?",
  "originalMessage": "bonjour",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Configuration Avancée

### **Variables d'Environnement (Optionnel)**
```bash
# Dans n8n, ajoutez ces variables :
N8N_BASE_URL=https://n8n.srv786179.hstgr.cloud
N8N_WEBHOOK_URL=https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel
```

### **Logs et Monitoring**
- Activez les logs dans n8n pour déboguer
- Surveillez les exécutions du workflow
- Configurez des alertes en cas d'erreur

## 🚨 Dépannage

### **Problèmes Courants :**

1. **Webhook non accessible**
   - Vérifiez que le workflow est activé
   - Vérifiez l'URL du webhook
   - Testez avec curl ou Postman

2. **Erreur CORS**
   - Vérifiez la configuration CORS
   - Ajoutez votre domaine dans les origines autorisées

3. **Réponse vide**
   - Vérifiez la logique du nœud "Code"
   - Activez les logs pour déboguer
   - Testez chaque nœud individuellement

4. **Timeout**
   - Augmentez le timeout dans les paramètres du webhook
   - Optimisez la logique de traitement

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs n8n
2. Testez chaque nœud séparément
3. Vérifiez la configuration du serveur n8n
4. Contactez l'administrateur n8n si nécessaire

---

**✅ Une fois configuré, l'assistant virtuel sera fonctionnel sur votre site !** 