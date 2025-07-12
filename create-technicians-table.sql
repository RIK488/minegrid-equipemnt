-- 🛠️ CRÉATION DE LA TABLE TECHNICIENS
-- Script pour créer la table technicians et configurer les politiques RLS

-- 1. Créer la table technicians
CREATE TABLE IF NOT EXISTS technicians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Créer un index sur le nom pour les recherches
CREATE INDEX IF NOT EXISTS idx_technicians_name ON technicians(name);

-- 3. Créer un index sur la spécialisation
CREATE INDEX IF NOT EXISTS idx_technicians_specialization ON technicians(specialization);

-- 4. Activer RLS (Row Level Security)
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- 5. Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Technicians are viewable by authenticated users" ON technicians
  FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Politique pour permettre l'insertion par les utilisateurs authentifiés
CREATE POLICY "Technicians can be created by authenticated users" ON technicians
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Politique pour permettre la mise à jour par les utilisateurs authentifiés
CREATE POLICY "Technicians can be updated by authenticated users" ON technicians
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Politique pour permettre la suppression par les utilisateurs authentifiés
CREATE POLICY "Technicians can be deleted by authenticated users" ON technicians
  FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_technicians_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_technicians_updated_at();

-- 11. Insérer quelques techniciens de test
INSERT INTO technicians (name, specialization, phone, email) VALUES
  ('Mohammed Alami', 'Moteurs diesel', '+212 6 12 34 56 78', 'mohammed.alami@minegrid.ma'),
  ('Ahmed Benali', 'Systèmes hydrauliques', '+212 6 23 45 67 89', 'ahmed.benali@minegrid.ma'),
  ('Karim El Fassi', 'Électricité industrielle', '+212 6 34 56 78 90', 'karim.elfassi@minegrid.ma'),
  ('Hassan Tazi', 'Mécanique générale', '+212 6 45 67 89 01', 'hassan.tazi@minegrid.ma'),
  ('Youssef Bennani', 'Systèmes de freinage', '+212 6 56 78 90 12', 'youssef.bennani@minegrid.ma'),
  ('Rachid El Amrani', 'Transmissions', '+212 6 67 89 01 23', 'rachid.elamrani@minegrid.ma')
ON CONFLICT (id) DO NOTHING;

-- 12. Vérifier que la table a été créée correctement
SELECT 
  'Table technicians créée avec succès' as status,
  COUNT(*) as technician_count
FROM technicians;

-- 13. Afficher les techniciens créés
SELECT 
  name,
  specialization,
  phone,
  email,
  created_at
FROM technicians
ORDER BY name; 