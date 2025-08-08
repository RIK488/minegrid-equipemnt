-- Script simplifié pour créer la table technical_documents
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Créer la table technical_documents
CREATE TABLE IF NOT EXISTS technical_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'manual',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_technical_documents_user_id ON technical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_created_at ON technical_documents(created_at);

-- Activer RLS
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own documents" ON technical_documents
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own documents" ON technical_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON technical_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON technical_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_technical_documents_updated_at 
    BEFORE UPDATE ON technical_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer des documents de test (optionnel)
INSERT INTO technical_documents (title, document_type, file_path, file_size, mime_type, is_public, user_id) 
SELECT 
    'Manuel d''utilisation' as title,
    'manual' as document_type,
    'documents/manuel_utilisation.pdf' as file_path,
    1024000 as file_size,
    'application/pdf' as mime_type,
    true as is_public,
    id as user_id
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING; 