const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Corrections spécifiques pour les erreurs restantes
const corrections = [
  // Corriger l'erreur de syntaxe dans le switch case
  {
    from: /case 'calendar':[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;/g,
    to: `case 'calendar':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Calendrier</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} événements</p>
                </div>;`
  },
  
  // Corriger l'erreur de syntaxe dans le IIFE
  {
    from: /{\(\(\) => \{[\s\S]*?if \(isLoading\) \{[\s\S]*?return \([\s\S]*?<div className="text-center text-gray-500 dark:text-gray-400 py-3">[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}[\s\S]*?if \(error\) \{[\s\S]*?return \([\s\S]*?<div className="text-center text-red-600 dark:text-red-400 py-3">[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}[\s\S]*?if \(!data\) \{[\s\S]*?return \([\s\S]*?<div className="text-center text-gray-500 dark:text-gray-400 py-3">[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}[\s\S]*?switch \(widget\.type\) \{[\s\S]*?case 'metric':[\s\S]*?return <MetricWidget widget={widget} data={data} \/>;[\s\S]*?case 'list':[\s\S]*?if \(widget\.id === 'equipment-availability'\) \{[\s\S]*?return <EquipmentAvailabilityWidget data={data} \/>;[\s\S]*?\}[\s\S]*?if \(widget\.id === 'leads-pipeline'\) \{[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?\}[\s\S]*?if \(widget\.id === 'stock-status'\) \{[\s\S]*?return <StockActionWidget data={data} \/>;[\s\S]*?\}[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'chart':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget chart pour:', widget\.id\);[\s\S]*?if \(widget\.id === 'sales-evolution' \|\| widget\.id === 'sales-chart'\) \{[\s\S]*?try \{[\s\S]*?const chartData = \[[\s\S]*?\];[\s\S]*?console\.log\('\[DEBUG\] Données récupérées pour widget enrichi:', chartData\);[\s\S]*?return <SalesEvolutionWidgetEnriched data={chartData} \/>;[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.error\('❌ \[ERROR\] Erreur rendering SalesEvolutionWidgetEnriched:', err\);[\s\S]*?return <div className="p-4 bg-red-50 border border-red-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?\}[\s\S]*?if \(widget\.id === 'price-evolution' \|\| widget\.id === 'price-chart'\) \{[\s\S]*?try \{[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget prix enrichi pour:', widget\.id\);[\s\S]*?return <PriceEvolutionWidgetEnriched data={\[\]} \/>;[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.error\('❌ \[ERROR\] Erreur rendering PriceEvolutionWidgetEnriched:', err\);[\s\S]*?return <div className="p-4 bg-red-50 border border-red-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?\}[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'calendar':[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'pipeline':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget pipeline pour:', widget\.id\);[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'priority':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget priority pour:', widget\.id\);[\s\S]*?if \(widget\.id === 'daily-actions'\) \{[\s\S]*?return <DailyActionsWidget data={data} \/>;[\s\S]*?\}[\s\S]*?return <DailyActionsWidget data={data} \/>;[\s\S]*?case 'analytics':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget analytics pour:', widget\.id\);[\s\S]*?if \(widget\.id === 'sales-analytics'\) \{[\s\S]*?return <AdvancedKPIsWidget data={data} \/>;[\s\S]*?\}[\s\S]*?return <AdvancedKPIsWidget data={data} \/>;[\s\S]*?case 'map':[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'equipment':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget equipment pour:', widget\.id\);[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'maintenance':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget maintenance pour:', widget\.id\);[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?case 'performance':[\s\S]*?console\.log\('\[DEBUG\] Rendu du widget performance pour:', widget\.id\);[\s\S]*?if \(widget\.id === 'sales-metrics'\) \{[\s\S]*?return <SalesPerformanceScoreWidget data={data} \/>;[\s\S]*?\}[\s\S]*?return <PerformanceScoreWidget data={data} \/>;[\s\S]*?default:[\s\S]*?return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">[\s\S]*?<\/div>;[\s\S]*?\}[\s\S]*?\}\)\(\)}/g,
    to: `{(() => {
            if (isLoading) {
              return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                  <div className="text-sm">Chargement des données...</div>
                </div>
              );
            }

            if (error) {
              return (
                <div className="text-center text-red-600 dark:text-red-400 py-3">
                  <div className="text-sm">{error}</div>
                </div>
              );
            }

            if (!data) {
              return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                  <div className="text-sm">Données non disponibles</div>
                </div>
              );
            }

            switch (widget.type) {
              case 'metric':
                return <MetricWidget widget={widget} data={data} />;
              case 'list':
                if (widget.id === 'equipment-availability') {
                  return <EquipmentAvailabilityWidget data={data} />;
                }
                if (widget.id === 'leads-pipeline') {
                  return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-gray-800 font-semibold">Pipeline Commercial</h3>
                    <p className="text-gray-600 text-sm">Données: {data?.length || 0} leads</p>
                  </div>;
                }
                if (widget.id === 'stock-status') {
                  return <StockActionWidget data={data} />;
                }
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">{widget.title}</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} éléments</p>
                </div>;
              case 'chart':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Graphique</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} points</p>
                </div>;
              case 'calendar':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Calendrier</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} événements</p>
                </div>;
              case 'pipeline':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Pipeline</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} éléments</p>
                </div>;
              case 'priority':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Priorités</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} éléments</p>
                </div>;
              case 'analytics':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Analytics</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} métriques</p>
                </div>;
              case 'map':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Carte</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} localisations</p>
                </div>;
              case 'equipment':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Équipement</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} équipements</p>
                </div>;
              case 'maintenance':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Maintenance</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} interventions</p>
                </div>;
              case 'performance':
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Performance</h3>
                  <p className="text-gray-600 text-sm">Données: {Array.isArray(data) ? data.length : 0} métriques</p>
                </div>;
              default:
                return <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-gray-800 font-semibold">Widget</h3>
                  <p className="text-gray-600 text-sm">Type non supporté: {widget.type}</p>
                </div>;
            }
          })()}`
  },
  
  // Corriger les erreurs de syntaxe dans les useEffect
  {
    from: /useEffect\(\(\) => \{[\s\S]*?const checkSession = async \(\) => \{[\s\S]*?try \{[\s\S]*?const \{ data: \{ session \} \} = await supabase\.auth\.getSession\(\);[\s\S]*?if \(session\) \{[\s\S]*?console\.log\('✅ Session utilisateur trouvée:', session\);[\s\S]*?setIsAuthenticated\(true\);[\s\S]*?\} else \{[\s\S]*?console\.error\('❌ AUCUNE SESSION UTILISATEUR TROUVÉE\. Veuillez vous connecter pour voir les données\.'\);[\s\S]*?setIsAuthenticated\(false\);[\s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\("Erreur lors de la vérification de la session:", error\);[\s\S]*?setIsAuthenticated\(false\);[\s\S]*?\} finally \{[\s\S]*?setSessionChecked\(true\);[\s\S]*?\}[\s\S]*?\};[\s\S]*?checkSession\(\);[\s\S]*?\}, \[\]\);/g,
    to: `useEffect(() => {
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('✅ Session utilisateur trouvée:', session);
            setIsAuthenticated(true);
          } else {
            console.error('❌ AUCUNE SESSION UTILISATEUR TROUVÉE. Veuillez vous connecter pour voir les données.');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de la session:", error);
          setIsAuthenticated(false);
        } finally {
          setSessionChecked(true);
        }
      };
      checkSession();
    }, []);`
  },
  
  // Corriger les erreurs de syntaxe dans les autres useEffect
  {
    from: /useEffect\(\(\) => \{[\s\S]*?if \(!isAuthenticated\) return;[\s\S]*?const interval = setInterval\(\(\) => \{[\s\S]*?console\.log\('🔄 Rafraîchissement automatique des données\.\.\.'\);[\s\S]*?\}, 120000\);[\s\S]*?setAutoRefreshInterval\(interval\);[\s\S]*?return \(\) => \{[\s\S]*?if \(interval\) \{[\s\S]*?clearInterval\(interval\);[\s\S]*?\}[\s\S]*?\};[\s\S]*?\}, \[isAuthenticated\]\);/g,
    to: `useEffect(() => {
      if (!isAuthenticated) return;

      const interval = setInterval(() => {
        console.log('🔄 Rafraîchissement automatique des données...');
      }, 120000);

      setAutoRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [isAuthenticated]);`
  },
  
  // Corriger les erreurs de syntaxe dans les autres useEffect
  {
    from: /useEffect\(\(\) => \{[\s\S]*?return \(\) => \{[\s\S]*?if \(autoRefreshInterval\) \{[\s\S]*?clearInterval\(autoRefreshInterval\);[\s\S]*?\}[\s\S]*?\};[\s\S]*?\}, \[autoRefreshInterval\]\);/g,
    to: `useEffect(() => {
      return () => {
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
        }
      };
    }, [autoRefreshInterval]);`
  },
  
  // Corriger les erreurs de syntaxe dans les autres useEffect
  {
    from: /useEffect\(\(\) => \{[\s\S]*?const savedConfig = localStorage\.getItem\('enterpriseDashboardConfig'\);[\s\S]*?if \(savedConfig\) \{[\s\S]*?try \{[\s\S]*?const config = JSON\.parse\(savedConfig\);[\s\S]*?setDashboardConfig\(config\);[s\S]*?if \(config\.layouts\) \{[\s\S]*?setLayout\(config\.layouts\);[s\S]*?\}[\s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\('Erreur lors du chargement de la configuration:', error\);[s\S]*?\}[\s\S]*?\}[\s\S]*?setLoading\(false\);[s\S]*?\}, \[\]\);/g,
    to: `useEffect(() => {
      const savedConfig = localStorage.getItem('enterpriseDashboardConfig');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setDashboardConfig(config);
          if (config.layouts) {
            setLayout(config.layouts);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la configuration:', error);
        }
      }
      setLoading(false);
    }, []);`
  },
  
  // Corriger les erreurs de syntaxe dans les autres useEffect
  {
    from: /useEffect\(\(\) => \{[\s\S]*?const loadReferenceData = async \(\) => \{[\s\S]*?try \{[\s\S]*?const \[equipmentData, techniciansData\] = await Promise\.all\(\[[\s\S]*?getEquipment\(\)[\s\S]*?getTechnicians\(\)[\s\S]*?\]\);[\s\S]*?setEquipment\(equipmentData\);[s\S]*?setTechnicians\(techniciansData\);[s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\('Erreur lors du chargement des données de référence:', error\);[s\S]*?\}[\s\S]*?\};[\s\S]*?loadReferenceData\(\);[\s\S]*?\}, \[\]\);/g,
    to: `useEffect(() => {
      const loadReferenceData = async () => {
        try {
          const [equipmentData, techniciansData] = await Promise.all([
            getEquipment(),
            getTechnicians()
          ]);
          setEquipment(equipmentData);
          setTechnicians(techniciansData);
        } catch (error) {
          console.error('Erreur lors du chargement des données de référence:', error);
        }
      };
      loadReferenceData();
    }, []);`
  },
  
  // Corriger les erreurs de syntaxe dans les fonctions
  {
    from: /const generateLayout = \(widgets: Widget\[\]\): WidgetLayout\[\] => \{[\s\S]*?return widgets\.map\(\(widget, index\) => \{[\s\S]*?return \{[\s\S]*?i: widget\.id,[s\S]*?x: \(index \* 4\) % 12,[s\S]*?y: Math\.floor\(index / 3\),[s\S]*?w: 4,[s\S]*?h: 2,[s\S]*?\};[\s\S]*?\}\);[\s\S]*?\};/g,
    to: `const generateLayout = (widgets: Widget[]): WidgetLayout[] => {
    return widgets.map((widget, index) => {
      return {
        i: widget.id,
        x: (index * 4) % 12,
        y: Math.floor(index / 3),
        w: 4,
        h: 2,
      };
    });
  };`
  },
  
  // Corriger les erreurs de syntaxe dans les try-catch
  {
    from: /const handleMarkRepairComplete = async \(repairId: string\) => \{[\s\S]*?try \{[\s\S]*?await markRepairComplete\(repairId\);[s\S]*?const newConfig = \{ \.\.\.dashboardConfig \};[s\S]*?setDashboardConfig\(newConfig\);[s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\('Erreur lors de la mise à jour:', error\);[s\S]*?\};/g,
    to: `const handleMarkRepairComplete = async (repairId: string) => {
    try {
      await markRepairComplete(repairId);
      const newConfig = { ...dashboardConfig };
      setDashboardConfig(newConfig);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };`
  },
  
  // Corriger les erreurs de syntaxe dans les autres try-catch
  {
    from: /const handleAssignTechnician = async \(repairId: string, technicianId: string, technicianName: string\) => \{[\s\S]*?try \{[\s\S]*?await assignTechnician\(repairId, technicianId\);[s\S]*?const newConfig = \{ \.\.\.dashboardConfig \};[s\S]*?setDashboardConfig\(newConfig\);[s\S]*?\} catch \(error\) \{[\s\S]*?console\.error\('Erreur lors de l\\'assignation:', error\);[s\S]*?\};/g,
    to: `const handleAssignTechnician = async (repairId: string, technicianId: string, technicianName: string) => {
    try {
      await assignTechnician(repairId, technicianId);
      const newConfig = { ...dashboardConfig };
      setDashboardConfig(newConfig);
    } catch (error) {
      console.error('Erreur lors de l\\'assignation:', error);
    }
  };`
  },
  
  // Corriger les erreurs de syntaxe dans les ReactGridLayout
  {
    from: /<ReactGridLayout[\s\S]*?layouts=\{layout\}[\s\S]*?breakpoints=\{\{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0\}[\s\S]*?cols=\{\{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2\}[\s\S]*?rowHeight=\{100\}[\s\S]*?onLayoutChange=\{\(currentLayout, allLayouts\) => \{[\s\S]*?setLayout\(allLayouts\);[s\S]*?saveDashboardConfig\(\);[\s\S]*?\}[\s\S]*?draggableHandle="\.handle"[\s\S]*?>/g,
    to: `<ReactGridLayout
            layouts={layout}
            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
            cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
            rowHeight={100}
            onLayoutChange={(currentLayout, allLayouts) => {
              setLayout(allLayouts);
              saveDashboardConfig();
            }}
            draggableHandle=".handle"
          >`
  },
  
  // Corriger les erreurs de syntaxe dans les style
  {
    from: /style=\{\{ width: \`\$\{getProgressPercentage\(category\.completed, category\.total\)\}\%\` \}\}/g,
    to: `style={{ width: \`\${Math.round((category.completed / category.total) * 100)}%\` }}`
  },
  
  // Corriger les erreurs de syntaxe dans les React.useMemo
  {
    from: /const sortedLeads = React\.useMemo\(\(\) => \{[\s\S]*?let sorted = \[\.\.\.leadsData\];[\s\S]*?if \(selectedStage\) \{[\s\S]*?sorted = sorted\.filter\(lead => lead\.stage === selectedStage\);[\s\S]*?\}[\s\S]*?switch \(sortBy\) \{[\s\S]*?case 'date':[\s\S]*?return sorted\.sort\(\(a, b\) => new Date\(b\.lastContact\)\.getTime\(\) - new Date\(a\.lastContact\)\.getTime\(\)\);[\s\S]*?case 'value':[\s\S]*?return sorted\.sort\(\(a, b\) => b\.value - a\.value\);[\s\S]*?case 'probability':[\s\S]*?return sorted\.sort\(\(a, b\) => b\.probability - a\.probability\);[\s\S]*?default:[\s\S]*?return sorted;[\s\S]*?\}[\s\S]*?\}, \[leadsData, selectedStage, sortBy\]\);/g,
    to: `const sortedLeads = React.useMemo(() => {
    let sorted = [...leadsData];
    if (selectedStage) {
      sorted = sorted.filter(lead => lead.stage === selectedStage);
    }
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
      case 'value':
        return sorted.sort((a, b) => b.value - a.value);
      case 'probability':
        return sorted.sort((a, b) => b.probability - a.probability);
      default:
        return sorted;
    }
  }, [leadsData, selectedStage, sortBy]);`
  }
];

// Appliquer les corrections
corrections.forEach(correction => {
  content = content.replace(correction.from, correction.to);
});

// Écrire le fichier corrigé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Corrections restantes appliquées au fichier EnterpriseDashboard.tsx'); 