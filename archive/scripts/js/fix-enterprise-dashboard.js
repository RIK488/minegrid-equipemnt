import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier EnterpriseDashboard.tsx
const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');

console.log('🔧 CORRECTION DU FICHIER ENTERPRISE DASHBOARD');

const content = fs.readFileSync(filePath, 'utf8');

// Trouver le début et la fin de l'ancien composant
const startMarker = '// Widget Actions Commerciales Prioritaires - Version avancée';
const endMarker = 'export default function EnterpriseDashboard()';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  console.log('✅ Ancien composant trouvé, suppression en cours...');
  
  // Supprimer l'ancien composant
  const beforeComponent = content.substring(0, startIndex);
  const afterComponent = content.substring(endIndex);
  
  // Ajouter l'import du nouveau composant
  const importStatement = `import React, { useState, useEffect } from 'react';
import { DailyActionsPriorityWidget } from './DailyActionsWidgetFixed';`;
  
  const newContent = importStatement + '\n' + beforeComponent + afterComponent;
  
  fs.writeFileSync(filePath, newContent);
  console.log('✅ Ancien composant supprimé et nouveau importé !');
  console.log('🔄 Redémarre le serveur pour voir les changements');
} else {
  console.log('❌ Marqueurs non trouvés, fichier déjà corrigé ou structure différente');
} 