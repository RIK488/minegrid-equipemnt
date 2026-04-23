import React from 'react';
import { Truck, Shovel, Drill, Construction, GitFork, Mountain, Hammer } from 'lucide-react';
import { useCategoryCounts } from '../hooks/queries';
import { JOB_SECTORS_HOME } from '../data/sectors';

const iconMap = {
  Truck: Truck,
  Shovel: Shovel,
  Drill: Drill,
  Construction: Construction,
  GitFork: GitFork,
  Mountain: Mountain,
  Hammer: Hammer,
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

const POPULAR_SHARE_THRESHOLD = 0.2;

export default function CategoryList() {
  const { data: counts, isLoading } = useCategoryCounts();

  const totalCount = counts
    ? Object.values(counts).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {JOB_SECTORS_HOME.map((category) => {
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
