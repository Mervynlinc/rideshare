import { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Avatar } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context';
import { RideHistory } from '../../types';

const AVATAR_COLORS = ['#E91E63', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4', '#4CAF50', '#FF9800', '#795348'];

function nameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<RideHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ride_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: RideHistory[] = (data || []).map((item: any) => ({
        id: item.id,
        rideId: item.ride_id,
        date: item.date,
        from: item.from_location,
        to: item.to_location,
        posterName: item.poster_name,
        otherPartyName: item.other_party_name,
        mode: item.mode,
        wasPoster: item.was_poster,
        postedAt: item.posted_at,
        rating: item.rating,
      }));

      setHistory(mapped);
    } catch (error) {
      console.error('Error fetching ride history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPostedTime = (postedAt: string) => {
    if (!postedAt) return '';
    const date = new Date(postedAt);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 pb-24 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Ride History
          </Text>
        </View>

        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" className="text-accent" />
          </View>
        ) : history.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="time-outline" size={48} className="text-icon-muted mb-3" />
            <Text className="text-sm text-text-muted text-center">
              No rides completed yet
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {history.map((item) => (
              <View
                key={item.id}
                className="rounded-2xl p-4 bg-bg-card border border-border"
              >
                <View className="flex-row items-start gap-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center bg-accent/10">
                    <Ionicons name="bicycle" size={20} className="text-accent" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm font-semibold text-text flex-1" numberOfLines={1}>
                        {item.from}
                      </Text>
                      <Text className="text-xs text-text-muted ml-2">
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <View className="w-0.5 h-3 bg-border-light" />
                      <Ionicons name="bicycle" size={10} className="text-accent" />
                    </View>
                    <Text className="text-sm font-semibold text-accent mb-2">
                      {item.to}
                    </Text>

                    <View className="flex-row items-center gap-4 pt-2 border-t border-border">
                      <Avatar
                        initials={getInitials(item.otherPartyName)}
                        size="sm"
                        color={nameColor(item.otherPartyName)}
                      />
                      <View className="flex-1">
                        <Text className="text-xs font-medium text-text">
                          {item.otherPartyName}
                        </Text>
                        <Text className="text-xs text-text-muted">
                          {formatPostedTime(item.postedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
