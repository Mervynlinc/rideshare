import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';
import { validateStudentEmail, UNIVERSITIES, University } from '../../utils/university';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signup } = useAuth();
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
const [showUniversityInfo, setShowUniversityInfo] = useState(false);
const [showGenderPicker, setShowGenderPicker] = useState(false);

const genderOptions = ['Male', 'Female'];

  useEffect(() => {
    if (formData.email.includes('@')) {
      const result = validateStudentEmail(formData.email);
      if (result.isValid && result.university) {
        setDetectedUniversity(result.university);
        setFormData((prev) => ({ ...prev, campus: result.university!.name }));
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
    const emailValidation = validateStudentEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }
    await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      campus: formData.campus,
      hostel: formData.hostel,
    });
  };

  return (
<SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg.phone }}>
<ScrollView className="flex-1 px-5 pt-6" style={{ backgroundColor: colors.bg.phone }}>
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
          <TextInput
            className="rounded-xl px-4 py-3.5 text-sm"
            style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, color: colors.text.DEFAULT }}
            placeholder="Password"
            placeholderTextColor={colors.text.muted}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />
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

        <TouchableOpacity className="flex-row items-start gap-2 mb-4">
          <View
            className="w-4 h-4 rounded mt-0.5 items-center justify-center"
            style={{ borderWidth: 1, borderColor: colors.accent.DEFAULT }}
          >
            <Ionicons name="checkmark" size={10} color={colors.accent.DEFAULT} />
          </View>
          <Text className="text-xs flex-1 leading-5" style={{ color: colors.text.muted }}>
            I agree to the{' '}
            <Text style={{ color: colors.accent.DEFAULT }}>Terms of Service</Text> and understand RideShare is a matching platform, not a transport provider.
          </Text>
        </TouchableOpacity>

<TouchableOpacity
  className="rounded-xl py-4 items-center mb-6"
  style={{ backgroundColor: colors.accent.DEFAULT }}
  onPress={handleSignup}
>
  <Text className="text-black font-semibold text-base">Create Account</Text>
</TouchableOpacity>

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
</ScrollView>
</SafeAreaView>
);
}
