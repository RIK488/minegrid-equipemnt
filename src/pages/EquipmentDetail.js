import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, MapPin, Star, PenTool as Tool, Scale, Phone, Mail, ChevronRight, ChevronLeft, Heart, Share2, Download } from 'lucide-react';
// Données de démonstration
const equipmentData = {
    id: '1',
    name: 'Finisseur VÖGELE SUPER 1800-3i',
    brand: 'VÖGELE',
    model: 'SUPER 1800-3i',
    category: 'Matériel de Voirie',
    year: 2023,
    price: 450000,
    condition: 'new',
    description: `Le finisseur VÖGELE SUPER 1800-3i représente la nouvelle génération de finisseurs sur pneus. 
  Équipé des dernières technologies, il offre une performance exceptionnelle pour tous types de chantiers routiers.
  
  Caractéristiques principales :
  - Système de conduite ErgoPlus 3
  - Table extensible AB 500 TV
  - Système d'alimentation optimisé
  - Excellent rapport qualité-prix
  
  Applications :
  - Construction d'autoroutes
  - Routes nationales et départementales
  - Pistes d'aéroport
  - Parkings et zones industrielles`,
    specifications: {
        weight: 19500,
        dimensions: '6.1m x 2.55m x 3.0m',
        power: {
            value: 127,
            unit: 'kW'
        },
        operatingCapacity: 18500,
        workingWeight: 19500
    },
    images: [
        'https://images.unsplash.com/photo-1573176054053-b0e345766088?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581094487326-5937e8490a87?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563185628-6422a5788352?auto=format&fit=crop&w=800&q=80'
    ],
    seller: {
        id: 's1',
        name: 'Minegrid Equipment Pro',
        rating: 4.8,
        location: 'Casablanca'
    }
};
export default function EquipmentDetail() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);
    const nextImage = () => {
        setCurrentImageIndex((prev) => prev === equipmentData.images.length - 1 ? 0 : prev + 1);
    };
    const prevImage = () => {
        setCurrentImageIndex((prev) => prev === 0 ? equipmentData.images.length - 1 : prev - 1);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-500 mb-8", children: [_jsx("a", { href: "#", className: "hover:text-primary-600", children: "Accueil" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("a", { href: "#equipements", className: "hover:text-primary-600", children: "\u00C9quipements" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("a", { href: "#equipements/materiels-voirie", className: "hover:text-primary-600", children: equipmentData.category }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("span", { className: "text-gray-900", children: equipmentData.name })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "relative bg-gray-100 rounded-lg overflow-hidden", children: [_jsx("img", { src: equipmentData.images[currentImageIndex], alt: equipmentData.name, className: "w-full h-[500px] object-cover" }), _jsx("button", { onClick: prevImage, className: "absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white", children: _jsx(ChevronLeft, { className: "h-6 w-6" }) }), _jsx("button", { onClick: nextImage, className: "absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white", children: _jsx(ChevronRight, { className: "h-6 w-6" }) }), _jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2", children: equipmentData.images.map((_, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}` }, index))) })] }), _jsx("div", { className: "grid grid-cols-4 gap-4 mt-4", children: equipmentData.images.map((image, index) => (_jsx("button", { onClick: () => setCurrentImageIndex(index), className: `relative rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary-600' : ''}`, children: _jsx("img", { src: image, alt: `Vue ${index + 1}`, className: "w-full h-24 object-cover" }) }, index))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: equipmentData.name }), _jsxs("p", { className: "text-lg text-gray-600", children: [equipmentData.brand, " ", equipmentData.model] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { className: "p-2 text-gray-500 hover:text-primary-600", children: _jsx(Heart, { className: "h-6 w-6" }) }), _jsx("button", { className: "p-2 text-gray-500 hover:text-primary-600", children: _jsx(Share2, { className: "h-6 w-6" }) })] })] }), _jsx("div", { className: "text-3xl font-bold text-primary-600 mb-6", children: equipmentData.price ? equipmentData.price.toLocaleString() + ' €' : 'Non renseigné' }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Calendar, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: equipmentData.year })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(MapPin, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: equipmentData.seller.location })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Tool, { className: "h-5 w-5 mr-2" }), _jsxs("span", { children: [equipmentData.specifications.power.value, " ", equipmentData.specifications.power.unit] })] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Scale, { className: "h-5 w-5 mr-2" }), _jsxs("span", { children: [equipmentData.specifications.weight.toLocaleString(), " kg"] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: () => setShowContactForm(true), className: "w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center", children: [_jsx(Mail, { className: "h-5 w-5 mr-2" }), "Contacter le vendeur"] }), _jsxs("button", { className: "w-full border border-primary-600 text-primary-600 px-6 py-3 rounded-md hover:bg-primary-50 transition-colors flex items-center justify-center", children: [_jsx(Phone, { className: "h-5 w-5 mr-2" }), "Afficher le num\u00E9ro"] }), _jsxs("button", { className: "w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center", children: [_jsx(Download, { className: "h-5 w-5 mr-2" }), "T\u00E9l\u00E9charger la fiche technique"] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: equipmentData.seller.name }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx(Star, { className: "h-5 w-5 text-yellow-400" }), _jsxs("span", { className: "ml-1 text-gray-600", children: [equipmentData.seller.rating, "/5"] })] })] }), _jsx("img", { src: "https://via.placeholder.com/60", alt: "Logo vendeur", className: "w-15 h-15 rounded-full" })] }), _jsx("button", { className: "w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50", children: "Voir tous ses \u00E9quipements" })] })] })] }), _jsxs("div", { className: "mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Description" }), _jsx("div", { className: "prose prose-lg max-w-none", children: equipmentData.description && equipmentData.description.split('\n').map((paragraph, index) => (_jsx("p", { children: paragraph }, index))) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Sp\u00E9cifications techniques" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Dimensions et poids" }), _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Dimensions" }), _jsx("span", { className: "font-medium", children: equipmentData.specifications.dimensions })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Poids en ordre de marche" }), _jsxs("span", { className: "font-medium", children: [equipmentData.specifications.workingWeight.toLocaleString(), " kg"] })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Capacit\u00E9 op\u00E9rationnelle" }), _jsxs("span", { className: "font-medium", children: [equipmentData.specifications.operatingCapacity.toLocaleString(), " kg"] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Motorisation" }), _jsx("ul", { className: "space-y-2", children: _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Puissance" }), _jsxs("span", { className: "font-medium", children: [equipmentData.specifications.power.value, " ", equipmentData.specifications.power.unit] })] }) })] })] })] })] }), _jsx("div", { className: `lg:col-span-1 ${showContactForm ? 'block' : 'hidden lg:block'}`, children: _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 sticky top-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Contacter le vendeur" }), _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nom complet" }), _jsx("input", { type: "text", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "T\u00E9l\u00E9phone" }), _jsx("input", { type: "tel", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Message" }), _jsx("textarea", { rows: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500", defaultValue: `Bonjour,\nJe suis intéressé par votre ${equipmentData.name}.\nPouvez-vous me donner plus d'informations ?\nMerci.` })] }), _jsx("button", { type: "submit", className: "w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors", children: "Envoyer le message" })] })] }) })] })] }));
}
