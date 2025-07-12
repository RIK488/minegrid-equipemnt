const fs = require('fs');
const path = require('path');

console.log('🔄 Restauration du widget pipeline commercial...');

try {
  // Lire le widget fonctionnel
  const widgetContent = fs.readFileSync('temp-pipeline-widget.tsx', 'utf8');
  
  // Lire le dashboard
  const dashboardPath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');
  let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  // Remplacer le widget existant par le nouveau
  const widgetRegex = /const SalesPipelineWidget = \(\{ data \}: \{ data: any\[\] \}\) => \{[\s\S]*?\};/s;
  
  if (widgetRegex.test(dashboardContent)) {
    dashboardContent = dashboardContent.replace(widgetRegex, widgetContent);
    fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
    console.log('✅ Widget pipeline commercial restauré avec succès');
  } else {
    console.log('❌ Widget pipeline commercial non trouvé dans le dashboard');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la restauration:', error.message);
} 