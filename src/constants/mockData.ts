// Barrel : re-export de tous les sous-modules mockData pour preserver la
// compatibilite ascendante. Pour les nouveaux imports, preferez cibler
// directement ./mockData/<domain>.

export * from './mockData/metrics';
export * from './mockData/charts';
export * from './mockData/lists';
export * from './mockData/daily-actions';
export * from './mockData/inventory';
export * from './mockData/performance';
export * from './mockData/sales-analytics';
export * from './mockData/widget-data';
