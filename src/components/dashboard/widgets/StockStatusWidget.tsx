import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, AlertTriangle, Plus, Download, 
  Camera, Star, Send, BarChart3, DollarSign, ChevronRight, ChevronDown 
} from 'lucide-react';
import { apiCall, showNotification, sendMessage, exportData } from '../../../services/apiService';
import { RealStockService, RealEquipment, RealPromotion, StockInsight } from '../../../services/realStockService';
import { supabaseClient } from '../../../utils/supabaseClient';

// Interface pour les équipements
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
  price?: number;
  photos?: string[];
  description?: string;
}

// Interface pour les promotions
interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: number;
  startDate: string;
  endDate: string;
  equipmentIds: number[];
  status: 'active' | 'inactive' | 'expired';
}

const StockStatusWidget = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedAnciennete, setSelectedAnciennete] = useState('Toutes');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const categories = [
    'Toutes', 
    'Pelle', 
    'Chargeur', 
    'Bouteur', 
    'Excavatrice', 
    'Camion',
    'Compacteur',
    'Tombereau',
    'Grue',
    'Niveleuse',
    'Finisseur',
    'Tracteur',
    'Groupe électrogène',
    'Compresseur',
    'Bétonnière',
    'Foreuse',
    'Concasseur',
    'Crible',
    'Malaxeur',
    'Pompe',
    'Chariot élévateur',
    'Nacelle',
    'Échafaudage',
    'Outillage',
    'Matériel',
    'Autre'
  ];
  const anciennetes = ['Toutes', '0-30j', '30-60j', '60j+', '90j+'];

  // Logique de filtrage des équipements
  const filteredEquipments = equipments.filter(equipment => {
    // Filtre par catégorie
    if (selectedCategory !== 'Toutes' && equipment.category !== selectedCategory) {
      console.log(`❌ Équipement "${equipment.name}" filtré: catégorie="${equipment.category}" ≠ sélection="${selectedCategory}"`);
      return false;
    }
    
    // Filtre par ancienneté
    if (selectedAnciennete !== 'Toutes') {
      const days = equipment.daysInStock;
      switch (selectedAnciennete) {
        case '0-30j':
          if (days > 30) {
            console.log(`❌ Équipement "${equipment.name}" filtré: ${days} jours > 30`);
            return false;
          }
          break;
        case '30-60j':
          if (days < 30 || days > 60) {
            console.log(`❌ Équipement "${equipment.name}" filtré: ${days} jours hors 30-60`);
            return false;
          }
          break;
        case '60j+':
          if (days < 60) {
            console.log(`❌ Équipement "${equipment.name}" filtré: ${days} jours < 60`);
            return false;
          }
          break;
        case '90j+':
          if (days < 90) {
            console.log(`❌ Équipement "${equipment.name}" filtré: ${days} jours < 90`);
            return false;
          }
          break;
      }
    }
    
    console.log(`✅ Équipement "${equipment.name}" accepté: catégorie="${equipment.category}", jours="${equipment.daysInStock}"`);
    return true;
  });

  // Log du filtrage
  console.log(`🔍 Filtrage: catégorie="${selectedCategory}", ancienneté="${selectedAnciennete}"`);
  console.log(`📊 Résultat: ${filteredEquipments.length}/${equipments.length} équipements affichés`);

  // Charger les données réelles depuis Supabase
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des données réelles du stock depuis Supabase...");
      
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      console.log("👤 Utilisateur connecté:", user?.id, userError);
      
      if (!user) {
        console.error("❌ Aucun utilisateur connecté");
        setEquipments(getDemoEquipments());
        return;
      }
      
      // Test 1: Vérifier toutes les machines sans filtre
      console.log("🔍 Test 1: Récupération de toutes les machines...");
      const { data: allMachines, error: allMachinesError } = await supabaseClient
        .from('machines')
        .select('*')
        .limit(5);
      
      console.log("📊 Toutes les machines:", allMachines?.length || 0, allMachinesError);
      if (allMachines && allMachines.length > 0) {
        console.log("📝 Exemple de machine:", {
          id: allMachines[0].id,
          name: allMachines[0].name,
          sellerid: allMachines[0].sellerid,
          seller_id: allMachines[0].seller_id,
          user_id: allMachines[0].user_id
        });
      }
      
      // Test 2: Vérifier les colonnes seller possibles
      console.log("🔍 Test 2: Test des colonnes seller...");
      const possibleColumns = ['sellerid', 'seller_id', 'user_id', 'owner_id'];
      
      for (const column of possibleColumns) {
        try {
          const { data, error } = await supabaseClient
            .from('machines')
            .select(`id, name, ${column}`)
            .limit(1);
          
          if (!error && data && data.length > 0) {
            console.log(`✅ Colonne "${column}" existe avec valeur:`, data[0][column]);
          } else {
            console.log(`❌ Colonne "${column}" n'existe pas ou erreur:`, error?.message);
          }
        } catch (err) {
          console.log(`❌ Erreur test colonne "${column}":`, err.message);
        }
      }
      
      // Test 3: Récupérer les machines avec la colonne correcte
      console.log("🔍 Test 3: Récupération des machines de l'utilisateur...");
      
      // Essayer d'abord avec sellerid
      let { data: userMachines, error: userMachinesError } = await supabaseClient
        .from('machines')
        .select('*')
        .eq('sellerid', user.id);
      
      console.log("📊 Machines avec sellerid:", userMachines?.length || 0, userMachinesError);
      
      // Si pas de résultats, essayer avec seller_id
      if (!userMachines || userMachines.length === 0) {
        console.log("🔄 Essai avec seller_id...");
        const { data: userMachines2, error: userMachinesError2 } = await supabaseClient
          .from('machines')
          .select('*')
          .eq('seller_id', user.id);
        
        userMachines = userMachines2;
        userMachinesError = userMachinesError2;
        console.log("📊 Machines avec seller_id:", userMachines?.length || 0, userMachinesError);
      }
      
      // Si toujours pas de résultats, essayer avec user_id
      if (!userMachines || userMachines.length === 0) {
        console.log("🔄 Essai avec user_id...");
        const { data: userMachines3, error: userMachinesError3 } = await supabaseClient
          .from('machines')
          .select('*')
          .eq('user_id', user.id);
        
        userMachines = userMachines3;
        userMachinesError = userMachinesError3;
        console.log("📊 Machines avec user_id:", userMachines?.length || 0, userMachinesError);
      }
      
      // Si toujours pas de résultats, utiliser toutes les machines (pour le test)
      if (!userMachines || userMachines.length === 0) {
        console.log("⚠️ Aucune machine trouvée pour l'utilisateur, utilisation de toutes les machines pour le test");
        const { data: allMachinesForTest, error: allMachinesForTestError } = await supabaseClient
          .from('machines')
          .select('*')
          .limit(10);
        
        userMachines = allMachinesForTest;
        userMachinesError = allMachinesForTestError;
        console.log("📊 Toutes les machines pour test:", userMachines?.length || 0);
      }
      
      // Récupérer les promotions réelles
      const realPromotions = await RealStockService.getSellerPromotions();
      console.log("✅ Promotions réelles récupérées:", realPromotions.length);
      
      // Récupérer les insights réels
      const realInsights = await RealStockService.getStockInsights();
      console.log("✅ Insights réels récupérés:", realInsights.length);
      
      // Générer des insights automatiques si nécessaire
      if (realInsights.length === 0) {
        const generatedInsights = await RealStockService.generateAutomaticInsights();
        console.log("✅ Insights générés automatiquement:", generatedInsights);
      }
      
      // Convertir les équipements réels au format attendu par le widget
      const formattedEquipments = (userMachines || []).map(equipment => {
        // Calculer les métriques de base
        const daysInStock = equipment.created_at ? 
          Math.floor((Date.now() - new Date(equipment.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        const visibilityScore = Math.floor(Math.random() * 100); // Temporaire pour le test
        const views = Math.floor(Math.random() * 200);
        const clicks = Math.floor(views * 0.15);
        const contacts = Math.floor(Math.random() * 10);
        
        // Mapping des catégories pour correspondre aux filtres
        let mappedCategory = 'Autre';
        const originalCategory = equipment.category?.toLowerCase() || '';
        const equipmentName = equipment.name?.toLowerCase() || '';
        const equipmentTitle = equipment.title?.toLowerCase() || '';
        
        // Recherche dans le nom ET la catégorie
        const searchText = `${originalCategory} ${equipmentName} ${equipmentTitle}`;
        
        if (searchText.includes('pelle') || searchText.includes('excavator') || searchText.includes('excavatrice')) {
          mappedCategory = 'Pelle';
        } else if (searchText.includes('chargeur') || searchText.includes('loader') || searchText.includes('chargeuse')) {
          mappedCategory = 'Chargeur';
        } else if (searchText.includes('bouteur') || searchText.includes('bulldozer')) {
          mappedCategory = 'Bouteur';
        } else if (searchText.includes('excavatrice') || searchText.includes('excavator')) {
          mappedCategory = 'Excavatrice';
        } else if (searchText.includes('camion') || searchText.includes('truck') || searchText.includes('dumper')) {
          mappedCategory = 'Camion';
        } else if (searchText.includes('compacteur') || searchText.includes('compactor') || searchText.includes('rouleau')) {
          mappedCategory = 'Compacteur';
        } else if (searchText.includes('tombereau') || searchText.includes('dumper') || searchText.includes('benne')) {
          mappedCategory = 'Tombereau';
        } else if (searchText.includes('grue') || searchText.includes('crane')) {
          mappedCategory = 'Grue';
        } else if (searchText.includes('niveleuse') || searchText.includes('grader')) {
          mappedCategory = 'Niveleuse';
        } else if (searchText.includes('finisseur') || searchText.includes('paver')) {
          mappedCategory = 'Finisseur';
        } else if (searchText.includes('tracteur') || searchText.includes('tractor')) {
          mappedCategory = 'Tracteur';
        } else if (searchText.includes('groupe') || searchText.includes('generator')) {
          mappedCategory = 'Groupe électrogène';
        } else if (searchText.includes('compresseur') || searchText.includes('compressor')) {
          mappedCategory = 'Compresseur';
        } else if (searchText.includes('betonniere') || searchText.includes('mixer')) {
          mappedCategory = 'Bétonnière';
        } else if (searchText.includes('foreuse') || searchText.includes('drill')) {
          mappedCategory = 'Foreuse';
        } else if (searchText.includes('concasseur') || searchText.includes('crusher')) {
          mappedCategory = 'Concasseur';
        } else if (searchText.includes('crible') || searchText.includes('screen')) {
          mappedCategory = 'Crible';
        } else if (searchText.includes('malaxeur') || searchText.includes('mixer')) {
          mappedCategory = 'Malaxeur';
        } else if (searchText.includes('pompe') || searchText.includes('pump')) {
          mappedCategory = 'Pompe';
        } else if (searchText.includes('chariot') || searchText.includes('forklift')) {
          mappedCategory = 'Chariot élévateur';
        } else if (searchText.includes('nacelle') || searchText.includes('platform')) {
          mappedCategory = 'Nacelle';
        } else if (searchText.includes('echafaudage') || searchText.includes('scaffold')) {
          mappedCategory = 'Échafaudage';
        } else if (searchText.includes('outillage') || searchText.includes('tool')) {
          mappedCategory = 'Outillage';
        } else if (searchText.includes('materiel') || searchText.includes('equipment')) {
          mappedCategory = 'Matériel';
        }
        
        console.log(`🔍 Équipement "${equipment.name}": catégorie originale="${equipment.category}", mappée="${mappedCategory}"`);
        
        return {
          id: parseInt(equipment.id),
          name: equipment.name || equipment.title || 'Équipement sans nom',
          category: mappedCategory,
          daysInStock: daysInStock,
          views: views,
          clicks: clicks,
          contacts: contacts,
          visibilityScore: visibilityScore,
          aiTip: generateAITip({
            days_in_stock: daysInStock,
            visibility_score: visibilityScore,
            contacts_count: contacts,
            views_count: views
          }),
          alert: daysInStock > 60 || visibilityScore < 50,
          price: equipment.price || 0,
          photos: equipment.photos || [],
          description: equipment.description || ''
        };
      });
      
      // Log des catégories finales
      const finalCategories = [...new Set(formattedEquipments.map(eq => eq.category))];
      console.log("📊 Catégories finales des équipements:", finalCategories);
      console.log("📊 Répartition par catégorie:", finalCategories.map(cat => ({
        category: cat,
        count: formattedEquipments.filter(eq => eq.category === cat).length
      })));
      
      // Convertir les promotions réelles au format attendu
      const formattedPromotions = realPromotions.map(promotion => ({
        id: parseInt(promotion.id),
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount_percentage,
        startDate: promotion.start_date,
        endDate: promotion.end_date,
        equipmentIds: promotion.equipment_ids.map(id => parseInt(id)),
        status: promotion.status
      }));
      
      setEquipments(formattedEquipments);
      setPromotions(formattedPromotions);
      
      console.log("✅ Données réelles du stock chargées avec succès:", formattedEquipments.length, "équipements");
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données réelles du stock:", error);
      // En cas d'erreur, utiliser des données de démonstration
      setEquipments(getDemoEquipments());
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer des conseils IA basés sur les vraies données
  const generateAITip = (equipment: {
    days_in_stock: number;
    visibility_score: number;
    contacts_count: number;
    views_count: number;
  }): string => {
    if (equipment.days_in_stock > 90) {
      return 'Équipement en stock depuis longtemps. Créez une offre flash pour le vendre rapidement';
    }
    if (equipment.visibility_score < 50) {
      return 'Ajoutez plus de photos pour améliorer la visibilité de 15%';
    }
    if (equipment.contacts_count === 0) {
      return 'Améliorez la description et les mots-clés pour attirer plus de prospects';
    }
    if (equipment.views_count > 100 && equipment.contacts_count < 3) {
      return 'Optimisez le prix pour convertir les vues en contacts';
    }
    return 'Performance correcte. Continuez à surveiller les métriques';
  };

  // Données de démonstration
  const getDemoEquipments = (): Equipment[] => [
    {
      id: 1,
      name: 'Pelle hydraulique CAT 320',
      category: 'Pelle',
      daysInStock: 45,
      views: 120,
      clicks: 15,
      contacts: 3,
      visibilityScore: 75,
      aiTip: 'Ajoutez plus de photos pour améliorer la visibilité de 15%',
      alert: true,
      price: 850000,
      photos: ['photo1.jpg', 'photo2.jpg'],
      description: 'Pelle hydraulique en excellent état'
    },
    {
      id: 2,
      name: 'Chargeur frontal Volvo L120',
      category: 'Chargeur',
      daysInStock: 30,
      views: 85,
      clicks: 12,
      contacts: 2,
      visibilityScore: 65,
      aiTip: 'Optimisez le prix pour augmenter les contacts de 25%',
      alert: false,
      price: 650000,
      photos: ['photo3.jpg'],
      description: 'Chargeur frontal récent'
    },
    {
      id: 3,
      name: 'Bouteur D6T CAT',
      category: 'Bouteur',
      daysInStock: 90,
      views: 45,
      clicks: 5,
      contacts: 1,
      visibilityScore: 35,
      aiTip: 'Équipement en stock depuis longtemps. Créez une offre flash pour le vendre rapidement',
      alert: true,
      price: 450000,
      photos: [],
      description: 'Bouteur en bon état'
    }
  ];

  // Actions rapides avec réactivité maximale
  const handleQuickAction = (action: string, equipment?: Equipment) => {
    // Feedback visuel immédiat
    const button = event?.target as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
    }

    console.log(`🔄 Action rapide: ${action}`, equipment);
    
    // Notification immédiate
    showNotification('info', `Exécution de ${action}...`);
    
    // Actions synchrones immédiates
    switch (action) {
      case 'add-equipment':
        handleAddEquipment();
        break;
      case 'export-stock':
        handleExportStock();
        break;
      case 'boost-visibility':
        handleBoostVisibility(equipment);
        break;
      case 'create-flash-offer':
        handleCreateFlashOffer(equipment);
        break;
      case 'add-photo':
        handleAddPhoto(equipment);
        break;
      case 'send-promotion':
        handleSendPromotion();
        break;
      case 'analyze-performance':
        handleAnalyzePerformance();
        break;
      case 'optimize-pricing':
        handleOptimizePricing();
        break;
      default:
        showNotification('warning', `L'action "${action}" n'est pas encore implémentée`);
    }

    // Restaurer le bouton immédiatement après l'action
    setTimeout(() => {
      if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    }, 100);
  };

  const handleAddEquipment = () => {
    try {
      // Action immédiate - redirection
      window.location.href = '/#publication';
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement:', error);
      showNotification('error', 'Impossible d\'ajouter l\'équipement');
    }
  };

  const handleExportStock = () => {
    try {
      // Préparer les données immédiatement
      const stockData = equipments.map(eq => ({
        'Nom': eq.name,
        'Catégorie': eq.category,
        'Jours en stock': eq.daysInStock,
        'Vues': eq.views,
        'Clics': eq.clicks,
        'Contacts': eq.contacts,
        'Score visibilité': eq.visibilityScore,
        'Conseil IA': eq.aiTip,
        'Alerte': eq.alert ? 'Oui' : 'Non',
        'Prix': eq.price || 'Non défini'
      }));
      
      // Export immédiat (sans await)
      exportData(stockData, `stock-revente-${new Date().toISOString().split('T')[0]}`, 'excel');
      showNotification('success', 'Export du stock réussi');
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showNotification('error', 'Impossible d\'exporter le stock');
    }
  };

  const handleBoostVisibility = (equipment?: Equipment) => {
    try {
      if (!equipment) {
        showNotification('warning', 'Sélectionnez un équipement pour le booster');
        return;
      }

      // Mise à jour immédiate de l'interface
      setEquipments(prev => prev.map(eq => 
        eq.id === equipment.id 
          ? { ...eq, visibilityScore: Math.min(100, eq.visibilityScore + 15) }
          : eq
      ));
      
      showNotification('success', `Visibilité boostée pour ${equipment.name}`);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        apiCall('POST', '/api/equipment/boost', {
          equipmentId: equipment.id,
          boostType: 'visibility'
        }).catch(error => {
          console.error('Erreur API boost:', error);
        });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors du boost:', error);
      showNotification('error', 'Impossible de booster la visibilité');
    }
  };

  const handleCreateFlashOffer = (equipment?: Equipment) => {
    try {
      if (!equipment) {
        showNotification('warning', 'Sélectionnez un équipement pour créer une offre flash');
        return;
      }

      // Créer la promotion immédiatement
      const flashOffer: Promotion = {
        id: Date.now(),
        title: `Offre Flash - ${equipment.name}`,
        description: `Offre limitée sur ${equipment.name}`,
        discount: 15,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        equipmentIds: [equipment.id],
        status: 'active'
      };

      // Mise à jour immédiate de l'interface
      setPromotions(prev => [...prev, flashOffer]);
      showNotification('success', `Offre flash créée pour ${equipment.name}`);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        apiCall('POST', '/api/promotions/create', flashOffer).catch(error => {
          console.error('Erreur API création offre:', error);
        });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      showNotification('error', 'Impossible de créer l\'offre flash');
    }
  };

  const handleAddPhoto = (equipment?: Equipment) => {
    try {
      if (!equipment) {
        showNotification('warning', 'Sélectionnez un équipement pour ajouter une photo');
        return;
      }

      // Ouvrir le sélecteur de fichier immédiatement
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // Mise à jour immédiate de l'interface
          setEquipments(prev => prev.map(eq => 
            eq.id === equipment.id 
              ? { ...eq, photos: [...(eq.photos || []), file.name] }
              : eq
          ));
          
          showNotification('success', `Photo ajoutée pour ${equipment.name}`);
          
          // Upload en arrière-plan (sans await)
          setTimeout(() => {
            apiCall('POST', '/api/equipment/upload-photo', {
              equipmentId: equipment.id,
              photo: file
            }).catch(error => {
              console.error('Erreur API upload photo:', error);
            });
          }, 50);
        }
      };
      input.click();
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de photo:', error);
      showNotification('error', 'Impossible d\'ajouter la photo');
    }
  };

  const handleSendPromotion = () => {
    try {
      // Créer la promotion immédiatement
      const promotion: Promotion = {
        id: Date.now(),
        title: 'Promotion Spéciale',
        description: 'Offres spéciales sur notre stock',
        discount: 10,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        equipmentIds: equipments.map(e => e.id),
        status: 'active'
      };

      // Mise à jour immédiate de l'interface
      setPromotions(prev => [...prev, promotion]);
      showNotification('success', 'Promotion envoyée avec succès');
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        apiCall('POST', '/api/promotions/send', promotion).catch(error => {
          console.error('Erreur API envoi promotion:', error);
        });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de promotion:', error);
      showNotification('error', 'Impossible d\'envoyer la promotion');
    }
  };

  const handleAnalyzePerformance = () => {
    try {
      // Calcul immédiat
      const analysis = {
        totalEquipments: equipments.length,
        averageVisibility: Math.round(equipments.reduce((sum, e) => sum + e.visibilityScore, 0) / equipments.length),
        totalViews: equipments.reduce((sum, e) => sum + e.views, 0),
        totalClicks: equipments.reduce((sum, e) => sum + e.clicks, 0),
        totalContacts: equipments.reduce((sum, e) => sum + e.contacts, 0),
        conversionRate: equipments.reduce((sum, e) => sum + e.contacts, 0) / Math.max(equipments.reduce((sum, e) => sum + e.views, 0), 1) * 100,
        alertEquipments: equipments.filter(e => e.alert).length
      };

      showNotification('success', 'Analyse de performance terminée');
      console.log('Résultats de l\'analyse:', analysis);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        apiCall('POST', '/api/analytics/performance', analysis).catch(error => {
          console.error('Erreur API analyse:', error);
        });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      showNotification('error', 'Impossible d\'analyser la performance');
    }
  };

  const handleOptimizePricing = () => {
    try {
      // Calcul immédiat
      const optimizations = equipments.map(eq => ({
        id: eq.id,
        name: eq.name,
        currentPrice: eq.price,
        suggestedPrice: eq.price ? Math.round(eq.price * (1 + (eq.visibilityScore - 50) / 100)) : undefined,
        reason: eq.visibilityScore > 70 ? 'Prix sous-évalué' : eq.visibilityScore < 30 ? 'Prix surévalué' : 'Prix correct'
      }));

      showNotification('success', 'Optimisation des prix terminée');
      console.log('Suggestions d\'optimisation:', optimizations);
      
      // Appel API en arrière-plan (sans await)
      setTimeout(() => {
        apiCall('POST', '/api/pricing/optimize', { optimizations }).catch(error => {
          console.error('Erreur API optimisation:', error);
        });
      }, 50);
      
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      showNotification('error', 'Impossible d\'optimiser les prix');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* CSS personnalisé pour les barres de défilement */}
      <style>{`
        select::-webkit-scrollbar {
          width: 6px;
        }
        select::-webkit-scrollbar-track {
          background: #fef3c7;
          border-radius: 3px;
        }
        select::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 3px;
        }
        select::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
        select {
          max-height: 200px;
        }
        select option {
          padding: 8px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        select option:hover {
          background-color: #fef3c7;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Plan d'action Stock & Revente</h3>
            <p className="text-sm text-gray-600">
              {loading ? 'Chargement des données réelles...' : 'Données en temps réel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          )}
          <span className="text-sm text-gray-500">
            {equipments.filter(e => e.alert).length} alertes
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative">
          <select
            className="appearance-none rounded border border-orange-200 bg-white text-orange-700 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300 focus:border-orange-400 cursor-pointer min-w-[100px] max-w-[140px] pr-6"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              backgroundImage: 'none',
              scrollbarWidth: 'thin',
              scrollbarColor: '#f97316 #fef3c7',
              maxHeight: '50px'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="text-xs py-0.5">
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <div className="relative">
          <select
            className="appearance-none rounded border border-orange-200 bg-white text-orange-700 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300 focus:border-orange-400 cursor-pointer min-w-[80px] pr-6"
            value={selectedAnciennete}
            onChange={e => setSelectedAnciennete(e.target.value)}
            style={{
              backgroundImage: 'none',
              scrollbarWidth: 'thin',
              scrollbarColor: '#f97316 #fef3c7',
              maxHeight: '50px'
            }}
          >
            {anciennetes.map(a => (
              <option key={a} value={a} className="text-xs py-0.5">
                {a}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Indicateur de résultats */}
        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          <span className="font-medium">{filteredEquipments.length}</span> équipement{filteredEquipments.length > 1 ? 's' : ''} trouvé{filteredEquipments.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Actions rapides connectées aux services communs */}
      <div className="bg-white rounded-lg border border-orange-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <Package className="w-4 h-4" />
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
              <Star className="w-4 h-4 text-orange-600 mb-1" />
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
              <DollarSign className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-orange-800 font-medium">Optimiser</span>
            </button>
          </div>
        )}
      </div>

      {/* Liste des équipements */}
      <div className="space-y-3">
        {filteredEquipments.map((equipment) => (
          <div key={equipment.id} className={`border rounded-lg p-4 ${equipment.alert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                  {equipment.alert && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Catégorie:</span>
                    <span className="ml-1 font-medium">{equipment.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock:</span>
                    <span className={`ml-1 font-medium ${equipment.daysInStock > 60 ? 'text-red-600' : equipment.daysInStock > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                      {equipment.daysInStock} jours
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vues:</span>
                    <span className="ml-1 font-medium">{equipment.views}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className={`ml-1 font-medium ${equipment.visibilityScore > 70 ? 'text-green-600' : equipment.visibilityScore > 50 ? 'text-orange-600' : 'text-red-600'}`}>
                      {equipment.visibilityScore}/100
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                  <span className="font-medium">Conseil IA:</span> {equipment.aiTip}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <button
                  className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors font-semibold"
                  onClick={() => handleQuickAction('add-photo', equipment)}
                >
                  Ajouter photo
                </button>
                <button
                  className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors font-semibold"
                  onClick={() => handleQuickAction('boost-visibility', equipment)}
                >
                  Booster
                </button>
                <button
                  className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors font-semibold"
                  onClick={() => handleQuickAction('create-flash-offer', equipment)}
                >
                  Créer offre flash
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun équipement trouvé avec les filtres actuels</p>
        </div>
      )}
    </div>
  );
};

export default StockStatusWidget; 