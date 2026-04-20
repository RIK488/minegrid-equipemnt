/**
 * Colonnes pour `src/utils/enterpriseApi.ts` (atelier / réparations / stock / tâches).
 */

export const REPAIRS_LIST_COLUMNS = [
  'id',
  'equipment_name',
  'technician_name',
  'technician_id',
  'status',
  'problem_description',
  'estimated_duration',
  'estimated_cost',
  'created_at',
  'completion_date',
].join(',');

export const INVENTORY_LIST_COLUMNS = [
  'id',
  'category',
  'current_stock',
  'minimum_stock',
  'unit_price',
  'supplier',
  'last_restock_date',
].join(',');

export const TECHNICIAN_FULL_COLUMNS = [
  'id',
  'name',
  'specialization',
  'max_workload_hours',
  'current_workload_hours',
  'efficiency_rating',
  'availability_status',
].join(',');

export const TASK_LIST_COLUMNS = [
  'id',
  'technician_id',
  'estimated_hours',
  'status',
  'due_date',
  'completed_date',
].join(',');

export const INTERVENTION_URGENT_COLUMNS = [
  'id',
  'name',
  'equipment_name',
  'technician_name',
  'status',
  'priority',
  'description',
  'estimated_duration',
  'scheduled_date',
  'completed_date',
].join(',');
