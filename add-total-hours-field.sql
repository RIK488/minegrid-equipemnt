-- =====================================================
-- SCRIPT POUR AJOUTER LE CHAMP TOTAL_HOURS
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- Étape 1: Vérifier si le champ total_hours existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'total_hours'
        AND table_schema = 'public'
    ) THEN
        -- Ajouter le champ total_hours
        ALTER TABLE machines ADD COLUMN total_hours INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Champ total_hours ajouté à la table machines';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ total_hours existe déjà dans la table machines';
    END IF;
END $$;

-- Étape 2: Vérifier la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
  AND column_name IN ('id', 'name', 'brand', 'model', 'year', 'price', 'total_hours', 'created_at')
ORDER BY ordinal_position;

-- Étape 3: Mettre à jour les enregistrements existants (optionnel)
-- UPDATE machines SET total_hours = 0 WHERE total_hours IS NULL;

-- Étape 4: Vérifier que le champ est bien ajouté
SELECT 
    'Vérification du champ total_hours' as info,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'total_hours'
        AND table_schema = 'public'
    ) as champ_existe; 