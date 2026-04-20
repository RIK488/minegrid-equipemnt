import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Database, Plus, Trash2, Play, ToggleLeft, ToggleRight, RefreshCw,
  AlertCircle, CheckCircle, Loader2, Settings2, ExternalLink,
  ChevronDown, ChevronUp, Clock, ArrowLeft, Truck, Search,
} from 'lucide-react';
import type { DataSource } from '../types/monitor';
import { CONNECTOR_LABELS } from '../types/monitor';
import {
  fetchSources,
  createSource as apiCreateSource,
  updateSource as apiUpdateSource,
  deleteSource as apiDeleteSource,
  runSource as apiRunSource,
  runAllSources as apiRunAllSources,
  runMascusImport,
  getMascusStatus,
  runLeboncoinImport,
  getLeboncoinStatus,
} from '../services/monitorApi';
import type { MascusRunParams, MascusRunResult } from '../services/monitorApi';

/* ------------------------------------------------------------------ */
/*  Fallback demo data (when backend is unreachable)                  */
/* ------------------------------------------------------------------ */

const DEMO_SOURCES: DataSource[] = [
  {
    id: 's1', name: 'World Bank — Data360', connector_type: 'wb_data360',
    url: 'https://data360.worldbank.org/api', enabled: true,
    config: { region: 'SSA' }, last_run_at: '2026-03-12T18:30:00Z',
    stats: { inserted: 42, updated: 8, skipped: 120, errors: 0 }, created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 's2', name: 'PPI — Infrastructure', connector_type: 'ppi',
    url: null, enabled: true,
    config: { file_path: '/data/ppi_latest.csv', delimiter: ',' }, last_run_at: '2026-03-10T06:00:00Z',
    stats: { inserted: 15, updated: 3, skipped: 62, errors: 1, last_details: ['Row 44: missing country'] },
    created_at: '2026-02-18T14:00:00Z',
  },
  {
    id: 's3', name: 'OCDS — Ghana EPA', connector_type: 'ocds_feed',
    url: 'https://standard.open-contracting.org/...', enabled: false,
    config: {}, last_run_at: null, stats: {}, created_at: '2026-03-01T10:00:00Z',
  },
];

const CONNECTOR_TYPES = Object.keys(CONNECTOR_LABELS);

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statBadge(stats: Record<string, unknown>) {
  const ins = (stats.inserted as number) || 0;
  const upd = (stats.updated as number) || 0;
  const err = (stats.errors as number) || 0;
  if (ins === 0 && upd === 0 && err === 0) return null;
  return { ins, upd, err };
}

/* ------------------------------------------------------------------ */
/*  CreateSourceForm                                                  */
/* ------------------------------------------------------------------ */

function CreateSourceForm({ onClose, onCreated }: { onClose: () => void; onCreated: (s: DataSource) => void }) {
  const [name, setName] = useState('');
  const [connector, setConnector] = useState(CONNECTOR_TYPES[0]);
  const [url, setUrl] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nom requis'); return; }
    let cfg: Record<string, unknown> = {};
    try { cfg = JSON.parse(configJson); } catch { setError('JSON config invalide'); return; }

    setSubmitting(true);
    try {
      const created = await apiCreateSource({
        name: name.trim(),
        connector_type: connector,
        url: url.trim() || undefined,
        enabled: true,
        config: cfg,
      });
      onCreated(created);
      onClose();
    } catch {
      const fallback: DataSource = {
        id: 'new-' + Date.now(), name: name.trim(), connector_type: connector,
        url: url.trim() || null, enabled: true, config: cfg,
        last_run_at: null, stats: {}, created_at: new Date().toISOString(),
      };
      onCreated(fallback);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-orange-900 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouvelle source
        </h3>
        <button onClick={onClose} className="text-orange-600 hover:text-orange-700 text-xs">Annuler</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
          <input
            value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="World Bank — SSA"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Connecteur</label>
          <select
            value={connector} onChange={(e) => setConnector(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {CONNECTOR_TYPES.map((c) => (
              <option key={c} value={c}>{CONNECTOR_LABELS[c] || c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">URL (optionnel)</label>
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Config (JSON)</label>
          <textarea
            value={configJson} onChange={(e) => { setConfigJson(e.target.value); setError(''); }}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={3}
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Créer
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SourceCard                                                        */
/* ------------------------------------------------------------------ */

function SourceCard({
  source, onToggle, onDelete, onRun, running,
}: {
  source: DataSource; onToggle: () => void; onDelete: () => void; onRun: () => void; running: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const stats = statBadge(source.stats);
  const details = (source.stats.last_details as string[]) || [];

  return (
    <div className={`bg-white rounded-xl border transition-all ${source.enabled ? 'border-gray-200' : 'border-gray-200/60 opacity-70'}`}>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${source.enabled ? 'bg-orange-100' : 'bg-gray-100'}`}>
          <Database className={`h-4 w-4 ${source.enabled ? 'text-orange-600' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{source.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${source.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {source.enabled ? 'Actif' : 'Désactivé'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {CONNECTOR_LABELS[source.connector_type] || source.connector_type}
          </p>
          {source.url && (
            <a href={source.url} target="_blank" rel="noopener noreferrer"
               className="text-[11px] text-orange-600 hover:underline flex items-center gap-1 mt-0.5 truncate">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{source.url}</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onRun} disabled={running || !source.enabled}
            title="Lancer l'ingestion"
            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={onToggle} title={source.enabled ? 'Désactiver' : 'Activer'}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            {source.enabled
              ? <ToggleRight className="h-4 w-4 text-green-600" />
              : <ToggleLeft className="h-4 w-4 text-gray-400" />
            }
          </button>
          <button onClick={onDelete} title="Supprimer"
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {source.last_run_at ? fmtDate(source.last_run_at) : 'Jamais exécuté'}
        </span>
        {stats && (
          <>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" /> +{stats.ins}
            </span>
            <span className="text-orange-600">~{stats.upd}</span>
            {stats.err > 0 && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle className="h-3 w-3" /> {stats.err}
              </span>
            )}
          </>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Config</span>
            <pre className="mt-1 text-xs bg-gray-50 rounded-lg p-2 overflow-x-auto font-mono text-gray-700">
              {JSON.stringify(source.config, null, 2)}
            </pre>
          </div>
          {details.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Derniers détails</span>
              <ul className="mt-1 space-y-0.5">
                {details.map((d, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400 shrink-0">·</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-[11px] text-gray-400">
            Créée le {fmtDate(source.created_at)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MascusPanel — dedicated Mascus import UI                          */
/* ------------------------------------------------------------------ */

const DEFAULT_QUERIES = [
  'https://www.mascus.fr/construction/pelle-chenilles',
  'https://www.mascus.fr/construction/pelle-pneus',
  'https://www.mascus.fr/construction/chargeuse-pneus',
  'https://www.mascus.fr/construction/bulldozer',
  'https://www.mascus.fr/construction/niveleuse',
];

function MascusPanel() {
  const [queries, setQueries] = useState(DEFAULT_QUERIES.join(', '));
  const [country, setCountry] = useState('');
  const [maxPages, setMaxPages] = useState(5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MascusRunResult | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ ready: boolean; piloterr_api_key_configured: boolean; supabase_configured: boolean } | null>(null);

  useEffect(() => {
    getMascusStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const handleRun = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const params: MascusRunParams = {
        search_queries: queries.split(',').map((q) => q.trim()).filter(Boolean),
        max_pages: maxPages,
      };
      if (country.trim()) params.country = country.trim();
      const r = await runMascusImport(params);
      setResult(r);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'import Mascus');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Import Mascus</h2>
          <p className="text-xs text-gray-500">Importer des annonces d'engins depuis Mascus via Piloterr</p>
        </div>
        {status && (
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${status.ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {status.ready ? 'Configuré' : 'Non configuré'}
          </span>
        )}
      </div>

      {status && !status.ready && (
        <div className="bg-amber-100/80 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          {!status.piloterr_api_key_configured && <p>• <strong>PILOTERR_API_KEY</strong> non définie dans le .env du backend</p>}
          {!status.supabase_configured && <p>• Credentials Supabase manquantes dans le .env du backend</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">URLs Mascus (ou mots-clés)</label>
          <textarea
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={2}
            placeholder="https://www.mascus.fr/construction/pelle-chenilles, excavator"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Pays (ISO, optionnel)</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="FR, DE, US…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Pages max / requête</label>
          <input
            type="number"
            min={1}
            max={20}
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Import en cours…
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Lancer l'import Mascus
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white border border-orange-200 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" /> Résultat
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{result.total_fetched}</div>
              <div className="text-gray-500">Récupérés</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-700">{result.inserted}</div>
              <div className="text-gray-500">Insérés</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-amber-700">{result.updated}</div>
              <div className="text-gray-500">Mis à jour</div>
            </div>
            {result.errors > 0 && (
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-700">{result.errors}</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            )}
          </div>
          {result.details.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Détails</span>
              <ul className="mt-1 space-y-0.5">
                {result.details.map((d, i) => (
                  <li key={i} className="text-xs text-gray-600">· {d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LeboncoinPanel — dedicated Leboncoin import UI                  */
/* ------------------------------------------------------------------ */

const DEFAULT_LEBONCOIN_QUERIES = [
  // Remplace par une URL de recherche Leboncoin (catégorie + text + éventuellement page/offset).
  // Exemple: https://www.leboncoin.fr/recherche?text=pelle&category=8
];

function LeboncoinPanel() {
  const [queries, setQueries] = useState(DEFAULT_LEBONCOIN_QUERIES.join(', '));
  const [maxPages, setMaxPages] = useState(1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MascusRunResult | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ ready: boolean; piloterr_api_key_configured: boolean; supabase_configured: boolean } | null>(null);

  useEffect(() => {
    getLeboncoinStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const handleRun = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const params: any = {
        search_queries: queries.split(',').map((q) => q.trim()).filter(Boolean),
        max_pages: maxPages,
      };
      const r = await runLeboncoinImport(params);
      setResult(r as any);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'import Leboncoin");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Import Leboncoin</h2>
          <p className="text-xs text-gray-500">Importer des annonces depuis Leboncoin via Piloterr</p>
        </div>
        {status && (
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${status.ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {status.ready ? 'Configuré' : 'Non configuré'}
          </span>
        )}
      </div>

      {status && !status.ready && (
        <div className="bg-amber-100/80 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          {!status.piloterr_api_key_configured && <p>• <strong>PILOTERR_API_KEY</strong> non définie dans le .env du backend</p>}
          {!status.supabase_configured && <p>• Credentials Supabase manquantes dans le .env du backend</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">URLs de recherche Leboncoin</label>
          <textarea
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={2}
            placeholder="https://www.leboncoin.fr/recherche?text=pelle, https://www.leboncoin.fr/recherche?text=chargeuse"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Pages max / requête</label>
          <input
            type="number"
            min={1}
            max={20}
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Import en cours…
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Lancer l'import Leboncoin
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white border border-orange-200 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" /> Résultat
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{result.total_fetched}</div>
              <div className="text-gray-500">Récupérés</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-700">{result.inserted}</div>
              <div className="text-gray-500">Insérés</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-amber-700">{result.updated}</div>
              <div className="text-gray-500">Mis à jour</div>
            </div>
            {result.errors > 0 && (
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-700">{result.errors}</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            )}
          </div>
          {result.details && result.details.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Détails</span>
              <ul className="mt-1 space-y-0.5">
                {result.details.map((d: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600">· {d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SourcesAdmin (page)                                               */
/* ------------------------------------------------------------------ */

export default function SourcesAdmin() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchSummary, setBatchSummary] = useState<{ inserted: number; updated: number; skipped: number; errors: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSources();
      setSources(data);
    } catch {
      setSources(DEMO_SOURCES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = useCallback((s: DataSource) => {
    setSources((prev) => [s, ...prev]);
  }, []);

  const handleToggle = useCallback(async (id: string) => {
    const source = sources.find((s) => s.id === id);
    if (!source) return;
    const newEnabled = !source.enabled;
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s)));
    try { await apiUpdateSource(id, { enabled: newEnabled }); } catch { /* local state already updated */ }
  }, [sources]);

  const handleDelete = useCallback(async (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    try { await apiDeleteSource(id); } catch { /* already removed */ }
  }, []);

  const handleRun = useCallback(async (id: string) => {
    setRunningId(id);
    try {
      const result = await apiRunSource(id);
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                last_run_at: new Date().toISOString(),
                stats: { inserted: result.inserted, updated: result.updated, skipped: result.skipped, errors: result.errors },
              }
            : s,
        ),
      );
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                last_run_at: new Date().toISOString(),
                stats: { error: 'Backend non joignable' },
              }
            : s,
        ),
      );
    } finally {
      setRunningId(null);
    }
  }, []);

  const handleRunAll = useCallback(async () => {
    setBatchRunning(true);
    try {
      const result = await apiRunAllSources();
      setBatchSummary({
        inserted: result.inserted || 0,
        updated: result.updated || 0,
        skipped: result.skipped || 0,
        errors: result.errors || 0,
      });
      await load();
    } catch {
      setBatchSummary({ inserted: 0, updated: 0, skipped: 0, errors: 1 });
    } finally {
      setBatchRunning(false);
    }
  }, [load]);

  const active = sources.filter((s) => s.enabled).length;
  const byConnector = useMemo(() => {
    const map = new Map<string, { count: number; inserted: number; updated: number; errors: number }>();
    sources.forEach((s) => {
      const key = s.connector_type;
      const prev = map.get(key) || { count: 0, inserted: 0, updated: 0, errors: 0 };
      map.set(key, {
        count: prev.count + 1,
        inserted: prev.inserted + Number(s.stats.inserted || 0),
        updated: prev.updated + Number(s.stats.updated || 0),
        errors: prev.errors + Number(s.stats.errors || 0),
      });
    });
    return Array.from(map.entries());
  }, [sources]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#global-monitor" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Retour">
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Catalogue de Sources</h1>
              <p className="text-xs text-gray-500">
                {sources.length} source{sources.length > 1 ? 's' : ''} · {active} active{active > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500" title="Recharger">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleRunAll}
              disabled={batchRunning || loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-orange-300 text-orange-700 bg-orange-50 text-sm font-medium hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              {batchRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Lancer tout
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <MascusPanel />
        <LeboncoinPanel />

        {batchSummary && (
          <div className="bg-white border border-orange-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Derniere execution globale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-green-700">{batchSummary.inserted}</div>
                <div className="text-gray-500">Inseres</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-orange-700">{batchSummary.updated}</div>
                <div className="text-gray-500">Mis a jour</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-700">{batchSummary.skipped}</div>
                <div className="text-gray-500">Ignores</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-700">{batchSummary.errors}</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>
          </div>
        )}

        {byConnector.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Diagnostics par connecteur</h3>
            <div className="space-y-2">
              {byConnector.map(([connector, stats]) => (
                <div key={connector} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-xs">
                  <div className="font-medium text-gray-700">{CONNECTOR_LABELS[connector] || connector}</div>
                  <div className="text-gray-500">
                    {stats.count} source(s) · +{stats.inserted} / ~{stats.updated} / err {stats.errors}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCreate && (
          <CreateSourceForm onClose={() => setShowCreate(false)} onCreated={handleCreated} />
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && sources.length === 0 ? (
          <div className="text-center py-16">
            <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune source configurée</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ajouter une source
            </button>
          </div>
        ) : (
          !loading && sources.map((s) => (
            <SourceCard
              key={s.id}
              source={s}
              onToggle={() => handleToggle(s.id)}
              onDelete={() => handleDelete(s.id)}
              onRun={() => handleRun(s.id)}
              running={runningId === s.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
