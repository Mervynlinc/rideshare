import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ride/[id]" />
      <Stack.Screen name="requests/[id]" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="safety-pin/[id]" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="history" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="filters" />
    </Stack>
  );
}
