// Test simple pour vérifier que les détails de location fonctionnent
console.log('Test des détails de location...');

// Simuler des données de location
const testRental = {
  id: 'test-123',
  equipmentFullName: 'Pelle hydraulique CAT 320D',
  clientName: 'Construction SA',
  start_date: '2024-01-20',
  end_date: '2024-01-27',
  total_price: 3500,
  pricePerDay: 500,
  durationDays: 7,
  daysUntilStart: 2,
  status: 'Confirmée',
  priority: 'medium'
};

// Fonction pour afficher les détails
function showRentalDetails(rental) {
  console.log('=== DÉTAILS DE LA LOCATION ===');
  console.log('Équipement:', rental.equipmentFullName);
  console.log('Client:', rental.clientName);
  console.log('Période:', rental.start_date, 'à', rental.end_date);
  console.log('Durée:', rental.durationDays, 'jours');
  console.log('Prix total:', rental.total_price, '€');
  console.log('Prix par jour:', rental.pricePerDay, '€');
  console.log('Statut:', rental.status);
  console.log('Priorité:', rental.priority);
  console.log('Temps restant:', rental.daysUntilStart <= 0 ? 'Aujourd\'hui' : 
              rental.daysUntilStart === 1 ? 'Demain' : 
              `Dans ${rental.daysUntilStart} jours`);
  console.log('=============================');
}

// Tester la fonction
showRentalDetails(testRental);

// Instructions pour tester dans le dashboard
console.log('\nPour tester dans le dashboard :');
console.log('1. Exécuter le script SQL test-rentals-data.sql dans Supabase');
console.log('2. Aller sur le dashboard entreprise');
console.log('3. Configurer le widget "Locations à venir"');
console.log('4. Cliquer sur "Voir détails" pour une location'); 