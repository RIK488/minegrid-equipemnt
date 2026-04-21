-- =====================================================
-- CRÉATION DES TABLES POUR LE SYSTÈME DE VENTE
-- =====================================================

-- Table des profils utilisateur (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'vendeur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ventes
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  description TEXT,
  customer_name TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prospects
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'qualified', 'converted', 'lost')),
  value DECIMAL(12,2),
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  stage TEXT DEFAULT 'prospection' CHECK (stage IN ('prospection', 'qualification', 'proposition', 'negociation', 'cloture')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des objectifs utilisateur
CREATE TABLE IF NOT EXISTS user_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  sales_target DECIMAL(12,2) DEFAULT 3000000,
  prospects_target INTEGER DEFAULT 10,
  response_time_target DECIMAL(4,2) DEFAULT 1.5,
  growth_target DECIMAL(5,2) DEFAULT 15.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Table des interactions prospects
CREATE TABLE IF NOT EXISTS prospect_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  interaction_type TEXT DEFAULT 'contact' CHECK (interaction_type IN ('contact', 'meeting', 'proposal', 'follow_up')),
  response_time DECIMAL(4,2), -- en heures
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les profils
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Index pour les ventes
CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Index pour les prospects
CREATE INDEX IF NOT EXISTS idx_prospects_seller_id ON prospects(seller_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_stage ON prospects(stage);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects(created_at);

-- Index pour les objectifs
CREATE INDEX IF NOT EXISTS idx_user_targets_user_id ON user_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_targets_period ON user_targets(period);

-- Index pour les interactions
CREATE INDEX IF NOT EXISTS idx_prospect_interactions_seller_id ON prospect_interactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_prospect_interactions_prospect_id ON prospect_interactions(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_interactions_created_at ON prospect_interactions(created_at);

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Politiques pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (auth.uid() = seller_id);

-- Politiques pour prospects
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prospects" ON prospects
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own prospects" ON prospects
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own prospects" ON prospects
  FOR UPDATE USING (auth.uid() = seller_id);

-- Politiques pour user_targets
ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own targets" ON user_targets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own targets" ON user_targets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own targets" ON user_targets
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour prospect_interactions
ALTER TABLE prospect_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON prospect_interactions
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own interactions" ON prospect_interactions
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own interactions" ON prospect_interactions
  FOR UPDATE USING (auth.uid() = seller_id);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_targets_updated_at
  BEFORE UPDATE ON user_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'vendeur'
  );
  
  -- Créer des objectifs par défaut
  INSERT INTO user_targets (user_id, period, sales_target, prospects_target, response_time_target, growth_target)
  VALUES (
    NEW.id,
    'monthly',
    3000000,
    10,
    1.5,
    15.0
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer automatiquement le profil et les objectifs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques vendeurs de test si la table est vide
INSERT INTO profiles (id, full_name, role, company_name)
SELECT 
  gen_random_uuid(),
  'Vendeur Test ' || i,
  'vendeur',
  'Entreprise Test ' || i
FROM generate_series(1, 5) i
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'vendeur');

-- Insérer quelques ventes de test
INSERT INTO sales (seller_id, amount, description, customer_name)
SELECT 
  p.id,
  (random() * 1000000 + 500000)::DECIMAL(12,2),
  'Vente test ' || i,
  'Client Test ' || i
FROM profiles p, generate_series(1, 3) i
WHERE p.role = 'vendeur'
AND NOT EXISTS (SELECT 1 FROM sales LIMIT 1);

-- Insérer quelques prospects de test
INSERT INTO prospects (seller_id, company_name, contact_name, value, probability, stage)
SELECT 
  p.id,
  'Prospect Test ' || i,
  'Contact ' || i,
  (random() * 500000 + 100000)::DECIMAL(12,2),
  (random() * 80 + 10)::INTEGER,
  (ARRAY['prospection', 'qualification', 'proposition', 'negociation'])[floor(random() * 4 + 1)]
FROM profiles p, generate_series(1, 2) i
WHERE p.role = 'vendeur'
AND NOT EXISTS (SELECT 1 FROM prospects LIMIT 1); 