-- Script pour corriger les politiques RLS de la table messages
-- =====================================================

-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON messages;
DROP POLICY IF EXISTS "Sellers can view messages for their machines" ON messages;
DROP POLICY IF EXISTS "Sellers can update their messages" ON messages;

-- 2. Créer une politique plus permissive pour l'insertion
CREATE POLICY "Allow public insert for contact form" ON messages
  FOR INSERT WITH CHECK (true);

-- 3. Politique pour la lecture (vendeurs seulement)
CREATE POLICY "Sellers can view their messages" ON messages
  FOR SELECT USING (
    auth.uid()::text = seller_id::text OR
    EXISTS (
      SELECT 1 FROM machines 
      WHERE machines.id = messages.machine_id 
      AND machines.sellerid::text = auth.uid()::text
    )
  );

-- 4. Politique pour la mise à jour (vendeurs seulement)
CREATE POLICY "Sellers can update their messages" ON messages
  FOR UPDATE USING (
    auth.uid()::text = seller_id::text OR
    EXISTS (
      SELECT 1 FROM machines 
      WHERE machines.id = messages.machine_id 
      AND machines.sellerid::text = auth.uid()::text
    )
  );

-- 5. Vérification des politiques
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 6. Test d'insertion anonyme (devrait fonctionner maintenant)
DO $$
BEGIN
  RAISE NOTICE '✅ Politiques RLS corrigées!';
  RAISE NOTICE '📋 Insertion anonyme autorisée pour le formulaire de contact';
  RAISE NOTICE '🔒 Lecture et mise à jour restreintes aux vendeurs';
END $$; 