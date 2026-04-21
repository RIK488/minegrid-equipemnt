-- Script pour analyser la structure de la table machines existante
-- Exécutez ces requêtes une par une

-- 1. Vérifier la structure de la table machines
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS existantes pour machines
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'machines'
ORDER BY policyname;

-- 3. Vérifier si RLS est activé sur machines
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'machines' 
  AND schemaname = 'public';

-- 4. Vérifier quelques exemples de données
SELECT 
  id,
  name,
  category,
  price,
  location,
  status,
  created_at
FROM machines 
LIMIT 5; 