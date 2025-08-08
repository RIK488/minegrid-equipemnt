import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  Home,
  User,
  ChevronDown,
  LogIn,
  Wallet,
  GraduationCap,
  PenTool as Tool,
  Wrench,
  X,
  LogOut,
  Settings,
  Building2,
  ShoppingCart,
  Heart,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

import supabaseClient from '../utils/supabaseClient';
import CurrencySelector from './CurrencySelector';
import { categories, iconMap } from '../data/categories';

const servicesMenu = [
  { label: 'Financement', section: 'financement', icon: Wallet },
  { label: 'Maintenance', section: 'maintenance', icon: Tool },
  { label: 'Formation', section: 'formation', icon: GraduationCap },
  { label: 'Support Technique', section: 'support', icon: Wrench },
];

interface Session {
  user: {
    id: string;
    email: string;
  };
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMachinesMenuOpen, setIsMachinesMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [machinesMenuTimeout, setMachinesMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [servicesMenuTimeout, setServicesMenuTimeout] = useState<NodeJS.Timeout | null>(null);

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleMachinesMenuEnter = () => {
    if (machinesMenuTimeout) {
      clearTimeout(machinesMenuTimeout);
      setMachinesMenuTimeout(null);
    }
    setIsMachinesMenuOpen(true);
  };

  const handleMachinesMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsMachinesMenuOpen(false);
      setHoveredCategoryId(null);
    }, 300); // 300ms de délai
    setMachinesMenuTimeout(timeout);
  };

  const handleServicesMenuEnter = () => {
    if (servicesMenuTimeout) {
      clearTimeout(servicesMenuTimeout);
      setServicesMenuTimeout(null);
    }
    setIsServicesMenuOpen(true);
  };

  const handleServicesMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsServicesMenuOpen(false);
    }, 300); // 300ms de délai
    setServicesMenuTimeout(timeout);
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }: { data: any }) => {
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
      if (machinesMenuTimeout) clearTimeout(machinesMenuTimeout);
      if (servicesMenuTimeout) clearTimeout(servicesMenuTimeout);
    };
  }, [machinesMenuTimeout, servicesMenuTimeout]);

  // Masquer complètement le header si on est sur la page Pro
  if (window.location.hash.startsWith('#pro')) {
    return null;
  }

  return (
    <header className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-gray-400 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <a href="#" className="flex-shrink-0 flex items-center space-x-2">
              <img src="/logo Minegrid equipement trans.png" alt="Logo Minegrid" className="h-20 w-auto" />
            </a>
          </div>

          {!window.location.hash.startsWith('#machines') && (
            <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher des machines..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      window.location.hash = `#machines?search=${encodeURIComponent(searchTerm)}`;
                    }
                  }}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button
                className="flex items-center text-gray-700 hover:text-orange-600"
                onMouseEnter={handleMachinesMenuEnter}
                onMouseLeave={handleMachinesMenuLeave}
              >
                Machines
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isMachinesMenuOpen && (
                <div
                  className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg flex z-50"
                  onMouseEnter={handleMachinesMenuEnter}
                  onMouseLeave={handleMachinesMenuLeave}
                >
                  <div className="w-56 py-2">
                    {categories.map((cat) => {
                      const Icon = iconMap[cat.icon as keyof typeof iconMap] || (() => null);
                      return (
                        <div
                          key={cat.id}
                          onMouseEnter={() => setHoveredCategoryId(cat.id)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition"
                        >
                          <Icon className="h-4 w-4 mr-2 text-gray-400" />
                          {cat.name}
                        </div>
                      );
                    })}
                  </div>
                  {hoveredCategoryId && (
                    <div className="w-64 py-2 border-l bg-white">
                      {categories
                        .filter((c) => c.id === hoveredCategoryId)
                        .map((cat) =>
                          cat.subcategories?.map((sub) => (
                            <a
                              key={sub.id}
                              href={`#machines?machine=${encodeURIComponent(cat.name)}&type=${encodeURIComponent(sub.name)}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                            >
                              {sub.name}
                            </a>
                          ))
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                className="flex items-center text-gray-700 hover:text-orange-600"
                onMouseEnter={handleServicesMenuEnter}
                onMouseLeave={handleServicesMenuLeave}
              >
                Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isServicesMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2"
                  onMouseEnter={handleServicesMenuEnter}
                  onMouseLeave={handleServicesMenuLeave}
                >
                  {servicesMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                      key={item.section}
                      href={`#services/${item.section}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 transition-all duration-150 hover:text-primary-600 hover:translate-x-1 hover:bg-primary-50"
                    >
                      <Icon className="h-4 w-4 mr-2 text-gray-400 transition-transform group-hover:scale-110" />
                      {item.label}
                    </a>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href="#pro"
              className="text-gray-700 hover:text-primary-600 font-semibold"
            >
              Espace Pro
            </a>

            <a href="#blog" className="text-gray-700 hover:text-primary-600">Blog</a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600">Contact</a>
          </nav>

          <div className="flex items-center">
            <div className="block">
              <CurrencySelector />
            </div>
            <a href="#" className="p-2 rounded-full hover:bg-primary-50" title="Accueil">
              <Home className="h-6 w-6 text-primary-600" />
            </a>

            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-primary-50">
                <User className="h-6 w-6 text-primary-600" />
              </button>

              <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-500">Bonjour, {user.user_metadata?.full_name || user.email}</div>
                    <a
                      href="#dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon espace
                    </a>
                    <button
                      onClick={async () => {
                        await supabaseClient.auth.signOut();
                        window.location.hash = '#';
                      }}
                      className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="#connexion"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Connexion
                    </a>
                    <a
                      href="#inscription"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Inscription
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white shadow-md z-40">
          <nav className="flex flex-col px-4 py-2 space-y-2">
            <a href="#machines" className="text-gray-700 hover:text-primary-600">Machines</a>
            <a href="#services" className="text-gray-700 hover:text-primary-600">Services</a>
            <a href="#pro" className="text-gray-700 hover:text-primary-600 font-semibold">Espace Pro</a>
            <a href="#blog" className="text-gray-700 hover:text-primary-600">Blog</a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600">Contact</a>
            {user ? (
              <>
                <a href="#dashboard" className="text-gray-700 hover:text-primary-600">Mon espace</a>
                <button
                  onClick={async () => {
                    await supabaseClient.auth.signOut();
                    window.location.hash = '#';
                  }}
                  className="text-left text-gray-700 hover:text-primary-600"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <a href="#connexion" className="text-gray-700 hover:text-primary-600">Connexion</a>
                <a href="#inscription" className="text-gray-700 hover:text-primary-600">Inscription</a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
