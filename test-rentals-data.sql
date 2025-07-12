-- Script pour ajouter des données de test pour les locations
-- À exécuter dans Supabase SQL Editor

-- Vérifier que la table rentals existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'rentals';

-- Insérer des données de test pour les locations
INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() + '2 days'::interval,
    NOW() + '1 week'::interval,
    3500.00,
    'Confirmée',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u 
WHERE m.name LIKE '%Pelle%' AND u.full_name IS NOT NULL 
LIMIT 1;

INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() + '5 days'::interval,
    NOW() + '2 weeks'::interval,
    5200.00,
    'En préparation',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u 
WHERE m.name LIKE '%Chargeuse%' AND u.full_name IS NOT NULL 
LIMIT 1;

INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() + '1 day'::interval,
    NOW() + '3 days'::interval,
    1800.00,
    'Prête',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u 
WHERE m.name LIKE '%Bulldozer%' AND u.full_name IS NOT NULL 
LIMIT 1;

INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() + '10 days'::interval,
    NOW() + '1 month'::interval,
    8500.00,
    'Confirmée',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u 
WHERE m.name LIKE '%Grue%' AND u.full_name IS NOT NULL 
LIMIT 1;

-- Vérifier les données insérées
SELECT 
    r.id,
    r.start_date,
    r.end_date,
    r.total_price,
    r.status,
    m.name as equipment_name,
    u.full_name as client_name
FROM rentals r
LEFT JOIN machines m ON r.equipment_id = m.id
LEFT JOIN user_profiles u ON r.client_id = u.id
ORDER BY r.start_date; 