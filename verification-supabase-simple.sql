-- =====================================================
-- VÉRIFICATION SIMPLE SUPABASE - TOUS LES CHANGEMENTS
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- ÉTAPE 1: Vérifier la structure complète de la table machines
SELECT 'VÉRIFICATION STRUCTURE TABLE MACHINES' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ÉTAPE 2: Vérifier spécifiquement les champs GPS
SELECT 'VÉRIFICATION CHAMPS GPS' as info;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'latitude') 
        THEN '✅ latitude' 
        ELSE '❌ latitude' 
    END as latitude_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'longitude') 
        THEN '✅ longitude' 
        ELSE '❌ longitude' 
    END as longitude_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'address') 
        THEN '✅ address' 
        ELSE '❌ address' 
    END as address_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'city') 
        THEN '✅ city' 
        ELSE '❌ city' 
    END as city_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'country') 
        THEN '✅ country' 
        ELSE '❌ country' 
    END as country_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'postal_code') 
        THEN '✅ postal_code' 
        ELSE '❌ postal_code' 
    END as postal_code_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'total_hours') 
        THEN '✅ total_hours' 
        ELSE '❌ total_hours' 
    END as total_hours_status;

-- ÉTAPE 3: Vérifier les index
SELECT 'VÉRIFICATION INDEX' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'machines'
ORDER BY indexname;

-- ÉTAPE 4: Vérifier les fonctions SQL
SELECT 'VÉRIFICATION FONCTIONS SQL' as info;

SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'calculate_distance_simple' THEN '✅ Présente'
        WHEN proname = 'find_machines_in_radius' THEN '✅ Présente'
        ELSE '❌ Manquante'
    END as status
FROM pg_proc 
WHERE proname IN ('calculate_distance_simple', 'find_machines_in_radius')
ORDER BY proname;

-- ÉTAPE 5: Test d'insertion avec tous les champs
SELECT 'TEST D''INSERTION COMPLÈTE' as info;

-- Insérer une machine de test avec tous les champs
INSERT INTO machines (
    name, 
    brand, 
    model, 
    category, 
    year, 
    price, 
    total_hours,
    latitude,
    longitude,
    address,
    city,
    country,
    postal_code,
    description
) VALUES (
    'Test Machine Complète - Pelle hydraulique',
    'Caterpillar',
    '320D',
    'Pelles hydrauliques',
    2020,
    150000,
    2500,
    33.5731,  -- Casablanca
    -7.5898,
    '123 Rue Mohammed V, Casablanca',
    'Casablanca',
    'Maroc',
    '20000',
    'Machine de test complète avec tous les champs GPS'
) RETURNING 
    id, 
    name, 
    total_hours,
    latitude,
    longitude,
    address,
    city;

-- ÉTAPE 6: Test de récupération avec filtres géographiques
SELECT 'TEST RÉCUPÉRATION GÉOGRAPHIQUE' as info;

-- Récupérer les machines à Casablanca
SELECT 
    id,
    name,
    latitude,
    longitude,
    address,
    city
FROM machines 
WHERE city = 'Casablanca' 
  AND latitude IS NOT NULL
LIMIT 5;

-- ÉTAPE 7: Test de la fonction de recherche par rayon (si elle existe)
SELECT 'TEST FONCTION RECHERCHE PAR RAYON' as info;

-- Essayer d'utiliser la fonction find_machines_in_radius
DO $$
BEGIN
    -- Vérifier si la fonction existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'find_machines_in_radius'
    ) THEN
        RAISE NOTICE '✅ Fonction find_machines_in_radius disponible';
        -- La fonction existe, on peut l'utiliser
        -- SELECT * FROM find_machines_in_radius(33.5731, -7.5898, 100);
    ELSE
        RAISE NOTICE '❌ Fonction find_machines_in_radius non disponible';
    END IF;
END $$;

-- ÉTAPE 8: Vérifier les politiques RLS
SELECT 'VÉRIFICATION POLITIQUES RLS' as info;

SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'machines'
ORDER BY policyname;

-- ÉTAPE 9: Nettoyer les données de test
SELECT 'NETTOYAGE DONNÉES DE TEST' as info;

-- Supprimer la machine de test
DELETE FROM machines 
WHERE name = 'Test Machine Complète - Pelle hydraulique'
RETURNING id, name;

-- RÉSUMÉ FINAL
SELECT 'RÉSUMÉ DE LA VÉRIFICATION' as info;

SELECT 
    'Structure de la table' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'machines') > 0 
        THEN '✅ OK' 
        ELSE '❌ ERREUR' 
    END as status
UNION ALL
SELECT 
    'Champs GPS' as element,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'latitude')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'longitude')
        THEN '✅ OK' 
        ELSE '❌ MANQUANTS' 
    END as status
UNION ALL
SELECT 
    'Champ total_hours' as element,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'total_hours')
        THEN '✅ OK' 
        ELSE '❌ MANQUANT' 
    END as status
UNION ALL
SELECT 
    'Index' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'machines') > 0 
        THEN '✅ OK' 
        ELSE '⚠️ À VÉRIFIER' 
    END as status
UNION ALL
SELECT 
    'Politiques RLS' as element,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'machines') > 0 
        THEN '✅ OK' 
        ELSE '⚠️ À VÉRIFIER' 
    END as status; 