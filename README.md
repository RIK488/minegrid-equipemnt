# Minegrid Africa

Marketplace B2B d'equipements miniers et BTP pour l'Afrique francophone,
avec portails pro multi-roles (vendeurs, loueurs, mecaniciens,
transporteurs, transitaires, logisticiens, investisseurs, courtiers) et
monitoring mondial des projets miniers.

---

## Stack

- **Frontend** : React 18, Vite 6, TypeScript 5.5, TailwindCSS 3.4
- **State / data** : `@tanstack/react-query`, `zustand` (persist)
- **Backend** : Supabase (PostgreSQL + Auth + Storage + RLS)
- **Paiements** : Stripe
- **Automatisations** : n8n (import Excel, scraping, assistant IA)
- **Ingestion scraping** : service Python (`services/monitor-service/`)
- **Visualisation** : Leaflet (cartes), Recharts / Chart.js (graphiques),
  react-grid-layout (dashboards configurables)

---

## Demarrage rapide

### 1. Prerequis

- Node.js >= 18
- `npm` (ou `pnpm` / `yarn`)
- Un projet Supabase (URL + anon key)

### 2. Installation

```bash
git clone <repo>
cd "SITE_MINEGRID_EQUIPEMENT_cover 1"
npm install
```

### 3. Variables d'environnement

Copier `.env.example` vers `.env` et renseigner :

| Variable                       | Obligatoire | Usage                                                         |
|--------------------------------|-------------|---------------------------------------------------------------|
| `VITE_SUPABASE_URL`            | oui         | URL du projet Supabase                                        |
| `VITE_SUPABASE_ANON_KEY`       | oui         | Cle publique anon (jamais la service_role)                    |
| `VITE_PRODUCTION_URL`          | non         | URL publique pour Open Graph / emails                         |
| `VITE_STRIPE_PUBLISHABLE_KEY`  | si paiements | Cle publique Stripe (pk_test / pk_live)                       |
| `VITE_MONITOR_API_URL`         | si monitor   | URL du service Python de monitoring (defaut localhost:8000)   |
| `VITE_MONITOR_ADMIN_TOKEN`     | si admin     | Token d'acces aux endpoints admin du monitor                  |
| `VITE_N8N_IMPORT_PARC_URL`     | si import    | Webhook n8n pour l'import Excel du parc                       |
| `VITE_N8N_SCRAPE_PDF_URL`      | si import    | Webhook n8n pour le scraping PDF                              |
| `VITE_N8N_ASSISTANT_URL`       | si IA        | Webhook n8n pour l'assistant IA                               |
| `VITE_N8N_AUTO_SPECS_URL`      | si IA        | Webhook n8n pour l'auto-remplissage des specs                 |

### 4. Commandes

```bash
npm run dev        # dev server sur http://localhost:5173
npm run build      # tsc + vite build (production, sortie dans dist/)
npm run preview    # servir dist/ localement (apres build)
npm run lint       # eslint flat config
```

---

## Architecture du code

```
src/
|-- App.tsx                 # routing maison hash-based (45 routes, switch)
|                             [DETTE] a migrer vers react-router-dom
|
|-- components/             # 71 composants reutilisables
|   |-- dashboard/          # widgets pour dashboards (27 fichiers)
|   |-- global-monitor/     # carte mondiale + alertes + projets (9)
|   |-- icons/              # icones custom (8)
|   |-- Header/ErrorBoundary/ProtectedRoute/...
|
|-- pages/                  # 116 pages, 1 page = 1 route hash
|   |-- Dashboard.jsx       # [LEGACY] dashboard espace perso (2100 lignes JSX)
|   |-- ProDashboard.tsx    # dashboard pro (decoupe recemment en 9 tabs)
|   |-- EnterpriseDashboard.tsx
|   |-- EnterpriseDashboard<Role>Display.tsx   # 9 dashboards metier
|   |-- enterprise/widgets/ # widgets extraits de EnterpriseDashboard (43 fichiers)
|   |-- pro/widgets/        # widgets extraits de ProDashboard (9 tabs)
|   |-- Machines, MachineDetail, SellEquipment, VitrinePersonnalisee...
|
|-- services/               # couche metier / API (10 services)
|   |-- realPipelineService.ts, realStockService.ts, aiWidgetService.ts,
|   |-- apiService.ts, autoSpecsService.ts, exportService.ts,
|   |-- communicationService.ts, monitorApi.ts, notificationService.ts
|
|-- utils/                  # helpers
|   |-- supabaseClient.ts   # client Supabase (non type par defaut, voir
|   |                         types/supabase.d.ts) + logger + api/ + proApi/
|   |-- logger.ts           # logger centralise, no-op en prod
|   |-- api/                # API utilisateur client (auth, machines, offers,
|   |                         messages, profile, preferences, notifications...)
|   |-- proApi/             # API portail pro (equipment, orders, documents,
|   |                         maintenance, notifications, users, machines...)
|   |-- enterpriseApi/      # API espace entreprise (interventions, repairs,
|   |                         inventory, technicians, equipment, rentals, stats)
|   |-- imageOptimization.ts # transformation URL images HD (Ritchie/Mascus/LBC)
|
|-- hooks/                  # 5 hooks custom (useAuth, useExchangeRates,
|   |                         useStripe, useAdaptiveWidget, useDashboardConfig)
|
|-- stores/                 # zustand stores persistes
|   |-- currencyStore.ts    # devise + taux de change (EUR, USD, MAD, XOF...)
|   |-- themeStore.ts       # light / dark
|
|-- constants/              # colonnes de tables, mock data, config widgets
|   |-- machineQueryFields.ts, proClientQueryFields.ts, apiQueryFields.ts,
|   |-- mockData/           # fixtures pour widgets (8 domaines)
|
|-- types/                  # interfaces partagees
|-- data/                    # marques / categories catalogue
|-- config/                  # config runtime
```

### Points a savoir pour onboarder

1. **Routing hash-based** : toutes les routes sont `/#nom-de-page`, voir
   `App.tsx:113` pour la liste. L'ajout d'une route passe par 1) un
   `lazy(() => import(...))` en tete du fichier, 2) un `case 'xxx'` dans
   le switch. Un chantier de migration vers `react-router-dom` est prevu
   (voir `docs/`).
2. **Typage Supabase** : `src/types/supabase.d.ts` contient un monkey-patch
   minimal qui rend les retours de `.from(...)` permissifs (any).
   La generation des vrais types via `npx supabase gen types typescript
   --project-id <id>` est recommandee avant d'ajouter de nouvelles
   features data-heavy.
3. **Logger** : utiliser `import { logger } from '@/utils/logger'`. En
   prod, seul `logger.error` emet vers la console ; le reste est un
   no-op. Script de migration disponible pour `console.*` -> `logger.*` :
   `scripts/refactor/migrate-console-to-logger.ps1`.
4. **Dashboards metier** : chaque role (vendeur, loueur, mecanicien,
   transporteur, transitaire, logisticien, investisseur, courtier) a
   son propre fichier `EnterpriseDashboard<Role>Display.tsx`. Les
   widgets sont metier-specifiques (ne pas fusionner les shells).
5. **Scripts one-shot a la racine** : 260+ fichiers `.cjs` / `.sql` /
   `.js` legacy de migration ou debug. Ils ne font pas partie du build.
   A archiver dans un dossier `archive/` lors d'un nettoyage futur.

---

## Backend / ingestion

Le dossier `services/monitor-service/` (Python, FastAPI) gere :
- Le scraping des sources externes (Ritchie Bros, Mascus, Leboncoin)
- L'enrichissement des URLs d'images en HD (voir `image_utils.py`)
- L'API de monitoring globale (carte, alertes, projets miniers)

Lancement local :
```bash
cd services/monitor-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Les connecteurs d'ingestion (Mascus, Leboncoin) sont dans
`services/monitor-service/app/ingestion/connectors/`.

---

## Outillage de refactor

Scripts AST (TypeScript) dans `scripts/refactor/` :

```bash
# 1. Analyser les dependances d'un gros fichier (enterprise | pro | vitrine | publication)
npx tsx scripts/refactor/analyze-deps.ts --source=enterprise

# 2. Extraire un widget en fichier isole
npx tsx scripts/refactor/extract-widget.ts --source=enterprise --symbol=MyWidget

# 3. Splitter un module utilitaire par domaine
npx tsx scripts/refactor/split-by-domain.ts --module=proApi

# 4. Migrer les console.* -> logger.* d'un fichier
./scripts/refactor/migrate-console-to-logger.ps1 -File src/pages/X.tsx -LoggerImport ../utils/logger
```

Ces scripts ont ete utilises pour reduire :
- `EnterpriseDashboard.tsx`  : 10 011 -> 950 lignes  (-90,5%)
- `ProDashboard.tsx`         :  5 374 -> 296 lignes  (-94,5%)
- `proApi.ts`                :  1 188 ->  14 lignes  (barrel)
- `api.ts`                   :    835 ->  15 lignes  (barrel)
- `mockData.ts`              :    904 ->  13 lignes  (barrel)

---

## Roadmap / dette connue

Voir `docs/` et les audits internes. Points chauds actuels :

1. **Securite** : un `TEMP_ACCESS_CODE` hardcode existe dans
   `src/components/ProtectedRoute.tsx` pour les routes `global-monitor` et
   `admin-sources`. A remplacer par un vrai role admin Supabase avant
   ouverture publique.
2. **Routing** : migrer le switch hash-based d'`App.tsx` vers
   `react-router-dom@7` deja installe.
3. **React Query** : seulement 4 usages dans le code, alors que la
   librairie est configuree globalement (`App.tsx`). Migrer les 10
   hooks de fetch les plus appeles pour profiter du cache partage.
4. **Typage Supabase** : generer les types automatiques et retirer le
   monkey-patch `src/types/supabase.d.ts`.
5. **Tests** : aucun test present. Commencer par Vitest +
   React Testing Library, couvrir les flows critiques (auth, paiement,
   publication machine).
6. **Gros fichiers restants** : `Dashboard.jsx` (2100 lignes, JSX non
   type), `VitrinePersonnalisee.tsx` (1870), `PublicationRapide.tsx`
   (1820), quelques widgets > 1000 lignes.

---

## Licence

Proprietaire. Tous droits reserves.
