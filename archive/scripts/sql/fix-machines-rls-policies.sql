-- Script pour corriger les politiques RLS de la table machines
-- Ce script ajoute les politiques manquantes pour permettre la modification des machines

-- =====================================================
-- 1. VÉRIFICATION INITIALE
-- =====================================================

-- Vérifier les politiques existantes
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'machines'
ORDER BY policyname;

-- =====================================================
-- 2. ACTIVATION DE RLS (si pas déjà activé)
-- =====================================================

-- Activer RLS sur la table machines
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CRÉATION DES POLITIQUES RLS
-- =====================================================

-- Politique pour permettre la lecture des machines (SELECT)
-- Si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' 
    AND policyname = 'Users can view machines'
  ) THEN
    CREATE POLICY "Users can view machines" ON machines
      FOR SELECT USING (true);
  END IF;
END $$;

-- Politique pour permettre l'ajout de machines (INSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' 
    AND policyname = 'Users can insert machines'
  ) THEN
    CREATE POLICY "Users can insert machines" ON machines
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Politique pour permettre la modification de machines (UPDATE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' 
    AND policyname = 'Users can update machines'
  ) THEN
    CREATE POLICY "Users can update machines" ON machines
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Politique pour permettre la suppression de machines (DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' 
    AND policyname = 'Users can delete machines'
  ) THEN
    CREATE POLICY "Users can delete machines" ON machines
      FOR DELETE USING (true);
  END IF;
END $$;

-- =====================================================
-- 4. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que toutes les politiques sont créées
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'machines'
ORDER BY policyname;

-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'machines' 
  AND schemaname = 'public'; 