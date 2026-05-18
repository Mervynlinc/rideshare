import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';
import { validateStudentEmail, University } from '../../utils/university';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedUniversity, setDetectedUniversity] = useState<University | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (formData.email.includes('@')) {
      const result = validateStudentEmail(formData.email);
      if (result.isValid && result.university) {
        setDetectedUniversity(result.university);
        setEmailError(null);
      } else if (formData.email.length > 5) {
        setDetectedUniversity(null);
        setEmailError(result.error || null);
      }
    } else {
      setDetectedUniversity(null);
      setEmailError(null);
    }
  }, [formData.email]);

  const handleLogin = async () => {
    setLoginError(null);
    const emailValidation = validateStudentEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }
    
    if (!formData.password) {
      setLoginError('Please enter your password');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.replace('/(app)/(tabs)/home');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        setLoginError('Invalid email or password. Please try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        setLoginError('Please verify your email first. Check your inbox for the verification code.');
      } else {
        setLoginError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg.phone }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-5 pt-6"
          style={{ backgroundColor: colors.bg.phone }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center pt-20">
            <Text className="font-display text-3xl font-bold mb-1.5" style={{ color: colors.text.DEFAULT }}>
              Welcome Back
            </Text>
            <Text className="text-sm mb-8" style={{ color: colors.text.muted }}>
              Sign in to find your next ride
            </Text>

            <View className="gap-3.5 mb-6">
              <TextInput
                className="rounded-xl px-4 py-3.5 text-sm"
                style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: emailError ? colors.red.DEFAULT : colors.border.DEFAULT, color: colors.text.DEFAULT }}
                placeholder="Student Email"
                placeholderTextColor={colors.text.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError && (
                <View className="flex-row items-center gap-1.5 px-1">
                  <Ionicons name="alert-circle" size={12} color={colors.red.DEFAULT} />
                  <Text className="text-xs" style={{ color: colors.red.DEFAULT }}>{emailError}</Text>
                </View>
              )}
              {detectedUniversity && (
                <View
                  className="flex-row items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ backgroundColor: colors.accent.glow, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' }}
                >
                  <Ionicons name="school" size={14} color={colors.accent.DEFAULT} />
                  <Text className="text-xs font-medium" style={{ color: colors.accent.DEFAULT }}>
                    {detectedUniversity.name}
                  </Text>
                </View>
              )}
              <View className="relative">
                <TextInput
                  className="rounded-xl px-4 py-3.5 text-sm pr-12"
                  style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, color: colors.text.DEFAULT }}
                  placeholder="Password"
                  placeholderTextColor={colors.text.muted}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  className="absolute right-3 top-1/2 -mt-2.5"
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>
              {loginError && (
                <View className="flex-row items-center gap-1.5 px-1">
                  <Ionicons name="alert-circle" size={12} color={colors.red.DEFAULT} />
                  <Text className="text-xs" style={{ color: colors.red.DEFAULT }}>{loginError}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text className="text-xs text-right font-semibold" style={{ color: colors.accent.DEFAULT }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="rounded-xl py-4 items-center mb-5"
              style={{ backgroundColor: colors.accent.DEFAULT, opacity: isLoading ? 0.7 : 1 }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-black font-semibold text-base">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-sm" style={{ color: colors.text.muted }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="text-sm font-semibold" style={{ color: colors.accent.DEFAULT }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
