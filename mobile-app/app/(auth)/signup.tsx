import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';
import { validateStudentEmail, University } from '../../utils/university';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sendSignupOTP } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    campus: '',
    hostel: '',
  });
  const [detectedUniversity, setDetectedUniversity] = useState<University | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUniversityInfo, setShowUniversityInfo] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const genderOptions = ['Male', 'Female'];

  useEffect(() => {
    if (formData.email.includes('@')) {
      const result = validateStudentEmail(formData.email);
      if (result.isValid && result.university) {
        setDetectedUniversity(result.university);
        setFormData((prev) => ({ ...prev, campus: result.university!.code }));
        setEmailError(null);
        setShowUniversityInfo(true);
      } else if (formData.email.length > 5) {
        setDetectedUniversity(null);
        setEmailError(result.error || null);
        setShowUniversityInfo(false);
      }
    } else {
      setDetectedUniversity(null);
      setEmailError(null);
      setShowUniversityInfo(false);
    }
  }, [formData.email]);

  const handleSignup = async () => {
    setSignupError(null);
    
    const emailValidation = validateStudentEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }
    
    if (!formData.name || !formData.password || !formData.gender) {
      setSignupError('Please fill in all required fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendSignupOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        campus: formData.campus,
        hostel: formData.hostel,
      });
      
      router.push({
        pathname: '/(auth)/otp',
        params: {
          email: formData.email,
          type: 'signup',
          signupData: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            gender: formData.gender,
            campus: formData.campus,
            hostel: formData.hostel,
          }),
        },
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.includes('User already registered')) {
        setSignupError('This email is already registered. Please login instead.');
      } else if (error.message?.includes('rate limit') || error.message?.includes('security purposes')) {
        setSignupError('Please wait a moment before trying again.');
      } else {
        setSignupError(error.message || 'Failed to send verification code. Please try again.');
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
          <BackButton />

          <Text className="font-display text-2xl font-bold mt-4 mb-1" style={{ color: colors.text.DEFAULT }}>
            Create Account
          </Text>
          <Text className="text-sm mb-5" style={{ color: colors.text.muted }}>
            Join your campus ride community
          </Text>

          <View className="gap-3.5 mb-4">
            <TextInput
              className="rounded-xl px-4 py-3.5 text-sm"
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, color: colors.text.DEFAULT }}
              placeholder="Name"
              placeholderTextColor={colors.text.muted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
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
            {showUniversityInfo && detectedUniversity && (
              <View
                className="flex-row items-center gap-2.5 rounded-xl px-4 py-3 mb-2"
                style={{ backgroundColor: colors.accent.glow, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' }}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.accent.DEFAULT} />
                <View className="flex-1">
                  <Text className="text-xs font-semibold" style={{ color: colors.accent.DEFAULT }}>
                    {detectedUniversity.name} detected
                  </Text>
                  <Text className="text-xs" style={{ color: colors.text.sec }}>
                    Campus auto-filled • {detectedUniversity.code}
                  </Text>
                </View>
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
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                className="flex-1 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT }}
                onPress={() => setShowGenderPicker(true)}
              >
                <View>
                  <Text className="text-xs" style={{ color: colors.text.muted }}>Gender</Text>
                  <Text className="text-sm" style={{ color: formData.gender ? colors.text.DEFAULT : colors.text.muted }}>
                    {formData.gender || 'Select'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={colors.text.muted} />
              </TouchableOpacity>
              <View
                className="flex-1 rounded-xl px-4 py-3.5"
                style={{ backgroundColor: detectedUniversity ? colors.accent.glow : colors.bg.input, borderWidth: 1, borderColor: detectedUniversity ? colors.accent.DEFAULT : colors.border.DEFAULT }}
              >
                <Text className="text-xs" style={{ color: colors.text.muted }}>Campus</Text>
                <Text className="text-sm" style={{ color: detectedUniversity ? colors.accent.DEFAULT : colors.text.muted }}>
                  {detectedUniversity ? detectedUniversity.code : 'Auto-detected'}
                </Text>
              </View>
            </View>
            <TextInput
              className="rounded-xl px-4 py-3.5 text-sm"
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, color: colors.text.DEFAULT }}
              placeholder="Hostel / Area"
              placeholderTextColor={colors.text.muted}
              value={formData.hostel}
              onChangeText={(text) => setFormData({ ...formData, hostel: text })}
            />
          </View>

          <TouchableOpacity
            className="flex-row items-start gap-2 mb-4"
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View
              className="w-4 h-4 rounded mt-0.5 items-center justify-center"
              style={{
                borderWidth: 1,
                borderColor: agreedToTerms ? colors.accent.DEFAULT : colors.border.DEFAULT,
                backgroundColor: agreedToTerms ? colors.accent.DEFAULT : 'transparent'
              }}
            >
              {agreedToTerms && (
                <Ionicons name="checkmark" size={10} color="#000000" />
              )}
            </View>
            <Text className="text-xs flex-1 leading-5" style={{ color: colors.text.muted }}>
              I agree to the{' '}
              <Text style={{ color: colors.accent.DEFAULT }}>Terms of Service</Text> and understand RideShare is a matching platform, not a transport provider.
            </Text>
          </TouchableOpacity>

          {signupError && (
            <View className="flex-row items-center gap-1.5 px-1 mb-4">
              <Ionicons name="alert-circle" size={12} color={colors.red.DEFAULT} />
              <Text className="text-xs" style={{ color: colors.red.DEFAULT }}>{signupError}</Text>
            </View>
          )}

          <TouchableOpacity
            className="rounded-xl py-4 items-center mb-6"
            style={{
              backgroundColor: agreedToTerms ? colors.accent.DEFAULT : colors.bg.card,
              opacity: isLoading ? 0.7 : (agreedToTerms ? 1 : 0.5)
            }}
            onPress={handleSignup}
            disabled={isLoading || !agreedToTerms}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: agreedToTerms ? '#000000' : colors.text.muted }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showGenderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowGenderPicker(false)}
        >
          <View
            className="rounded-t-3xl px-5 pb-8 pt-4"
            style={{ backgroundColor: colors.bg.card }}
          >
            <View className="w-10 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.border.DEFAULT }} />
            <Text className="font-display text-lg font-bold mb-4 text-center" style={{ color: colors.text.DEFAULT }}>
              Select Gender
            </Text>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                className="flex-row items-center justify-between py-4 px-4 rounded-xl mb-2"
                style={{
                  backgroundColor: formData.gender === gender ? colors.accent.glow : colors.bg.input,
                  borderWidth: 1,
                  borderColor: formData.gender === gender ? colors.accent.DEFAULT : colors.border.DEFAULT,
                }}
                onPress={() => {
                  setFormData({ ...formData, gender });
                  setShowGenderPicker(false);
                }}
              >
                <Text className="text-sm font-medium" style={{ color: colors.text.DEFAULT }}>
                  {gender}
                </Text>
                {formData.gender === gender && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent.DEFAULT} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
