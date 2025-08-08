-- =====================================================
-- AJOUT DES CHAMPS GPS À LA TABLE MACHINES
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- Étape 1: Ajouter les champs de coordonnées GPS
DO $$
BEGIN
    -- Ajouter latitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'latitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE machines ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE '✅ Champ latitude ajouté';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ latitude existe déjà';
    END IF;

    -- Ajouter longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'longitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE machines ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE '✅ Champ longitude ajouté';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ longitude existe déjà';
    END IF;

    -- Ajouter address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'address'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE machines ADD COLUMN address TEXT;
        RAISE NOTICE '✅ Champ address ajouté';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ address existe déjà';
    END IF;

    -- Ajouter city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'city'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE machines ADD COLUMN city TEXT;
        RAISE NOTICE '✅ Champ city ajouté';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ city existe déjà';
    END IF;

    -- Ajouter country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'country'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE machines ADD COLUMN country TEXT;
        RAISE NOTICE '✅ Champ country ajouté';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ country existe déjà';
    END IF;

    -- Ajouter postal_code
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'machines' 
        AND column_name = 'postal_code'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE machines ADD COLUMN postal_code TEXT;
        RAISE NOTICE '✅ Champ postal_code ajouté';
    ELSE
        RAISE NOTICE 'ℹ️ Le champ postal_code existe déjà';
    END IF;
END $$;

-- Étape 2: Vérifier la structure mise à jour
SELECT 
    'STRUCTURE MISE À JOUR' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'machines' 
  AND table_schema = 'public'
  AND column_name IN ('latitude', 'longitude', 'address', 'city', 'country', 'postal_code')
ORDER BY column_name;

-- Étape 3: Créer un index géospatial (optionnel - nécessite l'extension earthdistance)
-- Note: Cette étape peut nécessiter des permissions spéciales
DO $$
BEGIN
    -- Vérifier si l'extension earthdistance est disponible
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'earthdistance'
    ) THEN
        -- Créer un index géospatial pour optimiser les recherches
        CREATE INDEX IF NOT EXISTS idx_machines_location ON machines USING GIST (
            ll_to_earth(latitude, longitude)
        );
        RAISE NOTICE '✅ Index géospatial créé';
    ELSE
        RAISE NOTICE '⚠️ Extension earthdistance non disponible - index géospatial non créé';
    END IF;
END $$;

-- Étape 4: Fonction pour calculer la distance (optionnel)
DO $$
BEGIN
    -- Vérifier si l'extension earthdistance est disponible
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'earthdistance'
    ) THEN
        -- Créer une fonction pour calculer la distance entre deux points
        CREATE OR REPLACE FUNCTION calculate_distance(
            lat1 DECIMAL, lng1 DECIMAL, 
            lat2 DECIMAL, lng2 DECIMAL
        ) RETURNS DECIMAL AS $$
        BEGIN
            RETURN earth_distance(
                ll_to_earth(lat1, lng1),
                ll_to_earth(lat2, lng2)
            ) / 1000; -- Retourne la distance en kilomètres
        END;
        $$ LANGUAGE plpgsql;
        RAISE NOTICE '✅ Fonction calculate_distance créée';
    ELSE
        RAISE NOTICE '⚠️ Extension earthdistance non disponible - fonction calculate_distance non créée';
    END IF;
END $$;

-- Étape 5: Test d'insertion avec les nouveaux champs
SELECT 'TEST D''INSERTION AVEC GPS' as info;

-- Exemple d'insertion avec coordonnées GPS
/*
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
    postal_code
) VALUES (
    'Test Machine avec GPS',
    'Caterpillar',
    '320D',
    'Pelles hydrauliques',
    2020,
    150000,
    2500,
    33.5731,  -- Latitude Casablanca
    -7.5898,  -- Longitude Casablanca
    '123 Rue Mohammed V, Casablanca',
    'Casablanca',
    'Maroc',
    '20000'
) RETURNING id, name, latitude, longitude, address;
*/ 