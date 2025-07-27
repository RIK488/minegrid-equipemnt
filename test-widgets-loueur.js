// Script de test pour les widgets Loueur d'engins
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 TEST DES WIDGETS LOUEUR D\'ENGINS');

// Test 1: Vérifier la configuration des widgets
try {
  const { LoueurWidgets } = await import('./src/pages/widgets/LoueurWidgets.js');
  console.log('✅ Configuration LoueurWidgets chargée avec succès');
  console.log('📊 Nombre de widgets:', LoueurWidgets.widgets.length);
  
  // Afficher les widgets
  LoueurWidgets.widgets.forEach((widget, index) => {
    console.log(`${index + 1}. ${widget.title} (${widget.id})`);
  });
  
  // Vérifier que nous avons exactement 5 widgets
  if (LoueurWidgets.widgets.length === 5) {
    console.log('✅ Nombre correct de widgets (5)');
  } else {
    console.log('❌ Nombre incorrect de widgets:', LoueurWidgets.widgets.length);
  }
  
} catch (error) {
  console.error('❌ Erreur lors du chargement de LoueurWidgets:', error.message);
}

// Test 2: Vérifier la cohérence avec DashboardConfigurator
try {
  const configuratorPath = join(__dirname, 'src/pages/DashboardConfigurator.tsx');
  const configuratorContent = readFileSync(configuratorPath, 'utf8');
  
  // Extraire les widgets loueur du configurateur
  const loueurSection = configuratorContent.match(/id: 'loueur'[\s\S]*?widgets: \[([\s\S]*?)\]/);
  
  if (loueurSection) {
    const widgetsSection = loueurSection[1];
    const widgetMatches = widgetsSection.match(/id: '[^']*'/g);
    
    console.log('📋 Widgets dans DashboardConfigurator:');
    widgetMatches.forEach((match, index) => {
      const id = match.replace("id: '", "").replace("'", "");
      console.log(`${index + 1}. ${id}`);
    });
    
    if (widgetMatches.length === 5) {
      console.log('✅ Nombre correct de widgets dans le configurateur (5)');
    } else {
      console.log('❌ Nombre incorrect de widgets dans le configurateur:', widgetMatches.length);
    }
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification du configurateur:', error.message);
}

// Test 3: Vérifier les types de widgets
try {
  const { LoueurWidgets } = await import('./src/pages/widgets/LoueurWidgets.js');
  
  console.log('🔍 Types de widgets:');
  LoueurWidgets.widgets.forEach((widget, index) => {
    console.log(`${index + 1}. ${widget.title}: ${widget.type}`);
  });
  
  // Vérifier que tous les types sont valides
  const validTypes = ['metric', 'equipment', 'calendar', 'pipeline', 'daily-actions'];
  const allValid = LoueurWidgets.widgets.every(widget => validTypes.includes(widget.type));
  
  if (allValid) {
    console.log('✅ Tous les types de widgets sont valides');
  } else {
    console.log('❌ Certains types de widgets sont invalides');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des types:', error.message);
}

console.log('🏁 Test terminé'); 