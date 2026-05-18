import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { AuthProvider, useAuth, NotificationProvider, RideProvider } from '../context';
import { useNotifications } from '../hooks/useNotifications';
import { ErrorBoundary } from '../components/ErrorBoundary';

function RootNavigator() {
  const { isDark, colors, isLoading: themeLoading } = useTheme();
  const { isAuthenticated, isFirstTime, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useNotifications();

  const isLoading = themeLoading || authLoading;

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAppGroup = segments[0] === '(app)';
    const isResetPassword = segments[1] === 'reset-password';

    if (isFirstTime && !inOnboardingGroup) {
      router.replace('/(onboarding)');
    } else if (!isAuthenticated && !isFirstTime && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !isFirstTime && !inAppGroup && !isResetPassword) {
      router.replace('/(app)/(tabs)/home');
    }
  }, [isAuthenticated, isFirstTime, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bg.phone,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.phone },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <NotificationProvider>
            <RideProvider>
              <RootNavigator />
            </RideProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
