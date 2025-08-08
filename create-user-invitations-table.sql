-- Script de création de la table user_invitations
-- Cette table stocke les invitations d'utilisateurs pour le portail Pro

CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'technician', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_invitations_updated_at 
    BEFORE UPDATE ON user_invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux administrateurs de voir toutes les invitations
CREATE POLICY "Les administrateurs peuvent voir toutes les invitations" ON user_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Politique pour permettre aux utilisateurs invités de voir leurs propres invitations
CREATE POLICY "Les utilisateurs peuvent voir leurs invitations" ON user_invitations
  FOR SELECT USING (email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Politique pour permettre aux administrateurs de créer des invitations
CREATE POLICY "Les administrateurs peuvent créer des invitations" ON user_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Politique pour permettre aux administrateurs de mettre à jour les invitations
CREATE POLICY "Les administrateurs peuvent mettre à jour les invitations" ON user_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Politique pour permettre aux administrateurs de supprimer les invitations
CREATE POLICY "Les administrateurs peuvent supprimer les invitations" ON user_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Fonction pour nettoyer automatiquement les invitations expirées
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Créer un job pour nettoyer les invitations expirées (optionnel)
-- Cette fonction peut être appelée périodiquement par un cron job

COMMENT ON TABLE user_invitations IS 'Table pour stocker les invitations d''utilisateurs du portail Pro';
COMMENT ON COLUMN user_invitations.email IS 'Email de l''utilisateur invité';
COMMENT ON COLUMN user_invitations.role IS 'Rôle attribué à l''utilisateur invité';
COMMENT ON COLUMN user_invitations.invited_by IS 'ID de l''utilisateur qui a créé l''invitation';
COMMENT ON COLUMN user_invitations.status IS 'Statut de l''invitation: pending, accepted, expired, cancelled';
COMMENT ON COLUMN user_invitations.expires_at IS 'Date d''expiration de l''invitation';
COMMENT ON COLUMN user_invitations.accepted_at IS 'Date d''acceptation de l''invitation';
COMMENT ON COLUMN user_invitations.accepted_by IS 'ID de l''utilisateur qui a accepté l''invitation'; 