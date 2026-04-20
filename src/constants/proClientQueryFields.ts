/** Profil utilisateur (table user_profiles) — getProClientProfile */
export const USER_PROFILE_COLUMNS = [
  'id',
  'company',
  'first_name',
  'last_name',
  'phone',
  'address',
].join(',');

/** Table pro_clients */
export const PRO_CLIENT_COLUMNS = [
  'id',
  'user_id',
  'company_name',
  'siret',
  'address',
  'phone',
  'contact_person',
  'email',
  'subscription_type',
  'subscription_status',
  'subscription_start',
  'subscription_end',
  'max_users',
  'created_at',
  'updated_at',
].join(',');

/** pro_equipment_details — détails Pro liés aux machines */
export const PRO_EQUIPMENT_DETAILS_COLUMNS = [
  'id',
  'machine_id',
  'user_id',
  'serial_number',
  'qr_code',
  'purchase_date',
  'warranty_end',
  'last_maintenance',
  'next_maintenance',
  'total_hours',
  'fuel_consumption',
  'notes',
  'created_at',
  'updated_at',
].join(',');

/** client_orders */
export const CLIENT_ORDER_COLUMNS = [
  'id',
  'client_id',
  'order_number',
  'order_type',
  'status',
  'total_amount',
  'currency',
  'order_date',
  'expected_delivery',
  'actual_delivery',
  'notes',
  'created_at',
  'updated_at',
].join(',');

/** technical_documents */
export const TECHNICAL_DOCUMENT_COLUMNS = [
  'id',
  'client_id',
  'equipment_id',
  'document_type',
  'title',
  'file_path',
  'file_size',
  'mime_type',
  'is_public',
  'expires_at',
  'created_at',
  'updated_at',
].join(',');

/** equipment_diagnostics */
export const EQUIPMENT_DIAGNOSTICS_COLUMNS = [
  'id',
  'equipment_id',
  'diagnostic_date',
  'diagnostic_type',
  'status',
  'readings',
  'recommendations',
  'next_diagnostic_date',
  'created_at',
].join(',');

/** client_notifications */
export const CLIENT_NOTIFICATION_COLUMNS = [
  'id',
  'client_id',
  'user_id',
  'type',
  'title',
  'message',
  'is_read',
  'priority',
  'related_entity_type',
  'related_entity_id',
  'created_at',
].join(',');

/** client_users */
export const CLIENT_USER_COLUMNS = [
  'id',
  'client_id',
  'user_id',
  'role',
  'permissions',
  'is_active',
  'created_at',
  'updated_at',
].join(',');

/** user_invitations */
export const USER_INVITATION_COLUMNS = [
  'id',
  'email',
  'name',
  'role',
  'invited_by',
  'status',
  'expires_at',
  'accepted_at',
  'accepted_by',
  'created_at',
  'updated_at',
].join(',');

/** user_settings */
export const USER_SETTINGS_COLUMNS = [
  'id',
  'user_id',
  'notifications',
  'security',
  'created_at',
  'updated_at',
].join(',');

/** Table client_equipment (recherche par S/N ou QR) */
export const CLIENT_EQUIPMENT_TABLE_COLUMNS = [
  'id',
  'client_id',
  'serial_number',
  'qr_code',
  'equipment_type',
  'brand',
  'model',
  'year',
  'location',
  'status',
  'purchase_date',
  'warranty_end',
  'last_maintenance',
  'next_maintenance',
  'total_hours',
  'fuel_consumption',
  'description',
  'notes',
  'price',
  'images',
  'created_at',
  'updated_at',
].join(',');

/**
 * Interventions + équipement lié (relation PostgREST `client_equipment`).
 * Si la relation n’existe pas en base, repasser sur select('*') avec embed adapté.
 */
export const MAINTENANCE_INTERVENTION_SELECT = `
  id,
  client_id,
  equipment_id,
  intervention_type,
  status,
  priority,
  description,
  scheduled_date,
  actual_date,
  duration_hours,
  technician_name,
  cost,
  parts_used,
  notes,
  created_at,
  updated_at,
  client_equipment (
    serial_number,
    equipment_type,
    brand,
    model
  )
`.trim();

/** maintenance_interventions — export / requêtes sans jointure */
export const MAINTENANCE_INTERVENTION_FLAT_COLUMNS = [
  'id',
  'client_id',
  'equipment_id',
  'intervention_type',
  'status',
  'priority',
  'description',
  'scheduled_date',
  'actual_date',
  'duration_hours',
  'technician_name',
  'cost',
  'parts_used',
  'notes',
  'created_at',
  'updated_at',
].join(',');
