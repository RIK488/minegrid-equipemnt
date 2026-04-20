import supabase from '../supabaseClient';

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
