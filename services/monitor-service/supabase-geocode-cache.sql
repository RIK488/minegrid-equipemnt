-- ============================================================
-- Minegrid Global Monitor — Geocode Cache Table
-- À exécuter dans le SQL Editor de Supabase (après supabase-schema.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS geocode_cache (
  query       TEXT PRIMARY KEY,
  lat         DOUBLE PRECISION,
  lon         DOUBLE PRECISION,
  confidence  NUMERIC(3,2) DEFAULT 0.5,
  provider    TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_geocode_cache_updated
  ON geocode_cache (updated_at DESC);

-- Pas de RLS nécessaire : cette table est utilisée uniquement côté backend (service_role).
