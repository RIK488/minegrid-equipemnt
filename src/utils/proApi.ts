// Barrel : re-export de tous les sous-modules proApi pour preserver la
// compatibilite ascendante. Pour les nouveaux imports, preferez cibler
// directement ./proApi/<domain>.

export * from './proApi/types';
export * from './proApi/profile';
export * from './proApi/equipment';
export * from './proApi/orders';
export * from './proApi/documents';
export * from './proApi/maintenance';
export * from './proApi/notifications';
export * from './proApi/users';
export * from './proApi/machines';
export * from './proApi/settings';
export * from './proApi/misc';
