import React, { useState, useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationToast';
import Header from './components/Header';
import CategoryList from './components/CategoryList';
import FeaturedMachines from './components/FeaturedMachines';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard.jsx';
import { useExchangeRates } from './hooks/useExchangeRates';
import SectorMachines from './pages/SectorMachines';
import SellerMachines from './pages/SellerMachines';
import Hero from './components/Hero';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import ChatWidget from './components/ChatWidget';
import FinancingRequest from './pages/FinancingRequest';
import ProtectedRoute from './components/ProtectedRoute';

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[45vh] gap-3 text-gray-600">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    <span className="text-sm">Chargement du module…</span>
  </div>
);

const SellEquipment = lazy(() => import('./pages/SellEquipment'));
const ProDashboard = lazy(() => import('./pages/ProDashboard'));
const EnterpriseService = lazy(() => import('./pages/EnterpriseService'));
const DashboardConfigurator = lazy(() => import('./pages/DashboardConfigurator'));
const VendeurDashboardLegacy = lazy(() => import('./pages/VendeurDashboardLegacy'));
const VitrinePersonnalisee = lazy(() => import('./pages/VitrinePersonnalisee'));
const PublicationRapide = lazy(() => import('./pages/PublicationRapide'));
const DevisGenerator = lazy(() => import('./pages/DevisGenerator'));
const DocumentsEspace = lazy(() => import('./pages/DocumentsEspace'));
const MessagesBoite = lazy(() => import('./pages/MessagesBoite'));
const PlanningPro = lazy(() => import('./pages/PlanningPro'));
const AssistantIA = lazy(() => import('./pages/AssistantIA'));
const WidgetTest = lazy(() => import('./WidgetTest'));
const VendeurDashboardRestored = lazy(() => import('./pages/VendeurDashboardRestored'));
const EnterpriseDashboardVendeurDisplay = lazy(
  () => import('./pages/EnterpriseDashboardVendeurDisplay')
);
const EnterpriseDashboardLoueurDisplay = lazy(
  () => import('./pages/EnterpriseDashboardLoueurDisplay')
);
const EnterpriseDashboardMecanicienDisplay = lazy(
  () => import('./pages/EnterpriseDashboardMecanicienDisplay')
);
const EnterpriseDashboardTransporteurDisplay = lazy(
  () => import('./pages/EnterpriseDashboardTransporteurDisplay')
);
const EnterpriseDashboardTransitaireDisplay = lazy(
  () => import('./pages/EnterpriseDashboardTransitaireDisplay')
);
const EnterpriseDashboardLogisticienDisplay = lazy(
  () => import('./pages/EnterpriseDashboardLogisticienDisplay')
);
const EnterpriseDashboardInvestisseurDisplay = lazy(
  () => import('./pages/EnterpriseDashboardInvestisseurDisplay')
);
const EnterpriseDashboardCourtierDisplay = lazy(
  () => import('./pages/EnterpriseDashboardCourtierDisplay')
);
const PremiumDashboard = lazy(() => import('./pages/PremiumDashboard'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const PrioritySupport = lazy(() => import('./pages/PrioritySupport'));
const MultiUserManagement = lazy(() => import('./pages/MultiUserManagement'));
const GlobalMonitor = lazy(() => import('./pages/GlobalMonitor'));
const SourcesAdmin = lazy(() => import('./pages/SourcesAdmin'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Réduit les rafales de requêtes quand beaucoup d’utilisateurs naviguent */
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#');

  useEffect(() => {
    const handleHash = () => {
      setCurrentHash(window.location.hash || '#');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [page, params] = currentHash.slice(1).split('?');
  const searchParams = new URLSearchParams(params || '');
  const pathParts = page.split('?')[0].split('/');

  useExchangeRates();

  const renderContent = () => {
    if (window.location.pathname === '/update-password') {
      return <UpdatePassword />;
    }

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

      case 'dashboard-mecanicien-display':
        return <EnterpriseDashboardMecanicienDisplay />;

      case 'dashboard-transporteur-display':
        return <EnterpriseDashboardTransporteurDisplay />;

      case 'dashboard-transitaire-display':
        return <EnterpriseDashboardTransitaireDisplay />;

      case 'dashboard-logisticien-display':
        return <EnterpriseDashboardLogisticienDisplay />;

      case 'dashboard-investisseur-display':
        return <EnterpriseDashboardInvestisseurDisplay />;

      case 'dashboard-courtier-display':
        return <EnterpriseDashboardCourtierDisplay />;

      case 'premium-dashboard':
        return <PremiumDashboard />;

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

      case 'api-docs':
        return <ApiDocs />;

      case 'priority-support':
        return <PrioritySupport />;

      case 'multi-user-management':
        return <MultiUserManagement />;

      case 'global-monitor':
        return (
          <ProtectedRoute>
            <GlobalMonitor />
          </ProtectedRoute>
        );

      case 'admin-sources':
        return (
          <ProtectedRoute>
            <SourcesAdmin />
          </ProtectedRoute>
        );

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
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>{renderContent()}</Suspense>
        </ErrorBoundary>
      </main>
      <ChatWidget />
      <NotificationContainer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
