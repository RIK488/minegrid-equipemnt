-- =====================================================
-- CORRECTION CONTRAINTE STATUS MESSAGES
-- =====================================================
-- Ce script corrige l'erreur "messages_status_check" constraint violation

-- 1. Vérifier la structure actuelle de la table messages
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes existantes
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%messages%';

-- 3. Supprimer la contrainte problématique si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'messages_status_check'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_status_check;
        RAISE NOTICE 'Contrainte messages_status_check supprimée';
    END IF;
END $$;

-- 4. Vérifier si la colonne status existe et sa définition
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'status'
    ) THEN
        RAISE NOTICE 'Colonne status existe';
        
        -- Modifier la colonne status pour accepter les valeurs nécessaires
        ALTER TABLE messages ALTER COLUMN status TYPE TEXT;
        ALTER TABLE messages ALTER COLUMN status SET DEFAULT 'new';
        
        -- Ajouter une nouvelle contrainte plus permissive
        ALTER TABLE messages ADD CONSTRAINT messages_status_check 
        CHECK (status IN ('new', 'read', 'replied', 'sent', 'failed', 'pending'));
        
        RAISE NOTICE 'Colonne status mise à jour avec nouvelle contrainte';
    ELSE
        -- Si la colonne n'existe pas, la créer
        ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'new';
        ALTER TABLE messages ADD CONSTRAINT messages_status_check 
        CHECK (status IN ('new', 'read', 'replied', 'sent', 'failed', 'pending'));
        RAISE NOTICE 'Colonne status créée avec contrainte';
    END IF;
END $$;

-- 5. Mettre à jour les enregistrements existants avec status NULL
UPDATE messages SET status = 'new' WHERE status IS NULL;

-- 6. Vérifier que la contrainte fonctionne
INSERT INTO messages (
    sender_name,
    sender_email,
    recipient_email,
    subject,
    message,
    status,
    created_at
) VALUES (
    'Test User',
    'test@example.com',
    'recipient@example.com',
    'Test Subject',
    'Test message content',
    'new',
    NOW()
);

-- 7. Vérifier l'insertion
SELECT id, sender_email, recipient_email, subject, status, created_at 
FROM messages 
WHERE sender_email = 'test@example.com';

-- 8. Nettoyer le test
DELETE FROM messages WHERE sender_email = 'test@example.com';

-- 9. Afficher la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 10. Afficher les contraintes finales
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%messages%';

-- 11. Résumé des corrections
SELECT 
    '✅ Contrainte status corrigée' as status,
    'Valeurs autorisées: new, read, replied, sent, failed, pending' as allowed_values,
    'Valeur par défaut: new' as default_value,
    'Table prête pour les réponses' as result; 