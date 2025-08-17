-- =====================================================
-- CORRECTION TABLE MESSAGES - Résolution Erreur 400
-- =====================================================

-- 1. Vérifier la structure actuelle
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 2. Supprimer les colonnes problématiques si elles existent
-- (Ces colonnes causent l'erreur 400 car elles référencent des tables inexistantes)

-- Supprimer sender_id si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sender_id'
    ) THEN
        ALTER TABLE messages DROP COLUMN sender_id;
        RAISE NOTICE 'Colonne sender_id supprimée';
    END IF;
END $$;

-- Supprimer receiver_id si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'receiver_id'
    ) THEN
        ALTER TABLE messages DROP COLUMN receiver_id;
        RAISE NOTICE 'Colonne receiver_id supprimée';
    END IF;
END $$;

-- Supprimer seller_id si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE messages DROP COLUMN seller_id;
        RAISE NOTICE 'Colonne seller_id supprimée';
    END IF;
END $$;

-- 3. Ajouter les colonnes manquantes si elles n'existent pas

-- Ajouter recipient_email si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'recipient_email'
    ) THEN
        ALTER TABLE messages ADD COLUMN recipient_email TEXT;
        RAISE NOTICE 'Colonne recipient_email ajoutée';
    END IF;
END $$;

-- Ajouter parent_message_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'parent_message_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN parent_message_id UUID;
        RAISE NOTICE 'Colonne parent_message_id ajoutée';
    END IF;
END $$;

-- Ajouter sent_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE messages ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne sent_at ajoutée';
    END IF;
END $$;

-- Ajouter error_message si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'error_message'
    ) THEN
        ALTER TABLE messages ADD COLUMN error_message TEXT;
        RAISE NOTICE 'Colonne error_message ajoutée';
    END IF;
END $$;

-- Ajouter subject si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'subject'
    ) THEN
        ALTER TABLE messages ADD COLUMN subject TEXT;
        RAISE NOTICE 'Colonne subject ajoutée';
    END IF;
END $$;

-- 4. Vérifier et corriger les contraintes

-- Supprimer les contraintes de clés étrangères problématiques
DO $$ 
BEGIN
    -- Supprimer la contrainte sur sender_id si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'messages' 
        AND constraint_name LIKE '%sender_id%'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
        RAISE NOTICE 'Contrainte sender_id supprimée';
    END IF;
    
    -- Supprimer la contrainte sur receiver_id si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'messages' 
        AND constraint_name LIKE '%receiver_id%'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
        RAISE NOTICE 'Contrainte receiver_id supprimée';
    END IF;
    
    -- Supprimer la contrainte sur seller_id si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'messages' 
        AND constraint_name LIKE '%seller_id%'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_seller_id_fkey;
        RAISE NOTICE 'Contrainte seller_id supprimée';
    END IF;
END $$;

-- 5. Mettre à jour les politiques RLS pour la nouvelle structure

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON messages;

-- Créer de nouvelles politiques adaptées à la structure simplifiée
CREATE POLICY "Enable read access for authenticated users" ON messages
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON messages
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON messages
FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Vérifier la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 7. Tester la table avec un message simple
INSERT INTO messages (
    sender_name, 
    sender_email, 
    message, 
    status, 
    created_at
) VALUES (
    'Test Utilisateur',
    'test@example.com',
    'Message de test pour vérifier la structure corrigée',
    'new',
    NOW()
);

-- Vérifier que l'insertion a fonctionné
SELECT * FROM messages WHERE sender_email = 'test@example.com';

-- Nettoyer le test
DELETE FROM messages WHERE sender_email = 'test@example.com';

-- 8. Afficher le résumé des corrections
SELECT 
    'Structure messages corrigée' as status,
    'Colonnes problématiques supprimées' as action,
    'Politiques RLS mises à jour' as security,
    'Table prête pour les réponses' as result; 