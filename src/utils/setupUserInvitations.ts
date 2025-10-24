import supabase from './supabaseClient';

export async function setupUserInvitationsTable() {
  try {
    console.log('🔧 Configuration de la table user_invitations...');

    // Vérifier si la table existe déjà
    const { data: existingTable, error: checkError } = await supabase
      .from('user_invitations')
      .select('id')
      .limit(1);

    if (existingTable !== null) {
      console.log('✅ Table user_invitations existe déjà');
      return { success: true, message: 'Table déjà configurée' };
    }

    // Si la table n'existe pas, on va créer les données de test
    console.log('⚠️ Table user_invitations non trouvée. Création des données de test...');

    // Créer quelques invitations de test
    const testInvitations = [
      {
        email: 'test1@example.com',
        name: 'Test Utilisateur 1',
        role: 'manager',
        invited_by: '00000000-0000-0000-0000-000000000000', // UUID de test
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'test2@example.com',
        name: 'Test Utilisateur 2',
        role: 'technician',
        invited_by: '00000000-0000-0000-0000-000000000000', // UUID de test
        status: 'accepted',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: new Date().toISOString()
      }
    ];

    // Insérer les invitations de test
    const { data: insertedInvitations, error: insertError } = await supabase
      .from('user_invitations')
      .insert(testInvitations)
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de la création des données de test:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Données de test créées avec succès');
    console.log('📋 Invitations créées:', insertedInvitations?.length || 0);

    return { success: true, message: 'Configuration terminée avec succès' };
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

// Fonction pour nettoyer les données de test
export async function cleanupTestData() {
  try {
    const { error } = await supabase
      .from('user_invitations')
      .delete()
      .like('email', 'test%@example.com');

    if (error) {
      console.error('Erreur nettoyage données test:', error);
      return false;
    }

    console.log('✅ Données de test nettoyées');
    return true;
  } catch (error) {
    console.error('Erreur nettoyage:', error);
    return false;
  }
}
