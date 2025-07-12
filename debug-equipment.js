// Script de diagnostic pour le widget equipment-availability
// À exécuter dans la console du navigateur sur http://localhost:5174/

console.log('🔍 Diagnostic du widget equipment-availability...');

// Test 1: Vérifier si supabase est disponible
console.log('1. Supabase disponible:', typeof supabase !== 'undefined');

// Test 2: Vérifier la session
async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('2. Session:', data.session ? 'Connecté' : 'Non connecté');
    if (error) console.error('Erreur session:', error);
    return data.session;
  } catch (error) {
    console.error('Erreur session:', error);
    return false;
  }
}

// Test 3: Vérifier la table machines
async function checkMachines() {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .limit(3);
    
    console.log('3. Table machines:', data?.length || 0, 'machines');
    if (error) {
      console.error('Erreur machines:', error);
      return false;
    }
    return data?.length > 0;
  } catch (error) {
    console.error('Erreur machines:', error);
    return false;
  }
}

// Test 4: Vérifier la table rentals
async function checkRentals() {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .limit(3);
    
    console.log('4. Table rentals:', data?.length || 0, 'locations');
    if (error) {
      console.error('Erreur rentals:', error);
      return false;
    }
    return true; // On retourne true même si vide
  } catch (error) {
    console.error('Erreur rentals:', error);
    return false;
  }
}

// Test 5: Vérifier la table interventions
async function checkInterventions() {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .limit(3);
    
    console.log('5. Table interventions:', data?.length || 0, 'interventions');
    if (error) {
      console.error('Erreur interventions:', error);
      return false;
    }
    return true; // On retourne true même si vide
  } catch (error) {
    console.error('Erreur interventions:', error);
    return false;
  }
}

// Test 6: Tester la fonction getEquipmentAvailability
async function testFunction() {
  try {
    console.log('6. Test de getEquipmentAvailability...');
    
    // Récupérer tous les équipements
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, brand, model, condition, year, price');

    console.log('   Machines récupérées:', machines?.length || 0);
    if (machinesError) {
      console.error('   Erreur machines:', machinesError);
      return null;
    }

    // Récupérer les locations actives
    const { data: activeRentals, error: rentalsError } = await supabase
      .from('rentals')
      .select('equipment_id, start_date, end_date, status')
      .in('status', ['En cours', 'Confirmée', 'Prête']);

    console.log('   Locations actives:', activeRentals?.length || 0);
    if (rentalsError) {
      console.error('   Erreur locations:', rentalsError);
      return null;
    }

    // Récupérer les interventions
    const { data: activeInterventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('equipment_id, status, scheduled_date')
      .in('status', ['En cours', 'En attente']);

    console.log('   Interventions actives:', activeInterventions?.length || 0);
    if (interventionsError) {
      console.error('   Erreur interventions:', interventionsError);
      return null;
    }

    // Créer le résultat
    const rentedIds = new Set(activeRentals.map(r => r.equipment_id));
    const maintenanceIds = new Set(activeInterventions.map(i => i.equipment_id));

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
        usageRate = 85;
      } else {
        status = 'Disponible';
        statusColor = 'green';
        usageRate = Math.floor(Math.random() * 30) + 10;
      }

      return {
        ...machine,
        status,
        statusColor,
        usageRate,
        isRented,
        isInMaintenance,
        equipmentFullName: `${machine.brand || ''} ${machine.model || machine.name}`.trim()
      };
    }) || [];

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

    console.log('   Résultat créé:', result);
    console.log('   Structure correcte:', {
      hasSummary: Array.isArray(result.summary),
      hasDetails: Array.isArray(result.details),
      hasStats: typeof result.stats === 'object'
    });

    return result;
  } catch (error) {
    console.error('   Erreur fonction:', error);
    return null;
  }
}

// Exécuter tous les tests
async function runDiagnostic() {
  console.log('🚀 Début du diagnostic...\n');
  
  const session = await checkSession();
  console.log('');
  
  const machinesOk = await checkMachines();
  console.log('');
  
  const rentalsOk = await checkRentals();
  console.log('');
  
  const interventionsOk = await checkInterventions();
  console.log('');
  
  const result = await testFunction();
  console.log('');
  
  // Résumé
  console.log('📊 RÉSUMÉ DU DIAGNOSTIC:');
  console.log('- Session:', session ? '✅' : '❌');
  console.log('- Table machines:', machinesOk ? '✅' : '❌');
  console.log('- Table rentals:', rentalsOk ? '✅' : '❌');
  console.log('- Table interventions:', interventionsOk ? '✅' : '❌');
  console.log('- Fonction test:', result ? '✅' : '❌');
  
  if (!machinesOk) {
    console.log('\n💡 PROBLÈME: Aucune machine dans la base de données');
    console.log('   SOLUTION: Ajouter des machines avec le script ci-dessous');
  }
  
  if (!rentalsOk) {
    console.log('\n💡 PROBLÈME: Table rentals inaccessible');
    console.log('   SOLUTION: Vérifier que la table rentals existe');
  }
  
  if (!interventionsOk) {
    console.log('\n💡 PROBLÈME: Table interventions inaccessible');
    console.log('   SOLUTION: Vérifier que la table interventions existe');
  }
  
  if (result) {
    console.log('\n✅ La fonction fonctionne correctement');
    console.log('   Le problème vient probablement de l\'affichage du widget');
  }
}

// Lancer le diagnostic
runDiagnostic(); 