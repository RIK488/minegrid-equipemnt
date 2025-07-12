import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Calendar, MapPin, PenTool as Tool, Scale, ChevronRight, ChevronLeft, Mail, Download, Heart, Share2 } from 'lucide-react';
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
export default function MachineDetail({ machineId }) {
    const [machineData, setMachineData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    // 🔄 Récupération de la devise sélectionnée pour forcer le re-render
    const { currentCurrency } = useCurrencyStore();
    useEffect(() => {
        const id = machineId;
        if (id) {
            supabase
                .from('machines')
                .select('*')
                .eq('id', id)
                .single()
                .then(({ data, error }) => {
                if (error) {
                    console.error('Erreur chargement machine :', error);
                }
                else {
                    setMachineData(data);
                    // 🔁 Générer les URLs publiques à partir des noms d'images
                    const urls = [];
                    if (data.images && Array.isArray(data.images)) {
                        data.images.forEach((img) => {
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
        }
    }, [machineId]);
    if (!machineData) {
        return (_jsx("div", { className: "text-center py-24 text-gray-500 text-lg font-semibold", children: "Chargement de la machine..." }));
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
            }
            else {
                alert("Annonce supprimée.");
                window.location.hash = '#dashboard/annonces';
            }
        }
    };
    const nextImage = () => {
        setCurrentImageIndex((prev) => prev === imageUrls.length - 1 ? 0 : prev + 1);
    };
    const prevImage = () => {
        setCurrentImageIndex((prev) => prev === 0 ? imageUrls.length - 1 : prev - 1);
    };
    const downloadTechSheet = async () => {
        const model = machineData?.model || machineData?.name || "fiche-technique";
        try {
            const response = await fetch(`https://n8n.srv786179.hstgr.cloud/webhook/scrape-pdf?model=${encodeURIComponent(model)}`);
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
        }
        catch (error) {
            console.error("Erreur téléchargement fiche :", error);
            alert("❌ Une erreur est survenue.");
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-500 mb-8", children: [_jsx("a", { href: "#", className: "hover:text-primary-600", children: "Accueil" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("a", { href: "#machines", className: "hover:text-primary-600", children: "Machines" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("a", { href: `#machines?categorie=${machineData.category.toLowerCase()}`, className: "hover:text-primary-600", children: machineData.category }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("span", { className: "text-gray-900", children: machineData.name })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "relative bg-gray-100 rounded-lg overflow-hidden", children: [_jsx("img", { src: imageUrls[currentImageIndex], alt: machineData.name, className: "w-full h-[500px] object-cover" }), _jsx("button", { onClick: prevImage, className: "absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white", children: _jsx(ChevronLeft, { className: "h-6 w-6" }) }), _jsx("button", { onClick: nextImage, className: "absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white", children: _jsx(ChevronRight, { className: "h-6 w-6" }) }), _jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2", children: imageUrls.map((_, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}` }, index))) })] }), _jsx("div", { className: "grid grid-cols-4 gap-4 mt-4", children: imageUrls.map((image, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `relative rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary-500 shadow-lg' : ''}`, children: _jsx("img", { src: image, alt: `Vue ${index + 1}`, className: "w-full h-24 object-cover" }) }, index))) }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mt-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Description" }), _jsx("div", { className: "prose prose-lg max-w-none", children: (machineData.description || '').split('\n').map((p, i) => (_jsx("p", { className: "mb-4", children: p }, i))) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mt-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Sp\u00E9cifications techniques" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Dimensions et poids" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Dimensions" }), _jsx("span", { className: "font-medium", children: typeof machineData.specifications.dimensions === 'string'
                                                                            ? machineData.specifications.dimensions
                                                                            : 'Format incorrect' })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Poids en ordre de marche" }), _jsxs("span", { className: "font-medium", children: [machineData.specifications.workingWeight ? machineData.specifications.workingWeight.toLocaleString() : '0', " kg"] })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Capacit\u00E9 op\u00E9rationnelle" }), _jsxs("span", { className: "font-medium", children: [machineData.specifications.operatingCapacity ? machineData.specifications.operatingCapacity.toLocaleString() : '0', " kg"] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Motorisation" }), _jsx("ul", { className: "space-y-2", children: _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Puissance" }), _jsx("span", { className: "font-medium", children: machineData.specifications.power?.value && machineData.specifications.power?.unit
                                                                        ? `${machineData.specifications.power.value} ${machineData.specifications.power.unit}`
                                                                        : 'Non spécifié' })] }) })] })] })] }), _jsx("div", { className: "mt-8", children: _jsx(LogisticsSimulator, { machineWeight: machineData.specifications.weight ? machineData.specifications.weight / 1000 : undefined, machineVolume: machineData.specifications.dimensions && typeof machineData.specifications.dimensions === 'object'
                                        ? (parseFloat(machineData.specifications.dimensions.length || '0') *
                                            parseFloat(machineData.specifications.dimensions.width || '0') *
                                            parseFloat(machineData.specifications.dimensions.height || '0'))
                                        : undefined, machineValue: machineData.price || undefined, isPremium: !!machineData.premium }, `logistics-${currentCurrency}`) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: machineData.name }), _jsxs("p", { className: "text-lg text-gray-600", children: [machineData.brand, " ", machineData.model] }), machineData.type && (_jsxs("p", { className: "text-sm text-gray-500", children: ["Cat\u00E9gorie technique : ", machineData.type] })), machineData.category && (_jsxs("p", { className: "text-sm text-gray-500", children: ["Secteur : ", machineData.category] })), machineData.premium && (_jsx("div", { className: "mt-2", children: _jsx(PremiumBadge, { premium: machineData.premium }) }))] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "p-2 text-gray-500 hover:text-primary-600", children: _jsx(Heart, { className: "h-6 w-6" }) }), _jsx("button", { className: "p-2 text-gray-500 hover:text-primary-600", children: _jsx(Share2, { className: "h-6 w-6" }) })] })] }), _jsx("div", { className: "text-3xl font-bold text-primary-600 mb-6", children: machineData.price ? (_jsx(Price, { amount: machineData.price, showOriginal: true, className: "text-3xl font-bold text-primary-600" })) : ('0 €') }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Calendar, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: machineData.year })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(MapPin, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: machineData.seller?.location })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Tool, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: machineData.specifications.power?.value && machineData.specifications.power?.unit
                                                            ? `${machineData.specifications.power.value} ${machineData.specifications.power.unit}`
                                                            : 'Non spécifié' })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Scale, { className: "h-5 w-5 mr-2" }), _jsxs("span", { children: [machineData.specifications.weight ? machineData.specifications.weight.toLocaleString() : '0', " kg"] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: () => setShowContactForm(!showContactForm), className: "w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center", children: [_jsx(Mail, { className: "h-5 w-5 mr-2" }), "Contacter le vendeur"] }), _jsxs("button", { className: "w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center", onClick: downloadTechSheet, children: [_jsx(Download, { className: "h-5 w-5 mr-2" }), "T\u00E9l\u00E9charger la fiche technique"] }), canEdit && (_jsxs("div", { className: "pt-4 border-t space-y-2", children: [_jsx("button", { className: "w-full text-sm text-blue-600 hover:underline", onClick: () => alert("Formulaire d'édition à venir"), children: "\u270F\uFE0F Modifier cette annonce" }), _jsx("button", { className: "w-full text-sm text-blue-600 hover:underline", onClick: () => imageUrls.forEach((img) => window.open(img, '_blank')), children: "\uD83D\uDCE5 T\u00E9l\u00E9charger les images" }), _jsx("button", { className: "w-full text-sm text-red-600 hover:underline", onClick: handleDelete, children: "\uD83D\uDDD1 Supprimer cette annonce" })] }))] })] }), showContactForm && (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Contacter le vendeur" }), _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nom complet" }), _jsx("input", { type: "text", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "T\u00E9l\u00E9phone" }), _jsx("input", { type: "tel", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Message" }), _jsx("textarea", { rows: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500", defaultValue: `Bonjour,\nJe suis intéressé par votre ${machineData.name}.\nPouvez-vous me donner plus d'informations ?\nMerci.` })] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors", children: "Envoyer" })] })] })), canEdit && (_jsx(PremiumServices, { machineId: machineData.id, machineName: machineData.name, currentPrice: machineData.price || 0, isOwner: true })), _jsx(TransportCard, { machineWeight: machineData.specifications.weight ? machineData.specifications.weight / 1000 : undefined, machineVolume: machineData.specifications.dimensions && typeof machineData.specifications.dimensions === 'object'
                                    ? (parseFloat(machineData.specifications.dimensions.length || '0') *
                                        parseFloat(machineData.specifications.dimensions.width || '0') *
                                        parseFloat(machineData.specifications.dimensions.height || '0'))
                                    : undefined }), _jsx(FinancingSimulator, { machinePrice: machineData.price || 0 })] })] })] }));
}
