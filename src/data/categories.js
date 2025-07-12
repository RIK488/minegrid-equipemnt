import { Truck, PenTool, Hammer, Drill, Forklift, Ruler, Plane as Crane, Building2, Factory, Wrench, Tractor, Box, Shovel, BatteryFull as Bulldozer, MoveUpRight } from 'lucide-react';
// utils/getMachineTypeIds.ts
export const getMachineTypeIds = () => {
    return categories.flatMap(cat => cat.subcategories?.map(sub => sub.id) || []);
};
export const categories = [
    {
        id: 'Camions & Transport',
        name: 'Camions',
        icon: 'Truck',
        count: 0,
        subcategories: [
            { id: 'camion-benne', name: 'Camion benne', count: 0 },
            { id: 'porte-engin', name: 'Porte-engin', count: 0 },
            { id: 'camion-plateau', name: 'Camion plateau', count: 0 },
            { id: 'tracteur-routier', name: 'Tracteur routier', count: 0 },
            { id: 'camion-melangeur', name: 'Camion malaxeur', count: 0 },
            { id: 'semi-remorque', name: 'Semi-remorque', count: 0 },
        ],
    },
    {
        id: 'Terrassement et excavation',
        name: 'Pelles & chargeuses',
        icon: 'Forklift',
        count: 0,
        subcategories: [
            { id: 'mini-pelle', name: 'Mini-pelle', count: 0 },
            { id: 'pelle-chenilles', name: 'Pelle sur chenilles', count: 0 },
            { id: 'pelle-pneus', name: 'Pelle sur pneus', count: 0 },
            { id: 'pelle-long-reach', name: 'Pelle long reach', count: 0 },
            { id: 'pelle-demolition', name: 'Pelle de démolition', count: 0 },
            { id: 'pelle-grappin', name: 'Pelle à grappin', count: 0 },
        ],
    },
    {
        id: 'Matériel de voirie',
        name: 'Compacteurs & autres',
        icon: 'Tractor',
        count: 0,
        subcategories: [
            { id: 'niveleuse', name: 'Niveleuse', count: 0 },
            { id: 'finisseur', name: 'Finisseur', count: 0 },
            { id: 'raboteuse', name: 'Raboteuse', count: 0 },
            { id: 'compacteur-monocylindre', name: 'Compacteur monocylindre', count: 0 },
            { id: 'compacteur-tandem', name: 'Compacteur tandem', count: 0 },
            { id: 'rouleau-vibrant', name: 'Rouleau vibrant', count: 0 },
            { id: 'repandeuse', name: 'Répandeuse d’enrobé', count: 0 },
            { id: 'trancheuse', name: 'Trancheuse', count: 0 },
        ],
    },
    {
        id: 'Maintenance & Levage',
        name: 'Grues & Elevateurs',
        icon: 'MoveUpRight',
        count: 0,
        subcategories: [
            { id: 'grue-mobile', name: 'Grue mobile', count: 0 },
            { id: 'grue-tour', name: 'Grue à tour', count: 0 },
            { id: 'grue-araignee', name: 'Grue araignée', count: 0 },
            { id: 'chariot-elevateur', name: 'Chariot élévateur', count: 0 },
            { id: 'manitou', name: 'Chariot télescopique', count: 0 },
            { id: 'manuscopique', name: 'Manuscopique', count: 0 },
        ],
    },
    {
        id: 'Concasseurs & Cribles',
        name: 'Concasseurs & Cribles',
        icon: 'Hammer',
        count: 0,
        subcategories: [
            { id: 'concasseur-machoires', name: 'Concasseur à mâchoires', count: 0 },
            { id: 'concasseur-cone', name: 'Concasseur à cône', count: 0 },
            { id: 'concasseur-mobile', name: 'Concasseur mobile', count: 0 },
            { id: 'crible-mobile', name: 'Crible mobile', count: 0 },
            { id: 'broyeur', name: 'Broyeur', count: 0 },
            { id: 'scalpeur', name: 'Scalpeur', count: 0 },
        ],
    },
    {
        id: 'forage',
        name: 'Foreuses & autres',
        icon: 'Ruler',
        count: 0,
        subcategories: [
            { id: 'foreuse-rotative', name: 'Foreuse rotative', count: 0 },
            { id: 'foreuse-tariere', name: 'Foreuse à tarière', count: 0 },
            { id: 'foreuse-hydraulique', name: 'Foreuse hydraulique', count: 0 },
            { id: 'carotteuse', name: 'Carotteuse', count: 0 },
            { id: 'marteau-fdt', name: 'Marteau fond de trou', count: 0 },
        ],
    },
    {
        id: 'Outils & Accessoires',
        name: 'Outils & pièces détachées',
        icon: 'Drill',
        count: 0,
        subcategories: [
            { id: 'godet-cribleur', name: 'Godet cribleur', count: 0 },
            { id: 'brh', name: 'Brise-roche hydraulique (BRH)', count: 0 },
            { id: 'tiltrotateur', name: 'Tiltrotateur', count: 0 },
            { id: 'plaque-vibrante', name: 'Plaque vibrante', count: 0 },
            { id: 'lame-nivellement', name: 'Lame de nivellement', count: 0 },
            { id: 'treuil', name: 'Treuil hydraulique', count: 0 },
        ],
    },
];
export const iconMap = {
    Truck,
    Hammer,
    Drill,
    Forklift,
    Crane,
    Building2,
    Factory,
    Wrench,
    Tractor,
    Box,
    Ruler,
    Shovel,
    Bulldozer,
    PenTool,
    MoveUpRight
};
