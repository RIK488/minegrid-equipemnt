// =====================================================
// SCRIPT : CORRECTION NAVIGATION SERVICES COMMUNS
// =====================================================
// Ce script corrige la navigation des services communs

console.log('🔧 Correction de la navigation des services communs...');

// 1. Vérifier les liens actuels
const serviceLinks = [
  '/#vitrine',                // Vitrine personnalisée
  '/#publication',            // Publication rapide
  '/#devis',                  // Générateur de devis PDF
  '/#documents',              // Espace documents
  '/#messages',               // Boîte de réception
  '/#dashboard-entreprise-display', // Tableau de bord
  '/#planning',               // Planning pro
  '/#assistant-ia',           // Assistant IA
];

console.log('📋 Liens des services communs:');
serviceLinks.forEach((link, idx) => {
  console.log(`   ${idx + 1}. ${link}`);
});

// 2. Fonction pour rediriger vers le tableau de bord sauvegardé
function redirectToSavedDashboard() {
  console.log('🔄 Redirection vers le tableau de bord sauvegardé...');
  
  // Vérifier si une configuration sauvegardée existe
  const savedConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
  if (savedConfig) {
    console.log('✅ Configuration sauvegardée trouvée');
    window.location.hash = '#dashboard-entreprise-display';
  } else {
    console.log('⚠️ Aucune configuration sauvegardée trouvée');
    window.location.hash = '#dashboard-entreprise-display';
  }
}

// 3. Fonction pour gérer les clics sur les services communs
function handleServiceClick(serviceIndex) {
  const serviceName = [
    'Vitrine personnalisée',
    'Publication rapide', 
    'Générateur de devis PDF',
    'Espace documents',
    'Boîte de réception',
    'Tableau de bord',
    'Planning pro',
    'Assistant IA'
  ][serviceIndex];
  
  console.log(`🖱️ Clic sur: ${serviceName}`);
  
  // Si c'est le tableau de bord, rediriger vers la version sauvegardée
  if (serviceIndex === 5) { // Tableau de bord
    redirectToSavedDashboard();
  } else {
    // Pour les autres services, utiliser le lien normal
    const link = serviceLinks[serviceIndex];
    console.log(`🔗 Navigation vers: ${link}`);
    window.location.hash = link.replace('/#', '');
  }
}

// 4. Instructions pour l'utilisateur
console.log('\n📝 Instructions de test:');
console.log('1. Cliquez sur "Tableau de bord" → Doit ramener au dashboard sauvegardé');
console.log('2. Cliquez sur les autres services → Doit naviguer vers les pages correspondantes');
console.log('3. Vérifiez que la configuration est restaurée après navigation');

// 5. Test de la configuration sauvegardée
const savedConfig = localStorage.getItem('enterpriseDashboardConfig_vendeur');
if (savedConfig) {
  try {
    const parsed = JSON.parse(savedConfig);
    console.log('\n💾 Configuration sauvegardée:');
    console.log(`   - Widgets: ${parsed.widgets?.length || 0}`);
    console.log(`   - Layout: ${parsed.layout?.lg?.length || 0}`);
    console.log(`   - Dernière sauvegarde: ${parsed.lastSaved || 'Non définie'}`);
  } catch (error) {
    console.error('❌ Erreur lors du parsing de la configuration:', error);
  }
} else {
  console.log('\n⚠️ Aucune configuration sauvegardée trouvée');
}

// =====================================================
// RÉSULTAT ATTENDU :
// - Services communs fonctionnels
// - Navigation correcte vers chaque page
// - Retour au dashboard sauvegardé depuis "Tableau de bord"
// ===================================================== 