import React from 'react';

interface TopBarProps {
  currentTime: Date;
  userType: string;
  onLogout: () => void;
  onSidebarToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  currentTime, 
  userType, 
  onLogout, 
  onSidebarToggle 
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Minegrid Équipement</h2>
            <p className="text-sm text-gray-500">Dashboard {userType}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{formatTime(currentTime)}</p>
            <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
          </div>
          
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 