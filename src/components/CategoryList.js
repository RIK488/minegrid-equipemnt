import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Truck, Shovel, Drill, Construction, GitFork, Mountain, Hammer, Wrench } from 'lucide-react';
const categories = [
    { id: '1', name: 'Transport', icon: 'Truck', count: 156 },
    { id: '2', name: 'Terrassement', icon: 'Shovel', count: 89 },
    { id: '3', name: 'Forage', icon: 'Drill', count: 67 },
    { id: '4', name: 'Voirie', icon: 'Construction', count: 123 },
    { id: '5', name: 'Maintenance & Levage', icon: 'GitFork', count: 45 },
    { id: '6', name: 'Construction', icon: 'Construction', count: 234 },
    { id: '7', name: 'Mines', icon: 'Mountain', count: 78 },
    { id: '8', name: 'Outils & Accessoires', icon: 'Hammer', count: 345 },
];
const iconMap = {
    Truck: Truck,
    Shovel: Shovel,
    Drill: Drill,
    Construction: Construction,
    GitFork: GitFork,
    Mountain: Mountain,
    Hammer: Hammer,
    Wrench: Wrench,
};
const largeIcons = [
    'Truck',
    'Pelle',
    'Forage',
    'Voierie',
    'Grue',
    'Construction',
    'Concasseur',
    'Outils',
];
export default function CategoryList() {
    return (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4", children: categories.map((category) => {
            const Icon = iconMap[category.icon];
            const isCustom = largeIcons.includes(category.icon);
            const isPopular = category.count >= 200;
            return (_jsxs("a", { href: `#secteur?secteur=${encodeURIComponent(category.name)}`, className: "flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow hover:shadow-md hover:bg-gray-50 transition duration-200 group", children: [_jsx("div", { className: "flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-100", children: _jsx(Icon, { className: "h-8 w-8", strokeWidth: 2 }) }), _jsx("span", { className: "text-sm font-semibold text-gray-900 text-center", children: category.name }), _jsxs("span", { className: "text-xs text-gray-500", children: [category.count, " articles"] }), isPopular && (_jsx("span", { className: "mt-1 text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium", children: "Populaire" }))] }, category.id));
        }) }));
}
