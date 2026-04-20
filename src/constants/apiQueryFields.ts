/**
 * Colonnes pour `src/utils/api.ts` (messages, offres, profil, préférences, notifications app).
 */

/** Table `messages` — liste (filtres peuvent utiliser seller_id côté WHERE sans le sélectionner) */
export const MESSAGE_LIST_COLUMNS = [
  'id',
  'sender_id',
  'receiver_id',
  'machine_id',
  'subject',
  'content',
  'is_read',
  'created_at',
  'sender_name',
  'receiver_name',
].join(',');

/** Boîte de réception (schéma formulaire contact — colonnes camelCase/snake) */
export const MESSAGES_INBOX_COLUMNS = [
  'id',
  'sender_name',
  'sender_email',
  'sender_phone',
  'message',
  'machine_id',
  'sellerid',
  'status',
  'created_at',
  'updated_at',
].join(',');

/** Table `offers` */
export const OFFER_LIST_COLUMNS = [
  'id',
  'machine_id',
  'buyer_id',
  'seller_id',
  'amount',
  'message',
  'status',
  'created_at',
].join(',');

/** Table `user_profiles` — getUserProfile */
export const USER_PROFILE_API_COLUMNS = [
  'id',
  'first_name',
  'last_name',
  'email',
  'phone',
  'company',
  'website',
  'address',
  'profile_picture',
  'created_at',
  'updated_at',
].join(',');

/** Table `user_preferences` */
export const USER_PREFERENCES_COLUMNS = [
  'id',
  'user_id',
  'language',
  'currency',
  'timezone',
  'date_format',
  'dark_mode',
  'animations',
  'font_size',
  'high_contrast',
  'email_notifications',
  'notification_frequency',
  'notification_hours',
  'created_at',
  'updated_at',
].join(',');

/** Table `notifications` — modèle api.ts (user_id, is_read) */
export const NOTIFICATION_APP_COLUMNS = [
  'id',
  'user_id',
  'type',
  'title',
  'content',
  'is_read',
  'related_id',
  'created_at',
].join(',');

/** Table `notifications` — NotificationCenter (user_email, read) */
export const NOTIFICATION_CENTER_COLUMNS = [
  'id',
  'user_email',
  'title',
  'message',
  'type',
  'data',
  'read',
  'created_at',
].join(',');

/** Table `premium_services` */
export const PREMIUM_SERVICE_COLUMNS = [
  'id',
  'user_id',
  'service_type',
  'status',
  'start_date',
  'end_date',
  'features',
  'price',
  'created_at',
].join(',');

/** Table `service_history` */
export const SERVICE_HISTORY_COLUMNS = [
  'id',
  'user_id',
  'service_type',
  'action',
  'description',
  'created_at',
].join(',');

/** Table `planning_events` (colonnes alignées PlanningPro) */
export const PLANNING_EVENTS_COLUMNS = [
  'id',
  'title',
  'description',
  'startDate',
  'endDate',
  'type',
  'status',
  'priority',
  'clientName',
  'clientPhone',
  'clientEmail',
  'location',
  'assignedTo',
  'notes',
  'user_id',
  'created_at',
].join(',');

/** Table `documents` (DocumentsEspace) */
export const DOCUMENTS_ESPACE_COLUMNS = [
  'id',
  'user_id',
  'name',
  'type',
  'category',
  'file_url',
  'file_size',
  'uploaded_at',
  'uploaded_by',
  'description',
  'tags',
  'status',
].join(',');

/** Table `vitrines` — champs utilisés par VitrinePersonnalisee */
export const VITRINE_COLUMNS = [
  'id',
  'user_id',
  'company_name',
  'logo_url',
  'description',
  'services',
  'address',
  'phone',
  'email',
  'website',
  'working_hours',
  'specializations',
  'certifications',
  'created_at',
  'updated_at',
  'business_type',
  'founding_year',
  'intervention_zone',
  'equipment_count',
  'projects_delivered',
  'whatsapp',
  'emergency_phone',
  'delivery_radius',
  'min_rental_duration',
  'deposit_required',
  'fuel_included',
  'driver_included',
  'maintenance_included',
  'warranty_months',
  'delivery_time_weeks',
  'transport_included',
  'installation_included',
].join(',');
