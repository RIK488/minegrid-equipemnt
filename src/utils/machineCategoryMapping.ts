import { categories } from '../data/categories';

/**
 * Alias Mascus → sous-catégorie locale (extrait de src/pages/Machines.tsx
 * pour pouvoir être réutilisé côté comptage sans dupliquer la logique).
 */
const mascusCategoryAliases: Record<string, string> = {
  crawlerexcavators: 'pelle-chenilles',
  wheeledexcavators: 'pelle-pneus',
  wheelloaders: 'chargeuse-pneus',
  backhoeloaders: 'chargeuse-pelleteuse',
  dozers: 'bulldozer',
  motorgraders: 'niveleuse',
  dumptrucks: 'camion-benne',
  articulateddumptrucks: 'camion-benne',
  rigiddumptrucks: 'tombereau-rigide',
  singledrumrollers: 'compacteur-monocylindre',
  tandemrollers: 'compacteur-tandem',
  forklifts: 'chariot-elevateur',
  telehandlers: 'telescopique',
  asphaltpavers: 'finisseur',
  generators: 'groupe-electrogene',
  compressors: 'compresseur',
  concretemixers: 'camion-melangeur',
  crushers: 'concasseur',
  screeners: 'crible',
  drillingrigs: 'foreuse',
  tractors: 'tracteur-routier',
};

const groupToJobSector: Record<string, string> = {
  'transport & camions': 'Transport',
  'terrassement & excavation': 'Terrassement',
  'voirie & compactage': 'Voirie',
  'levage & manutention': 'Maintenance & Levage',
  'concassage & criblage': 'Mines',
  forage: 'Forage',
  'camions & transport': 'Transport',
  'terrassement et excavation': 'Terrassement',
  'matériel de voirie': 'Voirie',
  'maintenance & levage': 'Maintenance & Levage',
  'concasseurs & cribles': 'Mines',
  'outils & accessoires': 'Outils & Accessoires',
};

const subtypeToGroupName = new Map<string, string>();
const labelToSubtypeId: Record<string, string> = {};
categories.forEach((group) => {
  (group.subcategories || []).forEach((sub) => {
    const subId = String(sub.id || '').toLowerCase();
    subtypeToGroupName.set(subId, String(group.name || '').toLowerCase());
    labelToSubtypeId[String(sub.name || '').toLowerCase()] = subId;
  });
});

/**
 * Secteur métier d'une machine à partir de ses champs bruts Supabase
 * (category, type, specifications.category_name).
 *
 * Source de vérité unique pour le filtrage et le comptage — si on change la
 * table de correspondance, on le fait ici plutôt que dans chaque composant.
 */
export function resolveMachineSector(row: {
  category?: string | null;
  type?: string | null;
  specifications?: { category_name?: string | null } | null;
}): string {
  const rawCategoryId = String(row.category || '').toLowerCase();
  const rawType = String(row.type || '').toLowerCase();
  const rawCategoryName = String(row.specifications?.category_name || '').toLowerCase();

  const compactCategory = rawCategoryId.replace(/[\s_-]/g, '');
  const compactCategoryName = rawCategoryName.replace(/[\s_-]/g, '');

  let normalizedCategory =
    mascusCategoryAliases[compactCategory] ||
    mascusCategoryAliases[compactCategoryName] ||
    rawCategoryId;

  if (!subtypeToGroupName.has(normalizedCategory)) {
    const fromTypeLabel = labelToSubtypeId[rawType];
    const fromCategoryLabel = labelToSubtypeId[rawCategoryId];
    normalizedCategory = fromTypeLabel || fromCategoryLabel || normalizedCategory;
  }

  const machineGroup = subtypeToGroupName.get(normalizedCategory) || '';
  return groupToJobSector[machineGroup] || 'Construction';
}
