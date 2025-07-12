import React, { useEffect, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import MachineCard from '../components/MachineCard';
import { categories, iconMap } from '../data/categories';
import type { Machine } from '../types';
import supabase from '../utils/supabaseClient';
import { jobCategories } from '../data/jobcategories'; // ajout pour catégorie métier


interface MachinesProps {
  category?: string | null;
}

export default function Machines({ category }: MachinesProps) {
  const [hashKey, setHashKey] = useState(0);
useEffect(() => {
  const handleHashChange = () => {
    setHashKey(prev => prev + 1); // force relecture des params
  };
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('');
  const [selectedMachineCategory, setSelectedMachineCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'name'>('date');
  const [filterCondition, setFilterCondition] = useState<'all' | 'new' | 'used'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
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
    } else {
      setSelectedJobCategory('');
    }
  
    if (machineCat) setSelectedMachineCategory(machineCat);
    if (type) setSelectedType(type);
    if (search) setSearchTerm(search);
    if (condition) setFilterCondition(condition as 'all' | 'new' | 'used');
  }, [hashKey]); // ✅ bonne dépendance
  
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedJobCategory) params.set('categorie', selectedJobCategory);
    if (selectedMachineCategory) params.set('machine', selectedMachineCategory);
    if (selectedType) params.set('type', selectedType);
    if (searchTerm) params.set('search', searchTerm);
    if (filterCondition !== 'all') params.set('etat', filterCondition);
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
      } else {
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
  
      const matchCategory =
      selectedJobCategory && selectedJobCategory !== 'Tous secteurs'
        ? machine.category?.toLowerCase().includes(selectedJobCategory.toLowerCase())
        : true;    
  
    const matchMachineCategory = selectedMachineCategory
      ? machine.type?.toLowerCase().includes(selectedMachineCategory.toLowerCase())
      : true;
  
    const matchType = selectedType
      ? machine.name?.toLowerCase().includes(selectedType.toLowerCase())
      : true;
  
    const matchCondition =
      filterCondition === 'all' ? true : machine.condition === filterCondition;
  
    const matchSearch = searchTerm
      ? machine.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  
    const matchPrice =
      (!priceMin || machine.price >= parseFloat(priceMin)) &&
      (!priceMax || machine.price <= parseFloat(priceMax));
  
    const noFilters =
      !selectedJobCategory &&
      !selectedMachineCategory &&
      !selectedType &&
      !selectedBrand &&
      !searchTerm &&
      filterCondition === 'all';
  
    return (
      noFilters || (
        matchCategory &&
        matchMachineCategory &&
        matchType &&
        matchCondition &&
        matchSearch &&
        matchPrice &&
        matchBrand
      )
    );
  });
  
  
    const sortedMachines = [...filteredMachines]; // par exemple

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-primary-600">Accueil</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900">Machines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Filtres */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Filtres</h3>
              <div className="space-y-3">
                <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Secteur</label>
                  <select
                    value={selectedJobCategory}
                    onChange={(e) => setSelectedJobCategory(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="Tous secteurs">Tous les secteurs</option>
                    {jobCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>

                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Machines</label>
                  <select
  value={selectedMachineCategory}
  onChange={(e) => setSelectedMachineCategory(e.target.value)}
  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
>
  <option value="">Toutes les machines</option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.name}>{cat.name}</option>
  ))}
</select>


                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
>
  <option value="">Tous les types</option>
  <option value="Tous secteurs">Tous les secteurs</option>
  {categories
    .find(cat => cat.name === selectedMachineCategory)
    ?.subcategories?.map(sub => (
      <option key={sub.id} value={sub.name}>{sub.name}</option>
    ))}
</select>


                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Marque
                  </label>
                  <select
  value={selectedBrand}
  onChange={(e) => setSelectedBrand(e.target.value)}
  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
>
  <option value="">Toutes les marques</option>
  <option value="Caterpillar">Caterpillar</option>
  <option value="Volvo">Volvo</option>
  <option value="Komatsu">Komatsu</option>
  <option value="Liebherr">Liebherr</option>
  <option value="JCB">JCB</option>
</select>

                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Année
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      placeholder="Min"
                      className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
  <label className="block text-xs font-medium text-gray-700 mb-1">Prix (€)</label>
  <div className="grid grid-cols-2 gap-1">
    <input
      type="number"
      placeholder="Min"
      value={priceMin}
      onChange={(e) => setPriceMin(e.target.value)}
      className="px-2 py-1 text-sm border border-gray-300 rounded-md"
    />
    <input
      type="number"
      placeholder="Max"
      value={priceMax}
      onChange={(e) => setPriceMax(e.target.value)}
      className="px-2 py-1 text-sm border border-gray-300 rounded-md"
    />
  </div>
</div>

              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Toutes les machines</h1>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 sm:items-center">
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price' | 'date' | 'name')}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="date">Plus récent</option>
                    <option value="price">Prix croissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>

              {/* Grille des machines */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <p className="text-center col-span-full text-gray-500">Chargement...</p>
                ) : filteredMachines.length === 0 ? (
                  <p className="text-center col-span-full text-gray-500">Aucune machine trouvée.</p>
                ) : (
                  filteredMachines.map((machine: Machine) => (
                    <MachineCard key={machine.id} machine={machine} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
