-- =====================================================
-- SCRIPT SQL FINAL COMPLET - CORRECTION ERREURS 404/500
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

-- Table profiles (pour les profils utilisateur)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table messages (pour les messages entre utilisateurs)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table offers (pour les offres d'achat)
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Étape 2: Activation de RLS (Row Level Security)
-- =====================================================

ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Étape 3: Création des politiques RLS
-- =====================================================

-- Politiques pour machine_views
CREATE POLICY "Enable read access for authenticated users" ON machine_views
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable insert for authenticated users" ON machine_views
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour messages
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Politiques pour offers
CREATE POLICY "Users can view offers they made or received" ON offers
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  
CREATE POLICY "Users can make offers" ON offers
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Étape 4: Insertion de données de test
-- =====================================================

-- Profil de test pour éviter les erreurs 404
INSERT INTO profiles (id, firstName, lastName, email, role)
VALUES (
  'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
  'Test',
  'User',
  'test@example.com',
  'seller'
)
ON CONFLICT (id) DO NOTHING;

-- Étape 5: Vérification
-- =====================================================

-- Vérifier que les tables ont été créées
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('machine_views', 'profiles', 'messages', 'offers') 
    THEN '✅ Créée' 
    ELSE '❌ Manquante' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('machine_views', 'profiles', 'messages', 'offers');

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
  AND tablename IN ('machine_views', 'profiles', 'messages', 'offers');

-- Message de confirmation
SELECT '🎉 CORRECTION TERMINÉE AVEC SUCCÈS !' as message;
SELECT '📝 Prochaines étapes :' as next_steps;
SELECT '   1. Rechargez votre application' as step1;
SELECT '   2. Les erreurs 404/500 devraient disparaître' as step2;
SELECT '   3. Les widgets devraient fonctionner correctement' as step3; 