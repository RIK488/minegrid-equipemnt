// Export de tous les services communs
export { apiService } from './apiService';
export { notificationService } from './notificationService';
export { exportService } from './exportService';
export { communicationService } from './communicationService';

// Export des types
export type {
  ApiResponse,
  Action,
  Lead,
  Equipment,
  Promotion
} from './apiService';

export type {
  NotificationType,
  Notification
} from './notificationService';

export type {
  ExportOptions,
  ExportData
} from './exportService';

export type {
  EmailData,
  SMSData,
  ContactData
} from './communicationService'; 