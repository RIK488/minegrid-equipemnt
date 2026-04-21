import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationService } from '../services/notificationService';
import { toast } from './toast';

/**
 * Tests du helper toast. Valident :
 *  - inference automatique du type (success par defaut, error si
 *    mot-cle d'erreur dans le message)
 *  - API `.success`, `.error`, `.warning`, `.info` route vers le bon
 *    niveau
 *  - le message et le titre par defaut sont corrects
 */

describe('toast', () => {
  let successSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warningSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    successSpy = vi.spyOn(notificationService, 'success').mockImplementation(() => {});
    errorSpy = vi.spyOn(notificationService, 'error').mockImplementation(() => {});
    warningSpy = vi.spyOn(notificationService, 'warning').mockImplementation(() => {});
    infoSpy = vi.spyOn(notificationService, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toast(msg) sans mot-cle => succes', () => {
    toast('Machine publiee');
    expect(successSpy).toHaveBeenCalledWith('Succes', 'Machine publiee');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("toast(msg) avec 'erreur' => error", () => {
    toast("Une erreur est survenue");
    expect(errorSpy).toHaveBeenCalledWith('Erreur', 'Une erreur est survenue');
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("toast(msg) avec 'impossible' => error", () => {
    toast("Impossible de contacter le serveur");
    expect(errorSpy).toHaveBeenCalled();
  });

  it('toast(msg, "warning") force le type', () => {
    toast('La session va expirer', 'warning');
    expect(warningSpy).toHaveBeenCalledWith('Attention', 'La session va expirer');
  });

  it('toast.success(msg) appelle notificationService.success', () => {
    toast.success('Paiement recu');
    expect(successSpy).toHaveBeenCalledWith('Succes', 'Paiement recu');
  });

  it('toast.error(msg, title) prend le titre custom', () => {
    toast.error('Carte refusee', 'Erreur de paiement');
    expect(errorSpy).toHaveBeenCalledWith('Erreur de paiement', 'Carte refusee');
  });

  it('toast.info(msg) appelle notificationService.info', () => {
    toast.info('3 nouveaux messages');
    expect(infoSpy).toHaveBeenCalledWith('Information', '3 nouveaux messages');
  });
});
