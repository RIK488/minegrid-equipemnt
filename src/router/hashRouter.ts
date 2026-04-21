import { useEffect, useMemo, useSyncExternalStore } from 'react';

/**
 * Mini-router hash-based.
 *
 * Objectif : donner une API type react-router (useRouteParams, useNavigate,
 * <Link>) SANS casser le switch deja en place dans App.tsx et sans deployer
 * la lib complete. On continue d'utiliser `window.location.hash` comme source
 * de verite, mais on centralise la logique de parsing et de navigation.
 *
 * Cette couche est un tremplin : on peut migrer vers react-router DOM plus
 * tard sans toucher les pages qui utilisent deja useNavigate / <Link>.
 */

export interface RouteParams {
  /** Hash brut, ex: "#dashboard/stats?tab=overview" */
  raw: string;
  /** Partie gauche du '?', sans le '#'. Ex: "dashboard/stats" */
  path: string;
  /** Segments du path. Ex: ["dashboard", "stats"] */
  segments: string[];
  /** Premier segment, equivalent au `pathParts[0]` de l'ancien switch */
  page: string;
  /** Query string parsee. Ex: tab=overview */
  searchParams: URLSearchParams;
}

function parseHash(hash: string): RouteParams {
  const raw = hash || '#';
  const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw;
  const [path, query] = withoutHash.split('?');
  const segments = path ? path.split('/').filter(Boolean) : [];
  return {
    raw,
    path,
    segments,
    page: segments[0] ?? '',
    searchParams: new URLSearchParams(query ?? ''),
  };
}

// --- subscription store (useSyncExternalStore) ---

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

function getSnapshot(): string {
  return window.location.hash || '#';
}

function getServerSnapshot(): string {
  return '#';
}

/**
 * Hook principal : retourne les parametres de route parses.
 * Se re-rend automatiquement a chaque `hashchange`.
 */
export function useRouteParams(): RouteParams {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseHash(hash), [hash]);
}

// --- navigation imperative ---

export interface NavigateOptions {
  /** Remplacer l'entree dans l'historique plutot que push. Default false. */
  replace?: boolean;
  /** Query string a ajouter (object ou URLSearchParams) */
  search?: Record<string, string | number | undefined> | URLSearchParams;
}

function buildHash(to: string, options?: NavigateOptions): string {
  const cleanTo = to.startsWith('#') ? to.slice(1) : to;
  if (!options?.search) return `#${cleanTo}`;

  const params =
    options.search instanceof URLSearchParams
      ? options.search
      : new URLSearchParams(
          Object.entries(options.search)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]),
        );
  const query = params.toString();
  return query ? `#${cleanTo}?${query}` : `#${cleanTo}`;
}

/** Navigate imperatif. Emet un `hashchange` pour re-render les hooks. */
export function navigate(to: string, options?: NavigateOptions): void {
  const nextHash = buildHash(to, options);
  if (window.location.hash === nextHash) return;

  if (options?.replace) {
    const url = new URL(window.location.href);
    url.hash = nextHash;
    window.history.replaceState(null, '', url.toString());
    // replaceState n'emet pas hashchange -> on le declenche manuellement
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = nextHash;
  }
}

/** Hook equivalent a useNavigate() de react-router. */
export function useNavigate() {
  return navigate;
}

// --- route-guard: scroll top au changement de page ---

/**
 * Hook optionnel : scroll en haut quand le `page` (premier segment) change.
 * A utiliser une fois dans `AppContent`.
 */
export function useScrollToTopOnRouteChange() {
  const { page } = useRouteParams();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);
}
