const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');

console.log('🔧 Déplacement des fonctions utilitaires au début du fichier...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Extraire les fonctions utilitaires de la fin du fichier
  const functionsToMove = `
// Fonctions utilitaires
const getSalesPerformanceScoreData = () => ({ 
  score: 85, 
  trend: 'up', 
  details: [
    { metric: 'Taux de conversion', value: 15.2, target: 12.0, status: 'excellent' },
    { metric: 'Valeur moyenne', value: 45000, target: 40000, status: 'bon' },
    { metric: 'Cycle de vente', value: 28, target: 30, status: 'excellent' }
  ] 
});

const getPerformanceScoreData = () => ({ 
  score: 72, 
  trend: 'stable', 
  details: [
    { metric: 'Efficacité opérationnelle', value: 78, target: 75, status: 'bon' },
    { metric: 'Satisfaction client', value: 85, target: 80, status: 'excellent' },
    { metric: 'Temps de réponse', value: 4.2, target: 5.0, status: 'excellent' }
  ] 
});

const getChartData = (id: string) => {
  const chartData = {
    'sales-evolution': [
      { month: 'Jan', value: 120000, target: 100000 },
      { month: 'Fév', value: 135000, target: 110000 },
      { month: 'Mar', value: 145000, target: 120000 },
      { month: 'Avr', value: 160000, target: 130000 },
      { month: 'Mai', value: 175000, target: 140000 },
      { month: 'Juin', value: 190000, target: 150000 }
    ],
    'revenue-trend': [
      { month: 'Jan', revenue: 85000, expenses: 45000 },
      { month: 'Fév', revenue: 92000, expenses: 48000 },
      { month: 'Mar', revenue: 105000, expenses: 52000 },
      { month: 'Avr', revenue: 118000, expenses: 55000 },
      { month: 'Mai', revenue: 132000, expenses: 58000 },
      { month: 'Juin', revenue: 145000, expenses: 62000 }
    ]
  };
  return chartData[id] || [];
};

const getCalendarData = (id: string) => {
  return [
    {
      id: 1,
      title: 'Réunion client - Projet minier',
      date: '2024-01-15',
      time: '10:00',
      type: 'meeting',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Maintenance préventive - Excavatrice',
      date: '2024-01-16',
      time: '14:30',
      type: 'maintenance',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Livraison équipements',
      date: '2024-01-17',
      time: '09:00',
      type: 'delivery',
      priority: 'high'
    }
  ];
};

// Composant CalendarWidget
const CalendarWidget = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Calendrier</h3>
      <div className="space-y-2">
        {data.map((event) => (
          <div key={event.id} className="flex items-center p-2 bg-gray-50 rounded">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <div className="font-medium text-sm">{event.title}</div>
              <div className="text-xs text-gray-600">
                {event.date} à {event.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

`;

  // 2. Supprimer les fonctions de la fin du fichier
  content = content.replace(/\/\/ Fonctions utilitaires manquantes[\s\S]*?export default EnterpriseDashboard;/, 'export default EnterpriseDashboard;');
  
  // 3. Ajouter les fonctions au début du fichier, après les imports
  const importEndIndex = content.lastIndexOf('import');
  if (importEndIndex !== -1) {
    const importEndLine = content.indexOf('\n', importEndIndex);
    if (importEndLine !== -1) {
      const beforeImports = content.substring(0, importEndLine + 1);
      const afterImports = content.substring(importEndLine + 1);
      content = beforeImports + functionsToMove + afterImports;
    }
  }
  
  // 4. Écrire le fichier corrigé
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fonctions utilitaires déplacées au début du fichier');
  console.log('✅ Fichier EnterpriseDashboard.tsx corrigé avec succès');
  
} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
} 