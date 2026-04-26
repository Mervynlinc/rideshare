import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { OnboardingCarousel } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeOnboarding } = useAuth();

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(auth)/signup');
  };

  const handleLogin = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg.phone }}>
      <View className="flex-1" style={{ backgroundColor: colors.bg.phone }}>
        <OnboardingCarousel
          onComplete={handleComplete}
          onLogin={handleLogin}
        />
      </View>
    </SafeAreaView>
  );
}
