export interface PortalStats {
  totalEquipment: number;
  activeEquipment: number;
  pendingOrders: number;
  upcomingInterventions: number;
  unreadNotifications: number;
}

export interface NewItemModalProps {
  type: 'equipment' | 'order' | 'maintenance' | 'user' | 'document';
  onClose: () => void;
  onSuccess: () => void;
}
