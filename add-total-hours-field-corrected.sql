-- =====================================================
-- SCRIPT CORRIGÉ POUR AJOUTER LE CHAMP TOTAL_HOURS
-- Adapté à la structure réelle de votre table machines
-- =====================================================

-- Étape 1: Vérifier la structure actuelle de la table
SELECT 'STRUCTURE ACTUELLE DE LA TABLE MACHINES' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Étape 2: Ajouter le champ total_hours (seulement s'il n'existe pas)
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

-- Étape 3: Vérifier la nouvelle structure
SELECT 'NOUVELLE STRUCTURE AVEC TOTAL_HOURS' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Étape 4: Test d'insertion avec les colonnes existantes
SELECT 'TEST D''INSERTION AVEC LES COLONNES EXISTANTES' as info;

-- D'abord, vérifions quelles colonnes existent réellement
DO $$
DECLARE
    col_names text := '';
    col_list text := '';
BEGIN
    -- Construire la liste des colonnes existantes
    SELECT string_agg(column_name, ', ') INTO col_names
    FROM information_schema.columns 
    WHERE table_name = 'machines' 
      AND table_schema = 'public'
      AND column_name NOT IN ('id', 'created_at', 'updated_at'); -- Colonnes auto-générées
    
    -- Construire la liste des valeurs de test
    SELECT string_agg(
        CASE 
            WHEN column_name = 'name' THEN '''Test Machine - Pelle hydraulique'''
            WHEN column_name = 'brand' THEN '''Caterpillar'''
            WHEN column_name = 'model' THEN '''320D'''
            WHEN column_name = 'category' THEN '''Pelles hydrauliques'''
            WHEN column_name = 'year' THEN '2020'
            WHEN column_name = 'price' THEN '150000'
            WHEN column_name = 'total_hours' THEN '2500'
            WHEN column_name = 'description' THEN '''Machine de test avec heures d''''utilisation'''
            WHEN column_name = 'sellerid' THEN '''test-user-id'''
            ELSE 'NULL'
        END, ', '
    ) INTO col_list
    FROM information_schema.columns 
    WHERE table_name = 'machines' 
      AND table_schema = 'public'
      AND column_name NOT IN ('id', 'created_at', 'updated_at');
    
    RAISE NOTICE 'Colonnes disponibles: %', col_names;
    RAISE NOTICE 'Valeurs de test: %', col_list;
END $$; 