import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Notification, 
  NotificationFilter, 
  NotificationSettings,
  NotificationType,
  NotificationCategory,
  NotificationPriority
} from '@/types/notifications';

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Update Available',
    message: 'A new system update is available. Please update to version 2.1.0 for the latest features and security improvements.',
    type: 'info',
    category: 'system',
    priority: 'medium',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    actionUrl: '/settings#updates',
    actionLabel: 'Update Now'
  },
  {
    id: '2',
    title: 'New User Registration',
    message: 'Jane Smith has registered as a new user and is pending approval.',
    type: 'info',
    category: 'user',
    priority: 'medium',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    actionUrl: '/users?filter=pending',
    actionLabel: 'Review User'
  },
  {
    id: '3',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100. Consider reviewing security settings.',
    type: 'warning',
    category: 'security',
    priority: 'high',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    actionUrl: '/settings#security',
    actionLabel: 'View Security Log'
  },
  {
    id: '4',
    title: 'Backup Completed',
    message: 'Daily backup completed successfully. All data has been backed up to the cloud storage.',
    type: 'success',
    category: 'system',
    priority: 'low',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // marked read 6 hours ago
  },
  {
    id: '5',
    title: 'Storage Space Warning',
    message: 'Storage space is running low (85% used). Consider cleaning up old files or upgrading your storage plan.',
    type: 'warning',
    category: 'system',
    priority: 'medium',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    actionUrl: '/settings#storage',
    actionLabel: 'Manage Storage'
  },
  {
    id: '6',
    title: 'Weekly Report Ready',
    message: 'Your weekly analytics report is ready for review. Check out the latest insights and trends.',
    type: 'info',
    category: 'reminder',
    priority: 'low',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20), // marked read 20 hours ago
    actionUrl: '/reports/weekly',
    actionLabel: 'View Report'
  },
  {
    id: '7',
    title: 'Database Connection Error',
    message: 'Temporary database connection issues detected. The system is automatically retrying the connection.',
    type: 'error',
    category: 'alert',
    priority: 'urgent',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // expires in 1 hour
  },
  {
    id: '8',
    title: 'Feature Update',
    message: 'New dashboard widgets are now available! Customize your dashboard with the latest analytics tools.',
    type: 'success',
    category: 'update',
    priority: 'low',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    actionUrl: '/dashboard?tab=widgets',
    actionLabel: 'Explore Widgets'
  }
];

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification-settings';

const defaultSettings: NotificationSettings = {
  enabled: true,
  categories: {
    system: true,
    user: true,
    security: true,
    update: true,
    reminder: true,
    alert: true,
  },
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotifications() {
  // Load notifications from localStorage or use mock data
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
        }));
      }
      return mockNotifications;
    } catch {
      return mockNotifications;
    }
  });

  // Load settings from localStorage
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [filter, setFilter] = useState<NotificationFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Remove expired notifications
    const now = new Date();
    filtered = filtered.filter(n => !n.expiresAt || n.expiresAt > now);

    if (filter.types?.length) {
      filtered = filtered.filter(n => filter.types!.includes(n.type));
    }

    if (filter.categories?.length) {
      filtered = filtered.filter(n => filter.categories!.includes(n.category));
    }

    if (filter.priorities?.length) {
      filtered = filtered.filter(n => filter.priorities!.includes(n.priority));
    }

    if (filter.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filter.isRead);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(n => 
        n.createdAt >= filter.dateRange!.from && 
        n.createdAt <= filter.dateRange!.to
      );
    }

    // Sort by priority and date
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return b.createdAt.getTime() - a.createdAt.getTime(); // Newer first
    });
  }, [notifications, filter]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead && (!n.expiresAt || n.expiresAt > new Date())).length;
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id 
          ? { ...n, isRead: true, updatedAt: new Date() }
          : n
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const now = new Date();
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true, updatedAt: now }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if enabled and permission granted
    if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      });
    }

    // Play sound if enabled
    if (settings.soundEnabled) {
      // You could play a notification sound here
      console.log('🔔 Notification sound');
    }
  }, [settings]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Simulate real-time notifications (in a real app, this would come from WebSocket/SSE)
  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(() => {
      // Randomly add a notification (for demo purposes)
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const demoNotifications = [
          {
            title: 'New Message',
            message: 'You have received a new message from the system.',
            type: 'info' as NotificationType,
            category: 'system' as NotificationCategory,
            priority: 'low' as NotificationPriority,
            isRead: false,
          },
          {
            title: 'Task Completed',
            message: 'Background task has completed successfully.',
            type: 'success' as NotificationType,
            category: 'system' as NotificationCategory,
            priority: 'low' as NotificationPriority,
            isRead: false,
          },
        ];

        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [settings.enabled, addNotification]);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    unreadCount,
    filter,
    setFilter,
    settings,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    updateSettings,
    requestPermission,
  };
}