import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';
import {
  MACHINE_LIST_COLUMNS,
  MACHINES_CATALOG_INITIAL_LIMIT,
  MACHINES_CATALOG_MEMORY_CAP,
  MACHINES_CATALOG_STEP,
} from '../constants/machineQueryFields';
import MachineCard from '../components/MachineCard';
import type { Machine } from '../types';

export default function SectorMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [secteur, setSecteur] = useState('');
  const [catalogOffset, setCatalogOffset] = useState(0);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const secteurParam = params.get('secteur');
    setSecteur(secteurParam || '');

    const fetchData = async () => {
      const firstBatch = Math.min(
        MACHINES_CATALOG_INITIAL_LIMIT,
        MACHINES_CATALOG_MEMORY_CAP
      );
      const { data, error } = await supabase
        .from('machines')
        .select(MACHINE_LIST_COLUMNS)
        .order('created_at', { ascending: false })
        .range(0, firstBatch - 1);
      if (error) console.error('SectorMachines:', error);
      const rows = data || [];
      setMachines(rows as Machine[]);
      setCatalogOffset(rows.length);
      setHasMoreCatalog(
        rows.length === firstBatch && rows.length < MACHINES_CATALOG_MEMORY_CAP
      );
    };

    void fetchData();
  }, []);

  const loadMoreCatalog = async () => {
    if (!hasMoreCatalog || loadingMore) return;
    const remaining = MACHINES_CATALOG_MEMORY_CAP - catalogOffset;
    if (remaining <= 0) {
      setHasMoreCatalog(false);
      return;
    }
    setLoadingMore(true);
    try {
      const take = Math.min(MACHINES_CATALOG_STEP, remaining);
      const end = catalogOffset + take - 1;
      const { data, error } = await supabase
        .from('machines')
        .select(MACHINE_LIST_COLUMNS)
        .order('created_at', { ascending: false })
        .range(catalogOffset, end);
      if (error) {
        console.error('SectorMachines suite:', error);
        return;
      }
      const rows = data || [];
      if (rows.length === 0) {
        setHasMoreCatalog(false);
        return;
      }
      setMachines((prev) => [...prev, ...(rows as Machine[])]);
      const next = catalogOffset + rows.length;
      setCatalogOffset(next);
      setHasMoreCatalog(
        rows.length === take && next < MACHINES_CATALOG_MEMORY_CAP
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = machines.filter(
    (m) => m.category?.toLowerCase() === secteur.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Machines - {secteur}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((machine) => (
          <MachineCard key={machine.id} machine={machine} />
        ))}
      </div>
      {filtered.length === 0 && hasMoreCatalog && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Aucun résultat dans les annonces chargées — chargez plus pour parcourir le catalogue.
        </p>
      )}
      {hasMoreCatalog && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMoreCatalog()}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            {loadingMore ? 'Chargement…' : 'Charger plus d’annonces'}
          </button>
        </div>
      )}
    </div>
  );
}
