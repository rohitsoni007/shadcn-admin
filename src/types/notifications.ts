export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'system';

export type NotificationCategory = 
  | 'system' 
  | 'user' 
  | 'security' 
  | 'update' 
  | 'reminder' 
  | 'alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationFilter {
  types?: NotificationType[];
  categories?: NotificationCategory[];
  priorities?: NotificationPriority[];
  isRead?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  filter: NotificationFilter;
  settings: NotificationSettings;
  isLoading: boolean;
  error?: string;
}