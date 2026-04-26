import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { NotificationItem } from '../../components';
import { BackButton } from '../../components/ui';
import { mockNotifications } from '../../data/mockData';
import { Notification } from '../../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-2">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold flex-1 text-text">
            Notifications
          </Text>
          <TouchableOpacity>
            <Text className="text-xs font-semibold text-accent">Mark all read</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-1.5 py-2 mb-3">
          <View className="w-2 h-2 rounded-full bg-red" />
          <Text className="text-sm text-text-sec">
            <Text className="font-semibold text-text">{unreadCount} unread</Text> notifications
          </Text>
        </View>

        <View className="pb-6">
          {mockNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification as Notification}
              onPress={() => {}}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
