-- ============================================================
-- Minegrid Global Monitor — Supabase Schema
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan       TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projets / actifs
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  type        TEXT,                        -- mine, road, port, rail, dam, industrial_zone, energy
  phase       TEXT,                        -- study, financing, tender, construction, ops
  country     TEXT,
  region      TEXT,
  lat         DOUBLE PRECISION,
  lon         DOUBLE PRECISION,
  budget_usd  NUMERIC(18,2),
  start_date  DATE,
  end_date    DATE,
  source      TEXT,
  source_url  TEXT,
  raw         JSONB,
  fingerprint TEXT NOT NULL UNIQUE,
  confidence  NUMERIC(3,2) DEFAULT 0.5,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents rattachés à un projet
CREATE TABLE IF NOT EXISTS project_documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT,
  url         TEXT,
  doc_type    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entités (entreprises, acteurs) rattachées à un projet
CREATE TABLE IF NOT EXISTS project_entities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT,
  role        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Besoins en équipements estimés
CREATE TABLE IF NOT EXISTS equipment_needs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category    TEXT,                        -- excavator, loader, dozer, grader, etc.
  qty_min     INTEGER,
  qty_max     INTEGER,
  confidence  NUMERIC(3,2),
  rationale   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projets sauvegardés par un utilisateur
CREATE TABLE IF NOT EXISTS user_saved_projects (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- Règles d'alerte
CREATE TABLE IF NOT EXISTS alert_rules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Événements d'alerte générés
CREATE TABLE IF NOT EXISTS alert_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS ix_projects_country_type_phase
  ON projects (country, type, phase);

CREATE INDEX IF NOT EXISTS ix_projects_updated_at
  ON projects (updated_at DESC);

-- fingerprint est déjà UNIQUE (index implicite)

CREATE INDEX IF NOT EXISTS ix_projects_lat_lon
  ON projects (lat, lon);

CREATE INDEX IF NOT EXISTS ix_project_documents_project
  ON project_documents (project_id);

CREATE INDEX IF NOT EXISTS ix_project_entities_project
  ON project_entities (project_id);

CREATE INDEX IF NOT EXISTS ix_equipment_needs_project
  ON equipment_needs (project_id);

CREATE INDEX IF NOT EXISTS ix_alert_rules_user
  ON alert_rules (user_id);

CREATE INDEX IF NOT EXISTS ix_alert_events_user
  ON alert_events (user_id);

CREATE INDEX IF NOT EXISTS ix_alert_events_created
  ON alert_events (created_at DESC);


-- ============================================================
-- 3. RLS (Row Level Security)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_entities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_needs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events        ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------
-- profiles : lecture/modif uniquement par le propriétaire
-- -------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- -------------------------------------------------------
-- projects : SELECT si authentifié, write via service_role
-- -------------------------------------------------------
CREATE POLICY "projects_select_authenticated"
  ON projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE/DELETE : pas de policy = refusé sauf service_role (bypass RLS)


-- -------------------------------------------------------
-- project_documents : SELECT si authentifié
-- -------------------------------------------------------
CREATE POLICY "project_documents_select_authenticated"
  ON project_documents FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- -------------------------------------------------------
-- project_entities : SELECT si authentifié
-- -------------------------------------------------------
CREATE POLICY "project_entities_select_authenticated"
  ON project_entities FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- -------------------------------------------------------
-- equipment_needs : SELECT si authentifié
-- -------------------------------------------------------
CREATE POLICY "equipment_needs_select_authenticated"
  ON equipment_needs FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- -------------------------------------------------------
-- user_saved_projects : CRUD uniquement par le propriétaire
-- -------------------------------------------------------
CREATE POLICY "saved_projects_select_own"
  ON user_saved_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_projects_insert_own"
  ON user_saved_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_projects_delete_own"
  ON user_saved_projects FOR DELETE
  USING (auth.uid() = user_id);


-- -------------------------------------------------------
-- alert_rules : CRUD par le propriétaire
-- -------------------------------------------------------
CREATE POLICY "alert_rules_select_own"
  ON alert_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "alert_rules_insert_own"
  ON alert_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alert_rules_update_own"
  ON alert_rules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alert_rules_delete_own"
  ON alert_rules FOR DELETE
  USING (auth.uid() = user_id);


-- -------------------------------------------------------
-- alert_events : SELECT par le propriétaire,
--                INSERT via service_role (backend)
-- -------------------------------------------------------
CREATE POLICY "alert_events_select_own"
  ON alert_events FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================
-- 4. TRIGGER : auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 5. TRIGGER : auto-update updated_at on projects
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_set_updated_at ON projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
