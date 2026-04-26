import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';

const TEMP_PIN = '123456';

export default function VerifyPasswordCodeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (code === TEMP_PIN) {
      router.push('/(auth)/reset-password');
    } else {
      setError('Invalid code. Use: ' + TEMP_PIN);
    }
  };

  const handleAutoFill = () => {
    setCode(TEMP_PIN);
    setError('');
  };

  const handleResend = async () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg.phone }}>
      <View className="flex-1 items-center px-5 pt-6" style={{ backgroundColor: colors.bg.phone }}>
        <View className="w-full">
          <BackButton />
        </View>

        <View
          className="w-16 h-16 rounded-full items-center justify-center mt-6 mb-6"
          style={{ backgroundColor: colors.accent.glow, borderWidth: 2, borderColor: 'rgba(0,230,118,0.15)' }}
        >
          <Ionicons name="lock-closed" size={24} color={colors.accent.DEFAULT} />
        </View>

        <Text className="font-display text-xl font-bold text-center mb-1.5" style={{ color: colors.text.DEFAULT }}>
          Verify Your Email
        </Text>
        <Text className="text-center text-sm mb-8 leading-6" style={{ color: colors.text.sec }}>
          Enter the 6-digit code sent to{'\n'}
          <Text className="font-semibold" style={{ color: colors.text.DEFAULT }}>{user?.email || 'your email'}</Text>
        </Text>

        <View className="flex-row gap-2 mb-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              className="w-12 h-16 rounded-xl items-center justify-center border-2"
              style={{
                borderColor: index < code.length ? colors.accent.DEFAULT : colors.border.DEFAULT,
                backgroundColor: index < code.length ? colors.accent.glow : colors.bg.input,
              }}
            >
              <Text
                className="font-display text-2xl font-bold"
                style={{ color: index < code.length ? colors.accent.DEFAULT : colors.text.dim }}
              >
                {index < code.length ? code[index] : ''}
              </Text>
            </View>
          ))}
        </View>

        <TextInput
          className="absolute opacity-0"
          value={code}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
            setCode(cleaned);
            setError('');
          }}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        <TouchableOpacity
          onPress={handleAutoFill}
          className="rounded-lg px-4 py-2 mb-4"
          style={{ backgroundColor: 'rgba(255,179,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,179,0,0.3)' }}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.amber.DEFAULT }}>
            Dev Mode: Tap to auto-fill code
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text className="text-sm mb-2" style={{ color: colors.red.DEFAULT }}>{error}</Text>
        ) : null}

        <Text className="text-sm mb-6" style={{ color: colors.text.muted }}>
          Use code: <Text className="font-semibold" style={{ color: colors.accent.DEFAULT }}>{TEMP_PIN}</Text>
        </Text>

        <TouchableOpacity
          className="rounded-xl py-4 px-12 items-center"
          style={{
            backgroundColor: code.length === 6 ? colors.accent.DEFAULT : colors.bg.card,
            borderWidth: code.length === 6 ? 0 : 1,
            borderColor: code.length === 6 ? 'transparent' : colors.border.DEFAULT,
          }}
          onPress={handleVerify}
          disabled={code.length !== 6}
        >
          <Text
            className="font-semibold text-base"
            style={{ color: code.length === 6 ? '#000' : colors.text.muted }}
          >
            Verify
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4" onPress={handleResend} disabled={isResending}>
          <Text className="text-sm" style={{ color: colors.text.muted }}>
            {isResending ? 'Sending...' : "Didn't receive the code? "} 
            <Text style={{ color: colors.accent.DEFAULT }}>{isResending ? '' : 'Resend'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
