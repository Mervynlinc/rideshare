import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, ThemeToggle } from '../../../components/ui';
import { mockUser } from '../../../data/mockData';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../context';

const settings = [
  { icon: 'create', label: 'Edit Profile', action: 'edit-profile', color: '#00E676' },
  { icon: 'key', label: 'Change Password', action: 'reset-password', color: '#FFB300' },
  { icon: 'notifications', label: 'Notification Preferences', action: 'notification-preferences', color: '#00E676' },
  { icon: 'ban', label: 'Blocked Users', action: 'blocked-users', color: '#00E676' },
  { icon: 'lock-closed', label: 'Privacy & Safety', action: 'privacy-safety', color: '#00E676' },
  { icon: 'time', label: 'Ride History', action: 'history', color: '#00E676' },
  { icon: 'help-circle', label: 'Help & Support', action: 'help-support', color: '#00E676' },
  { icon: 'document-text', label: 'Terms of Service', action: 'terms-of-service', color: '#00E676' },
  { icon: 'information-circle', label: 'About RideShare', action: 'about-rideshare', color: '#00E676' },
  { icon: 'log-out', label: 'Log Out', action: 'logout', color: '#FF1744' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { logout } = useAuth();
  const initials = mockUser.name.split(' ').map((n) => n[0]).join('');

  const handleSettingPress = async (action: string) => {
    if (action === 'logout') {
      await logout();
    } else if (action === 'reset-password') {
      router.push('/(app)/verify-password-code');
    } else if (action) {
      router.push(`/(app)/${action}` as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pb-24 bg-bg-phone">
        <View className="items-center py-5">
<Avatar initials={initials} size="xl" />
<Text className="font-display text-xl font-bold mt-3.5 text-text">
  {mockUser.name}
</Text>
        </View>

        <View className="rounded-2xl p-6 items-center mb-4 relative overflow-hidden bg-bg-card border border-border">
          <View className="absolute inset-0 bg-accent-glow" />
          <View className="relative items-center">
            <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
              Trust Score
            </Text>
            <Text className="font-display text-5xl font-bold text-accent">
              {mockUser.trust.toFixed(1)}
            </Text>
            <View className="flex-row gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(mockUser.trust) ? 'star' : 'star-outline'}
                  size={14}
                  className="text-amber"
                />
              ))}
            </View>
            <Text className="text-xs mt-2 text-text-sec">
              Based on {mockUser.ridesCompleted} ride ratings
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2.5 mb-4">
          <View className="flex-1 rounded-2xl p-4 items-center bg-bg-card border border-border">
            <Text className="font-display text-xl font-bold text-text">
              {mockUser.ridesCompleted}
            </Text>
            <Text className="text-xs mt-1 text-text-muted">Completed</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 items-center bg-bg-card border border-border">
            <Text className="font-display text-xl font-bold text-accent">
              {mockUser.ridesPosted}
            </Text>
            <Text className="text-xs mt-1 text-text-muted">Posted</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 items-center bg-bg-card border border-border">
            <Text className="font-display text-xl font-bold text-amber">
              {mockUser.ridesJoined}
            </Text>
            <Text className="text-xs mt-1 text-text-muted">Joined</Text>
          </View>
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-2 text-text-muted">
          Account Details
        </Text>
        <View className="rounded-2xl px-4 py-1 mb-4 bg-bg-card border border-border">
          <View className="flex-row items-center gap-3 py-3 border-b border-border">
            <Text className="text-xs w-20 text-text-muted">Email</Text>
            <Text className="text-sm font-medium flex-1 text-text">{mockUser.email}</Text>
          </View>
          <View className="flex-row items-center gap-3 py-3 border-b border-border">
            <Text className="text-xs w-20 text-text-muted">Gender</Text>
            <Text className="text-sm font-medium flex-1 text-text">{mockUser.gender}</Text>
          </View>
          <View className="flex-row items-center gap-3 py-3 border-b border-border">
            <Text className="text-xs w-20 text-text-muted">University</Text>
            <Text className="text-sm font-medium flex-1 text-text">{mockUser.campusShort}</Text>
          </View>
          <View className="flex-row items-center gap-3 py-3">
            <Text className="text-xs w-20 text-text-muted">Hostel</Text>
            <Text className="text-sm font-medium flex-1 text-text">{mockUser.hostel}</Text>
          </View>
        </View>

<Text className="text-xs uppercase tracking-widest font-semibold mb-2 text-text-muted">
  Appearance
</Text>
<View className="rounded-2xl mb-4 bg-bg-card border border-border">
  <View className="flex-row items-center gap-2 py-3.5 px-4">
    <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} className="text-accent " />
    <Text className="text-sm font-medium flex-1 text-text">Theme</Text>
    <ThemeToggle />
  </View>
</View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-2 text-text-muted">
          Settings
        </Text>
        <View className="rounded-2xl overflow-hidden bg-bg-card border border-border">
          {settings.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center gap-3.5 py-3.5 px-4"
              onPress={() => handleSettingPress(item.action)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                className={item.label === 'Log Out' ? 'text-red' : item.color === '#00E676' ? 'text-accent' : item.color === '#FFB300' ? 'text-amber' : 'text-icon-muted'}
              />
              <Text className={`text-sm font-medium flex-1 ${item.label === 'Log Out' ? 'text-red' : 'text-text'}`}>
                {item.label}
              </Text>
              {item.action && item.label !== 'Log Out' && (
                <Ionicons name="chevron-forward" size={12} className="text-text-dim" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
