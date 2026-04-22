import React from 'react';
import type { Category } from '../types';
import { Truck, Shovel, Drill, Construction, GitFork, Mountain, Hammer, Wrench } from 'lucide-react';
import { useCategoryCounts } from '../hooks/queries';

const categories: Category[] = [
  { id: '1', name: 'Transport', icon: 'Truck', count: 0 },
  { id: '2', name: 'Terrassement', icon: 'Shovel', count: 0 },
  { id: '3', name: 'Forage', icon: 'Drill', count: 0 },
  { id: '4', name: 'Voirie', icon: 'Construction', count: 0 },
  { id: '5', name: 'Maintenance & Levage', icon: 'GitFork', count: 0 },
  { id: '6', name: 'Construction', icon: 'Construction', count: 0 },
  { id: '7', name: 'Mines', icon: 'Mountain', count: 0 },
  { id: '8', name: 'Outils & Accessoires', icon: 'Hammer', count: 0 },
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

// Seuil "Populaire" : on l'applique aux compteurs dynamiques. Un secteur qui
// a plus de 20% du total des annonces est considéré "Populaire".
const POPULAR_SHARE_THRESHOLD = 0.2;

export default function CategoryList() {
  const { data: counts, isLoading } = useCategoryCounts();

  const totalCount = counts
    ? Object.values(counts).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {categories.map((category) => {
        const Icon = iconMap[category.icon as keyof typeof iconMap];
        const dynamicCount = counts?.[category.name];
        const displayCount = dynamicCount ?? 0;
        const isPopular =
          totalCount > 0 && displayCount / totalCount >= POPULAR_SHARE_THRESHOLD;

        return (
          <a
            href={`#machines?categorie=${encodeURIComponent(category.name)}`}
            key={category.id}
            className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow hover:shadow-md hover:bg-gray-50 transition duration-200 group"
          >
            <div className="flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-100">
              <Icon className="h-8 w-8" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-gray-900 text-center">{category.name}</span>
            <span className="text-xs text-gray-500">
              {isLoading && dynamicCount === undefined
                ? '…'
                : `${displayCount} annonce${displayCount > 1 ? 's' : ''}`}
            </span>
            {isPopular && (
              <span className="mt-1 text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                Populaire
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
