// =====================================================
// DÉPLOIEMENT DE LA FONCTION EDGE EXCHANGE-RATES
// =====================================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Déploiement de la fonction Edge exchange-rates...\n');

async function deployExchangeRates() {
  try {
    // Vérifier que Supabase CLI est installé
    console.log('📋 Étape 1: Vérification de Supabase CLI...');
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      console.log('✅ Supabase CLI détecté');
    } catch (error) {
      console.log('❌ Supabase CLI non trouvé');
      console.log('📥 Installez-le avec: npm install -g supabase');
      return;
    }

    // Vérifier que le projet est initialisé
    console.log('\n📋 Étape 2: Vérification du projet Supabase...');
    if (!fs.existsSync('supabase/config.toml')) {
      console.log('❌ Projet Supabase non initialisé');
      console.log('🔧 Initialisez avec: supabase init');
      return;
    }
    console.log('✅ Projet Supabase détecté');

    // Vérifier que la fonction existe
    console.log('\n📋 Étape 3: Vérification de la fonction exchange-rates...');
    const functionPath = path.join('supabase', 'functions', 'exchange-rates');
    if (!fs.existsSync(functionPath)) {
      console.log('❌ Fonction exchange-rates non trouvée');
      console.log('📁 Créez le dossier: supabase/functions/exchange-rates/');
      return;
    }
    console.log('✅ Fonction exchange-rates trouvée');

    // Déployer la fonction
    console.log('\n📋 Étape 4: Déploiement de la fonction...');
    try {
      execSync('supabase functions deploy exchange-rates', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Fonction déployée avec succès');
    } catch (error) {
      console.log('❌ Erreur lors du déploiement:', error.message);
      console.log('\n🔧 Solution alternative:');
      console.log('   1. Connectez-vous à Supabase Dashboard');
      console.log('   2. Allez dans Edge Functions');
      console.log('   3. Créez manuellement la fonction exchange-rates');
      return;
    }

    console.log('\n🎉 DÉPLOIEMENT TERMINÉ !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Rechargez votre application');
    console.log('   2. L\'erreur 500 sur exchange-rates devrait disparaître');
    console.log('   3. Les taux de change devraient fonctionner');

  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error);
  }
}

// Exécution
deployExchangeRates(); 