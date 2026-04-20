# Plan de sprint — Découpage `EnterpriseDashboard.tsx` (P0 #1)

> ⚠️ **Retour d'expérience — tentative d'extraction manuelle échouée**
>
> Lors d'une session précédente, nous avons tenté une extraction "par ancres
> textuelles" (repérer le début et la fin d'un widget par `const WidgetName = …`
> et `// Composant suivant`). **Ça ne marche pas** :
>
> 1. Le fichier contient **des fonctions helpers (`getSalesPerformanceScoreData`,
>    `getPerformanceScoreData`, `getEquipmentAvailabilityData`, `getMapData`,
>    `getCalendarData`, …) imbriquées entre les définitions de widgets**,
>    utilisées par plusieurs consommateurs.
> 2. Le widget suivant (`WidgetComponent` / switcher) fait référence à
>    quasiment **tous les autres widgets** du fichier — l'extraction d'un seul
>    widget provoque immédiatement ~30 erreurs TS2304 (`Cannot find name`).
> 3. Les numéros de ligne affichés par les outils de recherche ne correspondent
>    pas toujours à la position réelle dans le fichier selon l'éditeur/l'encodage.
> 4. PowerShell 5.1 `Get-Content` / `Set-Content -Encoding UTF8` corrompt les
>    accents UTF-8 (conversion implicite via Windows-1252 + ajout de BOM).
>    Toute extraction doit utiliser `[System.IO.File]::ReadAllText` /
>    `WriteAllText` avec `UTF8Encoding($false)` (NoBOM).
>
> **Conclusion** : l'extraction doit se faire via **AST**, pas via texte brut.

> **Contexte** : `src/pages/EnterpriseDashboard.tsx` fait **10 011 lignes**.
> Ce fichier unique concentre onglets, widgets, modals, logique Supabase et
> état local. À chaque modification, c'est toute la page qui doit être
> retypée/rebundlée. Merge-conflicts quasi systématiques dès que deux
> développeurs y touchent. Ce document fixe la méthode pour le découper
> **sans régression visible**.
>
> Durée estimée : **1 sprint de 2 semaines**, 1 dev à 60% + 1 reviewer.

## Pourquoi pas "tout refactor en 1 soir"

- 10 k lignes = ~400 composants/sections imbriqués, des `useState` partagés,
  des effets qui dépendent les uns des autres.
- Un gros bang refactor = surface de régression énorme, impossible à QA
  exhaustivement en production.
- Le risque métier (interruption des 500 entreprises connectées ciblées)
  dépasse largement le bénéfice technique.

## Méthode révisée — Extraction AST avec `ts-morph`

Le fichier est un grid-layout de widgets (pas un dashboard à onglets). Il
contient ~40 composants React (`const XxxWidget = (...) => {...}`) et ~10
fonctions helpers au même niveau, avec des dépendances croisées.

### Outillage recommandé

- **`ts-morph`** (TypeScript AST wrapper) : permet d'identifier précisément
  chaque `VariableDeclaration` au top-level et ses dépendances via les
  références syntaxiques. Installation : `npm i -D ts-morph`.
- **Script Node** dans `scripts/refactor/extract-widget.ts` qui :
  1. Ouvre le fichier source avec `Project.addSourceFileAtPath`.
  2. Pour un nom de widget donné, récupère la `VariableDeclaration`.
  3. Analyse toutes les `Identifier` référencées → détermine les helpers
     co-dépendants.
  4. Construit automatiquement la liste des imports nécessaires.
  5. Écrit le nouveau fichier, supprime le code du source, ajoute l'import.

### Stratégie sûre (ordre d'extraction)

Extraire **des feuilles** d'abord (widgets qui ne dépendent d'aucun autre
widget défini dans le même fichier), en remontant la chaîne de dépendances :

1. **Audit préalable** (J1) — script `scripts/refactor/analyze-deps.ts` qui
   produit le graphe de dépendances inter-widgets. Livrable : diagramme et
   ordre d'extraction sûr.
2. **Extraire les helpers purs** avant les widgets : `getChartData`,
   `getCalendarData`, `getMapData`, `getMaintenanceData`, etc. vers
   `src/pages/enterprise/dataHelpers.ts`.
3. **Extraire les widgets-feuilles** (ne dépendent que des helpers) :
   `DonutChart`, `MapWidget`, `MetricWidget`, etc.
4. **Extraire les widgets intermédiaires** : `PerformanceScoreWidget`,
   `SalesPerformanceScoreWidget`, `InventoryStatusWidget`, etc.
5. **Extraire `WidgetComponent`** (le switcher) en dernier, puisqu'il importe
   tous les précédents.

### Garde-fous obligatoires

- Après **chaque** extraction, `npx tsc --noEmit` doit passer.
- Commit après chaque widget extrait, pour permettre un rollback granulaire.
- Tests snapshot avant/après sur la page Entreprise (Playwright + jest-image-snapshot).

## Ancienne méthode (conservée pour référence) — Strangler Fig, par onglet

On découpe **par onglet du dashboard**, un à la fois, derrière un feature
flag. Tant que le flag est sur `false`, on sert l'ancien code. Quand la
nouvelle version est validée, on bascule.

### Cartographie préalable (J1)

Identifier les onglets actuels du dashboard. Cibles probables :

- `overview/` — vue d'ensemble
- `sales/` — ventes & évolution
- `stock/` — inventaire
- `pipeline/` — pipeline commercial
- `financial/` — scores & KPI financiers
- `team/` — équipe & collaborateurs
- `reports/` — rapports
- `settings/` — paramètres entreprise

Livrable : `docs/ENTERPRISE_DASHBOARD_TABS.md` avec, pour chaque onglet :

- Plage de lignes dans le fichier actuel
- Liste des widgets/composants internes
- Liste des `useState` / `useEffect` consommés
- Liste des appels Supabase
- Props reçues du parent

### Structure cible

```
src/pages/enterprise/
├── EnterpriseDashboard.tsx          # shell ~200 lignes : layout, routing onglets, context
├── context/
│   └── EnterpriseDashboardContext.tsx   # état partagé (entreprise courante, période, filtres)
├── tabs/
│   ├── OverviewTab.tsx              # ~400 lignes max
│   ├── SalesTab.tsx
│   ├── StockTab.tsx
│   ├── PipelineTab.tsx
│   ├── FinancialTab.tsx
│   ├── TeamTab.tsx
│   ├── ReportsTab.tsx
│   └── SettingsTab.tsx
├── widgets/                          # widgets réutilisables entre onglets
│   ├── KpiCard.tsx
│   ├── TrendChart.tsx
│   └── ...
├── hooks/                            # data fetching isolé
│   ├── useEnterpriseKpis.ts
│   ├── useSalesEvolution.ts
│   └── ...
└── api/                              # accès Supabase centralisé
    └── enterpriseRepository.ts
```

**Règle dure** : aucun fichier > 400 lignes. Si un onglet dépasse, on crée
des sous-composants dans `tabs/<tab>/`.

### Déroulé sprint (10 jours ouvrés)

| Jour | Action | Livrable |
| ---- | ------ | -------- |
| J1   | Cartographie + feature flag `NEW_ENTERPRISE_DASHBOARD` | `docs/ENTERPRISE_DASHBOARD_TABS.md` + `src/config/featureFlags.ts` |
| J2   | Créer shell + context + router onglets | `enterprise/EnterpriseDashboard.tsx` (shell vide) |
| J3   | Migrer `OverviewTab` (le plus simple) | `tabs/OverviewTab.tsx` + tests snapshot |
| J4   | Migrer `SalesTab` + extraire `useSalesEvolution` | idem |
| J5   | Migrer `StockTab` + `PipelineTab` | idem |
| J6   | Migrer `FinancialTab` (le plus chargé, prévoir 2j) | idem |
| J7   | Suite `FinancialTab` | idem |
| J8   | Migrer `TeamTab` + `ReportsTab` + `SettingsTab` | idem |
| J9   | QA complète derrière feature flag ON en staging | Grille de tests validée |
| J10  | Flip du flag en prod (progressif 10% → 50% → 100%), suppression de l'ancien fichier | PR finale |

### Garde-fous

1. **Feature flag côté client** : `if (!flags.NEW_ENTERPRISE_DASHBOARD) return <LegacyEnterpriseDashboard />`.
2. **Diff de rendu** : sur chaque onglet migré, ajouter un test snapshot
   comparant le HTML ancien vs. nouveau sur un jeu de fixtures Supabase.
3. **Monitoring** : ajouter un event Plausible/PostHog
   `enterprise_dashboard_error` sur toute erreur du nouveau code, monitorer
   7 jours avant suppression définitive.
4. **Pas de feature nouvelle pendant le sprint.** Discipline : on découpe,
   on ne refait pas.

### Critères de sortie

- [ ] `EnterpriseDashboard.tsx` ≤ 250 lignes
- [ ] Aucun fichier dans `src/pages/enterprise/` > 400 lignes
- [ ] `npm run build` compile sans erreur
- [ ] Aucune régression fonctionnelle détectée en QA
- [ ] Taux d'erreur `enterprise_dashboard_error` ≤ baseline + 0.1%
- [ ] Ancien fichier supprimé, feature flag retiré

### Extension : `ProDashboard.tsx` (5 374 lignes)

Même méthode, sprint suivant. Structure cible sous `src/pages/pro/`.

## Ce que ce sprint N'inclut PAS

- Migration des `console.*` → logger (sprint parallèle, indépendant)
- Typage Supabase généré (sprint parallèle)
- Conversion des derniers `.jsx` → `.tsx` (sprint parallèle)
- Mise en place de tests E2E Playwright (sprint parallèle)

Ces chantiers peuvent être menés en parallèle par un autre dev sans
collision, puisqu'ils n'éditent pas les mêmes fichiers.
