import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, ThemeToggle } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../context';
import { supabase } from '../../../lib/supabase';

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
  const { colors, isDark } = useTheme();
  const { logout, user, updateUser } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('') || 'U';

  const pickAvatar = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets[0]) return;

      const file = result.assets[0];
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.fileSize && file.fileSize > MAX_SIZE) {
        Alert.alert('Image Too Large', 'Please select an image under 5MB.');
        return;
      }

      setUploadingAvatar(true);
      const ext = file.uri.split('.').pop() || 'jpg';
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: `image/${ext}`,
        name: `avatar.${ext}`,
      } as any);

      const filePath = `${user?.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateUser({ avatarUrl: urlData.publicUrl });
    } catch (error) {
      console.log('Error uploading avatar:', error);
      Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
          <TouchableOpacity onPress={pickAvatar} disabled={uploadingAvatar}>
            <View className="relative">
              {uploadingAvatar ? (
                <View
                  className="items-center justify-center"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: `${colors.accent.DEFAULT}20`,
                  }}
                >
                  <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
                </View>
              ) : (
                <Avatar initials={initials} size="xl" imageUrl={user?.avatarUrl} />
              )}
              <View
                className="absolute -bottom-1 -right-1 rounded-full p-1.5 border-2"
                style={{
                  backgroundColor: colors.accent.DEFAULT,
                  borderColor: colors.bg.phone,
                }}
              >
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </View>
          </TouchableOpacity>
<Text className="font-display text-xl font-bold mt-3.5 text-text">
  {user?.name || 'User'}
</Text>
        </View>

        <View className="rounded-2xl p-6 items-center mb-4 relative overflow-hidden bg-bg-card border border-border">
          <View className="absolute inset-0 bg-accent-glow" />
          <View className="relative items-center">
            <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
              Trust Score
            </Text>
            <Text className="font-display text-5xl font-bold text-accent">
              {user?.trust?.toFixed(1) || '0.0'}
            </Text>
            <View className="flex-row gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(user?.trust || 0) ? 'star' : 'star-outline'}
                  size={14}
                  className="text-amber"
                />
              ))}
            </View>
            <Text className="text-xs mt-2 text-text-sec">
              Based on {user?.ridesCompleted || 0} ride ratings
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2.5 mb-4">
          <View className="flex-1 rounded-2xl p-4 items-center bg-bg-card border border-border">
            <Text className="font-display text-xl font-bold text-text">
              {user?.ridesCompleted || 0}
            </Text>
            <Text className="text-xs mt-1 text-text-muted">Completed</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 items-center bg-bg-card border border-border">
            <Text className="font-display text-xl font-bold text-accent">
              {user?.ridesPosted || 0}
            </Text>
            <Text className="text-xs mt-1 text-text-muted">Posted</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 items-center bg-bg-card border border-border">
            <Text className="font-display text-xl font-bold text-amber">
              {user?.ridesJoined || 0}
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
            <Text className="text-sm font-medium flex-1 text-text">{user?.email || ''}</Text>
          </View>
          <View className="flex-row items-center gap-3 py-3 border-b border-border">
            <Text className="text-xs w-20 text-text-muted">Gender</Text>
            <Text className="text-sm font-medium flex-1 text-text">{user?.gender || ''}</Text>
          </View>
          <View className="flex-row items-center gap-3 py-3 border-b border-border">
            <Text className="text-xs w-20 text-text-muted">University</Text>
            <Text className="text-sm font-medium flex-1 text-text">{user?.campusShort || ''}</Text>
          </View>
          <View className="flex-row items-center gap-3 py-3">
            <Text className="text-xs w-20 text-text-muted">Hostel</Text>
            <Text className="text-sm font-medium flex-1 text-text">{user?.hostel || ''}</Text>
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
