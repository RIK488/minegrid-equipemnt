-- =====================================================
-- TABLE DES PROFILS UTILISATEUR (DÉPENDANCE)
-- =====================================================

-- Création de la table des profils publics
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT
);

-- Politiques de sécurité pour les profils
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur (trigger) qui appelle la fonction après chaque nouvelle inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =====================================================
-- TABLES POUR LE TABLEAU DE BORD ENTREPRISE
-- =====================================================

-- Table des interventions (pour widget "Interventions du jour")
CREATE TABLE IF NOT EXISTS interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    equipment_id UUID REFERENCES machines(id),
    equipment_name VARCHAR(255) NOT NULL,
    technician_id UUID REFERENCES user_profiles(id),
    technician_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'En attente' CHECK (status IN ('En attente', 'En cours', 'Terminé', 'Annulé')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Basse', 'Normal', 'Haute', 'Urgente')),
    description TEXT,
    estimated_duration INTEGER, -- en heures
    actual_duration INTEGER, -- en heures
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table des réparations (pour widget "État des réparations")
CREATE TABLE IF NOT EXISTS repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipment_id UUID REFERENCES machines(id),
    equipment_name VARCHAR(255) NOT NULL,
    technician_id UUID REFERENCES user_profiles(id),
    technician_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'En attente' CHECK (status IN ('En attente', 'Diagnostic', 'En cours', 'En attente pièces', 'Terminé')),
    problem_description TEXT NOT NULL,
    solution_description TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    estimated_duration INTEGER, -- en heures
    actual_duration INTEGER, -- en heures
    start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table du stock (pour widget "Stock pièces détachées")
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    unit_price DECIMAL(10,2),
    supplier VARCHAR(255),
    location VARCHAR(100),
    last_restock_date TIMESTAMP WITH TIME ZONE,
    next_restock_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des techniciens (pour widget "Charge de travail")
CREATE TABLE IF NOT EXISTS technicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    experience_years INTEGER,
    hourly_rate DECIMAL(8,2),
    availability_status VARCHAR(20) DEFAULT 'Disponible' CHECK (availability_status IN ('Disponible', 'Occupé', 'En congé', 'Maladie')),
    max_workload_hours INTEGER DEFAULT 40,
    current_workload_hours INTEGER DEFAULT 0,
    efficiency_rating DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tâches (pour widget "Charge de travail")
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technician_id UUID REFERENCES technicians(id),
    intervention_id UUID REFERENCES interventions(id),
    repair_id UUID REFERENCES repairs(id),
    status VARCHAR(50) DEFAULT 'À faire' CHECK (status IN ('À faire', 'En cours', 'Terminé', 'Annulé')),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Basse', 'Normal', 'Haute', 'Urgente')),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    start_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table des commandes de stock
CREATE TABLE IF NOT EXISTS stock_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES inventory(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    supplier VARCHAR(255),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'En attente' CHECK (status IN ('En attente', 'Commandé', 'En transit', 'Livré', 'Annulé')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- POLITIQUES RLS (Row Level Security) - CORRIGÉES
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_orders ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques de sélection pour les remplacer
DROP POLICY IF EXISTS "Users can view own interventions" ON interventions;
DROP POLICY IF EXISTS "Users can view own repairs" ON repairs;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own stock orders" ON stock_orders;

-- Politiques pour interventions (CORRIGÉ : Tout utilisateur connecté peut voir)
CREATE POLICY "Authenticated users can view interventions" ON interventions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own interventions" ON interventions
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own interventions" ON interventions
    FOR UPDATE USING (created_by = auth.uid());

-- Politiques pour repairs (CORRIGÉ : Tout utilisateur connecté peut voir)
CREATE POLICY "Authenticated users can view repairs" ON repairs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own repairs" ON repairs
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own repairs" ON repairs
    FOR UPDATE USING (created_by = auth.uid());

-- Politiques pour inventory (inchangé)
CREATE POLICY "Authenticated users can view inventory" ON inventory
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update inventory" ON inventory
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour technicians (inchangé)
CREATE POLICY "Users can view technicians" ON technicians
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own technician profile" ON technicians
    FOR UPDATE USING (user_id = auth.uid());

-- Politiques pour tasks (CORRIGÉ : Tout utilisateur connecté peut voir)
CREATE POLICY "Authenticated users can view tasks" ON tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (created_by = auth.uid());

-- Politiques pour stock_orders (CORRIGÉ : Tout utilisateur connecté peut voir)
CREATE POLICY "Authenticated users can view stock orders" ON stock_orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own stock orders" ON stock_orders
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own stock orders" ON stock_orders
    FOR UPDATE USING (created_by = auth.uid());

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_orders_updated_at BEFORE UPDATE ON stock_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer des données de test pour les interventions
INSERT INTO interventions (name, equipment_name, technician_name, status, priority, description, estimated_duration, scheduled_date) VALUES
('Révision 500h', 'Bouteur CAT D9', 'Jean Dupont', 'Terminé', 'Normal', 'Révision complète moteur et transmission', 8, NOW() - INTERVAL '2 days'),
('Changer filtre à huile', 'Pelle Komatsu PC200', 'Marie Martin', 'Terminé', 'Normal', 'Remplacement filtre à huile moteur', 2, NOW() - INTERVAL '1 day'),
('Réparation circuit hydraulique', 'Grue mobile Liebherr', 'Pierre Durand', 'En cours', 'Haute', 'Fuite dans le circuit hydraulique principal', 6, NOW()),
('Maintenance préventive', 'Niveleuse John Deere', 'Sophie Bernard', 'En attente', 'Normal', 'Maintenance préventive 1000h', 4, NOW() + INTERVAL '1 day'),
('Changement de pneus', 'Chargeuse Volvo L150', 'Lucas Moreau', 'En attente', 'Basse', 'Remplacement des 4 pneus usés', 3, NOW() + INTERVAL '2 days');

-- Insérer des données de test pour les réparations
INSERT INTO repairs (equipment_name, technician_name, status, problem_description, estimated_cost, estimated_duration) VALUES
('Excavatrice Hitachi', 'Jean Dupont', 'En cours', 'Panne moteur - diagnostic en cours', 5000.00, 12),
('Bulldozer Komatsu', 'Marie Martin', 'En attente pièces', 'Rupture de chenille - pièces commandées', 3000.00, 8),
('Chargeuse CAT', 'Pierre Durand', 'Terminé', 'Problème électrique - résolu', 1200.00, 4),
('Grue mobile', 'Sophie Bernard', 'Diagnostic', 'Bruit anormal dans la cabine', 800.00, 6);

-- Insérer des données de test pour l'inventaire
INSERT INTO inventory (part_name, part_number, category, current_stock, minimum_stock, unit_price, supplier) VALUES
('Filtre à huile moteur', 'FIL-001', 'Filtres', 15, 10, 25.50, 'Filtres Pro'),
('Filtre à air', 'FIL-002', 'Filtres', 8, 15, 45.00, 'Filtres Pro'),
('Huile moteur 15W40', 'OIL-001', 'Lubrifiants', 50, 20, 12.80, 'Lubrifiants Express'),
('Plaquettes de frein', 'BRAKE-001', 'Freinage', 5, 8, 85.00, 'Freins Plus'),
('Courroie de distribution', 'BELT-001', 'Transmission', 3, 5, 120.00, 'Transmission Pro'),
('Joint d''étanchéité', 'SEAL-001', 'Étanchéité', 25, 10, 8.50, 'Étanchéité Plus');

-- Insérer des données de test pour les techniciens
INSERT INTO technicians (name, specialization, experience_years, hourly_rate, availability_status, max_workload_hours, current_workload_hours, efficiency_rating) VALUES
('Jean Dupont', 'Moteurs', 8, 35.00, 'Disponible', 40, 32, 0.95),
('Marie Martin', 'Hydraulique', 5, 30.00, 'Occupé', 40, 38, 0.88),
('Pierre Durand', 'Électricité', 10, 40.00, 'Disponible', 40, 25, 0.92),
('Sophie Bernard', 'Transmission', 6, 32.00, 'Disponible', 40, 28, 0.90),
('Lucas Moreau', 'Général', 3, 25.00, 'Disponible', 40, 20, 0.85);

-- Insérer des données de test pour les tâches
INSERT INTO tasks (title, description, technician_id, status, priority, estimated_hours, due_date) VALUES
('Diagnostic moteur', 'Diagnostic complet du moteur CAT D9', (SELECT id FROM technicians WHERE name = 'Jean Dupont'), 'En cours', 'Haute', 4, NOW() + INTERVAL '1 day'),
('Réparation hydraulique', 'Réparation fuite circuit hydraulique', (SELECT id FROM technicians WHERE name = 'Marie Martin'), 'En cours', 'Haute', 6, NOW() + INTERVAL '2 days'),
('Maintenance préventive', 'Maintenance 1000h niveleuse', (SELECT id FROM technicians WHERE name = 'Pierre Durand'), 'À faire', 'Normal', 4, NOW() + INTERVAL '3 days'),
('Changement pneus', 'Remplacement pneus chargeuse', (SELECT id FROM technicians WHERE name = 'Sophie Bernard'), 'À faire', 'Basse', 3, NOW() + INTERVAL '4 days');

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX idx_interventions_status ON interventions(status);
CREATE INDEX idx_interventions_date ON interventions(scheduled_date);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_stock ON inventory(current_stock, minimum_stock);
CREATE INDEX idx_tasks_technician ON tasks(technician_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- =================================================================
-- SCHÉMA POUR LE MÉTIER: LOUEUR D'ENGINS
-- =================================================================

-- Table pour stocker les locations d'équipements
CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    client_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmée', -- ex: 'Confirmée', 'En cours', 'Terminée', 'Annulée'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE rentals IS 'Enregistre les contrats de location d''équipements.';

-- Activer RLS
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour la table rentals
CREATE POLICY "Les utilisateurs peuvent voir les locations"
ON rentals
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Les utilisateurs peuvent créer des locations"
ON rentals
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Données de test pour les locations
INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() - '1 day'::interval,
    NOW() + '1 month'::interval,
    5000.00,
    'En cours',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u WHERE m.name = 'Pelle hydraulique CAT 320D' AND u.full_name = 'Test User' LIMIT 1;

INSERT INTO rentals (equipment_id, client_id, start_date, end_date, total_price, status, created_by)
SELECT 
    m.id,
    u.id,
    NOW() + '2 day'::interval,
    NOW() + '1 week'::interval,
    1500.00,
    'Confirmée',
    (SELECT id FROM auth.users LIMIT 1)
FROM machines m, user_profiles u WHERE m.name = 'Chargeuse sur pneus' AND u.full_name = 'Test User' LIMIT 1; 