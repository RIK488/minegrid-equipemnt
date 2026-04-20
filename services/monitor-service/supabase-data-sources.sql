-- ============================================================
-- Minegrid Global Monitor — Data Sources Table
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS data_sources (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  url            TEXT,
  enabled        INTEGER NOT NULL DEFAULT 1,
  config         JSONB NOT NULL DEFAULT '{}',
  last_run_at    TIMESTAMPTZ,
  stats          JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pas de RLS : gérée uniquement côté backend via service_role / ADMIN_TOKEN.
