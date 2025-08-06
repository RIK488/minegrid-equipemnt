import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ChevronRight, MapPin, Star } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import Price from '../components/Price';
import { useCurrencyStore } from '../stores/currencyStore';
export default function SellerMachines({ sellerId }) {
    const [machines, setMachines] = useState([]);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentCurrency } = useCurrencyStore();
    useEffect(() => {
        const fetchSellerMachines = async () => {
            try {
                console.log("🔍 Récupération des machines pour le vendeur:", sellerId);
                // Récupérer les informations du vendeur
                const { data: sellerData, error: sellerError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', sellerId)
                    .single();
                if (sellerError) {
                    console.error('Erreur chargement vendeur:', sellerError);
                    return;
                }
                console.log("👤 Informations du vendeur récupérées:", sellerData);
                if (sellerData) {
                    setSellerInfo({
                        id: sellerData.id,
                        name: `${sellerData.firstName || ''} ${sellerData.lastName || ''}`.trim(),
                        rating: 4.5,
                        location: sellerData.location || 'Localisation non spécifiée'
                    });
                    // Récupérer les machines du vendeur avec la même logique que getSellerMachines
                    const { data: machinesData, error: machinesError } = await supabase
                        .from('machines')
                        .select('*')
                        .eq('sellerid', sellerId)
                        .order('created_at', { ascending: false });
                    if (machinesError) {
                        console.error('Erreur chargement machines:', machinesError);
                    }
                    else {
                        console.log("📊 Machines récupérées:", machinesData);
                        console.log("📊 Nombre de machines:", machinesData?.length || 0);
                        setMachines(machinesData || []);
                    }
                }
            }
            catch (error) {
                console.error('Erreur:', error);
            }
            finally {
                setLoading(false);
            }
        };
        if (sellerId) {
            fetchSellerMachines();
        }
    }, [sellerId]);
    if (loading) {
        return (_jsx("div", { className: "text-center py-24 text-gray-500 text-lg font-semibold", children: "Chargement des machines..." }));
    }
    if (!sellerInfo) {
        return (_jsx("div", { className: "text-center py-24 text-gray-500 text-lg font-semibold", children: "Vendeur non trouv\u00E9" }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-500 mb-8", children: [_jsx("a", { href: "#", className: "hover:text-primary-600", children: "Accueil" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("a", { href: "#machines", className: "hover:text-primary-600", children: "Machines" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("span", { className: "text-gray-900", children: sellerInfo.name })] }), _jsx("div", { className: "bg-white rounded-lg shadow-md p-6 mb-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: sellerInfo.name }), _jsxs("div", { className: "flex items-center text-gray-500", children: [_jsx(MapPin, { className: "h-4 w-4 mr-1" }), _jsx("span", { children: sellerInfo.location })] }), _jsxs("div", { className: "flex items-center mt-2", children: [_jsx(Star, { className: "h-5 w-5 text-yellow-400" }), _jsxs("span", { className: "ml-1 text-gray-600", children: [sellerInfo.rating, "/5"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold text-primary-600", children: machines.length }), _jsxs("div", { className: "text-sm text-gray-500", children: ["machine", machines.length > 1 ? 's' : '', " disponible", machines.length > 1 ? 's' : ''] })] })] }) }), machines.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-gray-500 text-lg mb-4", children: "Aucune machine disponible pour le moment" }), _jsx("p", { className: "text-gray-400", children: "Ce vendeur n'a pas encore publi\u00E9 d'annonces" })] })) : (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["Annonces de ", sellerInfo.name] }), _jsxs("div", { className: "text-sm text-gray-500", children: [machines.length, " machine", machines.length > 1 ? 's' : '', " disponible", machines.length > 1 ? 's' : ''] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u00C9quipement" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Prix" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Cat\u00E9gorie" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: machines.map((machine) => (_jsxs("tr", { children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: machine.name }), _jsx("div", { className: "text-sm text-gray-500", children: machine.brand })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: _jsx(Price, { amount: machine.price || 0 }) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-900", children: machine.category }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: _jsx("a", { href: `#machines/${machine.id}`, className: "text-primary-600 hover:text-primary-900", children: "Voir" }) })] }, machine.id))) })] }) })] }))] }));
}
