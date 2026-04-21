import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencyStore } from './currencyStore';

/**
 * Tests du store de devise. Points importants :
 *  - valeur par defaut EUR
 *  - setCurrency(...) marque le choix comme explicite
 *  - setAutoCurrency(...) n'ecrase PAS un choix explicite (regle metier :
 *    si un utilisateur a choisi MAD, on ne doit pas lui revenir a USD
 *    parce qu'il voyage a NY avec une IP americaine)
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

  it('setAutoCurrency() applique la devise si aucun choix utilisateur', () => {
    useCurrencyStore.getState().setAutoCurrency('USD');
    expect(useCurrencyStore.getState().currentCurrency).toBe('USD');
  });

  it("setAutoCurrency() n'ecrase PAS un choix utilisateur explicite", () => {
    useCurrencyStore.getState().setCurrency('MAD');
    useCurrencyStore.getState().setAutoCurrency('USD');
    expect(useCurrencyStore.getState().currentCurrency).toBe('MAD');
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
