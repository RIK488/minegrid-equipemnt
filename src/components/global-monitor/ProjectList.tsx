import React, { useCallback, useRef, useEffect } from 'react';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';
import type { MonitorProject } from '../../types/monitor';
import { PROJECT_TYPE_LABELS, PROJECT_PHASE_LABELS, PROJECT_TYPE_COLORS } from '../../types/monitor';

interface ProjectListProps {
  projects: MonitorProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
}

function Skeleton() {
  return (
    <div className="px-4 py-3 animate-pulse space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

function formatBudget(val: number | null): string {
  if (!val) return '—';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val.toLocaleString()}`;
}

function displayColor(type: string | null, phase: string | null): string {
  if (type && PROJECT_TYPE_COLORS[type]) return PROJECT_TYPE_COLORS[type];
  return '#6b7280';
}

function sourceKind(source: string | null): 'public' | 'mdb' | 'other' {
  const s = (source || '').toLowerCase();
  if (s.startsWith('public portal')) return 'public';
  if (s.startsWith('mdb -')) return 'mdb';
  return 'other';
}

function freshness(updatedAt: string | null): string {
  if (!updatedAt) return 'date n/d';
  const diff = Date.now() - new Date(updatedAt).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'mis a jour aujourd\'hui';
  if (days === 1) return 'mis a jour hier';
  return `maj il y a ${days}j`;
}

export default function ProjectList({
  projects, selectedId, onSelect, loading, hasMore, onLoadMore, total,
}: ProjectListProps) {
  const sentinel = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore],
  );

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleObserver]);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-semibold text-gray-800">Projets</h3>
        <p className="text-xs text-gray-500 mt-0.5">{total} résultat{total > 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {loading && projects.length === 0 && (
          <>
            <Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton />
          </>
        )}

        {projects.map((p) => {
          const isSelected = p.id === selectedId;
          const color = displayColor(p.type, p.phase);
          const sk = sourceKind(p.source);
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors
                ${isSelected ? 'bg-primary-50 border-l-2 border-primary-500' : 'hover:bg-gray-50 border-l-2 border-transparent'}`}
            >
              <div className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: color }} />

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                  {p.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {p.country && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin className="h-2.5 w-2.5" /> {p.country}
                    </span>
                  )}
                  {p.type && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                      {PROJECT_TYPE_LABELS[p.type] || p.type}
                    </span>
                  )}
                  {p.phase && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      p.phase === 'tender'
                        ? 'border-2 border-violet-500 text-violet-700 bg-transparent'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {PROJECT_PHASE_LABELS[p.phase] || p.phase}
                    </span>
                  )}
                  {sk !== 'other' && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sk === 'public' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                      {sk === 'public' ? 'Public' : 'MDB'}
                    </span>
                  )}
                </div>
                {p.budget_usd && (
                  <p className="text-[11px] text-gray-500 mt-1">{formatBudget(p.budget_usd)}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-0.5">{freshness(p.updated_at)}</p>
              </div>

              <ChevronRight className="h-3.5 w-3.5 text-gray-300 mt-1.5 flex-shrink-0" />
            </button>
          );
        })}

        {hasMore && (
          <div ref={sentinel} className="flex items-center justify-center py-4">
            {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-500">Aucun projet trouvé</div>
        )}
      </div>
    </div>
  );
}
