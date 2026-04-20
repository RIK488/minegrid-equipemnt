// Barrel : re-export de tous les sous-modules api pour preserver la
// compatibilite ascendante. Pour les nouveaux imports, preferez cibler
// directement ./api/<domain>.

export * from './api/types';
export * from './api/auth';
export * from './api/machines';
export * from './api/dashboard';
export * from './api/messages';
export * from './api/offers';
export * from './api/profile';
export * from './api/preferences';
export * from './api/notifications';
export * from './api/premium';
export * from './api/service-history';
export * from './api/sessions';
