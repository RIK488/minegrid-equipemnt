import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans votre fichier .env');
  process.exit(1);
}

// Utiliser la clé service_role pour contourner les politiques RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function addMaintenanceData() {
  console.log('🚀 Début de l\'ajout des données de maintenance préventive...');

  try {
    // 1. Vérifier si la table interventions existe
    console.log('📋 Vérification de la table interventions...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('interventions')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table interventions:', tableError);
      console.log('💡 Assurez-vous que la table interventions existe dans votre base de données');
      return;
    }

    console.log('✅ Table interventions trouvée');

    // 2. Récupérer quelques machines existantes
    console.log('🔧 Récupération des machines existantes...');
    let { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, brand, model')
      .limit(5);

    if (machinesError) {
      console.error('❌ Erreur lors de la récupération des machines:', machinesError);
      return;
    }

    if (!machines || machines.length === 0) {
      console.log('⚠️ Aucune machine trouvée. Création de machines de test...');
      
      // Créer quelques machines de test
      const testMachines = [
        { name: 'Pelle hydraulique CAT 320', brand: 'CAT', model: '320', price: 2500000, category: 'Pelle' },
        { name: 'Chargeur frontal JCB 3CX', brand: 'JCB', model: '3CX', price: 1800000, category: 'Chargeur' },
        { name: 'Bulldozer CAT D6', brand: 'CAT', model: 'D6', price: 3200000, category: 'Bulldozer' },
        { name: 'Excavatrice Hitachi ZX200', brand: 'Hitachi', model: 'ZX200', price: 2100000, category: 'Excavatrice' },
        { name: 'Chargeur sur pneus Volvo L120', brand: 'Volvo', model: 'L120', price: 1950000, category: 'Chargeur' }
      ];

      const { data: createdMachines, error: createMachinesError } = await supabase
        .from('machines')
        .insert(testMachines)
        .select('id, name, brand, model');

      if (createMachinesError) {
        console.error('❌ Erreur lors de la création des machines de test:', createMachinesError);
        return;
      }

      console.log('✅ Machines de test créées:', createdMachines.length);
      machines = createdMachines;
    } else {
      console.log('✅ Machines existantes trouvées:', machines.length);
    }

    // 3. Créer des techniciens de test
    console.log('👨‍🔧 Création des techniciens de test...');
    
    // Vérifier si la table technicians existe
    const { data: techCheck, error: techCheckError } = await supabase
      .from('technicians')
      .select('id')
      .limit(1);

    if (techCheckError) {
      console.log('⚠️ Table technicians non trouvée. Création de la table...');
      
      // Créer la table technicians (simulation - en réalité, il faudrait un script SQL)
      console.log('💡 Veuillez créer la table technicians manuellement dans Supabase avec la structure suivante:');
      console.log(`
        CREATE TABLE technicians (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          specialization TEXT,
          phone TEXT,
          email TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      return;
    }

    const technicians = [
      { name: 'Mohammed Alami', specialization: 'Moteurs diesel' },
      { name: 'Ahmed Benali', specialization: 'Systèmes hydrauliques' },
      { name: 'Karim El Fassi', specialization: 'Électricité industrielle' },
      { name: 'Hassan Tazi', specialization: 'Mécanique générale' }
    ];

    const { data: createdTechnicians, error: createTechError } = await supabase
      .from('technicians')
      .insert(technicians)
      .select('id, name, specialization');

    if (createTechError) {
      console.error('❌ Erreur lors de la création des techniciens:', createTechError);
      return;
    }

    console.log('✅ Techniciens créés:', createdTechnicians.length);

    // 4. Créer des interventions de maintenance préventive
    console.log('🔧 Création des interventions de maintenance...');

    const interventions = [
      {
        equipment_id: machines[0].id,
        description: 'Vidange huile moteur et remplacement filtre à air',
        intervention_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Haute',
        status: 'En attente',
        estimated_duration: 4,
        technician_id: createdTechnicians[0].id,
        notes: 'Intervention programmée selon planning préventif'
      },
      {
        equipment_id: machines[1].id,
        description: 'Contrôle système hydraulique et vérification fuites',
        intervention_date: new Date().toISOString(),
        priority: 'Moyenne',
        status: 'En cours',
        estimated_duration: 2,
        technician_id: createdTechnicians[1].id,
        notes: 'Intervention en cours - système hydraulique défaillant'
      },
      {
        equipment_id: machines[2].id,
        description: 'Révision complète - 5000h de fonctionnement',
        intervention_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Basse',
        status: 'En attente',
        estimated_duration: 8,
        technician_id: null,
        notes: 'Révision majeure programmée - en attente d\'assignation technicien'
      },
      {
        equipment_id: machines[3].id,
        description: 'Remplacement courroies et contrôle tension',
        intervention_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Moyenne',
        status: 'En attente',
        estimated_duration: 3,
        technician_id: createdTechnicians[2].id,
        notes: 'Maintenance préventive - courroies usées'
      },
      {
        equipment_id: machines[4].id,
        description: 'Contrôle système de freinage et remplacement plaquettes',
        intervention_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Haute',
        status: 'En attente',
        estimated_duration: 5,
        technician_id: createdTechnicians[3].id,
        notes: 'Système de freinage à vérifier - sécurité prioritaire'
      },
      {
        equipment_id: machines[0].id,
        description: 'Contrôle niveau liquides et graissage points critiques',
        intervention_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Basse',
        status: 'En attente',
        estimated_duration: 1,
        technician_id: createdTechnicians[0].id,
        notes: 'Maintenance hebdomadaire de routine'
      },
      {
        equipment_id: machines[1].id,
        description: 'Remplacement filtre à carburant et contrôle injecteurs',
        intervention_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Moyenne',
        status: 'Terminé',
        estimated_duration: 2,
        technician_id: createdTechnicians[1].id,
        notes: 'Intervention terminée avec succès - équipement opérationnel'
      },
      {
        equipment_id: machines[2].id,
        description: 'Contrôle système de refroidissement et nettoyage radiateur',
        intervention_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Moyenne',
        status: 'En attente',
        estimated_duration: 3,
        technician_id: createdTechnicians[3].id,
        notes: 'Température moteur élevée détectée - intervention préventive'
      }
    ];

    const { data: createdInterventions, error: createInterventionsError } = await supabase
      .from('interventions')
      .insert(interventions)
      .select('id, description, intervention_date, priority, status');

    if (createInterventionsError) {
      console.error('❌ Erreur lors de la création des interventions:', createInterventionsError);
      return;
    }

    console.log('✅ Interventions créées:', createdInterventions.length);

    // 5. Afficher un résumé
    console.log('\n📊 Résumé des données ajoutées:');
    console.log(`   - Machines: ${machines.length}`);
    console.log(`   - Techniciens: ${createdTechnicians.length}`);
    console.log(`   - Interventions: ${createdInterventions.length}`);

    // 6. Tester la récupération des données
    console.log('\n🧪 Test de récupération des données...');
    const { data: testData, error: testError } = await supabase
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
      .order('intervention_date', { ascending: true });

    if (testError) {
      console.error('❌ Erreur lors du test de récupération:', testError);
    } else {
      console.log('✅ Test de récupération réussi');
      console.log(`   - Interventions futures trouvées: ${testData.length}`);
      
      // Afficher quelques exemples
      console.log('\n📋 Exemples d\'interventions:');
      testData.slice(0, 3).forEach((intervention, index) => {
        console.log(`   ${index + 1}. ${intervention.description} (${intervention.priority}) - ${intervention.status}`);
      });
    }

    console.log('\n🎉 Données de maintenance préventive ajoutées avec succès !');
    console.log('💡 Vous pouvez maintenant tester le widget "Maintenance préventive" dans le dashboard entreprise');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
addMaintenanceData(); 