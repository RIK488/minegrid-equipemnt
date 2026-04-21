-- =====================================================
-- SCRIPT DE CRÉATION DES TABLES PORTAL PRO
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. TABLE DES CLIENTS PRO
CREATE TABLE IF NOT EXISTS pro_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  siret TEXT,
  address TEXT,
  phone TEXT,
  contact_person TEXT,
  subscription_type TEXT CHECK (subscription_type IN ('pro', 'premium', 'enterprise')) DEFAULT 'pro',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end TIMESTAMP WITH TIME ZONE,
  max_users INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES ÉQUIPEMENTS CLIENTS
CREATE TABLE IF NOT EXISTS client_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  serial_number TEXT UNIQUE NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  equipment_type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  location TEXT,
  status TEXT CHECK (status IN ('active', 'maintenance', 'inactive', 'sold')) DEFAULT 'active',
  purchase_date DATE,
  warranty_end DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  total_hours INTEGER DEFAULT 0,
  fuel_consumption DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES COMMANDES CLIENTS
CREATE TABLE IF NOT EXISTS client_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT CHECK (order_type IN ('purchase', 'rental', 'maintenance', 'import')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'MAD',
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DES INTERVENTIONS DE MAINTENANCE
CREATE TABLE IF NOT EXISTS maintenance_interventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES client_equipment(id) ON DELETE SET NULL, -- NULLABLE
  intervention_type TEXT CHECK (intervention_type IN ('preventive', 'corrective', 'emergency', 'inspection')) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  description TEXT,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  duration_hours DECIMAL(4,2),
  technician_name TEXT,
  cost DECIMAL(10,2),
  parts_used TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE DES NOTIFICATIONS CLIENTS
CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('maintenance_due', 'order_update', 'diagnostic_alert', 'warranty_expiry')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLE DES DOCUMENTS TECHNIQUES
CREATE TABLE IF NOT EXISTS technical_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES client_equipment(id) ON DELETE SET NULL,
  document_type TEXT CHECK (document_type IN ('manual', 'certificate', 'warranty', 'invoice', 'maintenance_report')) NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLE DES DIAGNOSTICS D'ÉQUIPEMENTS
CREATE TABLE IF NOT EXISTS equipment_diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES client_equipment(id) ON DELETE CASCADE,
  diagnostic_date DATE NOT NULL,
  diagnostic_type TEXT,
  status TEXT CHECK (status IN ('good', 'warning', 'critical', 'failed')),
  readings JSONB,
  recommendations TEXT,
  next_diagnostic_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLE DES UTILISATEURS CLIENTS
CREATE TABLE IF NOT EXISTS client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'manager', 'technician', 'viewer')) DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pro_clients_user_id ON pro_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_client_id ON client_equipment(client_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_serial ON client_equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_client_orders_client_id ON client_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_orders_status ON client_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_interventions_client_id ON maintenance_interventions(client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_interventions_equipment_id ON maintenance_interventions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_interventions_scheduled_date ON maintenance_interventions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id ON client_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_user_id ON client_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_client_id ON technical_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_equipment_diagnostics_equipment_id ON equipment_diagnostics(equipment_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON client_users(client_id);

-- =====================================================
-- RLS (ROW LEVEL SECURITY) - POLITIQUES DE SÉCURITÉ
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE pro_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

-- Politiques pour pro_clients
CREATE POLICY "Users can view their own pro profile" ON pro_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pro profile" ON pro_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pro profile" ON pro_clients
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour client_equipment
CREATE POLICY "Users can view equipment from their pro client" ON client_equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = client_equipment.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert equipment for their pro client" ON client_equipment
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = client_equipment.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update equipment from their pro client" ON client_equipment
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = client_equipment.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

-- Politiques pour client_orders
CREATE POLICY "Users can view orders from their pro client" ON client_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = client_orders.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert orders for their pro client" ON client_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = client_orders.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

-- Politiques pour maintenance_interventions
CREATE POLICY "Users can view interventions from their pro client" ON maintenance_interventions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = maintenance_interventions.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interventions for their pro client" ON maintenance_interventions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = maintenance_interventions.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interventions from their pro client" ON maintenance_interventions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = maintenance_interventions.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

-- Politiques pour client_notifications
CREATE POLICY "Users can view their own notifications" ON client_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for their pro client" ON client_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = client_notifications.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

-- Politiques pour technical_documents
CREATE POLICY "Users can view documents from their pro client" ON technical_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pro_clients 
      WHERE pro_clients.id = technical_documents.client_id 
      AND pro_clients.user_id = auth.uid()
    )
  );

-- Politiques pour equipment_diagnostics
CREATE POLICY "Users can view diagnostics from their pro client" ON equipment_diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_equipment ce
      JOIN pro_clients pc ON pc.id = ce.client_id
      WHERE ce.id = equipment_diagnostics.equipment_id 
      AND pc.user_id = auth.uid()
    )
  );

-- Politiques pour client_users
CREATE POLICY "Users can view their own client user profile" ON client_users
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_pro_clients_updated_at BEFORE UPDATE ON pro_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_equipment_updated_at BEFORE UPDATE ON client_equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_orders_updated_at BEFORE UPDATE ON client_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_interventions_updated_at BEFORE UPDATE ON maintenance_interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technical_documents_updated_at BEFORE UPDATE ON technical_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_users_updated_at BEFORE UPDATE ON client_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer un profil Pro de test (remplacez l'user_id par un vrai ID)
INSERT INTO pro_clients (
  user_id,
  company_name,
  contact_person,
  phone,
  address,
  subscription_type,
  subscription_status
) VALUES (
  'f75686ca-8922-4ef5-a8d0-bbbf78684db2', -- Remplacez par votre user_id
  'MineGrid Pro Test',
  'Contact Test',
  '+212 6 12 34 56 78',
  '123 Rue Test, Casablanca',
  'pro',
  'active'
) ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que les tables ont été créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'pro_clients',
  'client_equipment', 
  'client_orders',
  'maintenance_interventions',
  'client_notifications',
  'technical_documents',
  'equipment_diagnostics',
  'client_users'
)
ORDER BY table_name;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN (
  'pro_clients',
  'client_equipment', 
  'client_orders',
  'maintenance_interventions',
  'client_notifications',
  'technical_documents',
  'equipment_diagnostics',
  'client_users'
)
ORDER BY tablename, policyname; 