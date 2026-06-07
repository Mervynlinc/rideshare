import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '../../components';
import { BackButton } from '../../components/ui';
import { useNotifications } from '../../context';
import { useEffect } from 'react';
import { Notification } from '../../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotifications } = useNotifications();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    markAllAsRead();
  }, []);

  const isSelecting = selectedIds.size > 0;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleLongPress = (id: string) => {
    setSelectedIds(new Set([id]));
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    Alert.alert(
      `Delete ${count} notification${count > 1 ? 's' : ''}?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNotifications([...selectedIds]);
            clearSelection();
          },
        },
      ]
    );
  };

  const handleDeleteOne = (id: string) => {
    deleteNotifications([id]);
  };

  const handlePress = (id: string) => {
    if (isSelecting) {
      toggleSelection(id);
    } else {
      markAsRead(id);
    }
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
            {isSelecting ? `${selectedIds.size} Selected` : 'Notifications'}
          </Text>
          {isSelecting ? (
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={handleDeleteSelected}>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="trash" size={16} color="#ef4444" />
                  <Text className="text-sm font-semibold text-red">Delete</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearSelection}>
                <Text className="text-sm font-semibold text-text-dim">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text className="text-xs font-semibold text-accent">Mark all read</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {!isSelecting && unreadCount > 0 && (
          <View className="flex-row items-center gap-1.5 py-2 mb-3">
            <View className="w-2 h-2 rounded-full bg-red" />
            <Text className="text-sm text-text-sec">
              <Text className="font-semibold text-text">{unreadCount} unread</Text> notifications
            </Text>
          </View>
        )}

        {isSelecting && (
          <Text className="text-xs text-text-muted mb-3">
            Tap to select more, long-press an item to start selection
          </Text>
        )}

        <View className="pb-6">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={convertToNotification(notification)}
                selected={isSelecting ? selectedIds.has(notification.id) : undefined}
                onPress={() => handlePress(notification.id)}
                onLongPress={() => handleLongPress(notification.id)}
                onDelete={isSelecting ? undefined : () => handleDeleteOne(notification.id)}
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