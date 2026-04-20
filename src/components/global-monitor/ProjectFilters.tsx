import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { ProjectFilters as Filters } from '../../types/monitor';
import { PROJECT_TYPE_LABELS, PROJECT_PHASE_LABELS } from '../../types/monitor';

interface ProjectFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const COUNTRIES = [
  'France', 'Germany', 'Spain', 'Italy', 'United Kingdom', 'Portugal',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Greece', 'Poland', 'Romania',
  'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Mauritania', 'Egypt',
  'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
  'Jordan', 'Lebanon', 'Iraq',
  'Senegal', 'Ghana', 'Cameroon', 'Nigeria',
  'Côte d\'Ivoire', 'Burkina Faso', 'Guinea', 'Niger', 'Mali', 'Congo',
  'Benin', 'Togo',
];

export default function ProjectFilters({ filters, onChange }: ProjectFiltersProps) {
  const activeCount = [filters.country, filters.type, filters.phase, filters.source_kind, filters.search].filter(Boolean).length;

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clearAll = () => onChange({});

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
            <X className="h-3 w-3" /> Effacer
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Rechercher un projet..."
          className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Pays</label>
        <select
          value={filters.country || ''}
          onChange={(e) => update('country', e.target.value)}
          className="mt-1 w-full text-xs py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tous les pays</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => update('type', e.target.value)}
          className="mt-1 w-full text-xs py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tous les types</option>
          {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Phase</label>
        <select
          value={filters.phase || ''}
          onChange={(e) => update('phase', e.target.value)}
          className="mt-1 w-full text-xs py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Toutes les phases</option>
          {Object.entries(PROJECT_PHASE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Source</label>
        <select
          value={filters.source_kind || ''}
          onChange={(e) => update('source_kind', e.target.value)}
          className="mt-1 w-full text-xs py-1.5 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Toutes les sources</option>
          <option value="public">Portails publics</option>
          <option value="mdb">Banques de developpement</option>
        </select>
      </div>
    </div>
  );
}
