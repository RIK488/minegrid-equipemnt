import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShellState } from './useShellState';
import type { ShellWidgetsSource } from './shellTypes';

const fakeSource: ShellWidgetsSource = {
  widgets: [
    { id: 'w1', title: 'Widget 1' },
    { id: 'w2', title: 'Widget 2' },
    { id: 'w3', title: 'Widget 3' },
  ],
};

const validIds = ['w1', 'w2', 'w3'];
const KEY = 'enterpriseDashboardConfig_test-role';
const BACKUP_KEY = 'enterpriseDashboardConfig_test-role_backup';

describe('useShellState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialise avec une config vide quand rien en localStorage', () => {
    const { result } = renderHook(() =>
      useShellState({ role: 'test-role', widgetsSource: fakeSource, validIds }),
    );
    expect(result.current.config).not.toBeNull();
    expect(result.current.config?.widgets).toEqual([]);
    expect(result.current.layout.lg).toEqual([]);
  });

  it('purge les widgets qui ne sont plus dans validIds', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        widgets: [{ id: 'w1' }, { id: 'obsolete' }],
        layout: {
          lg: [
            { i: 'w1', x: 0, y: 0, w: 4, h: 2 },
            { i: 'obsolete', x: 0, y: 0, w: 4, h: 2 },
          ],
        },
        widgetSizes: {},
      }),
    );

    const { result } = renderHook(() =>
      useShellState({ role: 'test-role', widgetsSource: fakeSource, validIds }),
    );

    expect(result.current.config?.widgets.map((w) => w.id)).toEqual(['w1']);
    expect(result.current.layout.lg.map((l) => l.i)).toEqual(['w1']);
  });

  it('addWidget ajoute le widget et persiste', () => {
    const { result } = renderHook(() =>
      useShellState({ role: 'test-role', widgetsSource: fakeSource, validIds }),
    );

    act(() => result.current.addWidget('w1'));

    expect(result.current.config?.widgets.map((w) => w.id)).toContain('w1');
    const persisted = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    expect(persisted.widgets.map((w: { id: string }) => w.id)).toContain('w1');
  });

  it('removeWidget retire le widget et sauvegarde sa position en backup', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        widgets: [{ id: 'w1' }],
        layout: { lg: [{ i: 'w1', x: 2, y: 3, w: 6, h: 4 }] },
        widgetSizes: {},
      }),
    );

    const { result } = renderHook(() =>
      useShellState({ role: 'test-role', widgetsSource: fakeSource, validIds }),
    );

    act(() => result.current.removeWidget('w1'));

    expect(result.current.config?.widgets).toEqual([]);
    const backup = JSON.parse(localStorage.getItem(BACKUP_KEY) ?? '{}');
    expect(backup.layout.lg[0]).toMatchObject({ i: 'w1', x: 2, y: 3, w: 6, h: 4 });
  });

  it('restoreAllWidgets re-ajoute les widgets manquants', () => {
    const { result } = renderHook(() =>
      useShellState({ role: 'test-role', widgetsSource: fakeSource, validIds }),
    );

    act(() => result.current.restoreAllWidgets());

    expect(result.current.config?.widgets.map((w) => w.id).sort()).toEqual(['w1', 'w2', 'w3']);
  });

  it('saveDashboard met le status en saving', () => {
    const { result } = renderHook(() =>
      useShellState({ role: 'test-role', widgetsSource: fakeSource, validIds }),
    );

    act(() => result.current.saveDashboard());
    expect(result.current.saveStatus).toBe('saving');
  });

  it('cle localStorage isolee par role (pas de collision entre metiers)', () => {
    const { result: r1 } = renderHook(() =>
      useShellState({ role: 'mecanicien', widgetsSource: fakeSource, validIds }),
    );
    const { result: r2 } = renderHook(() =>
      useShellState({ role: 'loueur', widgetsSource: fakeSource, validIds }),
    );

    act(() => r1.current.addWidget('w1'));
    act(() => r2.current.addWidget('w2'));

    expect(r1.current.config?.widgets.map((w) => w.id)).toEqual(['w1']);
    expect(r2.current.config?.widgets.map((w) => w.id)).toEqual(['w2']);
  });
});
