import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  Activity,
  Key,
  Crown,
  AlertTriangle
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  permissions: string[];
  avatar?: string;
}

const MultiUserManagement: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [hasEnterpriseService, setHasEnterpriseService] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Données d'exemple
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ahmed Benali',
      email: 'ahmed.benali@entreprise.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      permissions: ['all'],
      avatar: 'AB'
    },
    {
      id: '2',
      name: 'Fatima Zahra',
      email: 'fatima.zahra@entreprise.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15 13:45',
      permissions: ['dashboard', 'machines', 'orders', 'analytics'],
      avatar: 'FZ'
    },
    {
      id: '3',
      name: 'Karim El Amrani',
      email: 'karim.elamrani@entreprise.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-15 12:20',
      permissions: ['dashboard', 'machines'],
      avatar: 'KE'
    },
    {
      id: '4',
      name: 'Sara Mansouri',
      email: 'sara.mansouri@entreprise.com',
      role: 'viewer',
      status: 'pending',
      lastLogin: 'Jamais connecté',
      permissions: ['dashboard'],
      avatar: 'SM'
    }
  ]);

  const roles = [
    { id: 'admin', name: 'Administrateur', color: 'bg-orange-100 text-orange-800', icon: <Crown className="h-4 w-4" /> },
    { id: 'manager', name: 'Gestionnaire', color: 'bg-orange-50 text-orange-700', icon: <Settings className="h-4 w-4" /> },
    { id: 'user', name: 'Utilisateur', color: 'bg-orange-50 text-orange-600', icon: <Users className="h-4 w-4" /> },
    { id: 'viewer', name: 'Lecteur', color: 'bg-gray-100 text-gray-800', icon: <Eye className="h-4 w-4" /> }
  ];

  const permissions = [
    { id: 'dashboard', name: 'Tableau de bord', description: 'Accès au tableau de bord principal' },
    { id: 'machines', name: 'Gestion des machines', description: 'Créer, modifier et supprimer des machines' },
    { id: 'orders', name: 'Commandes', description: 'Gérer les commandes et devis' },
    { id: 'analytics', name: 'Analytics', description: 'Accès aux rapports et statistiques' },
    { id: 'users', name: 'Gestion utilisateurs', description: 'Gérer les membres de l\'équipe' },
    { id: 'settings', name: 'Paramètres', description: 'Modifier les paramètres de l\'entreprise' },
    { id: 'api', name: 'API', description: 'Accès aux clés API et intégrations' },
    { id: 'support', name: 'Support prioritaire', description: 'Accès au support technique' }
  ];

  // Vérifier si l'utilisateur a le service entreprise
  useEffect(() => {
    const checkEnterpriseService = () => {
      try {
        // Vérifier dans localStorage
        const userServices = localStorage.getItem('userServices');
        const userSubscription = localStorage.getItem('userSubscription');
        
        // Vérifier si l'utilisateur a le service entreprise
        const hasEnterprise = userServices?.includes('enterprise') || 
                             userSubscription === 'enterprise' ||
                             localStorage.getItem('enterpriseService') === 'true';
        
        setHasEnterpriseService(!!hasEnterprise);
        setIsLoading(false);
        
        // Si pas de service entreprise, rediriger après un délai
        if (!hasEnterprise) {
          setTimeout(() => {
            window.location.href = '/#dashboard/services';
          }, 3000);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du service:', error);
        setHasEnterpriseService(false);
        setIsLoading(false);
      }
    };

    checkEnterpriseService();
  }, []);

  const getRoleInfo = (roleId: string) => {
    return roles.find(role => role.id === roleId) || roles[3];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-100 text-orange-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteUser = (formData: any) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'pending',
      lastLogin: 'Jamais connecté',
      permissions: formData.permissions || ['dashboard'],
      avatar: formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowInviteModal(false);
  };

  const handleUpdateMember = (memberId: string, updates: Partial<TeamMember>) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId ? { ...member, ...updates } : member
    ));
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
    }
  };

  // Afficher un message d'accès refusé si pas de service entreprise
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!hasEnterpriseService) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
          <p className="text-gray-600 mb-6">
            La gestion multi-utilisateurs est disponible uniquement avec le Service Entreprise.
          </p>
          <div className="space-y-3">
            <a
              href="/#dashboard/services"
              className="block w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Voir les services disponibles
            </a>
            <a
              href="/#dashboard"
              className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Retour au tableau de bord
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Redirection automatique dans 3 secondes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a 
                href="#dashboard/services"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion Multi-Utilisateurs
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">Service Entreprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total membres</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Connectés aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Liste des membres */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              {/* Header avec filtres */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-lg font-semibold text-gray-900">Membres de l'équipe</h2>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inviter un membre
                  </button>
                </div>
                
                {/* Filtres */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Tous les rôles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>

              {/* Liste des membres */}
              <div className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold">
                          {member.avatar}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleInfo(member.role).color}`}>
                              {getRoleInfo(member.role).icon}
                              <span className="ml-1">{getRoleInfo(member.role).name}</span>
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {member.status === 'active' ? 'Actif' : member.status === 'pending' ? 'En attente' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <span>Dernière connexion : {member.lastLogin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rôles et permissions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rôles et Permissions</h3>
              <div className="space-y-3">
                {roles.map(role => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                        {role.icon}
                        <span className="ml-1">{role.name}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {teamMembers.filter(m => m.role === role.id).length} membre(s)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {role.id === 'admin' && 'Accès complet à toutes les fonctionnalités'}
                      {role.id === 'manager' && 'Gestion des équipes et projets'}
                      {role.id === 'user' && 'Utilisation standard des outils'}
                      {role.id === 'viewer' && 'Consultation uniquement'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Envoyer un message à l'équipe
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Voir les statistiques d'usage
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                  <Key className="h-4 w-4 inline mr-2" />
                  Gérer les clés API
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inviter un nouveau membre</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleInviteUser({
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Inviter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le membre</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateMember(selectedMember.id, {
                role: formData.get('role') as any,
                status: formData.get('status') as any
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={selectedMember.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedMember.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    name="role"
                    defaultValue={selectedMember.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    name="status"
                    defaultValue={selectedMember.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiUserManagement; 