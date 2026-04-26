import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, TrustBadge, SeatDots, BackButton, Button } from '../../../components/ui';
import { mockRides } from '../../../data/mockData';
import { useTheme } from '../../../hooks/useTheme';

export default function RideDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const ride = mockRides.find((r) => r.id === id) || mockRides[0];

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 bg-bg-phone px-5 pb-24">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Ride Details
          </Text>
        </View>

        <View className="bg-bg-card border border-border rounded-2xl p-6 mb-5 relative overflow-hidden">
          <View className="absolute right-5 top-1/2 opacity-5" style={{ transform: [{ translateY: -50 }] }}>
            <Ionicons name="bicycle" size={100} className="text-text" />
          </View>

          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-3 h-3 rounded-full bg-accent" />
            <Text className="text-text text-lg font-semibold">{ride.from}</Text>
          </View>

          <View className="flex-row items-center gap-2 ml-1.5 mb-5">
            <View className="w-0.5 h-7 rounded bg-accent" />
            <View className="gap-1 ml-2">
              <View className="flex-row items-center gap-1">
                <Ionicons name="bicycle" size={11} className="text-accent" />
                <Text className="text-text-muted text-xs">Boda-boda</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="flash" size={11} className="text-accent" />
                <Text className="text-accent text-xs">Leaving now</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="w-3 h-3 rounded-full bg-red" />
            <Text className="text-accent text-lg font-semibold">{ride.to}</Text>
          </View>
        </View>

        <View className="bg-bg-card border border-border rounded-2xl p-4 mb-4">
          <Text className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            Posted by
          </Text>
<View className="flex-row items-center gap-3">
  <Avatar
    initials={ride.poster.initials}
    size="lg"
    color={ride.poster.color}
  />
  <View className="flex-1">
    <View className="flex-row items-center gap-2 mb-1">
      <Text className="text-text text-base font-semibold">{ride.poster.name}</Text>
      <TrustBadge score={ride.poster.trust} />
    </View>
    <Text className="text-text-muted text-xs">{ride.poster.gender}</Text>
  </View>
</View>
        </View>

        <View className="flex-row gap-2.5 mb-4">
          <View className="flex-1 bg-bg-card border border-border rounded-2xl p-3.5">
            <Text className="text-text-muted text-xs mb-1.5">Seats</Text>
            <View className="flex-row items-center gap-2">
              <SeatDots taken={ride.seatsTaken} total={ride.seatsTotal} />
              <Text className="text-text text-sm font-semibold">
                {ride.seatsTotal - ride.seatsTaken} left
              </Text>
            </View>
          </View>
          <View className="flex-1 bg-bg-card border border-border rounded-2xl p-3.5">
            <Text className="text-text-muted text-xs mb-1.5">Preference</Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name={ride.genderPreference === 'same' ? 'female' : 'people'}
                size={16}
                className="text-accent"
              />
              <Text className="text-text text-sm font-semibold">
                {ride.genderPreference === 'same' ? 'Same Gender' : 'Any Gender'}
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="Request to Join"
          onPress={() => router.push(`/(app)/chat/${ride.id}`)}
          icon={<Ionicons name="hand-left" size={16} color={colors.icon.DEFAULT} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
