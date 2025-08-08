# 🔔 EXEMPLE VISUEL - CRÉATION DE NOTIFICATIONS

## 🎯 **Explication en Images**

### **1. 📊 La Base de Données (Table client_notifications)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           client_notifications                              │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│ id          │ client_id   │ user_id     │ type        │ title               │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────────┤
│ uuid-123    │ client-456  │ user-789    │ maintenance │ Maintenance urgente │
│ uuid-456    │ client-456  │ user-789    │ order       │ Commande livrée     │
│ uuid-789    │ client-456  │ user-789    │ diagnostic  │ Alerte diagnostic   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
```

### **2. 🔧 Création d'une Notification**

#### **Étape A : Préparer les Données**
```javascript
// Données à insérer
const nouvelleNotification = {
    client_id: "client-456",           // ← ID du client Pro
    user_id: "user-789",               // ← ID de l'utilisateur
    type: "maintenance_due",           // ← Type de notification
    title: "Maintenance urgente",      // ← Titre
    message: "Votre équipement nécessite une maintenance", // ← Message
    is_read: false,                    // ← Non lu
    priority: "urgent",                // ← Priorité urgente
    related_entity_type: "equipment",  // ← Lié à un équipement
    related_entity_id: "cat-001"       // ← ID de l'équipement
};
```

#### **Étape B : Insérer dans la Base**
```javascript
// Code pour insérer
await supabase
    .from('client_notifications')
    .insert([nouvelleNotification]);
```

#### **Étape C : Résultat**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           client_notifications                              │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│ id          │ client_id   │ user_id     │ type        │ title               │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────────┤
│ uuid-123    │ client-456  │ user-789    │ maintenance │ Maintenance urgente │
│ uuid-456    │ client-456  │ user-789    │ order       │ Commande livrée     │
│ uuid-789    │ client-456  │ user-789    │ diagnostic  │ Alerte diagnostic   │
│ uuid-999    │ client-456  │ user-789    │ maintenance │ Maintenance urgente │ ← NOUVELLE
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
```

### **3. 🖥️ Affichage dans l'Interface**

#### **Avant la Création :**
```
┌─────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS                        │
├─────────────────────────────────────────────────────────┤
│ 🔴 🔧 Maintenance préventive urgente                    │
│    La maintenance de l'équipement CAT-2024-001...       │
│                                                         │
│ 🔵 📦 Commande livrée avec succès                       │
│    Votre commande CMD-2024-015 a été livrée...         │
│                                                         │
│ 🟡 ⚠️ Anomalie détectée sur équipement                  │
│    Le diagnostic automatique a détecté...               │
└─────────────────────────────────────────────────────────┘
```

#### **Après la Création :**
```
┌─────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS                        │
├─────────────────────────────────────────────────────────┤
│ 🔴 🔧 Maintenance urgente                               │ ← NOUVELLE
│    Votre équipement nécessite une maintenance          │
│                                                         │
│ 🔴 🔧 Maintenance préventive urgente                    │
│    La maintenance de l'équipement CAT-2024-001...       │
│                                                         │
│ 🔵 📦 Commande livrée avec succès                       │
│    Votre commande CMD-2024-015 a été livrée...         │
│                                                         │
│ 🟡 ⚠️ Anomalie détectée sur équipement                  │
│    Le diagnostic automatique a détecté...               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 **Comment Créer une Notification (Étapes Simples)**

### **Méthode 1 : Script Automatique**

```bash
# 1. Lancer le script
node create-notification-example.js

# 2. Le script fait automatiquement :
#    - Se connecte à Supabase
#    - Trouve un utilisateur
#    - Crée 5 notifications de test
#    - Les insère dans la base de données
```

### **Méthode 2 : Fonction JavaScript**

```javascript
// 1. Importer la fonction
import { createMaintenanceNotification } from '../utils/proApi';

// 2. Appeler la fonction
await createMaintenanceNotification(
    'equipment-123',     // ID de l'équipement
    'Pelle CAT',         // Nom de l'équipement
    '15/01/2024',        // Date de maintenance
    'urgent'             // Priorité
);

// 3. La fonction fait automatiquement :
//    - Récupère l'utilisateur connecté
//    - Prépare les données
//    - Insère dans la base de données
```

---

## 🎯 **Exemples Concrets**

### **Exemple 1 : Notification de Maintenance**

#### **Données Créées :**
```json
{
    "id": "uuid-123",
    "client_id": "client-456",
    "user_id": "user-789",
    "type": "maintenance_due",
    "title": "Maintenance préventive - Pelle CAT",
    "message": "La maintenance préventive de l'équipement Pelle CAT est programmée pour le 15/01/2024",
    "is_read": false,
    "priority": "urgent",
    "related_entity_type": "equipment",
    "related_entity_id": "cat-001",
    "created_at": "2024-01-10T10:30:00Z"
}
```

#### **Affichage dans l'Interface :**
```
🔴 🔧 Maintenance préventive - Pelle CAT
   La maintenance préventive de l'équipement Pelle CAT est programmée pour le 15/01/2024
   [Nouveau] [✓] [👁️] [ℹ️]
```

### **Exemple 2 : Notification de Commande**

#### **Données Créées :**
```json
{
    "id": "uuid-456",
    "client_id": "client-456",
    "user_id": "user-789",
    "type": "order_update",
    "title": "Commande CMD-001 - Livrée",
    "message": "Votre commande CMD-001 a été mise à jour avec le statut: Livrée",
    "is_read": false,
    "priority": "normal",
    "related_entity_type": "order",
    "related_entity_id": "cmd-001",
    "created_at": "2024-01-10T11:00:00Z"
}
```

#### **Affichage dans l'Interface :**
```
🔵 📦 Commande CMD-001 - Livrée
   Votre commande CMD-001 a été mise à jour avec le statut: Livrée
   [Nouveau] [✓] [👁️] [ℹ️]
```

---

## 🔄 **Flux Complet Visuel**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SCRIPT/FONCTION│───▶│  BASE DE DONNÉES │───▶│   INTERFACE     │
│                 │    │                 │    │                 │
│ 1. Préparer     │    │ 2. Insérer      │    │ 3. Afficher     │
│    les données  │    │    les données  │    │    les données  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ {               │    │ client_notifications │    │ 🔴 🔧 Maintenance │
│   type: "maintenance", │    │                 │    │    urgente      │
│   title: "Maintenance", │    │                 │    │                 │
│   priority: "urgent" │    │                 │    │ [Nouveau] [✓]    │
│ }               │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎉 **Résumé en Une Phrase**

**Les notifications sont créées en insérant des données dans une table de base de données, puis elles s'affichent automatiquement dans l'interface utilisateur.** 