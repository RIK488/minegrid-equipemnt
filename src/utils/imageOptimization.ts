/**
 * Helpers pour servir des images de meilleure qualité et adaptées à l'écran.
 *
 * Problèmes observés :
 *  - Les URLs issues de Mascus / Piloterr pointent parfois vers des miniatures
 *    (`thumb`, `small`, suffixes `_400x300`...) alors que l'original existe.
 *  - Les images uploadées dans le bucket Supabase `machine-image` sont servies
 *    en taille native (ex. 4 000 px) → le navigateur downscale mais certains
 *    formats (JPEG très compressé à la source) gardent les artefacts.
 *
 * Ce module propose :
 *  - `upgradeImageUrl`    : tente de remonter vers la meilleure version d'une
 *                           URL distante (Mascus / CDN) sans appel réseau.
 *  - `supabaseRenderUrl`  : si l'URL pointe vers le storage public Supabase,
 *                           la réécrit vers le endpoint d'image transformation
 *                           (`/storage/v1/render/image/...?width=...&quality=...`).
 *  - `getOptimizedImageUrl`: combinaison des deux, à utiliser côté composants.
 *  - `buildSrcSet`        : génère un `srcSet` 1x / 2x pour les écrans Retina.
 *
 * Notes :
 *  - L'image transformation Supabase nécessite un plan Pro ou supérieur. En
 *    cas d'échec (400/404), le <img onError> doit retomber sur l'URL originale
 *    (voir `handleImageErrorFallback`).
 */

const SUPABASE_STORAGE_OBJECT_MARKER = '/storage/v1/object/public/';
const SUPABASE_STORAGE_RENDER_MARKER = '/storage/v1/render/image/public/';

/**
 * Remonte une URL Mascus (hébergée sur img.mascus.com / img.mascus.fr) vers
 * la version "fullsize" haute résolution. Mascus utilise plusieurs conventions :
 *   - /thumbprofile/…            -> vignette ~160px
 *   - /thumbprofile_1200x900/…   -> medium
 *   - /mediaprofile/…            -> medium ~600px
 *   - /fullsize/…                -> original (ce qu'on veut)
 *   - /imageservice/<id>/600x450/<slug>/photo.jpg    (dimension embarquée)
 *
 * On force les conventions vers `fullsize` / dimension large quand détectable.
 */
function upgradeMascusImageUrl(url: string): string {
  if (!/img\.mascus\.(com|fr)/i.test(url)) return url;

  let out = url;

  // 1) /thumbprofile/ (sans suffixe) -> /fullsize/
  out = out.replace(/\/thumbprofile\//gi, '/fullsize/');
  // 2) /thumbprofile_XXxYY/ (avec dimensions) -> /thumbprofile_1920x1440/
  out = out.replace(/\/thumbprofile_\d+x\d+\//gi, '/thumbprofile_1920x1440/');
  // 3) /mediaprofile/ -> /fullsize/
  out = out.replace(/\/mediaprofile\//gi, '/fullsize/');
  // 4) /imageservice/<id>/<WxH>/… -> dimension forcée en 1920x1440
  out = out.replace(
    /\/imageservice\/([^/]+)\/\d+x\d+\//gi,
    '/imageservice/$1/1920x1440/'
  );
  // 5) Paramètres de taille parfois accrochés au path (…_small.jpg, …-thumb.jpg)
  out = out.replace(/(_|-)(small|thumb|thumbnail|sm|xs|icon)(\.[a-z]{3,4})(\?|$)/gi, '$3$4');

  return out;
}

/**
 * Le Bon Coin : les images sont hébergées sur img.leboncoin.fr avec un
 * paramètre `?rule=ad-<size>` qui détermine la taille servie :
 *   - ad-small / ad-thumb         -> vignette ~100-200px
 *   - ad-image / ad-listing       -> medium ~400-600px
 *   - ad-large                    -> ~1200px (le sweet spot fiable)
 *   - classified-<...>            -> anciennes annonces, même logique
 *
 * Certaines URLs n'ont aucun paramètre et servent déjà l'original : on ne
 * touche pas dans ce cas (pas de faux 404).
 */
function upgradeLeboncoinImageUrl(url: string): string {
  if (!/img\.leboncoin\.(fr|com)/i.test(url)) return url;
  let out = url;
  // Remplace n'importe quelle règle "petite" par ad-large.
  out = out.replace(/(\?|&)rule=(ad-small|ad-thumb|ad-image|ad-listing)\b/gi, '$1rule=ad-large');
  out = out.replace(/(\?|&)rule=(classified-thumb|classified-small)\b/gi, '$1rule=classified-large');
  return out;
}

/**
 * Ritchie Bros / RBAuction / IronPlanet : les images sont hébergées sur
 * CloudFront (*.cloudfront.net) avec le pattern :
 *
 *   https://<hash>.cloudfront.net/image/product/<size>/<seller>/<slug>,<id>.jpg
 *
 * Tailles connues (par ordre croissant) : small, medium, large, extralarge.
 * Le scraping stocke généralement "medium" → on remonte à "large" qui est
 * systématiquement disponible et d'excellente qualité (~1200px).
 *
 * On ne passe pas à "extralarge" car toutes les annonces ne l'exposent pas,
 * et un 404 casserait l'image. `large` est le sweet spot fiable.
 */
function upgradeRitchieBrosImageUrl(url: string): string {
  if (!/cloudfront\.net\/image\/product\//i.test(url)) return url;
  let out = url;
  // /medium/, /small/, /thumb/ -> /large/
  out = out.replace(
    /\/image\/product\/(small|medium|thumb|thumbnail)\//gi,
    '/image/product/large/'
  );
  return out;
}

/**
 * Tente de remonter vers la version haute résolution d'une URL d'image distante
 * (Mascus / Piloterr / CDN) en remplaçant les suffixes de miniature connus.
 * Aucun appel réseau : purement heuristique sur la chaîne.
 */
export function upgradeImageUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let url = rawUrl;

  // 1) Transformations spécifiques par source connue.
  url = upgradeMascusImageUrl(url);
  url = upgradeRitchieBrosImageUrl(url);
  url = upgradeLeboncoinImageUrl(url);

  // 2) Conventions génériques CDN : /thumb/ -> /large/, _thumb. -> _large.
  url = url.replace(/\/(thumb|thumbnail|small|sm|xs|icon)\//gi, '/large/');
  url = url.replace(/-(thumb|thumbnail|small|sm|xs|icon)\./gi, '-large.');
  url = url.replace(/_(thumb|thumbnail|small|sm|xs|icon)\./gi, '_large.');

  // 3) Dimensions embarquées dans le nom : `_400x300`, `-200x150` -> `_1920x1440`
  //    On ne remplace que si la dimension originale est < 1200 pour ne pas
  //    dégrader une image déjà grande.
  url = url.replace(
    /([_-])(\d{2,4})x(\d{2,4})(\.[a-z]{3,4})(\?|$)/gi,
    (match, sep, w, h, ext, end) => {
      const nw = Number(w);
      if (nw && nw >= 1200) return match; // déjà assez grande
      return `${sep}1920x1440${ext}${end}`;
    }
  );

  // 4) Paramètres de requête `w=400&h=300&q=50` -> `w=1920&q=90`
  try {
    const u = new URL(url);
    const params = u.searchParams;
    let changed = false;
    for (const key of ['w', 'width']) {
      if (params.has(key)) {
        const n = Number(params.get(key));
        if (n && n < 1200) {
          params.set(key, '1920');
          changed = true;
        }
      }
    }
    for (const key of ['h', 'height']) {
      if (params.has(key)) {
        const n = Number(params.get(key));
        if (n && n < 900) {
          params.delete(key); // laisser le ratio libre
          changed = true;
        }
      }
    }
    for (const key of ['q', 'quality']) {
      if (params.has(key)) {
        const n = Number(params.get(key));
        if (n && n < 85) {
          params.set(key, '90');
          changed = true;
        }
      }
    }
    if (changed) return u.toString();
  } catch {
    // URL invalide (ex. chemin relatif) -> on renvoie la version heuristique.
  }

  return url;
}

export interface SupabaseRenderOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Réécrit une URL Supabase Storage publique vers le endpoint d'image transformation.
 * Si l'URL n'est pas un objet Supabase public, elle est retournée telle quelle.
 */
export function supabaseRenderUrl(rawUrl: string, options: SupabaseRenderOptions = {}): string {
  if (!rawUrl) return rawUrl;
  const { width, height, quality = 80, resize = 'cover' } = options;

  // Déjà un endpoint render ? On ne fait qu'ajouter/remplacer les query params.
  const idxRender = rawUrl.indexOf(SUPABASE_STORAGE_RENDER_MARKER);
  const idxObject = rawUrl.indexOf(SUPABASE_STORAGE_OBJECT_MARKER);

  if (idxRender === -1 && idxObject === -1) return rawUrl;

  const base =
    idxRender !== -1
      ? rawUrl.split('?')[0]
      : rawUrl.split('?')[0].replace(SUPABASE_STORAGE_OBJECT_MARKER, SUPABASE_STORAGE_RENDER_MARKER);

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  if (quality) params.set('quality', String(Math.max(20, Math.min(100, quality))));
  if (resize) params.set('resize', resize);
  return `${base}?${params.toString()}`;
}

export interface OptimizedImageOptions extends SupabaseRenderOptions {
  /** Désactive la transformation Supabase (ex. si le plan ne la supporte pas). */
  disableSupabaseTransform?: boolean;
}

/**
 * API principale : donne la meilleure URL pour afficher une image à une taille cible.
 * - URLs externes : upgrade des miniatures (no-op si déjà HD).
 * - URLs Supabase Storage : transformation serveur (width, quality, resize).
 */
export function getOptimizedImageUrl(rawUrl: string, options: OptimizedImageOptions = {}): string {
  if (!rawUrl) return rawUrl;
  const upgraded = upgradeImageUrl(rawUrl);
  if (options.disableSupabaseTransform) return upgraded;
  return supabaseRenderUrl(upgraded, options);
}

/**
 * Construit un `srcSet` 1x / 2x pour les écrans haute densité (Retina, mobiles).
 * Renvoie une chaîne vide si l'URL n'est pas transformable (pour éviter de
 * dupliquer la même URL sans effet).
 */
export function buildSrcSet(rawUrl: string, baseWidth: number, quality = 80): string {
  if (!rawUrl) return '';
  const isSupabase =
    rawUrl.includes(SUPABASE_STORAGE_OBJECT_MARKER) || rawUrl.includes(SUPABASE_STORAGE_RENDER_MARKER);
  const isExternalWithWidthParam = /[?&](w|width)=\d+/.test(rawUrl);
  if (!isSupabase && !isExternalWithWidthParam) return '';

  const url1x = getOptimizedImageUrl(rawUrl, { width: baseWidth, quality });
  const url2x = getOptimizedImageUrl(rawUrl, { width: baseWidth * 2, quality });
  return `${url1x} 1x, ${url2x} 2x`;
}

/**
 * Handler à brancher sur `<img onError>` : si la transformation Supabase
 * renvoie 400 (plan gratuit, bucket privé...), on retombe sur l'URL brute.
 */
export function handleImageErrorFallback(
  event: React.SyntheticEvent<HTMLImageElement>,
  originalUrl: string
): void {
  const img = event.currentTarget;
  if (!img || !originalUrl) return;
  if (img.dataset.fallbackApplied === '1') return;
  if (img.src === originalUrl) return;
  img.dataset.fallbackApplied = '1';
  img.src = originalUrl;
}
