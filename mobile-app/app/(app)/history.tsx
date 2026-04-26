import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { mockRideHistory } from '../../data/mockData';

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 pb-24 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Ride History
          </Text>
        </View>

        <Text className="text-xs mb-4 text-text-muted">
          {mockRideHistory.length} rides completed
        </Text>

        <View className="gap-2.5">
          {mockRideHistory.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              className="rounded-2xl p-4 bg-bg-card border border-border"
            >
              <View className="flex-row justify-between items-start mb-2.5">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text">
                    {ride.from} → {ride.to}
                  </Text>
                  <Text className="text-xs mt-1 text-text-muted">
                    {ride.date} · {ride.poster}
                  </Text>
                </View>
                <View className="flex-row gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= ride.rating ? 'star' : 'star-outline'}
                      size={10}
                      className="text-amber"
                    />
                  ))}
                </View>
              </View>

              <View className="flex-row items-center gap-2 pt-2.5 border-t border-border">
                <Ionicons name="bicycle" size={11} className="text-accent" />
                <Text className="text-xs text-text-muted">Boda-boda</Text>
                <Text className="text-xs text-text-dim">·</Text>
                <Text className="text-xs text-text-muted">Ride #{ride.rideId}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
