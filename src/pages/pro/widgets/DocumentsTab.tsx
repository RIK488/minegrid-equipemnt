import React, { useEffect, useState } from 'react';
import { usePermissions } from '../../../utils/permissions';
import supabase from '../../../utils/supabaseClient';
import { TECHNICAL_DOCUMENT_COLUMNS } from '../../../constants/proClientQueryFields';
import { Download, Trash2, X } from 'lucide-react';
import { toast } from '../../../utils/toast';
export function DocumentsTab({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentData, setDocumentData] = useState({
    title: '',
    document_type: 'manual',
    is_public: false
  });

  const { permissions } = usePermissions();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('technical_documents')
        .select(TECHNICAL_DOCUMENT_COLUMNS)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des documents:', error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !documentData.title) {
      toast('Veuillez sélectionner un fichier et saisir un titre');
      return;
    }

    try {
      setUploading(true);

      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast('Erreur: Utilisateur non connecté');
        return;
      }

      // Upload du fichier vers Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        toast('Erreur lors de l\'upload du fichier: ' + uploadError.message);
        return;
      }

      // Créer l'entrée dans la base de données
      const { error: dbError } = await supabase
        .from('technical_documents')
        .insert({
          title: documentData.title,
          document_type: documentData.document_type,
          file_path: uploadData.path,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          is_public: documentData.is_public,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Erreur lors de la création du document:', dbError);
        toast('Erreur lors de la création du document: ' + dbError.message);
        return;
      }

      // Succès
      toast('Document ajouté avec succès !');
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentData({ title: '', document_type: 'manual', is_public: false });
      await loadDocuments();
      await onRefresh();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast('Erreur lors de l\'upload: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error } = await supabase
        .from('technical_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
      } else {
        await loadDocuments();
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      // Vérifier si le bucket existe et essayer le téléchargement
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) {
        // Si le bucket n'existe pas ou erreur, afficher les infos du document
        console.log('Bucket Storage non configuré, affichage des informations:', error);
        toast(`📄 Informations du document "${doc.title}"\n\n` +
              `📁 Fichier: ${doc.file_path}\n` +
              `📏 Taille: ${Math.round(doc.file_size / 1024)} KB\n` +
              `📋 Type: ${doc.mime_type}\n\n` +
              `ℹ️  Pour télécharger le fichier réel, configurez le bucket Storage "documents" dans Supabase.`);
        return;
      }

      // Téléchargement réussi - créer le lien de téléchargement
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Téléchargement réussi:', doc.title);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast('Erreur lors du téléchargement: ' + (error as Error).message);
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return '📖';
      case 'certificate': return '📜';
      case 'warranty': return '🛡️';
      case 'invoice': return '🧾';
      case 'maintenance_report': return '🔧';
      default: return '📄';
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'manual': return 'Manuel';
      case 'certificate': return 'Certificat';
      case 'warranty': return 'Garantie';
      case 'invoice': return 'Facture';
      case 'maintenance_report': return 'Rapport maintenance';
      default: return 'Document';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Chargement des documents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Ajouter un document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Aucun document disponible pour le moment.</p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ajouter votre premier document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibilité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getDocumentTypeIcon(doc.document_type)}</span>
                        <span className="text-sm text-gray-900">{getDocumentTypeText(doc.document_type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.is_public ? 'Public' : 'Privé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {(permissions?.isAdmin || permissions?.isManager) && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Ajouter un document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du document *
                </label>
                <input
                  type="text"
                  value={documentData.title}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Titre du document"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de document
                </label>
                <select
                  value={documentData.document_type}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="manual">Manuel</option>
                  <option value="certificate">Certificat</option>
                  <option value="warranty">Garantie</option>
                  <option value="invoice">Facture</option>
                  <option value="maintenance_report">Rapport maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={documentData.is_public}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Document public</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !documentData.title}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upload...
                    </>
                  ) : (
                    'Uploader'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
