import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinInput, BackButton, Button, Avatar } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../context';
import { supabase } from '../../../lib/supabase';
import { getParticipantColor, getInitials } from '../../../utils/chatColors';
import type { ChatParticipant } from '../../../hooks/useChats';

export default function SafetyPinScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [chat, setChat] = useState<any>(null);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [isPoster, setIsPoster] = useState(false);
  const [loading, setLoading] = useState(true);

  // Picker state (for poster with 3+ riders)
  const [showPicker, setShowPicker] = useState(false);
  const [, setSelectedParticipant] = useState<ChatParticipant | null>(null);

  // Verification state
  const [myPin, setMyPin] = useState('');
  const [theirPin, setTheirPin] = useState('');
  const [buddyName, setBuddyName] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [rideId, setRideId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [verifiedUsers, setVerifiedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      initScreen();
    }
  }, [id]);

  const initScreen = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);

      // Get chat details
      const { data: chatData } = await supabase
        .from('chats')
        .select('ride_id, poster_id, ride_from, ride_to')
        .eq('id', id)
        .single();

      if (!chatData) return;

      setChat(chatData);
      setRideId(chatData.ride_id);

      // Determine if current user is the poster
      const userIsPoster = chatData.poster_id === user.id;
      setIsPoster(userIsPoster);

      // Get all participants for this ride
      const { data: participantRows } = await supabase
        .from('ride_participants')
        .select('user_id, status')
        .eq('ride_id', chatData.ride_id)
        .in('status', ['accepted', 'pending']);

      const participantUserIds = participantRows?.map((p) => p.user_id) || [];
      const allUserIds = [...new Set([chatData.poster_id, ...participantUserIds])];

      // Fetch user details
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, avatar_url, trust_score, verified, gender')
        .in('id', allUserIds);

      const participantList: ChatParticipant[] = allUserIds.map((uid) => {
        const userData = usersData?.find((u) => u.id === uid);
        return {
          id: uid,
          name: userData?.name || 'Unknown',
          avatar_url: userData?.avatar_url,
          trust_score: userData?.trust_score || 0,
          verified: userData?.verified || false,
          gender: userData?.gender || 'Other',
          is_poster: uid === chatData.poster_id,
        };
      });

      setParticipants(participantList);

      // Check existing verifications
      const { data: verifications } = await supabase
        .from('ride_verifications')
        .select('verifier_id, verified_user_id')
        .eq('ride_id', chatData.ride_id);

      const verifiedSet = new Set<string>();
      verifications?.forEach((v) => {
        if (v.verifier_id === user.id) {
          verifiedSet.add(v.verified_user_id);
        }
      });
      setVerifiedUsers(verifiedSet);

      // Determine flow based on group size
      const ridersOtherThanPoster = participantList.filter((p) => !p.is_poster);
      const hasGroupChat = ridersOtherThanPoster.length >= 2;

      if (userIsPoster && hasGroupChat) {
        // Poster with 3+ riders: show picker
        setShowPicker(true);
      } else if (userIsPoster && ridersOtherThanPoster.length === 1) {
        // Poster with 1 rider: direct flow (no picker)
        setupDirectVerification(ridersOtherThanPoster[0], chatData.ride_id);
      } else {
        // Rider: verify with poster
        const poster = participantList.find((p) => p.is_poster);
        if (poster) {
          setupDirectVerification(poster, chatData.ride_id);
        }
      }
    } catch (err) {
      console.error('Error initializing safety pin screen:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupDirectVerification = async (otherParticipant: ChatParticipant, rId: string) => {
    setSelectedParticipant(otherParticipant);
    setOtherUserId(otherParticipant.id);
    setBuddyName(otherParticipant.name);

    // Generate and store a fresh PIN
    const newPin = generatePin();
    setMyPin(newPin);

    // Get or create my ride_participants record with the PIN
    const { data: myRecord } = await supabase
      .from('ride_participants')
      .select('id, safety_pin_verified')
      .eq('ride_id', rId)
      .eq('user_id', user!.id)
      .maybeSingle();

    if (myRecord) {
      if (myRecord.safety_pin_verified) {
        setVerified(true);
      }
      await supabase
        .from('ride_participants')
        .update({ safety_pin: newPin })
        .eq('id', myRecord.id);
    } else {
      await supabase.from('ride_participants').insert({
        ride_id: rId,
        user_id: user!.id,
        status: 'accepted',
        safety_pin: newPin,
        accepted_at: new Date().toISOString(),
      });
    }
  };

  const handleSelectParticipant = async (participant: ChatParticipant) => {
    setSelectedParticipant(participant);
    setShowPicker(false);
    setVerified(false);
    setTheirPin('');
    setError('');

    // Check if already verified
    if (verifiedUsers.has(participant.id)) {
      setVerified(true);
    }

    await setupDirectVerification(participant, rideId);
  };

  const handleBackToPicker = () => {
    setShowPicker(true);
    setSelectedParticipant(null);
    setVerified(false);
    setTheirPin('');
    setError('');
    setMyPin('');
  };

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleVerify = async () => {
    if (theirPin.length < 4 || verifying || !rideId || !user || !otherUserId) return;

    setVerifying(true);
    setError('');

    try {
      const { data: otherRecord } = await supabase
        .from('ride_participants')
        .select('safety_pin')
        .eq('ride_id', rideId)
        .eq('user_id', otherUserId)
        .maybeSingle();

      if (!otherRecord || !otherRecord.safety_pin) {
        setError('Your buddy has not opened their Safety PIN screen yet. Ask them to open it first.');
        return;
      }

      if (theirPin !== otherRecord.safety_pin) {
        setError('PIN does not match. Ask them to share their PIN again.');
        return;
      }

      // Record verification in ride_verifications
      await supabase.from('ride_verifications').upsert({
        ride_id: rideId,
        verifier_id: user.id,
        verified_user_id: otherUserId,
      }, { onConflict: 'ride_id,verifier_id,verified_user_id' });

      // Also mark safety_pin_verified on ride_participants
      const { data: myRecord } = await supabase
        .from('ride_participants')
        .select('id')
        .eq('ride_id', rideId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (myRecord) {
        await supabase
          .from('ride_participants')
          .update({
            safety_pin_verified: true,
            safety_pin_exchange_at: new Date().toISOString(),
          })
          .eq('id', myRecord.id);
      }

      setVerified(true);
      setVerifiedUsers((prev) => new Set([...prev, otherUserId]));
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinueToRating = () => {
    if (isPoster && showPicker) {
      // Go back to picker to verify more people
      handleBackToPicker();
    } else {
      router.push(`/complete?rideId=${rideId}&buddyName=${encodeURIComponent(buddyName)}`);
    }
  };

  const hasMoreToVerify = isPoster && participants.filter((p) => !p.is_poster && !verifiedUsers.has(p.id)).length > 0;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  // Participant Picker (poster with 3+ riders)
  if (showPicker) {
    const riders = participants.filter((p) => !p.is_poster);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
        <ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 24 }}>
          <View style={{ position: 'absolute', top: 24, left: 20, zIndex: 10 }}>
            <BackButton onPress={() => router.back()} />
          </View>

          <View style={{ alignItems: 'center', marginBottom: 28, paddingTop: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                backgroundColor: colors.accent.glow,
                borderWidth: 2,
                borderColor: 'rgba(0,230,118,0.2)',
              }}
            >
              <Ionicons name="shield-checkmark" size={30} color={colors.accent.DEFAULT} />
            </View>

            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, color: colors.text.DEFAULT }}>
              Verify Your Riders
            </Text>
            <Text style={{ color: colors.text.sec, textAlign: 'center', fontSize: 14, lineHeight: 24, maxWidth: 280 }}>
              Tap each rider to verify their identity in person.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {riders.map((rider) => {
              const isVerified = verifiedUsers.has(rider.id);
              const riderColor = getParticipantColor(rider.id, chat?.poster_id || '', participants.map((p) => p.id));

              return (
                <TouchableOpacity
                  key={rider.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.bg.card,
                    borderWidth: 1,
                    borderColor: isVerified ? colors.accent.DEFAULT : colors.border.DEFAULT,
                  }}
                  onPress={() => handleSelectParticipant(rider)}
                >
                  <Avatar
                    initials={getInitials(rider.name)}
                    size="md"
                    color={riderColor}
                    imageUrl={rider.avatar_url}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.DEFAULT, fontSize: 15, fontWeight: '600' }}>
                      {rider.name}
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                      {isVerified ? 'Verified' : 'Tap to verify'}
                    </Text>
                  </View>
                  <Ionicons
                    name={isVerified ? 'checkmark-circle' : 'chevron-forward'}
                    size={20}
                    color={isVerified ? colors.accent.DEFAULT : colors.text.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Check if all verified */}
          {!riders.some((r) => !verifiedUsers.has(r.id)) && (
            <View style={{ marginTop: 24, marginBottom: 32 }}>
              <Button
                title="All Riders Verified"
                onPress={() => router.back()}
                icon={<Ionicons name="checkmark-circle" size={16} color="#000" />}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Direct Verification Flow (2 riders, or rider verifying poster, or poster verifying specific rider)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20 }} contentContainerStyle={{ alignItems: 'center', paddingTop: 24 }}>
        <View style={{ position: 'absolute', top: 24, left: 20 }}>
          {isPoster && hasMoreToVerify ? (
            <BackButton onPress={handleBackToPicker} />
          ) : (
            <BackButton onPress={() => router.back()} />
          )}
        </View>

        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            backgroundColor: verified ? colors.accent.glow : colors.accent.glow,
            borderWidth: 2,
            borderColor: verified ? colors.accent.DEFAULT : 'rgba(0,230,118,0.2)',
          }}
        >
          <Ionicons
            name="shield-checkmark"
            size={30}
            color={colors.accent.DEFAULT}
          />
        </View>

        <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, color: colors.text.DEFAULT }}>
          {verified ? 'Identity Verified' : 'Safety Pin Exchange'}
        </Text>
        <Text style={{ color: colors.text.sec, textAlign: 'center', fontSize: 14, marginBottom: 28, lineHeight: 24, maxWidth: 280 }}>
          {verified
            ? `You've verified ${buddyName}'s identity. Share your PIN so they can verify you too.`
            : `Share this PIN with ${buddyName}. Enter theirs to confirm it's them.`}
        </Text>

        <View style={{ width: '100%', marginBottom: 24, alignItems: 'center' }}>
          <Text style={{ color: colors.text.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600', marginBottom: 10 }}>
            Your PIN
          </Text>
          <PinInput value={myPin} length={4} active />
        </View>

        <View style={{ width: '100%', marginBottom: 28, alignItems: 'center' }}>
          <Text style={{ color: colors.text.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600', marginBottom: 10 }}>
            Enter Their PIN
          </Text>
          <PinInput value={theirPin} length={4} onChangeText={setTheirPin} />
        </View>

        {verified ? (
          <View
            style={{
              backgroundColor: `${colors.accent.DEFAULT}18`,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              gap: 10,
              width: '100%',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: `${colors.accent.DEFAULT}30`,
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.accent.DEFAULT} style={{ marginTop: 2 }} />
            <Text style={{ color: colors.text.sec, fontSize: 12, lineHeight: 20, flex: 1 }}>
              Verify that this is your <Text style={{ color: colors.text.DEFAULT, fontWeight: '600' }}>rideshare buddy</Text>. You{"'"}ve confirmed their PIN matches.
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: error ? `${colors.red.DEFAULT}15` : colors.red.dim,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              gap: 10,
              width: '100%',
              marginBottom: 24,
              borderWidth: error ? 1 : 0,
              borderColor: error ? `${colors.red.DEFAULT}30` : 'transparent',
            }}
          >
            <Ionicons
              name={error ? 'close-circle' : 'warning'}
              size={16}
              color={colors.red.DEFAULT}
              style={{ marginTop: 2 }}
            />
            <Text style={{ color: colors.text.sec, fontSize: 12, lineHeight: 20, flex: 1 }}>
              {error || 'Only verify when you\'ve met the '}
              <Text style={{ color: colors.text.DEFAULT, fontWeight: '600' }}>
                {error ? '' : 'right person'}
              </Text>
              {error ? '' : '. If something feels wrong, do not share your PIN.'}
            </Text>
          </View>
        )}

        {verified ? (
          hasMoreToVerify ? (
            <Button
              title="Verify Next Rider"
              onPress={handleBackToPicker}
              icon={<Ionicons name="people" size={16} color="#000" />}
            />
          ) : (
            <Button
              title="Continue to Rating"
              onPress={handleContinueToRating}
              icon={<Ionicons name="star" size={16} color="#000" />}
            />
          )
        ) : (
          <Button
            title={theirPin.length < 4 ? 'Enter their 4-digit PIN' : verifying ? 'Verifying...' : 'Verify PIN'}
            onPress={handleVerify}
            disabled={theirPin.length < 4 || verifying}
            loading={verifying}
            icon={<Ionicons name="checkmark-circle" size={16} color={colors.icon.DEFAULT} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
