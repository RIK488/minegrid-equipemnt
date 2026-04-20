# Documentation projet Minegrid

Ce dossier regroupe 166 documents techniques, guides d'implémentation et
rapports d'incident accumulés pendant la vie du projet. Le README racine du
dépôt et `AGENTS.md` restent à la racine par convention.

## Index rapide par thème

### 🏗️ Architecture & installation
- Fichiers commençant par `GUIDE_`, `RESOLUTION_`, `CREATION_`
- `DASHBOARD_IMPLEMENTATION.md`
- `ARCHITECTURE_*`
- `ROADMAP_*`, `PLAN_*`

### 🛒 Catalogue machines
- `GUIDE_AJOUT_*`
- `RESOLUTION_UPLOAD_IMAGES_EQUIPEMENT.md`
- `GUIDE_OPTIMISATION_LOCALISATION.md`

### 🔐 Authentification, RLS, sécurité
- `RESOLUTION_RLS_*`
- `CORRECTION_AUTH_*`

### 📊 Dashboard & widgets
- `DASHBOARD_*`
- `WIDGET_*`
- `TABLEAU_DE_BORD_*`

### 🤝 Portail Pro / entreprise
- `PORTAL_PRO_*`
- `ESPACE_PRO_*`
- `ENTREPRISE_*`

### 🛠️ Corrections & incidents
- Fichiers commençant par `CORRECTION_`, `FIX_`, `RESOLUTION_`
- Rapports de bug historiques

### 🧪 Tests & validation
- `TEST_*`, `VALIDATION_*`

## Comment trouver un doc rapidement

Le plus simple reste une recherche par nom :

```bash
# Windows PowerShell
Get-ChildItem -Path docs -Filter *.md | Where-Object { $_.Name -like "*rls*" }

# Unix
ls docs/*.md | grep -i rls
```

## Nettoyage futur

Cette archive contient énormément de doublons (rapports d'étape successifs sur
le même sujet, guides de résolution qui se chevauchent). Un tri est planifié
dans un sprint dédié — la règle retenue sera :

- Un seul guide de référence par thème (le plus récent).
- Les rapports d'incident résolus vont dans `docs/archive/<année>/`.
- Les guides encore pertinents restent dans `docs/`.

En attendant, ce dossier tient lieu de base de connaissance searchable.
