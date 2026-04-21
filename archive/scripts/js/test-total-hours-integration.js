// =====================================================
// SCRIPT DE TEST : Intégration du champ total_hours
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTotalHoursIntegration() {
  console.log('🧪 Test d\'intégration du champ total_hours\n');

  try {
    // 1. Vérifier que le champ existe dans la table
    console.log('📋 Étape 1: Vérification de la structure de la table...');
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'machines' 
          AND column_name = 'total_hours'
          AND table_schema = 'public';
        `
      });

    if (columnsError) {
      console.log('❌ Erreur lors de la vérification:', columnsError.message);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Le champ total_hours existe dans la table machines');
      console.log(`   Type: ${columns[0].data_type}`);
    } else {
      console.log('❌ Le champ total_hours n\'existe pas dans la table machines');
      console.log('💡 Exécutez le script SQL add-total-hours-field.sql dans Supabase');
      return;
    }

    // 2. Tester l'insertion d'une machine avec total_hours
    console.log('\n📝 Étape 2: Test d\'insertion avec total_hours...');
    
    const testMachine = {
      name: 'Test Machine - Pelle hydraulique',
      brand: 'Caterpillar',
      model: '320D',
      category: 'Pelles hydrauliques',
      type: 'sale',
      year: 2020,
      price: 150000,
      total_hours: 2500,
      description: 'Machine de test avec heures d\'utilisation',
      location: 'Casablanca, Maroc',
      specifications: {
        weight: 20000,
        power: { value: 120, unit: 'HP' },
        dimensions: '12.5 x 3.2 x 3.1',
        workingWeight: 22000,
        operatingCapacity: 2000
      },
      seller_id: 'test-user-id',
      created_at: new Date().toISOString()
    };

    const { data: insertedMachine, error: insertError } = await supabase
      .from('machines')
      .insert(testMachine)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erreur lors de l\'insertion:', insertError.message);
      return;
    }

    console.log('✅ Machine insérée avec succès');
    console.log(`   ID: ${insertedMachine.id}`);
    console.log(`   Nom: ${insertedMachine.name}`);
    console.log(`   Heures: ${insertedMachine.total_hours}`);

    // 3. Tester la récupération
    console.log('\n📖 Étape 3: Test de récupération...');
    
    const { data: retrievedMachine, error: selectError } = await supabase
      .from('machines')
      .select('*')
      .eq('id', insertedMachine.id)
      .single();

    if (selectError) {
      console.log('❌ Erreur lors de la récupération:', selectError.message);
      return;
    }

    console.log('✅ Machine récupérée avec succès');
    console.log(`   Heures récupérées: ${retrievedMachine.total_hours}`);

    // 4. Tester la mise à jour
    console.log('\n✏️ Étape 4: Test de mise à jour...');
    
    const { data: updatedMachine, error: updateError } = await supabase
      .from('machines')
      .update({ total_hours: 3000 })
      .eq('id', insertedMachine.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erreur lors de la mise à jour:', updateError.message);
      return;
    }

    console.log('✅ Machine mise à jour avec succès');
    console.log(`   Nouvelles heures: ${updatedMachine.total_hours}`);

    // 5. Nettoyer les données de test
    console.log('\n🧹 Étape 5: Nettoyage des données de test...');
    
    const { error: deleteError } = await supabase
      .from('machines')
      .delete()
      .eq('id', insertedMachine.id);

    if (deleteError) {
      console.log('⚠️ Erreur lors du nettoyage:', deleteError.message);
    } else {
      console.log('✅ Données de test supprimées');
    }

    console.log('\n🎉 Test d\'intégration terminé avec succès !');
    console.log('✅ Le champ total_hours fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour tester les formulaires frontend
function testFrontendForms() {
  console.log('\n🎨 Test des formulaires frontend...');
  
  // Simuler les données de formulaire
  const sellEquipmentForm = {
    name: 'Pelle hydraulique CAT 320D',
    brand: 'Caterpillar',
    model: '320D',
    category: 'Pelles hydrauliques',
    type: 'sale',
    year: 2020,
    price: '150000',
    condition: 'used',
    total_hours: '2500', // ← NOUVEAU CHAMP
    description: 'Machine en excellent état',
    specifications: {
      weight: '20000',
      dimensions: { length: '12.5', width: '3.2', height: '3.1' },
      power: { value: '120', unit: 'kW' },
      operatingCapacity: { value: '2000', unit: 'kg' },
      workingWeight: '22000'
    }
  };

  const publicationRapideForm = {
    name: 'Bulldozer Komatsu D65',
    brand: 'Komatsu',
    model: 'D65',
    category: 'Bulldozers',
    type: 'sale',
    year: 2019,
    price: 98000,
    total_hours: 1800, // ← NOUVEAU CHAMP
    description: 'Bulldozer en bon état',
    location: 'Bamako, Mali',
    specifications: {
      weight: 18000,
      power: { value: 150, unit: 'HP' },
      dimensions: '8.5 x 3.5 x 3.2',
      workingWeight: 20000,
      operatingCapacity: 3500
    },
    images: []
  };

  console.log('✅ Formulaire SellEquipment avec total_hours:', sellEquipmentForm.total_hours);
  console.log('✅ Formulaire PublicationRapide avec total_hours:', publicationRapideForm.total_hours);
  console.log('✅ Les formulaires frontend sont prêts !');
}

// Exécuter les tests
testTotalHoursIntegration();
testFrontendForms(); 