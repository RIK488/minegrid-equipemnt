import supabaseClient from '../utils/supabaseClient';
import type {
  MonitorProject,
  MonitorProjectDetail,
  ProjectListResponse,
  ProjectFilters,
  DataSource,
} from '../types/monitor';

const BASE_URL = import.meta.env.VITE_MONITOR_API_URL || 'http://localhost:8000';

// ⚠️ SECURITE : le token admin reste expose au client car prefixe VITE_*.
// A migrer vers une edge function Supabase (BFF) dans un sprint ulterieur :
// le frontend appellera l'edge function (auth Supabase user verifiee), et
// seule l'edge function detiendra le token pour relayer au backend Python.
// Pour l'instant : token envoye UNIQUEMENT aux endpoints /admin/* (via
// adminApiFetch), jamais aux endpoints publics (via apiFetch).
const ADMIN_TOKEN = import.meta.env.VITE_MONITOR_ADMIN_TOKEN || '';

async function getBearerHeader(): Promise<Record<string, string>> {
  const { data } = await supabaseClient.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ApiFetchInit = RequestInit & { timeoutMs?: number };

async function fetchWithTimeout(
  path: string,
  headers: Record<string, string>,
  init?: ApiFetchInit,
): Promise<Response> {
  const timeoutMs = typeof init?.timeoutMs === 'number' ? init.timeoutMs : 20_000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers || {}) },
      signal: init?.signal || controller.signal,
    });
    return res;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/** Endpoints publics : auth Bearer Supabase uniquement, pas de token admin. */
async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await getBearerHeader()),
  };
  const res = await fetchWithTimeout(path, headers, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

/** Endpoints /admin/* : auth Bearer + X-Admin-Token. Le backend exige les deux. */
async function adminApiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await getBearerHeader()),
    ...(ADMIN_TOKEN ? { 'X-Admin-Token': ADMIN_TOKEN } : {}),
  };
  const res = await fetchWithTimeout(path, headers, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function fetchProjects(
  filters: ProjectFilters,
  page = 1,
  pageSize = 20,
): Promise<ProjectListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  if (filters.country) params.set('country', filters.country);
  if (filters.type) params.set('type', filters.type);
  if (filters.phase) params.set('phase', filters.phase);
  if (filters.source_kind) params.set('source_kind', filters.source_kind);
  if (filters.search) params.set('search', filters.search);
  return apiFetch(`/projects?${params}`);
}

export async function fetchProjectDetail(id: string, withAi = true): Promise<MonitorProjectDetail> {
  const params = new URLSearchParams();
  if (withAi) params.set('ai', 'true');
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/projects/${id}${suffix}`);
}

export async function subscribeAlert(rule: Record<string, unknown>): Promise<{ id: string; rule: Record<string, unknown>; created_at: string }> {
  return apiFetch('/alerts/subscribe', {
    method: 'POST',
    body: JSON.stringify({ rule }),
  });
}

export async function fetchAlertRules(): Promise<{ id: string; rule: Record<string, unknown>; created_at: string }[]> {
  return apiFetch('/alerts/rules');
}

export async function deleteAlertRule(ruleId: string): Promise<void> {
  await apiFetch(`/alerts/rules/${ruleId}`, { method: 'DELETE' });
}

export async function fetchAlertEvents(limit = 50): Promise<{
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}[]> {
  return apiFetch(`/alerts/events?limit=${limit}`);
}

// ---------- Admin Sources (protegees par X-Admin-Token + Bearer Supabase) ----------

export async function fetchSources(): Promise<DataSource[]> {
  return adminApiFetch('/admin/sources');
}

export async function createSource(body: {
  name: string;
  connector_type: string;
  url?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}): Promise<DataSource> {
  return adminApiFetch('/admin/sources', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateSource(
  id: string,
  body: Partial<{ name: string; url: string; enabled: boolean; config: Record<string, unknown> }>,
): Promise<DataSource> {
  return adminApiFetch(`/admin/sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteSource(id: string): Promise<void> {
  await adminApiFetch(`/admin/sources/${id}`, { method: 'DELETE' });
}

export async function runSource(id: string): Promise<{ inserted: number; updated: number; skipped: number; errors: number }> {
  return adminApiFetch(`/admin/sources/${id}/run`, {
    method: 'POST',
    timeoutMs: 240_000,
  });
}

export async function runAllSources(): Promise<{
  total_sources: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  by_connector: Record<string, { inserted: number; updated: number; skipped: number; errors: number }>;
  details: Array<Record<string, unknown>>;
}> {
  return adminApiFetch('/admin/sources/run-all', {
    method: 'POST',
    timeoutMs: 300_000,
  });
}

// ---------- Mascus Import ----------

export interface MascusRunParams {
  search_queries?: string[];
  country?: string;
  max_pages?: number;
}

export interface MascusRunResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
  details: string[];
}

export async function runMascusImport(params?: MascusRunParams): Promise<MascusRunResult> {
  // Mascus -> Piloterr peut prendre du temps (plusieurs pages/requetes).
  // Le timeout par defaut (20s) peut interrompre l'import.
  return adminApiFetch('/admin/mascus/run', {
    method: 'POST',
    body: JSON.stringify(params || {}),
    timeoutMs: 300_000,
  });
}

export async function getMascusStatus(): Promise<{
  piloterr_api_key_configured: boolean;
  supabase_configured: boolean;
  ready: boolean;
}> {
  return adminApiFetch('/admin/mascus/status');
}

// ---------- Leboncoin Import ----------

export interface LeboncoinRunParams {
  search_queries?: string[];
  max_pages?: number;
}

export interface LeboncoinRunResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
  details: string[];
}

export async function runLeboncoinImport(params?: LeboncoinRunParams): Promise<LeboncoinRunResult> {
  return adminApiFetch('/admin/leboncoin/run', {
    method: 'POST',
    body: JSON.stringify(params || {}),
    timeoutMs: 300_000,
  });
}

export async function getLeboncoinStatus(): Promise<{
  piloterr_api_key_configured: boolean;
  supabase_configured: boolean;
  ready: boolean;
}> {
  return adminApiFetch('/admin/leboncoin/status');
}
