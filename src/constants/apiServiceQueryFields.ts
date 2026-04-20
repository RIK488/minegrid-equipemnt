/**
 * Tables attendues avec colonnes camelCase (voir `apiService.ts`).
 */

export const API_SERVICE_ACTION_COLUMNS = [
  'id',
  'title',
  'description',
  'priority',
  'category',
  'dueTime',
  'status',
  'contact',
  'value',
  'aiRecommendation',
  'estimatedDuration',
  'createdAt',
  'updatedAt',
].join(',');

export const API_SERVICE_LEAD_COLUMNS = [
  'id',
  'title',
  'stage',
  'priority',
  'value',
  'probability',
  'nextAction',
  'assignedTo',
  'lastContact',
  'notes',
  'contact',
  'createdAt',
  'updatedAt',
].join(',');

export const API_SERVICE_EQUIPMENT_COLUMNS = [
  'id',
  'name',
  'category',
  'price',
  'daysInStock',
  'photos',
  'boosted',
  'description',
  'status',
  'createdAt',
  'updatedAt',
].join(',');
