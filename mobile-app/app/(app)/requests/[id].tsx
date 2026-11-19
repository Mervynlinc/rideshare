import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, TrustBadge, BackButton } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useJoinRequests } from '../../../hooks/useJoinRequests';
import { supabase } from '../../../lib/supabase';

export default function RequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRequestsForMyRide, respondToRequest } = useJoinRequests();

  const [requests, setRequests] = useState<any[]>([]);
  const [rideInfo, setRideInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Get ride info
      const { data: ride } = await supabase
        .from('rides')
        .select('from_location, to_location, seats_total, seats_taken')
        .eq('id', id)
        .single();

      setRideInfo(ride);

      // Get requests
      const data = await getRequestsForMyRide(id);
      setRequests(data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, response: 'accepted' | 'declined') => {
    setRespondingIds(prev => new Set(prev).add(requestId));
    try {
      await respondToRequest(requestId, response);
      // Update local state to reflect the change
      setRequests(prev => prev.filter(r => r.id !== requestId));
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 }}>
          <BackButton onPress={() => router.back()} />
          <View>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 'bold', color: colors.text.DEFAULT }}>
              Join Requests
            </Text>
            {rideInfo && (
              <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                {rideInfo.from_location} → {rideInfo.to_location} · {rideInfo.seats_total - rideInfo.seats_taken} seats open
              </Text>
            )}
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, marginBottom: 16 }}>
              <Ionicons name="people" size={16} color={colors.accent.DEFAULT} />
              <Text style={{ color: colors.text.sec, fontSize: 14 }}>
                <Text style={{ color: colors.text.DEFAULT, fontWeight: '600' }}>{requests.length}</Text> pending {requests.length === 1 ? 'request' : 'requests'}
              </Text>
            </View>

            <View style={{ gap: 10, paddingBottom: 24 }}>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <View
                    key={request.id}
                    style={{
                      backgroundColor: colors.bg.card,
                      borderWidth: 1,
                      borderColor: colors.border.DEFAULT,
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <Avatar
                        initials={getInitials(request.requester?.name)}
                        size="md"
                        color={getAvatarColor(request.requester?.gender)}
                        imageUrl={request.requester?.avatar_url}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ color: colors.text.DEFAULT, fontSize: 14, fontWeight: '600' }}>
                            {request.requester?.name || 'Unknown'}
                          </Text>
                          <TrustBadge score={request.requester?.trust_score || 0} />
                        </View>
                        <Text style={{ color: colors.text.muted, fontSize: 12, marginTop: 2 }}>
                          {request.requester?.gender || 'N/A'}
                          {request.requested_at && ` · ${Math.floor((Date.now() - new Date(request.requested_at).getTime()) / 60000)} min ago`}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          backgroundColor: colors.accent.DEFAULT,
                        }}
                        onPress={() => handleRespond(request.id, 'accepted')}
                        disabled={respondingIds.has(request.id)}
                      >
                        {respondingIds.has(request.id) ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <Text style={{ fontWeight: '600', fontSize: 14, color: '#000' }}>Accept</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          backgroundColor: `${colors.red.DEFAULT}15`,
                        }}
                        onPress={() => handleRespond(request.id, 'declined')}
                        disabled={respondingIds.has(request.id)}
                      >
                        <Text style={{ fontWeight: '600', fontSize: 14, color: colors.red.DEFAULT }}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={48} color={colors.text.muted} />
                  <Text style={{ color: colors.text.muted, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                    No pending requests for this ride
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
