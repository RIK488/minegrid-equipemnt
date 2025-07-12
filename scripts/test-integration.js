
// Script de test pour vérifier l'intégration
console.log('🧪 Test de l'intégration modulaire...');

// Vérifier que les fichiers existent
const requiredFiles = [
  'src/contexts/DashboardContext.tsx',
  'src/components/dashboard/MainDashboardLayout.tsx',
  'src/components/dashboard/TopBar.tsx',
  'src/components/dashboard/SidebarMenu.tsx',
  'src/components/dashboard/WidgetSkeleton.tsx',
  'src/components/dashboard/widgets/DailyPriorityActionsWidget.tsx',
  'src/components/dashboard/widgets/DailyActionsWidget.tsx',
  'src/components/dashboard/widgets/PerformanceScoreWidget.tsx',
  'src/components/dashboard/widgets/InventoryStatusWidget.tsx',
  'src/components/dashboard/widgets/SalesEvolutionWidget.tsx',
  'src/components/dashboard/widgets/SalesPipelineWidget.tsx',
  'src/hooks/useAdaptiveWidget.ts',
  'src/hooks/useDashboardConfig.ts',
  'src/hooks/useWidgetData.ts',
  'src/constants/dashboardTypes.ts',
  'src/constants/widgetConfigs.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('🎉 Tous les fichiers requis sont présents !');
  console.log('🚀 Le dashboard modulaire est prêt à être utilisé.');
} else {
  console.log('⚠️ Certains fichiers sont manquants. Vérifiez la structure.');
}

// Vérifier la taille du fichier principal
if (fs.existsSync('src/pages/EnterpriseDashboard.tsx')) {
  const content = fs.readFileSync('src/pages/EnterpriseDashboard.tsx', 'utf8');
  const lines = content.split('\n').length;
  const sizeKB = (content.length / 1024).toFixed(1);
  
  console.log(`\n📊 Taille du fichier principal: ${sizeKB} KB (${lines} lignes)`);
  
  if (lines < 100) {
    console.log('✅ Fichier principal considérablement réduit !');
  } else {
    console.log('⚠️ Le fichier principal semble encore volumineux.');
  }
}
