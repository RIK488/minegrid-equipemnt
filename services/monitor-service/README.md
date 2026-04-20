# Minegrid Monitor Service

Backend FastAPI pour le module **Global Monitor** — ingestion de projets, géocodage, alertes.

## Démarrage rapide

```bash
cd services/monitor-service
cp .env.example .env       # Configurer les variables
docker-compose up --build  # Lance Postgres + API sur :8000
```

API docs : http://localhost:8000/docs

## Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/admin/ingest/run` | ADMIN_TOKEN | Lancer l'ingestion |
| POST | `/admin/import/csv` | ADMIN_TOKEN | Import CSV |
| POST | `/admin/import/json` | ADMIN_TOKEN | Import JSON partenaire |
| GET | `/projects` | JWT | Liste paginée + filtres |
| GET | `/projects/{id}` | JWT | Détails projet |
| POST | `/alerts/subscribe` | JWT | Créer une règle d'alerte |
| GET | `/alerts/rules` | JWT | Lister ses règles |
| GET | `/alerts/events` | JWT | Lister ses événements |

## Géocodage

Le module enrichit automatiquement les projets sans coordonnées lors de l'ingestion.

### Configuration (`GEOCODER_MODE`)

| Mode | Description | Coût | Limites |
|------|-------------|------|---------|
| `photon` | Komoot Photon, basé sur OSM | Gratuit | Aucune clé requise |
| `self_hosted_nominatim` | Votre instance Nominatim | Gratuit | Nécessite `NOMINATIM_URL` |
| `mapbox` | Mapbox Geocoding API | Payant | Nécessite `MAPBOX_TOKEN` |
| `none` | Désactivé | — | Pas de géocodage |

### Policy Nominatim (nominatim.openstreetmap.org)

**Ne PAS utiliser l'instance publique de Nominatim pour du géocodage en volume.**

Règles officielles :
- Maximum 1 requête/seconde
- User-Agent valide obligatoire
- Interdit pour du bulk geocoding
- Voir : https://operations.osmfoundation.org/policies/nominatim/

En production, utilisez :
- Une instance self-hosted (Docker : `mediagis/nominatim`)
- Photon (gratuit, sans restriction stricte)
- Mapbox/Google (payant, fiable)

### Cache

Table `geocode_cache` : évite les requêtes redondantes.
- Clé : query texte
- TTL : 90 jours
- Stocke lat, lon, confidence, provider

### Pipeline

```
Projet sans lat/lon
  → Vérifier cache (geocode_cache)
  → Si absent : appeler le provider configuré
  → Rate limiting (1.1s entre requêtes)
  → Retry (2 tentatives max)
  → Stocker en cache
  → Enrichir le projet
```

## Sources d'ingestion

Configurées dans `sources.yaml`. Connecteurs disponibles :
- `wb_data360` — World Bank Data360 API
- `ppi` — PPI Database (CSV local)
- `ocds_feed` — OCDS releases JSON

## Tests

```bash
pip install pytest
pytest tests/ -v
```
