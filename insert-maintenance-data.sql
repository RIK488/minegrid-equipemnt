-- 🛠️ INSERTION DES DONNÉES DE MAINTENANCE PRÉVENTIVE
-- Script pour insérer des techniciens et interventions de test

-- 1. Insérer des techniciens de test (ignorer les conflits)
INSERT INTO technicians (name, specialization) VALUES
  ('Mohammed Alami', 'Moteurs diesel'),
  ('Ahmed Benali', 'Systèmes hydrauliques'),
  ('Karim El Fassi', 'Électricité industrielle'),
  ('Hassan Tazi', 'Mécanique générale'),
  ('Youssef Bennani', 'Systèmes de freinage'),
  ('Rachid El Amrani', 'Transmissions')
ON CONFLICT (id) DO NOTHING;

-- 2. Récupérer les IDs des machines existantes
WITH machine_ids AS (
  SELECT id, name FROM machines LIMIT 5
),
technician_ids AS (
  SELECT id, name FROM technicians LIMIT 4
)
-- 3. Insérer des interventions de maintenance préventive
INSERT INTO interventions (
  equipment_id,
  description,
  intervention_date,
  priority,
  status,
  estimated_duration,
  technician_id,
  notes
)
SELECT 
  m.id as equipment_id,
  CASE 
    WHEN m.name LIKE '%CAT%' THEN 'Vidange huile moteur et remplacement filtre à air'
    WHEN m.name LIKE '%JCB%' THEN 'Contrôle système hydraulique et vérification fuites'
    WHEN m.name LIKE '%Bulldozer%' THEN 'Révision complète - 5000h de fonctionnement'
    WHEN m.name LIKE '%Hitachi%' THEN 'Remplacement courroies et contrôle tension'
    ELSE 'Contrôle système de freinage et remplacement plaquettes'
  END as description,
  CASE 
    WHEN m.name LIKE '%CAT%' THEN NOW() + INTERVAL '2 days'
    WHEN m.name LIKE '%JCB%' THEN NOW()
    WHEN m.name LIKE '%Bulldozer%' THEN NOW() - INTERVAL '1 day'
    WHEN m.name LIKE '%Hitachi%' THEN NOW() + INTERVAL '5 days'
    ELSE NOW() + INTERVAL '1 day'
  END as intervention_date,
  CASE 
    WHEN m.name LIKE '%CAT%' THEN 'Haute'
    WHEN m.name LIKE '%JCB%' THEN 'Moyenne'
    WHEN m.name LIKE '%Bulldozer%' THEN 'Basse'
    WHEN m.name LIKE '%Hitachi%' THEN 'Moyenne'
    ELSE 'Haute'
  END as priority,
  CASE 
    WHEN m.name LIKE '%JCB%' THEN 'En cours'
    ELSE 'En attente'
  END as status,
  CASE 
    WHEN m.name LIKE '%Bulldozer%' THEN 8
    WHEN m.name LIKE '%CAT%' THEN 4
    WHEN m.name LIKE '%Hitachi%' THEN 3
    ELSE 2
  END as estimated_duration,
  t.id as technician_id,
  CASE 
    WHEN m.name LIKE '%CAT%' THEN 'Intervention programmée selon planning préventif'
    WHEN m.name LIKE '%JCB%' THEN 'Intervention en cours - système hydraulique défaillant'
    WHEN m.name LIKE '%Bulldozer%' THEN 'Révision majeure programmée - en attente d''assignation technicien'
    WHEN m.name LIKE '%Hitachi%' THEN 'Maintenance préventive - courroies usées'
    ELSE 'Système de freinage à vérifier - sécurité prioritaire'
  END as notes
FROM machine_ids m
CROSS JOIN LATERAL (
  SELECT id FROM technician_ids ORDER BY RANDOM() LIMIT 1
) t
ON CONFLICT (id) DO NOTHING;

-- 4. Ajouter quelques interventions supplémentaires
INSERT INTO interventions (
  equipment_id,
  description,
  intervention_date,
  priority,
  status,
  estimated_duration,
  technician_id,
  notes
)
SELECT 
  m.id as equipment_id,
  'Contrôle niveau liquides et graissage points critiques' as description,
  NOW() + INTERVAL '7 days' as intervention_date,
  'Basse' as priority,
  'En attente' as status,
  1 as estimated_duration,
  t.id as technician_id,
  'Maintenance hebdomadaire de routine' as notes
FROM machines m
CROSS JOIN LATERAL (
  SELECT id FROM technicians ORDER BY RANDOM() LIMIT 1
) t
WHERE m.name LIKE '%CAT%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 5. Ajouter une intervention terminée
INSERT INTO interventions (
  equipment_id,
  description,
  intervention_date,
  priority,
  status,
  estimated_duration,
  technician_id,
  notes
)
SELECT 
  m.id as equipment_id,
  'Remplacement filtre à carburant et contrôle injecteurs' as description,
  NOW() - INTERVAL '2 days' as intervention_date,
  'Moyenne' as priority,
  'Terminé' as status,
  2 as estimated_duration,
  t.id as technician_id,
  'Intervention terminée avec succès - équipement opérationnel' as notes
FROM machines m
CROSS JOIN LATERAL (
  SELECT id FROM technicians ORDER BY RANDOM() LIMIT 1
) t
WHERE m.name LIKE '%JCB%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 6. Vérifier les données insérées
SELECT 
  'Résumé des données' as info,
  (SELECT COUNT(*) FROM technicians) as technicians_count,
  (SELECT COUNT(*) FROM interventions) as interventions_count;

-- 7. Afficher quelques exemples d'interventions
SELECT 
  i.description,
  i.priority,
  i.status,
  i.intervention_date,
  m.name as equipment_name,
  t.name as technician_name
FROM interventions i
LEFT JOIN machines m ON i.equipment_id = m.id
LEFT JOIN technicians t ON i.technician_id = t.id
ORDER BY i.intervention_date
LIMIT 5; 