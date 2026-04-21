// create-notification-example.js
// Script pour créer des notifications de test dans l'Espace Pro

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 Ajoutez ces variables dans votre fichier .env ou définissez-les dans votre terminal');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNotifications() {
  try {
    console.log('🚀 Création de notifications de test...');
    
    // Récupérer un utilisateur et son profil Pro
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const user = users[0];
    console.log('👤 Utilisateur trouvé:', user.email);
    
    // Récupérer le profil Pro de l'utilisateur
    const { data: proProfile, error: proError } = await supabase
      .from('pro_clients')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (proError || !proProfile) {
      console.error('❌ Profil Pro non trouvé pour l\'utilisateur');
      console.log('💡 Créez d\'abord un profil Pro pour cet utilisateur');
      return;
    }
    
    console.log('🏢 Profil Pro trouvé:', proProfile.id);
    
    // Notifications de test à créer
    const testNotifications = [
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'maintenance_due',
        title: 'Maintenance préventive urgente',
        message: 'La maintenance préventive de l\'équipement CAT-2024-001 est programmée pour demain. Veuillez planifier l\'intervention.',
        is_read: false,
        priority: 'urgent',
        related_entity_type: 'equipment',
        related_entity_id: 'cat-2024-001'
      },
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'order_update',
        title: 'Commande livrée avec succès',
        message: 'Votre commande CMD-2024-015 a été livrée à l\'adresse indiquée. Merci de confirmer la réception.',
        is_read: false,
        priority: 'normal',
        related_entity_type: 'order',
        related_entity_id: 'cmd-2024-015'
      },
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'diagnostic_alert',
        title: 'Anomalie détectée sur équipement',
        message: 'Le diagnostic automatique a détecté une anomalie sur l\'équipement KOM-2024-003. Intervention recommandée.',
        is_read: false,
        priority: 'high',
        related_entity_type: 'equipment',
        related_entity_id: 'kom-2024-003'
      },
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'warranty_expiry',
        title: 'Garantie expire dans 30 jours',
        message: 'La garantie de l\'équipement VOL-2023-008 expire le 15/02/2024. Pensez à renouveler si nécessaire.',
        is_read: true,
        priority: 'normal',
        related_entity_type: 'equipment',
        related_entity_id: 'vol-2023-008'
      },
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'maintenance_due',
        title: 'Maintenance périodique',
        message: 'La maintenance périodique de l\'équipement HIT-2024-002 est prévue pour la semaine prochaine.',
        is_read: false,
        priority: 'normal',
        related_entity_type: 'equipment',
        related_entity_id: 'hit-2024-002'
      }
    ];
    
    console.log('📝 Insertion de', testNotifications.length, 'notifications...');
    
    // Insérer les notifications
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('client_notifications')
      .insert(testNotifications)
      .select();
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des notifications:', insertError);
      return;
    }
    
    console.log('✅ Notifications créées avec succès !');
    console.log('');
    console.log('📊 Récapitulatif des notifications créées:');
    
    insertedNotifications.forEach((notification, index) => {
      const priorityIcon = {
        'urgent': '🔴',
        'high': '🟡', 
        'normal': '🔵',
        'low': '⚪'
      }[notification.priority];
      
      const typeIcon = {
        'maintenance_due': '🔧',
        'order_update': '📦',
        'diagnostic_alert': '⚠️',
        'warranty_expiry': '🛡️'
      }[notification.type];
      
      console.log(`${index + 1}. ${priorityIcon} ${typeIcon} ${notification.title}`);
      console.log(`   ${notification.message.substring(0, 60)}...`);
      console.log(`   Statut: ${notification.is_read ? '✅ Lu' : '🆕 Non lu'}`);
      console.log('');
    });
    
    // Compter les notifications
    const { count, error: countError } = await supabase
      .from('client_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', proProfile.id);
    
    if (!countError) {
      console.log(`📈 Total des notifications pour ce client: ${count}`);
    }
    
    console.log('');
    console.log('🎉 Pour voir vos notifications:');
    console.log('1. Allez sur l\'Espace Pro (#pro)');
    console.log('2. Cliquez sur l\'onglet "Notifications"');
    console.log('3. Testez toutes les actions (marquer comme lu, voir détails, etc.)');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des notifications:', error);
  }
}

// Fonction pour créer une notification spécifique
async function createSpecificNotification(type, title, message, priority = 'normal', entityType = null, entityId = null) {
  try {
    console.log(`🚀 Création d'une notification spécifique: ${title}`);
    
    // Récupérer un utilisateur et son profil Pro
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const user = users[0];
    
    // Récupérer le profil Pro de l'utilisateur
    const { data: proProfile, error: proError } = await supabase
      .from('pro_clients')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (proError || !proProfile) {
      console.error('❌ Profil Pro non trouvé');
      return;
    }
    
    // Créer la notification
    const notification = {
      client_id: proProfile.id,
      user_id: user.id,
      type: type,
      title: title,
      message: message,
      is_read: false,
      priority: priority,
      related_entity_type: entityType,
      related_entity_id: entityId
    };
    
    const { data, error } = await supabase
      .from('client_notifications')
      .insert([notification])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      return;
    }
    
    console.log('✅ Notification créée avec succès !');
    console.log(`📝 ID: ${data.id}`);
    console.log(`📋 Titre: ${data.title}`);
    console.log(`📊 Priorité: ${data.priority}`);
    console.log(`📅 Créée le: ${new Date(data.created_at).toLocaleString('fr-FR')}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exemples d'utilisation
async function showExamples() {
  console.log('📚 Exemples d\'utilisation:');
  console.log('');
  console.log('1. Créer toutes les notifications de test:');
  console.log('   node create-notification-example.js');
  console.log('');
  console.log('2. Créer une notification spécifique:');
  console.log('   await createSpecificNotification(');
  console.log('     "maintenance_due",');
  console.log('     "Maintenance urgente",');
  console.log('     "Votre équipement nécessite une maintenance immédiate",');
  console.log('     "urgent",');
  console.log('     "equipment",');
  console.log('     "equipment-123"');
  console.log('   );');
  console.log('');
  console.log('3. Types de notifications disponibles:');
  console.log('   - "maintenance_due" (🔧)');
  console.log('   - "order_update" (📦)');
  console.log('   - "diagnostic_alert" (⚠️)');
  console.log('   - "warranty_expiry" (🛡️)');
  console.log('');
  console.log('4. Priorités disponibles:');
  console.log('   - "urgent" (🔴)');
  console.log('   - "high" (🟡)');
  console.log('   - "normal" (🔵)');
  console.log('   - "low" (⚪)');
}

// Exécuter le script
if (process.argv.includes('--examples')) {
  showExamples();
} else if (process.argv.includes('--specific')) {
  // Exemple de création d'une notification spécifique
  createSpecificNotification(
    'maintenance_due',
    'Maintenance programmée',
    'Votre équipement nécessite une maintenance préventive',
    'normal',
    'equipment',
    'demo-equipment-001'
  );
} else {
  createTestNotifications();
} 