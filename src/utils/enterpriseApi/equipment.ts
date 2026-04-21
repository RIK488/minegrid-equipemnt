import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';

export const getEquipmentList = async () => {
  return supabaseCall(
    () => supabase.from('machines').select('id, name').order('name', { ascending: true }),
    { label: 'getEquipmentList', fallback: [] },
  );
};

interface RentalRow {
  equipment_id: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

interface InterventionRow {
  equipment_id: string;
  status?: string;
  scheduled_date?: string;
}

// WIDGET "DISPONIBILITE EQUIPEMENTS"
export async function getEquipmentAvailability() {
  const [machines, activeRentals, activeInterventions] = await Promise.all([
    supabaseCall<Array<Record<string, any>>>(
      () => supabase.from('machines').select('id, name, brand, model, condition, year, price'),
      { label: 'getEquipmentAvailability.machines', fallback: [] },
    ),
    supabaseCall<RentalRow[]>(
      () =>
        supabase
          .from('rentals')
          .select('equipment_id, start_date, end_date, status')
          .in('status', ['En cours', 'Confirmée', 'Prête']),
      { label: 'getEquipmentAvailability.rentals', fallback: [] },
    ),
    supabaseCall<InterventionRow[]>(
      () =>
        supabase
          .from('interventions')
          .select('equipment_id, status, scheduled_date')
          .in('status', ['En cours', 'En attente']),
      { label: 'getEquipmentAvailability.interventions', fallback: [] },
    ),
  ]);

  const rentedIds = new Set(activeRentals.map((r) => r.equipment_id));
  const maintenanceIds = new Set(activeInterventions.map((i) => i.equipment_id));

  const enrichedMachines = machines.map((machine) => {
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
      usageRate = 85;
    } else {
      status = 'Disponible';
      statusColor = 'green';
      usageRate = Math.floor(Math.random() * 30) + 10;
    }

    const currentRental = activeRentals.find((r) => r.equipment_id === machine.id);
    const currentIntervention = activeInterventions.find((i) => i.equipment_id === machine.id);

    return {
      ...machine,
      status,
      statusColor,
      usageRate,
      isRented,
      isInMaintenance,
      currentRental: currentRental
        ? {
            startDate: currentRental.start_date,
            endDate: currentRental.end_date,
            status: currentRental.status,
          }
        : null,
      currentIntervention: currentIntervention
        ? {
            scheduledDate: currentIntervention.scheduled_date,
            status: currentIntervention.status,
          }
        : null,
      equipmentFullName: `${machine.brand || ''} ${machine.model || machine.name}`.trim(),
    };
  });

  const total = enrichedMachines.length;
  const available = enrichedMachines.filter((m) => m.status === 'Disponible').length;
  const rented = enrichedMachines.filter((m) => m.status === 'En location').length;
  const maintenance = enrichedMachines.filter((m) => m.status === 'Maintenance').length;
  const averageUsageRate =
    total > 0 ? enrichedMachines.reduce((sum, m) => sum + m.usageRate, 0) / total : 0;

  return {
    summary: [
      { name: 'Disponible', value: available, color: 'green' },
      { name: 'En location', value: rented, color: 'orange' },
      { name: 'Maintenance', value: maintenance, color: 'red' },
    ],
    details: enrichedMachines,
    stats: {
      total,
      available,
      rented,
      maintenance,
      averageUsageRate: Math.round(averageUsageRate),
    },
  };
}
