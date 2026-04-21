const fs = require('fs');
const path = require('path');

console.log('🔧 Début de la correction finale du fichier EnterpriseDashboard.tsx...');

const filePath = path.join(__dirname, 'src', 'pages', 'EnterpriseDashboard.tsx');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');
console.log('✅ Fichier lu en UTF-8');

// Corrections finales
const corrections = [
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
  },
  
  // Corriger les erreurs de syntaxe dans les fonctions
  {
    from: /const getNextActionForStage = \(stage: string\) => \{[\s\S]*?switch \(stage\) \{[\s\S]*?case 'Prospection':[\s\S]*?return 'Appel de qualification';[\s\S]*?case 'Qualification':[\s\S]*?return 'Envoi de devis';[\s\S]*?case 'Devis':[\s\S]*?return 'Suivi de devis';[\s\S]*?case 'Négociation':[\s\S]*?return 'Finalisation';[\s\S]*?case 'Fermeture':[\s\S]*?return 'Signature contrat';[\s\S]*?default:[\s\S]*?return 'Contact client';[\s\S]*?\};/g,
    to: `const getNextActionForStage = (stage: string) => {
    switch (stage) {
      case 'Prospection':
        return 'Appel de qualification';
      case 'Qualification':
        return 'Envoi de devis';
      case 'Devis':
        return 'Suivi de devis';
      case 'Négociation':
        return 'Finalisation';
      case 'Fermeture':
        return 'Signature contrat';
      default:
        return 'Contact client';
    }
  };`
  }
];

// Appliquer les corrections
let correctionsApplied = 0;
corrections.forEach((correction, index) => {
  const newContent = content.replace(correction.from, correction.to);
  if (newContent !== content) {
    content = newContent;
    correctionsApplied++;
    console.log(`✅ Correction ${index + 1} appliquée`);
  }
});

// Écrire le fichier corrigé
fs.writeFileSync(filePath, content, 'utf8');

console.log(`🎉 Corrections terminées ! ${correctionsApplied} corrections appliquées au fichier EnterpriseDashboard.tsx`);

// 1. Corriger la fermeture du WidgetComponent (ligne 1532)
content = content.replace(
  /          }\)\}\)\(\n        <\/div>\n      <\/div>\n    <\/div>\n  \);/g,
  `          })()}
        </div>
      </div>
    </div>
  );
`
);

// 2. Supprimer le doublon DailyActionsWidget (ligne 2823)
content = content.replace(
  /const DailyActionsWidget = \(\{ data \}: \{ data: any \}\) => \{\n  return \(\n    <div>\n      \{\/\* Affichage des actions journalières \*\/\}\n      \{data && data\.length > 0 \? \(\n        <ul>\n          \{data\.map\(\(action, idx\) => \(\n            <li key=\{idx\}>\{action\.label \|\| JSON\.stringify\(action\)\}<\/li>\n          \)\)\}\n        <\/ul>\n      \) : \(\n        <p>Aucune action pour aujourd'hui\.<\/p>\n      \)\}\n    <\/div>\n  \);\n\};/g,
  '// Suppression du doublon DailyActionsWidget'
);

// 3. Supprimer le doublon RentalDetailsModal (ligne 2851)
content = content.replace(
  /const RentalDetailsModal = \(\{ rental, onClose \}: \{ rental: any; onClose: \(\) => void \}\) => \{\n  return \(\n    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">\n      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">\n        <div className="flex justify-between items-center p-6 border-b">\n          <h3 className="text-xl font-semibold text-gray-900">Détails de la location<\/h3>\n          <button onClick=\{onClose\} className="text-gray-400 hover:text-gray-600">\n            <X className="h-6 w-6" \/>\n          <\/button>\n        <\/div>\n        <div className="p-6">\n          <div className="space-y-4">\n            <div>\n              <span className="text-gray-600">Équipement:<\/span>\n              <div className="font-medium">\{rental\?\.equipment \|\| 'N\/A'\}<\/div>\n            <\/div>\n            <div>\n              <span className="text-gray-600">Statut:<\/span>\n              <div className="font-medium">\{rental\?\.status \|\| 'N\/A'\}<\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n\};/g,
  '// Suppression du doublon RentalDetailsModal'
);

// 4. Corriger la fermeture du useEffect (ligne 2008)
content = content.replace(
  /    setLoading\(false\);\n  }, \[\]\);/g,
  `    setLoading(false);
  }, []);`
);

// 5. S'assurer que le fichier se termine correctement
if (!content.trim().endsWith('export default EnterpriseDashboard;')) {
  content = content.replace(
    /export default EnterpriseDashboard;?\s*$/,
    'export default EnterpriseDashboard;'
  );
}

// Écrire le fichier corrigé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Corrections appliquées avec succès !');
console.log('📝 Vérifiez maintenant les erreurs de linter...'); 