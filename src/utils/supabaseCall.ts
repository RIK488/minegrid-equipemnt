import { logger } from './logger';
import { toast } from './toast';

/**
 * Helper unifie pour appels Supabase : gere l'erreur PostgREST de maniere
 * homogene (log + toast optionnel + fallback ou throw).
 *
 * Deux modes :
 *   - avec fallback : retourne la valeur par defaut en cas d'echec (pattern
 *     "read tolerant" : un widget qui n'affiche rien plutot que de casser).
 *   - sans fallback : throw. Laisse React Query / le composant gerer l'etat
 *     d'erreur (pattern "write strict" ou "read obligatoire").
 *
 * Exemples :
 *
 *   // Lecture tolerante (liste, le widget peut s'afficher vide)
 *   const messages = await supabaseCall(
 *     () => supabase.from('messages').select('*'),
 *     { label: 'getMessages', fallback: [] }
 *   );
 *
 *   // Ecriture / lecture obligatoire (doit throw si erreur)
 *   const profile = await supabaseCall(
 *     () => supabase.from('profiles').select('*').eq('id', userId).single(),
 *     { label: 'getProfile' }
 *   );
 */

export interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface SupabaseCallOptions<T> {
  /** Nom logique de l'operation. Utilise pour les logs et le toast. */
  label: string;
  /** Valeur par defaut a retourner en cas d'echec. Si absent, on throw. */
  fallback?: T;
  /** Afficher un toast d'erreur a l'utilisateur. Default : false. */
  toastOnError?: boolean;
  /** Message d'erreur affiche dans le toast (sinon message Postgres). */
  toastMessage?: string;
}

export async function supabaseCall<T>(
  fn: () => PromiseLike<SupabaseResponse<T>>,
  options: SupabaseCallOptions<T>,
): Promise<T> {
  const { label, fallback, toastOnError = false, toastMessage } = options;

  let response: SupabaseResponse<T>;
  try {
    response = await fn();
  } catch (thrown) {
    const msg = thrown instanceof Error ? thrown.message : String(thrown);
    logger.error(`[supabaseCall:${label}] exception`, thrown);
    if (toastOnError) toast.error(toastMessage || `Erreur lors de : ${label}`);
    if (fallback !== undefined) return fallback;
    throw thrown instanceof Error ? thrown : new Error(msg);
  }

  if (response.error) {
    logger.error(`[supabaseCall:${label}]`, response.error);
    if (toastOnError) {
      toast.error(toastMessage || response.error.message || `Erreur lors de : ${label}`);
    }
    if (fallback !== undefined) return fallback;
    const err = new Error(response.error.message || `supabaseCall:${label} failed`);
    (err as Error & { cause?: SupabaseError }).cause = response.error;
    throw err;
  }

  if (response.data === null || response.data === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`supabaseCall:${label} returned no data`);
  }

  return response.data;
}
