import React from 'react';

interface MainDashboardLayoutProps {
  children: React.ReactNode;
}

const MainDashboardLayout: React.FC<MainDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default MainDashboardLayout; 