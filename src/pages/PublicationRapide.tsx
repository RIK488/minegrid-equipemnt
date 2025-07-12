import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  Edit,
  Settings,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { getSellerMachines } from '../utils/api';

interface MachineFormData {
  name: string;
  brand: string;
  model: string;
  category: string;
  type: string;
  year: number;
  price: number;
  description: string;
  location: string;
  specifications: {
    weight: number;
    power: { value: number; unit: string };
    dimensions: string;
    workingWeight: number;
    operatingCapacity: number;
  };
  images: File[];
}

export default function PublicationRapide() {
  const [activeTab, setActiveTab] = useState<'list' | 'manual' | 'excel' | 'analytics'>('list');
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);

  // Formulaire manuel
  const [formData, setFormData] = useState<MachineFormData>({
    name: '',
    brand: '',
    model: '',
    category: '',
    type: '',
    year: new Date().getFullYear(),
    price: 0,
    description: '',
    location: '',
    specifications: {
      weight: 0,
      power: { value: 0, unit: 'HP' },
      dimensions: '',
      workingWeight: 0,
      operatingCapacity: 0
    },
    images: []
  });

  const categories = [
    'Pelles hydrauliques',
    'Bulldozers',
    'Chargeurs',
    'Concasseurs',
    'Cribles',
    'Foreuses',
    'Grues',
    'Niveleuses',
    'Compacteurs',
    'Outils de démolition'
  ];

  const loadMachines = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des machines...");
      const machinesData = await getSellerMachines();
      console.log("📊 Machines chargées:", machinesData);
      setMachines(machinesData);
    } catch (err) {
      console.error('❌ Erreur chargement machines :', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour éditer une machine
  const handleEditMachine = (machine: any) => {
    console.log("✏️ Édition de la machine:", machine);
    // Pré-remplir le formulaire avec les données de la machine
    setFormData({
      name: machine.name || '',
      brand: machine.brand || '',
      model: machine.model || '',
      category: machine.category || '',
      type: machine.type || '',
      year: machine.year || new Date().getFullYear(),
      price: machine.price || 0,
      description: machine.description || '',
      location: machine.location || '',
      specifications: {
        weight: machine.specifications?.weight || 0,
        power: { 
          value: machine.specifications?.power?.value || 0, 
          unit: machine.specifications?.power?.unit || 'HP' 
        },
        dimensions: machine.specifications?.dimensions || '',
        workingWeight: machine.specifications?.workingWeight || 0,
        operatingCapacity: machine.specifications?.operatingCapacity || 0
      },
      images: []
    });
    
    // Stocker l'ID de la machine en cours d'édition
    setEditingMachineId(machine.id);
    
    // Basculer vers l'onglet de publication manuelle
    setActiveTab('manual');
    
    // Scroll vers le formulaire
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Fonction pour gérer les paramètres d'une machine
  const handleMachineSettings = (machine: any) => {
    console.log("⚙️ Paramètres de la machine:", machine);
    
    // Afficher une modal ou une section pour les paramètres
    const settings = [
      { label: 'Statut', value: machine.status || 'Actif' },
      { label: 'Visibilité', value: machine.visibility || 'Publique' },
      { label: 'Date de création', value: new Date(machine.created_at).toLocaleDateString('fr-FR') },
      { label: 'Dernière modification', value: machine.updated_at ? new Date(machine.updated_at).toLocaleDateString('fr-FR') : 'Jamais' }
    ];
    
    // Créer une modal simple avec les paramètres
    const settingsHtml = settings.map(setting => 
      `<div class="flex justify-between py-2 border-b border-gray-200">
        <span class="font-medium text-gray-700">${setting.label}:</span>
        <span class="text-gray-600">${setting.value}</span>
      </div>`
    ).join('');
    
    const modalHtml = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Paramètres - ${machine.name}</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-2">
            ${settingsHtml}
          </div>
          <div class="mt-6 flex space-x-3">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Fermer
            </button>
            <button onclick="window.location.href='#machines/${machine.id}'" class="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              Voir l'annonce
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Insérer la modal dans le DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild!);
  };

  // Fonction pour supprimer une machine
  const handleDeleteMachine = async (machine: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${machine.name}" ?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', machine.id);
      
      if (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
        return;
      }
      
      alert('Annonce supprimée avec succès !');
      loadMachines(); // Recharger la liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleFormChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof MachineFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vous devez être connecté pour publier une machine');
        return;
      }

      // Upload des images (seulement si de nouvelles images sont ajoutées)
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const fileName = `machine_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const { data, error } = await supabase.storage
          .from('machine-image')
          .upload(fileName, image);

        if (error) {
          console.error('Erreur upload image:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('machine-image')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Préparation des données de la machine
      const machineData: any = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        category: formData.category,
        type: formData.type,
        year: formData.year,
        price: formData.price,
        description: formData.description,
        location: formData.location,
        specifications: formData.specifications,
        seller_id: user.id
      };

      // Ajouter les images seulement si de nouvelles ont été uploadées
      if (imageUrls.length > 0) {
        machineData.images = imageUrls;
      }

      let result;
      if (editingMachineId) {
        // Mode édition - Mise à jour
        result = await supabase
          .from('machines')
          .update(machineData)
          .eq('id', editingMachineId)
          .select()
          .single();
      } else {
        // Mode création - Insertion
        machineData.created_at = new Date().toISOString();
        result = await supabase
          .from('machines')
          .insert(machineData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erreur opération machine:', result.error);
        alert(editingMachineId ? 'Erreur lors de la modification' : 'Erreur lors de la publication');
        return;
      }

      alert(editingMachineId ? 'Machine modifiée avec succès !' : 'Machine publiée avec succès !');
      
      // Reset du formulaire et retour à la liste
      setFormData({
        name: '',
        brand: '',
        model: '',
        category: '',
        type: '',
        year: new Date().getFullYear(),
        price: 0,
        description: '',
        location: '',
        specifications: {
          weight: 0,
          power: { value: 0, unit: 'HP' },
          dimensions: '',
          workingWeight: 0,
          operatingCapacity: 0
        },
        images: []
      });
      
      setEditingMachineId(null);
      setActiveTab('list');
      loadMachines(); // Recharger la liste

    } catch (error) {
      console.error('Erreur:', error);
      alert(editingMachineId ? 'Erreur lors de la modification' : 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setLoading(true);
    setUploadProgress(0);

    try {
      // Simulation du traitement OCR
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Données simulées extraites
      const mockExtractedData = [
        {
          name: 'Pelle hydraulique CAT 320D',
          brand: 'Caterpillar',
          model: '320D',
          category: 'Pelles hydrauliques',
          year: 2018,
          price: 125000,
          location: 'Bamako, Mali'
        },
        {
          name: 'Bulldozer Komatsu D65',
          brand: 'Komatsu',
          model: 'D65',
          category: 'Bulldozers',
          year: 2019,
          price: 98000,
          location: 'Ouagadougou, Burkina Faso'
        }
      ];

      setPreviewData(mockExtractedData);
      alert('Fichier traité avec succès ! Vérifiez les données extraites.');

    } catch (error) {
      console.error('Erreur traitement fichier:', error);
      alert('Erreur lors du traitement du fichier');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelSubmit = async () => {
    if (previewData.length === 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vous devez être connecté pour publier des machines');
        return;
      }

      const machinesToInsert = previewData.map(machine => ({
        ...machine,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        specifications: {
          weight: 0,
          power: { value: 0, unit: 'HP' },
          dimensions: '',
          workingWeight: 0,
          operatingCapacity: 0
        },
        images: []
      }));

      const { data, error } = await supabase
        .from('machines')
        .insert(machinesToInsert);

      if (error) {
        console.error('Erreur publication machines:', error);
        alert('Erreur lors de la publication');
        return;
      }

      alert(`${previewData.length} machines publiées avec succès !`);
      setPreviewData([]);
      setExcelFile(null);

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Nom', 'Marque', 'Modèle', 'Catégorie', 'Année', 'Prix', 'Localisation', 'Description'],
      ['Pelle hydraulique CAT 320D', 'Caterpillar', '320D', 'Pelles hydrauliques', '2018', '125000', 'Bamako, Mali', 'Pelle hydraulique en excellent état']
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_machines.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a 
                href="#dashboard-entreprise"
                className="text-gray-600 hover:text-gray-900"
                title="Retourner au tableau de bord"
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                Service Enterprise - Gestion des Annonces
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="#dashboard-entreprise"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retourner au tableau de bord
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="h-5 w-5 inline mr-2" />
                Mes Annonces
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5 inline mr-2" />
                Publication manuelle
              </button>
              <button
                onClick={() => setActiveTab('excel')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'excel'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-5 w-5 inline mr-2" />
                Import Excel/CSV avec OCR
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-5 w-5 inline mr-2" />
                Analytics détaillés
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'list' ? (
              /* Liste des annonces */
              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                    Mes Annonces
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={loadMachines}
                      disabled={loading}
                      className="p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Rafraîchir les annonces"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Nouvelle annonce
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Équipement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            Chargement des annonces...
                          </td>
                        </tr>
                      ) : machines.length > 0 ? (
                        machines.map((machine) => (
                          <tr key={machine.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                              <div className="text-sm text-gray-500">{machine.brand}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{machine.price} €</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{machine.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {machine.type === 'sale' ? 'Vente' : 
                                 machine.type === 'rental' ? 'Location' : 
                                 machine.type === 'both' ? 'Vente/Location' : 
                                 'Non défini'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <a 
                                  href={`#machines/${machine.id}`} 
                                  className="text-orange-600 hover:text-orange-700 transition-colors"
                                  title="Voir l'annonce"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                                <button 
                                  onClick={() => handleEditMachine(machine)}
                                  className="text-orange-600 hover:text-orange-700 transition-colors"
                                  title="Modifier l'annonce"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleMachineSettings(machine)}
                                  className="text-orange-400 hover:text-orange-600 transition-colors"
                                  title="Paramètres"
                                >
                                  <Settings className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMachine(machine)}
                                  className="text-orange-800 hover:text-orange-900 transition-colors"
                                  title="Supprimer l'annonce"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            Aucune annonce publiée pour le moment.
                            <br />
                            <button 
                              onClick={() => setActiveTab('manual')}
                              className="text-orange-600 hover:text-orange-700 mt-2 inline-block font-medium"
                            >
                              Publier votre première annonce
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Fonctionnalités avancées Enterprise */}
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4">
                    🚀 Fonctionnalités Enterprise
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h5 className="font-medium text-orange-700 mb-2">Publication en masse</h5>
                      <p className="text-sm text-gray-600">Importez plusieurs annonces depuis Excel/CSV</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h5 className="font-medium text-orange-700 mb-2">Gestion avancée</h5>
                      <p className="text-sm text-gray-600">Modifiez et gérez toutes vos annonces</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h5 className="font-medium text-orange-700 mb-2">Analytics détaillés</h5>
                      <p className="text-sm text-gray-600">Suivez les performances de vos annonces</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'manual' ? (
              /* Formulaire manuel */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingMachineId ? 'Modifier une annonce' : 'Publier une nouvelle annonce'}
                  </h3>
                  {editingMachineId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMachineId(null);
                        setFormData({
                          name: '',
                          brand: '',
                          model: '',
                          category: '',
                          type: '',
                          year: new Date().getFullYear(),
                          price: 0,
                          description: '',
                          location: '',
                          specifications: {
                            weight: 0,
                            power: { value: 0, unit: 'HP' },
                            dimensions: '',
                            workingWeight: 0,
                            operatingCapacity: 0
                          },
                          images: []
                        });
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Annuler l'édition
                    </button>
                  )}
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la machine *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleFormChange('brand', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modèle *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleFormChange('model', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de transaction *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="sale">Vente uniquement</option>
                      <option value="rental">Location uniquement</option>
                      <option value="both">Vente et Location</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Année *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleFormChange('year', parseInt(e.target.value))}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (€) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Décrivez votre machine..."
                  />
                </div>

                {/* Spécifications techniques */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Spécifications techniques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poids (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.specifications.weight}
                        onChange={(e) => handleFormChange('specifications.weight', parseFloat(e.target.value))}
                        min="0"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puissance
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={formData.specifications.power.value}
                          onChange={(e) => handleFormChange('specifications.power', { 
                            ...formData.specifications.power, 
                            value: parseFloat(e.target.value) 
                          })}
                          min="0"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select
                          value={formData.specifications.power.unit}
                          onChange={(e) => handleFormChange('specifications.power', { 
                            ...formData.specifications.power, 
                            unit: e.target.value 
                          })}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="HP">HP</option>
                          <option value="kW">kW</option>
                          <option value="CV">CV</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={formData.specifications.dimensions}
                        onChange={(e) => handleFormChange('specifications.dimensions', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="L x l x H (m)"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Ajouter des images
                      </button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <a
                    href="#dashboard-entreprise"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inline-block"
                  >
                    Annuler
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingMachineId ? 'Modification...' : 'Publication...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingMachineId ? 'Modifier la machine' : 'Publier la machine'}
                      </>
                    )}
                  </button>
                </div>
              </form>
                </div>
            ) : activeTab === 'excel' ? (
              /* Import Excel/CSV */
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-orange-900">
                        Import en lot avec OCR
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Téléchargez un fichier Excel ou CSV contenant vos machines. 
                        Notre système OCR extrait automatiquement les informations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le modèle
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </div>

                  {excelFile && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-orange-600 mr-3" />
                        <span className="text-sm text-orange-800">
                          Fichier sélectionné : {excelFile.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Traitement en cours...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Aperçu des données extraites */}
                {previewData.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Aperçu des données extraites ({previewData.length} machines)
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {previewData.map((machine, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{machine.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {machine.brand} {machine.model} • {machine.year}
                                </p>
                                <p className="text-sm text-gray-500">{machine.location}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-orange-600">{machine.price.toLocaleString()} €</p>
                                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  {machine.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {previewData.length > 0 && (
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={() => {
                        setPreviewData([]);
                        setExcelFile(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleExcelSubmit}
                      disabled={loading}
                      className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publication...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Publier {previewData.length} machine(s)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'analytics' ? (
              /* Analytics détaillés */
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Analytics détaillés des publications
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={loadMachines}
                      disabled={loading}
                      className="p-2 text-gray-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Actualiser les données"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</span>
                  </div>
                </div>

                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total annonces</p>
                        <p className="text-3xl font-bold text-orange-600">{machines.length}</p>
                        <p className="text-xs text-orange-600 mt-1">+2 ce mois</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <FileText className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Vues totales</p>
                        <p className="text-3xl font-bold text-orange-600">1,247</p>
                        <p className="text-xs text-orange-600 mt-1">+12% vs mois dernier</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <Eye className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Contacts reçus</p>
                        <p className="text-3xl font-bold text-orange-600">23</p>
                        <p className="text-xs text-orange-600 mt-1">+5 ce mois</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <Users className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Taux de conversion</p>
                        <p className="text-3xl font-bold text-orange-600">1.8%</p>
                        <p className="text-xs text-orange-600 mt-1">+0.3% vs mois dernier</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graphiques et analyses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Performance des 7 derniers jours */}
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-6">Performance des 7 derniers jours</h5>
                    <div className="space-y-4">
                      {[
                        { day: 'Lundi', views: 156, percentage: 75 },
                        { day: 'Mardi', views: 189, percentage: 90 },
                        { day: 'Mercredi', views: 126, percentage: 60 },
                        { day: 'Jeudi', views: 178, percentage: 85 },
                        { day: 'Vendredi', views: 201, percentage: 95 },
                        { day: 'Samedi', views: 95, percentage: 45 },
                        { day: 'Dimanche', views: 63, percentage: 30 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 w-16">{item.day}</span>
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-orange-600 h-3 rounded-full transition-all duration-300" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-16 text-right">{item.views} vues</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top des annonces performantes */}
                  <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-6">Top des annonces performantes</h5>
                    <div className="space-y-4">
                      {machines.slice(0, 5).map((machine, index) => (
                        <div key={machine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-500' : 'bg-orange-400'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{machine.name}</p>
                              <p className="text-sm text-gray-600">{machine.brand} • {machine.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-orange-600">{Math.floor(Math.random() * 200) + 50} vues</p>
                            <p className="text-sm text-gray-600">{Math.floor(Math.random() * 10) + 1} contacts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analyses détaillées */}
                <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
                  <h5 className="text-lg font-semibold text-gray-900 mb-6">Analyses détaillées</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <h6 className="font-semibold text-orange-800 mb-2">Meilleur jour</h6>
                      <p className="text-2xl font-bold text-orange-600">Vendredi</p>
                      <p className="text-sm text-gray-600">201 vues en moyenne</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <h6 className="font-semibold text-orange-800 mb-2">Catégorie la plus vue</h6>
                      <p className="text-2xl font-bold text-orange-600">Pelles hydrauliques</p>
                      <p className="text-sm text-gray-600">45% des vues totales</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <h6 className="font-semibold text-orange-800 mb-2">Temps de réponse</h6>
                      <p className="text-2xl font-bold text-orange-600">2.3h</p>
                      <p className="text-sm text-gray-600">Moyenne des réponses</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 