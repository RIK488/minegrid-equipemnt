# 🚀 GUIDE COMPLET - CRÉATION DE NOTIFICATIONS

## 📋 **Vue d'ensemble**

Il existe **plusieurs façons** de créer des notifications dans l'Espace Pro :

### 🎯 **Méthodes de Création**

1. **🔧 Script Automatique** - Création en masse de notifications de test
2. **📝 API Programmatique** - Création via code JavaScript/TypeScript
3. **🎨 Interface Utilisateur** - Création manuelle (à implémenter)
4. **🤖 Système Automatique** - Notifications déclenchées par des événements

---

## 🛠️ **Méthode 1 : Script Automatique (Recommandé pour les Tests)**

### **Étape 1 : Préparer l'environnement**

```bash
# Vérifier que vous avez les variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Si elles ne sont pas définies, les ajouter dans .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Étape 2 : Créer des notifications de test**

```bash
# Créer toutes les notifications de test
node create-notification-example.js

# Voir les exemples d'utilisation
node create-notification-example.js --examples

# Créer une notification spécifique
node create-notification-example.js --specific
```

### **Résultats Attendus :**

```
🚀 Création de notifications de test...
👤 Utilisateur trouvé: user@example.com
🏢 Profil Pro trouvé: 123e4567-e89b-12d3-a456-426614174000
📝 Insertion de 5 notifications...

✅ Notifications créées avec succès !

📊 Récapitulatif des notifications créées:
1. 🔴 🔧 Maintenance préventive urgente
   La maintenance préventive de l'équipement CAT-2024-001...
   Statut: 🆕 Non lu

2. 🔵 📦 Commande livrée avec succès
   Votre commande CMD-2024-015 a été livrée...
   Statut: 🆕 Non lu

3. 🟡 ⚠️ Anomalie détectée sur équipement
   Le diagnostic automatique a détecté une anomalie...
   Statut: 🆕 Non lu

4. 🔵 🛡️ Garantie expire dans 30 jours
   La garantie de l'équipement VOL-2023-008 expire...
   Statut: ✅ Lu

5. 🔵 🔧 Maintenance périodique
   La maintenance périodique de l'équipement HIT-2024-002...
   Statut: 🆕 Non lu

📈 Total des notifications pour ce client: 8

🎉 Pour voir vos notifications:
1. Allez sur l'Espace Pro (#pro)
2. Cliquez sur l'onglet "Notifications"
3. Testez toutes les actions
```

---

## 📝 **Méthode 2 : API Programmatique**

### **Import des Fonctions**

```typescript
import { 
  createClientNotification,
  createMaintenanceNotification,
  createOrderNotification,
  createDiagnosticAlertNotification,
  createWarrantyExpiryNotification
} from '../utils/proApi';
```

### **Exemple 1 : Notification de Maintenance**

```typescript
// Créer une notification de maintenance urgente
const notification = await createMaintenanceNotification(
  'equipment-123',
  'Pelle mécanique CAT 320',
  '15/01/2024',
  'urgent'
);

if (notification) {
  console.log('✅ Notification de maintenance créée:', notification.title);
}
```

### **Exemple 2 : Notification de Commande**

```typescript
// Créer une notification de mise à jour de commande
const notification = await createOrderNotification(
  'order-456',
  'CMD-2024-001',
  'Livrée',
  'normal'
);

if (notification) {
  console.log('✅ Notification de commande créée:', notification.title);
}
```

### **Exemple 3 : Alerte Diagnostic**

```typescript
// Créer une alerte diagnostic
const notification = await createDiagnosticAlertNotification(
  'equipment-789',
  'Chargeur frontal VOLVO',
  'Température moteur anormalement élevée',
  'high'
);

if (notification) {
  console.log('✅ Alerte diagnostic créée:', notification.title);
}
```

### **Exemple 4 : Expiration de Garantie**

```typescript
// Créer une notification d'expiration de garantie
const notification = await createWarrantyExpiryNotification(
  'equipment-101',
  'Excavatrice KOMATSU',
  '20/02/2024',
  15, // 15 jours avant expiration
  'high'
);

if (notification) {
  console.log('✅ Notification de garantie créée:', notification.title);
}
```

### **Exemple 5 : Notification Personnalisée**

```typescript
// Créer une notification complètement personnalisée
const notification = await createClientNotification({
  type: 'maintenance_due',
  title: 'Intervention spéciale requise',
  message: 'Votre équipement nécessite une intervention spéciale suite à l\'inspection technique.',
  priority: 'urgent',
  related_entity_type: 'equipment',
  related_entity_id: 'special-equipment-001'
});

if (notification) {
  console.log('✅ Notification personnalisée créée:', notification.title);
}
```

---

## 🎨 **Méthode 3 : Interface Utilisateur (À Implémenter)**

### **Bouton "Créer une Notification"**

```typescript
// Dans ProDashboard.tsx - Ajouter un bouton dans NotificationsTab
const [showCreateModal, setShowCreateModal] = useState(false);

// Bouton pour créer une notification
<button
  onClick={() => setShowCreateModal(true)}
  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
>
  + Créer une notification
</button>
```

### **Modal de Création**

```typescript
// Modal pour créer une notification
{showCreateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">Créer une notification</h3>
      
      <form onSubmit={handleCreateNotification}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select 
              value={notificationType} 
              onChange={(e) => setNotificationType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="maintenance_due">Maintenance</option>
              <option value="order_update">Commande</option>
              <option value="diagnostic_alert">Diagnostic</option>
              <option value="warranty_expiry">Garantie</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300"
              placeholder="Titre de la notification"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300"
              rows={3}
              placeholder="Message détaillé"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Priorité</label>
            <select 
              value={notificationPriority} 
              onChange={(e) => setNotificationPriority(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

---

## 🤖 **Méthode 4 : Système Automatique**

### **Déclencheurs Automatiques**

```typescript
// Exemple : Notification automatique lors de la création d'une maintenance
export async function handleMaintenanceCreated(maintenance: MaintenanceIntervention) {
  // Calculer la date de maintenance
  const maintenanceDate = new Date(maintenance.scheduled_date);
  const today = new Date();
  const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Déterminer la priorité selon l'urgence
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
  if (daysUntilMaintenance <= 1) priority = 'urgent';
  else if (daysUntilMaintenance <= 7) priority = 'high';
  else if (daysUntilMaintenance <= 30) priority = 'normal';
  else priority = 'low';
  
  // Créer la notification
  await createMaintenanceNotification(
    maintenance.equipment_id,
    `Équipement ${maintenance.equipment_id}`,
    maintenance.scheduled_date,
    priority
  );
}

// Exemple : Notification automatique lors de la mise à jour d'une commande
export async function handleOrderStatusChanged(order: ClientOrder) {
  await createOrderNotification(
    order.id,
    order.order_number,
    order.status,
    order.status === 'delivered' ? 'normal' : 'low'
  );
}

// Exemple : Vérification quotidienne des garanties
export async function checkWarrantyExpiry() {
  const equipment = await getClientEquipment();
  const today = new Date();
  
  for (const item of equipment) {
    if (item.warranty_end) {
      const warrantyDate = new Date(item.warranty_end);
      const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Notifier si la garantie expire dans moins de 30 jours
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        await createWarrantyExpiryNotification(
          item.id,
          `${item.brand} ${item.model}`,
          item.warranty_end,
          daysUntilExpiry
        );
      }
    }
  }
}
```

---

## 📊 **Types de Notifications Disponibles**

### **🔧 Maintenance Due**
- **Type** : `maintenance_due`
- **Utilisation** : Notifications de maintenance préventive
- **Priorités** : Normalement `normal` ou `high`
- **Entité liée** : `equipment`

### **📦 Order Update**
- **Type** : `order_update`
- **Utilisation** : Mises à jour de commandes
- **Priorités** : Normalement `low` ou `normal`
- **Entité liée** : `order`

### **⚠️ Diagnostic Alert**
- **Type** : `diagnostic_alert`
- **Utilisation** : Alertes de diagnostic d'équipement
- **Priorités** : Normalement `high` ou `urgent`
- **Entité liée** : `equipment`

### **🛡️ Warranty Expiry**
- **Type** : `warranty_expiry`
- **Utilisation** : Expiration de garanties
- **Priorités** : Selon l'urgence (7 jours = urgent, 30 jours = high)
- **Entité liée** : `equipment`

---

## 🎯 **Priorités et Codes Couleur**

### **🔴 Urgent**
- **Utilisation** : Interventions immédiates requises
- **Exemples** : Maintenance urgente, panne critique
- **Action** : Intervention immédiate

### **🟡 High**
- **Utilisation** : Actions importantes à planifier
- **Exemples** : Maintenance dans la semaine, alerte diagnostic
- **Action** : Planification rapide

### **🔵 Normal**
- **Utilisation** : Informations importantes
- **Exemples** : Maintenance programmée, commande livrée
- **Action** : Suivi normal

### **⚪ Low**
- **Utilisation** : Informations générales
- **Exemples** : Mises à jour de statut, informations
- **Action** : Prise de connaissance

---

## 🧪 **Tests et Validation**

### **Test de Création**

```bash
# 1. Créer des notifications de test
node create-notification-example.js

# 2. Vérifier dans l'interface
# Aller sur #pro → Notifications

# 3. Tester les actions
# - Marquer comme lu
# - Voir les détails
# - Navigation vers entité
```

### **Validation des Résultats**

- ✅ **Notifications s'affichent** dans l'interface
- ✅ **Code couleur** correspond à la priorité
- ✅ **Icônes** correspondent au type
- ✅ **Actions fonctionnent** (marquer comme lu, etc.)
- ✅ **Navigation** vers les entités liées

---

## 🔧 **Dépannage**

### **Problème : "Aucun utilisateur trouvé"**
**Solution :**
```bash
# Vérifier qu'il y a des utilisateurs dans user_profiles
SELECT COUNT(*) FROM user_profiles;

# Créer un utilisateur de test si nécessaire
```

### **Problème : "Profil Pro non trouvé"**
**Solution :**
```bash
# Vérifier qu'il y a des profils Pro
SELECT COUNT(*) FROM pro_clients;

# Créer un profil Pro si nécessaire
```

### **Problème : "Erreur d'insertion"**
**Solution :**
```bash
# Vérifier que la table existe
SELECT * FROM client_notifications LIMIT 1;

# Vérifier les politiques RLS
SHOW TABLES LIKE 'client_notifications';
```

---

## 🎉 **Conclusion**

Vous avez maintenant **4 méthodes** pour créer des notifications :

1. **🔧 Script automatique** - Pour les tests et la démonstration
2. **📝 API programmatique** - Pour l'intégration dans le code
3. **🎨 Interface utilisateur** - Pour la création manuelle (à implémenter)
4. **🤖 Système automatique** - Pour les notifications déclenchées

**🚀 Commencez par le script automatique pour tester, puis utilisez l'API programmatique pour l'intégration !** 