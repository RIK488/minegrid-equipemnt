import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabaseCall } from './supabaseCall';
import { notificationService } from '../services/notificationService';

/**
 * Tests du helper supabaseCall.
 * On mocke notificationService pour verifier les toasts, et on passe des
 * thunks qui retournent directement { data, error } au format Supabase.
 */

describe('supabaseCall', () => {
  beforeEach(() => {
    vi.spyOn(notificationService, 'error').mockImplementation(() => {});
    vi.spyOn(notificationService, 'success').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retourne data quand tout va bien', async () => {
    const result = await supabaseCall(
      () => Promise.resolve({ data: [{ id: 1 }], error: null }),
      { label: 'ok' },
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it('retourne le fallback quand error non-nulle', async () => {
    const result = await supabaseCall(
      () => Promise.resolve({ data: null, error: { message: 'boom' } }),
      { label: 'fail', fallback: [] },
    );
    expect(result).toEqual([]);
  });

  it('throw quand error non-nulle et pas de fallback', async () => {
    await expect(
      supabaseCall(
        () => Promise.resolve({ data: null, error: { message: 'boom' } }),
        { label: 'fail' },
      ),
    ).rejects.toThrow('boom');
  });

  it('affiche un toast si toastOnError=true et echec', async () => {
    await supabaseCall(
      () => Promise.resolve({ data: null, error: { message: 'pas acces' } }),
      { label: 'read', fallback: [], toastOnError: true },
    );
    expect(notificationService.error).toHaveBeenCalledOnce();
  });

  it("n'affiche pas de toast si toastOnError=false (default)", async () => {
    await supabaseCall(
      () => Promise.resolve({ data: null, error: { message: 'x' } }),
      { label: 'silent', fallback: [] },
    );
    expect(notificationService.error).not.toHaveBeenCalled();
  });

  it('utilise toastMessage custom si fourni', async () => {
    await supabaseCall(
      () => Promise.resolve({ data: null, error: { message: 'technical detail' } }),
      {
        label: 'pay',
        fallback: null,
        toastOnError: true,
        toastMessage: 'Impossible de traiter le paiement',
      },
    );
    expect(notificationService.error).toHaveBeenCalledOnce();
    const call = (notificationService.error as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).toBe('Impossible de traiter le paiement');
  });

  it('gere les exceptions reseau (reject) avec fallback', async () => {
    const result = await supabaseCall(
      () => Promise.reject(new Error('network down')),
      { label: 'net', fallback: [] },
    );
    expect(result).toEqual([]);
  });

  it('gere les exceptions reseau (reject) sans fallback : rethrow', async () => {
    await expect(
      supabaseCall(() => Promise.reject(new Error('network down')), { label: 'net' }),
    ).rejects.toThrow('network down');
  });

  it('retourne fallback si data=null et error=null (cas rare)', async () => {
    const result = await supabaseCall(
      () => Promise.resolve({ data: null, error: null }),
      { label: 'empty', fallback: [] },
    );
    expect(result).toEqual([]);
  });
});
