import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import CategoryList from './components/CategoryList';
import FeaturedMachines from './components/FeaturedMachines';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import SubcategoryPage from './pages/SubcategoryPage';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import Blog from './pages/Blog';
import SellEquipment from './pages/SellEquipment';
import Dashboard from './pages/Dashboard.jsx';
import { useExchangeRates } from './hooks/useExchangeRates';
import SectorMachines from './pages/SectorMachines';
import SellerMachines from './pages/SellerMachines';
import Hero from './components/Hero';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import ChatWidget from './components/ChatWidget';
import FinancingRequest from './pages/FinancingRequest';
import ProDashboard from './pages/ProDashboard';
import EnterpriseService from './pages/EnterpriseService';
import EnterpriseDashboard from './pages/EnterpriseDashboardModular.tsx';
import DashboardConfigurator from './pages/DashboardConfigurator';
import EnterpriseDashboardDisplay from './pages/EnterpriseDashboardDisplay';
import VendeurDashboardLegacy from './pages/VendeurDashboardLegacy';
import VitrinePersonnalisee from './pages/VitrinePersonnalisee';
import PublicationRapide from './pages/PublicationRapide';
import DevisGenerator from './pages/DevisGenerator';
import DocumentsEspace from './pages/DocumentsEspace';
import MessagesBoite from './pages/MessagesBoite';
import PlanningPro from './pages/PlanningPro';
import AssistantIA from './pages/AssistantIA';
import WidgetTest from './WidgetTest';
import VendeurDashboardRestored from './pages/VendeurDashboardRestored';
import EnterpriseDashboardVendeurDisplay from './pages/EnterpriseDashboardVendeurDisplay';
import EnterpriseDashboardLoueurDisplay from './pages/EnterpriseDashboardLoueurDisplay';

console.log('🔥 App.tsx: import EnterpriseDashboard principal');

const queryClient = new QueryClient();

function AppContent() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#');


  useEffect(() => {
    
    const handleHash = () => {
      setCurrentHash(window.location.hash || '#');
    };

    handleHash(); // initial
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [page, params] = currentHash.slice(1).split('?');
  const searchParams = new URLSearchParams(params || '');
  const pathParts = page.split('?')[0].split('/');

  useExchangeRates();

  const renderContent = () => {
      // 🔥 Ajouter cette condition spéciale AVANT le switch
      if (window.location.pathname === '/update-password') {
        return <UpdatePassword />;
      }    
      
      console.log('=== NAVIGATION DEBUG ===');
      console.log('Current hash:', currentHash);
      console.log('Path parts:', pathParts);
      console.log('Page:', pathParts[0]);
      console.log('Full URL:', window.location.href);
      console.log('========================');
      
    switch (pathParts[0]) {
      case 'machines':
        if (pathParts.length === 2) {
          return <MachineDetail machineId={pathParts[1]} />;
        }
        return <Machines category={searchParams.get('categorie')} />;

      case 'seller':
        if (pathParts.length === 2) {
          return <SellerMachines sellerId={pathParts[1]} />;
        }
        return <Machines category={searchParams.get('categorie')} />;

      case 'services':
        if (pathParts.length === 2) {
          return <Services service={pathParts[1]} />;
        }
        return <Services />;

      case 'contact':
        return <Contact />;

      case 'inscription':
        return <Register initialType={searchParams.get('type') as 'client' | 'seller'} />;

      case 'connexion':
        return <Login />;

      case 'mot-de-passe-oublie':
        return <ForgotPassword />;

      case 'update-password':
        return <UpdatePassword />;
        
      case 'blog':
        return <Blog postId={pathParts[1]} />;

      case 'vendre':
        return <SellEquipment />;

      case 'dashboard':
        return <Dashboard section={pathParts[1]} />;

      case 'financement':
        return <FinancingRequest />;

      case 'secteur':
        return <SectorMachines />;

      case 'pro':
        return <ProDashboard />;

      case 'entreprise':
        return <EnterpriseService />;

      case 'dashboard-entreprise':
        return <DashboardConfigurator />;

      case 'dashboard-entreprise-display':
        return <EnterpriseDashboardVendeurDisplay />;

      case 'dashboard-loueur-display':
        return <EnterpriseDashboardLoueurDisplay />;

      case 'dashboard-configurator':
        return <DashboardConfigurator />;

      case 'dashboard-vendeur-legacy':
        return <VendeurDashboardLegacy />;

      case 'dashboard-vendeur-restored':
        return <VendeurDashboardRestored />;

      case 'vitrine':
        return <VitrinePersonnalisee />;

      case 'publication':
        return <PublicationRapide />;

      case 'devis':
        return <DevisGenerator />;

      case 'documents':
        return <DocumentsEspace />;

      case 'messages':
        return <MessagesBoite />;

      case 'planning':
        return <PlanningPro />;

      case 'assistant-ia':
        return <AssistantIA />;

      case 'test-widget':
        return <WidgetTest />;
        
      default:
        return (
          <>
            <Hero />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Parcourir par Secteur d'activité</h2>
              <CategoryList />
            </div>
            <FeaturedMachines />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {renderContent()}
      </main>
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
