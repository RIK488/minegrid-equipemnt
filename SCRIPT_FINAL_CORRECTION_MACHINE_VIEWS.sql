-- =====================================================
-- CORRECTION SPÉCIFIQUE DE LA TABLE machine_views
-- =====================================================
-- Ce script corrige la table machine_views pour qu'elle corresponde au code

-- 1. SUPPRESSION ET RECRÉATION DE LA TABLE machine_views
-- =====================================================

-- Supprimer la table existante
DROP TABLE IF EXISTS machine_views CASCADE;

-- Recréer la table avec les bonnes colonnes
CREATE TABLE machine_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRÉATION DES INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_machine_views_machine_id ON machine_views(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_views_created_at ON machine_views(created_at);
CREATE INDEX IF NOT EXISTS idx_machine_views_viewer_id ON machine_views(viewer_id);

-- 3. ACTIVATION DE RLS
-- =====================================================

ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;

-- 4. CRÉATION DES POLITIQUES RLS
-- =====================================================

-- Politique pour permettre la lecture des vues (tout le monde peut voir les statistiques)
CREATE POLICY "Machine views are viewable by everyone" ON machine_views
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion de nouvelles vues
CREATE POLICY "Anyone can insert machine views" ON machine_views
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour (seulement le propriétaire de la machine)
CREATE POLICY "Machine owner can update views" ON machine_views
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM machines 
      WHERE machines.id = machine_views.machine_id 
      AND machines.sellerid::text = auth.uid()::text
    )
  );

-- Politique pour permettre la suppression (seulement le propriétaire de la machine)
CREATE POLICY "Machine owner can delete views" ON machine_views
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM machines 
      WHERE machines.id = machine_views.machine_id 
      AND machines.sellerid::text = auth.uid()::text
    )
  );

-- 5. INSERTION DE DONNÉES DE TEST (optionnel)
-- =====================================================

-- Insérer quelques vues de test si des machines existent
INSERT INTO machine_views (machine_id, ip_address, user_agent, created_at)
SELECT 
  m.id,
  '192.168.1.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() - INTERVAL '1 day' * (random() * 30)::int
FROM machines m
LIMIT 10;

-- 6. VÉRIFICATION
-- =====================================================

-- Vérifier que la table a été créée correctement
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'machine_views'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'machine_views';

-- Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'machine_views';

-- 7. MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Table machine_views corrigée avec succès !';
  RAISE NOTICE '📊 Colonnes: id, machine_id, viewer_id, ip_address, user_agent, created_at';
  RAISE NOTICE '🔒 RLS activé avec politiques appropriées';
  RAISE NOTICE '⚡ Index créés pour les performances';
END $$; 