-- Migration: add source tracking columns to machines table for Mascus integration
-- Run this on your Supabase SQL editor

ALTER TABLE machines ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT NULL;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS source_id TEXT DEFAULT NULL;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ix_machines_source_source_id
  ON machines (source, source_id)
  WHERE source IS NOT NULL AND source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_machines_source ON machines (source)
  WHERE source IS NOT NULL;
