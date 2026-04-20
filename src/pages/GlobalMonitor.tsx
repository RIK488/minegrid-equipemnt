import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Globe, RefreshCw, Wifi, WifiOff, Bell, Activity, Settings2 } from 'lucide-react';
import ProjectMap from '../components/global-monitor/ProjectMap';
import ProjectList from '../components/global-monitor/ProjectList';
import ProjectDetails from '../components/global-monitor/ProjectDetails';
import ProjectFiltersPanel from '../components/global-monitor/ProjectFilters';
import AlertsPanel from '../components/global-monitor/AlertsPanel';
import type { LayerKey } from '../components/global-monitor/LayersToggle';
import type { MonitorProject, MonitorProjectDetail, ProjectFilters } from '../types/monitor';
import { fetchProjects, fetchProjectDetail } from '../services/monitorApi';
import {
  normalizeBudget as normalizeBudgetUtil,
  ensureCountryCoverage as ensureCountryCoverageUtil,
  ensureLayerCoverageByCountry as ensureLayerCoverageByCountryUtil,
  enrichForDisplay as enrichForDisplayUtil,
} from '../utils/globalMonitorCoverage';

const DEMO_PROJECTS: MonitorProject[] = [
  { id: '1', title: "Mine d'or de Kédougou", type: 'mine', phase: 'construction', country: 'Senegal', region: 'Kédougou', lat: 12.56, lon: -12.18, budget_usd: 350_000_000, start_date: '2025-06-01', end_date: null, source: 'Demo', source_url: '', fingerprint: 'd1', confidence: 0.8, updated_at: '2026-03-01' },
  { id: '2', title: 'Autoroute Dakar-Saint-Louis', type: 'road', phase: 'tender', country: 'Senegal', region: 'Saint-Louis', lat: 15.95, lon: -16.27, budget_usd: 820_000_000, start_date: '2026-01-15', end_date: null, source: 'Demo', source_url: '', fingerprint: 'd2', confidence: 0.7, updated_at: '2026-03-02' },
];

export default function GlobalMonitor() {
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [projects, setProjects] = useState<MonitorProject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MonitorProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rightPanel, setRightPanel] = useState<'details' | 'alerts'>('details');
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set(['mine', 'infrastructure', 'energy', 'btp', 'tender']));

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const requestSeqRef = useRef(0);
  const hadLiveSuccessRef = useRef(false);

  const loadProjects = useCallback(async () => {
    const reqId = ++requestSeqRef.current;
    setLoading(true);
    try {
      const pageSize = 100;
      const first = await fetchProjects(filtersRef.current, 1, pageSize);
      let allItems = [...(first.items || [])];
      const totalFromApi = first.total ?? allItems.length;
      const totalPages = Math.max(1, Math.ceil(totalFromApi / pageSize));

      for (let p = 2; p <= totalPages; p += 1) {
        if (reqId !== requestSeqRef.current) return;
        try {
          const next = await fetchProjects(filtersRef.current, p, pageSize);
          allItems = allItems.concat(next.items || []);
        } catch {
          // keep partial live data
        }
      }

      if (reqId !== requestSeqRef.current) return;
      const normalized = allItems.map(normalizeBudgetUtil);
      const covered = ensureLayerCoverageByCountryUtil(
        ensureCountryCoverageUtil(normalized, filtersRef.current),
        filtersRef.current,
      );
      const display = enrichForDisplayUtil(covered, DEMO_PROJECTS, filtersRef.current);
      setProjects(display);
      setTotal(Math.max(totalFromApi, display.length));
      setPage(1);
      setHasMore(false);
      setIsLive(true);
      hadLiveSuccessRef.current = true;
    } catch {
      if (!hadLiveSuccessRef.current) {
        setProjects(DEMO_PROJECTS.map(normalizeBudgetUtil));
        setTotal(DEMO_PROJECTS.length);
        setIsLive(false);
      }
    } finally {
      if (reqId !== requestSeqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [filters, loadProjects]);
  useEffect(() => {
    const id = window.setInterval(() => loadProjects(), 45000);
    return () => window.clearInterval(id);
  }, [loadProjects]);

  useEffect(() => {
    if (!selectedId) { setSelectedDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    fetchProjectDetail(selectedId)
      .then((d) => { if (!cancelled) setSelectedDetail(d); })
      .catch(() => {
        if (cancelled) return;
        const base = projects.find((p) => p.id === selectedId);
        setSelectedDetail(base ? { ...base, documents: [], entities: [], equipment_needs: [] } : null);
      })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, projects]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProjects();
  }, [loadProjects]);

  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget_usd || 0), 0);
    return { count: total, totalBudget };
  }, [projects, total]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Minegrid Global Monitor</h1>
              <p className="text-xs text-gray-500">{stats.count} projets · Budget total ${Math.round(stats.totalBudget / 1e6)}M</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${isLive ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              {isLive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isLive ? 'Live' : 'Démo'}
            </span>
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <a href="#admin-sources" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500" title="Catalogue de sources">
              <Settings2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-4">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[550px]">
          <div className="col-span-12 md:col-span-3 flex flex-col gap-4 overflow-hidden">
            <ProjectFiltersPanel filters={filters} onChange={setFilters} />
            <div className="flex-1 overflow-hidden">
              <ProjectList projects={projects} selectedId={selectedId} onSelect={setSelectedId} loading={loading} hasMore={hasMore} onLoadMore={() => setPage(page + 1)} total={total} />
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 overflow-hidden">
            <ProjectMap projects={projects} selectedId={selectedId} onSelect={setSelectedId} activeLayers={activeLayers} onToggleLayer={(layer) => {
              const next = new Set(activeLayers);
              next.has(layer) ? next.delete(layer) : next.add(layer);
              setActiveLayers(next);
            }} />
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col gap-2 overflow-hidden">
            <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
              <button onClick={() => setRightPanel('details')} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md ${rightPanel === 'details' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}>
                <Activity className="h-3 w-3" /> Détails
              </button>
              <button onClick={() => setRightPanel('alerts')} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md ${rightPanel === 'alerts' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}>
                <Bell className="h-3 w-3" /> Alertes
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {rightPanel === 'details'
                ? <ProjectDetails project={selectedDetail} loading={detailLoading} />
                : <AlertsPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
