import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One number', met: /\d/.test(formData.password) },
    { text: 'One special character', met: /[!@#$%^&*]/.test(formData.password) },
  ];

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!requirements.every(req => req.met)) {
      setError('Please meet all password requirements');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // In a real app, this would call your backend to update the password
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);

      // Navigate to login after successful password reset
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              backgroundColor: colors.accent.glow,
              borderWidth: 2,
              borderColor: 'rgba(0,230,118,0.15)'
            }}
          >
            <Ionicons name="checkmark" size={40} color={colors.accent.DEFAULT} />
          </View>

          <Text style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: colors.text.DEFAULT, textAlign: 'center' }}>
            Password Reset Successful!
          </Text>
          <Text style={{ color: colors.text.muted, fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
            Your password has been successfully updated. You can now sign in with your new password.
          </Text>

          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            Redirecting to login...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20, paddingTop: 24 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton className="absolute top-6 left-5" />

          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 80 }}>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 'bold', marginBottom: 6, color: colors.text.DEFAULT }}>
              Change Password
            </Text>
            <Text style={{ color: colors.text.muted, fontSize: 14, marginBottom: 28 }}>
              Create a new password for your account
            </Text>

            {error && (
              <View style={{ backgroundColor: colors.red.dim, borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="alert-circle" size={16} color={colors.red.DEFAULT} />
                <Text style={{ color: colors.red.DEFAULT, fontSize: 12 }}>{error}</Text>
              </View>
            )}

            <View style={{ gap: 14, marginBottom: 28 }}>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, paddingRight: 48, color: colors.text.DEFAULT, fontSize: 14 }}
                  placeholder="New Password"
                  placeholderTextColor={colors.text.muted}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: '50%', marginTop: -10 }}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, paddingRight: 48, color: colors.text.DEFAULT, fontSize: 14 }}
                  placeholder="Confirm New Password"
                  placeholderTextColor={colors.text.muted}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: '50%', marginTop: -10 }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 12, padding: 16 }}>
                <Text style={{ color: colors.text.sec, fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
                  Password requirements
                </Text>
                <View style={{ gap: 6 }}>
                  {requirements.map((req, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons
                        name={req.met ? 'checkmark-circle' : 'ellipse'}
                        size={11}
                        color={req.met ? colors.accent.DEFAULT : colors.text.dim}
                      />
                      <Text style={{ fontSize: 12, color: req.met ? colors.accent.DEFAULT : colors.text.muted }}>
                        {req.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={{ backgroundColor: colors.accent.DEFAULT, borderRadius: 12, paddingVertical: 16, alignItems: 'center', opacity: isSubmitting ? 0.6 : 1 }}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={{ color: '#000', fontWeight: '600', fontSize: 16 }}>{isSubmitting ? 'Updating...' : 'Update Password'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
