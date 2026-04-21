-- =====================================================
-- SCRIPT POUR VÉRIFIER LA STRUCTURE DE LA TABLE MACHINES
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- Vérifier toutes les colonnes de la table machines
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier quelques exemples de données
SELECT 
    id,
    name,
    brand,
    model,
    year,
    price,
    created_at
FROM machines 
LIMIT 3; 