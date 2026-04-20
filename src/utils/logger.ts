/**
 * Logger centralisé pour l'application.
 *
 * Objectifs :
 *   1. Ne RIEN logger en production (bundle plus léger + pas de bruit console
 *      côté utilisateur final + pas de fuite de données sensibles).
 *   2. Conserver une expérience riche en développement (niveau, préfixe, couleur).
 *   3. Préparer un branchement futur vers Sentry/LogRocket sans toucher aux
 *      centaines d'appels disséminés dans le code.
 *
 * Usage :
 *   import { logger } from '@/utils/logger';
 *   logger.info('Machines chargées', { count: data.length });
 *   logger.warn('Fallback select(*) utilisé', { table: 'machines' });
 *   logger.error('Supabase a renvoyé une erreur', err);
 *
 * Migration depuis console.* :
 *   console.log(...)   → logger.info(...)
 *   console.warn(...)  → logger.warn(...)
 *   console.error(...) → logger.error(...)
 *   console.debug(...) → logger.debug(...)
 *
 * Règle :
 *   - `logger.error` passe toujours par `console.error` en production aussi,
 *     parce qu'on veut que Sentry/le navigateur capturent les erreurs réelles.
 *     Le reste est silencieux en prod.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as { env?: { PROD?: boolean; DEV?: boolean } }).env?.PROD === true;

const shouldLog = (level: LogLevel): boolean => {
  if (level === 'error') return true;
  return !isProd;
};

const emit = (
  level: LogLevel,
  args: unknown[],
): void => {
  if (!shouldLog(level)) return;

  const fn =
    level === 'error' ? console.error :
    level === 'warn'  ? console.warn  :
    level === 'debug' ? (console.debug ?? console.log) :
    console.log;

  fn(...args);
};

export const logger = {
  debug: (...args: unknown[]) => emit('debug', args),
  info:  (...args: unknown[]) => emit('info',  args),
  warn:  (...args: unknown[]) => emit('warn',  args),
  error: (...args: unknown[]) => emit('error', args),
};

export default logger;
