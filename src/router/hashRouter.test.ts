import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { navigate, useRouteParams } from './hashRouter';

/**
 * Tests du mini-router. On manipule `window.location.hash` directement et
 * on verifie que le hook `useRouteParams` parse correctement et se
 * re-rend via l'event `hashchange`.
 */

function setHash(value: string) {
  act(() => {
    window.location.hash = value;
    // jsdom n'emet pas toujours hashchange sur assignment direct -> on force
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('hashRouter', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('parse un hash vide -> page vide', () => {
    const { result } = renderHook(() => useRouteParams());
    expect(result.current.page).toBe('');
    expect(result.current.segments).toEqual([]);
  });

  it('parse un path simple', () => {
    window.location.hash = '#machines';
    const { result } = renderHook(() => useRouteParams());
    expect(result.current.page).toBe('machines');
    expect(result.current.segments).toEqual(['machines']);
    expect(result.current.path).toBe('machines');
  });

  it('parse des segments multiples', () => {
    window.location.hash = '#dashboard/stats/weekly';
    const { result } = renderHook(() => useRouteParams());
    expect(result.current.segments).toEqual(['dashboard', 'stats', 'weekly']);
    expect(result.current.page).toBe('dashboard');
  });

  it('parse les query params', () => {
    window.location.hash = '#machines?categorie=pelleteuse&sort=prix';
    const { result } = renderHook(() => useRouteParams());
    expect(result.current.page).toBe('machines');
    expect(result.current.searchParams.get('categorie')).toBe('pelleteuse');
    expect(result.current.searchParams.get('sort')).toBe('prix');
  });

  it('se re-rend quand le hash change', () => {
    const { result } = renderHook(() => useRouteParams());
    expect(result.current.page).toBe('');

    setHash('#contact');
    expect(result.current.page).toBe('contact');

    setHash('#blog/mon-article');
    expect(result.current.page).toBe('blog');
    expect(result.current.segments[1]).toBe('mon-article');
  });

  describe('navigate()', () => {
    it('met a jour le hash', () => {
      navigate('contact');
      expect(window.location.hash).toBe('#contact');
    });

    it('accepte un hash avec # prefixe', () => {
      navigate('#services');
      expect(window.location.hash).toBe('#services');
    });

    it('ajoute des query params via options.search', () => {
      navigate('machines', { search: { categorie: 'excavatrice', page: 2 } });
      expect(window.location.hash).toContain('categorie=excavatrice');
      expect(window.location.hash).toContain('page=2');
    });

    it('ignore les valeurs undefined dans search', () => {
      navigate('machines', { search: { categorie: 'x', sort: undefined } });
      expect(window.location.hash).toBe('#machines?categorie=x');
    });

    it('ne fait rien si le hash est deja le bon (pas de double push)', () => {
      navigate('dashboard');
      const pushSpy = vi.spyOn(window.history, 'pushState');
      navigate('dashboard');
      expect(pushSpy).not.toHaveBeenCalled();
      pushSpy.mockRestore();
    });
  });
});
