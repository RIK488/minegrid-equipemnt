-- Script pour corriger la table maintenance_interventions
-- Rendre le champ equipment_id optionnel

-- 1. Supprimer la contrainte de clé étrangère existante
ALTER TABLE maintenance_interventions 
DROP CONSTRAINT IF EXISTS maintenance_interventions_equipment_id_fkey;

-- 2. Modifier la colonne equipment_id pour la rendre nullable
ALTER TABLE maintenance_interventions 
ALTER COLUMN equipment_id DROP NOT NULL;

-- 3. Recréer la contrainte de clé étrangère avec ON DELETE SET NULL
ALTER TABLE maintenance_interventions 
ADD CONSTRAINT maintenance_interventions_equipment_id_fkey 
FOREIGN KEY (equipment_id) REFERENCES client_equipment(id) ON DELETE SET NULL;

-- 4. Vérifier la structure mise à jour
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'maintenance_interventions' 
ORDER BY ordinal_position;

-- 5. Insérer une intervention de test pour vérifier
INSERT INTO maintenance_interventions (
    client_id,
    intervention_type,
    status,
    priority,
    description,
    scheduled_date,
    duration_hours,
    technician_name,
    cost
) VALUES (
    (SELECT id FROM pro_clients LIMIT 1),
    'preventive',
    'scheduled',
    'normal',
    'Test intervention - maintenance préventive générale',
    CURRENT_DATE + INTERVAL '1 day',
    8,
    'Technicien Test',
    150.00
);

-- 6. Vérifier que l'insertion a fonctionné
SELECT * FROM maintenance_interventions ORDER BY created_at DESC LIMIT 1; 