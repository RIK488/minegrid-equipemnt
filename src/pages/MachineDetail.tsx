import React, { useEffect, useState } from 'react';
import {
  Calendar, MapPin, Star, PenTool as Tool, Scale, ChevronRight,
  ChevronLeft, Phone, Mail, Download, Heart, Share2, Globe
} from 'lucide-react';
import type { Machine, MachineWithPremium } from '../types';
import { isSeller, isOwner } from '../utils/auth';
import supabase from '../utils/supabaseClient';
import { recordMachineView } from '../utils/api';
import LogisticsSimulator from '../components/LogisticsSimulator';
import TransportCard from '../components/TransportCard';
import PremiumBadge from '../components/PremiumBadge';
import PremiumServices from '../components/PremiumServices';
import FinancingSimulator from '../components/FinancingSimulator';
import Price from '../components/Price';
import { useCurrencyStore } from '../stores/currencyStore';

interface MachineDetailProps {
  machineId: string;
}

export default function MachineDetail({ machineId }: MachineDetailProps) {
  const [machineData, setMachineData] = useState<MachineWithPremium | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🔄 Récupération de la devise sélectionnée pour forcer le re-render
  const { currentCurrency } = useCurrencyStore();

  useEffect(() => {
    const id = machineId;    
    console.log('Chargement machine avec ID:', id);
    
    if (id) {
      // D'abord, essayer de charger la machine sans la relation seller
      supabase
      .from('machines')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur chargement machine :', error);
          setError('Erreur lors du chargement de la machine. Veuillez réessayer.');
          setLoading(false);
        } else {
          console.log('Données machine chargées:', data);
          console.log('Seller ID de la machine:', data.seller_id);
          
          // Ensuite, charger les données du vendeur séparément
          if (data.seller_id) {
            console.log('Tentative de chargement du vendeur avec ID:', data.seller_id);
            supabase
            .from('users')
            .select('id, name, email, location, phone, company_name, description')
            .eq('id', data.seller_id)
            .single()
            .then(({ data: sellerData, error: sellerError }) => {
              if (!sellerError && sellerData) {
                console.log('Données vendeur chargées avec succès:', sellerData);
                setMachineData({
                  ...data,
                  seller: sellerData
                });
              } else {
                console.error('Erreur chargement vendeur:', sellerError);
                console.log('Vendeur non trouvé, utilisation des données de base');
                setMachineData(data);
              }
              // Définir loading à false seulement après avoir tenté de charger le vendeur
              setLoading(false);
            });
          } else {
            console.log('Aucun seller_id trouvé dans les données de la machine');
            setMachineData(data);
            setLoading(false);
          }
    
          // 🔁 Générer les URLs publiques à partir des noms d'images
          const urls: string[] = [];
          if (data.images && Array.isArray(data.images)) {
            data.images.forEach((img: string) => {
              const { data: publicUrl } = supabase
                .storage
                .from('machine-image')
                .getPublicUrl(img);
    
              if (publicUrl?.publicUrl) {
                urls.push(publicUrl.publicUrl);
              }
            });
          }
    
          setImageUrls(urls);

          // 📊 Enregistrer la vue de la machine
          recordMachineView(id).catch(err => {
            console.error('Erreur enregistrement vue:', err);
          });
        }
      });
    } else {
      setLoading(false);
      setError('ID de machine manquant');
    }
  }, [machineId]);

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-500 text-lg font-semibold">
        Chargement de la machine...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 text-red-500 text-lg font-semibold">
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!machineData) {
    return (
      <div className="text-center py-24 text-gray-500 text-lg font-semibold">
        Machine non trouvée
      </div>
    );
  }

  // Vérifier si l'utilisateur peut éditer cette machine
  const canEdit = isSeller() && machineData.seller && isOwner(machineData.seller.id);
  
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?");
  
    if (confirmDelete) {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', machineData.id);
  
      if (error) {
        alert("Erreur lors de la suppression.");
        console.error(error);
      } else {
        alert("Annonce supprimée.");
        window.location.hash = '#dashboard/annonces';
      }
    }
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const downloadTechSheet = async () => {
    const model = machineData?.model || machineData?.name || "fiche-technique";

    try {
      const response = await fetch(
        `https://n8n.srv786179.hstgr.cloud/webhook/scrape-pdf?model=${encodeURIComponent(model)}`
      );

      if (!response.ok) {
        alert("❌ Erreur lors du téléchargement");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${model}_techsheet.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur téléchargement fiche :", error);
      alert("❌ Une erreur est survenue.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Fil d'Ariane */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <a href="#" className="hover:text-primary-600">Accueil</a>
        <ChevronRight className="h-4 w-4 mx-2" />
        <a href="#machines" className="hover:text-primary-600">Machines</a>
        <ChevronRight className="h-4 w-4 mx-2" />
        <a href={`#machines?categorie=${machineData.category.toLowerCase()}`} className="hover:text-primary-600">
          {machineData.category}
        </a>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">{machineData.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Galerie */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrls[currentImageIndex] || '/public/image/Lentretien-de-premier-niveau-du-bouteur.jpg'}
              alt={machineData.name}
              className="w-full h-[500px] object-cover"
              onError={(e) => {
                e.currentTarget.src = '/public/image/Lentretien-de-premier-niveau-du-bouteur.jpg';
              }}
            />
            {imageUrls.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white">
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {imageUrls.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary-500 shadow-lg' : ''}`}
              >
                <img src={image} alt={`Vue ${index + 1}`} className="w-full h-24 object-cover" />
              </button>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-lg max-w-none">
              {(machineData.description || '').split('\n').map((p, i) => (
                <p key={i} className="mb-4">{p}</p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Spécifications techniques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dimensions et poids</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Dimensions</span>
                    <span className="font-medium">
                      {typeof machineData.specifications.dimensions === 'string'
                        ? machineData.specifications.dimensions
                        : 'Format incorrect'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Poids en ordre de marche</span>
                    <span className="font-medium">{machineData.specifications.workingWeight ? machineData.specifications.workingWeight.toLocaleString() : '0'} kg</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Capacité opérationnelle</span>
                    <span className="font-medium">{machineData.specifications.operatingCapacity ? machineData.specifications.operatingCapacity.toLocaleString() : '0'} kg</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Motorisation</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Puissance</span>
                    <span className="font-medium">
                      {machineData.specifications.power?.value && machineData.specifications.power?.unit 
                        ? `${machineData.specifications.power.value} ${machineData.specifications.power.unit}`
                        : 'Non spécifié'
                      }
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Simulateur de transport International déplacé ici */}
          <div className="mt-8">
            <LogisticsSimulator 
              key={`logistics-${currentCurrency}`}
              machineWeight={machineData.specifications.weight ? machineData.specifications.weight / 1000 : undefined}
              machineVolume={
                machineData.specifications.dimensions && typeof machineData.specifications.dimensions === 'object' 
                  ? (parseFloat((machineData.specifications.dimensions as any).length || '0') * 
                     parseFloat((machineData.specifications.dimensions as any).width || '0') * 
                     parseFloat((machineData.specifications.dimensions as any).height || '0'))
                  : undefined
              }
              machineValue={machineData.price || undefined}
              isPremium={!!machineData.premium}
            />
          </div>
        </div>

        {/* Infos machine */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{machineData.name}</h1>
                <p className="text-lg text-gray-600">{machineData.brand} {machineData.model}</p>
                {machineData.type && (
                  <p className="text-sm text-gray-500">Catégorie technique : {machineData.type}</p>
                )}
                {machineData.category && (
                  <p className="text-sm text-gray-500">Secteur : {machineData.category}</p>
                )}
                
                {/* Badges Premium */}
                {machineData.premium && (
                  <div className="mt-2">
                    <PremiumBadge premium={machineData.premium} />
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-orange-600">
                  <Heart className="h-6 w-6" />
                </button>
                <button className="p-2 text-gray-500 hover:text-orange-600">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="text-3xl font-bold text-orange-600 mb-6">
              {machineData.price ? (
                <Price amount={machineData.price} showOriginal className="text-3xl font-bold text-orange-600" />
              ) : (
                '0 €'
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600"><Calendar className="h-5 w-5 mr-2" /><span>{machineData.year}</span></div>
              <div className="flex items-center text-gray-600"><MapPin className="h-5 w-5 mr-2" /><span>{machineData.seller?.location}</span></div>
              <div className="flex items-center text-gray-600">
                <Tool className="h-5 w-5 mr-2" />
                <span>
                  {machineData.specifications.power?.value && machineData.specifications.power?.unit 
                    ? `${machineData.specifications.power.value} ${machineData.specifications.power.unit}`
                    : 'Non spécifié'
                  }
                </span>
              </div>
              <div className="flex items-center text-gray-600"><Scale className="h-5 w-5 mr-2" /><span>{machineData.specifications.weight ? machineData.specifications.weight.toLocaleString() : '0'} kg</span></div>
            </div>

            <div className="space-y-4">
              <button onClick={() => setShowContactForm(!showContactForm)} className="w-full bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Contacter le vendeur
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center" onClick={downloadTechSheet}>
                <Download className="h-5 w-5 mr-2" />
                Télécharger la fiche technique
              </button>
              {machineData.seller?.id ? (
                <button 
                  onClick={() => window.location.hash = `#vitrine/${machineData.seller.id}`}
                  className="w-full border border-blue-300 text-blue-700 px-6 py-3 rounded-md hover:bg-blue-50 flex items-center justify-center"
                >
                  <Globe className="h-5 w-5 mr-2" />
                  Voir vitrine du professionnel
                </button>
              ) : (
                <button 
                  onClick={() => {
                    console.log('Debug - machineData:', machineData);
                    console.log('Debug - seller:', machineData.seller);
                    console.log('Debug - seller_id from raw data:', (machineData as any).seller_id);
                    alert(`Informations du vendeur non disponibles.\n\nDebug:\n- Seller ID: ${(machineData as any).seller_id || 'null'}\n- Seller data: ${machineData.seller ? 'présent' : 'absent'}`);
                  }}
                  className="w-full border border-gray-300 text-gray-500 px-6 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center cursor-not-allowed"
                  disabled
                >
                  <Globe className="h-5 w-5 mr-2" />
                  Vitrine non disponible (seller_id: {(machineData as any).seller_id || 'null'})
                </button>
              )}
              {canEdit && (
                <div className="pt-4 border-t space-y-2">
                  <button className="w-full text-sm text-blue-600 hover:underline" onClick={() => alert("Formulaire d'édition à venir")}>
                    ✏️ Modifier cette annonce
                  </button>
                  <button className="w-full text-sm text-blue-600 hover:underline" onClick={() => imageUrls.forEach((img) => window.open(img, '_blank'))}>
                    📥 Télécharger les images
                  </button>
                  <button
                    className="w-full text-sm text-red-600 hover:underline"
                    onClick={handleDelete}
                  >
                    🗑 Supprimer cette annonce
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire de contact dynamique, apparition fluide */}
          {showContactForm && (
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contacter le vendeur</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    defaultValue={`Bonjour,\nJe suis intéressé par votre ${machineData.name}.\nPouvez-vous me donner plus d'informations ?\nMerci.`}
                  />
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors">
                  Envoyer
                </button>
              </form>
            </div>
          )}

          {/* Services Premium (si propriétaire) */}
          {canEdit && (
            <PremiumServices
              machineId={machineData.id}
              machineName={machineData.name}
              currentPrice={machineData.price || 0}
              isOwner={true}
            />
          )}

          {/* Carte de transport rapide */}
          <TransportCard 
            machineWeight={machineData.specifications.weight ? machineData.specifications.weight / 1000 : undefined}
            machineVolume={
              machineData.specifications.dimensions && typeof machineData.specifications.dimensions === 'object' 
                ? (parseFloat((machineData.specifications.dimensions as any).length || '0') * 
                   parseFloat((machineData.specifications.dimensions as any).width || '0') * 
                   parseFloat((machineData.specifications.dimensions as any).height || '0'))
                : undefined
            }
          />

          {/* Simulateur de financement */}
          <FinancingSimulator 
            machinePrice={machineData.price || 0}
          />
        </div>
      </div>
    </div>
  );
}
