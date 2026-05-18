import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';
import { getTimeAgo } from '../data/mockData';
import { useTheme } from '../hooks/useTheme';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { colors } = useTheme();

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return { bg: colors.accent.glow, color: colors.accent.DEFAULT };
      case 'warning':
        return { bg: 'rgba(255,179,0,0.1)', color: colors.amber.DEFAULT };
      case 'error':
        return { bg: colors.red.dim, color: colors.red.DEFAULT };
      default:
        return { bg: 'rgba(255,255,255,0.06)', color: colors.text.sec };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row gap-3 py-3.5 border-b"
      style={{ borderBottomColor: colors.border.DEFAULT }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: typeStyles.bg }}
      >
        <Ionicons name={notification.icon as any} size={16} color={typeStyles.color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold mb-0.5" style={{ color: colors.text.DEFAULT }}>{notification.title}</Text>
        <Text className="text-xs leading-5" style={{ color: colors.text.sec }}>{notification.description}</Text>
        <Text className="text-xs mt-1" style={{ color: colors.text.dim }}>{getTimeAgo(notification.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
}
