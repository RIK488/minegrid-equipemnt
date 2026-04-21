-- Script pour vérifier la structure de la base de données
-- Exécutez ces requêtes une par une pour diagnostiquer le problème

-- 1. Vérifier toutes les tables existantes
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Vérifier les tables liées aux équipements
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%equipment%'
ORDER BY tablename;

-- 3. Vérifier les tables liées aux clients
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%client%'
ORDER BY tablename;

-- 4. Vérifier les tables liées aux machines
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%machine%'
ORDER BY tablename;

-- 5. Vérifier les tables liées aux utilisateurs
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%user%'
ORDER BY tablename; 