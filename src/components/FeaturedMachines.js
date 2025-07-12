import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MachineCard from './MachineCard';
const featuredMachines = [
    {
        id: '1',
        name: 'Finisseur VÖGELE SUPER 1800-3i',
        brand: 'VÖGELE',
        model: 'SUPER 1800-3i',
        category: 'Matériel de Voirie',
        year: 2023,
        price: 45000,
        condition: 'new',
        description: 'Finisseur haute performance pour travaux routiers',
        specifications: {
            weight: 19500,
            dimensions: '6.1m x 2.55m x 3.0m',
            power: {
                value: 127,
                unit: 'kW'
            },
            operatingCapacity: 18500,
            workingWeight: 19500
        },
        images: ['https://www.wirtgen-group.com/media/82-wirtgen-group/voegele/super-paver/super_1800_3i/voegele-super-1800-3i-1.jpg'],
        seller: {
            id: 's1',
            name: 'Minegrid Equipment Pro',
            rating: 4.8,
            location: 'Casablanca',
        },
    },
    {
        id: '2',
        name: 'Grue Mobile Liebherr LTM 1300',
        brand: 'Liebherr',
        model: 'LTM 1300',
        category: 'Grues & Levage',
        year: 2022,
        price: 98000,
        condition: 'used',
        description: 'Grue mobile tout-terrain haute capacité',
        specifications: {
            weight: 72000,
            dimensions: '15.3m x 3.0m x 4.0m',
            power: {
                value: 450,
                unit: 'kW'
            },
            operatingCapacity: 300000,
            workingWeight: 72000
        },
        images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'],
        seller: {
            id: 's2',
            name: 'Solutions BTP Maroc',
            rating: 4.6,
            location: 'Rabat',
        },
    },
    {
        id: '3',
        name: 'Concasseur Mobile KLEEMANN MC 110 Zi EVO',
        brand: 'KLEEMANN',
        model: 'MC 110 Zi EVO',
        category: 'Concasseurs',
        year: 2023,
        price: 52000,
        condition: 'new',
        description: 'Concasseur mobile à mâchoires pour applications minières',
        specifications: {
            weight: 38500,
            dimensions: '13.9m x 3.0m x 3.6m',
            power: {
                value: 240,
                unit: 'kW'
            },
            operatingCapacity: 35000,
            workingWeight: 38500
        },
        images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80'],
        seller: {
            id: 's3',
            name: 'WIRTGEN GROUP Maroc',
            rating: 4.9,
            location: 'Tanger',
        },
    },
];
export default function FeaturedMachines() {
    return (_jsx("div", { className: "py-8 bg-gradient-to-b from-primary-50 to-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Machines en Vedette" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: featuredMachines.map((machine) => (_jsx(MachineCard, { machine: machine }, machine.id))) })] }) }));
}
