import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Configuration Vitest separee de vite.config.ts pour ne pas polluer
 * la build de prod. jsdom permet de tester les composants React et
 * les stores zustand qui touchent a localStorage.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/test/',
        'src/**/*.d.ts',
        'scripts/',
      ],
    },
  },
});
