import type { ComponentType } from 'react';
import TruckIcon from '../components/icons/TruckIcon';
import PelleIcon from '../components/icons/PelleIcon';
import ForageIcon from '../components/icons/ForageIcon';
import VoierieIcon from '../components/icons/VoierieIcon';
import CraneIcon from '../components/icons/CraneIcon';
import ConstructionIcon from '../components/icons/ConstructionIcon';
import ConcasseurIcon from '../components/icons/ConcasseurIcon';
import OutilsIcon from '../components/icons/OutilsIcon';
import { JOB_SECTORS_HOME } from './sectors';

const ICON_BY_SECTOR_NAME: Record<string, ComponentType<{ className?: string }>> = {
  Transport: TruckIcon,
  Terrassement: PelleIcon,
  Forage: ForageIcon,
  Voirie: VoierieIcon,
  'Maintenance & Levage': CraneIcon,
  Construction: ConstructionIcon,
  Mines: ConcasseurIcon,
  'Outils & Accessoires': OutilsIcon,
};

/**
 * Secteurs métier pour le filtre « Secteur » sur /machines.
 * Noms et ordre alignés sur `JOB_SECTORS_HOME` (src/data/sectors.ts).
 */
export const jobCategories = JOB_SECTORS_HOME.map((s) => ({
  id: s.id,
  name: s.name,
  icon: ICON_BY_SECTOR_NAME[s.name] ?? ConstructionIcon,
  count: 0,
}));
