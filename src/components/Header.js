import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Menu, Home, User, ChevronDown, LogIn, Wallet, GraduationCap, PenTool as Tool, Wrench, } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import CurrencySelector from './CurrencySelector';
import { categories, iconMap } from '../data/categories';
const servicesMenu = [
    { label: 'Financement', section: 'financement', icon: Wallet },
    { label: 'Maintenance', section: 'maintenance', icon: Tool },
    { label: 'Formation', section: 'formation', icon: GraduationCap },
    { label: 'Support Technique', section: 'support', icon: Wrench },
];
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMachinesMenuOpen, setIsMachinesMenuOpen] = useState(false);
    const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
    const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [machinesMenuTimeout, setMachinesMenuTimeout] = useState(null);
    const [servicesMenuTimeout, setServicesMenuTimeout] = useState(null);
    const [session, setSession] = useState(null);
    const [userName, setUserName] = useState(null);
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
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            const name = data.session?.user.user_metadata?.full_name || data.session?.user.email;
            setUserName(name || null);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const name = session?.user.user_metadata?.full_name || session?.user.email;
            setUserName(name || null);
        });
        return () => {
            listener.subscription.unsubscribe();
            if (machinesMenuTimeout)
                clearTimeout(machinesMenuTimeout);
            if (servicesMenuTimeout)
                clearTimeout(servicesMenuTimeout);
        };
    }, [machinesMenuTimeout, servicesMenuTimeout]);
    return (_jsxs("header", { className: "bg-white shadow-md relative z-50", children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { className: "p-2 rounded-md text-gray-400 lg:hidden", onClick: () => setIsMenuOpen(!isMenuOpen), children: _jsx(Menu, { className: "h-6 w-6" }) }), _jsx("a", { href: "#", className: "flex-shrink-0 flex items-center space-x-2", children: _jsx("img", { src: "/logo Minegrid equipement trans.png", alt: "Logo Minegrid", className: "h-20 w-auto" }) })] }), !window.location.hash.startsWith('#machines') && (_jsx("div", { className: "flex-1 max-w-2xl mx-4 hidden lg:block", children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Rechercher des machines...", className: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500", onKeyDown: (e) => {
                                            if (e.key === 'Enter' && searchTerm.trim()) {
                                                window.location.hash = `#machines?search=${encodeURIComponent(searchTerm)}`;
                                            }
                                        } }), _jsx(Search, { className: "absolute right-3 top-2.5 h-5 w-5 text-gray-400" })] }) })), _jsxs("nav", { className: "hidden md:flex items-center space-x-6", children: [_jsxs("div", { className: "relative group", children: [_jsxs("button", { className: "flex items-center text-gray-700 hover:text-primary-600", onMouseEnter: handleMachinesMenuEnter, onMouseLeave: handleMachinesMenuLeave, children: ["Machines", _jsx(ChevronDown, { className: "ml-1 h-4 w-4" })] }), isMachinesMenuOpen && (_jsxs("div", { className: "absolute left-0 mt-2 bg-white rounded-lg shadow-lg flex z-50", onMouseEnter: handleMachinesMenuEnter, onMouseLeave: handleMachinesMenuLeave, children: [_jsx("div", { className: "w-56 py-2", children: categories.map((cat) => {
                                                        const Icon = iconMap[cat.icon] || (() => null);
                                                        return (_jsxs("div", { onMouseEnter: () => setHoveredCategoryId(cat.id), className: "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition", children: [_jsx(Icon, { className: "h-4 w-4 mr-2 text-gray-400" }), cat.name] }, cat.id));
                                                    }) }), hoveredCategoryId && (_jsx("div", { className: "w-64 py-2 border-l bg-white", children: categories
                                                        .filter((c) => c.id === hoveredCategoryId)
                                                        .map((cat) => cat.subcategories?.map((sub) => (_jsx("a", { href: `#machines?machine=${encodeURIComponent(cat.name)}&type=${encodeURIComponent(sub.name)}`, className: "block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition", children: sub.name }, sub.id)))) }))] }))] }), _jsxs("div", { className: "relative group", children: [_jsxs("button", { className: "flex items-center text-gray-700 hover:text-primary-600", onMouseEnter: handleServicesMenuEnter, onMouseLeave: handleServicesMenuLeave, children: ["Services", _jsx(ChevronDown, { className: "ml-1 h-4 w-4" })] }), isServicesMenuOpen && (_jsx("div", { className: "absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2", onMouseEnter: handleServicesMenuEnter, onMouseLeave: handleServicesMenuLeave, children: servicesMenu.map((item) => {
                                                const Icon = item.icon;
                                                return (_jsxs("a", { href: `#services/${item.section}`, className: "flex items-center px-4 py-2 text-sm text-gray-700 transition-all duration-150 hover:text-primary-600 hover:translate-x-1 hover:bg-primary-50", children: [_jsx(Icon, { className: "h-4 w-4 mr-2 text-gray-400 transition-transform group-hover:scale-110" }), item.label] }, item.section));
                                            }) }))] }), _jsx("a", { href: "#pro", className: "text-gray-700 hover:text-primary-600 font-semibold", children: "Espace Pro" }), _jsx("a", { href: "#blog", className: "text-gray-700 hover:text-primary-600", children: "Blog" }), _jsx("a", { href: "#contact", className: "text-gray-700 hover:text-primary-600", children: "Contact" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "block", children: _jsx(CurrencySelector, {}) }), _jsx("a", { href: "#", className: "p-2 rounded-full hover:bg-primary-50", title: "Accueil", children: _jsx(Home, { className: "h-6 w-6 text-primary-600" }) }), _jsxs("div", { className: "relative group", children: [_jsx("button", { className: "p-2 rounded-full hover:bg-primary-50", children: _jsx(User, { className: "h-6 w-6 text-primary-600" }) }), _jsx("div", { className: "absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50", children: session ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "px-4 py-2 text-sm text-gray-500", children: ["Bonjour, ", userName] }), _jsxs("a", { href: "#dashboard", className: "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600", children: [_jsx(User, { className: "h-4 w-4 mr-2" }), "Mon espace"] }), _jsxs("button", { onClick: async () => {
                                                            await supabase.auth.signOut();
                                                            window.location.hash = '#';
                                                        }, className: "flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600", children: [_jsx(LogIn, { className: "h-4 w-4 mr-2 rotate-180" }), "D\u00E9connexion"] })] })) : (_jsxs(_Fragment, { children: [_jsxs("a", { href: "#connexion", className: "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600", children: [_jsx(LogIn, { className: "h-4 w-4 mr-2" }), "Connexion"] }), _jsxs("a", { href: "#inscription", className: "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600", children: [_jsx(User, { className: "h-4 w-4 mr-2" }), "Inscription"] })] })) })] })] })] }) }), isMenuOpen && (_jsx("div", { className: "lg:hidden absolute top-16 left-0 w-full bg-white shadow-md z-40", children: _jsxs("nav", { className: "flex flex-col px-4 py-2 space-y-2", children: [_jsx("a", { href: "#machines", className: "text-gray-700 hover:text-primary-600", children: "Machines" }), _jsx("a", { href: "#services", className: "text-gray-700 hover:text-primary-600", children: "Services" }), _jsx("a", { href: "#pro", className: "text-gray-700 hover:text-primary-600 font-semibold", children: "Espace Pro" }), _jsx("a", { href: "#blog", className: "text-gray-700 hover:text-primary-600", children: "Blog" }), _jsx("a", { href: "#contact", className: "text-gray-700 hover:text-primary-600", children: "Contact" }), session ? (_jsxs(_Fragment, { children: [_jsx("a", { href: "#dashboard", className: "text-gray-700 hover:text-primary-600", children: "Mon espace" }), _jsx("button", { onClick: async () => {
                                        await supabase.auth.signOut();
                                        window.location.hash = '#';
                                    }, className: "text-left text-gray-700 hover:text-primary-600", children: "D\u00E9connexion" })] })) : (_jsxs(_Fragment, { children: [_jsx("a", { href: "#connexion", className: "text-gray-700 hover:text-primary-600", children: "Connexion" }), _jsx("a", { href: "#inscription", className: "text-gray-700 hover:text-primary-600", children: "Inscription" })] }))] }) }))] }));
};
export default Header;
