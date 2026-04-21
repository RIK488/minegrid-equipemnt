-- =====================================================
-- CRÉATION D'UN UTILISATEUR DE TEST
-- =====================================================
-- Ce script crée un utilisateur de test pour tester le dashboard

-- 1. CRÉATION DE L'UTILISATEUR DANS AUTH
-- =====================================================

-- Note: Cette partie doit être faite manuellement dans Supabase Auth
-- Allez dans Authentication > Users > Add User
-- Email: test@minegrid.com
-- Password: test123456

-- 2. CRÉATION DU PROFIL DANS LA TABLE profiles
-- =====================================================

-- Insérer le profil (remplacez l'UUID par celui de l'utilisateur créé dans Auth)
INSERT INTO profiles (id, email, firstname, lastname, created_at, updated_at)
VALUES (
  'f75686ca-8922-4ef5-a8d0-bbbf78684db2', -- Remplacez par l'UUID de l'utilisateur Auth
  'test@minegrid.com',
  'Test',
  'Vendeur',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  firstname = EXCLUDED.firstname,
  lastname = EXCLUDED.lastname,
  updated_at = NOW();

-- 3. CRÉATION DE MACHINES DE TEST
-- =====================================================

-- Insérer quelques machines de test pour ce vendeur
INSERT INTO machines (id, name, brand, model, category, year, price, condition, description, sellerid, created_at)
VALUES 
  (
    gen_random_uuid(),
    'Bouteur CAT D6',
    'Caterpillar',
    'D6',
    'Bouteur',
    2020,
    '85000',
    'used',
    'Bouteur Caterpillar D6 en excellent état, 2000h',
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Excavatrice Hitachi ZX200',
    'Hitachi',
    'ZX200',
    'Excavatrice',
    2019,
    '95000',
    'used',
    'Excavatrice Hitachi ZX200, 1800h, très bon état',
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Chargeur Volvo L120',
    'Volvo',
    'L120',
    'Chargeur',
    2021,
    '75000',
    'used',
    'Chargeur Volvo L120, 1500h, état neuf',
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 4. CRÉATION DE VUES DE TEST
-- =====================================================

-- Insérer quelques vues de test pour les machines
INSERT INTO machine_views (machine_id, ip_address, user_agent, created_at)
SELECT 
  m.id,
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() - INTERVAL '1 day' * (random() * 30)::int
FROM machines m
WHERE m.sellerid = 'f75686ca-8922-4ef5-a8d0-bbbf78684db2'
LIMIT 15;

-- 5. CRÉATION DE MESSAGES DE TEST
-- =====================================================

-- Insérer quelques messages de test
INSERT INTO messages (id, sender_id, receiver_id, subject, content, is_read, created_at)
VALUES 
  (
    gen_random_uuid(),
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    'Demande de renseignements',
    'Bonjour, je suis intéressé par votre bouteur CAT D6. Pouvez-vous me donner plus de détails ?',
    false,
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(),
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
    'Question sur l''excavatrice',
    'Bonjour, l''excavatrice Hitachi est-elle toujours disponible ?',
    false,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- 6. VÉRIFICATION
-- =====================================================

-- Vérifier que l'utilisateur a été créé
SELECT 
  id,
  email,
  firstname,
  lastname,
  created_at
FROM profiles 
WHERE email = 'test@minegrid.com';

-- Vérifier les machines créées
SELECT 
  id,
  name,
  brand,
  model,
  price,
  sellerid
FROM machines 
WHERE sellerid = 'f75686ca-8922-4ef5-a8d0-bbbf78684db2';

-- Vérifier les vues créées
SELECT 
  COUNT(*) as total_views
FROM machine_views mv
JOIN machines m ON mv.machine_id = m.id
WHERE m.sellerid = 'f75686ca-8922-4ef5-a8d0-bbbf78684db2';

-- Vérifier les messages créés
SELECT 
  COUNT(*) as total_messages
FROM messages 
WHERE receiver_id = 'f75686ca-8922-4ef5-a8d0-bbbf78684db2';

-- 7. MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Utilisateur de test créé avec succès !';
  RAISE NOTICE '📧 Email: test@minegrid.com';
  RAISE NOTICE '🔑 Mot de passe: test123456';
  RAISE NOTICE '📊 Données de test créées (machines, vues, messages)';
  RAISE NOTICE '⚠️  IMPORTANT: Créez d''abord l''utilisateur dans Supabase Auth !';
END $$; 