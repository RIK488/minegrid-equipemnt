-- =====================================================
-- SCRIPT FINAL : CORRECTION FONCTION EXCHANGE_RATES
-- =====================================================
-- Ce script corrige l'erreur 401 sur la fonction exchange_rates
-- en recréant la fonction avec les bonnes permissions

-- 1. Suppression de la vue qui dépend de la fonction
DROP VIEW IF EXISTS exchange_rates_view CASCADE;

-- 2. Suppression de l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS exchange_rates() CASCADE;

-- 3. Création de la fonction exchange_rates avec les bonnes permissions
CREATE OR REPLACE FUNCTION exchange_rates()
RETURNS TABLE (
    currency VARCHAR(3),
    rate DECIMAL(10,4),
    last_updated TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Permet l'exécution sans authentification
AS $$
BEGIN
    -- Retourne des taux de change fixes pour les devises principales
    RETURN QUERY
    SELECT 
        'EUR'::VARCHAR(3) as currency,
        1.0000::DECIMAL(10,4) as rate,
        NOW()::TIMESTAMP WITH TIME ZONE as last_updated
    UNION ALL
    SELECT 
        'USD'::VARCHAR(3),
        1.0850::DECIMAL(10,4),
        NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 
        'MAD'::VARCHAR(3),
        10.8500::DECIMAL(10,4),
        NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 
        'GBP'::VARCHAR(3),
        0.8500::DECIMAL(10,4),
        NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 
        'JPY'::VARCHAR(3),
        160.0000::DECIMAL(10,4),
        NOW()::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 4. Création d'une nouvelle vue pour faciliter l'accès
CREATE OR REPLACE VIEW exchange_rates_view AS
SELECT * FROM exchange_rates();

-- 5. Attribution des permissions sur la fonction
GRANT EXECUTE ON FUNCTION exchange_rates() TO anon;
GRANT EXECUTE ON FUNCTION exchange_rates() TO authenticated;
GRANT EXECUTE ON FUNCTION exchange_rates() TO service_role;

-- 6. Attribution des permissions sur la vue
GRANT SELECT ON exchange_rates_view TO anon;
GRANT SELECT ON exchange_rates_view TO authenticated;
GRANT SELECT ON exchange_rates_view TO service_role;

-- 7. Vérification de la création
SELECT 
    'Fonction exchange_rates créée avec succès' as status,
    proname as function_name,
    proacl as permissions
FROM pg_proc 
WHERE proname = 'exchange_rates';

-- 8. Test de la fonction
SELECT 'Test de la fonction exchange_rates:' as test_info;
SELECT * FROM exchange_rates() LIMIT 3;

-- =====================================================
-- RÉSULTAT ATTENDU :
-- - Plus d'erreur 401 sur /rpc/exchange_rates
-- - Fonction accessible sans authentification
-- - Taux de change disponibles pour les widgets
-- ===================================================== 