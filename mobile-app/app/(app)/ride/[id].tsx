import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Pressable, Modal as RNModal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, TrustBadge, SeatDots, BackButton, Button } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useRides } from '../../../hooks/useRides';
import { useAuth } from '../../../context';
import { useJoinRequests } from '../../../hooks/useJoinRequests';
import { useChats } from '../../../hooks/useChats';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ride } from '../../../types';
import { supabase } from '../../../lib/supabase';

function useCountdown(expiresAt?: string) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (m >= 60) {
        const h = Math.floor(m / 60);
        setRemaining(`${h}h ${m % 60}m`);
      } else {
        setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}

export default function RideDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { fetchRideById, cancelRide } = useRides();
  const { user } = useAuth();
  const { createRequest, getMyRequestsForRide } = useJoinRequests();
  const { getChatByRideId } = useChats();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [seatsAvailable, setSeatsAvailable] = useState(true);
  const [hasAcceptedChat, setHasAcceptedChat] = useState(false);

  // Status change modal state
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: 'accepted' | 'declined';
  }>({ visible: false, type: 'accepted' });

  const isOwnRide = ride?.posterId === user?.id;
  const countdown = useCountdown(ride?.expiresAt);

  useEffect(() => {
    if (id) {
      fetchRideById(id).then((r) => {
        setRide(r);
        setSeatsAvailable((r?.seatsTotal || 0) - (r?.seatsTaken || 0) > 0);
        setLoading(false);
      });
      checkExistingRequest();
      checkAcceptedChat();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id && !loading) {
        checkExistingRequest();
        checkAcceptedChat();
        fetchRideById(id).then((r) => {
          if (r) {
            setRide(r);
            setSeatsAvailable((r.seatsTotal || 0) - (r.seatsTaken || 0) > 0);
          }
        });
      }
    }, [id, loading]),
  );

  const checkExistingRequest = async () => {
    if (!id || !user) return;
    const request = await getMyRequestsForRide(id);
    setExistingRequest(request);
  };

  const checkAcceptedChat = async () => {
    if (!id) return;
    const chat = await getChatByRideId(id);
    setHasAcceptedChat(!!chat);
  };

  // Realtime listener for join request status changes
  useEffect(() => {
    if (!id || !user) return;

    const channel = supabase
      .channel(`ride_request_status_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'join_requests',
          filter: `requester_id=eq.${user.id}`,
        },
        async (payload) => {
          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;

          // Only react to status changes (not initial load)
          if (newStatus === oldStatus || !newStatus) return;

          if (newStatus === 'accepted') {
            // Show accepted modal
            setStatusModal({ visible: true, type: 'accepted' });
            // Refresh the request state
            await checkExistingRequest();
            await checkAcceptedChat();
          } else if (newStatus === 'declined') {
            // Show declined modal
            setStatusModal({ visible: true, type: 'declined' });
            await checkExistingRequest();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id]);

  const handleJoinRequest = async () => {
    if (!id || joining) return;

    setJoining(true);
    try {
      await createRequest({ rideId: id });
      // Re-check existing request to update the UI
      await checkExistingRequest();
    } catch (err: any) {
      console.error('Error joining ride:', err);
    } finally {
      setJoining(false);
    }
  };

  const openExistingChat = async () => {
    if (!id) return;
    const chat = await getChatByRideId(id);
    if (chat) {
      router.push(`/chat/${chat.id}`);
    }
  };

  const handleCancel = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    try {
      await cancelRide(id!);
      router.back();
    } catch {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-phone">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView className="flex-1 bg-bg-phone">
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="alert-circle" size={48} className="text-icon-muted mb-3" />
          <Text className="text-sm text-text-muted text-center">Ride not found or has expired</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 bg-bg-phone px-5 pb-24">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Ride Details
          </Text>
        </View>

        <View className="bg-bg-card border border-border rounded-2xl p-6 mb-5 relative overflow-hidden">
          <View className="absolute right-5 top-1/2 opacity-5" style={{ transform: [{ translateY: -50 }] }}>
            <Ionicons name="bicycle" size={100} className="text-text" />
          </View>

          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-3 h-3 rounded-full bg-accent" />
            <Text className="text-text text-lg font-semibold">{ride.from}</Text>
          </View>

          <View className="flex-row items-center gap-2 ml-1.5 mb-5">
            <View className="w-0.5 h-7 rounded bg-accent" />
            <View className="gap-1 ml-2">
              <View className="flex-row items-center gap-1">
                <Ionicons name="bicycle" size={11} className="text-accent" />
                <Text className="text-text-muted text-xs">Boda-boda</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="flash" size={11} className="text-accent" />
                <Text className="text-accent text-xs">Leaving now</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="w-3 h-3 rounded-full bg-red" />
            <Text className="text-accent text-lg font-semibold">{ride.to}</Text>
          </View>
        </View>

        {ride.expiresAt && ride.seatsTaken === 0 && (
          <View className="bg-bg-card border border-border rounded-2xl p-4 mb-4 items-center">
            <Text className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">
              Ride Expires In
            </Text>
            <Text className={`font-display text-2xl font-bold ${countdown === 'Expired' ? 'text-red' : 'text-accent'}`}>
              {countdown || '...'}
            </Text>
          </View>
        )}

        <View className="bg-bg-card border border-border rounded-2xl p-4 mb-4">
          <Text className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            Posted by
          </Text>
          <View className="flex-row items-center gap-3">
            <Avatar
              initials={ride.poster.initials}
              size="lg"
              color={ride.poster.color}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-text text-base font-semibold">{ride.poster.name}</Text>
                <TrustBadge score={ride.poster.trust} />
              </View>
              <Text className="text-text-muted text-xs">{ride.poster.gender}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-2.5 mb-4">
          <View className="flex-1 bg-bg-card border border-border rounded-2xl p-3.5">
            <Text className="text-text-muted text-xs mb-1.5">Seats</Text>
            <View className="flex-row items-center gap-2">
              <SeatDots taken={ride.seatsTaken} total={ride.seatsTotal} />
              <Text className="text-text text-sm font-semibold">
                {ride.seatsTotal - ride.seatsTaken} left
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-bg-card border border-border rounded-2xl p-3.5">
            <Text className="text-text-muted text-xs mb-1.5">Preference</Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name={ride.genderPreference === 'same' ? 'female' : 'people'}
                size={16}
                className="text-accent"
              />
              <Text className="text-text text-sm font-semibold">
                {ride.genderPreference === 'same' ? 'Same Gender' : 'Any Gender'}
              </Text>
            </View>
          </View>
        </View>

        {isOwnRide ? (
          <View className="gap-3">
            {hasAcceptedChat && (
              <Button
                title="Open Chat"
                onPress={openExistingChat}
                icon={<Ionicons name="chatbubbles" size={16} color={colors.icon.DEFAULT} />}
              />
            )}
            <TouchableOpacity
              className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
              style={{ backgroundColor: `${colors.red.DEFAULT}12` }}
              onPress={() => setShowCancelModal(true)}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={colors.red.DEFAULT} />
              ) : (
                <Ionicons name="close-circle-outline" size={18} color={colors.red.DEFAULT} />
              )}
              <Text className="font-semibold text-base" style={{ color: colors.red.DEFAULT }}>
                {cancelling ? 'Cancelling...' : 'Cancel Ride'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !seatsAvailable ? (
          <View className="rounded-2xl py-4 items-center flex-row justify-center gap-2" style={{ backgroundColor: colors.bg.input }}>
            <Ionicons name="people" size={18} color={colors.text.muted} />
            <Text className="font-semibold text-base" style={{ color: colors.text.muted }}>
              Ride is Full
            </Text>
          </View>
        ) : existingRequest?.status === 'pending' ? (
          <View
            className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: `${colors.amber.DEFAULT}15` }}
          >
            <Ionicons name="time" size={18} color={colors.amber.DEFAULT} />
            <Text className="font-semibold text-base" style={{ color: colors.amber.DEFAULT }}>
              Request Pending
            </Text>
          </View>
        ) : existingRequest?.status === 'accepted' ? (
          <Button
            title="Open Chat"
            onPress={openExistingChat}
            icon={<Ionicons name="chatbubbles" size={16} color={colors.icon.DEFAULT} />}
          />
        ) : existingRequest?.status === 'declined' ? (
          <View
            className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: `${colors.red.DEFAULT}12` }}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.red.DEFAULT} />
            <Text className="font-semibold text-base" style={{ color: colors.red.DEFAULT }}>
              Request Declined
            </Text>
          </View>
        ) : (
          <Button
            title={joining ? 'Sending Request...' : 'Request to Join'}
            onPress={handleJoinRequest}
            disabled={joining}
            icon={joining ? undefined : <Ionicons name="hand-left" size={16} color={colors.icon.DEFAULT} />}
          />
        )}
      </ScrollView>

      <RNModal
        visible={showCancelModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowCancelModal(false)}
        >
          <Pressable
            className="rounded-t-3xl px-5 pb-8 pt-4"
            style={{ backgroundColor: colors.bg.card }}
            onPress={() => {}}
          >
            <View className="w-10 h-1 rounded-full self-center mb-5" style={{ backgroundColor: colors.border.DEFAULT }} />

            <View
              className="w-14 h-14 rounded-2xl items-center justify-center self-center mb-4"
              style={{ backgroundColor: `${colors.red.DEFAULT}15` }}
            >
              <Ionicons name="close-circle" size={32} color={colors.red.DEFAULT} />
            </View>

            <Text
              className="font-display text-xl font-bold text-center mb-2"
              style={{ color: colors.text.DEFAULT }}
            >
              Cancel Ride?
            </Text>

            <Text
              className="text-sm text-center leading-5 mb-6 px-4"
              style={{ color: colors.text.sec }}
            >
              This will cancel your ride and notify any riders who have joined. This action cannot be undone.
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                className="rounded-2xl py-4 items-center"
                style={{ backgroundColor: colors.red.DEFAULT }}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-white">Yes, Cancel Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl py-4 items-center"
                style={{ backgroundColor: colors.bg.input }}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold" style={{ color: colors.text.DEFAULT }}>
                  Keep Ride
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </RNModal>

      {/* Status Change Modal (Accepted / Declined) */}
      <RNModal
        visible={statusModal.visible}
        transparent
        animationType="none"
        onRequestClose={() => {
          setStatusModal({ visible: false, type: 'accepted' });
          if (statusModal.type === 'accepted') {
            openExistingChat();
          }
        }}
      >
        <Pressable
          className="flex-1 justify-center items-center px-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => {
            setStatusModal({ visible: false, type: 'accepted' });
            if (statusModal.type === 'accepted') {
              openExistingChat();
            }
          }}
        >
          <Pressable
            className="w-full rounded-3xl p-6 items-center"
            style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.DEFAULT }}
            onPress={() => {}}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{
                backgroundColor: statusModal.type === 'accepted'
                  ? 'rgba(0, 200, 83, 0.12)'
                  : 'rgba(211, 47, 47, 0.12)',
              }}
            >
              <Ionicons
                name={statusModal.type === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                size={36}
                color={statusModal.type === 'accepted' ? colors.accent.DEFAULT : colors.red.DEFAULT}
              />
            </View>

            <Text
              className="text-xl font-bold text-center mb-2"
              style={{ fontFamily: 'Space Grotesk', color: colors.text.DEFAULT }}
            >
              {statusModal.type === 'accepted' ? 'Request Accepted!' : 'Request Declined'}
            </Text>

            <Text
              className="text-sm text-center leading-5 mb-6"
              style={{ color: colors.text.sec }}
            >
              {statusModal.type === 'accepted'
                ? 'Your request to join this ride has been accepted. You can now chat with the other riders!'
                : 'Your request to join this ride has been declined. You can try requesting to join another ride.'}
            </Text>

            <TouchableOpacity
              className="w-full py-4 rounded-2xl items-center"
              style={{
                backgroundColor: statusModal.type === 'accepted' ? colors.accent.DEFAULT : colors.red.DEFAULT,
              }}
              onPress={() => {
                setStatusModal({ visible: false, type: 'accepted' });
                if (statusModal.type === 'accepted') {
                  openExistingChat();
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: statusModal.type === 'accepted' ? '#000' : '#FFF' }}
              >
                {statusModal.type === 'accepted' ? 'Open Chat' : 'OK'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </RNModal>
    </SafeAreaView>
  );
}
