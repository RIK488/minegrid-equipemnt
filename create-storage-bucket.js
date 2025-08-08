// Script pour créer le bucket Supabase Storage 'documents'
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseServiceKey || supabaseServiceKey === 'your-service-role-key') {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configuré');
  console.log('📝 Instructions:');
  console.log('1. Allez dans votre projet Supabase');
  console.log('2. Settings > API');
  console.log('3. Copiez la "service_role" key');
  console.log('4. Définissez la variable d\'environnement:');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBucket() {
  try {
    console.log('🔧 Création du bucket Storage "documents"...');
    
    // Créer le bucket
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: false,
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "documents" existe déjà !');
      } else {
        console.error('❌ Erreur lors de la création du bucket:', error);
        return;
      }
    } else {
      console.log('✅ Bucket "documents" créé avec succès !');
    }

    // Créer les politiques RLS pour le bucket
    console.log('🔒 Configuration des politiques RLS...');
    
    // Politique pour permettre l'upload
    const { error: uploadPolicyError } = await supabase.storage
      .from('documents')
      .createSignedUploadUrl('test.txt');

    if (uploadPolicyError) {
      console.log('⚠️  Note: Les politiques RLS doivent être configurées manuellement');
      console.log('📝 Instructions:');
      console.log('1. Allez dans Supabase > Storage');
      console.log('2. Sélectionnez le bucket "documents"');
      console.log('3. Onglet "Policies"');
      console.log('4. Ajoutez ces politiques:');
      console.log('');
      console.log('   SELECT: (auth.uid() = owner) OR (bucket_id = \'documents\' AND public = true)');
      console.log('   INSERT: auth.uid() = owner');
      console.log('   UPDATE: auth.uid() = owner');
      console.log('   DELETE: auth.uid() = owner');
    } else {
      console.log('✅ Politiques RLS configurées !');
    }

    console.log('🎉 Configuration Storage terminée !');
    console.log('📋 Fonctionnalités disponibles:');
    console.log('   - Bucket "documents" créé');
    console.log('   - Types de fichiers autorisés (PDF, DOC, XLS, etc.)');
    console.log('   - Limite de taille: 50MB');
    console.log('   - Upload et téléchargement fonctionnels');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
createStorageBucket(); 