import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ArrowLeft, 
  Search,
  Filter,
  Plus,
  Reply,
  Trash2,
  Star,
  CheckCircle,
  Clock,
  User,
  Building2,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  Send,
  Archive,
  Tag
} from 'lucide-react';
import supabase from '../utils/supabaseClient';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  sender_company?: string;
  sender_id: string;
  recipient_id: string;
  type: 'demande_devis' | 'demande_info' | 'reclamation' | 'commande' | 'autre';
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  status: 'non_lu' | 'lu' | 'repondu' | 'traite' | 'archive';
  created_at: string;
  read_at?: string;
  replied_at?: string;
  tags: string[];
  machine_reference?: string;
  estimated_value?: number;
}

const messageTypes = [
  { value: 'demande_devis', label: 'Demande de devis', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'demande_info', label: 'Demande d\'information', color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'reclamation', label: 'Réclamation', color: 'text-orange-700', bg: 'bg-orange-50' },
  { value: 'commande', label: 'Commande', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'autre', label: 'Autre', color: 'text-orange-600', bg: 'bg-orange-50' }
];

const priorities = [
  { value: 'basse', label: 'Basse', color: 'text-orange-400' },
  { value: 'normale', label: 'Normale', color: 'text-orange-600' },
  { value: 'haute', label: 'Haute', color: 'text-orange-700' },
  { value: 'urgente', label: 'Urgente', color: 'text-orange-800' }
];

export default function MessagesBoite() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'lu',
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur marquage lu:', error);
        return;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'lu', read_at: new Date().toISOString() }
          : msg
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateMessageStatus = async (messageId: string, status: Message['status']) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur mise à jour statut:', error);
        return;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sauvegarder la réponse
      const replyData = {
        original_message_id: selectedMessage.id,
        sender_id: user.id,
        recipient_id: selectedMessage.sender_id,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        type: 'reponse',
        created_at: new Date().toISOString()
      };

      const { error: replyError } = await supabase
        .from('messages')
        .insert(replyData);

      if (replyError) {
        console.error('Erreur envoi réponse:', replyError);
        alert('Erreur lors de l\'envoi');
        return;
      }

      // Marquer le message original comme répondu
      await updateMessageStatus(selectedMessage.id, 'repondu');

      setShowReplyModal(false);
      setReplyContent('');
      setSelectedMessage(null);
      alert('Réponse envoyée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
        return;
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      alert('Message supprimé avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.sender_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || msg.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || msg.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || msg.priority === selectedPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getUnreadCount = () => messages.filter(msg => msg.status === 'non_lu').length;
  const getUrgentCount = () => messages.filter(msg => msg.priority === 'urgente').length;

  const getTypeInfo = (type: Message['type']) => {
    return messageTypes.find(t => t.value === type) || messageTypes[4];
  };

  const getPriorityInfo = (priority: Message['priority']) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <a
              href="#dashboard-entreprise"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retourner au tableau de bord
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Boîte de réception</h1>
              <p className="text-gray-600">Gérez vos messages et demandes clients</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {getUnreadCount() > 0 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {getUnreadCount()} non lu(s)
              </span>
            )}
            {getUrgentCount() > 0 && (
              <span className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-sm font-medium">
                {getUrgentCount()} urgent(s)
              </span>
            )}
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les types</option>
              {messageTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="non_lu">Non lu</option>
              <option value="lu">Lu</option>
              <option value="repondu">Répondu</option>
              <option value="traite">Traité</option>
              <option value="archive">Archivé</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Toutes priorités</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              {filteredMessages.length} message(s)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des messages */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement des messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucun message trouvé</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => {
                  const typeInfo = getTypeInfo(message.type);
                  const priorityInfo = getPriorityInfo(message.priority);
                  
                  return (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === 'non_lu') {
                          markAsRead(message.id);
                        }
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-orange-50 border-r-4 border-orange-600' : ''
                      } ${message.status === 'non_lu' ? 'bg-orange-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-sm font-semibold truncate ${
                              message.status === 'non_lu' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {message.subject}
                            </h3>
                            {message.status === 'non_lu' && (
                              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{message.sender_name}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.bg} ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`text-xs ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Détail du message */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                    <p className="text-sm text-gray-600">
                      Reçu le {new Date(selectedMessage.created_at).toLocaleDateString('fr-FR')} à {new Date(selectedMessage.created_at).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Répondre
                    </button>
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'traite')}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Marquer comme traité"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'archive')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Informations expéditeur */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Expéditeur</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedMessage.sender_name}
                        </p>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {selectedMessage.sender_email}
                        </p>
                        {selectedMessage.sender_phone && (
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedMessage.sender_phone}
                          </p>
                        )}
                        {selectedMessage.sender_company && (
                          <p className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            {selectedMessage.sender_company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Détails</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-gray-400" />
                          {getTypeInfo(selectedMessage.type).label}
                        </p>
                        <p className={`flex items-center ${getPriorityInfo(selectedMessage.priority).color}`}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Priorité: {getPriorityInfo(selectedMessage.priority).label}
                        </p>
                        {selectedMessage.machine_reference && (
                          <p className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-gray-400" />
                            Référence: {selectedMessage.machine_reference}
                          </p>
                        )}
                        {selectedMessage.estimated_value && (
                          <p className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-gray-400" />
                            Valeur estimée: {selectedMessage.estimated_value.toLocaleString('fr-FR')} €
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu du message */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>

                {/* Tags */}
                {selectedMessage.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Sélectionnez un message pour voir son contenu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de réponse */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Répondre à {selectedMessage.sender_name}</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tapez votre réponse ici..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sendReply}
                disabled={!replyContent.trim() || sending}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 