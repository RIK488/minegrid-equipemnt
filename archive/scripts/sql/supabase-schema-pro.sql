-- =====================================================
-- SERVICE PRO - PORTAL UTILISATEUR AVANCÉ
-- =====================================================

-- 1. TABLE DES CLIENTS PRO
CREATE TABLE IF NOT EXISTS pro_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  siret VARCHAR(14),
  address TEXT,
  phone VARCHAR(20),
  contact_person VARCHAR(255),
  subscription_type VARCHAR(50) DEFAULT 'pro', -- 'pro', 'premium', 'enterprise'
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_start DATE DEFAULT CURRENT_DATE,
  subscription_end DATE,
  max_users INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES ÉQUIPEMENTS CLIENTS
CREATE TABLE IF NOT EXISTS client_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  qr_code VARCHAR(255),
  equipment_type VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  location TEXT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'inactive', 'sold'
  purchase_date DATE,
  warranty_end DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  total_hours INTEGER DEFAULT 0,
  fuel_consumption DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS client_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_type VARCHAR(50) NOT NULL, -- 'purchase', 'rental', 'maintenance', 'import'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  total_amount DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DES DOCUMENTS TECHNIQUES
CREATE TABLE IF NOT EXISTS technical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES client_equipment(id) ON DELETE SET NULL,
  document_type VARCHAR(100) NOT NULL, -- 'manual', 'certificate', 'warranty', 'invoice', 'maintenance_report'
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE DES INTERVENTIONS MAINTENANCE
CREATE TABLE IF NOT EXISTS maintenance_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES client_equipment(id) ON DELETE CASCADE,
  intervention_type VARCHAR(100) NOT NULL, -- 'preventive', 'corrective', 'emergency', 'inspection'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  description TEXT,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  duration_hours DECIMAL(5,2),
  technician_name VARCHAR(255),
  cost DECIMAL(10,2),
  parts_used TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLE DES DIAGNOSTICS
CREATE TABLE IF NOT EXISTS equipment_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES client_equipment(id) ON DELETE CASCADE,
  diagnostic_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  diagnostic_type VARCHAR(100), -- 'engine', 'hydraulic', 'electrical', 'structural'
  status VARCHAR(50), -- 'good', 'warning', 'critical', 'failed'
  readings JSONB, -- Stockage flexible des mesures
  recommendations TEXT,
  next_diagnostic_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLE DES UTILISATEURS CLIENTS
CREATE TABLE IF NOT EXISTS client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'technician', 'viewer'
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, user_id)
);

-- 8. TABLE DES NOTIFICATIONS CLIENTS
CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES pro_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- 'maintenance_due', 'order_update', 'diagnostic_alert', 'warranty_expiry'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal',
  related_entity_type VARCHAR(50), -- 'equipment', 'order', 'intervention'
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pro_clients_user_id ON pro_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_client_id ON client_equipment(client_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_serial ON client_equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_client_orders_client_id ON client_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_orders_status ON client_orders(status);
CREATE INDEX IF NOT EXISTS idx_technical_docs_client_id ON technical_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_interventions_equipment_id ON maintenance_interventions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_interventions_scheduled_date ON maintenance_interventions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_equipment_diagnostics_equipment_id ON equipment_diagnostics(equipment_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id ON client_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_user_id ON client_notifications(user_id);

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Politiques pour pro_clients
ALTER TABLE pro_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pro client profile" ON pro_clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own pro client profile" ON pro_clients
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour client_equipment
ALTER TABLE client_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client users can view equipment" ON client_equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_equipment.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Politiques pour client_orders
ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client users can view orders" ON client_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = client_orders.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Politiques pour technical_documents
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client users can view documents" ON technical_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = technical_documents.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Politiques pour maintenance_interventions
ALTER TABLE maintenance_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client users can view interventions" ON maintenance_interventions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_users 
      WHERE client_users.client_id = maintenance_interventions.client_id 
      AND client_users.user_id = auth.uid()
    )
  );

-- Politiques pour equipment_diagnostics
ALTER TABLE equipment_diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client users can view diagnostics" ON equipment_diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_equipment ce
      JOIN client_users cu ON cu.client_id = ce.client_id
      WHERE ce.id = equipment_diagnostics.equipment_id 
      AND cu.user_id = auth.uid()
    )
  );

-- Politiques pour client_users
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own client user profile" ON client_users
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour client_notifications
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON client_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour générer un QR code unique
CREATE OR REPLACE FUNCTION generate_equipment_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := 'MINE-' || NEW.serial_number || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement les QR codes
CREATE TRIGGER trigger_generate_qr_code
  BEFORE INSERT ON client_equipment
  FOR EACH ROW
  EXECUTE FUNCTION generate_equipment_qr_code();

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement les timestamps
CREATE TRIGGER update_pro_clients_updated_at BEFORE UPDATE ON pro_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_equipment_updated_at BEFORE UPDATE ON client_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_orders_updated_at BEFORE UPDATE ON client_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technical_documents_updated_at BEFORE UPDATE ON technical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_interventions_updated_at BEFORE UPDATE ON maintenance_interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_users_updated_at BEFORE UPDATE ON client_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 