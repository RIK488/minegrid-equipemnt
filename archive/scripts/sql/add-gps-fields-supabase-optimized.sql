-- =====================================================
-- AJOUT DES CHAMPS GPS OPTIMISÉ POUR SUPABASE
-- =====================================================

-- Étape 1: Vérifier les extensions disponibles
SELECT 'VÉRIFICATION DES EXTENSIONS' as info;

SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('postgis', 'earthdistance', 'cube');

-- Étape 2: Ajouter les champs GPS de manière sûre
DO $$
BEGIN
    -- Ajouter latitude avec validation
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

    -- Ajouter longitude avec validation
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

    -- Ajouter les champs d'adresse
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

-- Étape 3: Créer des index optimisés pour Supabase
DO $$
BEGIN
    -- Index simple sur latitude et longitude
    CREATE INDEX IF NOT EXISTS idx_machines_lat_lng ON machines (latitude, longitude);
    RAISE NOTICE '✅ Index lat/lng créé';

    -- Index sur city pour les recherches par ville
    CREATE INDEX IF NOT EXISTS idx_machines_city ON machines (city);
    RAISE NOTICE '✅ Index city créé';

    -- Index sur country pour les recherches par pays
    CREATE INDEX IF NOT EXISTS idx_machines_country ON machines (country);
    RAISE NOTICE '✅ Index country créé';

    -- Index composite pour les recherches géographiques
    CREATE INDEX IF NOT EXISTS idx_machines_location_composite ON machines (latitude, longitude, city, country);
    RAISE NOTICE '✅ Index composite créé';
END $$;

-- Étape 4: Fonction de calcul de distance optimisée pour Supabase
CREATE OR REPLACE FUNCTION calculate_distance_simple(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- Formule de Haversine simplifiée (plus rapide que earth_distance)
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lng2) - radians(lng1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Étape 5: Fonction pour rechercher les machines dans un rayon
CREATE OR REPLACE FUNCTION find_machines_in_radius(
    center_lat DECIMAL,
    center_lng DECIMAL,
    radius_km DECIMAL DEFAULT 50
) RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    model TEXT,
    price DECIMAL,
    latitude DECIMAL,
    longitude DECIMAL,
    address TEXT,
    city TEXT,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.brand,
        m.model,
        m.price,
        m.latitude,
        m.longitude,
        m.address,
        m.city,
        calculate_distance_simple(center_lat, center_lng, m.latitude, m.longitude) as distance_km
    FROM machines m
    WHERE 
        m.latitude IS NOT NULL 
        AND m.longitude IS NOT NULL
        AND calculate_distance_simple(center_lat, center_lng, m.latitude, m.longitude) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- Étape 6: Vérifier la structure finale
SELECT 
    'STRUCTURE FINALE' as info;

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

-- Étape 7: Test d'insertion avec les nouveaux champs
SELECT 'TEST D''INSERTION SUPABASE' as info;

-- Exemple d'insertion optimisé pour Supabase
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
    postal_code,
    seller_id
) VALUES (
    'Test Machine Supabase',
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
    'test-user-id'
) RETURNING id, name, latitude, longitude, address;
*/

-- Étape 8: Test de la fonction de recherche par rayon
SELECT 'TEST FONCTION RECHERCHE' as info;

-- Exemple d'utilisation (décommentez pour tester)
/*
SELECT * FROM find_machines_in_radius(33.5731, -7.5898, 100);
*/ 