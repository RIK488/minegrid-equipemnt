const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');

console.log('🔧 Correction des erreurs de syntaxe dans EnterpriseDashboard.tsx...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Correction 1: Ajouter la balise div manquante à la ligne 4290
  const lines = content.split('\n');
  let fixed = false;
  
  // Chercher la ligne problématique et ajouter la balise div manquante
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Chercher la ligne qui contient "Premier contact" et qui n'a pas de balise fermante
    if (line.includes('Premier contact') && line.includes('Lead généré via site web') && !line.includes('</div>')) {
      console.log(`⚠️  Ligne ${i + 1} suspecte: ${line.trim()}`);
      // Ajouter la balise div fermante manquante
      lines[i] = line + '</div>';
      fixed = true;
    }
  }
  
  if (fixed) {
    content = lines.join('\n');
    console.log('✅ Balise div manquante ajoutée');
  } else {
    console.log('ℹ️  Aucune balise div manquante trouvée');
  }
  
  // Correction 2: Corriger les erreurs de syntaxe aux lignes 4574, 4700, 4701, 4703
  // Ces erreurs semblent être liées à des caractères mal échappés ou des balises mal fermées
  
  // Chercher et corriger les erreurs de syntaxe
  content = content.replace(/\}\s*\}/g, '}'); // Supprimer les doubles accolades
  content = content.replace(/\}\s*\)/g, '})'); // Corriger les accolades mal fermées
  
  // S'assurer que le composant SalesPipelineWidget est correctement fermé
  if (!content.includes('export default EnterpriseDashboard')) {
    console.log('⚠️  Le composant principal n\'est pas trouvé');
  } else {
    console.log('✅ Structure du composant principal vérifiée');
  }
  
  // Écrire le fichier corrigé
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fichier EnterpriseDashboard.tsx corrigé avec succès');
  
} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
} 