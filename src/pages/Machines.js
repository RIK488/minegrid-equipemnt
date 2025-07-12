import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import MachineCard from '../components/MachineCard';
import { categories } from '../data/categories';
import supabase from '../utils/supabaseClient';
import { jobCategories } from '../data/jobcategories'; // ajout pour catégorie métier
export default function Machines({ category }) {
    const [hashKey, setHashKey] = useState(0);
    useEffect(() => {
        const handleHashChange = () => {
            setHashKey(prev => prev + 1); // force relecture des params
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    const [selectedJobCategory, setSelectedJobCategory] = useState('');
    const [selectedMachineCategory, setSelectedMachineCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [filterCondition, setFilterCondition] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.split('?')[1]);
        const cat = params.get('categorie');
        const machineCat = params.get('machine');
        const type = params.get('type');
        const search = params.get('search');
        const condition = params.get('etat');
        if (cat && cat !== 'Tous secteurs') {
            setSelectedJobCategory(cat);
        }
        else {
            setSelectedJobCategory('');
        }
        if (machineCat)
            setSelectedMachineCategory(machineCat);
        if (type)
            setSelectedType(type);
        if (search)
            setSearchTerm(search);
        if (condition)
            setFilterCondition(condition);
    }, [hashKey]); // ✅ bonne dépendance
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedJobCategory)
            params.set('categorie', selectedJobCategory);
        if (selectedMachineCategory)
            params.set('machine', selectedMachineCategory);
        if (selectedType)
            params.set('type', selectedType);
        if (searchTerm)
            params.set('search', searchTerm);
        if (filterCondition !== 'all')
            params.set('etat', filterCondition);
        window.location.hash = `#machines?${params.toString()}`;
    }, [selectedJobCategory, selectedMachineCategory, selectedType, searchTerm, filterCondition]);
    useEffect(() => {
        const fetchMachines = async () => {
            const { data, error } = await supabase
                .from('machines')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setMachines(data);
            }
            else {
                console.error('Erreur chargement machines :', error);
            }
            setLoading(false);
        };
        fetchMachines();
    }, []);
    const filteredMachines = machines.filter((machine) => {
        const matchBrand = selectedBrand
            ? machine.brand?.toLowerCase() === selectedBrand.toLowerCase()
            : true;
        const matchCategory = selectedJobCategory && selectedJobCategory !== 'Tous secteurs'
            ? machine.category?.toLowerCase().includes(selectedJobCategory.toLowerCase())
            : true;
        const matchMachineCategory = selectedMachineCategory
            ? machine.type?.toLowerCase().includes(selectedMachineCategory.toLowerCase())
            : true;
        const matchType = selectedType
            ? machine.name?.toLowerCase().includes(selectedType.toLowerCase())
            : true;
        const matchCondition = filterCondition === 'all' ? true : machine.condition === filterCondition;
        const matchSearch = searchTerm
            ? machine.name?.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const matchPrice = (!priceMin || machine.price >= parseFloat(priceMin)) &&
            (!priceMax || machine.price <= parseFloat(priceMax));
        const noFilters = !selectedJobCategory &&
            !selectedMachineCategory &&
            !selectedType &&
            !selectedBrand &&
            !searchTerm &&
            filterCondition === 'all';
        return (noFilters || (matchCategory &&
            matchMachineCategory &&
            matchType &&
            matchCondition &&
            matchSearch &&
            matchPrice &&
            matchBrand));
    });
    const sortedMachines = [...filteredMachines]; // par exemple
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: _jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-500 mb-4", children: [_jsx("a", { href: "#", className: "hover:text-primary-600", children: "Accueil" }), _jsx(ChevronRight, { className: "h-4 w-4 mx-2" }), _jsx("span", { className: "text-gray-900", children: "Machines" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-6 gap-6", children: [_jsx("div", { className: "md:col-span-1 space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md p-3", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2 text-sm", children: "Filtres" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Secteur" }), _jsxs("select", { value: selectedJobCategory, onChange: (e) => setSelectedJobCategory(e.target.value), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { value: "Tous secteurs", children: "Tous les secteurs" }), jobCategories.map((cat) => (_jsx("option", { value: cat.name, children: cat.name }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Machines" }), _jsxs("select", { value: selectedMachineCategory, onChange: (e) => setSelectedMachineCategory(e.target.value), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "Toutes les machines" }), categories.map(cat => (_jsx("option", { value: cat.name, children: cat.name }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Type" }), _jsxs("select", { value: selectedType, onChange: (e) => setSelectedType(e.target.value), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "Tous les types" }), _jsx("option", { value: "Tous secteurs", children: "Tous les secteurs" }), categories
                                                                .find(cat => cat.name === selectedMachineCategory)
                                                                ?.subcategories?.map(sub => (_jsx("option", { value: sub.name, children: sub.name }, sub.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Marque" }), _jsxs("select", { value: selectedBrand, onChange: (e) => setSelectedBrand(e.target.value), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "Toutes les marques" }), _jsx("option", { value: "Caterpillar", children: "Caterpillar" }), _jsx("option", { value: "Volvo", children: "Volvo" }), _jsx("option", { value: "Komatsu", children: "Komatsu" }), _jsx("option", { value: "Liebherr", children: "Liebherr" }), _jsx("option", { value: "JCB", children: "JCB" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Ann\u00E9e" }), _jsxs("div", { className: "grid grid-cols-2 gap-1", children: [_jsx("input", { type: "number", placeholder: "Min", className: "px-2 py-1 text-sm border border-gray-300 rounded-md" }), _jsx("input", { type: "number", placeholder: "Max", className: "px-2 py-1 text-sm border border-gray-300 rounded-md" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Prix (\u20AC)" }), _jsxs("div", { className: "grid grid-cols-2 gap-1", children: [_jsx("input", { type: "number", placeholder: "Min", value: priceMin, onChange: (e) => setPriceMin(e.target.value), className: "px-2 py-1 text-sm border border-gray-300 rounded-md" }), _jsx("input", { type: "number", placeholder: "Max", value: priceMax, onChange: (e) => setPriceMax(e.target.value), className: "px-2 py-1 text-sm border border-gray-300 rounded-md" })] })] })] })] }) }), _jsx("div", { className: "md:col-span-5", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Toutes les machines" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 sm:items-center", children: [_jsxs("div", { className: "relative w-full sm:w-auto", children: [_jsx("input", { type: "text", placeholder: "Rechercher...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full" }), _jsx(Search, { className: "absolute left-3 top-2.5 h-5 w-5 text-gray-400" })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-4 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "date", children: "Plus r\u00E9cent" }), _jsx("option", { value: "price", children: "Prix croissant" }), _jsx("option", { value: "name", children: "Nom A-Z" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: loading ? (_jsx("p", { className: "text-center col-span-full text-gray-500", children: "Chargement..." })) : filteredMachines.length === 0 ? (_jsx("p", { className: "text-center col-span-full text-gray-500", children: "Aucune machine trouv\u00E9e." })) : (filteredMachines.map((machine) => (_jsx(MachineCard, { machine: machine }, machine.id)))) })] }) })] })] }) }));
}
