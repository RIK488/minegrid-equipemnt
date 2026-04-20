# Outillage de refactor AST — `scripts/refactor/`

Cet outillage permet de découper proprement un fichier React/TypeScript
monolithique en extrayant ses symboles top-level un par un, avec validation
automatique des dépendances et du build.

Il a été construit pour découper `src/pages/EnterpriseDashboard.tsx`
(10 011 lignes au départ), mais peut être adapté à n'importe quel autre
fichier qui a la même pathologie (ex. `ProDashboard.tsx`, 5 374 lignes).

## Scripts

### `analyze-deps.ts`
Analyse un fichier source et produit :
- `output/enterprise-dashboard-nodes.json` — catalogue des symboles top-level
  (composants, hooks, helpers, types, constantes) avec leurs plages de lignes,
  leurs dépendances internes et leurs références d'imports externes.
- `output/enterprise-dashboard-deps.json` — graphe d'adjacence.
- `output/analysis.md` — rapport markdown lisible avec la liste des feuilles
  extractibles (= symboles qui ne dépendent d'aucun autre symbole top-level
  du même fichier).

```bash
npx tsx scripts/refactor/analyze-deps.ts
```

### `extract-widget.ts`
Extrait un symbole top-level du fichier source vers
`src/pages/enterprise/widgets/<Name>.tsx` :
1. Trouve la déclaration via AST (ts-morph).
2. Vérifie qu'elle est une **feuille** (pas de dépendance interne). Avorte
   sinon — protection contre le cas réel qui nous est arrivé d'extraire par
   erreur ~1 300 lignes de code étranger au widget.
3. Détermine les imports externes réellement utilisés (`lucide-react`,
   `supabase`, `react`, etc.).
4. Réécrit les chemins d'import relatifs depuis la nouvelle position
   (`../../utils/supabaseClient` vs `../../../utils/supabaseClient`).
5. Écrit le nouveau fichier en UTF-8 sans BOM via ts-morph.
6. Retire la déclaration du fichier source et ajoute l'import correspondant.

```bash
# Dry-run — affiche ce qui serait fait
npx tsx scripts/refactor/extract-widget.ts PerformanceScoreWidget --dry

# Extraction réelle (à valider avec tsc juste après)
npx tsx scripts/refactor/extract-widget.ts PerformanceScoreWidget
npx tsc --noEmit

# Forcer l'extraction même avec dépendances (DANGEREUX)
npx tsx scripts/refactor/extract-widget.ts XxxWidget --allow-deps
```

## Processus d'extraction recommandé

1. **Analyser** pour obtenir la liste des feuilles.
2. **Extraire par taille décroissante** pour maximiser le gain rapide.
3. **Après chaque extraction**, lancer `npx tsc --noEmit`. Si erreur →
   `git checkout` le source et investiguer.
4. **Commit après chaque extraction** pour garantir un rollback granulaire.
5. Quand toutes les feuilles sont extraites, **ré-analyser**. Certains
   symboles qui dépendaient de 1-2 widgets sont devenus des feuilles à leur
   tour (effet de cascade).
6. **Types partagés** (interfaces/aliases) : à extraire manuellement dans
   `src/pages/enterprise/types.ts` et ré-importer dans le source. Ça débloque
   souvent plusieurs widgets d'un coup.

## Résultats obtenus sur `EnterpriseDashboard.tsx`

Session unique du 20 avril 2026 :

- **Source** : 10 011 → 3 237 lignes (**-67,7 %**)
- **27 fichiers widgets extraits** dans `src/pages/enterprise/widgets/`
- **1 fichier types** dans `src/pages/enterprise/types.ts`
- Build TypeScript : **0 erreur avant, 0 erreur après**
- Aucune régression fonctionnelle (aucune ligne de logique changée, juste
  déplacée).

Plus gros widgets extraits :
| Fichier | Lignes |
| --- | ---: |
| SalesEvolutionWidgetEnriched.tsx | 1 631 |
| InventoryStatusWidget.tsx | 1 198 |
| SalesPipelineWidget.tsx | 1 003 |
| getListData.tsx | 720 |
| getChartData.tsx | 653 |

## Limites connues

1. L'extracteur ne gère pas encore les `interface` et `type alias` (à
   extraire manuellement pour l'instant).
2. Les constantes top-level importantes (ex. `mockData`, `widgetConfigs`)
   sont détectées mais gagneraient à aller dans `src/pages/enterprise/data/`
   plutôt que `widgets/` — à affiner.
3. Les helpers sont placés dans `widgets/` comme les composants, ce qui est
   discutable sémantiquement. Améliorable via un paramètre `--target-dir`.
4. Si deux widgets partagent un helper privé (non top-level), l'extracteur ne
   le détecte pas — il reste dans l'un des fichiers. Peu critique en pratique.

## Suites possibles

- Étendre pour gérer `ProDashboard.tsx` (5 374 lignes, même pathologie).
- Support des interfaces/types dans l'extractor.
- Déplacer les helpers `getXxxData` vers `src/pages/enterprise/data/` et les
  composants formulaires (`RentalForm`, `EditRentalForm`, `InterventionForm`,
  `RentalDetailsModal`) vers `src/pages/enterprise/forms/`.
- Continuer l'extraction du `EnterpriseDashboard.tsx` restant (3 237 lignes).
  Il reste probablement 4-5 gros composants (`WidgetComponent` le switcher,
  `MetricWidget`, `ChartWidget`, `ListWidget`, `MapWidget`) qui dépendent
  entre eux et nécessitent une analyse plus fine du graphe de dépendances.
