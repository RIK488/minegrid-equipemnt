import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencyStore } from './currencyStore';

/**
 * Tests du store de devise. Points importants :
 *  - valeur par defaut EUR
 *  - setCurrency(...) marque le choix comme explicite (utilisateur dropdown)
 *  - setAutoCurrency(...) applique TOUJOURS la devise detectee par IP
 *    (source de verite cross-session). Le choix manuel de l'utilisateur
 *    ne survit que le temps de la session courante : au reload suivant,
 *    la detection IP reprend la main pour refleter le pays reel.
 */

// Reset complet du store entre chaque test (persist + zustand).
beforeEach(() => {
  localStorage.clear();
  useCurrencyStore.setState({
    currentCurrency: 'EUR',
    hasUserSelectedCurrency: false,
  });
});

describe('currencyStore', () => {
  it('valeur par defaut = EUR, pas de choix utilisateur', () => {
    const s = useCurrencyStore.getState();
    expect(s.currentCurrency).toBe('EUR');
    expect(s.hasUserSelectedCurrency).toBe(false);
  });

  it('setCurrency() change la devise et marque le choix comme explicite', () => {
    useCurrencyStore.getState().setCurrency('MAD');
    const s = useCurrencyStore.getState();
    expect(s.currentCurrency).toBe('MAD');
    expect(s.hasUserSelectedCurrency).toBe(true);
  });

  it('setAutoCurrency() applique la devise detectee', () => {
    useCurrencyStore.getState().setAutoCurrency('USD');
    const s = useCurrencyStore.getState();
    expect(s.currentCurrency).toBe('USD');
    expect(s.hasUserSelectedCurrency).toBe(false);
  });

  it("setAutoCurrency() ecrase un choix manuel precedent (IP = verite au reload)", () => {
    useCurrencyStore.getState().setCurrency('MAD');
    expect(useCurrencyStore.getState().hasUserSelectedCurrency).toBe(true);
    useCurrencyStore.getState().setAutoCurrency('USD');
    const s = useCurrencyStore.getState();
    expect(s.currentCurrency).toBe('USD');
    expect(s.hasUserSelectedCurrency).toBe(false);
  });

  it('setRates() met a jour la table de change', () => {
    useCurrencyStore.getState().setRates({
      EUR: 1,
      USD: 1.2,
      MAD: 11,
      XOF: 656,
      XAF: 656,
      NGN: 1600,
      ZAR: 20,
      EGP: 34,
      KES: 160,
      GHS: 14,
    });
    expect(useCurrencyStore.getState().rates.USD).toBe(1.2);
  });
});
