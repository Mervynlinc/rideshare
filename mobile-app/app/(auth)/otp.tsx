import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';
import { supabase } from '../../lib/supabase';

const RESEND_COUNTDOWN_SECONDS = 180; // 3 minutes

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { verifyAndCreateAccount, sendSignupOTP } = useAuth();

  const isPasswordReset = params.type === 'password-reset';
  const isSignup = params.type === 'signup';
  const email = (params.email as string) || 'alex@must.ac.ug';
  const signupData = isSignup ? JSON.parse((params.signupData as string) || '{}') : null;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      if (isSignup && signupData) {
        await verifyAndCreateAccount(email, code, signupData);
        // Wait a moment for auth state to update before navigation
        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace('/(app)/(tabs)/home');
      } else if (isPasswordReset) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'recovery',
        });

        if (verifyError) throw verifyError;

        router.push({
          pathname: '/(auth)/reset-password',
          params: { email }
        });
      } else {
        router.replace('/(app)/(tabs)/home');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      if (isSignup && signupData) {
        await sendSignupOTP(signupData);
      } else if (isPasswordReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCountdown(RESEND_COUNTDOWN_SECONDS);
      setCanResend(false);
      setError('');
    } catch (err: any) {
      if (err.message?.includes('rate limit') || err.message?.includes('Rate limit')) {
        setError('Too many requests. Please wait a few minutes before requesting another code.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    }
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
          <Ionicons
            name={isPasswordReset ? "lock-closed-outline" : "mail-outline"}
            size={24}
            color={colors.accent.DEFAULT}
          />
        </View>

        <Text className="font-display text-xl font-bold text-center mb-1.5" style={{ color: colors.text.DEFAULT }}>
          Verify Your Email
        </Text>
        <Text className="text-center text-sm mb-8 leading-6" style={{ color: colors.text.sec }}>
          Enter the 6-digit code sent to{'\n'}
          <Text className="font-semibold" style={{ color: colors.text.DEFAULT }}>{email}</Text>
        </Text>

        <Pressable onPress={() => inputRef.current?.focus()}>
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
        </Pressable>

        <TextInput
          ref={inputRef}
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

        {error ? (
          <Text className="text-sm mb-2" style={{ color: colors.red.DEFAULT }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          className="rounded-xl py-4 px-12 items-center"
          style={{
            backgroundColor: code.length === 6 ? colors.accent.DEFAULT : colors.bg.card,
            borderWidth: code.length === 6 ? 0 : 1,
            borderColor: code.length === 6 ? 'transparent' : colors.border.DEFAULT,
            opacity: isVerifying ? 0.6 : 1
          }}
          onPress={handleVerify}
          disabled={code.length !== 6 || isVerifying}
        >
          <Text
            className="font-semibold text-base"
            style={{ color: code.length === 6 ? '#000' : colors.text.muted }}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleResend} 
          className="mt-4"
          disabled={!canResend}
        >
          <Text 
            className="text-sm" 
            style={{ 
              color: canResend ? colors.accent.DEFAULT : colors.text.muted,
              opacity: canResend ? 1 : 0.5
            }}
          >
            {canResend ? (
              <>Didn't receive the code? <Text style={{ color: colors.accent.DEFAULT }}>Resend</Text></>
            ) : (
              <>Resend code in <Text style={{ color: colors.accent.DEFAULT }}>{formatTime(countdown)}</Text></>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}