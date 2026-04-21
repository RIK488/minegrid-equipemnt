-- =====================================================
-- SCRIPT FINAL : Ajout du champ total_hours à la table machines
-- Basé sur la structure réelle de votre table
-- =====================================================

-- Étape 1: Ajouter le champ total_hours
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
        RAISE NOTICE '✅ Champ total_hours ajouté avec succès à la table machines';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ total_hours existe déjà dans la table machines';
    END IF;
END $$;

-- Étape 2: Vérifier que le champ a été ajouté
SELECT 
    'VÉRIFICATION' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
  AND column_name = 'total_hours';

-- Étape 3: Afficher la structure complète mise à jour
SELECT 
    'STRUCTURE COMPLÈTE DE LA TABLE MACHINES' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Étape 4: Test d'insertion avec le nouveau champ
SELECT 'TEST D''INSERTION AVEC TOTAL_HOURS' as info;

-- Note: Adaptez cette requête selon vos colonnes existantes
-- Remplacez les colonnes par celles qui existent réellement dans votre table
/*
INSERT INTO machines (
    name, 
    brand, 
    model, 
    category, 
    year, 
    price, 
    total_hours,  -- ← NOUVEAU CHAMP
    description
    -- Ajoutez d'autres colonnes selon votre structure
) VALUES (
    'Test Machine - Pelle hydraulique',
    'Caterpillar',
    '320D',
    'Pelles hydrauliques',
    2020,
    150000,
    2500,  -- ← VALEUR DU NOUVEAU CHAMP
    'Machine de test avec heures d''utilisation'
    -- Ajoutez d'autres valeurs selon votre structure
) RETURNING id, name, total_hours;
*/ 