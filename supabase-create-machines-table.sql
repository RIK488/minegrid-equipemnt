-- =====================================================
-- Création MINIMALE de la table `public.machines`
-- Objectif: rendre possible l'upsert Mascus et que
-- le frontend puisse lire les machines (stock/widgets).
-- =====================================================

-- Assure que gen_random_uuid() est disponible
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Mise à jour automatique de `updated_at`
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table machines
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  category TEXT,
  year INTEGER,

  price TEXT,
  condition TEXT DEFAULT 'used',
  description TEXT,

  specifications JSONB DEFAULT '{}'::jsonb,

  -- Le frontend utilise `photos` (pas `images`) mais on garde les deux pour compat.
  images TEXT[] DEFAULT '{}'::text[],
  photos TEXT[] DEFAULT '{}'::text[],

  -- Identité vendeur (plusieurs colonnes existent côté app, on les supporte toutes)
  sellerid UUID,
  seller_id UUID,
  user_id UUID,
  owner_id UUID,

  -- Statut / boost (widgets)
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  boosted BOOLEAN DEFAULT FALSE,
  boosted_at TIMESTAMPTZ,

  -- Track sources (Mascus dedup)
  source TEXT,
  source_url TEXT,
  source_id TEXT,
  country TEXT,
  region TEXT,

  -- GPS (utilisé par certains filtres)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  city TEXT,
  postal_code TEXT,

  -- Autres champs utilisés par des scripts/widgets
  total_hours INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index & contraintes
CREATE INDEX IF NOT EXISTS ix_machines_sellerid ON public.machines(sellerid);
CREATE INDEX IF NOT EXISTS ix_machines_category ON public.machines(category);
CREATE INDEX IF NOT EXISTS ix_machines_country ON public.machines(country);
CREATE INDEX IF NOT EXISTS ix_machines_lat_lng ON public.machines(latitude, longitude);

-- Dedup sur (source, source_id) quand disponibles
CREATE UNIQUE INDEX IF NOT EXISTS ix_machines_source_source_id
  ON public.machines(source, source_id)
  WHERE source IS NOT NULL AND source_id IS NOT NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_machines_updated_at ON public.machines;
CREATE TRIGGER trg_machines_updated_at
BEFORE UPDATE ON public.machines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: on autorise l'utilisateur connecté à voir/agir sur ses machines
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'machines_select_own'
  ) THEN
    CREATE POLICY machines_select_own
      ON public.machines
      FOR SELECT
      USING (sellerid = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'machines_insert_own'
  ) THEN
    CREATE POLICY machines_insert_own
      ON public.machines
      FOR INSERT
      WITH CHECK (sellerid = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'machines_update_own'
  ) THEN
    CREATE POLICY machines_update_own
      ON public.machines
      FOR UPDATE
      USING (sellerid = auth.uid())
      WITH CHECK (sellerid = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'machines_delete_own'
  ) THEN
    CREATE POLICY machines_delete_own
      ON public.machines
      FOR DELETE
      USING (sellerid = auth.uid());
  END IF;
END $$;

