-- =====================================================
-- SCHÉMA SUPABASE POUR LE DASHBOARD FONCTIONNEL
-- =====================================================

-- Table pour enregistrer les vues des machines
CREATE TABLE IF NOT EXISTS machine_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes de vues
CREATE INDEX IF NOT EXISTS idx_machine_views_machine_id ON machine_views(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_views_created_at ON machine_views(created_at);
CREATE INDEX IF NOT EXISTS idx_machine_views_viewer_id ON machine_views(viewer_id);

-- Table pour les messages entre utilisateurs
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Table pour les offres d'achat
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

-- Index pour les offres
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_machine_id ON offers(machine_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('view', 'message', 'offer', 'expired', 'premium', 'maintenance')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Table pour les services premium
CREATE TABLE IF NOT EXISTS premium_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('financement', 'transport', 'maintenance', 'formation', 'consultation')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    description TEXT,
    amount DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les services premium
CREATE INDEX IF NOT EXISTS idx_premium_services_user_id ON premium_services(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_services_status ON premium_services(status);

-- =====================================================
-- TABLES POUR LES NOUVELLES FONCTIONNALITÉS DU DASHBOARD
-- =====================================================

-- Table des profils utilisateur
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  address TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des préférences utilisateur
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'fr',
  currency TEXT DEFAULT 'EUR',
  timezone TEXT DEFAULT 'Europe/Paris',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  dark_mode BOOLEAN DEFAULT FALSE,
  animations BOOLEAN DEFAULT TRUE,
  font_size TEXT DEFAULT 'medium',
  high_contrast BOOLEAN DEFAULT FALSE,
  email_notifications JSONB DEFAULT '{"views": true, "messages": true, "offers": true, "expired": false, "newsletter": false}'::jsonb,
  notification_frequency TEXT DEFAULT 'immediate',
  notification_hours JSONB DEFAULT '{"start": "08:00", "end": "20:00"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'historique des services
CREATE TABLE IF NOT EXISTS service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT,
  action TEXT CHECK (action IN ('requested', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Politiques pour machine_views
ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own machine views" ON machine_views
    FOR SELECT USING (
        machine_id IN (
            SELECT id FROM machines WHERE sellerId = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert machine views" ON machine_views
    FOR INSERT WITH CHECK (true);

-- Politiques pour messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received" ON messages
    FOR UPDATE USING (receiver_id = auth.uid());

-- Politiques pour offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view offers they made or received" ON offers
    FOR SELECT USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Users can insert offers" ON offers
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update their offers" ON offers
    FOR UPDATE USING (seller_id = auth.uid());

-- Politiques pour notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Politiques pour premium_services
ALTER TABLE premium_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own services" ON premium_services
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own services" ON premium_services
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own services" ON premium_services
    FOR UPDATE USING (user_id = auth.uid());

-- Politiques pour user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour service_history
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service history" ON service_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service history" ON service_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour créer automatiquement une notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_content TEXT,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, content, action_url)
    VALUES (p_user_id, p_type, p_title, p_content, p_action_url)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Fonction pour marquer toutes les notifications comme lues
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = true 
    WHERE user_id = p_user_id AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName'
  );
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer automatiquement le profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_premium_services_user_id ON premium_services(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_services_status ON premium_services(status);
CREATE INDEX IF NOT EXISTS idx_service_history_user_id ON service_history(user_id);
CREATE INDEX IF NOT EXISTS idx_service_history_created_at ON service_history(created_at DESC);

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer des notifications de test pour un utilisateur existant
-- (Remplacez 'user-uuid-here' par un vrai UUID d'utilisateur)
/*
INSERT INTO notifications (user_id, type, title, content) VALUES
('user-uuid-here', 'system', 'Bienvenue sur Minegrid !', 'Votre compte a été créé avec succès.'),
('user-uuid-here', 'view', 'Nouvelle vue sur votre annonce', 'Quelqu\'un a consulté votre pelle mécanique.'),
('user-uuid-here', 'message', 'Nouveau message reçu', 'Vous avez reçu un message concernant votre équipement.');
*/ 