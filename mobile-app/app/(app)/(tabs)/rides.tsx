import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { RideCard } from '../../../components';
import { Avatar, TrustBadge, Toggle } from '../../../components/ui';
import { useRides } from '../../../hooks/useRides';
import { useJoinRequests } from '../../../hooks/useJoinRequests';
import { useAuth } from '../../../context';
import { useTheme } from '../../../hooks/useTheme';

export default function MyRidesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { rides, loading, fetchRides, removingIds } = useRides();
  const { getRequestsForMyRide, respondToRequest, refresh } = useJoinRequests();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());

  const postedRides = rides.filter((r) => r.posterId === user?.id);

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [fetchRides]),
  );

  const handleRidePress = async (rideId: string) => {
    // Check if there's an accepted chat for this ride
    const { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('ride_id', rideId)
      .maybeSingle();

    if (chat) {
      router.push(`/chat/${chat.id}`);
    } else {
      router.push(`/(app)/requests/${rideId}`);
    }
  };

  const loadIncomingRequests = async () => {
    if (!user) return;
    setRequestsLoading(true);
    try {
      // Fetch all rides posted by user
      const { data: userRides } = await supabase
        .from('rides')
        .select('id, from_location, to_location')
        .eq('poster_id', user.id);

      if (!userRides || userRides.length === 0) {
        setIncomingRequests([]);
        return;
      }

      const rideIds = userRides.map(r => r.id);
      const rideMap: Record<string, any> = {};
      userRides.forEach(r => { rideMap[r.id] = r; });

      // Fetch pending join requests for user's rides
      const { data: requestsData } = await supabase
        .from('join_requests')
        .select('*')
        .in('ride_id', rideIds)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (!requestsData) {
        setIncomingRequests([]);
        return;
      }

      // Fetch requester info
      const requesterIds = [...new Set(requestsData.map(r => r.requester_id))];
      let userMap: Record<string, any> = {};

      if (requesterIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, avatar_url, trust_score, verified, gender')
          .in('id', requesterIds);

        usersData?.forEach(u => { userMap[u.id] = u; });
      }

      const mapped = requestsData.map(req => ({
        ...req,
        requester: userMap[req.requester_id] || null,
        ride: rideMap[req.ride_id] || null,
      }));

      setIncomingRequests(mapped);
    } catch (err) {
      console.error('Error loading incoming requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      loadIncomingRequests();
    }
  }, [activeTab, user]);

  const handleRespond = async (requestId: string, response: 'accepted' | 'declined') => {
    setRespondingIds(prev => new Set(prev).add(requestId));
    try {
      await respondToRequest(requestId, response);
      // Remove from local state
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to respond to request');
    } finally {
      setRespondingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getAvatarColor = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'male': return '#3B82F6';
      case 'female': return '#EC4899';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-phone">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <View className="flex-1 px-5 pt-16 pb-24 bg-bg-phone">
        <Text className="font-display text-xl font-bold mb-4 text-text">
          My Rides
        </Text>

        <Toggle
          options={[
            { label: `Posted (${postedRides.length})` },
            { label: `Requests (${incomingRequests.length})` },
          ]}
          selected={activeTab}
          onSelect={setActiveTab}
        />

        {activeTab === 0 ? (
          <ScrollView className="flex-1 mt-5" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
            {postedRides.length > 0 ? (
              postedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  removing={removingIds.includes(ride.id)}
                  onPress={() => handleRidePress(ride.id)}
                />
              ))
            ) : (
              <View className="py-12 items-center">
                <Ionicons name="bicycle" size={48} className="text-icon-muted mb-3" />
                <Text className="text-sm text-text-muted text-center">No rides posted yet</Text>
                <TouchableOpacity className="mt-3" onPress={() => router.push('/(app)/(tabs)/post')}>
                  <Text className="text-sm text-accent font-semibold">Post your first ride</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView className="flex-1 mt-5" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
            {requestsLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
              </View>
            ) : incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <View
                  key={request.id}
                  className="bg-bg-card border border-border rounded-2xl p-4"
                >
                  <View className="flex-row items-center gap-3 mb-3">
                    <Avatar
                      initials={getInitials(request.requester?.name)}
                      size="md"
                      color={getAvatarColor(request.requester?.gender)}
                      imageUrl={request.requester?.avatar_url}
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-text text-sm font-semibold">
                          {request.requester?.name || 'Unknown'}
                        </Text>
                        <TrustBadge score={request.requester?.trust_score || 0} />
                      </View>
                      <View className="flex-row items-center gap-2 mt-0.5">
                        <Text className="text-text-muted text-xs">
                          {request.requester?.gender || 'N/A'}
                        </Text>
                        <Text className="text-text-dim text-xs">·</Text>
                        <Text className="text-text-muted text-xs">
                          {request.ride?.from_location || '?'} → {request.ride?.to_location || '?'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{ backgroundColor: colors.accent.DEFAULT }}
                      onPress={() => handleRespond(request.id, 'accepted')}
                      disabled={respondingIds.has(request.id)}
                    >
                      {respondingIds.has(request.id) ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text className="text-sm font-semibold text-black">Accept</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{ backgroundColor: `${colors.red.DEFAULT}15` }}
                      onPress={() => handleRespond(request.id, 'declined')}
                      disabled={respondingIds.has(request.id)}
                    >
                      <Text className="text-sm font-semibold" style={{ color: colors.red.DEFAULT }}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-12 items-center">
                <Ionicons name="people" size={48} className="text-icon-muted mb-3" />
                <Text className="text-sm text-text-muted text-center">No pending requests</Text>
                <Text className="text-xs text-text-dim text-center mt-1">
                  Requests to join your rides will appear here
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
