# Migrations SQL — Index d'exécution

> Les scripts SQL sont conservés à la racine du dépôt car plusieurs scripts
> Node.js d'installation (`setup-real-pipeline.js`, `execute-*-table.js`,
> `fix-all-database-structure.js`, …) les lisent via `fs.readFileSync('xxx.sql')`.
> Déplacer physiquement les fichiers casserait ces scripts.
>
> Ce document sert d'**index logique** pour savoir *dans quel ordre* appliquer
> les migrations sur une base Supabase vierge, et à quoi chaque script sert.
>
> Un nettoyage complet (déplacement physique dans `migrations/` + mise à jour
> des scripts Node) est planifié dans un sprint dédié (cf. audit P0 #3).

## Ordre d'application sur une base neuve

### 1) Schémas de base
- `supabase-schema.sql` — Schéma principal (profils, sessions, etc.)
- `supabase-schema-pro.sql` — Extensions Portail Pro
- `supabase-schema-enterprise.sql` — Extensions Tableau de bord Entreprise
- `supabase-create-machines-table.sql` — Table `machines` (catalogue public)
- `create-complete-database.sql` — Agrégateur optionnel (si utilisé)

### 2) Tables métier
- `create-pro-portal-tables.sql` — Tables du portail pro
- `create-pro-tables.sql` — Tables pro complémentaires
- `create-pro-equipment-details.sql` — Équipements détaillés
- `create-technical-documents-table.sql` — Documents techniques
  (variantes: `create-technical-documents-table-minimal.sql`,
  `…-simple.sql` — n'appliquer qu'**une seule** des trois selon besoin)
- `create-technicians-table.sql` — Techniciens
- `create-sales-tables.sql` — Ventes
- `create-rentals-table.sql` — Locations
- `create-real-pipeline-tables.sql` — Pipeline commercial
- `create-real-stock-tables.sql` — Stock temps réel
- `create-notifications-table.sql` — Notifications utilisateur
- `create-client-notifications-table.sql` — Notifications client
- `create-user-invitations-table.sql` — Invitations utilisateur

### 3) Ajouts de colonnes
- `add-gps-fields.sql` *ou* `add-gps-fields-supabase-optimized.sql`
  (préférer la version *optimized*)
- `add-total-hours-final.sql` (variantes `-field.sql`, `-field-corrected.sql`
  sont des itérations historiques — utiliser **uniquement** la *final*)

### 4) Politiques RLS (Row-Level Security)
- `fix-machines-rls-policies.sql` — **OBLIGATOIRE** (sinon le catalogue
  public ne s'affiche pas pour les visiteurs non-connectés)
- `fix-equipment-rls-policies.sql`
- `fix-messages-rls.sql`

### 5) Correctifs d'incidents (à appliquer uniquement si le symptôme existe)
- `fix-messages-table.sql` — Structure messages (si erreurs PGRST)
- `fix-messages-status-constraint.sql` — Contrainte status
- `fix-offers-table.sql` — Structure offres
- `fix-maintenance-interventions-table.sql`
- `fix-database-errors-sql.sql` — Correctif global v1
- `fix-database-errors-sql-direct.sql` — Correctif global v2 (plus récent)
- `fix-edge-function.sql` — Edge function
- `SCRIPT_CORRECTION_EXCHANGE_RATES.sql` / `SCRIPT_SIMPLE_EXCHANGE_RATES.sql` /
  `SCRIPT_FINAL_CORRECTION_EXCHANGE_RATES.sql` — Taux de change (utiliser la *FINAL*)
- `SCRIPT_FINAL_CORRECTION_MACHINE_VIEWS.sql` — Table `machine_views`
- `SCRIPT_FINAL_CORRECTION_COMPLETE.sql` / `…_SELLERID.sql` — Correctifs complets

### 6) Améliorations non-critiques
- `supabase-upgrade-image-urls.sql` — Migre les URLs d'images en base vers leur
  version HD (Mascus/Ritchie Bros/Le Bon Coin). Voir `docs/imageOptimization`
  pour le contexte.

### 7) Données de test (dev / staging uniquement)
- `SCRIPT_CREATION_UTILISATEUR_TEST.sql`
- `test-rentals-data.sql`
- `insert-maintenance-data.sql`

### 8) Vérifications (lecture seule, à tout moment)
- `check-database-structure.sql`
- `check-existing-tables-structure.sql`
- `check-machines-structure-simple.sql`
- `check-machines-table-structure.sql`
- `verification-supabase-simple.sql`

## Scripts d'aide (Node.js à la racine)

Ces scripts automatisent l'exécution de certains SQL via le client Supabase Admin :

- `setup-real-pipeline.js` → exécute `create-real-pipeline-tables.sql`
- `fix-all-database-structure.js` → exécute plusieurs `fix-*.sql` en cascade
- `execute-notifications-table.js` → `create-notifications-table.sql`
- `execute-client-notifications-table.js` → `create-client-notifications-table.sql`
- `execute-technical-documents-table.js` → `create-technical-documents-table.sql`
- `execute-user-invitations-table.js` → `create-user-invitations-table.sql`
- `execute-rls-fix.js` → `fix-equipment-rls-policies.sql`

Prérequis : variables d'environnement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

## Historique des variantes

Plusieurs scripts existent en variantes (v1, corrected, final, simple, minimal).
La convention retenue est **toujours préférer la version la plus récente** :
- `final` > `corrected` > version nue
- `-optimized` > version nue
- `-complete` > version simple

Lors du nettoyage futur, les variantes intermédiaires seront déplacées dans
`migrations/archive/`.
