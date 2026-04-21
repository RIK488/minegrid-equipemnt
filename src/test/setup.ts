import '@testing-library/jest-dom';

/**
 * Mock minimal de localStorage pour les tests de stores zustand qui
 * utilisent le middleware `persist`. jsdom fournit deja un
 * localStorage, mais on nettoie entre chaque test pour eviter les
 * fuites d'etat.
 */
import { afterEach } from 'vitest';

afterEach(() => {
  localStorage.clear();
});
