import supabase from '../supabaseClient';

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
