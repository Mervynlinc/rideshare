import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinInput, BackButton, Button } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../context';
import { supabase } from '../../../lib/supabase';

export default function SafetyPinScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [myPin, setMyPin] = useState('');
  const [theirPin, setTheirPin] = useState('');
  const [rideId, setRideId] = useState('');
  const [buddyName, setBuddyName] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      initScreen();
    }
  }, [id]);

  const initScreen = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);

      const { data: chat } = await supabase
        .from('chats')
        .select('ride_id, requester_id, poster_id, ride_from, ride_to')
        .eq('id', id)
        .single();

      if (!chat) return;

      setRideId(chat.ride_id);

      const otherId = chat.requester_id === user.id ? chat.poster_id : chat.requester_id;
      setOtherUserId(otherId);

      const { data: otherUser } = await supabase
        .from('users')
        .select('name')
        .eq('id', otherId)
        .single();

      if (otherUser) {
        setBuddyName(otherUser.name);
      }

      // Always generate a fresh PIN like an OTP
      const newPin = generatePin();
      setMyPin(newPin);

      const { data: myRecord } = await supabase
        .from('ride_participants')
        .select('id, safety_pin_verified')
        .eq('ride_id', chat.ride_id)
        .eq('user_id', user.id)
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
        // If no record exists yet, create one with the PIN
        await supabase.from('ride_participants').insert({
          ride_id: chat.ride_id,
          user_id: user.id,
          status: 'accepted',
          safety_pin: newPin,
          accepted_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error initializing safety pin screen:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleVerify = async () => {
    if (theirPin.length < 4 || verifying || !rideId || !user) return;

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
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinueToRating = () => {
    router.push(`/complete?rideId=${rideId}&buddyName=${encodeURIComponent(buddyName)}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20 }} contentContainerStyle={{ alignItems: 'center', paddingTop: 24 }}>
        <View style={{ position: 'absolute', top: 24, left: 20 }}>
          <BackButton onPress={() => router.back()} />
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
            name={verified ? 'shield-checkmark' : 'shield-checkmark'}
            size={30}
            color={verified ? colors.accent.DEFAULT : colors.accent.DEFAULT}
          />
        </View>

        <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, color: colors.text.DEFAULT }}>
          {verified ? 'Identity Verified' : 'Safety Pin Exchange'}
        </Text>
        <Text style={{ color: colors.text.sec, textAlign: 'center', fontSize: 14, marginBottom: 28, lineHeight: 24, maxWidth: 280 }}>
          {verified
            ? `You've verified ${buddyName}'s identity. Share your PIN so they can verify you too.`
            : "Share this PIN with your buddy in person. Enter theirs to confirm it's them."}
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
              Verify that this is your <Text style={{ color: colors.text.DEFAULT, fontWeight: '600' }}>rideshare buddy</Text>. You've confirmed their PIN matches.
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
              color={error ? colors.red.DEFAULT : colors.red.DEFAULT}
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
          <Button
            title="Continue to Rating"
            onPress={handleContinueToRating}
            icon={<Ionicons name="star" size={16} color="#000" />}
          />
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
