import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Avatar } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

interface BlockedUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  blockedAt: Date;
  reason?: string;
}

const mockBlockedUsers: BlockedUser[] = [
  {
    id: '1',
    name: 'John Doe',
    initials: 'JD',
    color: '#E91E63',
    blockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reason: 'Inappropriate behavior',
  },
  {
    id: '2',
    name: 'Jane Smith',
    initials: 'JS',
    color: '#2196F3',
    blockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reason: 'No-show on ride',
  },
];

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(mockBlockedUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnblockModal, setShowUnblockModal] = useState<string | null>(null);

  const filteredUsers = blockedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
    setShowUnblockModal(null);
  };

  const getBlockedTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView
        className="flex-1 px-5 pt-6 bg-bg-phone"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Blocked Users
          </Text>
        </View>

        <View className="rounded-2xl p-5 mb-6 bg-bg-card border border-border">
          <View className="flex-row items-start gap-3">
            <Ionicons name="ban" size={24} color={colors.red.DEFAULT} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-2">
                Manage your blocked users
              </Text>
              <Text className="text-xs text-text-sec leading-5">
                Blocked users cannot send you ride requests, messages, or see your posted rides. You can unblock them at any time.
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2 rounded-xl px-4 mb-4 bg-bg-card border border-border">
          <Ionicons name="search" size={16} className="text-icon-muted" />
          <TextInput
            className="flex-1 text-sm text-text"
            placeholder="Search blocked users..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredUsers.length === 0 ? (
          <View className="rounded-2xl p-8 items-center bg-bg-card border border-border">
            <Ionicons name="ban" size={48} color={colors.icon.muted} />
            <Text className="text-sm font-semibold text-text mt-4 mb-2">
              {searchQuery ? 'No blocked users found' : 'No blocked users'}
            </Text>
            <Text className="text-xs text-text-muted text-center">
              {searchQuery
                ? 'Try a different search term'
                : 'You have not blocked any users yet. Users you block will appear here.'}
            </Text>
          </View>
        ) : (
          <View className="rounded-2xl overflow-hidden bg-bg-card border border-border">
            {filteredUsers.map((user, index) => (
              <View
                key={user.id}
                className={`flex-row items-center gap-4 py-4 px-4 ${index !== filteredUsers.length - 1 ? 'border-b border-border' : ''}`}
              >
                <Avatar initials={user.initials} size="md" color={user.color} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text">{user.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-xs text-text-muted">
                      Blocked {getBlockedTimeAgo(user.blockedAt)}
                    </Text>
                    {user.reason && (
                      <>
                        <Text className="text-xs text-text-dim">·</Text>
                        <Text className="text-xs text-text-muted">{user.reason}</Text>
                      </>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg bg-bg-input border border-border"
                  onPress={() => setShowUnblockModal(user.id)}
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-medium text-accent">Unblock</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View className="mt-6 rounded-xl p-4 bg-bg-card-alt border border-border">
          <Text className="text-xs font-semibold text-text mb-2">
            Blocking Guidelines
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={14} color={colors.accent.DEFAULT} />
              <Text className="text-xs text-text-muted">
                Block users who violate community guidelines or make you feel unsafe
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={14} color={colors.accent.DEFAULT} />
              <Text className="text-xs text-text-muted">
                Report serious issues to support for further action
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={14} color={colors.accent.DEFAULT} />
              <Text className="text-xs text-text-muted">
                Blocked users will not be notified when you block them
              </Text>
            </View>
          </View>
        </View>

        {showUnblockModal && (
          <View className="fixed inset-0 bg-black/50 items-center justify-center p-5">
            <View className="rounded-2xl p-5 bg-bg-card border border-border w-full">
              <View className="items-center mb-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: colors.accent.glow }}
                >
                  <Ionicons name="person" size={32} color={colors.accent.DEFAULT} />
                </View>
                <Text className="text-base font-semibold text-text mb-1">
                  Unblock User?
                </Text>
                <Text className="text-xs text-text-muted text-center">
                  Are you sure you want to unblock this user? They will be able to send you ride requests and messages again.
                </Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-bg-input border border-border"
                  onPress={() => setShowUnblockModal(null)}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-medium text-text text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-accent"
                  onPress={() => handleUnblock(showUnblockModal)}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-medium text-black text-center">Unblock</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
