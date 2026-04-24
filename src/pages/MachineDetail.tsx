import React, { useEffect, useState } from 'react';
import {
  Calendar, MapPin, Star, PenTool as Tool, Scale, ChevronRight,
  ChevronLeft, Phone, Mail, Download, Heart, Share2, Globe
} from 'lucide-react';
import type { Machine, MachineWithPremium } from '../types';
import { isSeller, isOwner } from '../utils/auth';
import supabase from '../utils/supabaseClient';
import { MACHINE_LIST_COLUMNS } from '../constants/machineQueryFields';
import { recordMachineView } from '../utils/api';
import {
  buildSrcSet,
  getOptimizedImageUrl,
  handleImageErrorFallback,
} from '../utils/imageOptimization';
import LogisticsSimulator from '../components/LogisticsSimulator';
import TransportCard from '../components/TransportCard';
import PremiumBadge from '../components/PremiumBadge';
import PremiumServices from '../components/PremiumServices';
import FinancingSimulator from '../components/FinancingSimulator';
import Price from '../components/Price';
import { useCurrencyStore } from '../stores/currencyStore';
import { toast } from '../utils/toast';
import { submitQuoteRequest } from '../utils/api/quoteRequests';
import { trackEvent } from '../utils/analytics';
import { logger } from '../utils/logger';
interface MachineDetailProps {
  machineId: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  needByDate?: string;
  message: string;
  offerAmount?: number;
}



export default function MachineDetail({ machineId }: MachineDetailProps) {
  const [machineData, setMachineData] = useState<MachineWithPremium | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le formulaire de contact
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    country: '',
    needByDate: '',
    message: '',
    offerAmount: undefined
  });



  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  

  
  // 🔄 Récupération de la devise sélectionnée pour forcer le re-render
  const { currentCurrency } = useCurrencyStore();

  useEffect(() => {
    const id = machineId;    
    console.log('Chargement machine avec ID:', id);
    
    if (id) {
      // D'abord, essayer de charger la machine sans la relation seller
      supabase
      .from('machines')
      .select(MACHINE_LIST_COLUMNS)
      .eq('id', id)
      .single()
      .abortSignal(new AbortController().signal)  // Force refresh
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur chargement machine :', error);
          setError('Erreur lors du chargement de la machine. Veuillez réessayer.');
          setLoading(false);
        } else {
          console.log('Données machine chargées:', data);
          console.log('Seller ID de la machine:', data.sellerid);
          console.log('🔍 DEBUG COMPLET - Toutes les propriétés de data:', Object.keys(data));
          console.log('🔍 DEBUG COMPLET - Valeur de sellerid:', data.sellerid);
          console.log('🔍 DEBUG COMPLET - Type de sellerid:', typeof data.sellerid);
          
          // Ensuite, charger les données du vendeur séparément
          if (data.sellerid) {
            console.log('Tentative de chargement du vendeur avec ID:', data.sellerid);
            supabase
            .from('users')
            .select('id, name, email, location, phone, company_name, description')
            .eq('id', data.sellerid)
            .single()
            .then(({ data: sellerData, error: sellerError }) => {
              if (!sellerError && sellerData) {
                console.log('Données vendeur chargées avec succès:', sellerData);
                setMachineData({
                  ...data,
                  seller: {
                    ...sellerData,
                    location:
                      (sellerData as any)?.location ||
                      [data.city, data.region, data.country].filter(Boolean).join(', ') ||
                      'Localisation inconnue',
                  }
                });
              } else {
                console.error('Erreur chargement vendeur:', sellerError);
                console.log('Vendeur non trouvé, utilisation des données de base');
                setMachineData({
                  ...data,
                  seller: {
                    id: (data as any).sellerid || (data as any).seller_id || '',
                    name: '',
                    rating: 0,
                    location: [data.city, data.region, data.country].filter(Boolean).join(', ') || 'Localisation inconnue',
                  },
                });
              }
              // Définir loading à false seulement après avoir tenté de charger le vendeur
              setLoading(false);
            });
          } else {
            console.log('Aucun sellerid trouvé dans les données de la machine');
            setMachineData({
              ...data,
              seller: {
                id: (data as any).sellerid || (data as any).seller_id || '',
                name: '',
                rating: 0,
                location: [data.city, data.region, data.country].filter(Boolean).join(', ') || 'Localisation inconnue',
              },
            });
            setLoading(false);
          }
    
          // 🔁 Générer les URLs images : URL externe directe OU path Storage legacy.
          const urls: string[] = [];
          const imgCandidates: string[] = [];
          if (Array.isArray(data.images)) imgCandidates.push(...data.images);
          if (Array.isArray((data as any).photos)) imgCandidates.push(...(data as any).photos);
          imgCandidates.forEach((img: string) => {
            const raw = String(img || '').trim();
            if (!raw) return;
            if (raw.startsWith('http://') || raw.startsWith('https://')) {
              urls.push(raw);
              return;
            }
            const { data: publicUrl } = supabase.storage.from('machine-image').getPublicUrl(raw);
            if (publicUrl?.publicUrl) urls.push(publicUrl.publicUrl);
          });

          const scoreImageUrl = (rawUrl: string): number => {
            const url = String(rawUrl || '').toLowerCase();
            if (!url) return -999;
            let score = 0;
            if (url.includes('original') || url.includes('large') || url.includes('xl')) score += 8;
            if (url.includes('w=2000') || url.includes('w=1600') || url.includes('w=1200')) score += 6;
            else if (url.includes('w=1000') || url.includes('w=900') || url.includes('w=800')) score += 4;
            if (url.includes('thumb') || url.includes('thumbnail') || url.includes('small') || url.includes('icon')) score -= 8;
            if (url.includes('placeholder') || url.includes('default')) score -= 12;
            return score;
          };

          const sortedUrls = [...new Set(urls)].sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
          setImageUrls(sortedUrls);

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

  useEffect(() => {
    if (!machineId) return;
    const stored = window.localStorage.getItem('favorite_machine_ids');
    if (!stored) {
      setIsFavorite(false);
      return;
    }
    try {
      const ids = JSON.parse(stored);
      setIsFavorite(Array.isArray(ids) && ids.includes(machineId));
    } catch {
      setIsFavorite(false);
    }
  }, [machineId]);

  useEffect(() => {
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(query);
    if (params.get('contact') === '1' || params.get('quote') === '1') {
      setShowContactForm(true);
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
        toast("Erreur lors de la suppression.");
        console.error(error);
      } else {
        toast("Annonce supprimée.");
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
    const scrapePdfUrl = import.meta.env.VITE_N8N_SCRAPE_PDF_URL || '';

    try {
      const response = await fetch(
        `${scrapePdfUrl}?model=${encodeURIComponent(model)}`
      );

      if (!response.ok) {
        toast("❌ Erreur lors du téléchargement");
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
      toast("❌ Une erreur est survenue.");
    }
  };

  const toggleFavorite = () => {
    if (!machineId) return;
    const stored = window.localStorage.getItem('favorite_machine_ids');
    let ids: string[] = [];
    try {
      ids = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(ids)) ids = [];
    } catch {
      ids = [];
    }

    const nextIds = isFavorite ? ids.filter((id) => id !== machineId) : [...new Set([...ids, machineId])];
    window.localStorage.setItem('favorite_machine_ids', JSON.stringify(nextIds));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#machines/${machineId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: machineData?.name || 'Annonce machine',
          text: machineData?.model || '',
          url: shareUrl,
        });
        setShareFeedback('Lien partagé');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Lien copié');
      } else {
        window.prompt('Copiez ce lien :', shareUrl);
        setShareFeedback('Lien prêt à copier');
      }
    } catch {
      setShareFeedback('Partage annulé');
    } finally {
      window.setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  // Fonction pour gérer les changements dans le formulaire de contact
  const handleContactFormChange = (field: keyof ContactFormData, value: string | number | undefined) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };



  // Fonction pour envoyer l'email de contact
  const handleSendContactEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setEmailError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!contactForm.email.includes('@')) {
      setEmailError('Veuillez entrer une adresse email valide.');
      return;
    }

    setSendingEmail(true);
    setEmailError(null);

    try {
      let primaryLeadCaptured = false;
      /**
       * Le lead commercial (quote_requests) est important, mais ne doit PAS bloquer
       * l'envoi du message principal si la table n'existe pas encore en prod
       * ou si la policy RLS est mal configurée.
       */
      const sellerIdRaw = machineData?.seller?.id || (machineData as any)?.sellerid || null;
      const sellerId =
        typeof sellerIdRaw === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sellerIdRaw)
          ? sellerIdRaw
          : null;

      try {
        await submitQuoteRequest({
          machine_id: machineId,
          machine_name: machineData?.name || 'Machine',
          brand: machineData?.brand || null,
          seller_id: sellerId,
          buyer_name: contactForm.name,
          buyer_email: contactForm.email,
          buyer_phone: contactForm.phone || null,
          country: contactForm.country || null,
          budget_max: contactForm.offerAmount || null,
          need_by_date: contactForm.needByDate || null,
          message: contactForm.message,
          source: 'machine_detail_contact_form',
        });
        trackEvent('lead_submit', {
          source: 'machine_detail_contact_form',
          has_budget: Boolean(contactForm.offerAmount),
        });
        primaryLeadCaptured = true;
      } catch (quoteErr) {
        logger.warn('[MachineDetail] quote request non bloquante', quoteErr);
      }

      // Si un montant d'offre est fourni, créer une offre
      if (contactForm.offerAmount && contactForm.offerAmount > 0) {
        // Récupérer l'utilisateur connecté ou créer un profil temporaire
        const { data: { user } } = await supabase.auth.getUser();
        
        let buyerId = user?.id;
        
        // Si pas d'utilisateur connecté, créer un profil temporaire
        if (!user) {
          const { data: tempProfile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              email: contactForm.email,
              firstname: contactForm.name.split(' ')[0] || contactForm.name,
              lastname: contactForm.name.split(' ').slice(1).join(' ') || '',
              phone: contactForm.phone || null
            })
            .select()
            .single();

          if (profileError || !tempProfile?.id) {
            logger.warn('[MachineDetail] profil temporaire non créé (offre ignorée)', profileError);
            buyerId = null;
          } else {
            buyerId = tempProfile.id;
          }
        }

        if (buyerId) {
          // Créer l'offre dans la base de données (non bloquant pour le lead)
          const { data: offer, error: offerError } = await supabase
            .from('offers')
            .insert({
              machine_id: machineId,
              buyer_id: buyerId,
              seller_id: (machineData as any)?.sellerid,
              amount: contactForm.offerAmount,
              message: contactForm.message,
              status: 'pending'
            })
            .select()
            .single();

          if (offerError) {
            logger.warn('[MachineDetail] création offre échouée (lead conservé)', offerError);
          } else {
            logger.info('[MachineDetail] offre créée', { offerId: offer?.id });
          }
        }
      }

      // 1. Sauvegarder le message dans la base de données
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            sender_name: contactForm.name,
            sender_email: contactForm.email,
            sender_phone: contactForm.phone || null,
            message: contactForm.message,
            machine_id: machineId,
            sellerid: machineData?.seller?.id || (machineData as any)?.sellerid,
            status: 'new',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (messageError) {
        logger.warn('[MachineDetail] sauvegarde message échouée', messageError);
        if (!primaryLeadCaptured) {
          throw new Error('Erreur lors de la sauvegarde du message');
        }
      }

      logger.info('[MachineDetail] message vendeur sauvegardé', { messageId: messageData?.id });

      // 2. Récupérer l'email du vendeur depuis la base de données
      let sellerEmail = 'contact@minegrid-equipment.com'; // Email par défaut
      if (machineData?.seller?.id || (machineData as any)?.sellerid) {
        const sellerId = machineData?.seller?.id || (machineData as any)?.sellerid;
        
        // D'abord essayer de récupérer depuis la table machines
        const { data: machineInfo } = await supabase
          .from('machines')
          .select('seller_email')
          .eq('id', machineId)
          .single();
        
        if (machineInfo?.seller_email) {
          sellerEmail = machineInfo.seller_email;
        } else {
          // Sinon essayer depuis la table profiles
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', sellerId)
            .single();
          
          if (sellerData?.email) {
            sellerEmail = sellerData.email;
          }
        }
      }

      // 3. Envoyer l'email via la fonction Supabase Edge
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          to: sellerEmail,
          from: contactForm.email,
          subject: `Demande d'information - ${machineData?.name}`,
          html: `
            <h2>Nouvelle demande d'information</h2>
            <p><strong>Machine :</strong> ${machineData?.name}</p>
            <p><strong>Nom :</strong> ${contactForm.name}</p>
            <p><strong>Email :</strong> ${contactForm.email}</p>
            <p><strong>Téléphone :</strong> ${contactForm.phone || 'Non renseigné'}</p>
            <p><strong>Message :</strong></p>
            <p>${contactForm.message.replace(/\n/g, '<br>')}</p>
          `,
          machineId: machineId,
          messageId: messageData?.id || null
        }
      });

      if (emailError) {
        console.error('Erreur envoi email:', emailError);
        // Même si l'email échoue, le message est sauvegardé
        logger.warn('[MachineDetail] message sauvegardé, email non envoyé');
        
        // Afficher quand même un message de succès car le message est sauvegardé
        setEmailSent(true);
        setContactForm({
          name: '',
          email: '',
          phone: '',
          country: '',
          needByDate: '',
          message: '',
          offerAmount: undefined
        });
        
        // Fermer le formulaire après 3 secondes
        setTimeout(() => {
          setShowContactForm(false);
          setEmailSent(false);
        }, 3000);
        
        return; // Sortir de la fonction ici
      } else {
        logger.info('[MachineDetail] email vendeur envoyé', { ok: Boolean(emailData) });
      }

      // 4. Succès
      setEmailSent(true);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        country: '',
        needByDate: '',
        message: '',
        offerAmount: undefined
      });

      // 5. Fermer le formulaire après 3 secondes
      setTimeout(() => {
        setShowContactForm(false);
        setEmailSent(false);
      }, 3000);

    } catch (error) {
      logger.error('[MachineDetail] erreur envoi contact', error);
      setEmailError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSendingEmail(false);
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
            {(() => {
              const originalMain =
                imageUrls[currentImageIndex] || '/public/image/Lentretien-de-premier-niveau-du-bouteur.jpg';
              const optimizedMain = getOptimizedImageUrl(originalMain, {
                width: 1600,
                quality: 85,
                resize: 'cover',
              });
              return (
                <img
                  src={optimizedMain}
                  srcSet={buildSrcSet(originalMain, 1200, 85) || undefined}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  alt={machineData.name}
                  decoding="async"
                  className="w-full h-[500px] object-cover"
                  onError={(e) => {
                    // 1er essai : URL originale sans transformation Supabase.
                    if (e.currentTarget.dataset.fallbackApplied !== '1') {
                      handleImageErrorFallback(e, originalMain);
                      return;
                    }
                    // 2e essai : placeholder local.
                    e.currentTarget.src = '/public/image/Lentretien-de-premier-niveau-du-bouteur.jpg';
                  }}
                />
              );
            })()}
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
            {imageUrls.map((image, index) => {
              const thumb = getOptimizedImageUrl(image, { width: 300, quality: 75, resize: 'cover' });
              return (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary-500 shadow-lg' : ''}`}
                >
                  <img
                    src={thumb}
                    srcSet={buildSrcSet(image, 300, 75) || undefined}
                    alt={`Vue ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => handleImageErrorFallback(e, image)}
                    className="w-full h-24 object-cover"
                  />
                </button>
              );
            })}
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
                <button
                  onClick={toggleFavorite}
                  className={`p-2 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-orange-600'}`}
                  title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className="h-6 w-6" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                  title="Partager l'annonce"
                  aria-label="Partager l'annonce"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>
            {shareFeedback && (
              <p className="mb-3 text-sm text-green-600">{shareFeedback}</p>
            )}

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
              <button
                type="button"
                onClick={() => {
                  setShowContactForm(true);
                  trackEvent('quote_cta_click', { origin: 'machine_detail' });
                }}
                className="w-full border border-orange-300 text-orange-700 px-6 py-3 rounded-md hover:bg-orange-50 transition-colors flex items-center justify-center"
              >
                Demander un devis
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
                    toast(`Informations du vendeur non disponibles.\n\nDebug:\n- Seller ID: ${(machineData as any).sellerid || 'null'}\n- Seller data: ${machineData.seller ? 'présent' : 'absent'}`);
                  }}
                  className="w-full border border-gray-300 text-gray-500 px-6 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center cursor-not-allowed"
                  disabled
                >
                  <Globe className="h-5 w-5 mr-2" />
                  Vitrine non disponible
                </button>
              )}
              {canEdit && (
                <div className="pt-4 border-t space-y-2">
                  <button className="w-full text-sm text-blue-600 hover:underline" onClick={() => toast("Formulaire d'édition à venir")}>
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
              
              {emailSent ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-6xl mb-4">✓</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-600">Votre message a été envoyé au vendeur. Il vous répondra dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSendContactEmail} className="space-y-4">
                  {emailError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {emailError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => handleContactFormChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => handleContactFormChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input 
                      type="tel" 
                      value={contactForm.phone}
                      onChange={(e) => handleContactFormChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={contactForm.country || ''}
                      onChange={(e) => handleContactFormChange('country', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ex: Maroc, Côte d'Ivoire..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Besoin avant (date souhaitée)
                    </label>
                    <input
                      type="date"
                      value={contactForm.needByDate || ''}
                      onChange={(e) => handleContactFormChange('needByDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant de votre offre (MAD) <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      step="1000"
                      value={contactForm.offerAmount || ''}
                      onChange={(e) => handleContactFormChange('offerAmount', parseFloat(e.target.value) || undefined)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" 
                      placeholder="Ex: 140000 (si vous voulez faire une offre)"
                    />
                    {contactForm.offerAmount && (
                      <p className="text-sm text-gray-600 mt-1">
                        Prix de vente : {machineData?.price?.toLocaleString()} MAD | 
                        Votre offre : {contactForm.offerAmount.toLocaleString()} MAD
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => handleContactFormChange('message', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder={`Bonjour,\nJe suis intéressé par votre ${machineData?.name}.\nPouvez-vous me donner plus d'informations ?\nMerci.`}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      type="submit" 
                      disabled={sendingEmail}
                      className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi...
                        </>
                      ) : (
                        'Envoyer le message'
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
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
