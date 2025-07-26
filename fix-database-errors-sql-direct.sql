-- =====================================================
-- SCRIPT SQL COMPLET POUR CORRIGER LES ERREURS 404/500
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- Étape 1: Création des tables manquantes
-- =====================================================

-- Table machine_views (pour les statistiques de vues)
CREATE TABLE IF NOT EXISTS machine_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table messages (pour les messages entre utilisateurs)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  response_time DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table offers (pour les offres d'achat)
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table profiles (pour les profils utilisateur)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'vendeur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Étape 2: Création des index pour les performances
-- =====================================================

-- Index pour machine_views
CREATE INDEX IF NOT EXISTS idx_machine_views_machine_id ON machine_views(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_views_created_at ON machine_views(created_at);
CREATE INDEX IF NOT EXISTS idx_machine_views_viewer_id ON machine_views(viewer_id);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Index pour offers
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_machine_id ON offers(machine_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at);

-- Index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Étape 3: Configuration des politiques RLS (Row Level Security)
-- =====================================================

-- Politiques pour machine_views
ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own machine views" ON machine_views;
CREATE POLICY "Users can view their own machine views" ON machine_views
  FOR SELECT USING (
    machine_id IN (
      SELECT id FROM machines WHERE sellerId = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert machine views" ON machine_views;
CREATE POLICY "Anyone can insert machine views" ON machine_views
  FOR INSERT WITH CHECK (true);

-- Politiques pour messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update messages they received" ON messages;
CREATE POLICY "Users can update messages they received" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- Politiques pour offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view offers they made or received" ON offers;
CREATE POLICY "Users can view offers they made or received" ON offers
  FOR SELECT USING (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert offers" ON offers;
CREATE POLICY "Users can insert offers" ON offers
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update offers they made" ON offers;
CREATE POLICY "Users can update offers they made" ON offers
  FOR UPDATE USING (buyer_id = auth.uid());

-- Politiques pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Étape 4: Insertion de données de test (optionnel)
-- =====================================================

-- Insérer quelques vues de test si des machines existent
INSERT INTO machine_views (machine_id, ip_address, user_agent, created_at)
SELECT 
  id,
  '127.0.0.1',
  'Test Browser',
  NOW() - INTERVAL '1 day'
FROM machines 
LIMIT 3
ON CONFLICT DO NOTHING;

-- Étape 5: Vérification
-- =====================================================

-- Vérifier que les tables ont été créées
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('machine_views', 'messages', 'offers', 'profiles') 
    THEN '✅ Créée' 
    ELSE '❌ Manquante' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('machine_views', 'messages', 'offers', 'profiles');

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('machine_views', 'messages', 'offers', 'profiles');

-- Vérifier les index
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('machine_views', 'messages', 'offers', 'profiles');

-- Afficher un message de succès
SELECT '🎉 Correction terminée avec succès ! Veuillez recharger votre application.' as message; 