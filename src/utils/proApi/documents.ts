import { TECHNICAL_DOCUMENT_COLUMNS } from '../../constants/proClientQueryFields';
import type { TechnicalDocument } from './types';
import supabase from '../supabaseClient';

// =====================================================
// FONCTIONS API DOCUMENTS TECHNIQUES
// =====================================================

// Récupérer tous les documents techniques
export async function getTechnicalDocuments(): Promise<TechnicalDocument[]> {
  try {
    const { data, error } = await supabase
      .from('technical_documents')
      .select(TECHNICAL_DOCUMENT_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return [];
  }
}

// Uploader un document technique
export async function uploadTechnicalDocument(
  file: File, 
  document: Partial<TechnicalDocument>
): Promise<TechnicalDocument | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    // Upload du fichier
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('technical-documents')
      .upload(`${user.id}/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Créer l'entrée dans la base de données
    const { data, error } = await supabase
      .from('technical_documents')
      .insert({
        ...document,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    return null;
  }
}
