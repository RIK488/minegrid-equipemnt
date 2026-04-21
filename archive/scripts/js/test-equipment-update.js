// Script de test pour vérifier la modification d'équipement
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEquipmentUpdate() {
  console.log('🧪 Test de modification d\'équipement...');

  try {
    // 1. Récupérer un équipement existant
    const { data: equipment, error: fetchError } = await supabase
      .from('client_equipment')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return;
    }

    if (!equipment || equipment.length === 0) {
      console.log('⚠️ Aucun équipement trouvé pour le test');
      return;
    }

    const testEquipment = equipment[0];
    console.log('📋 Équipement trouvé:', testEquipment.serial_number);

    // 2. Tester la modification
    const newLocation = 'Nouvelle localisation test - ' + new Date().toISOString();
    
    const { data: updatedEquipment, error: updateError } = await supabase
      .from('client_equipment')
      .update({
        location: newLocation,
        updated_at: new Date().toISOString()
      })
      .eq('id', testEquipment.id)
      .select();

    if (updateError) {
      console.error('❌ Erreur lors de la modification:', updateError);
      console.error('Détails de l\'erreur:', updateError.message);
      console.error('Code d\'erreur:', updateError.code);
      return;
    }

    console.log('✅ Modification réussie !');
    console.log('📝 Nouvelle localisation:', updatedEquipment[0].location);
    console.log('🕒 Date de mise à jour:', updatedEquipment[0].updated_at);

    // 3. Vérifier que la modification est bien enregistrée
    const { data: verifyEquipment, error: verifyError } = await supabase
      .from('client_equipment')
      .select('*')
      .eq('id', testEquipment.id)
      .single();

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }

    if (verifyEquipment.location === newLocation) {
      console.log('✅ Vérification réussie - La modification est bien enregistrée');
    } else {
      console.log('❌ Vérification échouée - La modification n\'est pas enregistrée');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEquipmentUpdate(); 