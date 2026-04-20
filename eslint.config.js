// Flat config ESLint 9 — minimale, non bloquante.
//
// Objectif : documenter les règles d'hygiène sans faire rougir tout le dépôt.
// Les règles sensibles (no-console, no-explicit-any) sont en "warn" le temps
// de la migration. Elles passeront en "error" une fois le ménage fait :
//   - remplacer les console.* par le logger centralisé (src/utils/logger.ts)
//   - remplacer les `any` par des types Supabase générés
//
// Exclusions :
//   - `dist/`, `build/`, `node_modules/` : artefacts
//   - `supabase/functions/` : Deno runtime, règles différentes
//   - Scripts Node.js à la racine (`*.cjs`, `setup-*.js`, `execute-*.js`,
//     `fix-*.js`, `test-*.js`) : outils d'admin, pas du code produit

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'supabase/functions/**',
      'coverage/**',
      '*.cjs',
      'setup-*.js',
      'execute-*.js',
      'fix-*.js',
      'test-*.js',
      'deploy-*.js',
      'migrate-*.js',
      'migrations/**',
      'docs/**',
      'services/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      'no-console': ['warn', { allow: ['error'] }],

      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
