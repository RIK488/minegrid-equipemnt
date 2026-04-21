-- Script de création de la table client_notifications
-- Table pour stocker les notifications des clients Pro

-- Créer la table client_notifications
CREATE TABLE IF NOT EXISTS client_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('maintenance_due', 'order_update', 'diagnostic_alert', 'warranty_expiry')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    related_entity_type TEXT,
    related_entity_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur client_id pour les performances
CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id ON client_notifications(client_id);

-- Créer un index sur user_id pour les performances
CREATE INDEX IF NOT EXISTS idx_client_notifications_user_id ON client_notifications(user_id);

-- Créer un index sur is_read pour filtrer les notifications non lues
CREATE INDEX IF NOT EXISTS idx_client_notifications_is_read ON client_notifications(is_read);

-- Créer un index sur created_at pour le tri chronologique
CREATE INDEX IF NOT EXISTS idx_client_notifications_created_at ON client_notifications(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs peuvent voir les notifications de leur client
CREATE POLICY "Users can view their client notifications" ON client_notifications
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM pro_clients WHERE user_id = auth.uid()
        )
    );

-- Politique RLS : Les utilisateurs peuvent mettre à jour leurs notifications
CREATE POLICY "Users can update their client notifications" ON client_notifications
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM pro_clients WHERE user_id = auth.uid()
        )
    );

-- Politique RLS : Les utilisateurs peuvent insérer des notifications pour leur client
CREATE POLICY "Users can insert notifications for their client" ON client_notifications
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM pro_clients WHERE user_id = auth.uid()
        )
    );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_client_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_client_notifications_updated_at
    BEFORE UPDATE ON client_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_client_notifications_updated_at();

-- Insérer des données de démonstration si la table est vide
INSERT INTO client_notifications (client_id, user_id, type, title, message, is_read, priority, related_entity_type, related_entity_id)
SELECT 
    pc.id as client_id,
    pc.user_id,
    'maintenance_due' as type,
    'Maintenance préventive programmée' as title,
    'La maintenance préventive de l''équipement DEMO-001 est programmée pour le 15/01/2024' as message,
    false as is_read,
    'normal' as priority,
    'equipment' as related_entity_type,
    'demo-equipment-1' as related_entity_id
FROM pro_clients pc
WHERE NOT EXISTS (SELECT 1 FROM client_notifications WHERE client_id = pc.id)
LIMIT 1;

INSERT INTO client_notifications (client_id, user_id, type, title, message, is_read, priority, related_entity_type, related_entity_id)
SELECT 
    pc.id as client_id,
    pc.user_id,
    'order_update' as type,
    'Commande confirmée' as title,
    'Votre commande CMD-2024-001 a été confirmée et sera livrée le 20/01/2024' as message,
    true as is_read,
    'low' as priority,
    'order' as related_entity_type,
    'cmd-2024-001' as related_entity_id
FROM pro_clients pc
WHERE NOT EXISTS (SELECT 1 FROM client_notifications WHERE client_id = pc.id AND type = 'order_update')
LIMIT 1;

INSERT INTO client_notifications (client_id, user_id, type, title, message, is_read, priority, related_entity_type, related_entity_id)
SELECT 
    pc.id as client_id,
    pc.user_id,
    'diagnostic_alert' as type,
    'Alerte diagnostic équipement' as title,
    'L''équipement DEMO-002 présente des anomalies détectées lors du dernier diagnostic' as message,
    false as is_read,
    'high' as priority,
    'equipment' as related_entity_type,
    'demo-equipment-2' as related_entity_id
FROM pro_clients pc
WHERE NOT EXISTS (SELECT 1 FROM client_notifications WHERE client_id = pc.id AND type = 'diagnostic_alert')
LIMIT 1;

-- Afficher les statistiques
SELECT 
    'Table client_notifications créée avec succès' as status,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_notifications,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_notifications
FROM client_notifications; 