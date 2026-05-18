import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { validateStudentEmail, University } from '../../utils/university';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [detectedUniversity, setDetectedUniversity] = useState<University | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (text: string) => {
    const lowerEmail = text.toLowerCase();
    setEmail(lowerEmail);

    if (lowerEmail.includes('@')) {
      const result = validateStudentEmail(lowerEmail);
      if (result.isValid && result.university) {
        setDetectedUniversity(result.university);
        setEmailError(null);
      } else if (lowerEmail.length > 5) {
        setDetectedUniversity(null);
        setEmailError(result.error || null);
      }
    } else {
      setDetectedUniversity(null);
      setEmailError(null);
    }
  };

  const handleSendCode = async () => {
    const emailValidation = validateStudentEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // In a real app, this would call your backend to send an OTP code
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to OTP verification page with the email
      router.push({
        pathname: '/(auth)/otp',
        params: { email, type: 'password-reset' }
      });
    } catch {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20, paddingTop: 24 }}>
        <BackButton className="absolute top-6 left-5" />

        <View style={{ flex: 1, justifyContent: 'center', paddingTop: 80 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              backgroundColor: colors.accent.glow,
              borderWidth: 2,
              borderColor: 'rgba(0,230,118,0.15)'
            }}
          >
            <Ionicons name="mail-outline" size={32} color={colors.accent.DEFAULT} />
          </View>

          <Text style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 'bold', marginBottom: 6, color: colors.text.DEFAULT }}>
            Forgot Password?
          </Text>
          <Text style={{ color: colors.text.muted, fontSize: 14, marginBottom: 32 }}>
            Enter your student email and we'll send you a code to reset your password
          </Text>

          {error && (
            <View style={{ backgroundColor: colors.red.dim, borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle" size={16} color={colors.red.DEFAULT} />
              <Text style={{ color: colors.red.DEFAULT, fontSize: 12 }}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 14, marginBottom: 28 }}>
            <TextInput
              style={{
                backgroundColor: colors.bg.input,
                borderWidth: 1,
                borderColor: emailError ? colors.red.DEFAULT : colors.border.DEFAULT,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: colors.text.DEFAULT,
                fontSize: 14
              }}
              placeholder="Student Email"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {emailError && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 }}>
                <Ionicons name="alert-circle" size={12} color={colors.red.DEFAULT} />
                <Text style={{ color: colors.red.DEFAULT, fontSize: 12 }}>{emailError}</Text>
              </View>
            )}

            {detectedUniversity && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: colors.accent.glow,
                  borderWidth: 1,
                  borderColor: 'rgba(0,230,118,0.2)'
                }}
              >
                <Ionicons name="school" size={14} color={colors.accent.DEFAULT} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent.DEFAULT }}>
                  {detectedUniversity.name}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.accent.DEFAULT,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: isSubmitting ? 0.6 : 1
            }}
            onPress={handleSendCode}
            disabled={isSubmitting || !email || !!emailError}
          >
            <Text style={{ color: '#000', fontWeight: '600', fontSize: 16 }}>
              {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.text.muted, fontSize: 14, textAlign: 'center' }}>
              Remember your password? <Text style={{ color: colors.accent.DEFAULT, fontWeight: '600' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

