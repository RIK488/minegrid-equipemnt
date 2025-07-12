#!/usr/bin/env node

/**
 * Script de test pour vérifier le service local de taux de change
 * 
 * Utilisation:
 * node test-exchange-rates.js
 */

import { getExchangeRates, getExchangeRate, convertCurrency } from './src/utils/exchangeRates.js';
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NzI4NzYsImV4cCI6MjA0NzU0ODg3Nn0.iQjnhHcoHh_wV_ROIIinv1vLnLpiUoC4wddq8lHWVM0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Test du service local de taux de change...\n');

async function testExchangeRates() {
  console.log('🧪 Test de la fonction exchange-rates...');
  
  try {
    // Test 1: Appel direct de la fonction
    console.log('\n1️⃣ Test appel direct de la fonction...');
    const { data, error } = await supabase.functions.invoke('exchange-rates');
    
    if (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error);
    } else {
      console.log('✅ Fonction appelée avec succès:', data);
    }
    
    // Test 2: Appel via fetch
    console.log('\n2️⃣ Test appel via fetch...');
    const response = await fetch(`${supabaseUrl}/functions/v1/exchange-rates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données reçues:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', errorText);
    }
    
    // Test 3: Vérification des fonctions déployées
    console.log('\n3️⃣ Vérification des fonctions déployées...');
    const { data: functions, error: functionsError } = await supabase.functions.list();
    
    if (functionsError) {
      console.error('❌ Erreur lors de la récupération des fonctions:', functionsError);
    } else {
      console.log('📋 Fonctions disponibles:', functions.map(f => f.name));
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Test des taux de change par défaut
function testDefaultRates() {
  console.log('\n4️⃣ Test des taux de change par défaut...');
  
  const defaultRates = {
    EUR: 1,
    USD: 1.1,
    MAD: 11,
    XOF: 655,
    XAF: 655,
    NGN: 1650,
    ZAR: 20,
    EGP: 33,
    KES: 150,
    GHS: 15
  };
  
  console.log('✅ Taux par défaut:', defaultRates);
  
  // Test de conversion
  const amount = 1000;
  const fromCurrency = 'EUR';
  const toCurrency = 'MAD';
  
  const convertedAmount = amount * defaultRates[toCurrency] / defaultRates[fromCurrency];
  console.log(`💱 Conversion: ${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`);
}

async function main() {
  console.log('🚀 Démarrage des tests exchange-rates...\n');
  
  await testExchangeRates();
  testDefaultRates();
  
  console.log('\n✅ Tests terminés');
}

main().catch(console.error); 