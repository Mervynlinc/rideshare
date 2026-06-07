import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@rideshare_notifications';
const PUSH_TOKEN_KEY = '@rideshare_push_token';

let Notifications: any = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;
} catch (e) {
  console.warn('expo-notifications not available:', e);
}

export interface AppNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  pushToken: string | null;
  requestPermissions: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  deleteNotifications: (ids: string[]) => void;
  removeRideNotifications: (rideId: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
    loadPushToken();
    if (notificationsAvailable) {
      setupNotifications().catch((error: any) => {
        console.warn('Failed to setup notifications:', error);
      });
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsWithDates);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadPushToken = async () => {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (token) {
        setPushToken(token);
      }
    } catch (error) {
      console.error('Error loading push token:', error);
    }
  };

  const saveNotifications = async (updatedNotifications: AppNotification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const setupNotifications = async () => {
    if (!notificationsAvailable || !Notifications) {
      console.log('Notifications not available, skipping setup');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setPushToken(token);
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      const subscription = Notifications.addNotificationReceivedListener((notification: any) => {
        const data = notification.request.content.data as any;
        if (data && data.type) {
          addNotification({
            type: (data.type as 'success' | 'warning' | 'error' | 'info') || 'info',
            icon: (data.icon as string) || 'information-circle',
            title: (data.title as string) || 'Notification',
            description: (data.description as string) || '',
            data: data,
          });
        }
      });

      return () => subscription.remove();
    } catch (error) {
      console.warn('Error setting up notifications:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!notificationsAvailable || !Notifications) {
      return false;
    }
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    saveNotifications(updated);
  };

  const deleteNotifications = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = notifications.filter((n) => !idSet.has(n.id));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const removeRideNotifications = (rideId: string) => {
    const updated = notifications.filter(
      (n) => n.data?.rideId !== rideId
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
    AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pushToken,
        requestPermissions,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotifications,
        removeRideNotifications,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}