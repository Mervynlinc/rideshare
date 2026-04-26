import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PinInput, BackButton, Button } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';

const MY_PIN = '7391';

export default function SafetyPinScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [theirPin, setTheirPin] = React.useState('');

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
          backgroundColor: colors.accent.glow,
          borderWidth: 2,
          borderColor: 'rgba(0,230,118,0.2)',
        }}
      >
        <Ionicons name="shield-checkmark" size={30} color={colors.accent.DEFAULT} />
      </View>

      <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, color: colors.text.DEFAULT }}>
        Safety Pin Exchange
      </Text>
      <Text style={{ color: colors.text.sec, textAlign: 'center', fontSize: 14, marginBottom: 28, lineHeight: 24, maxWidth: 280 }}>
        You've met your ride buddy? Share your PIN and verify theirs to confirm identity.
      </Text>

      <View style={{ width: '100%', marginBottom: 24, alignItems: 'center' }}>
        <Text style={{ color: colors.text.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600', marginBottom: 10 }}>
          Your PIN
        </Text>
        <PinInput value={MY_PIN} length={4} active />
      </View>

      <View style={{ width: '100%', marginBottom: 28, alignItems: 'center' }}>
        <Text style={{ color: colors.text.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600', marginBottom: 10 }}>
          Enter Their PIN
        </Text>
        <PinInput value={theirPin} length={4} />
      </View>

      <View style={{ backgroundColor: colors.red.dim, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, width: '100%', marginBottom: 24 }}>
        <Ionicons name="warning" size={16} color={colors.red.DEFAULT} style={{ marginTop: 2 }} />
        <Text style={{ color: colors.text.sec, fontSize: 12, lineHeight: 20, flex: 1 }}>
          Only verify when you've met the <Text style={{ color: colors.text.DEFAULT, fontWeight: '600' }}>right person</Text>. If something feels wrong, do not share your PIN.
        </Text>
      </View>

      <Button
        title="Verify & Return to Chat"
        onPress={() => router.back()}
        icon={<Ionicons name="checkmark-circle" size={16} color={colors.icon.DEFAULT} />}
      />
      </ScrollView>
    </SafeAreaView>
  );
}
