// Script pour créer des données réelles pour le portail pro
console.log("🚀 CRÉATION DE DONNÉES RÉELLES POUR LE PORTAL PRO");

async function createRealDataForPortalPro() {
  try {
    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ Utilisateur non connecté");
      return;
    }
    console.log("✅ Utilisateur connecté:", user.id);

    // 2. Créer un profil Pro si nécessaire
    console.log("🔄 Création du profil Pro...");
    const { data: proProfile, error: profileError } = await supabase
      .from('pro_clients')
      .upsert({
        user_id: user.id,
        company_name: 'Entreprise Test Pro',
        subscription_type: 'pro',
        subscription_status: 'active',
        subscription_start: new Date().toISOString(),
        max_users: 5
      })
      .select()
      .single();

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error("❌ Erreur création profil Pro:", profileError);
      return;
    }

    console.log("✅ Profil Pro créé/récupéré:", proProfile?.company_name);

    // 3. Créer des équipements Pro
    console.log("🔄 Création d'équipements Pro...");
    const proEquipment = [
      {
        client_id: proProfile.id,
        serial_number: 'PRO-001',
        qr_code: 'MINE-PRO-001-' + Date.now(),
        equipment_type: 'Pelle hydraulique',
        brand: 'CAT',
        model: '320D',
        year: 2020,
        location: 'Site principal',
        status: 'active',
        purchase_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        warranty_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        total_hours: 2500,
        fuel_consumption: 15.5
      },
      {
        client_id: proProfile.id,
        serial_number: 'PRO-002',
        qr_code: 'MINE-PRO-002-' + Date.now(),
        equipment_type: 'Chargeur frontal',
        brand: 'Volvo',
        model: 'L120H',
        year: 2021,
        location: 'Site secondaire',
        status: 'maintenance',
        purchase_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        warranty_end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        total_hours: 1800,
        fuel_consumption: 12.8
      },
      {
        client_id: proProfile.id,
        serial_number: 'PRO-003',
        qr_code: 'MINE-PRO-003-' + Date.now(),
        equipment_type: 'Bulldozer',
        brand: 'Komatsu',
        model: 'D65',
        year: 2019,
        location: 'Zone d\'extraction',
        status: 'active',
        purchase_date: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
        warranty_end: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        total_hours: 3200,
        fuel_consumption: 18.2
      }
    ];

    const { data: newProEquipment, error: proEquipmentError } = await supabase
      .from('client_equipment')
      .upsert(proEquipment, { onConflict: 'serial_number' })
      .select();

    if (proEquipmentError) {
      console.error("❌ Erreur création équipements Pro:", proEquipmentError);
    } else {
      console.log("✅ Équipements Pro créés:", newProEquipment?.length || 0);
    }

    // 4. Créer des annonces d'équipements
    console.log("🔄 Création d'annonces d'équipements...");
    const userMachines = [
      {
        name: 'Excavatrice Hitachi ZX200',
        brand: 'Hitachi',
        model: 'ZX200',
        category: 'Excavatrice',
        year: 2019,
        price: '95000',
        condition: 'used',
        description: 'Excavatrice Hitachi ZX200, 1800h, très bon état',
        sellerid: user.id
      },
      {
        name: 'Chargeur Volvo L120',
        brand: 'Volvo',
        model: 'L120',
        category: 'Chargeur',
        year: 2021,
        price: '75000',
        condition: 'used',
        description: 'Chargeur Volvo L120, 1500h, état neuf',
        sellerid: user.id
      },
      {
        name: 'Bouteur CAT D6',
        brand: 'Caterpillar',
        model: 'D6',
        category: 'Bouteur',
        year: 2020,
        price: '85000',
        condition: 'used',
        description: 'Bouteur Caterpillar D6 en excellent état, 2000h',
        sellerid: user.id
      }
    ];

    const { data: newUserMachines, error: userMachinesError } = await supabase
      .from('machines')
      .upsert(userMachines, { onConflict: 'name' })
      .select();

    if (userMachinesError) {
      console.error("❌ Erreur création annonces:", userMachinesError);
    } else {
      console.log("✅ Annonces créées:", newUserMachines?.length || 0);
    }

    // 5. Créer des commandes
    console.log("🔄 Création de commandes...");
    const orders = [
      {
        client_id: proProfile.id,
        order_number: 'CMD-001',
        order_type: 'purchase',
        status: 'pending',
        total_amount: 125000,
        currency: 'EUR',
        order_date: new Date().toISOString(),
        expected_delivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Commande de pièces détachées'
      },
      {
        client_id: proProfile.id,
        order_number: 'CMD-002',
        order_type: 'maintenance',
        status: 'confirmed',
        total_amount: 8500,
        currency: 'EUR',
        order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Maintenance préventive'
      }
    ];

    const { data: newOrders, error: ordersError } = await supabase
      .from('client_orders')
      .upsert(orders, { onConflict: 'order_number' })
      .select();

    if (ordersError) {
      console.error("❌ Erreur création commandes:", ordersError);
    } else {
      console.log("✅ Commandes créées:", newOrders?.length || 0);
    }

    // 6. Créer des interventions de maintenance
    console.log("🔄 Création d'interventions de maintenance...");
    const interventions = [
      {
        client_id: proProfile.id,
        equipment_id: newProEquipment?.[0]?.id || 'test-id',
        intervention_type: 'preventive',
        status: 'scheduled',
        priority: 'normal',
        description: 'Maintenance préventive trimestrielle',
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration_hours: 8,
        technician_name: 'Jean Dupont',
        cost: 1200
      },
      {
        client_id: proProfile.id,
        equipment_id: newProEquipment?.[1]?.id || 'test-id',
        intervention_type: 'corrective',
        status: 'in_progress',
        priority: 'high',
        description: 'Réparation système hydraulique',
        scheduled_date: new Date().toISOString(),
        actual_date: new Date().toISOString(),
        duration_hours: 12,
        technician_name: 'Pierre Martin',
        cost: 2500
      }
    ];

    const { data: newInterventions, error: interventionsError } = await supabase
      .from('maintenance_interventions')
      .upsert(interventions, { onConflict: 'id' })
      .select();

    if (interventionsError) {
      console.error("❌ Erreur création interventions:", interventionsError);
    } else {
      console.log("✅ Interventions créées:", newInterventions?.length || 0);
    }

    // 7. Créer des notifications
    console.log("🔄 Création de notifications...");
    const notifications = [
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'maintenance_due',
        title: 'Maintenance prévue',
        message: 'Maintenance préventive prévue dans 3 jours pour l\'équipement PRO-001',
        is_read: false,
        priority: 'normal'
      },
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'warranty_expiry',
        title: 'Garantie expirée',
        message: 'La garantie de l\'équipement PRO-003 a expiré',
        is_read: false,
        priority: 'high'
      },
      {
        client_id: proProfile.id,
        user_id: user.id,
        type: 'order_update',
        title: 'Commande confirmée',
        message: 'Votre commande CMD-002 a été confirmée',
        is_read: true,
        priority: 'normal'
      }
    ];

    const { data: newNotifications, error: notificationsError } = await supabase
      .from('client_notifications')
      .upsert(notifications, { onConflict: 'id' })
      .select();

    if (notificationsError) {
      console.error("❌ Erreur création notifications:", notificationsError);
    } else {
      console.log("✅ Notifications créées:", newNotifications?.length || 0);
    }

    // 8. Vérifier les statistiques
    console.log("🔄 Vérification des statistiques...");
    
    // Simuler le calcul des stats comme dans getPortalStats
    const [equipmentData, userMachinesData, ordersData, interventionsData, notificationsData] = await Promise.all([
      supabase.from('client_equipment').select('*').eq('client_id', proProfile.id),
      supabase.from('machines').select('*').eq('sellerid', user.id),
      supabase.from('client_orders').select('*').eq('client_id', proProfile.id),
      supabase.from('maintenance_interventions').select('*').eq('client_id', proProfile.id),
      supabase.from('client_notifications').select('*').eq('client_id', proProfile.id)
    ]);

    const totalEquipment = (equipmentData.data?.length || 0) + (userMachinesData.data?.length || 0);
    const pendingOrders = ordersData.data?.filter(o => o.status === 'pending').length || 0;
    const upcomingInterventions = interventionsData.data?.filter(i => 
      i.status === 'scheduled' && new Date(i.scheduled_date) > new Date()
    ).length || 0;
    const unreadNotifications = notificationsData.data?.filter(n => !n.is_read).length || 0;

    console.log("📊 Statistiques calculées:");
    console.log(`  - Équipements totaux: ${totalEquipment}`);
    console.log(`  - Commandes en attente: ${pendingOrders}`);
    console.log(`  - Interventions à venir: ${upcomingInterventions}`);
    console.log(`  - Notifications non lues: ${unreadNotifications}`);

    console.log("✅ Données réelles créées avec succès !");
    console.log("🔄 Rechargez la page du portail pro pour voir les changements");

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Exécuter le script
createRealDataForPortalPro();

// Exposer la fonction pour les tests manuels
window.createRealDataForPortalPro = createRealDataForPortalPro; 