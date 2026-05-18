import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NotificationItem } from '../../components';
import { BackButton } from '../../components/ui';
import { useNotifications } from '../../context';
import { useEffect } from 'react';
import { Notification } from '../../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    markAllAsRead();
  }, []);

  const handleNotificationPress = (id: string) => {
    markAsRead(id);
  };

  const convertToNotification = (appNotification: any): Notification => ({
    id: appNotification.id,
    type: appNotification.type as 'success' | 'warning' | 'error' | 'info',
    icon: appNotification.icon,
    title: appNotification.title,
    description: appNotification.description,
    timestamp: appNotification.timestamp,
    read: appNotification.read,
  });

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-2">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold flex-1 text-text">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text className="text-xs font-semibold text-accent">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {unreadCount > 0 && (
          <View className="flex-row items-center gap-1.5 py-2 mb-3">
            <View className="w-2 h-2 rounded-full bg-red" />
            <Text className="text-sm text-text-sec">
              <Text className="font-semibold text-text">{unreadCount} unread</Text> notifications
            </Text>
          </View>
        )}

        <View className="pb-6">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={convertToNotification(notification)}
                onPress={() => handleNotificationPress(notification.id)}
              />
            ))
          ) : (
            <View className="py-12 items-center">
              <Text className="text-sm text-text-muted text-center">
                No notifications yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
