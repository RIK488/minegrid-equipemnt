// Script pour ajouter rapidement des données de test
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Ajout rapide de données de test...');

async function addQuickData() {
  try {
    // 1. Ajouter des machines
    console.log('1. Ajout de machines...');
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .insert([
        {
          name: 'Pelle hydraulique CAT 320',
          brand: 'Caterpillar',
          model: '320',
          condition: 'Occasion',
          year: 2018,
          price: 85000,
          description: 'Pelle hydraulique en excellent état',
          category: 'excavator',
          seller_id: 'test-user-id'
        },
        {
          name: 'Chargeur frontal JCB 3CX',
          brand: 'JCB',
          model: '3CX',
          condition: 'Neuf',
          year: 2023,
          price: 95000,
          description: 'Chargeur frontal neuf',
          category: 'loader',
          seller_id: 'test-user-id'
        },
        {
          name: 'Bulldozer Komatsu D65',
          brand: 'Komatsu',
          model: 'D65',
          condition: 'Occasion',
          year: 2019,
          price: 120000,
          description: 'Bulldozer puissant',
          category: 'bulldozer',
          seller_id: 'test-user-id'
        },
        {
          name: 'Grue mobile Liebherr LTM 1300',
          brand: 'Liebherr',
          model: 'LTM 1300',
          condition: 'Occasion',
          year: 2020,
          price: 180000,
          description: 'Grue mobile tout-terrain',
          category: 'crane',
          seller_id: 'test-user-id'
        },
        {
          name: 'Camion benne Volvo FH16',
          brand: 'Volvo',
          model: 'FH16',
          condition: 'Neuf',
          year: 2022,
          price: 95000,
          description: 'Camion benne haute capacité',
          category: 'truck',
          seller_id: 'test-user-id'
        },
        {
          name: 'Foreuse Atlas Copco ROC L8',
          brand: 'Atlas Copco',
          model: 'ROC L8',
          condition: 'Occasion',
          year: 2019,
          price: 150000,
          description: 'Foreuse de surface performante',
          category: 'drill',
          seller_id: 'test-user-id'
        }
      ])
      .select();

    if (machinesError) {
      console.error('❌ Erreur ajout machines:', machinesError);
      return;
    }

    console.log('✅ Machines ajoutées:', machines?.length || 0);

    // 2. Ajouter une vitrine de test
    console.log('2. Ajout d\'une vitrine de test...');
    const { data: vitrine, error: vitrineError } = await supabase
      .from('vitrines')
      .insert({
        company_name: 'Minegrid Equipment Pro',
        description: 'Spécialiste en équipements miniers et de construction',
        services: ['Vente d\'équipements', 'Location', 'Maintenance', 'Transport'],
        address: '123 Rue de l\'Industrie, Casablanca',
        phone: '+212 5 22 34 56 78',
        email: 'contact@minegrid-pro.ma',
        website: 'https://minegrid-pro.ma',
        working_hours: 'Lun-Ven: 8h-18h, Sam: 8h-12h',
        specializations: ['Équipements miniers', 'Machines de construction', 'Transport lourd'],
        certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
        user_id: 'test-user-id',
        business_type: 'both',
        founding_year: 2010,
        intervention_zone: 'Maroc, Afrique de l\'Ouest',
        equipment_count: 50,
        projects_delivered: 200,
        whatsapp: '+212 6 12 34 56 78',
        emergency_phone: '+212 6 98 76 54 32',
        delivery_radius: 100,
        min_rental_duration: 1,
        deposit_required: true,
        fuel_included: false,
        driver_included: false,
        maintenance_included: true,
        warranty_months: 12,
        delivery_time_weeks: 4,
        transport_included: true,
        installation_included: false
      })
      .select();

    if (vitrineError) {
      console.error('❌ Erreur ajout vitrine:', vitrineError);
    } else {
      console.log('✅ Vitrine ajoutée');
    }

    console.log('\n✅ Données de test ajoutées avec succès !');
    console.log('🎉 Vous pouvez maintenant voir le carrousel et les annonces dans votre vitrine !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Lancer l'ajout de données
addQuickData(); 