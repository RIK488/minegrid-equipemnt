-- Script pour corriger les politiques RLS de la table client_equipment
-- Permet aux utilisateurs de modifier, insérer et supprimer leurs équipements

-- Politique pour permettre l'INSERT d'équipements
CREATE POLICY "Client users can insert equipment" ON client_equipment
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Politique pour permettre l'UPDATE d'équipements
CREATE POLICY "Client users can update equipment" ON client_equipment
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Politique pour permettre le DELETE d'équipements
CREATE POLICY "Client users can delete equipment" ON client_equipment
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Vérification des politiques existantes
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
WHERE tablename = 'client_equipment'
ORDER BY policyname; 