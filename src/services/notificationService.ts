// Types pour les notifications
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Service de notification unifié
class NotificationService {
  private listeners: ((notification: Notification) => void)[] = [];

  // S'abonner aux notifications
  subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notifier tous les listeners
  private notify(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
  }

  // Méthodes de notification
  success(title: string, message: string, duration = 5000) {
    this.show({
      id: Date.now().toString(),
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration = 8000) {
    this.show({
      id: Date.now().toString(),
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message: string, duration = 6000) {
    this.show({
      id: Date.now().toString(),
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration = 4000) {
    this.show({
      id: Date.now().toString(),
      type: 'info',
      title,
      message,
      duration
    });
  }

  // Afficher une notification
  show(notification: Notification) {
    this.notify(notification);
  }

  // Notifications spécifiques aux actions
  actionStarted(actionTitle: string) {
    this.success(
      'Action démarrée',
      `L'action "${actionTitle}" a été démarrée avec succès.`
    );
  }

  actionCompleted(actionTitle: string) {
    this.success(
      'Action terminée',
      `L'action "${actionTitle}" a été terminée avec succès.`
    );
  }

  actionRescheduled(actionTitle: string) {
    this.info(
      'Action reprogrammée',
      `L'action "${actionTitle}" a été reprogrammée.`
    );
  }

  contactInitiated(contactName: string) {
    this.success(
      'Contact initié',
      `Le contact avec ${contactName} a été initié.`
    );
  }

  leadCreated(leadTitle: string) {
    this.success(
      'Lead créé',
      `Le lead "${leadTitle}" a été créé avec succès.`
    );
  }

  leadUpdated(leadTitle: string) {
    this.success(
      'Lead mis à jour',
      `Le lead "${leadTitle}" a été mis à jour.`
    );
  }

  equipmentUpdated(equipmentName: string) {
    this.success(
      'Équipement mis à jour',
      `L'équipement "${equipmentName}" a été mis à jour.`
    );
  }

  promotionCreated(promotionTitle: string) {
    this.success(
      'Promotion créée',
      `La promotion "${promotionTitle}" a été créée et publiée.`
    );
  }

  imageUploaded() {
    this.success(
      'Image uploadée',
      'L\'image a été uploadée avec succès.'
    );
  }

  // Notifications d'erreur spécifiques
  apiError(operation: string, error: string) {
    this.error(
      'Erreur API',
      `Erreur lors de ${operation}: ${error}`
    );
  }

  networkError() {
    this.error(
      'Erreur réseau',
      'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
    );
  }

  validationError(field: string) {
    this.warning(
      'Erreur de validation',
      `Veuillez corriger le champ "${field}".`
    );
  }

  // Notifications d'IA
  aiRecommendation(recommendation: string) {
    this.info(
      'Recommandation IA',
      recommendation
    );
  }

  aiProcessing() {
    this.info(
      'IA en cours',
      'L\'intelligence artificielle analyse vos données...'
    );
  }

  aiCompleted() {
    this.success(
      'Analyse IA terminée',
      'L\'analyse de l\'intelligence artificielle est terminée.'
    );
  }
}

export const notificationService = new NotificationService(); 