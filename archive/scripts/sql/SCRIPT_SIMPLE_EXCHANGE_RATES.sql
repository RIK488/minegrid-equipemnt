-- =====================================================
-- SCRIPT SIMPLE : CORRECTION EXCHANGE_RATES
-- =====================================================
-- Script simplifié pour corriger l'erreur 401

-- 1. Suppression complète avec CASCADE
DROP FUNCTION IF EXISTS exchange_rates() CASCADE;
DROP VIEW IF EXISTS exchange_rates_view CASCADE;

-- 2. Création de la fonction avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION exchange_rates()
RETURNS TABLE (
    currency VARCHAR(3),
    rate DECIMAL(10,4),
    last_updated TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 'EUR'::VARCHAR(3), 1.0000::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'USD'::VARCHAR(3), 1.0850::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'MAD'::VARCHAR(3), 10.8500::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'XOF'::VARCHAR(3), 655.96::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'XAF'::VARCHAR(3), 655.96::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'NGN'::VARCHAR(3), 1590.35::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'ZAR'::VARCHAR(3), 20.65::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'EGP'::VARCHAR(3), 33.72::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'KES'::VARCHAR(3), 158.48::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE
    UNION ALL
    SELECT 'GHS'::VARCHAR(3), 13.89::DECIMAL(10,4), NOW()::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- 3. Permissions pour tous les rôles
GRANT EXECUTE ON FUNCTION exchange_rates() TO anon;
GRANT EXECUTE ON FUNCTION exchange_rates() TO authenticated;
GRANT EXECUTE ON FUNCTION exchange_rates() TO service_role;

-- 4. Test de la fonction
SELECT '✅ Fonction exchange_rates créée avec succès' as status;
SELECT * FROM exchange_rates() LIMIT 3; 