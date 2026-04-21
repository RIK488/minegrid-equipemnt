import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';

// =====================================================
// APIs POUR LES WIDGETS LOUEUR
// =====================================================

// WIDGET "REVENUS DE LOCATION"
export async function getRentalRevenue() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [currentMonthData, lastMonthData] = await Promise.all([
    supabaseCall<Array<{ total_price: number }>>(
      () =>
        supabase
          .from('rentals')
          .select('total_price')
          .gte('start_date', startOfMonth.toISOString())
          .lte('start_date', endOfMonth.toISOString()),
      { label: 'getRentalRevenue.currentMonth', fallback: [] },
    ),
    supabaseCall<Array<{ total_price: number }>>(
      () =>
        supabase
          .from('rentals')
          .select('total_price')
          .gte('start_date', startOfLastMonth.toISOString())
          .lte('start_date', endOfLastMonth.toISOString()),
      { label: 'getRentalRevenue.lastMonth', fallback: [] },
    ),
  ]);

  const currentRevenue = currentMonthData.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const rentalCount = currentMonthData.length;
  const lastRevenue = lastMonthData.reduce((sum, item) => sum + (item.total_price || 0), 0);

  let growth = 0;
  if (lastRevenue > 0) {
    growth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
  } else if (currentRevenue > 0) {
    growth = 100;
  }

  return {
    revenue: currentRevenue,
    count: rentalCount,
    growth: parseFloat(growth.toFixed(1)),
  };
}

// WIDGET "LOCATIONS A VENIR"
export async function getUpcomingRentals() {
  const data = await supabaseCall<Array<Record<string, any>>>(
    () =>
      supabase
        .from('rentals')
        .select(
          `id, start_date, end_date, total_price, status, created_at, equipment_id, client_id`,
        )
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(10),
    { label: 'getUpcomingRentals', fallback: [] },
  );

  if (!data.length) return [];

  const equipmentIds = [...new Set(data.map((r) => r.equipment_id).filter(Boolean))];
  const clientIds = [...new Set(data.map((r) => r.client_id).filter(Boolean))];

  const [equipmentList, clientList] = await Promise.all([
    equipmentIds.length > 0
      ? supabaseCall<Array<Record<string, any>>>(
          () =>
            supabase.from('machines').select('id, name, brand, model').in('id', equipmentIds),
          { label: 'getUpcomingRentals.equipment', fallback: [] },
        )
      : Promise.resolve<Array<Record<string, any>>>([]),
    clientIds.length > 0
      ? supabaseCall<Array<Record<string, any>>>(
          () =>
            supabase
              .from('user_profiles')
              .select('id, full_name, company_name')
              .in('id', clientIds),
          { label: 'getUpcomingRentals.clients', fallback: [] },
        )
      : Promise.resolve<Array<Record<string, any>>>([]),
  ]);

  const equipmentData: Record<string, any> = {};
  equipmentList.forEach((eq) => {
    equipmentData[eq.id] = eq;
  });
  const clientData: Record<string, any> = {};
  clientList.forEach((c) => {
    clientData[c.id] = c;
  });

  return data.map((rental) => {
    const startDate = new Date(rental.start_date);
    const endDate = new Date(rental.end_date);
    const now = new Date();

    const durationDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let priority = 'normal';
    if (daysUntilStart <= 1) priority = 'urgent';
    else if (daysUntilStart <= 3) priority = 'high';
    else if (daysUntilStart <= 7) priority = 'medium';

    const pricePerDay = (rental.total_price || 0) / durationDays;
    const equipment = equipmentData[rental.equipment_id];
    const client = clientData[rental.client_id];

    return {
      ...rental,
      durationDays,
      daysUntilStart,
      priority,
      pricePerDay: Math.round(pricePerDay * 100) / 100,
      clientName: client?.full_name || client?.company_name || 'Client non spécifié',
      equipmentFullName: equipment
        ? `${equipment.brand || ''} ${equipment.model || equipment.name}`.trim()
        : 'Équipement non spécifié',
    };
  });
}

// WIDGET "LOCATIONS A VENIR" - Creation
export async function createRental(rentalData: {
  equipment_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

  return supabaseCall(
    () =>
      supabase
        .from('rentals')
        .insert([{ ...rentalData, created_by: userData.user.id }])
        .select()
        .single(),
    {
      label: 'createRental',
      toastOnError: true,
      toastMessage: 'Impossible de créer la location',
    },
  );
}

// WIDGET "LOCATIONS A VENIR" - Mise a jour du statut
export async function updateRentalStatus(rentalId: string, status: string) {
  return supabaseCall(
    () => supabase.from('rentals').update({ status }).eq('id', rentalId).select().single(),
    { label: 'updateRentalStatus', toastOnError: true },
  );
}

// WIDGET "LOCATIONS A VENIR" - Mise a jour complete
export async function updateRental(
  rentalId: string,
  rentalData: {
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
  },
) {
  return supabaseCall(
    () => supabase.from('rentals').update(rentalData).eq('id', rentalId).select().single(),
    { label: 'updateRental', toastOnError: true },
  );
}
