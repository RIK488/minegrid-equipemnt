-- Script pour corriger la table messages pour le formulaire de contact
-- =====================================================

-- 1. Supprimer l'ancienne table messages
DROP TABLE IF EXISTS messages CASCADE;

-- 2. Créer la nouvelle table messages avec la bonne structure
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'sent', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_messages_seller_id ON messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_machine_id ON messages(machine_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 4. Activer RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
-- Permettre à tous les utilisateurs d'insérer des messages (formulaire de contact)
CREATE POLICY "Anyone can insert contact messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Permettre aux vendeurs de voir les messages reçus
CREATE POLICY "Sellers can view messages for their machines" ON messages
  FOR SELECT USING (
    auth.uid()::text = seller_id::text OR
    EXISTS (
      SELECT 1 FROM machines 
      WHERE machines.id = messages.machine_id 
      AND machines.sellerid::text = auth.uid()::text
    )
  );

-- Permettre aux vendeurs de mettre à jour le statut de leurs messages
CREATE POLICY "Sellers can update their messages" ON messages
  FOR UPDATE USING (
    auth.uid()::text = seller_id::text OR
    EXISTS (
      SELECT 1 FROM machines 
      WHERE machines.id = messages.machine_id 
      AND machines.sellerid::text = auth.uid()::text
    )
  );

-- 6. Insérer des données de test
INSERT INTO messages (sender_name, sender_email, sender_phone, message, machine_id, seller_id, status) VALUES 
('Test User', 'test@example.com', '+212123456789', 'Je suis intéressé par cette machine', 
 (SELECT id FROM machines LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1), 
 'new')
ON CONFLICT DO NOTHING;

-- 7. Vérification
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

DO $$
BEGIN
  RAISE NOTICE '✅ Table messages corrigée avec succès!';
  RAISE NOTICE '📋 Structure adaptée au formulaire de contact';
  RAISE NOTICE '🔒 Politiques RLS configurées';
  RAISE NOTICE '📊 Données de test insérées';
END $$; 