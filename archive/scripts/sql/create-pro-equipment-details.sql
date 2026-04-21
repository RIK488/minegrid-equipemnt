-- Script pour créer la table pro_equipment_details
-- Cette table stocke les données spécifiques au portail Pro

-- =====================================================
-- CRÉATION DE LA TABLE PRO_EQUIPMENT_DETAILS
-- =====================================================

CREATE TABLE IF NOT EXISTS pro_equipment_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  serial_number VARCHAR(100) NOT NULL,
  qr_code VARCHAR(200),
  purchase_date DATE,
  warranty_end DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  total_hours INTEGER DEFAULT 0,
  fuel_consumption DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pro_equipment_details_user_id ON pro_equipment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_equipment_details_machine_id ON pro_equipment_details(machine_id);
CREATE INDEX IF NOT EXISTS idx_pro_equipment_details_serial_number ON pro_equipment_details(serial_number);

-- =====================================================
-- ACTIVATION DE RLS
-- =====================================================

ALTER TABLE pro_equipment_details ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLITIQUES RLS
-- =====================================================

-- Politique pour permettre la lecture des détails d'équipement Pro
CREATE POLICY "Users can view their pro equipment details" ON pro_equipment_details
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre l'ajout de détails d'équipement Pro
CREATE POLICY "Users can insert their pro equipment details" ON pro_equipment_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre la modification de détails d'équipement Pro
CREATE POLICY "Users can update their pro equipment details" ON pro_equipment_details
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre la suppression de détails d'équipement Pro
CREATE POLICY "Users can delete their pro equipment details" ON pro_equipment_details
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FONCTION POUR METTRE À JOUR LE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGER POUR METTRE À JOUR LE TIMESTAMP
-- =====================================================

CREATE TRIGGER update_pro_equipment_details_updated_at 
  BEFORE UPDATE ON pro_equipment_details 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que la table est créée
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'pro_equipment_details'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'pro_equipment_details'
ORDER BY policyname; 