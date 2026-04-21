-- Création de la table notifications pour les notifications internes
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- RLS (Row Level Security) pour les notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_email = current_user);

-- Politique pour permettre aux utilisateurs de marquer leurs notifications comme lues
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_email = current_user);

-- Politique pour permettre l'insertion de notifications (utilisée par l'application)
CREATE POLICY "Allow insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Fonction pour marquer automatiquement les notifications comme lues
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET read = TRUE, updated_at = NOW()
  WHERE id = notification_id AND user_email = current_user;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE notifications IS 'Table pour les notifications internes des utilisateurs';
COMMENT ON COLUMN notifications.user_email IS 'Email de l''utilisateur destinataire';
COMMENT ON COLUMN notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN notifications.message IS 'Message de la notification';
COMMENT ON COLUMN notifications.type IS 'Type de notification (info, warning, error, message_reply, etc.)';
COMMENT ON COLUMN notifications.data IS 'Données supplémentaires en JSON';
COMMENT ON COLUMN notifications.read IS 'Si la notification a été lue'; 