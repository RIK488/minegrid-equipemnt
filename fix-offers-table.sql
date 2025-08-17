-- Correction de la table offers pour la nouvelle structure
-- Suppression des anciennes colonnes et ajout des nouvelles

-- 1. Supprimer les anciennes colonnes si elles existent
ALTER TABLE offers DROP COLUMN IF EXISTS buyer_id;
ALTER TABLE offers DROP COLUMN IF EXISTS seller_id;
ALTER TABLE offers DROP COLUMN IF EXISTS is_read;

-- 2. Ajouter les nouvelles colonnes si elles n'existent pas
ALTER TABLE offers ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 3. Mettre à jour les politiques RLS
DROP POLICY IF EXISTS "Users can view their own offers" ON offers;
DROP POLICY IF EXISTS "Users can update their own offers" ON offers;
DROP POLICY IF EXISTS "Allow insert offers" ON offers;

-- Politique pour permettre aux utilisateurs de voir leurs propres offres
CREATE POLICY "Users can view their own offers" ON offers
  FOR SELECT USING (
    buyer_email = current_user OR 
    seller_email = current_user
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres offres
CREATE POLICY "Users can update their own offers" ON offers
  FOR UPDATE USING (
    buyer_email = current_user OR 
    seller_email = current_user
  );

-- Politique pour permettre l'insertion d'offres
CREATE POLICY "Allow insert offers" ON offers
  FOR INSERT WITH CHECK (true);

-- 4. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_offers_buyer_email ON offers(buyer_email);
CREATE INDEX IF NOT EXISTS idx_offers_seller_email ON offers(seller_email);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at);

-- 5. Commentaires
COMMENT ON TABLE offers IS 'Table pour les offres d''achat d''équipements';
COMMENT ON COLUMN offers.buyer_email IS 'Email de l''acheteur';
COMMENT ON COLUMN offers.buyer_name IS 'Nom de l''acheteur';
COMMENT ON COLUMN offers.seller_email IS 'Email du vendeur';
COMMENT ON COLUMN offers.seller_name IS 'Nom du vendeur';
COMMENT ON COLUMN offers.subject IS 'Sujet de l''offre';
COMMENT ON COLUMN offers.message IS 'Message de l''offre';
COMMENT ON COLUMN offers.amount IS 'Montant de l''offre';
COMMENT ON COLUMN offers.currency IS 'Devise de l''offre';
COMMENT ON COLUMN offers.status IS 'Statut de l''offre (pending, accepted, rejected, cancelled)';
COMMENT ON COLUMN offers.sent_at IS 'Date d''envoi de l''offre';
COMMENT ON COLUMN offers.error_message IS 'Message d''erreur en cas d''échec';

-- 6. Vérification de la structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'offers' 
ORDER BY ordinal_position; 