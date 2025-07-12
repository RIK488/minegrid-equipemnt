import supabase from './supabaseClient';

// Types pour les données
interface Intervention {
  id: string;
  name: string;
  equipment_name: string;
  technician_name: string;
  status: string;
  priority: string;
  description: string;
  estimated_duration: number;
  scheduled_date: string;
  completed_date?: string;
}

interface Repair {
  id: string;
  equipment_name: string;
  technician_name: string;
  status: string;
  problem_description: string;
  estimated_duration: number;
  estimated_cost: number;
}

interface InventoryItem {
  id: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string;
  max_workload_hours: number;
  current_workload_hours: number;
  efficiency_rating: number;
  availability_status: string;
}

interface Task {
  id: string;
  technician_id: string;
  estimated_hours: number;
  status: string;
}

// =====================================================
// APIs POUR LES WIDGETS MÉCANICIEN
// =====================================================

// 🔧 WIDGET "INTERVENTIONS DU JOUR"
export async function getDailyInterventions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('interventions')
    .select('status')
    .gte('intervention_date', today.toISOString())
    .lt('intervention_date', tomorrow.toISOString());

  if (error) {
    console.error('Erreur lors de la récupération des interventions du jour:', error);
    return null;
  }

  const completed = data.filter(i => i.status === 'Terminé').length;
  const pending = data.filter(i => i.status !== 'Terminé').length;
  
  return [
    { name: 'Terminé', value: completed },
    { name: 'En attente', value: pending },
  ];
}

// 🔧 WIDGET "ÉTAT DES RÉPARATIONS"
export const getRepairsStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .not('status', 'eq', 'Terminé')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((repair: Repair) => ({
      id: repair.id,
      equipment: repair.equipment_name,
      technician: repair.technician_name,
      status: repair.status,
      estimated: `${repair.estimated_duration}h`,
      problem: repair.problem_description,
      cost: repair.estimated_cost
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des réparations:', error);
    return [];
  }
};

export const updateRepairStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .update({ 
        status,
        completion_date: status === 'Terminé' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }
};

export const assignTechnicianToRepair = async (repairId: string, technicianId: string, technicianName: string) => {
  try {
    const { data, error } = await supabase
      .from('repairs')
      .update({ 
        technician_id: technicianId,
        technician_name: technicianName
      })
      .eq('id', repairId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    throw error;
  }
};

// 🔧 WIDGET "STOCK PIÈCES DÉTACHÉES"
export const getInventoryStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    return data.map((item: InventoryItem) => ({
      category: item.category,
      stock: item.current_stock,
      min: item.minimum_stock,
      unit_price: item.unit_price,
      supplier: item.supplier,
      needs_restock: item.current_stock < item.minimum_stock
    }));
  } catch (error) {
    console.error('Erreur lors du chargement du stock:', error);
    return [];
  }
};

export const updateInventoryStock = async (id: string, newStock: number) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        current_stock: newStock,
        last_restock_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    throw error;
  }
};

export const createStockOrder = async (order: {
  inventory_id: string;
  quantity: number;
  unit_price: number;
  supplier: string;
  expected_delivery_date: string;
}) => {
  try {
    const total_price = order.quantity * order.unit_price;
    
    const { data, error } = await supabase
      .from('stock_orders')
      .insert([{ ...order, total_price }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de commande:', error);
    throw error;
  }
};

// 🔧 WIDGET "CHARGE DE TRAVAIL"
export const getTechniciansWorkload = async () => {
  try {
    const { data: technicians, error: techError } = await supabase
      .from('technicians')
      .select('*')
      .order('name', { ascending: true });

    if (techError) throw techError;

    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .not('status', 'eq', 'Terminé');

    if (taskError) throw taskError;

    // Calculer la charge de travail pour chaque technicien
    const workloadData = technicians.map((tech: Technician) => {
      const techTasks = tasks.filter((task: Task) => task.technician_id === tech.id);
      const totalHours = techTasks.reduce((sum: number, task: Task) => sum + (task.estimated_hours || 0), 0);
      const workloadPercentage = (totalHours / tech.max_workload_hours) * 100;

      return {
        id: tech.id,
        name: tech.name,
        specialization: tech.specialization,
        current_hours: totalHours,
        max_hours: tech.max_workload_hours,
        workload_percentage: Math.min(workloadPercentage, 100),
        efficiency: tech.efficiency_rating,
        status: tech.availability_status,
        tasks_count: techTasks.length
      };
    });

    return workloadData;
  } catch (error) {
    console.error('Erreur lors du chargement de la charge de travail:', error);
    return [];
  }
};

export const getTechnicianTasks = async (technicianId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('technician_id', technicianId)
      .not('status', 'eq', 'Terminé')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error);
    return [];
  }
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status,
        completed_date: status === 'Terminé' ? new Date().toISOString() : null
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    throw error;
  }
};

// 🔧 FONCTIONS UTILITAIRES
export const getTechnicians = async () => {
  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('id, name, specialization, availability_status')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des techniciens:', error);
    return [];
  }
};

export const getEquipmentList = async () => {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement de la liste des équipements:', error);
    return [];
  }
};

// 🔧 NOTIFICATIONS ET ALERTES
export const getStockAlerts = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lt('current_stock', 'minimum_stock');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des alertes stock:', error);
    return [];
  }
};

export const getUrgentInterventions = async () => {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .eq('priority', 'Urgente')
      .not('status', 'eq', 'Terminé')
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des interventions urgentes:', error);
    return [];
  }
};

// 🔧 STATISTIQUES GLOBALES
export const getMechanicStats = async () => {
  try {
    // Interventions du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayInterventions } = await supabase
      .from('interventions')
      .select('status')
      .gte('scheduled_date', today.toISOString());

    // Réparations en cours
    const { data: activeRepairs } = await supabase
      .from('repairs')
      .select('status, estimated_cost')
      .not('status', 'eq', 'Terminé');

    // Stock critique
    const { data: criticalStock } = await supabase
      .from('inventory')
      .select('*')
      .lt('current_stock', 'minimum_stock');

    // Techniciens disponibles
    const { data: availableTechnicians } = await supabase
      .from('technicians')
      .select('availability_status')
      .eq('availability_status', 'Disponible');

    return {
      todayInterventions: todayInterventions?.length || 0,
      completedToday: todayInterventions?.filter((i: any) => i.status === 'Terminé').length || 0,
      activeRepairs: activeRepairs?.length || 0,
      totalRepairCost: activeRepairs?.reduce((sum: number, r: any) => sum + (r.estimated_cost || 0), 0) || 0,
      criticalStockItems: criticalStock?.length || 0,
      availableTechnicians: availableTechnicians?.length || 0
    };
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    return {
      todayInterventions: 0,
      completedToday: 0,
      activeRepairs: 0,
      totalRepairCost: 0,
      criticalStockItems: 0,
      availableTechnicians: 0
    };
  }
};

export async function getInterventionsByStatus(status: 'Terminé' | 'En attente' | 'En cours') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('interventions')
    .select(`
      id,
      description,
      status,
      priority,
      intervention_date,
      equipment:machines ( name ),
      technician:technicians ( name )
    `)
    .eq('status', status)
    .gte('intervention_date', today.toISOString())
    .lt('intervention_date', tomorrow.toISOString());

  if (error) {
    console.error(`Erreur lors de la récupération des interventions (${status}):`, error);
    return [];
  }

  return data;
}

export async function createIntervention(interventionData: {
  equipment_id: string;
  description: string;
  technician_id?: string;
  intervention_date: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

  const { data, error } = await supabase
    .from('interventions')
    .insert([
      {
        ...interventionData,
        status: 'En attente',
        created_by: userData.user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    throw error;
  }
  return data;
}

// =====================================================
// APIs POUR LES WIDGETS LOUEUR
// =====================================================

// 📊 WIDGET "REVENUS DE LOCATION"
export async function getRentalRevenue() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  try {
    // Revenus du mois en cours
    const { data: currentMonthData, error: currentMonthError } = await supabase
      .from('rentals')
      .select('total_price')
      .gte('start_date', startOfMonth.toISOString())
      .lte('start_date', endOfMonth.toISOString());

    if (currentMonthError) throw currentMonthError;

    const currentRevenue = currentMonthData.reduce((sum, item) => sum + item.total_price, 0);
    const rentalCount = currentMonthData.length;

    // Revenus du mois précédent pour calculer la croissance
    const { data: lastMonthData, error: lastMonthError } = await supabase
      .from('rentals')
      .select('total_price')
      .gte('start_date', startOfLastMonth.toISOString())
      .lte('start_date', endOfLastMonth.toISOString());

    if (lastMonthError) throw lastMonthError;
    
    const lastRevenue = lastMonthData.reduce((sum, item) => sum + item.total_price, 0);
    
    let growth = 0;
    if (lastRevenue > 0) {
      growth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } else if (currentRevenue > 0) {
      growth = 100; // Si pas de revenu le mois dernier, la croissance est de 100%
    }

    return {
      revenue: currentRevenue,
      count: rentalCount,
      growth: parseFloat(growth.toFixed(1))
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des revenus de location:', error);
    return { revenue: 0, count: 0, growth: 0 };
  }
}

// 📈 WIDGET "DISPONIBILITÉ ÉQUIPEMENTS" - AMÉLIORÉ
export async function getEquipmentAvailability() {
  try {
    console.log('[DEBUG] Début de getEquipmentAvailability()');
    
    // Récupérer tous les équipements avec plus d'informations
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, brand, model, condition, year, price');

    console.log('[DEBUG] Machines récupérées:', machines?.length || 0, 'machines');
    if (machinesError) {
      console.error('[DEBUG] Erreur machines:', machinesError);
      throw machinesError;
    }

    // Récupérer les locations actives
    const { data: activeRentals, error: rentalsError } = await supabase
      .from('rentals')
      .select('equipment_id, start_date, end_date, status')
      .in('status', ['En cours', 'Confirmée', 'Prête']);

    console.log('[DEBUG] Locations actives récupérées:', activeRentals?.length || 0, 'locations');
    if (rentalsError) {
      console.error('[DEBUG] Erreur locations:', rentalsError);
      throw rentalsError;
    }

    // Récupérer les interventions en cours (maintenance)
    const { data: activeInterventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('equipment_id, status, scheduled_date')
      .in('status', ['En cours', 'En attente']);

    console.log('[DEBUG] Interventions actives récupérées:', activeInterventions?.length || 0, 'interventions');
    if (interventionsError) {
      console.error('[DEBUG] Erreur interventions:', interventionsError);
      throw interventionsError;
    }

    // Créer des sets pour les équipements loués et en maintenance
    const rentedIds = new Set(activeRentals.map(r => r.equipment_id));
    const maintenanceIds = new Set(activeInterventions.map(i => i.equipment_id));

    // Enrichir les données des équipements
    const enrichedMachines = machines?.map(machine => {
      const isRented = rentedIds.has(machine.id);
      const isInMaintenance = maintenanceIds.has(machine.id);
      
      let status = 'Disponible';
      let statusColor = 'green';
      let usageRate = 0;
      
      if (isInMaintenance) {
        status = 'Maintenance';
        statusColor = 'red';
        usageRate = 0;
      } else if (isRented) {
        status = 'En location';
        statusColor = 'orange';
        usageRate = 85; // Taux d'utilisation simulé
      } else {
        status = 'Disponible';
        statusColor = 'green';
        usageRate = Math.floor(Math.random() * 30) + 10; // Taux d'utilisation aléatoire pour les équipements disponibles
      }

      // Trouver les informations de location actuelles
      const currentRental = activeRentals?.find(r => r.equipment_id === machine.id);
      const currentIntervention = activeInterventions?.find(i => i.equipment_id === machine.id);

      return {
        ...machine,
        status,
        statusColor,
        usageRate,
        isRented,
        isInMaintenance,
        currentRental: currentRental ? {
          startDate: currentRental.start_date,
          endDate: currentRental.end_date,
          status: currentRental.status
        } : null,
        currentIntervention: currentIntervention ? {
          scheduledDate: currentIntervention.scheduled_date,
          status: currentIntervention.status
        } : null,
        equipmentFullName: `${machine.brand || ''} ${machine.model || machine.name}`.trim()
      };
    }) || [];

    // Calculer les statistiques globales
    const total = enrichedMachines.length;
    const available = enrichedMachines.filter(m => m.status === 'Disponible').length;
    const rented = enrichedMachines.filter(m => m.status === 'En location').length;
    const maintenance = enrichedMachines.filter(m => m.status === 'Maintenance').length;
    const averageUsageRate = enrichedMachines.reduce((sum, m) => sum + m.usageRate, 0) / total;

    const result = {
      summary: [
        { name: 'Disponible', value: available, color: 'green' },
        { name: 'En location', value: rented, color: 'orange' },
        { name: 'Maintenance', value: maintenance, color: 'red' }
      ],
      details: enrichedMachines,
      stats: {
        total,
        available,
        rented,
        maintenance,
        averageUsageRate: Math.round(averageUsageRate)
      }
    };
    
    console.log('[DEBUG] Résultat final getEquipmentAvailability:', {
      total,
      available,
      rented,
      maintenance,
      averageUsageRate: Math.round(averageUsageRate),
      machinesCount: enrichedMachines.length
    });
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération de la disponibilité:", error);
    return {
      summary: [],
      details: [],
      stats: { total: 0, available: 0, rented: 0, maintenance: 0, averageUsageRate: 0 }
    };
  }
}

// 📅 WIDGET "LOCATIONS À VENIR" - AMÉLIORÉ
export async function getUpcomingRentals() {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        id, 
        start_date, 
        end_date, 
        total_price,
        status,
        created_at,
        equipment_id,
        client_id
      `)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(10);

    if (error) throw error;
    
    // Récupérer les informations des équipements et clients séparément
    const equipmentIds = [...new Set(data?.map(r => r.equipment_id).filter(Boolean))];
    const clientIds = [...new Set(data?.map(r => r.client_id).filter(Boolean))];
    
    let equipmentData: any = {};
    let clientData: any = {};
    
    if (equipmentIds.length > 0) {
      const { data: equipment, error: equipmentError } = await supabase
        .from('machines')
        .select('id, name, brand, model')
        .in('id', equipmentIds);
      
      if (!equipmentError && equipment) {
        equipment.forEach(eq => {
          equipmentData[eq.id] = eq;
        });
      }
    }
    
    if (clientIds.length > 0) {
      const { data: clients, error: clientError } = await supabase
        .from('user_profiles')
        .select('id, full_name, company_name')
        .in('id', clientIds);
      
      if (!clientError && clients) {
        clients.forEach(client => {
          clientData[client.id] = client;
        });
      }
    }
    
    // Enrichir les données avec des calculs
    const enrichedData = data?.map(rental => {
      const startDate = new Date(rental.start_date);
      const endDate = new Date(rental.end_date);
      const now = new Date();
      
      // Calculer la durée en jours
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculer le temps restant avant le début
      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Déterminer la priorité
      let priority = 'normal';
      if (daysUntilStart <= 1) priority = 'urgent';
      else if (daysUntilStart <= 3) priority = 'high';
      else if (daysUntilStart <= 7) priority = 'medium';
      
      // Prix par jour
      const pricePerDay = rental.total_price / durationDays;
      
      // Récupérer les données des relations
      const equipment = equipmentData[rental.equipment_id];
      const client = clientData[rental.client_id];
      
      return {
        ...rental,
        durationDays,
        daysUntilStart,
        priority,
        pricePerDay: Math.round(pricePerDay * 100) / 100,
        clientName: client?.full_name || client?.company_name || 'Client non spécifié',
        equipmentFullName: equipment ? `${equipment.brand || ''} ${equipment.model || equipment.name}`.trim() : 'Équipement non spécifié'
      };
    }) || [];
    
    return enrichedData;
  } catch (error) {
    console.error("Erreur lors de la récupération des locations à venir:", error);
    return [];
  }
}

// 📋 WIDGET "MAINTENANCE PRÉVENTIVE" - AMÉLIORÉ
export async function getPreventiveMaintenance() {
  try {
    console.log('[DEBUG] Début de getPreventiveMaintenance()');
    
    // Récupérer toutes les interventions avec plus d'informations
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .select(`
        id,
        description,
        intervention_date,
        priority,
        status,
        estimated_duration,
        equipment_id,
        technician_id,
        created_at
      `)
      .gte('intervention_date', new Date().toISOString())
      .order('intervention_date', { ascending: true })
      .limit(20);

    console.log('[DEBUG] Interventions récupérées:', interventions?.length || 0);
    if (interventionsError) {
      console.error('[DEBUG] Erreur interventions:', interventionsError);
      throw interventionsError;
    }

    // Récupérer les informations des équipements
    const equipmentIds = [...new Set(interventions?.map(i => i.equipment_id).filter(Boolean))];
    let equipmentData: any = {};
    
    if (equipmentIds.length > 0) {
      const { data: equipment, error: equipmentError } = await supabase
        .from('machines')
        .select('id, name, brand, model')
        .in('id', equipmentIds);
      
      if (!equipmentError && equipment) {
        equipment.forEach(eq => {
          equipmentData[eq.id] = eq;
        });
      }
    }

    // Récupérer les informations des techniciens
    const technicianIds = [...new Set(interventions?.map(i => i.technician_id).filter(Boolean))];
    let technicianData: any = {};
    
    if (technicianIds.length > 0) {
      const { data: technicians, error: technicianError } = await supabase
        .from('technicians')
        .select('id, name, specialization')
        .in('id', technicianIds);
      
      if (!technicianError && technicians) {
        technicians.forEach(tech => {
          technicianData[tech.id] = tech;
        });
      }
    }

    // Enrichir les données des interventions
    const enrichedInterventions = interventions?.map(intervention => {
      const interventionDate = new Date(intervention.intervention_date);
      const now = new Date();
      
      // Calculer le temps restant
      const timeUntil = interventionDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
      const hoursUntil = Math.ceil(timeUntil / (1000 * 60 * 60));
      
      // Déterminer l'urgence
      let urgency = 'normal';
      if (daysUntil < 0) urgency = 'overdue';
      else if (daysUntil === 0 && hoursUntil <= 2) urgency = 'urgent';
      else if (daysUntil <= 1) urgency = 'high';
      else if (daysUntil <= 3) urgency = 'medium';
      
      // Récupérer les données des relations
      const equipment = equipmentData[intervention.equipment_id];
      const technician = technicianData[intervention.technician_id];
      
      return {
        ...intervention,
        daysUntil,
        hoursUntil,
        urgency,
        equipmentName: equipment ? `${equipment.brand || ''} ${equipment.model || equipment.name}`.trim() : 'Équipement non spécifié',
        technicianName: technician?.name || 'Non assigné',
        technicianSpecialization: technician?.specialization || '',
        isOverdue: daysUntil < 0,
        isToday: daysUntil === 0,
        isThisWeek: daysUntil <= 7
      };
    }) || [];

    // Calculer les statistiques
    const total = enrichedInterventions.length;
    const today = enrichedInterventions.filter(i => i.isToday).length;
    const thisWeek = enrichedInterventions.filter(i => i.isThisWeek).length;
    const overdue = enrichedInterventions.filter(i => i.isOverdue).length;
    const byPriority = {
      haute: enrichedInterventions.filter(i => i.priority === 'Haute').length,
      moyenne: enrichedInterventions.filter(i => i.priority === 'Moyenne').length,
      basse: enrichedInterventions.filter(i => i.priority === 'Basse').length
    };
    const byStatus = {
      'En attente': enrichedInterventions.filter(i => i.status === 'En attente').length,
      'En cours': enrichedInterventions.filter(i => i.status === 'En cours').length,
      'Terminé': enrichedInterventions.filter(i => i.status === 'Terminé').length,
      'Annulé': enrichedInterventions.filter(i => i.status === 'Annulé').length
    };

    const result = {
      interventions: enrichedInterventions,
      stats: {
        total,
        today,
        thisWeek,
        overdue,
        byPriority,
        byStatus
      }
    };

    console.log('[DEBUG] Résultat final getPreventiveMaintenance:', {
      total,
      today,
      thisWeek,
      overdue,
      byPriority,
      byStatus
    });

    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération de la maintenance préventive:", error);
    return {
      interventions: [],
      stats: {
        total: 0,
        today: 0,
        thisWeek: 0,
        overdue: 0,
        byPriority: { haute: 0, moyenne: 0, basse: 0 },
        byStatus: { 'En attente': 0, 'En cours': 0, 'Terminé': 0, 'Annulé': 0 }
      }
    };
  }
}

// ➕ CRÉER UNE NOUVELLE INTERVENTION
export async function createMaintenanceIntervention(interventionData: {
  equipment_id: string;
  description: string;
  intervention_date: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
  estimated_duration?: number;
  technician_id?: string;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

  try {
    const { data, error } = await supabase
      .from('interventions')
      .insert([{ 
        ...interventionData,
        status: 'En attente',
        created_by: userData.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de l'intervention:", error);
    throw error;
  }
}

// 🔄 METTRE À JOUR LE STATUT D'UNE INTERVENTION
export async function updateInterventionStatus(interventionId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .update({ status: status })
      .eq('id', interventionId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
}

// ✏️ MODIFIER UNE INTERVENTION
export async function updateMaintenanceIntervention(interventionId: string, interventionData: {
  description?: string;
  intervention_date?: string;
  priority?: 'Basse' | 'Moyenne' | 'Haute';
  estimated_duration?: number;
  technician_id?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .update(interventionData)
      .eq('id', interventionId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la modification de l'intervention:", error);
    throw error;
  }
}

// 🗑️ SUPPRIMER UNE INTERVENTION
export async function deleteMaintenanceIntervention(interventionId: string) {
  try {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', interventionId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'intervention:", error);
    throw error;
  }
}

// ➕ WIDGET "LOCATIONS À VENIR" - Création
export async function createRental(rentalData: {
  equipment_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

  try {
    const { data, error } = await supabase
      .from('rentals')
      .insert([{ 
        ...rentalData,
        created_by: userData.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de la location:", error);
    throw error;
  }
}

// 🔄 WIDGET "LOCATIONS À VENIR" - Mise à jour du statut
export async function updateRentalStatus(rentalId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .update({ status: status })
      .eq('id', rentalId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la location:", error);
    throw error;
  }
}

// 🔄 WIDGET "LOCATIONS À VENIR" - Mise à jour complète
export async function updateRental(rentalId: string, rentalData: {
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
}) {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .update(rentalData)
      .eq('id', rentalId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la location:", error);
    throw error;
  }
} 