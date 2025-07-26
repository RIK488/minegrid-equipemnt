-- =====================================================
-- SCRIPT SQL CORRIGÉ - SANS CONFLITS
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- Étape 1: Vérification des tables existantes
-- =====================================================

SELECT 'VÉRIFICATION DES TABLES EXISTANTES' as info;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('machine_views', 'profiles', 'messages', 'offers') 
    THEN '✅ EXISTE' 
    ELSE '❌ MANQUANTE' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('machine_views', 'profiles', 'messages', 'offers');

-- Étape 2: Création des tables manquantes (seulement si elles n'existent pas)
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

-- Étape 3: Activation de RLS (Row Level Security) - seulement si pas déjà activé
-- =====================================================

DO $$
BEGIN
  -- Activer RLS pour machine_views si pas déjà activé
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'machine_views' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Activer RLS pour profiles si pas déjà activé
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Activer RLS pour messages si pas déjà activé
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'messages' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Activer RLS pour offers si pas déjà activé
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'offers' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Étape 4: Création des politiques RLS (seulement si elles n'existent pas)
-- =====================================================

-- Politique pour machine_views
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machine_views' 
    AND policyname = 'Enable all access for authenticated users'
  ) THEN
    CREATE POLICY "Enable all access for authenticated users" ON machine_views
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Politique pour profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Enable all access for authenticated users'
  ) THEN
    CREATE POLICY "Enable all access for authenticated users" ON profiles
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Politique pour messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Enable all access for authenticated users'
  ) THEN
    CREATE POLICY "Enable all access for authenticated users" ON messages
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Politique pour offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'offers' 
    AND policyname = 'Enable all access for authenticated users'
  ) THEN
    CREATE POLICY "Enable all access for authenticated users" ON offers
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Étape 5: Insertion de données de test (seulement si pas déjà présent)
-- =====================================================

-- Créer un profil de test pour l'utilisateur actuel
INSERT INTO profiles (id, firstName, lastName, email, role)
VALUES (
  'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
  'Test',
  'User',
  'test@example.com',
  'seller'
)
ON CONFLICT (id) DO NOTHING;

-- Étape 6: Vérification finale
-- =====================================================

SELECT 'VÉRIFICATION FINALE' as info;

-- Vérifier que toutes les tables existent
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('machine_views', 'profiles', 'messages', 'offers') 
    THEN '✅ CRÉÉE' 
    ELSE '❌ MANQUANTE' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('machine_views', 'profiles', 'messages', 'offers');

-- Vérifier les politiques RLS
SELECT 
  tablename,
  policyname,
  '✅ POLITIQUE CRÉÉE' as status
FROM pg_policies 
WHERE tablename IN ('machine_views', 'profiles', 'messages', 'offers')
  AND policyname = 'Enable all access for authenticated users';

-- =====================================================
-- FIN DU SCRIPT
-- ===================================================== 