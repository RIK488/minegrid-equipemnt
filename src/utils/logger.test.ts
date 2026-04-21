import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

/**
 * Tests du logger centralise.
 *
 * Note : la branche prod (info/warn/debug = no-op) est difficile a
 * tester via `vi.stubEnv('PROD', true)` car `isProd` est capture comme
 * const au chargement du module (conception volontaire pour le tree-
 * shaking). La garantie "silence en prod" est assuree par inspection
 * manuelle de `src/utils/logger.ts` + verification du bundle produit.
 * On couvre ici le comportement en dev.
 */

describe('logger (mode dev)', () => {
  let consoleLog: ReturnType<typeof vi.spyOn>;
  let consoleWarn: ReturnType<typeof vi.spyOn>;
  let consoleError: ReturnType<typeof vi.spyOn>;
  let consoleDebug: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logger.info -> console.log', () => {
    logger.info('hello');
    expect(consoleLog).toHaveBeenCalledWith('hello');
  });

  it('logger.warn -> console.warn', () => {
    logger.warn('careful');
    expect(consoleWarn).toHaveBeenCalledWith('careful');
  });

  it('logger.debug -> console.debug', () => {
    logger.debug('detail');
    expect(consoleDebug).toHaveBeenCalledWith('detail');
  });

  it('logger.error -> console.error (toujours, y compris en prod)', () => {
    logger.error('boom');
    expect(consoleError).toHaveBeenCalledWith('boom');
  });

  it('transmet plusieurs arguments au console natif', () => {
    const meta = { count: 3 };
    logger.info('Machines chargees', meta);
    expect(consoleLog).toHaveBeenCalledWith('Machines chargees', meta);
  });

  it("accepte des objets d'erreur comme argument", () => {
    const err = new Error('supabase down');
    logger.error('API failed', err);
    expect(consoleError).toHaveBeenCalledWith('API failed', err);
  });
});
