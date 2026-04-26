import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      await updatePassword(formData.password);
      router.back();
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
<ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20, paddingTop: 24 }}>
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
            <TextInput
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text.DEFAULT, fontSize: 14 }}
              placeholder="New Password"
              placeholderTextColor={colors.text.muted}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
            <TextInput
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text.DEFAULT, fontSize: 14 }}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.text.muted}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />

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
    </SafeAreaView>
  );
}
