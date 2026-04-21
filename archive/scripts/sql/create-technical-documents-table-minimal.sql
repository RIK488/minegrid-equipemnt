-- Script minimal pour créer la table technical_documents
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer la table technique_documents (nom corrigé)
CREATE TABLE IF NOT EXISTS technical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'manual',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Activer RLS
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;

-- Politique simple pour permettre l'accès
CREATE POLICY "Enable all access for authenticated users" ON technical_documents
    FOR ALL USING (auth.uid() = user_id); 