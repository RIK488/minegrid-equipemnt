#!/usr/bin/env node

/**
 * Script pour déployer la fonction exchange-rates corrigée
 * 
 * Utilisation:
 * node deploy-exchange-rates.js
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FUNCTION_NAME = 'exchange-rates';
const FUNCTION_PATH = join(process.cwd(), 'supabase', 'functions', FUNCTION_NAME);

console.log('🚀 Déploiement de la fonction exchange-rates...');

try {
  // Vérifier que le fichier existe
  const functionFile = join(FUNCTION_PATH, 'index.ts');
  const functionContent = readFileSync(functionFile, 'utf8');
  
  console.log('✅ Fichier de fonction trouvé');
  
  // Déployer la fonction
  console.log('📤 Déploiement en cours...');
  execSync(`npx supabase functions deploy ${FUNCTION_NAME}`, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Fonction déployée avec succès!');
  console.log('🌐 URL de la fonction:', `${process.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`);
  
} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  console.log('\n💡 Solutions alternatives:');
  console.log('1. Vérifiez que vous êtes connecté à Supabase CLI');
  console.log('2. Vérifiez que votre projet est configuré');
  console.log('3. Utilisez le service local en attendant');
  
  process.exit(1);
} 