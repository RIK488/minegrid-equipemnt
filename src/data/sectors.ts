/**
 * Source unique pour les secteurs métier affichés (accueil, filtres catalogue)
 * et pour le mapping groupe catalogue → secteur (resolveMachineSector).
 *
 * Toute nouvelle entrée doit rester alignée avec `resolveMachineSector` /
 * `useCategoryCounts` (clés = libellés `name` ci-dessous).
 */

/** Secteur par défaut si aucune correspondance n'est trouvée. */
export const DEFAULT_JOB_SECTOR = 'Construction' as const;

/**
 * Correspondance nom de groupe catalogue (minuscule, tel que produit par
 * `categories[].name` via subtypeToGroupName) → libellé secteur métier.
 */
export const GROUP_TO_JOB_SECTOR: Record<string, string> = {
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

/**
 * Tuiles secteur sur la page d'accueil (CategoryList) : ordre d'affichage.
 * `icon` = clé Lucide utilisée par CategoryList (iconMap).
 */
export const JOB_SECTORS_HOME = [
  { id: '1', name: 'Transport', icon: 'Truck' as const },
  { id: '2', name: 'Terrassement', icon: 'Shovel' as const },
  { id: '3', name: 'Forage', icon: 'Drill' as const },
  { id: '4', name: 'Voirie', icon: 'Construction' as const },
  { id: '5', name: 'Maintenance & Levage', icon: 'GitFork' as const },
  { id: '6', name: 'Construction', icon: 'Construction' as const },
  { id: '7', name: 'Mines', icon: 'Mountain' as const },
  { id: '8', name: 'Outils & Accessoires', icon: 'Hammer' as const },
] as const;

export type JobSectorHomeEntry = (typeof JOB_SECTORS_HOME)[number];
