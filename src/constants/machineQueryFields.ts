/**
 * Colonnes explicites pour les annonces machines (évite select * sur les listes).
 * Liste catalogue (schéma minimal `machines`) — ne pas inclure des colonnes absentes en prod.
 */
/*
 * IMPORTANT : ne lister ici que des colonnes **garanties** en base de prod.
 * Si une colonne manque (ex. status/boosted pas encore migrés), PostgREST
 * renvoie une erreur 400 et TOUTE la page catalogue devient vide.
 * Les colonnes optionnelles (status, boosted, type, premium, ...) doivent
 * être récupérées séparément par les widgets qui en ont besoin, ou réintroduites
 * ici uniquement après vérification du schéma prod.
 */
export const MACHINE_LIST_COLUMNS = [
  'id',
  'name',
  'model',
  'brand',
  'category',
  'price',
  'condition',
  'specifications',
  'images',
  'photos',
  'city',
  'region',
  'country',
  'sellerid',
  'seller_id',
  'created_at',
  'year',
  'description',
].join(',');

/**
 * Échelle ~500 entreprises / nombreux visiteurs : éviter de charger des milliers de lignes
 * d’un coup (pic RAM + JSON + filtre JS). Charger par blocs + plafond mémoire.
 */
export const MACHINES_CATALOG_INITIAL_LIMIT = 400;

/** Taille des blocs « Charger plus » */
export const MACHINES_CATALOG_STEP = 400;

/**
 * Plafond lignes max en mémoire sur la page catalogue (par onglet navigateur).
 * À ajuster selon la RAM cible ; au-delà, préférer filtres SQL ou recherche serveur.
 */
export const MACHINES_CATALOG_MEMORY_CAP = 3000;

/** Compat : plafond pour requêtes qui chargent encore en une fois (ex. exports / admin) */
export const MACHINES_CATALOG_MAX_ROWS = MACHINES_CATALOG_MEMORY_CAP;

/** Plafond machines par vendeur (page vitrine / espace pro) */
export const SELLER_MACHINES_MAX_ROWS = 500;

/** Table `profiles` (vitrine vendeur) */
export const PROFILE_PUBLIC_LIST_COLUMNS = ['id', 'firstname', 'lastname'].join(',');

/*
 * Performance Supabase (à exécuter côté DB si pas déjà fait) :
 * CREATE INDEX IF NOT EXISTS idx_machines_catalog ON public.machines (created_at DESC);
 * CREATE INDEX IF NOT EXISTS idx_machines_category ON public.machines (category);
 */
