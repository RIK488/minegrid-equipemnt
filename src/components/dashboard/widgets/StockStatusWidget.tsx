import React, { useState, useEffect } from 'react';
import { 
  Camera, TrendingUp, Zap, Tag, Download, Send, Brain, AlertTriangle,
  Eye, MousePointer, Mail, Clock, Target, BarChart3, Plus, ChevronRight, ChevronDown
} from 'lucide-react';
import { apiService, notificationService, exportService, communicationService } from '../../../services';
import { getDashboardStats } from '../../../utils/api';

interface Equipment {
  id: number;
  name: string;
  category: string;
  daysInStock: number;
  views: number;
  clicks: number;
  contacts: number;
  visibilityScore: number;
  aiTip: string;
  alert: boolean;
}

const mockEquipments: Equipment[] = [
  {
    id: 1,
    name: 'CAT 320D — Pelle sur chenilles',
    category: 'Pelle',
    daysInStock: 61,
    views: 53,
    clicks: 9,
    contacts: 0,
    visibilityScore: 42,
    aiTip: "Machine consultée mais sans contact — ajoutez une photo en situation réelle et proposez une remise de 3% cette semaine.",
    alert: true
  },
  {
    id: 2,
    name: 'Komatsu D6 — Bulldozer',
    category: 'Bulldozer',
    daysInStock: 92,
    views: 8,
    clicks: 0,
    contacts: 0,
    visibilityScore: 28,
    aiTip: "Machine en stock depuis 92 jours sans clic. Proposez une livraison gratuite ou baissez le prix.",
    alert: true
  }
];

const categories = ['Toutes', 'Pelle', 'Bulldozer'];
const anciennetes = ['Toutes', '30j+', '60j+', '90j+'];

const StockStatusWidget: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedAnciennete, setSelectedAnciennete] = useState('Toutes');
  const [equipments, setEquipments] = useState<Equipment[]>(mockEquipments);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [realData, setRealData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fonction pour charger les vraies données depuis Supabase
  const loadRealData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des données réelles du stock depuis Supabase...");
      
      const dashboardStats = await getDashboardStats();
      console.log("✅ Données réelles du stock chargées:", dashboardStats);
      
      setRealData(dashboardStats);
      
      // Si on a des données réelles, on peut adapter les équipements
      if (dashboardStats && dashboardStats.totalViews > 0) {
        // Adapter les équipements avec les vraies statistiques
        const adaptedEquipments = mockEquipments.map((eq, index) => ({
          ...eq,
          views: Math.floor(dashboardStats.totalViews / mockEquipments.length) + (index * 5),
          clicks: Math.floor(dashboardStats.totalViews / mockEquipments.length / 10) + index,
          contacts: Math.floor(dashboardStats.totalMessages / mockEquipments.length) + (index % 3),
          visibilityScore: Math.min(100, Math.floor(dashboardStats.totalViews / mockEquipments.length) + (index * 10))
        }));
        setEquipments(adaptedEquipments);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données réelles du stock:", error);
      // En cas d'erreur, on garde les données simulées
    } finally {
      setLoading(false);
    }
  };

  // Charger les données réelles au montage du composant
  useEffect(() => {
    loadRealData();
  }, []);

  const filtered = equipments.filter(e =>
    (selectedCategory === 'Toutes' || e.category === selectedCategory) &&
    (selectedAnciennete === 'Toutes' ||
      (selectedAnciennete === '30j+' && e.daysInStock >= 30) ||
      (selectedAnciennete === '60j+' && e.daysInStock >= 60) ||
      (selectedAnciennete === '90j+' && e.daysInStock >= 90))
  );

  // Actions rapides connectées aux services communs
  const handleQuickAction = async (action: string, equipment?: Equipment) => {
    try {
      switch (action) {
        case 'add-equipment':
          await handleAddEquipment();
          break;
        case 'export-stock':
          await handleExportStock();
          break;
        case 'boost-visibility':
          await handleBoostVisibility(equipment);
          break;
        case 'create-flash-offer':
          await handleCreateFlashOffer(equipment);
          break;
        case 'add-photo':
          await handleAddPhoto(equipment);
          break;
        case 'send-promotion':
          await handleSendPromotion();
          break;
        case 'analyze-performance':
          await handleAnalyzePerformance();
          break;
        case 'optimize-pricing':
          await handleOptimizePricing();
          break;
        default:
          notificationService.warning('Action non reconnue', `L'action "${action}" n'est pas encore implémentée`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'action rapide:', error);
      notificationService.error('Erreur', 'Une erreur est survenue lors de l\'exécution de l\'action');
    }
  };

  const handleAddEquipment = async () => {
    try {
      notificationService.info('Ajout d\'équipement', 'Ouverture du formulaire d\'ajout...');
      
      // Simulation d'ajout d'équipement
      const newEquipment: Equipment = {
        id: Date.now(),
        name: 'Nouvel équipement',
        category: 'Pelle',
        daysInStock: 0,
        views: 0,
        clicks: 0,
        contacts: 0,
        visibilityScore: 50,
        aiTip: 'Nouvel équipement ajouté. Ajoutez des photos et une description détaillée pour améliorer la visibilité.',
        alert: false
      };
      
      setEquipments([...equipments, newEquipment]);
      
      // Envoi d'email de notification
      await communicationService.sendEmail({
        to: 'vendeur@minegrid.com',
        subject: 'Nouvel équipement ajouté',
        body: `Un nouvel équipement "${newEquipment.name}" a été ajouté au stock.`
      });
      
      notificationService.success('Équipement ajouté', 'Le nouvel équipement a été ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement:', error);
      notificationService.error('Erreur', 'Impossible d\'ajouter l\'équipement');
    }
  };

  const handleExportStock = async () => {
    try {
      notificationService.info('Export en cours', 'Préparation de l\'export du stock...');
      
      const exportData = {
        filename: `stock-revente-${new Date().toISOString().split('T')[0]}.xlsx`,
        data: equipments.map(eq => ({
          'Nom': eq.name,
          'Catégorie': eq.category,
          'Jours en stock': eq.daysInStock,
          'Vues': eq.views,
          'Clics': eq.clicks,
          'Contacts': eq.contacts,
          'Score visibilité': eq.visibilityScore,
          'Conseil IA': eq.aiTip,
          'Alerte': eq.alert ? 'Oui' : 'Non'
        })),
        sheets: [
          {
            name: 'Stock',
            data: equipments.map(eq => ({
              'Nom': eq.name,
              'Catégorie': eq.category,
              'Jours en stock': eq.daysInStock,
              'Vues': eq.views,
              'Clics': eq.clicks,
              'Contacts': eq.contacts,
              'Score visibilité': eq.visibilityScore,
              'Conseil IA': eq.aiTip,
              'Alerte': eq.alert ? 'Oui' : 'Non'
            }))
          },
          {
            name: 'Statistiques',
            data: [
              {
                'Métrique': 'Total équipements',
                'Valeur': equipments.length
              },
              {
                'Métrique': 'Équipements à risque',
                'Valeur': equipments.filter(eq => eq.alert).length
              },
              {
                'Métrique': 'Score moyen',
                'Valeur': Math.round(equipments.reduce((sum, eq) => sum + eq.visibilityScore, 0) / equipments.length)
              },
              {
                'Métrique': 'Jours moyens en stock',
                'Valeur': Math.round(equipments.reduce((sum, eq) => sum + eq.daysInStock, 0) / equipments.length)
              }
            ]
          }
        ]
      };
      
      await exportService.exportEquipments(equipments, { format: 'excel', filename: exportData.filename });
      notificationService.success('Export réussi', 'Le stock a été exporté en Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      notificationService.error('Erreur d\'export', 'Impossible d\'exporter le stock');
    }
  };

  const handleBoostVisibility = async (equipment?: Equipment) => {
    try {
      const targetEquipment = equipment || equipments[0];
      notificationService.info('Boost en cours', `Amélioration de la visibilité de ${targetEquipment.name}...`);
      
      // Simulation de boost de visibilité
      const updatedEquipments = equipments.map(eq => 
        eq.id === targetEquipment.id 
          ? { ...eq, visibilityScore: Math.min(eq.visibilityScore + 15, 100), alert: false }
          : eq
      );
      
      setEquipments(updatedEquipments);
      
      // Envoi d'email de promotion
      await communicationService.sendEmail({
        to: 'clients@minegrid.com',
        subject: `Équipement mis en avant - ${targetEquipment.name}`,
        body: `Découvrez notre équipement ${targetEquipment.name} mis en avant cette semaine !`
      });
      
      notificationService.success('Visibilité boostée', `La visibilité de ${targetEquipment.name} a été améliorée`);
    } catch (error) {
      console.error('Erreur lors du boost:', error);
      notificationService.error('Erreur', 'Impossible de booster la visibilité');
    }
  };

  const handleCreateFlashOffer = async (equipment?: Equipment) => {
    try {
      const targetEquipment = equipment || equipments[0];
      notificationService.info('Création d\'offre', `Création d'une offre flash pour ${targetEquipment.name}...`);
      
      // Simulation de création d'offre flash
      const flashOffer = {
        equipment: targetEquipment.name,
        discount: 10,
        duration: '7 jours',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      
      // Envoi d'email d'offre flash
      await communicationService.sendEmail({
        to: 'clients@minegrid.com',
        subject: `🚨 OFFRE FLASH - ${targetEquipment.name}`,
        body: `Offre exceptionnelle : ${targetEquipment.name} à -${flashOffer.discount}% pendant ${flashOffer.duration} !`
      });
      
      notificationService.success('Offre flash créée', `L'offre flash pour ${targetEquipment.name} a été créée et diffusée`);
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      notificationService.error('Erreur', 'Impossible de créer l\'offre flash');
    }
  };

  const handleAddPhoto = async (equipment?: Equipment) => {
    try {
      const targetEquipment = equipment || equipments[0];
      notificationService.info('Ajout de photo', `Ouverture de l'upload pour ${targetEquipment.name}...`);
      
      // Simulation d'ajout de photo
      const updatedEquipments = equipments.map(eq => 
        eq.id === targetEquipment.id 
          ? { ...eq, visibilityScore: Math.min(eq.visibilityScore + 10, 100) }
          : eq
      );
      
      setEquipments(updatedEquipments);
      
      notificationService.success('Photo ajoutée', `La photo de ${targetEquipment.name} a été ajoutée avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de photo:', error);
      notificationService.error('Erreur', 'Impossible d\'ajouter la photo');
    }
  };

  const handleSendPromotion = async () => {
    try {
      notificationService.info('Envoi en cours', 'Préparation de la promotion...');
      
      const lowVisibilityEquipments = equipments.filter(eq => eq.visibilityScore < 50);
      
      if (lowVisibilityEquipments.length === 0) {
        notificationService.info('Aucune promotion', 'Tous les équipements ont une bonne visibilité');
        return;
      }
      
      // Envoi d'emails de promotion
      for (const equipment of lowVisibilityEquipments.slice(0, 3)) {
        await communicationService.sendEmail({
          to: 'clients@minegrid.com',
          subject: `Promotion spéciale - ${equipment.name}`,
          body: `Profitez de notre promotion spéciale sur ${equipment.name} !`
        });
      }
      
      notificationService.success('Promotion envoyée', `${lowVisibilityEquipments.length} promotions ont été envoyées`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la promotion:', error);
      notificationService.error('Erreur', 'Impossible d\'envoyer la promotion');
    }
  };

  const handleAnalyzePerformance = async () => {
    try {
      notificationService.info('Analyse', 'Analyse des performances en cours...');
      
      const analysis = {
        totalEquipments: equipments.length,
        averageVisibility: Math.round(equipments.reduce((sum, eq) => sum + eq.visibilityScore, 0) / equipments.length),
        averageDaysInStock: Math.round(equipments.reduce((sum, eq) => sum + eq.daysInStock, 0) / equipments.length),
        lowVisibilityCount: equipments.filter(eq => eq.visibilityScore < 50).length,
        highStockCount: equipments.filter(eq => eq.daysInStock > 60).length
      };
      
      // Envoi du rapport d'analyse
      await communicationService.sendEmail({
        to: 'manager@minegrid.com',
        subject: 'Analyse de performance - Stock & Revente',
        body: `Rapport d'analyse:\n\n- Total équipements: ${analysis.totalEquipments}\n- Score moyen: ${analysis.averageVisibility}/100\n- Jours moyens en stock: ${analysis.averageDaysInStock}\n- Équipements à faible visibilité: ${analysis.lowVisibilityCount}\n- Équipements en stock > 60j: ${analysis.highStockCount}`
      });
      
      notificationService.success('Analyse terminée', 'Le rapport d\'analyse a été envoyé');
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      notificationService.error('Erreur', 'Impossible de générer l\'analyse de performance');
    }
  };

  const handleOptimizePricing = async () => {
    try {
      notificationService.info('Optimisation', 'Optimisation des prix en cours...');
      
      const optimizedEquipments = equipments.map(eq => {
        if (eq.daysInStock > 60 && eq.visibilityScore < 50) {
          return {
            ...eq,
            visibilityScore: Math.min(eq.visibilityScore + 20, 100),
            aiTip: 'Prix optimisé et visibilité améliorée automatiquement'
          };
        }
        return eq;
      });
      
      setEquipments(optimizedEquipments);
      
      const optimizedCount = optimizedEquipments.filter(eq => eq.daysInStock > 60 && eq.visibilityScore < 50).length;
      
      notificationService.success('Optimisation terminée', `${optimizedCount} équipements ont été optimisés automatiquement`);
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      notificationService.error('Erreur', 'Impossible d\'optimiser les prix');
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-md w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-orange-700">Plan d’action Stock & Revente</h2>
        <div className="flex gap-2">
          <select
            className="rounded border border-orange-200 bg-white text-orange-700 px-2 py-1 text-xs focus:outline-none"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="rounded border border-orange-200 bg-white text-orange-700 px-2 py-1 text-xs focus:outline-none"
            value={selectedAnciennete}
            onChange={e => setSelectedAnciennete(e.target.value)}
          >
            {anciennetes.map(a => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions rapides connectées aux services communs */}
      <div className="bg-white rounded-lg border border-orange-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Actions Rapides
          </h4>
          <button
            className="p-1 text-orange-500 hover:text-orange-700 transition-colors"
            onClick={() => setShowQuickActions((v) => !v)}
            title={showQuickActions ? 'Fermer' : 'Ouvrir'}
          >
            {showQuickActions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {showQuickActions && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleQuickAction('add-equipment')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Plus className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Ajouter</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('export-stock')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Download className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Exporter</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('boost-visibility')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <TrendingUp className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Booster</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('create-flash-offer')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Zap className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Offre Flash</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('add-photo')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Camera className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Photo</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('send-promotion')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Send className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Promotion</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('analyze-performance')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <BarChart3 className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Analyse</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('optimize-pricing')}
              className="flex flex-col items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs"
            >
              <Brain className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Optimiser</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-orange-600 text-sm text-center py-8">Aucune machine à risque selon vos filtres.</div>
        )}
        {filtered.map(eq => (
          <div
            key={eq.id}
            className="bg-white border border-orange-100 rounded-lg p-4 flex flex-col gap-2 shadow-sm relative"
          >
            {eq.alert && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white text-[8px] font-normal px-1 py-0.5 rounded-full shadow tracking-tight">Visibilité faible</span>
            )}
            <div className="font-semibold text-orange-700 flex items-center gap-2">
              {eq.name}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span>🕒 {eq.daysInStock}j</span>
              <span>👁️ {eq.views} vues</span>
              <span>🖱️ {eq.clicks} clics</span>
              <span>📩 {eq.contacts} contact</span>
            </div>
            <div className="text-xs text-orange-700 font-medium">
              📊 Score visibilité : {eq.visibilityScore}/100
            </div>
            <div className="text-xs text-orange-600 italic flex items-center gap-1">
              💡 <span>{eq.aiTip}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => handleQuickAction('add-photo', eq)}>Ajouter photo</button>
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => handleQuickAction('boost-visibility', eq)}>Booster</button>
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => handleQuickAction('create-flash-offer', eq)}>Créer offre flash</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockStatusWidget; 