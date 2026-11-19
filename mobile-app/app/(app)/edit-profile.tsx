import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BackButton, Button } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';
import { supabase } from '../../lib/supabase';
import { validateStudentEmail, UNIVERSITIES, University } from '../../utils/university';
import { mockUser } from '../../data/mockData';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || mockUser.name,
    email: user?.email || mockUser.email,
    gender: user?.gender || mockUser.gender,
    campus: user?.campus || mockUser.campus,
    hostel: user?.hostel || mockUser.hostel,
  });
  const [detectedUniversity, setDetectedUniversity] = useState<University | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showUniversityInfo, setShowUniversityInfo] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showCampusPicker, setShowCampusPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('') || 'U';

  const pickAvatar = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets[0]) return;

      const file = result.assets[0];
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.fileSize && file.fileSize > MAX_SIZE) {
        Alert.alert('Image Too Large', 'Please select an image under 5MB.');
        return;
      }

      setUploadingAvatar(true);
      const ext = file.uri.split('.').pop() || 'jpg';
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: `image/${ext}`,
        name: `avatar.${ext}`,
      } as any);

      const filePath = `${user?.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateUser({ avatarUrl: urlData.publicUrl });
    } catch (error) {
      console.log('Error uploading avatar:', error);
      Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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

  const handleSave = async () => {
    const emailValidation = validateStudentEmail(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        campus: formData.campus,
        hostel: formData.hostel,
      });
      router.back();
    } catch (error) {
      console.log('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg.phone }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView className="flex-1 px-5 pt-6" style={{ backgroundColor: colors.bg.phone }}>
        <View className="flex-row items-center justify-between mb-6">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold" style={{ color: colors.text.DEFAULT }}>
            Edit Profile
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <TouchableOpacity
          className="items-center mb-6"
          onPress={pickAvatar}
          disabled={uploadingAvatar}
        >
          <View className="relative">
            <View
              className="items-center justify-center overflow-hidden"
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: `${colors.accent.DEFAULT}20`,
              }}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
              ) : user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 100, height: 100 }}
                  contentFit="cover"
                />
              ) : (
                <Text
                  className="font-display font-semibold"
                  style={{ fontSize: 32, color: colors.accent.DEFAULT }}
                >
                  {initials}
                </Text>
              )}
            </View>
            <View
              className="absolute -bottom-1 -right-1 rounded-full p-2 border-2"
              style={{
                backgroundColor: colors.accent.DEFAULT,
                borderColor: colors.bg.card,
              }}
            >
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </View>
          <Text className="text-sm font-medium mt-2" style={{ color: colors.accent.DEFAULT }}>
            {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
          </Text>
        </TouchableOpacity>

        <View className="gap-3.5 mb-4">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>
              Name
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3.5 text-sm"
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, color: colors.text.DEFAULT }}
              placeholder="Your name"
              placeholderTextColor={colors.text.muted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>
              Email
            </Text>
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
              <View className="flex-row items-center gap-1.5 px-1 mt-1">
                <Ionicons name="alert-circle" size={12} color={colors.red.DEFAULT} />
                <Text className="text-xs" style={{ color: colors.red.DEFAULT }}>{emailError}</Text>
              </View>
            )}
            {showUniversityInfo && detectedUniversity && (
              <View
                className="flex-row items-center gap-2.5 rounded-xl px-4 py-3 mt-2"
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
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>
              Gender
            </Text>
            <TouchableOpacity
              className="rounded-xl px-4 py-3.5 flex-row items-center justify-between"
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT }}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text className="text-sm" style={{ color: formData.gender ? colors.text.DEFAULT : colors.text.muted }}>
                {formData.gender || 'Select gender'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.icon.muted} />
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>
              Campus / University
            </Text>
            <TouchableOpacity
              className="rounded-xl px-4 py-3.5 flex-row items-center justify-between"
              style={{ backgroundColor: detectedUniversity ? colors.accent.glow : colors.bg.input, borderWidth: 1, borderColor: detectedUniversity ? colors.accent.DEFAULT : colors.border.DEFAULT }}
              onPress={() => setShowCampusPicker(true)}
            >
              <Text className="text-sm" style={{ color: detectedUniversity ? colors.accent.DEFAULT : formData.campus ? colors.text.DEFAULT : colors.text.muted }}>
                {detectedUniversity ? detectedUniversity.name : formData.campus || 'Select campus'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.icon.muted} />
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>
              Hostel / Area
            </Text>
            <TextInput
              className="rounded-xl px-4 py-3.5 text-sm"
              style={{ backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, color: colors.text.DEFAULT }}
              placeholder="Your hostel or area"
              placeholderTextColor={colors.text.muted}
              value={formData.hostel}
              onChangeText={(text) => setFormData({ ...formData, hostel: text })}
            />
          </View>
        </View>

        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isSaving}
        />
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

      <Modal
        visible={showCampusPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCampusPicker(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowCampusPicker(false)}
        >
          <View
            className="rounded-t-3xl px-5 pb-8 pt-4"
            style={{ backgroundColor: colors.bg.card }}
          >
            <View className="w-10 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.border.DEFAULT }} />
            <Text className="font-display text-lg font-bold mb-4 text-center" style={{ color: colors.text.DEFAULT }}>
              Select Campus
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {UNIVERSITIES.map((university) => (
                <TouchableOpacity
                  key={university.code}
                  className="flex-row items-center justify-between py-4 px-4 rounded-xl mb-2"
                  style={{
                    backgroundColor: formData.campus === university.name ? colors.accent.glow : colors.bg.input,
                    borderWidth: 1,
                    borderColor: formData.campus === university.name ? colors.accent.DEFAULT : colors.border.DEFAULT,
                  }}
                  onPress={() => {
                    setFormData({ ...formData, campus: university.name });
                    setShowCampusPicker(false);
                  }}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium" style={{ color: colors.text.DEFAULT }}>
                      {university.name}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.text.muted }}>
                      {university.code}
                    </Text>
                  </View>
                  {formData.campus === university.name && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent.DEFAULT} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
