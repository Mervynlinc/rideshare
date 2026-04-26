import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = '@rideshare_notification_prefs';

interface NotificationPreferences {
  muted: boolean;
  rideRequests: boolean;
  rideUpdates: boolean;
  messages: boolean;
  safetyAlerts: boolean;
  promotional: boolean;
  ratings: boolean;
}

const defaultPreferences: NotificationPreferences = {
  muted: false,
  rideRequests: true,
  rideUpdates: true,
  messages: true,
  safetyAlerts: true,
  promotional: false,
  ratings: true,
};

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    
    if (key === 'muted' && !preferences.muted) {
      updated.rideRequests = false;
      updated.rideUpdates = false;
      updated.messages = false;
      updated.safetyAlerts = false;
      updated.promotional = false;
      updated.ratings = false;
    }
    
    setPreferences(updated);
    
    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  const handleIndividualToggle = async (key: keyof NotificationPreferences) => {
    if (preferences.muted) return;
    
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    
    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  const notificationTypes = [
    { key: 'rideRequests' as const, icon: 'person-add', label: 'Ride Requests', description: 'When someone requests to join your ride' },
    { key: 'rideUpdates' as const, icon: 'bicycle', label: 'Ride Updates', description: 'Status changes for your rides' },
    { key: 'messages' as const, icon: 'chatbubble', label: 'Messages', description: 'New messages from ride buddies' },
    { key: 'safetyAlerts' as const, icon: 'shield-checkmark', label: 'Safety Alerts', description: 'Important safety notifications' },
    { key: 'ratings' as const, icon: 'star', label: 'Ratings', description: 'When you receive new ratings' },
    { key: 'promotional' as const, icon: 'megaphone', label: 'Promotional', description: 'Updates and offers from RideShare' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 pb-24 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Notification Preferences
          </Text>
        </View>

        <View className="rounded-2xl p-4 mb-6 bg-bg-card border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-1">Mute All Notifications</Text>
              <Text className="text-xs text-text-muted">
                Turn off all notifications temporarily
              </Text>
            </View>
            <TouchableOpacity
              className={`w-12 h-7 rounded-full p-1 ${preferences.muted ? 'bg-red' : 'bg-accent'}`}
              onPress={() => handleToggle('muted')}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white shadow-sm ${preferences.muted ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
          Notification Types
        </Text>

        <View className="rounded-2xl overflow-hidden bg-bg-card border border-border">
          {notificationTypes.map((type) => (
            <View
              key={type.key}
              className={`flex-row items-center gap-3.5 py-4 px-4 ${type.key !== 'promotional' ? 'border-b border-border' : ''}`}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: preferences[type.key] && !preferences.muted ? colors.accent.glow : colors.bg.input }}
              >
                <Ionicons
                  name={type.icon as any}
                  size={18}
                  color={preferences[type.key] && !preferences.muted ? colors.accent.DEFAULT : colors.icon.muted}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-medium ${preferences[type.key] && !preferences.muted ? 'text-text' : 'text-text-muted'}`}>
                  {type.label}
                </Text>
                <Text className="text-xs text-text-muted mt-0.5">
                  {type.description}
                </Text>
              </View>
              <TouchableOpacity
                className={`w-12 h-7 rounded-full p-1 ${preferences[type.key] && !preferences.muted ? 'bg-accent' : 'bg-bg-input'}`}
                onPress={() => handleIndividualToggle(type.key)}
                activeOpacity={0.7}
                disabled={preferences.muted}
              >
                <View
                  className={`w-5 h-5 rounded-full shadow-sm ${preferences[type.key] && !preferences.muted ? 'translate-x-5 bg-white' : 'translate-x-0 bg-text-muted'}`}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {preferences.muted && (
          <View className="mt-4 rounded-xl p-4 bg-red-dim border border-red/20">
            <View className="flex-row items-start gap-3">
              <Ionicons name="information-circle" size={20} color={colors.red.DEFAULT} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-red mb-1">Notifications Muted</Text>
                <Text className="text-xs text-text-sec">
                  You will not receive any notifications until you unmute them. Important safety alerts may still be shown.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="mt-6 rounded-xl p-4 bg-bg-card-alt border border-border">
          <Text className="text-xs text-text-muted">
            Changes are saved automatically. You can update these preferences anytime from your profile settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
