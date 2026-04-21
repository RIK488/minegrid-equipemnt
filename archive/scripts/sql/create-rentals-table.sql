-- Création de la table rentals pour les locations d'équipements
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    client_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmée',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Activer RLS
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour la table rentals
CREATE POLICY "Les utilisateurs peuvent voir les locations"
ON rentals
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Les utilisateurs peuvent créer des locations"
ON rentals
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Les utilisateurs peuvent modifier leurs locations"
ON rentals
FOR UPDATE USING (auth.uid() = created_by);

-- Insérer des données de test
INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() - '1 day'::interval,
    NOW() + '1 month'::interval,
    5000.00,
    'En cours',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u 
WHERE m.name LIKE '%Pelle%' AND u.full_name IS NOT NULL 
LIMIT 1; 